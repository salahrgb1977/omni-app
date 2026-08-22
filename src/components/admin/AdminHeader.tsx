import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import { useI18n } from '../../contexts/I18nContext'
import {
  Menu,
  Search,
  Plus,
  Clock,
  Smartphone,
  ShieldCheck,
  Settings,
  Globe,
  LogOut
} from 'lucide-react'

interface AdminHeaderProps {
  onOpenCreateJob?: () => void
  onOpenMobileMenu?: () => void
  onOpenSettings?: () => void
}

export function AdminHeader({ onOpenCreateJob, onOpenMobileMenu, onOpenSettings }: AdminHeaderProps) {
  const navigate = useNavigate()
  const { currentRole, setCurrentRole, currentProfile, switchProfile, profilesList, setIsLogoutModalOpen } = useAuth()
  const { shifts } = useData()
  const { t, language, setLanguage } = useI18n()

  const activeShiftsCount = shifts.filter(s => !s.end_time).length
  const workerProfiles = profilesList.filter(p => p.role === 'worker')

  const handleRoleToggle = (targetRole: 'admin' | 'worker') => {
    setCurrentRole(targetRole)
    if (targetRole === 'worker') {
      navigate('/worker')
    } else {
      navigate('/admin')
    }
  }

  const handleWorkerSelect = (workerId: string) => {
    switchProfile(workerId)
    setCurrentRole('worker')
    navigate('/worker')
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
      {/* Left: Mobile Hamburger & Active Shifts Badge */}
      <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse">
        {/* Mobile Hamburger Drawer Trigger */}
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Open mobile menu"
          >
            <Menu size={22} />
          </button>
        )}

        {/* Active Shifts Status Pill */}
        <div className="flex items-center space-x-1.5 rtl:space-x-reverse bg-slate-100 border border-slate-200 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700">
          <Clock size={14} className={activeShiftsCount > 0 ? 'text-emerald-600 animate-pulse' : 'text-slate-400'} />
          <span className="text-[11px] sm:text-xs">
            {activeShiftsCount > 0 ? (
              <strong className="text-slate-900">{activeShiftsCount} {t('active.techs.count', 'فني على رأس العمل')}</strong>
            ) : (
              t('active.techs.zero', '0 ورديات نشطة')
            )}
          </span>
        </div>
      </div>

      {/* Right: Actions, Quick Language Switch, Settings, Logout and Profile */}
      <div className="flex items-center space-x-1.5 sm:space-x-2.5 rtl:space-x-reverse">
        
        {/* Quick Dispatch Job Button */}
        {onOpenCreateJob && (
          <button
            onClick={onOpenCreateJob}
            className="px-3 sm:px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1 sm:space-x-1.5 rtl:space-x-reverse shadow-sm transition-colors"
          >
            <Plus size={15} />
            <span className="hidden xs:inline sm:inline">{t('dispatch.job', 'إسناد أمر عمل')}</span>
          </button>
        )}

        {/* Quick Language Toggle Pill */}
        <button
          type="button"
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center space-x-1 rtl:space-x-reverse border border-slate-200 transition-colors"
          title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
        >
          <Globe size={14} className="text-blue-600" />
          <span className="hidden sm:inline font-mono">{language === 'ar' ? 'EN' : 'عربي'}</span>
        </button>

        {/* Settings Dialog Trigger */}
        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            title={t('settings', 'الإعدادات')}
          >
            <Settings size={18} />
          </button>
        )}

        {/* Desktop Role & Worker Preview Switcher */}
        <div className="hidden md:flex items-center space-x-1 rtl:space-x-reverse bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => handleRoleToggle('admin')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
              currentRole === 'admin'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('admin.view', 'لوحة الإدارة')}
          </button>

          <select
            value={currentRole === 'worker' ? currentProfile.id : ''}
            onChange={e => {
              if (e.target.value) handleWorkerSelect(e.target.value)
            }}
            className="bg-transparent text-xs font-bold text-slate-700 px-1 py-1 rounded focus:outline-none cursor-pointer"
          >
            <option value="">📱 {t('worker.preview', 'معاينة تطبيق الفني...')}</option>
            {workerProfiles.map(w => (
              <option key={w.id} value={w.id}>
                📱 {w.full_name} ({w.assigned_vehicle === 'van_1' ? t('vehicle.van_1', 'شاحنة 1') : t('vehicle.van_2', 'شاحنة 2')}{w.is_daily_captain ? ` · ${t('badge.captain', 'قائد')}` : ''})
              </option>
            ))}
          </select>
        </div>

        {/* Security Logout Button (Requires Code 1357) */}
        <button
          type="button"
          onClick={() => setIsLogoutModalOpen(true)}
          className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
          title={t('auth.logout', 'تسجيل الخروج (رمز سري)')}
        >
          <LogOut size={18} />
        </button>

        {/* Profile Avatar */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse pl-1 sm:pl-2 border-l rtl:border-l-0 rtl:border-r border-slate-200">
          <img
            src={currentProfile.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250'}
            alt={currentProfile.full_name}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-slate-300"
          />
          <div className="hidden xl:block text-left rtl:text-right">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {currentProfile.full_name}
            </p>
            <p className="text-[10px] text-slate-500 uppercase font-mono">
              {currentProfile.role === 'admin' ? t('admin.view', 'إدارة العمليات') : t('profile.tech_auth', 'فني ميداني')}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
