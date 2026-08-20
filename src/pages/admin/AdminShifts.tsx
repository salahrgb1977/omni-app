import React, { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { ActiveShiftStopwatch } from '../../components/admin/ActiveShiftStopwatch'
import { Badge } from '../../components/common/Badge'
import { formatDateTime, formatTime, formatDuration, formatCurrency, formatVehicle } from '../../lib/formatters'
import { Shift, LocationPing } from '../../types/omni'
import {
  Clock,
  MapPin,
  CheckCircle,
  Square,
  DollarSign,
  Truck,
  Eye,
  X,
  Navigation
} from 'lucide-react'

export function AdminShifts() {
  const { shifts, profiles, locationPings, endShift, markShiftPaid } = useData()
  const [selectedShiftForGps, setSelectedShiftForGps] = useState<Shift | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  const filteredShifts = shifts.filter(s => {
    if (filter === 'active') return !s.end_time
    if (filter === 'completed') return Boolean(s.end_time)
    return true
  })

  // GPS pings for selected shift
  const selectedPings = selectedShiftForGps
    ? locationPings
        .filter(p => p.shift_id === selectedShiftForGps.id || p.worker_id === selectedShiftForGps.worker_id)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : []

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold uppercase tracking-wider text-slate-900">
            Field Technician Shifts & Silent GPS Tracking
          </h1>
          <p className="text-xs text-slate-500">
            Real-time shift stopwatch timers, silent 5-minute telemetry breadcrumbs, and payroll status.
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-slate-200 p-1 rounded-lg text-xs font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md transition-colors ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            All Shifts ({shifts.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded-md transition-colors ${filter === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Active ({shifts.filter(s => !s.end_time).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-md transition-colors ${filter === 'completed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Completed ({shifts.filter(s => s.end_time).length})
          </button>
        </div>
      </div>

      {/* Active Shift Stopwatches */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Currently Active Field Clocks
        </h2>
        <ActiveShiftStopwatch
          shifts={shifts}
          profiles={profiles}
          onEndShift={endShift}
        />
      </div>

      {/* Shifts Log Table */}
      <div className="admin-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Shift Records Ledger
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {filteredShifts.length} records found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200 text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Technician</th>
                <th className="px-4 py-3">Assigned Van</th>
                <th className="px-4 py-3">Clock In</th>
                <th className="px-4 py-3">Clock Out</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">GPS Breadcrumbs</th>
                <th className="px-4 py-3">Labor Pay</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredShifts.map(shift => {
                const worker = profiles.find(p => p.id === shift.worker_id)
                const isActive = !shift.end_time
                const duration = formatDuration(shift.start_time, shift.end_time)
                const shiftPingsCount = locationPings.filter(p => p.shift_id === shift.id || p.worker_id === shift.worker_id).length

                return (
                  <tr key={shift.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={worker?.avatar_url || shift.worker_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                          alt={worker?.full_name || 'Tech'}
                          className="w-7 h-7 rounded object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{worker?.full_name || shift.worker_name}</p>
                          {worker?.is_daily_captain && (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1 py-0.2 rounded">
                              Daily Captain
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center text-slate-700 font-medium">
                        <Truck size={13} className="mr-1 text-slate-400" />
                        {formatVehicle(worker?.assigned_vehicle || 'van_1')}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-900">{formatTime(shift.start_time)}</span>
                      <span className="block text-[10px] text-slate-400">{formatDateTime(shift.start_time).split('·')[0]}</span>
                    </td>

                    <td className="px-4 py-3">
                      {isActive ? (
                        <Badge variant="active" size="sm" label="On Duty" />
                      ) : (
                        <div>
                          <span className="font-semibold text-slate-900">{formatTime(shift.end_time)}</span>
                          <span className="block text-[10px] text-slate-400">{formatDateTime(shift.end_time).split('·')[0]}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {duration}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedShiftForGps(shift)}
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors"
                      >
                        <Navigation size={12} className="text-slate-600" />
                        <span>{shiftPingsCount} GPS Pings</span>
                      </button>
                    </td>

                    <td className="px-4 py-3 font-mono">
                      <span className="font-bold text-slate-900">{formatCurrency(shift.paid_amount)}</span>
                      <span className="block text-[10px] mt-0.5">
                        {shift.is_paid ? (
                          <span className="text-emerald-700 font-bold uppercase">Paid</span>
                        ) : (
                          <span className="text-amber-700 font-bold uppercase">Uncleared</span>
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right space-x-1.5">
                      {isActive ? (
                        <button
                          onClick={() => endShift(shift.id)}
                          className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded font-bold text-[11px] transition-colors"
                        >
                          End Shift
                        </button>
                      ) : (
                        <button
                          onClick={() => markShiftPaid(shift.id, !shift.is_paid)}
                          className={`px-2 py-1 rounded font-bold text-[11px] border transition-colors ${
                            shift.is_paid
                              ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          }`}
                        >
                          {shift.is_paid ? 'Mark Unpaid' : 'Clear Payroll'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* GPS Telemetry Breadcrumb Drawer */}
      {selectedShiftForGps && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="relative w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <Navigation size={18} className="text-slate-800" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Silent GPS Breadcrumb Trail
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Shift ID: #{selectedShiftForGps.id.slice(-6)} · {selectedShiftForGps.worker_name}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedShiftForGps(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3">
              <p className="text-xs text-slate-600">
                Pings are recorded silently every 5 minutes in the background without UI indicators on the technician's mobile view.
              </p>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {selectedPings.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No GPS pings recorded for this shift.
                  </div>
                ) : (
                  selectedPings.map((ping, idx) => (
                    <div key={ping.id} className="p-3 bg-white flex items-center justify-between text-xs font-medium">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-mono text-slate-900 text-xs">
                            {ping.lat.toFixed(4)}, {ping.lng.toFixed(4)}
                          </p>
                          <span className="text-[10px] text-slate-400">Telemetry Coordinate Ping</span>
                        </div>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500">
                        {formatTime(ping.timestamp)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedShiftForGps(null)}
                className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold"
              >
                Close Trail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
