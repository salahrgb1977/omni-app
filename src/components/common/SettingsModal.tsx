import React from 'react'
import { useI18n, Language } from '../../contexts/I18nContext'
import { useAuth } from '../../contexts/AuthContext'
import { isSupabaseConfigured } from '../../lib/supabase'
import {
  X,
  Globe,
  Settings,
  Shield,
  Smartphone,
  Database,
  CheckCircle,
  AlertTriangle,
  Info,
  LogOut,
  Lock
} from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { language, setLanguage, t, isRTL } = useI18n()
  const { currentRole, setCurrentRole, currentProfile, switchProfile, profilesList, setIsLogoutModalOpen } = useAuth()

  if (!isOpen) return null

  const handleLogoutClick = () => {
    onClose()
    setIsLogoutModalOpen(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Settings size={18} className="text-slate-800" />
            <h2 className="text-sm font-bold text-slate-900">
              {t('settings.title', 'إعدادات النظام واللغة')}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          
          {/* Language Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5 rtl:space-x-reverse">
              <Globe size={15} className="text-blue-600" />
              <span>{t('settings.language', 'لغة التطبيق')}</span>
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setLanguage('ar')}
                className={`py-2.5 px-3 rounded-lg border text-xs font-bold flex flex-col items-center justify-center transition-all ${
                  language === 'ar'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-sm font-bold">العربية</span>
                <span className="text-[10px] opacity-75 font-normal">اللغة الأساسية</span>
              </button>

              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2.5 px-3 rounded-lg border text-xs font-bold flex flex-col items-center justify-center transition-all ${
                  language === 'en'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-sm font-bold font-sans">English</span>
                <span className="text-[10px] opacity-75 font-normal">Secondary Language</span>
              </button>
            </div>
          </div>

          {/* Role Preview Mode */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5 rtl:space-x-reverse">
              <Shield size={15} className="text-slate-800" />
              <span>{t('settings.role', 'معاينة الدور')}</span>
            </label>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentRole('admin')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center space-x-1.5 rtl:space-x-reverse transition-colors ${
                    currentRole === 'admin'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Shield size={13} />
                  <span>{t('admin.view', 'لوحة الإدارة')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentRole('worker')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center space-x-1.5 rtl:space-x-reverse transition-colors ${
                    currentRole === 'worker'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Smartphone size={13} />
                  <span>{t('worker.my_tasks', 'تطبيق الفني')}</span>
                </button>
              </div>

              {/* Technician Switcher */}
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {t('worker.tech_status', 'تبديل حساب الفني المعاين:')}
                </label>
                <select
                  value={currentProfile.id}
                  onChange={e => {
                    if (e.target.value) {
                      switchProfile(e.target.value)
                    }
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {profilesList.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.role === 'admin' ? '👑 ' : '📱 '}
                      {p.full_name} ({p.role === 'admin' ? t('admin.view', 'إدارة') : (p.is_daily_captain ? t('badge.captain', 'قائد') : t('profile.tech_auth', 'فني'))})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Database Connection Status */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5 rtl:space-x-reverse">
              <Database size={15} className="text-emerald-600" />
              <span>{t('settings.database', 'حالة قاعدة البيانات')}</span>
            </label>

            <div className={`p-3 rounded-lg border text-xs flex items-start space-x-2 rtl:space-x-reverse ${
              isSupabaseConfigured
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {isSupabaseConfigured ? (
                <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">
                  {isSupabaseConfigured
                    ? t('settings.connected', 'متصل بـ Supabase بنجاح')
                    : t('settings.offline', 'الوضع غير المتصل (تخزين محلي مؤقت)')}
                </p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  {isSupabaseConfigured
                    ? 'Realtime SQL Broadcasting & Cloud Storage Active'
                    : 'Changes will sync automatically once online credentials are provided.'}
                </p>
              </div>
            </div>
          </div>

          {/* Security & Logout Section */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5 rtl:space-x-reverse">
              <Lock size={15} className="text-rose-600" />
              <span>{t('auth.logout', 'الأمان وتسجيل الخروج')}</span>
            </label>

            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full py-2.5 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center space-x-2 rtl:space-x-reverse transition-colors"
            >
              <LogOut size={15} />
              <span>{t('auth.logout_secret', 'تسجيل الخروج (يتطلب رمز الأمان السري 1357)')}</span>
            </button>
          </div>

          {/* Version Info */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-1 rtl:space-x-reverse">
              <Info size={13} />
              <span>{t('app.name', 'أومني لأنظمة التكييف')}</span>
            </span>
            <span className="font-mono text-[11px]">{t('app.version', 'الإصدار 2.4.0')}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition-colors"
          >
            {t('settings.save', 'حفظ وإغلاق')}
          </button>
        </div>
      </div>
    </div>
  )
}
