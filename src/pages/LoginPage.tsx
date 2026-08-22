import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../contexts/I18nContext'
import { formatVehicle } from '../lib/formatters'
import {
  ShieldCheck,
  User,
  Truck,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
  Globe,
  Sparkles
} from 'lucide-react'

export function LoginPage() {
  const { profilesList, login } = useAuth()
  const { t, language, setLanguage, isRTL } = useI18n()
  const navigate = useNavigate()

  const [selectedId, setSelectedId] = useState<string>(profilesList[0]?.id || 'admin-1')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedProfile = profilesList.find(p => p.id === selectedId) || profilesList[0]
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    setTimeout(() => {
      login(selectedId)
      setIsSubmitting(false)
      if (selectedProfile.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/worker')
      }
    }, 400)
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
              {t('auth.login_subtitle', 'حدد حسابك الميداني أو الإداري لبدء الجلسة')}
            </p>
          </div>

          {/* Account Selection Form */}
          <form onSubmit={handleSignIn} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {t('auth.select_profile', 'اختر الحساب النشط:')}
              </label>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {profilesList.map(profile => {
                  const isSelected = profile.id === selectedId
                  const isCaptain = Boolean(profile.is_daily_captain)

                  return (
                    <div
                      key={profile.id}
                      onClick={() => setSelectedId(profile.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/40 shadow-sm'
                          : 'border-slate-800/80 bg-slate-950/60 hover:bg-slate-850 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
                        <img
                          src={profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                          alt={profile.full_name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                            <h3 className="font-bold text-xs text-white truncate">
                              {profile.full_name}
                            </h3>
                            {profile.role === 'admin' ? (
                              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                ADMIN
                              </span>
                            ) : isCaptain ? (
                              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                CAPTAIN
                              </span>
                            ) : (
                              <span className="bg-slate-800 text-slate-400 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                TECH
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 flex items-center mt-0.5">
                            <Truck size={11} className="mr-1 rtl:mr-0 rtl:ml-1 text-slate-500" />
                            {profile.assigned_vehicle === 'van_1' ? t('vehicle.van_1', 'شاحنة 1') : t('vehicle.van_2', 'شاحنة 2')}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 mr-1 rtl:mr-0 rtl:ml-1">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                            <CheckCircle size={14} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-slate-700" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              <span>{isSubmitting ? t('deduct.logging', 'جاري الدخول...') : t('auth.sign_in_btn', 'تسجيل الدخول ومتابعة العمل')}</span>
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
