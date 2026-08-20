import React, { useState } from 'react'
import { useData } from '../../contexts/DataContext'
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
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Header */}
      <div>
        <h1 className="text-base font-bold uppercase tracking-wider text-slate-900">
          Financials: Payroll Logger & Client Revenue Ledger
        </h1>
        <p className="text-xs text-slate-500">
          Technician labor compensation ledger, cash/transfer settlement, and work order invoicing.
        </p>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card p-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Gross Invoiced</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
            {formatCurrency(totalClientRevenue)}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            {formatCurrency(collectedRevenue)} collected
          </span>
        </div>

        <div className="admin-card p-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Pending Invoices</span>
          <p className="text-2xl font-bold font-mono text-amber-700 mt-0.5">
            {formatCurrency(pendingRevenue)}
          </p>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            Awaiting client remittance
          </span>
        </div>

        <div className="admin-card p-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Labor Cost (Shifts)</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
            {formatCurrency(totalLaborCost)}
          </p>
          <span className="text-[11px] text-rose-700 font-semibold mt-1 block">
            {formatCurrency(unclearedLabor)} uncleared payroll
          </span>
        </div>

        <div className="admin-card p-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Operating Margin</span>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-0.5">
            {netOperatingMargin}%
          </p>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            Net labor efficiency
          </span>
        </div>
      </div>

      {/* Ledger Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveLedgerTab('payroll')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeLedgerTab === 'payroll'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Daily Technician Payroll Ledger
        </button>
        <button
          onClick={() => setActiveLedgerTab('revenue')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeLedgerTab === 'revenue'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Client Work Order Revenue Ledger
        </button>
      </div>

      {/* TAB 1: DAILY TECHNICIAN PAYROLL LEDGER */}
      {activeLedgerTab === 'payroll' && (
        <div className="admin-card overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Shift Labor Compensation Ledger
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Uncleared: <strong className="text-amber-700">{formatCurrency(unclearedLabor)}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200 text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Date & Shift</th>
                  <th className="px-4 py-3">Technician</th>
                  <th className="px-4 py-3">Start / End</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Hourly Rate</th>
                  <th className="px-4 py-3">Calculated Payout</th>
                  <th className="px-4 py-3">Payment Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
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
                          <span className="block text-[10px] text-blue-700 font-semibold">Daily Captain</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-slate-800">{formatTime(shift.start_time)}</span>
                        <span className="text-slate-400 mx-1">→</span>
                        <span className="text-slate-800">{shift.end_time ? formatTime(shift.end_time) : 'Active'}</span>
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {isActive ? <Badge variant="active" size="sm" label="On Shift" /> : duration}
                      </td>

                      <td className="px-4 py-3 font-mono">
                        {formatCurrency(worker?.hourly_rate || 45)}/hr
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {formatCurrency(shift.paid_amount)}
                      </td>

                      <td className="px-4 py-3">
                        {shift.is_paid ? (
                          <Badge variant="paid" size="sm" label="Settled / Paid" />
                        ) : (
                          <Badge variant="unpaid" size="sm" label="Uncleared Payroll" />
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => markShiftPaid(shift.id, !shift.is_paid)}
                          className={`px-2.5 py-1 rounded font-bold text-[11px] border transition-colors ${
                            shift.is_paid
                              ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          }`}
                        >
                          {shift.is_paid ? 'Mark Unpaid' : 'Mark as Paid'}
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
          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Work Order Billing & Invoicing Ledger
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Pending: <strong className="text-amber-700">{formatCurrency(pendingRevenue)}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200 text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Job ID</th>
                  <th className="px-4 py-3">Client Facility</th>
                  <th className="px-4 py-3">Service Title</th>
                  <th className="px-4 py-3">Technician</th>
                  <th className="px-4 py-3">Job Status</th>
                  <th className="px-4 py-3">Invoice Amount</th>
                  <th className="px-4 py-3">Invoice Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
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
                      {job.assigned_worker_name || 'Unassigned'}
                    </td>

                    <td className="px-4 py-3">
                      <Badge variant={job.status} size="sm" />
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {formatCurrency(job.client_price)}
                    </td>

                    <td className="px-4 py-3">
                      {job.is_client_paid ? (
                        <Badge variant="paid" size="sm" label="Client Invoiced (Paid)" />
                      ) : (
                        <Badge variant="unpaid" size="sm" label="Payment Pending" />
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setJobClientPaid(job.id, !job.is_client_paid)}
                        className={`px-2.5 py-1 rounded font-bold text-[11px] border transition-colors ${
                          job.is_client_paid
                            ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                        }`}
                      >
                        {job.is_client_paid ? 'Mark Unpaid' : 'Clear Invoice'}
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
