import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { Badge } from '../components/common/Badge'
import { MaterialDeductionModal } from '../components/worker/MaterialDeductionModal'
import { formatTime, formatVehicle } from '../lib/formatters'
import {
  CheckSquare,
  MapPin,
  Clock,
  Volume2,
  ChevronRight,
  PackageMinus,
  AlertCircle
} from 'lucide-react'

export function WorkerJobsList() {
  const { currentProfile, isCaptain, assignedVehicle } = useAuth()
  const { jobs, inventory, deductMaterial } = useData()
  const [isDeductionModalOpen, setIsDeductionModalOpen] = useState(false)

  // Isolated tasks: Only tasks assigned to this technician
  const myJobs = jobs.filter(j => j.assigned_worker_id === currentProfile.id)

  return (
    <div className="space-y-4">
      
      {/* Header & Captain Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Assigned Work Orders
          </h2>
          <p className="text-[11px] text-slate-500">
            {myJobs.length} active task assignments for today
          </p>
        </div>

        {/* Daily Captain Material Deduction Trigger */}
        {isCaptain && (
          <button
            onClick={() => setIsDeductionModalOpen(true)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
          >
            <PackageMinus size={14} />
            <span>Log Material</span>
          </button>
        )}
      </div>

      {/* Task List */}
      {myJobs.length === 0 ? (
        <div className="worker-card p-8 text-center space-y-2">
          <CheckSquare size={28} className="mx-auto text-slate-300" />
          <p className="text-xs font-bold text-slate-700">No Assigned Tasks</p>
          <p className="text-[11px] text-slate-400">
            You are all caught up. Check back when operations dispatches new work orders.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {myJobs.map(job => (
            <Link
              key={job.id}
              to={`/worker/job/${job.id}`}
              className="worker-card p-4 block hover:border-slate-300 transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <Badge variant={job.status} size="sm" />
                {job.admin_voice_note_url && (
                  <span className="bg-purple-50 text-purple-700 font-bold text-[10px] px-1.5 py-0.5 rounded flex items-center space-x-1">
                    <Volume2 size={11} />
                    <span>Admin Audio Memo</span>
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 leading-snug">
                  {job.title}
                </h3>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">
                  {job.client_name}
                </p>
                <p className="text-[11px] text-slate-500 flex items-center mt-1">
                  <MapPin size={12} className="mr-1 text-slate-400 shrink-0" />
                  <span className="truncate">{job.address_text}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center">
                  <Clock size={12} className="mr-1 text-slate-400" />
                  Scheduled: {job.scheduled_date ? formatTime(job.scheduled_date) : 'Today'}
                </span>
                <span className="font-bold text-slate-900 flex items-center text-xs">
                  <span>Open Task</span>
                  <ChevronRight size={14} className="ml-0.5 text-slate-400" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Material Deduction Modal for Captains */}
      {isCaptain && (
        <MaterialDeductionModal
          isOpen={isDeductionModalOpen}
          onClose={() => setIsDeductionModalOpen(false)}
          inventory={inventory}
          captainId={currentProfile.id}
          defaultVehicle={assignedVehicle}
          jobs={myJobs}
          onDeduct={deductMaterial}
        />
      )}
    </div>
  )
}
