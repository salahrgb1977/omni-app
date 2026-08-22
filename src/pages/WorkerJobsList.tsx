import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { useI18n } from '../contexts/I18nContext'
import { Badge } from '../components/common/Badge'
import { MaterialDeductionModal } from '../components/worker/MaterialDeductionModal'
import { formatTime, formatVehicle } from '../lib/formatters'
import {
  CheckSquare,
  MapPin,
  Clock,
  Volume2,
  ChevronRight,
  ChevronLeft,
  PackageMinus,
  AlertCircle
} from 'lucide-react'

export function WorkerJobsList() {
  const { currentProfile, isCaptain, assignedVehicle } = useAuth()
  const { jobs, inventory, deductMaterial } = useData()
  const { t, isRTL } = useI18n()
  const [isDeductionModalOpen, setIsDeductionModalOpen] = useState(false)

  // Isolated tasks: Only tasks assigned to this technician
  const myJobs = jobs.filter(j => j.assigned_worker_id === currentProfile.id)
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      
      {/* Header & Captain Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {t('worker.assigned_tasks', 'أوامر العمل المسندة')}
          </h2>
          <p className="text-[11px] text-slate-500">
            {myJobs.length} {t('worker.active_tasks_today', 'مهام عمل مسندة لليوم')}
          </p>
        </div>

        {/* Daily Captain Material Deduction Trigger */}
        {isCaptain && (
          <button
            onClick={() => setIsDeductionModalOpen(true)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 rtl:space-x-reverse shadow-sm transition-colors"
          >
            <PackageMinus size={14} />
            <span>{t('worker.log_material_btn', 'تسجيل خصم قطع')}</span>
          </button>
        )}
      </div>

      {/* Task List */}
      {myJobs.length === 0 ? (
        <div className="worker-card p-8 text-center space-y-2">
          <CheckSquare size={28} className="mx-auto text-slate-300" />
          <p className="text-xs font-bold text-slate-700">{t('worker.no_tasks', 'لا توجد مهام مسندة حالياً')}</p>
          <p className="text-[11px] text-slate-400">
            {t('worker.no_tasks_desc', 'أنت منجز لكافة المهام. تفقد التطبيق عند إرسال الإدارة لأوامر جديدة.')}
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
                  <span className="bg-purple-50 text-purple-700 font-bold text-[10px] px-1.5 py-0.5 rounded flex items-center space-x-1 rtl:space-x-reverse">
                    <Volume2 size={11} />
                    <span>{t('jobs.admin_briefing', 'توجيه الإدارة')}</span>
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
                  <MapPin size={12} className="mr-1 rtl:mr-0 rtl:ml-1 text-slate-400 shrink-0" />
                  <span className="truncate">{job.address_text}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center">
                  <Clock size={12} className="mr-1 rtl:mr-0 rtl:ml-1 text-slate-400" />
                  {t('worker.scheduled_for', 'الموعد:')} {job.scheduled_date ? formatTime(job.scheduled_date) : t('worker.today', 'اليوم')}
                </span>
                <span className="font-bold text-slate-900 flex items-center text-xs space-x-0.5 rtl:space-x-reverse">
                  <span>{t('worker.open_task', 'فتح المهمة')}</span>
                  <ChevronIcon size={14} className="text-slate-400" />
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
