import React, { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useI18n } from '../../contexts/I18nContext'
import { Badge } from '../../components/common/Badge'
import { formatCurrency, formatDateTime, formatTime, formatDuration } from '../../lib/formatters'
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  FileText,
  UserCheck
} from 'lucide-react'

export function AdminPayroll() {
  const { shifts, profiles, jobs, markShiftPaid, setJobClientPaid } = useData()
  const { t } = useI18n()
  const [activeLedgerTab, setActiveLedgerTab] = useState<'payroll' | 'revenue'>('payroll')

  // Financial Computations
  const totalLaborCost = shifts.reduce((sum, s) => sum + (s.paid_amount || 0), 0)
  const paidLabor = shifts.filter(s => s.is_paid).reduce((sum, s) => sum + (s.paid_amount || 0), 0)
  const unclearedLabor = shifts.filter(s => !s.is_paid).reduce((sum, s) => sum + (s.paid_amount || 0), 0)

  const totalClientRevenue = jobs.reduce((sum, j) => sum + (j.client_price || 0), 0)
  const collectedRevenue = jobs.filter(j => j.is_client_paid).reduce((sum, j) => sum + (j.client_price || 0), 0)
  const pendingRevenue = jobs.filter(j => !j.is_client_paid).reduce((sum, j) => sum + (j.client_price || 0), 0)

  const netOperatingMargin = totalClientRevenue > 0
    ? Math.round(((totalClientRevenue - totalLaborCost) / totalClientRevenue) * 100)
    : 0

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150">
      
      {/* Header */}
      <div>
        <h1 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900">
          {t('payroll.title', 'الماليات: مسجل الرواتب وسجل إيرادات العملاء')}
        </h1>
        <p className="text-xs text-slate-500">
          {t('payroll.desc', 'سجل تعويضات العمالة وتصفية المدفوعات وفواتير أوامر العمل.')}
        </p>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="admin-card p-3.5 sm:p-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {t('kpi.gross_invoiced', 'إجمالي الفواتير الصادرة')}
          </span>
          <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-0.5">
            {formatCurrency(totalClientRevenue)}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block truncate">
            {formatCurrency(collectedRevenue)} {t('kpi.collected_revenue', 'محصلة')}
          </span>
        </div>

        <div className="admin-card p-3.5 sm:p-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {t('kpi.pending_invoices', 'فواتير قيد التحصيل')}
          </span>
          <p className="text-xl sm:text-2xl font-bold font-mono text-amber-700 mt-0.5">
            {formatCurrency(pendingRevenue)}
          </p>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block truncate">
            {jobs.filter(j => !j.is_client_paid).length} {t('kpi.awaiting_payment_desc', 'أمر عمل معلق')}
          </span>
        </div>

        <div className="admin-card p-3.5 sm:p-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {t('kpi.labor_cost', 'تكلفة العمالة (الورديات)')}
          </span>
          <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-0.5">
            {formatCurrency(totalLaborCost)}
          </p>
          <span className="text-[11px] text-rose-700 font-semibold mt-1 block truncate">
            {formatCurrency(unclearedLabor)} {t('kpi.uncleared_payroll', 'رواتب غير مسواة')}
          </span>
        </div>

        <div className="admin-card p-3.5 sm:p-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {t('kpi.operating_margin', 'هامش الربح التشغيلي')}
          </span>
          <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 mt-0.5">
            {netOperatingMargin}%
          </p>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block truncate">
            {t('kpi.labor_efficiency', 'كفاءة تشغيل العمالة')}
          </span>
        </div>
      </div>

      {/* Ledger Navigation Tabs */}
      <div className="flex items-center space-x-2 rtl:space-x-reverse border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveLedgerTab('payroll')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
            activeLedgerTab === 'payroll'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {t('payroll.tab_payroll', 'سجل رواتب الفنيين اليومي')}
        </button>
        <button
          onClick={() => setActiveLedgerTab('revenue')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
            activeLedgerTab === 'revenue'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {t('payroll.tab_revenue', 'سجل إيرادات أوامر عمل العملاء')}
        </button>
      </div>

      {/* TAB 1: DAILY TECHNICIAN PAYROLL LEDGER */}
      {activeLedgerTab === 'payroll' && (
        <div className="admin-card overflow-hidden">
          <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {t('payroll.tab_payroll', 'سجل رواتب الفنيين اليومي')}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {t('kpi.uncleared_payroll', 'معلق:')} <strong className="text-amber-700">{formatCurrency(unclearedLabor)}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200 text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">{t('payroll.col_date', 'التاريخ والوردية')}</th>
                  <th className="px-4 py-3">{t('shifts.col_tech', 'الفني')}</th>
                  <th className="px-4 py-3">{t('payroll.col_start_end', 'البدء / الانتهاء')}</th>
                  <th className="px-4 py-3">{t('shifts.col_duration', 'المدة')}</th>
                  <th className="px-4 py-3">{t('payroll.col_rate', 'سعر الساعة')}</th>
                  <th className="px-4 py-3">{t('payroll.col_payout', 'المبلغ المحسوب')}</th>
                  <th className="px-4 py-3">{t('payroll.col_payment_status', 'حالة السداد')}</th>
                  <th className="px-4 py-3 text-right rtl:text-left">{t('shifts.col_actions', 'إجراء')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {shifts.map(shift => {
                  const worker = profiles.find(p => p.id === shift.worker_id)
                  const duration = formatDuration(shift.start_time, shift.end_time)
                  const isActive = !shift.end_time

                  return (
                    <tr key={shift.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                        {formatDateTime(shift.start_time).split('·')[0]}
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900">{worker?.full_name || shift.worker_name}</span>
                        {worker?.is_daily_captain && (
                          <span className="block text-[10px] text-blue-700 font-semibold">{t('badge.captain', 'قائد الوردية')}</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-slate-800 font-mono">{formatTime(shift.start_time)}</span>
                        <span className="text-slate-400 mx-1">→</span>
                        <span className="text-slate-800 font-mono">{shift.end_time ? formatTime(shift.end_time) : t('badge.active', 'نشط')}</span>
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {isActive ? <Badge variant="active" size="sm" label={t('shifts.status_on_duty', 'على رأس العمل')} /> : duration}
                      </td>

                      <td className="px-4 py-3 font-mono">
                        {formatCurrency(worker?.hourly_rate || 45)}/hr
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {formatCurrency(shift.paid_amount)}
                      </td>

                      <td className="px-4 py-3">
                        {shift.is_paid ? (
                          <Badge variant="paid" size="sm" label={t('shifts.status_paid', 'مسدد')} />
                        ) : (
                          <Badge variant="unpaid" size="sm" label={t('shifts.status_uncleared', 'معلق')} />
                        )}
                      </td>

                      <td className="px-4 py-3 text-right rtl:text-left">
                        <button
                          onClick={() => markShiftPaid(shift.id, !shift.is_paid)}
                          className={`px-2.5 py-1 rounded font-bold text-[11px] border transition-colors ${
                            shift.is_paid
                              ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          }`}
                        >
                          {shift.is_paid ? t('shifts.btn_mark_unpaid', 'إلغاء') : t('shifts.btn_mark_paid', 'تسوية')}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CLIENT WORK ORDER REVENUE LEDGER */}
      {activeLedgerTab === 'revenue' && (
        <div className="admin-card overflow-hidden">
          <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {t('payroll.tab_revenue', 'سجل إيرادات أوامر عمل العملاء')}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {t('kpi.pending_invoices', 'معلق:')} <strong className="text-amber-700">{formatCurrency(pendingRevenue)}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200 text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">{t('payroll.col_job_id', 'رقم المهمة')}</th>
                  <th className="px-4 py-3">{t('payroll.col_client', 'العميل')}</th>
                  <th className="px-4 py-3">{t('payroll.col_service', 'عنوان الخدمة')}</th>
                  <th className="px-4 py-3">{t('shifts.col_tech', 'الفني')}</th>
                  <th className="px-4 py-3">{t('payroll.col_job_status', 'حالة المهمة')}</th>
                  <th className="px-4 py-3">{t('payroll.col_invoice_amt', 'قيمة الفاتورة')}</th>
                  <th className="px-4 py-3">{t('payroll.col_invoice_status', 'حالة الفاتورة')}</th>
                  <th className="px-4 py-3 text-right rtl:text-left">{t('shifts.col_actions', 'إجراء')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      #{job.id.slice(-6)}
                    </td>

                    <td className="px-4 py-3 font-bold text-slate-900">
                      {job.client_name}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {job.title}
                    </td>

                    <td className="px-4 py-3">
                      {job.assigned_worker_name || t('map.unassigned', 'غير مسند')}
                    </td>

                    <td className="px-4 py-3">
                      <Badge variant={job.status} size="sm" />
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {formatCurrency(job.client_price)}
                    </td>

                    <td className="px-4 py-3">
                      {job.is_client_paid ? (
                        <Badge variant="paid" size="sm" label={t('jobs.invoice_paid', 'الفاتورة مسددة')} />
                      ) : (
                        <Badge variant="unpaid" size="sm" label={t('jobs.invoice_pending', 'الفاتورة معلقة')} />
                      )}
                    </td>

                    <td className="px-4 py-3 text-right rtl:text-left">
                      <button
                        onClick={() => setJobClientPaid(job.id, !job.is_client_paid)}
                        className={`px-2.5 py-1 rounded font-bold text-[11px] border transition-colors ${
                          job.is_client_paid
                            ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                        }`}
                      >
                        {job.is_client_paid ? t('proof.mark_unpaid', 'إلغاء') : t('payroll.btn_clear_invoice', 'تسوية')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
