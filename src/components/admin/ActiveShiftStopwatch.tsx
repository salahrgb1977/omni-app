import React, { useState, useEffect } from 'react'
import { Shift, Profile } from '../../types/omni'
import { formatLiveStopwatch, formatTime, formatVehicle } from '../../lib/formatters'
import { Clock, Shield, Truck, Square } from 'lucide-react'

interface ActiveShiftStopwatchProps {
  shifts: Shift[]
  profiles: Profile[]
  onEndShift?: (shiftId: string) => void
}

export function ActiveShiftStopwatch({ shifts, profiles, onEndShift }: ActiveShiftStopwatchProps) {
  // Trigger re-render every second for live-ticking stopwatch
  const [, setTick] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const activeShifts = shifts.filter(s => !s.end_time)

  if (activeShifts.length === 0) {
    return (
      <div className="admin-card p-4 text-center text-slate-500 text-xs">
        <Clock size={18} className="mx-auto mb-1 text-slate-400" />
        No field technicians currently clocked in.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {activeShifts.map(shift => {
        const worker = profiles.find(p => p.id === shift.worker_id)
        const isCaptain = Boolean(worker?.is_daily_captain)
        const vehicle = worker?.assigned_vehicle || 'van_1'

        return (
          <div key={shift.id} className="admin-card p-4 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={worker?.avatar_url || shift.worker_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                    alt={worker?.full_name || 'Worker'}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                  />
                  <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">
                      {worker?.full_name || shift.worker_name}
                    </h4>
                    {isCaptain && (
                      <span className="bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.2 rounded" title="Daily Captain">
                        CAPTAIN
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 flex items-center mt-0.5">
                    <Truck size={12} className="mr-1 text-slate-400" />
                    {formatVehicle(vehicle)}
                  </p>
                </div>
              </div>

              {onEndShift && (
                <button
                  onClick={() => onEndShift(shift.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="End Technician Shift"
                >
                  <Square size={14} />
                </button>
              )}
            </div>

            {/* Live Ticking Clock */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase text-slate-400 block">Clocked In</span>
                <span className="text-xs font-semibold text-slate-700">{formatTime(shift.start_time)}</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-semibold uppercase text-slate-400 block">Active Shift Time</span>
                <span className="font-mono font-bold text-emerald-700 text-sm bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {formatLiveStopwatch(shift.start_time)}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
