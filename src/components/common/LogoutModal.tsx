import React, { useState, useEffect, useRef } from 'react'
import { useAuth, SECRET_LOGOUT_PIN } from '../../contexts/AuthContext'
import { useI18n } from '../../contexts/I18nContext'
import { ShieldAlert, Lock, X, Check, KeyRound, AlertTriangle } from 'lucide-react'

export function LogoutModal() {
  const { isLogoutModalOpen, setIsLogoutModalOpen, logoutWithSecretCode } = useAuth()
  const { t, isRTL } = useI18n()

  const [pin, setPin] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isShaking, setIsShaking] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isLogoutModalOpen) {
      setPin('')
      setErrorMsg('')
      setIsShaking(false)
      setIsSuccess(false)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isLogoutModalOpen])

  if (!isLogoutModalOpen) return null

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num
      setPin(newPin)
      setErrorMsg('')
      if (newPin.length === 4) {
        verifyPin(newPin)
      }
    }
  }

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1))
    setErrorMsg('')
  }

  const handleClear = () => {
    setPin('')
    setErrorMsg('')
  }

  const verifyPin = async (codeToVerify: string) => {
    if (codeToVerify === SECRET_LOGOUT_PIN) {
      setIsSuccess(true)
      setErrorMsg('')
      setTimeout(async () => {
        await logoutWithSecretCode(codeToVerify)
      }, 600)
    } else {
      setIsShaking(true)
      setErrorMsg(t('auth.invalid_code', 'رمز الأمان غير صحيح! يرجى إدخال الرمز المعتمد 1357.'))
      setTimeout(() => {
        setIsShaking(false)
        setPin('')
        inputRef.current?.focus()
      }, 600)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pin) {
      setErrorMsg(t('auth.code_required', 'يرجى إدخال رمز الأمان المكون من 4 أرقام.'))
      return
    }
    verifyPin(pin)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-transform ${
          isShaking ? 'animate-bounce border-rose-500 shadow-rose-950/50' : ''
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert size={18} />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              {t('auth.logout_modal_title', 'تأكيد تسجيل الخروج الأمني')}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleFormSubmit} className="p-5 pt-2 space-y-4 text-center">
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            {t('auth.logout_modal_desc', 'لإتمام تسجيل الخروج وقفل النظام، يرجى إدخال رمز الأمان السري المعتمد (1357).')}
          </p>

          {/* Hidden text input for physical keyboard entry */}
          <input
            ref={inputRef}
            type="password"
            maxLength={4}
            value={pin}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 4)
              setPin(val)
              if (val.length === 4) {
                verifyPin(val)
              }
            }}
            className="sr-only"
            autoFocus
          />

          {/* 4-Digit PIN Visual Display */}
          <div 
            onClick={() => inputRef.current?.focus()}
            className="flex items-center justify-center space-x-3 rtl:space-x-reverse cursor-pointer py-2"
          >
            {[0, 1, 2, 3].map(idx => {
              const isFilled = pin.length > idx
              const isCurrent = pin.length === idx

              return (
                <div
                  key={idx}
                  className={`w-12 h-14 rounded-xl border flex items-center justify-center font-mono text-2xl font-bold transition-all ${
                    isSuccess
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                      : errorMsg
                      ? 'border-rose-500 bg-rose-500/10 text-rose-400'
                      : isFilled
                      ? 'border-blue-500 bg-blue-500/10 text-white shadow-sm shadow-blue-500/20'
                      : isCurrent
                      ? 'border-slate-500 bg-slate-800/80 text-slate-400 ring-2 ring-blue-500/50'
                      : 'border-slate-800 bg-slate-950 text-slate-600'
                  }`}
                >
                  {isSuccess ? (
                    <Check size={20} className="animate-in zoom-in" />
                  ) : isFilled ? (
                    '•'
                  ) : (
                    ''
                  )}
                </div>
              )
            })}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center justify-center space-x-1.5 rtl:space-x-reverse text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 py-2 px-3 rounded-lg animate-in fade-in">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success State */}
          {isSuccess && (
            <div className="flex items-center justify-center space-x-1.5 rtl:space-x-reverse text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-2 px-3 rounded-lg animate-in fade-in">
              <Check size={14} className="shrink-0" />
              <span>{t('auth.success_msg', 'تم التحقق بنجاح، جاري قفل النظام...')}</span>
            </div>
          )}

          {/* Virtual Numeric Keypad for Touch / Mobile Screens */}
          <div className="grid grid-cols-3 gap-2 pt-2 max-w-[240px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="h-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-mono font-bold text-lg border border-slate-700/50 transition-all flex items-center justify-center shadow-sm"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-11 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 font-bold text-xs border border-slate-800 transition-colors flex items-center justify-center"
            >
              C
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="h-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-mono font-bold text-lg border border-slate-700/50 transition-all flex items-center justify-center shadow-sm"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-11 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 font-bold text-xs border border-slate-800 transition-colors flex items-center justify-center"
            >
              ⌫
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between space-x-2 rtl:space-x-reverse">
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(false)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
            >
              {t('auth.cancel', 'إلغاء')}
            </button>
            <button
              type="submit"
              disabled={pin.length < 4 || isSuccess}
              className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5 rtl:space-x-reverse"
            >
              <Lock size={14} />
              <span>{t('auth.confirm_logout', 'تأكيد الخروج')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
