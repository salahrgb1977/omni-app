import React, { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { ActiveShiftStopwatch } from '../../components/admin/ActiveShiftStopwatch'
import { LiveMap } from '../../components/admin/LiveMap'
import { ProofInspectorModal } from '../../components/admin/ProofInspectorModal'
import { Badge } from '../../components/common/Badge'
import { Job } from '../../types/omni'
import { formatCurrency, formatRelativeTime, formatVehicle } from '../../lib/formatters'
import {
  Users,
  CheckCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Eye,
  Truck,
  FileCheck
} from 'lucide-react'
import { Link } from 'react-router-dom'

export function AdminDashboard() {
  const { profiles, shifts, locationPings, inventory, inventoryLogs, jobs, endShift, setJobClientPaid } = useData()
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  // Computations
  const activeShifts = shifts.filter(s => !s.end_time)
  const completedJobs = jobs.filter(j => j.status === 'completed')
  const pendingInvoices = jobs.filter(j => !j.is_client_paid)
  const paidRevenue = jobs.filter(j => j.is_client_paid).reduce((sum, j) => sum + (j.client_price || 0), 0)
  const pendingRevenue = pendingInvoices.reduce((sum, j) => sum + (j.client_price || 0), 0)
  
  // Proof compliance rate (jobs with both before and after photos)
  const proofCompliantJobs = completedJobs.filter(j => j.before_photo_url && j.after_photo_url).length
  const proofRate = completedJobs.length > 0 ? Math.round((proofCompliantJobs / completedJobs.length) * 100) : 100

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Section: Active Field Shift Stopwatches */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Clock size={16} className="text-slate-800" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Active Field Shift Stopwatch
            </h2>
          </div>
          <Link
            to="/admin/shifts"
            className="text-xs font-bold text-slate-700 hover:text-slate-950 flex items-center"
          >
            <span>All Shift Logs</span>
            <ArrowRight size={13} className="ml-1" />
          </Link>
        </div>

        <ActiveShiftStopwatch
          shifts={shifts}
          profiles={profiles}
          onEndShift={endShift}
        />
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card p-4">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Techs</span>
            <Users size={16} className="text-slate-700" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900">{activeShifts.length}</p>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            {activeShifts.length > 0 ? 'Field operations active' : 'No active shifts'}
          </span>
        </div>

        <div className="admin-card p-4">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Proof Compliance</span>
            <FileCheck size={16} className="text-slate-700" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900">{proofRate}%</p>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            {proofCompliantJobs}/{completedJobs.length} jobs with full photo proof
          </span>
        </div>

        <div className="admin-card p-4">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Collected Revenue</span>
            <DollarSign size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-700">{formatCurrency(paidRevenue)}</p>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            Paid client invoices
          </span>
        </div>

        <div className="admin-card p-4">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Invoices</span>
            <DollarSign size={16} className="text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-700">{formatCurrency(pendingRevenue)}</p>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            {pendingInvoices.length} work orders awaiting payment
          </span>
        </div>
      </div>

      {/* Main Grid: Live Map + Recent Work Orders Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Operations Map (2 cols) */}
        <div className="lg:col-span-2">
          <LiveMap
            profiles={profiles}
            jobs={jobs}
            shifts={shifts}
            locationPings={locationPings}
            onSelectJob={setSelectedJob}
            height="460px"
          />
        </div>

        {/* Work Order Verification Queue (1 col) */}
        <div className="admin-card p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Work Orders Queue
              </h3>
              <p className="text-[11px] text-slate-500">Inspect photo proof & audio notes</p>
            </div>
            <Link
              to="/admin/jobs"
              className="text-xs font-bold text-slate-700 hover:text-slate-950 flex items-center"
            >
              <span>View All</span>
              <ArrowRight size={12} className="ml-0.5" />
            </Link>
          </div>

          <div className="flex-1 divide-y divide-slate-100 overflow-y-auto mt-2 space-y-1">
            {jobs.slice(0, 5).map(job => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className="py-3 px-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
                    {job.client_name}
                  </span>
                  <Badge variant={job.status} size="sm" />
                </div>

                <p className="text-xs text-slate-600 font-medium line-clamp-1">
                  {job.title}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <span>Tech: <strong className="text-slate-700">{job.assigned_worker_name || 'Unassigned'}</strong></span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(job.client_price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Proof Inspector Modal */}
      <ProofInspectorModal
        job={selectedJob}
        isOpen={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
        onToggleClientPaid={setJobClientPaid}
      />
    </div>
  )
}
