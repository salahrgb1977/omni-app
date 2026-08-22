import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../contexts/I18nContext'
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Globe,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'

export function LoginPage() {
  const { loginWithEmailPassword, currentRole } = useAuth()
  const { t, language, setLanguage, isRTL } = useI18n()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!email || !password) {
      setErrorMsg(t('auth.fill_all_fields', 'يرجى إدخال البريد الإلكتروني وكلمة المرور.'))
      return
    }

    setIsSubmitting(true)
    try {
      const result = await loginWithEmailPassword(email, password)
      if (result.success) {
        if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('ops')) {
          navigate('/admin')
        } else {
          navigate('/admin') // will auto-route to /admin or /worker based on profile
        }
      } else {
        setErrorMsg(t('auth.invalid_credentials', 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق وإعادة المحاولة.'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans p-4 sm:p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header with Brand & Language Toggle */}
      <header className="relative z-10 max-w-md w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
            <Sparkles size={16} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">
              {t('app.name', 'أومني لأنظمة التكييف')}
            </h1>
            <p className="text-[10px] text-slate-400">
              {t('app.tagline', 'نظام التشغيل والإدارة الميدانية')}
            </p>
          </div>
        </div>

        {/* Language Pill Switcher */}
        <button
          type="button"
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white hover:border-slate-700 transition-all"
        >
          <Globe size={13} className="text-blue-400" />
          <span>{language === 'ar' ? 'English' : 'العربية'}</span>
        </button>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto shadow-inner">
              <Lock size={26} />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {t('auth.login_title', 'أومني لأنظمة التكييف - تسجيل الدخول')}
            </h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {t('auth.login_subtitle', 'أدخل البريد الإلكتروني وكلمة المرور للدخول إلى النظام')}
            </p>
          </div>

          {/* Email & Password Form ONLY */}
          <form onSubmit={handleSignIn} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5 text-left rtl:text-right">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                {t('auth.email_label', 'البريد الإلكتروني الرسمي')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none text-slate-500">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value)
                    setErrorMsg('')
                  }}
                  placeholder="admin@omni.hvac"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-3 px-3 pl-10 rtl:pl-3 rtl:pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left rtl:text-right">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                {t('auth.password_label', 'كلمة المرور')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none text-slate-500">
                  <KeyRound size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value)
                    setErrorMsg('')
                  }}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-3 px-3 pl-10 pr-10 rtl:pl-10 rtl:pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-3 rtl:pr-0 rtl:pl-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error Message Display */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2 rtl:space-x-reverse animate-in fade-in">
                <AlertCircle size={15} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2 rtl:space-x-reverse pt-3 mt-2"
            >
              <span>{isSubmitting ? t('auth.logging_in', 'جاري التحقق وتسجيل الدخول...') : t('auth.sign_in_btn', 'تسجيل الدخول ومتابعة العمل')}</span>
              <ArrowIcon size={16} />
            </button>
          </form>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 text-center py-2 text-[11px] text-slate-500">
        <span>{t('app.name', 'أومني لأنظمة التكييف')} • {t('app.version', 'الإصدار 2.4.0')}</span>
      </footer>
    </div>
  )
}
