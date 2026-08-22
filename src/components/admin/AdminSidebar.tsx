import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useI18n } from '../../contexts/I18nContext'
import {
  LayoutDashboard,
  Clock,
  CheckSquare,
  Truck,
  Users,
  CreditCard,
  Flame,
  X,
  Globe,
  Settings,
  LogOut
} from 'lucide-react'

interface AdminSidebarProps {
  isMobileOpen?: boolean
  onMobileClose?: () => void
  onOpenSettings?: () => void
}

export function AdminSidebar({ isMobileOpen, onMobileClose, onOpenSettings }: AdminSidebarProps) {
  const location = useLocation()
  const { setIsLogoutModalOpen } = useAuth()
  const { t, language, setLanguage, isRTL } = useI18n()

  const navItems = [
    {
      to: '/admin',
      label: t('nav.command_center', 'مركز القيادة'),
      icon: LayoutDashboard,
      exact: true
    },
    {
      to: '/admin/shifts',
      label: t('nav.shifts_gps', 'الورديات والتتبع المباشر'),
      icon: Clock
    },
    {
      to: '/admin/jobs',
      label: t('nav.jobs_proof', 'أوامر العمل والإثباتات'),
      icon: CheckSquare
    },
    {
      to: '/admin/inventory',
      label: t('nav.inventory', 'مخزون الشاحنات والقادة'),
      icon: Truck
    },
    {
      to: '/admin/workers',
      label: t('nav.workers', 'تقييم وبطاقات الفنيين'),
      icon: Users
    },
    {
      to: '/admin/payroll',
      label: t('nav.payroll', 'الرواتب وسجل الإيرادات'),
      icon: CreditCard
    }
  ]

  const handleNavClick = () => {
    if (onMobileClose) {
      onMobileClose()
    }
  }

  const handleLogoutClick = () => {
    if (onMobileClose) onMobileClose()
    setIsLogoutModalOpen(true)
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-900 flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold shrink-0">
            <Flame size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wider uppercase leading-none">
              {t('app.name', 'أومني لأنظمة التكييف')}
            </h1>
            <span className="text-[10px] text-slate-400 font-mono tracking-tight uppercase">
              {t('app.tagline', 'نظام التشغيل والإدارة')}
            </span>
          </div>
        </div>

        {/* Close Button on Mobile Drawer */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {t('nav.operations', 'العمليات الميدانية')}
        </div>

        {navItems.map(item => {
          const Icon = item.icon
          const isActive = item.exact 
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to)

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={`flex items-center space-x-3 rtl:space-x-reverse px-3.5 py-3 rounded-xl text-xs font-bold transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white border border-slate-800 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-blue-400 shrink-0' : 'text-slate-500 shrink-0'} />
              <span className="truncate">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Language, Settings & Logout Footer Actions */}
      <div className="p-3 border-t border-slate-900 bg-slate-950/80 space-y-2">
        <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setLanguage('ar')}
            className={`py-1.5 rounded-md text-[11px] font-bold transition-colors ${
              language === 'ar'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            العربية
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`py-1.5 rounded-md text-[11px] font-bold font-sans transition-colors ${
              language === 'en'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            English
          </button>
        </div>

        {onOpenSettings && (
          <button
            type="button"
            onClick={() => {
              if (onMobileClose) onMobileClose()
              onOpenSettings()
            }}
            className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center space-x-2 rtl:space-x-reverse transition-colors"
          >
            <Settings size={14} />
            <span>{t('settings', 'الإعدادات')}</span>
          </button>
        )}

        {/* Security Logout Button */}
        <button
          type="button"
          onClick={handleLogoutClick}
          className="w-full py-2 px-3 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/40 text-rose-300 hover:text-white text-xs font-bold flex items-center justify-center space-x-2 rtl:space-x-reverse transition-colors"
        >
          <LogOut size={14} />
          <span>{t('auth.logout_secret', 'تسجيل الخروج (رمز سري)')}</span>
        </button>

        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 rtl:mr-0 rtl:ml-2"></span>
            {t('telemetry.online', 'الاتصال نشط')}
          </span>
          <span className="font-mono text-[10px] text-slate-500">{t('app.version', 'v2.4.0')}</span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar (hidden on screens < 1024px) */}
      <aside className="hidden lg:flex w-64 border-r rtl:border-r-0 rtl:border-l border-slate-900 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (visible on screens < 1024px when isMobileOpen is true) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
          />

          {/* Drawer panel */}
          <div className={`relative w-72 max-w-[85vw] h-full shadow-2xl z-10 transition-transform ${
            isRTL ? 'mr-0' : 'ml-0'
          }`}>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
