import React, { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useI18n } from '../../contexts/I18nContext'
import { ProofInspectorModal } from '../../components/admin/ProofInspectorModal'
import { Badge } from '../../components/common/Badge'
import { Job, JobStatus } from '../../types/omni'
import { formatCurrency, formatDuration } from '../../lib/formatters'
import {
  CheckSquare,
  Search,
  Filter,
  Eye,
  Camera,
  Mic,
  Volume2,
  DollarSign,
  MapPin,
  Clock,
  User
} from 'lucide-react'

export function AdminJobs() {
  const { jobs, setJobClientPaid } = useData()
  const { t } = useI18n()
  const [statusFilter, setStatusFilter] = useState<'all' | JobStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  const filteredJobs = jobs.filter(j => {
    if (statusFilter !== 'all' && j.status !== statusFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        j.title.toLowerCase().includes(q) ||
        j.client_name.toLowerCase().includes(q) ||
        j.address_text.toLowerCase().includes(q) ||
        (j.assigned_worker_name && j.assigned_worker_name.toLowerCase().includes(q))
      )
    }
    return true
  })

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150">
      
      {/* Header & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900">
            {t('jobs.title_page', 'أوامر العمل والتحقق من الإثباتات المرئية')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('jobs.desc_page', 'مراجعة أختام صور قبل وبعد وتوقيتات الإنجاز والملاحظات الصوتية.')}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 rtl:space-x-reverse bg-slate-200 p-1 rounded-lg text-xs font-bold self-start sm:self-auto overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {t('jobs.status_all', 'الكل')} ({jobs.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${statusFilter === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {t('jobs.status_pending', 'قيد الانتظار')} ({jobs.filter(j => j.status === 'pending').length})
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${statusFilter === 'in_progress' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {t('jobs.status_in_progress', 'قيد التنفيذ')} ({jobs.filter(j => j.status === 'in_progress').length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${statusFilter === 'completed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {t('jobs.status_completed', 'مكتملة')} ({jobs.filter(j => j.status === 'completed').length})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={t('jobs.search_filter', 'تصفية حسب اسم المهمة، منشأة العميل، العنوان، أو الفني...')}
          className="w-full bg-white border border-slate-200 rounded-lg pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-subtle"
        />
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {filteredJobs.map(job => {
          const duration = job.task_duration_minutes
            ? `${job.task_duration_minutes}m`
            : job.before_photo_taken_at && job.after_photo_taken_at
              ? formatDuration(job.before_photo_taken_at, job.after_photo_taken_at)
              : '—'

          return (
            <div
              key={job.id}
              className="admin-card p-3.5 sm:p-4 flex flex-col justify-between hover:border-slate-300 transition-all space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={job.status} size="sm" />
                  <span className="font-mono font-bold text-xs text-slate-900">
                    {formatCurrency(job.client_price)}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">
                  {job.client_name}
                </p>
                <p className="text-[11px] text-slate-500 flex items-center mt-1 truncate">
                  <MapPin size={11} className="mr-1 rtl:mr-0 rtl:ml-1 text-slate-400 shrink-0" />
                  <span className="truncate">{job.address_text}</span>
                </p>
              </div>

              {/* Photo Proof Thumbnails & Audio Indicators */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">{t('jobs.tech_label', 'الفني:')} <strong className="text-slate-800">{job.assigned_worker_name || t('map.unassigned', 'غير مسند')}</strong></span>
                  <span className="text-slate-500 font-mono">{t('jobs.duration_label', 'المدة:')} <strong className="text-slate-800">{duration}</strong></span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-slate-600">
                  {/* Before Photo indicator */}
                  <span className={`px-1.5 py-0.5 rounded flex items-center space-x-1 rtl:space-x-reverse ${job.before_photo_url ? 'bg-slate-100 text-slate-800 font-bold' : 'bg-slate-50 text-slate-400'}`}>
                    <Camera size={11} />
                    <span>{t('jobs.before', 'قبل')}</span>
                  </span>

                  {/* After Photo indicator */}
                  <span className={`px-1.5 py-0.5 rounded flex items-center space-x-1 rtl:space-x-reverse ${job.after_photo_url ? 'bg-emerald-50 text-emerald-800 font-bold' : 'bg-slate-50 text-slate-400'}`}>
                    <Camera size={11} />
                    <span>{t('jobs.after', 'بعد')}</span>
                  </span>

                  {/* Voice Memo indicator */}
                  {job.worker_voice_memo_url && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 font-bold flex items-center space-x-1 rtl:space-x-reverse">
                      <Mic size={11} />
                      <span>{t('jobs.voice_memo', 'ملاحظة صوتية')}</span>
                    </span>
                  )}

                  {/* Admin Voice Briefing indicator */}
                  {job.admin_voice_note_url && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 font-bold flex items-center space-x-1 rtl:space-x-reverse">
                      <Volume2 size={11} />
                      <span>{t('jobs.admin_briefing', 'توجيه')}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold">
                  {job.is_client_paid ? (
                    <span className="text-emerald-700">{t('jobs.invoice_paid', 'الفاتورة مسددة')}</span>
                  ) : (
                    <span className="text-amber-700">{t('jobs.invoice_pending', 'الفاتورة قيد الانتظار')}</span>
                  )}
                </span>

                <button
                  onClick={() => setSelectedJob(job)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs flex items-center space-x-1 rtl:space-x-reverse transition-colors"
                >
                  <Eye size={12} />
                  <span>{t('jobs.inspect_proof', 'فحص الإثبات')}</span>
                </button>
              </div>
            </div>
          )
        })}
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
