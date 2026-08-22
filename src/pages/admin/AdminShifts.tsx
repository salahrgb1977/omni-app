import React, { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useI18n } from '../../contexts/I18nContext'
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
  const { t } = useI18n()
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
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
        <div>
          <h1 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900">
            {t('shifts.title', 'ورديات الفنيين الميدانيين والتتبع الصامت')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('shifts.desc', 'عدادات توقيت الورديات اللحظية، ومسار الإحداثيات كل 5 دقائق، وحالة الرواتب.')}
          </p>
        </div>

        <div className="flex items-center space-x-1 rtl:space-x-reverse bg-slate-200 p-1 rounded-lg text-xs font-bold self-start sm:self-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {t('shifts.filter_all', 'الكل')} ({shifts.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${filter === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {t('shifts.filter_active', 'النشطة')} ({shifts.filter(s => !s.end_time).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${filter === 'completed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {t('shifts.filter_completed', 'المكتملة')} ({shifts.filter(s => s.end_time).length})
          </button>
        </div>
      </div>

      {/* Active Shift Stopwatches */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          {t('shifts.active_clocks', 'ساعات العمل الميدانية النشطة حالياً')}
        </h2>
        <ActiveShiftStopwatch
          shifts={shifts}
          profiles={profiles}
          onEndShift={endShift}
        />
      </div>

      {/* Shifts Log Table / Mobile Cards */}
      <div className="admin-card overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-white flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {t('shifts.ledger_title', 'سجل سجلات الورديات')}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {filteredShifts.length} {t('shifts.filter_all', 'سجلات')}
          </span>
        </div>

        {/* Mobile View: Cards on Small Screens */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredShifts.map(shift => {
            const worker = profiles.find(p => p.id === shift.worker_id)
            const isActive = !shift.end_time
            const duration = formatDuration(shift.start_time, shift.end_time)
            const shiftPingsCount = locationPings.filter(p => p.shift_id === shift.id || p.worker_id === shift.worker_id).length

            return (
              <div key={shift.id} className="p-3.5 space-y-2.5 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <img
                      src={worker?.avatar_url || shift.worker_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                      alt={worker?.full_name || 'Tech'}
                      className="w-8 h-8 rounded object-cover border border-slate-200"
                    />
                    <div>
                      <p className="font-bold text-xs text-slate-900">{worker?.full_name || shift.worker_name}</p>
                      <span className="text-[10px] text-slate-500 flex items-center">
                        <Truck size={10} className="mr-0.5 rtl:mr-0 rtl:ml-0.5 text-slate-400" />
                        {worker?.assigned_vehicle === 'van_1' ? t('vehicle.van_1', 'شاحنة 1') : t('vehicle.van_2', 'شاحنة 2')}
                      </span>
                    </div>
                  </div>

                  {isActive ? (
                    <Badge variant="active" size="sm" label={t('shifts.status_on_duty', 'على رأس العمل')} />
                  ) : shift.is_paid ? (
                    <Badge variant="paid" size="sm" label={t('shifts.status_paid', 'مسدد')} />
                  ) : (
                    <Badge variant="unpaid" size="sm" label={t('shifts.status_uncleared', 'معلق')} />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      {t('shifts.col_clock_in', 'بدء الوردية')}
                    </span>
                    <span className="font-mono text-slate-800">{formatTime(shift.start_time)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      {t('shifts.col_duration', 'المدة')}
                    </span>
                    <span className="font-mono font-bold text-slate-900">{duration}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      {t('shifts.col_pay', 'مستحق العمل')}
                    </span>
                    <span className="font-mono font-bold text-emerald-700">{formatCurrency(shift.paid_amount)}</span>
                  </div>
                  <div>
                    <button
                      onClick={() => setSelectedShiftForGps(shift)}
                      className="inline-flex items-center space-x-1 rtl:space-x-reverse text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded mt-1"
                    >
                      <Navigation size={11} className="text-slate-600" />
                      <span>{shiftPingsCount} {t('shifts.col_gps', 'إشارات')}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse pt-1">
                  {isActive ? (
                    <button
                      onClick={() => endShift(shift.id)}
                      className="w-full py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg font-bold text-xs transition-colors text-center"
                    >
                      {t('shifts.btn_end', 'إنهاء الوردية')}
                    </button>
                  ) : (
                    <button
                      onClick={() => markShiftPaid(shift.id, !shift.is_paid)}
                      className={`w-full py-2 rounded-lg font-bold text-xs border transition-colors text-center ${
                        shift.is_paid
                          ? 'bg-slate-100 text-slate-600 border-slate-300'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      }`}
                    >
                      {shift.is_paid ? t('shifts.btn_mark_unpaid', 'إلغاء التسوية') : t('shifts.btn_mark_paid', 'تسوية الراتب')}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop View: Full Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200 text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">{t('shifts.col_tech', 'الفني')}</th>
                <th className="px-4 py-3">{t('shifts.col_van', 'الشاحنة')}</th>
                <th className="px-4 py-3">{t('shifts.col_clock_in', 'بدء الوردية')}</th>
                <th className="px-4 py-3">{t('shifts.col_clock_out', 'انتهاء الوردية')}</th>
                <th className="px-4 py-3">{t('shifts.col_duration', 'المدة')}</th>
                <th className="px-4 py-3">{t('shifts.col_gps', 'مسار التتبع')}</th>
                <th className="px-4 py-3">{t('shifts.col_pay', 'مستحق العمل')}</th>
                <th className="px-4 py-3 text-right rtl:text-left">{t('shifts.col_actions', 'إجراءات')}</th>
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
                      <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                        <img
                          src={worker?.avatar_url || shift.worker_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                          alt={worker?.full_name || 'Tech'}
                          className="w-7 h-7 rounded object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{worker?.full_name || shift.worker_name}</p>
                          {worker?.is_daily_captain && (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1 py-0.2 rounded">
                              {t('badge.captain', 'قائد الوردية')}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center text-slate-700 font-medium">
                        <Truck size={13} className="mr-1 rtl:mr-0 rtl:ml-1 text-slate-400" />
                        {worker?.assigned_vehicle === 'van_1' ? t('vehicle.van_1', 'شاحنة 1') : t('vehicle.van_2', 'شاحنة 2')}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-900 font-mono">{formatTime(shift.start_time)}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">{formatDateTime(shift.start_time).split('·')[0]}</span>
                    </td>

                    <td className="px-4 py-3">
                      {isActive ? (
                        <Badge variant="active" size="sm" label={t('shifts.status_on_duty', 'على رأس العمل')} />
                      ) : (
                        <div>
                          <span className="font-semibold text-slate-900 font-mono">{formatTime(shift.end_time)}</span>
                          <span className="block text-[10px] text-slate-400 font-mono">{formatDateTime(shift.end_time).split('·')[0]}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {duration}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedShiftForGps(shift)}
                        className="inline-flex items-center space-x-1 rtl:space-x-reverse text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors"
                      >
                        <Navigation size={12} className="text-slate-600" />
                        <span>{shiftPingsCount} {t('shifts.gps_pings_btn', 'إشارات')}</span>
                      </button>
                    </td>

                    <td className="px-4 py-3 font-mono">
                      <span className="font-bold text-slate-900">{formatCurrency(shift.paid_amount)}</span>
                      <span className="block text-[10px] mt-0.5">
                        {shift.is_paid ? (
                          <span className="text-emerald-700 font-bold uppercase">{t('shifts.status_paid', 'مسدد')}</span>
                        ) : (
                          <span className="text-amber-700 font-bold uppercase">{t('shifts.status_uncleared', 'معلق')}</span>
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right rtl:text-left space-x-1.5 rtl:space-x-reverse">
                      {isActive ? (
                        <button
                          onClick={() => endShift(shift.id)}
                          className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded font-bold text-[11px] transition-colors"
                        >
                          {t('shifts.btn_end', 'إنهاء')}
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
                          {shift.is_paid ? t('shifts.btn_mark_unpaid', 'إلغاء') : t('shifts.btn_mark_paid', 'تسوية')}
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

      {/* GPS Telemetry Breadcrumb Modal / Drawer */}
      {selectedShiftForGps && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="relative w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[88vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Navigation size={18} className="text-slate-800 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    {t('shifts.gps_modal_title', 'مسار إحداثيات التتبع الميداني الصامت')}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    #{selectedShiftForGps.id.slice(-6)} · {selectedShiftForGps.worker_name}
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

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
              <p className="text-xs text-slate-600">
                {t('shifts.gps_modal_desc', 'يتم تسجيل الإشارات كل 5 دقائق في الخلفية دون أي مؤشرات على هاتف الفني.')}
              </p>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {selectedPings.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    {t('stopwatch.no_active', 'لا توجد إشارات تتبع مسجلة لهذه الوردية.')}
                  </div>
                ) : (
                  selectedPings.map((ping, idx) => (
                    <div key={ping.id} className="p-2.5 sm:p-3 bg-white flex items-center justify-between text-xs font-medium">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="w-5 h-5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-mono text-slate-900 text-xs">
                            {ping.lat.toFixed(4)}, {ping.lng.toFixed(4)}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {t('shifts.gps_coord', 'إحداثيات إشارة التتبع')}
                          </span>
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

            <div className="px-4 sm:px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedShiftForGps(null)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold text-center"
              >
                {t('shifts.gps_close', 'إغلاق المسار')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
