import React, { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'
import { CreateJobModal } from './CreateJobModal'
import { SettingsModal } from '../common/SettingsModal'
import { useData } from '../../contexts/DataContext'
import { useI18n } from '../../contexts/I18nContext'
import {
  LayoutDashboard,
  Clock,
  CheckSquare,
  Truck,
  Settings
} from 'lucide-react'

export function AdminLayout() {
  const { profiles, createJob } = useData()
  const { t, language } = useI18n()
  const location = useLocation()
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const mobileNavItems = [
    {
      to: '/admin',
      label: language === 'ar' ? 'الرئيسية' : 'Home',
      icon: LayoutDashboard,
      exact: true
    },
    {
      to: '/admin/shifts',
      label: language === 'ar' ? 'الورديات' : 'Shifts',
      icon: Clock
    },
    {
      to: '/admin/jobs',
      label: language === 'ar' ? 'المهام' : 'Tasks',
      icon: CheckSquare
    },
    {
      to: '/admin/inventory',
      label: language === 'ar' ? 'المخزون' : 'Stock',
      icon: Truck
    }
  ]

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar (Desktop fixed / Mobile slide-out drawer) */}
      <AdminSidebar
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader
          onOpenCreateJob={() => setIsCreateJobOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Content Container (padded for bottom bar on mobile) */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 pb-24 lg:pb-6">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar (Screens < 1024px) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-dropdown">
          <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto">
            {mobileNavItems.map(item => {
              const Icon = item.icon
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to)

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-bold transition-all ${
                    isActive
                      ? 'text-blue-600 bg-blue-50/80 font-black'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                  <span className="truncate mt-0.5 max-w-[56px] text-center">{item.label}</span>
                </NavLink>
              )
            })}

            {/* Settings Trigger in Bottom Nav */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-all"
            >
              <Settings size={18} className="text-slate-400" />
              <span className="truncate mt-0.5 max-w-[56px] text-center">{language === 'ar' ? 'الإعدادات' : 'Settings'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Create Job Modal */}
      <CreateJobModal
        profiles={profiles}
        isOpen={isCreateJobOpen}
        onClose={() => setIsCreateJobOpen(false)}
        onCreateJob={createJob}
      />

      {/* Settings & Language Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}
