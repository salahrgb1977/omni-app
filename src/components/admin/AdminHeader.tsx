import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import {
  Search,
  Plus,
  Clock,
  Smartphone,
  ShieldCheck,
  UserCheck
} from 'lucide-react'

interface AdminHeaderProps {
  onOpenCreateJob?: () => void
}

export function AdminHeader({ onOpenCreateJob }: AdminHeaderProps) {
  const navigate = useNavigate()
  const { currentRole, setCurrentRole, currentProfile, switchProfile, profilesList } = useAuth()
  const { shifts } = useData()

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
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
      {/* Left: Active Shifts Badge & Search */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg text-xs font-semibold text-slate-700">
          <Clock size={14} className={activeShiftsCount > 0 ? 'text-emerald-600' : 'text-slate-400'} />
          <span>
            {activeShiftsCount > 0 ? (
              <strong className="text-slate-900">{activeShiftsCount} Techs On Shift</strong>
            ) : (
              '0 Active Shifts'
            )}
          </span>
        </div>

        <div className="relative hidden md:block w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search work orders, clients, parts..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-800"
          />
        </div>
      </div>

      {/* Right: Actions, Role Preview Switcher, and Profile */}
      <div className="flex items-center space-x-3">
        {onOpenCreateJob && (
          <button
            onClick={onOpenCreateJob}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-colors"
          >
            <Plus size={14} />
            <span>Dispatch Job</span>
          </button>
        )}

        {/* Role & Worker Preview Switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => handleRoleToggle('admin')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
              currentRole === 'admin'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Admin View
          </button>

          {/* Quick-switch as specific technician */}
          <select
            value={currentRole === 'worker' ? currentProfile.id : ''}
            onChange={e => {
              if (e.target.value) handleWorkerSelect(e.target.value)
            }}
            className="bg-transparent text-xs font-bold text-slate-700 px-1 py-1 rounded focus:outline-none cursor-pointer"
          >
            <option value="">📱 Preview Worker PWA...</option>
            {workerProfiles.map(w => (
              <option key={w.id} value={w.id}>
                📱 {w.full_name} ({w.assigned_vehicle === 'van_1' ? 'Van 1' : 'Van 2'}{w.is_daily_captain ? ' · Captain' : ''})
              </option>
            ))}
          </select>
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <img
            src={currentProfile.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250'}
            alt={currentProfile.full_name}
            className="w-8 h-8 rounded-lg object-cover border border-slate-300"
          />
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {currentProfile.full_name}
            </p>
            <p className="text-[10px] text-slate-500 uppercase font-mono">
              {currentProfile.role === 'admin' ? 'Executive Admin' : 'Field Technician'}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
