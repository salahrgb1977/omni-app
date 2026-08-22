import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { useI18n } from '../contexts/I18nContext'
import { Badge } from '../components/common/Badge'
import { formatCurrency, formatDateTime, formatTime, formatDuration } from '../lib/formatters'
import { DollarSign, Clock, CheckCircle } from 'lucide-react'

export function WorkerEarnings() {
  const { currentProfile } = useAuth()
  const { shifts } = useData()
  const { t } = useI18n()

  const myShifts = shifts.filter(s => s.worker_id === currentProfile.id)
  const totalEarned = myShifts.reduce((sum, s) => sum + (s.paid_amount || 0), 0)
  const clearedEarnings = myShifts.filter(s => s.is_paid).reduce((sum, s) => sum + (s.paid_amount || 0), 0)
  const pendingEarnings = myShifts.filter(s => !s.is_paid).reduce((sum, s) => sum + (s.paid_amount || 0), 0)

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      
      {/* Header */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          {t('earnings.title', 'الورديات ومستحقات الأجر')}
        </h2>
        <p className="text-[11px] text-slate-500">
          {t('workers.hourly_rate', 'سعر الساعة الأساسي:')} {formatCurrency(currentProfile.hourly_rate || 45)}/hr
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="worker-card p-3.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {t('earnings.cleared_paid', 'المسدد المسوى')}
          </span>
          <p className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
            {formatCurrency(clearedEarnings)}
          </p>
        </div>

        <div className="worker-card p-3.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {t('earnings.pending_payout', 'قيد التسوية')}
          </span>
          <p className="text-xl font-bold font-mono text-amber-700 mt-0.5">
            {formatCurrency(pendingEarnings)}
          </p>
        </div>
      </div>

      {/* Shift Log Cards */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {t('earnings.records', 'سجلات الورديات')}
        </h3>

        {myShifts.map(shift => {
          const duration = formatDuration(shift.start_time, shift.end_time)
          const isActive = !shift.end_time

          return (
            <div key={shift.id} className="worker-card p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {formatDateTime(shift.start_time).split('·')[0]}
                </span>
                {isActive ? (
                  <Badge variant="active" size="sm" label={t('badge.active', 'نشط على رأس العمل')} />
                ) : shift.is_paid ? (
                  <Badge variant="paid" size="sm" label={t('badge.paid', 'مسدد')} />
                ) : (
                  <Badge variant="unpaid" size="sm" label={t('badge.unpaid', 'معلق')} />
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center">
                  <Clock size={12} className="mr-1 rtl:mr-0 rtl:ml-1 text-slate-400" />
                  {formatTime(shift.start_time)} → {shift.end_time ? formatTime(shift.end_time) : t('badge.active', 'الآن')}
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {isActive ? t('jobs.status_in_progress', 'قيد التنفيذ') : duration}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{t('earnings.est_pay', 'مستحق الأجر المحسوب:')}</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(shift.paid_amount)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
