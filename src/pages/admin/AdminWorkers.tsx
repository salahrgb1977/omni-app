import React from 'react'
import { useData } from '../../contexts/DataContext'
import { Badge } from '../../components/common/Badge'
import { formatCurrency, formatVehicle } from '../../lib/formatters'
import {
  Users,
  Award,
  Clock,
  CheckCircle,
  Truck,
  DollarSign,
  TrendingUp,
  FileCheck
} from 'lucide-react'

export function AdminWorkers() {
  const { profiles, jobs, shifts } = useData()
  const workers = profiles.filter(p => p.role === 'worker')

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Header */}
      <div>
        <h1 className="text-base font-bold uppercase tracking-wider text-slate-900">
          Technician Performance Scorecards
        </h1>
        <p className="text-xs text-slate-500">
          Accountability metrics, proof-of-work compliance rate, hourly rates, and daily vehicle assignments.
        </p>
      </div>

      {/* Scorecards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {workers.map(worker => {
          const workerJobs = jobs.filter(j => j.assigned_worker_id === worker.id)
          const completedJobs = workerJobs.filter(j => j.status === 'completed')
          const workerShifts = shifts.filter(s => s.worker_id === worker.id)
          const activeShift = workerShifts.find(s => !s.end_time)
          
          // Photo proof compliance
          const compliantJobs = completedJobs.filter(j => j.before_photo_url && j.after_photo_url).length
          const photoComplianceRate = completedJobs.length > 0
            ? Math.round((compliantJobs / completedJobs.length) * 100)
            : 100

          return (
            <div
              key={worker.id}
              className="admin-card p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              {/* Profile Card Header */}
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="relative">
                    <img
                      src={worker.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                      alt={worker.full_name}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                    />
                    {activeShift && (
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Score</span>
                    <span className="font-mono font-bold text-base text-slate-900">
                      {worker.performance_score}%
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-bold text-sm text-slate-900">{worker.full_name}</h3>
                    {worker.is_daily_captain && (
                      <span className="bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
                        CAPTAIN
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium flex items-center">
                    <Truck size={12} className="mr-1 text-slate-400" />
                    {formatVehicle(worker.assigned_vehicle)}
                  </p>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center">
                    <CheckCircle size={13} className="mr-1 text-emerald-600" />
                    Completed Jobs
                  </span>
                  <span className="font-bold font-mono text-slate-900">{completedJobs.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center">
                    <FileCheck size={13} className="mr-1 text-blue-600" />
                    Photo Proof Compliance
                  </span>
                  <span className="font-bold font-mono text-slate-900">{photoComplianceRate}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center">
                    <DollarSign size={13} className="mr-1 text-slate-400" />
                    Hourly Base Rate
                  </span>
                  <span className="font-bold font-mono text-slate-900">{formatCurrency(worker.hourly_rate)}/hr</span>
                </div>
              </div>

              {/* Footer Status */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Field Status</span>
                {activeShift ? (
                  <Badge variant="active" size="sm" label="On Shift Now" />
                ) : (
                  <Badge variant="neutral" size="sm" label="Off Duty" />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
