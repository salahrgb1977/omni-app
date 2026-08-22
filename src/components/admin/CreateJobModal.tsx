import React, { useState, useRef } from 'react'
import { Profile, Job } from '../../types/omni'
import { uploadVoiceBriefing } from '../../lib/supabase'
import { useI18n } from '../../contexts/I18nContext'
import { X, PlusCircle, Mic, Square, Volume2, User, DollarSign, MapPin, UploadCloud } from 'lucide-react'

interface CreateJobModalProps {
  profiles: Profile[]
  isOpen: boolean
  onClose: () => void
  onCreateJob: (jobData: Partial<Job>) => Promise<Job>
}

export function CreateJobModal({
  profiles,
  isOpen,
  onClose,
  onCreateJob
}: CreateJobModalProps) {
  const { t } = useI18n()
  if (!isOpen) return null

  const [title, setTitle] = useState('')
  const [clientName, setClientName] = useState('')
  const [addressText, setAddressText] = useState('')
  const [assignedWorkerId, setAssignedWorkerId] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [clientPrice, setClientPrice] = useState('480.00')
  const [adminVoiceUrl, setAdminVoiceUrl] = useState<string | null>(null)
  
  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [isUploadingVoice, setIsUploadingVoice] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])

  const workers = profiles.filter(p => p.role === 'worker')

  const startAdminRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorder.current = recorder
      audioChunks.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data)
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' })
        const localAudioUrl = URL.createObjectURL(audioBlob)
        setAdminVoiceUrl(localAudioUrl)
        setIsUploadingVoice(true)

        try {
          // Upload to Supabase Storage 'voice-briefings' bucket
          const storageUrl = await uploadVoiceBriefing(audioBlob, `briefing-${Date.now()}.webm`)
          if (storageUrl) {
            setAdminVoiceUrl(storageUrl)
          }
        } finally {
          setIsUploadingVoice(false)
          stream.getTracks().forEach(t => t.stop())
        }
      }

      recorder.start()
      setIsRecording(true)
    } catch {
      alert('Microphone access not available.')
    }
  }

  const stopAdminRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop()
      setIsRecording(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !clientName.trim() || !addressText.trim()) return

    setIsSubmitting(true)
    try {
      await onCreateJob({
        title,
        client_name: clientName,
        address_text: addressText,
        assigned_worker_id: assignedWorkerId || undefined,
        task_description: taskDescription,
        client_price: Number(clientPrice) || 0,
        admin_voice_note_url: adminVoiceUrl,
        scheduled_date: new Date().toISOString()
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-20">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <PlusCircle size={18} className="text-slate-900" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
              {t('create_job.title', 'إسناد أمر عمل جديد')}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              {t('create_job.service_title', 'عنوان الخدمة / المهمة *')}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t('create_job.service_placeholder', 'مثال: استبدال محرك مروحة المكثف التجاري')}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                {t('create_job.client_name', 'اسم العميل / المنشأة *')}
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder={t('create_job.client_placeholder', 'مثال: برج المعادي الطبي')}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                {t('create_job.assign_tech', 'إسناد لفني')}
              </label>
              <select
                value={assignedWorkerId}
                onChange={e => setAssignedWorkerId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="">{t('create_job.unassigned_queue', '-- قائمة الانتظار (غير مسند) --')}</option>
                {workers.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.full_name} ({w.assigned_vehicle === 'van_1' ? t('badge.van_1', 'شاحنة 1') : t('badge.van_2', 'شاحنة 2')}{w.is_daily_captain ? ` · ${t('badge.captain', 'قائد')}` : ''})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              {t('create_job.service_address', 'عنوان الموقع *')}
            </label>
            <input
              type="text"
              required
              value={addressText}
              onChange={e => setAddressText(e.target.value)}
              placeholder={t('create_job.service_address_placeholder', 'مثال: 1100 شارع النصر، القاهرة')}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              {t('create_job.scope', 'تعليمات العمل والنطاق')}
            </label>
            <textarea
              rows={2}
              value={taskDescription}
              onChange={e => setTaskDescription(e.target.value)}
              placeholder={t('create_job.scope_placeholder', 'تفاصيل خطوات التشخيص، طراز الوحدة، تعليمات الوصول للسطح...')}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Admin Voice Memo Briefing */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <span className="block text-xs font-bold uppercase text-slate-600">
              {t('create_job.admin_voice', 'توجيه صوتي من الإدارة (اختياري)')}
            </span>
            <p className="text-[11px] text-slate-500">
              {t('create_job.admin_voice_desc', 'تسجيل ملاحظة صوتية سريعة للفني ليسمعها في الميدان.')}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startAdminRecording}
                  className="px-3 py-1.5 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center space-x-1.5 rtl:space-x-reverse transition-colors"
                >
                  <Mic size={14} />
                  <span>
                    {adminVoiceUrl
                      ? t('create_job.rerecord_voice', 'إعادة التسجيل')
                      : t('create_job.record_voice', 'تسجيل توجيه صوتي')}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopAdminRecording}
                  className="px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 rtl:space-x-reverse transition-colors animate-pulse"
                >
                  <Square size={14} />
                  <span>{t('create_job.stop_record', 'إيقاف التسجيل')}</span>
                </button>
              )}

              {isUploadingVoice && (
                <span className="text-xs text-slate-500 flex items-center">
                  <UploadCloud size={14} className="animate-spin mr-1 rtl:mr-0 rtl:ml-1" />
                  {t('create_job.uploading_voice', 'جاري الرفع...')}
                </span>
              )}

              {adminVoiceUrl && !isUploadingVoice && (
                <div className="flex-1 min-w-[180px]">
                  <audio src={adminVoiceUrl} controls className="w-full h-8" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              {t('create_job.invoice_price', 'سعر الفاتورة للعميل ($)')}
            </label>
            <input
              type="number"
              step="0.01"
              value={clientPrice}
              onChange={e => setClientPrice(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2 rtl:space-x-reverse">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              {t('create_job.cancel', 'إلغاء')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingVoice}
              className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold"
            >
              {isSubmitting
                ? t('create_job.submitting', 'جاري الإرسال...')
                : t('create_job.submit', 'إرسال أمر العمل')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
