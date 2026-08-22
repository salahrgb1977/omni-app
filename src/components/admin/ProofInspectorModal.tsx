import React from 'react'
import { Job } from '../../types/omni'
import { Badge } from '../common/Badge'
import { formatDateTime, formatCurrency, formatDuration } from '../../lib/formatters'
import { useI18n } from '../../contexts/I18nContext'
import {
  X,
  CheckCircle,
  MapPin,
  Clock,
  User,
  Mic,
  Volume2,
  FileText,
  DollarSign,
  AlertCircle
} from 'lucide-react'

interface ProofInspectorModalProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
  onToggleClientPaid?: (jobId: string, isPaid: boolean) => void
}

export function ProofInspectorModal({
  job,
  isOpen,
  onClose,
  onToggleClientPaid
}: ProofInspectorModalProps) {
  const { t } = useI18n()
  if (!isOpen || !job) return null

  // Calculate task duration
  const taskDuration = job.task_duration_minutes
    ? `${job.task_duration_minutes} mins`
    : job.before_photo_taken_at && job.after_photo_taken_at
      ? formatDuration(job.before_photo_taken_at, job.after_photo_taken_at)
      : t('jobs.status_in_progress', 'قيد التنفيذ')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-20">
          <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse min-w-0">
            <div className="truncate">
              <div className="flex items-center space-x-1.5 sm:space-x-2 rtl:space-x-reverse mb-1">
                <Badge variant={job.status} size="sm" />
                {job.is_client_paid ? (
                  <Badge variant="paid" size="sm" label={t('jobs.invoice_paid', 'الفاتورة مسددة')} />
                ) : (
                  <Badge variant="unpaid" size="sm" label={t('jobs.invoice_pending', 'الفاتورة قيد الانتظار')} />
                )}
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {job.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6">
          
          {/* Summary Details Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
            <div className="admin-card p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {t('proof.client_location', 'العميل والموقع')}
              </span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">{job.client_name}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 flex items-center">
                <MapPin size={12} className="mr-1 rtl:mr-0 rtl:ml-1 text-slate-400 shrink-0" />
                <span className="truncate">{job.address_text}</span>
              </p>
            </div>

            <div className="admin-card p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {t('proof.assigned_tech', 'الفني المسند')}
              </span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">
                {job.assigned_worker_name || t('map.unassigned', 'غير مسند')}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 flex items-center">
                <Clock size={12} className="mr-1 rtl:mr-0 rtl:ml-1 text-slate-400 shrink-0" />
                <span>{t('jobs.duration_label', 'المدة:')}</span>
                <strong className="mx-1 text-slate-900 font-mono">{taskDuration}</strong>
              </p>
            </div>

            <div className="admin-card p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {t('proof.invoice_total', 'إجمالي الفاتورة')}
                </span>
                <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                  {formatCurrency(job.client_price)}
                </p>
              </div>

              {onToggleClientPaid && (
                <button
                  onClick={() => onToggleClientPaid(job.id, !job.is_client_paid)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
                    job.is_client_paid 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' 
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {job.is_client_paid ? t('proof.mark_unpaid', 'تحديد كمعلق') : t('proof.mark_paid', 'تحديد كمسدد')}
                </button>
              )}
            </div>
          </div>

          {/* Admin Voice Briefing (if present) */}
          {job.admin_voice_note_url && (
            <div className="admin-card p-3.5 sm:p-4 bg-slate-50 border-slate-200">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-bold uppercase text-slate-700 mb-2">
                <Volume2 size={15} className="text-slate-800" />
                <span>{t('proof.admin_briefing_title', 'التوجيه الصوتي من الإدارة للفني')}</span>
              </div>
              <audio src={job.admin_voice_note_url} controls className="w-full h-8" />
            </div>
          )}

          {/* SIDE-BY-SIDE BEFORE & AFTER PROOF PHOTOS */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('proof.visual_comparison', 'الإثبات المرئي للعمل (قبل وبعد الصيانة)')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* BEFORE PHOTO */}
              <div className="admin-card overflow-hidden">
                <div className="p-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 uppercase">
                    {t('proof.before_service', 'قبل بدء العمل')}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {job.before_photo_taken_at ? formatDateTime(job.before_photo_taken_at) : '---'}
                  </span>
                </div>

                <div className="relative aspect-video bg-slate-100 flex items-center justify-center">
                  {job.before_photo_url ? (
                    <>
                      <img src={job.before_photo_url} alt="Before" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 rtl:left-auto rtl:right-2 bg-black/75 text-white text-[10px] font-mono px-2 py-1 rounded">
                        GPS: {job.before_lat ? `${job.before_lat.toFixed(4)}, ${job.before_lng?.toFixed(4)}` : t('proof.gps_logged', 'تم تسجيل الإحداثيات')}
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">
                      {t('proof.no_before', 'لم يتم التقاط صورة قبل البدء')}
                    </span>
                  )}
                </div>
              </div>

              {/* AFTER PHOTO */}
              <div className="admin-card overflow-hidden">
                <div className="p-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase">
                    {t('proof.after_service', 'بعد إنجاز العمل')}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {job.after_photo_taken_at ? formatDateTime(job.after_photo_taken_at) : '---'}
                  </span>
                </div>

                <div className="relative aspect-video bg-slate-100 flex items-center justify-center">
                  {job.after_photo_url ? (
                    <>
                      <img src={job.after_photo_url} alt="After" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 rtl:left-auto rtl:right-2 bg-black/75 text-white text-[10px] font-mono px-2 py-1 rounded">
                        GPS: {job.after_lat ? `${job.after_lat.toFixed(4)}, ${job.after_lng?.toFixed(4)}` : t('proof.gps_logged', 'تم تسجيل الإحداثيات')}
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">
                      {t('proof.no_after', 'لم يتم التقاط صورة بعد الإنجاز')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* TECHNICIAN REPORT & AUDIO MEMO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Written Note */}
            <div className="admin-card p-3.5 sm:p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                {t('proof.tech_report', 'تقرير الفني الكتابي')}
              </h4>
              {job.worker_note ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 leading-relaxed font-medium">
                  {job.worker_note}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-400">
                  {t('proof.no_text_report', 'لم تتم كتابة تقرير نصي.')}
                </div>
              )}
            </div>

            {/* Voice Memo Audio Player */}
            <div className="admin-card p-3.5 sm:p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                {t('proof.tech_voice_memo', 'التسجيل الصوتي للفني')}
              </h4>
              {job.worker_voice_memo_url ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-xs font-bold text-emerald-700">
                    <Mic size={14} />
                    <span>{t('proof.voice_attached', 'تم إرفاق تسجيل صوتي')}</span>
                  </div>
                  <audio src={job.worker_voice_memo_url} controls className="w-full h-8" />
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-400">
                  {t('proof.no_voice_memo', 'لا يوجد تسجيل صوتي مرفق.')}
                </div>
              )}
            </div>
          </div>

          {/* Scope of Work */}
          {job.task_description && (
            <div className="admin-card p-3.5 sm:p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                {t('proof.scope_instructions', 'نطاق العمل والتعليمات الأولية')}
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {job.task_description}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors text-center"
          >
            {t('proof.close', 'إغلاق الفاحص')}
          </button>
        </div>
      </div>
    </div>
  )
}
