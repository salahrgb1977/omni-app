import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Clock,
  CheckSquare,
  Truck,
  Users,
  CreditCard,
  Flame
} from 'lucide-react'

export function AdminSidebar() {
  const location = useLocation()

  const navItems = [
    {
      to: '/admin',
      label: 'Command Center',
      icon: LayoutDashboard,
      exact: true
    },
    {
      to: '/admin/shifts',
      label: 'Live Shifts & GPS',
      icon: Clock
    },
    {
      to: '/admin/jobs',
      label: 'Work Orders & Proof',
      icon: CheckSquare
    },
    {
      to: '/admin/inventory',
      label: 'Van Inventory & Captains',
      icon: Truck
    },
    {
      to: '/admin/workers',
      label: 'Technician Scorecards',
      icon: Users
    },
    {
      to: '/admin/payroll',
      label: 'Payroll & Revenue Ledger',
      icon: CreditCard
    }
  ]

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-900 shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-900 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold">
          <Flame size={18} />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wider uppercase leading-none">
            Omni HVAC OS
          </h1>
          <span className="text-[10px] text-slate-400 font-mono tracking-tight uppercase">
            Industrial Executive
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Operations
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
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white font-bold border border-slate-800'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-blue-400' : 'text-slate-500'} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/80">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
            Telemetry Online
          </span>
          <span className="font-mono text-[10px] text-slate-400">v2.4.0</span>
        </div>
      </div>
    </aside>
  )
}
