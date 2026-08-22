import React, { useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { useI18n } from '../contexts/I18nContext'
import { Badge } from '../components/common/Badge'
import { formatDateTime, formatTime } from '../lib/formatters'
import { uploadJobProof } from '../lib/supabase'
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Mic,
  Square,
  Volume2,
  MapPin,
  Clock,
  FileText,
  AlertCircle,
  Lock,
  UploadCloud
} from 'lucide-react'

export function WorkerJobDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentProfile } = useAuth()
  const {
    jobs,
    startJobBeforePhoto,
    setJobAfterPhoto,
    submitJobReport,
    completeJob
  } = useData()
  const { t, isRTL } = useI18n()

  const job = jobs.find(j => j.id === id)

  // Local state for text report and audio recording
  const [textNote, setTextNote] = useState(job?.worker_note || '')
  const [workerVoiceUrl, setWorkerVoiceUrl] = useState<string | null>(job?.worker_voice_memo_url || null)
  const [isRecording, setIsRecording] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])

  const ArrowBackIcon = isRTL ? ArrowRight : ArrowLeft

  if (!job) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm font-bold text-slate-700">{t('worker.no_tasks', 'أمر العمل غير موجود.')}</p>
        <Link to="/worker" className="text-xs font-bold text-slate-900 underline">
          {t('worker.back_to_tasks', 'العودة للمهام')}
        </Link>
      </div>
    )
  }

  // Guard: Worker can only view jobs assigned to them
  if (job.assigned_worker_id && job.assigned_worker_id !== currentProfile.id) {
    return (
      <div className="p-8 text-center space-y-3">
        <AlertCircle size={28} className="mx-auto text-amber-500" />
        <p className="text-sm font-bold text-slate-700">Access Restricted</p>
        <p className="text-xs text-slate-500">
          This task is assigned to another technician.
        </p>
        <Link to="/worker" className="text-xs font-bold text-slate-900 underline">
          {t('worker.back_to_tasks', 'العودة للمهام')}
        </Link>
      </div>
    )
  }

  const isCompleted = job.status === 'completed'
  const hasBefore = Boolean(job.before_photo_url)
  const hasAfter = Boolean(job.after_photo_url)
  const hasReport = (textNote && textNote.trim().length > 5) || Boolean(workerVoiceUrl)

  // Hard Completion Gate: Both photos exist AND (text note > 5 chars OR voice memo exists)
  const canComplete = hasBefore && hasAfter && hasReport && !isCompleted

  // STEP 1: Handle Before Photo Capture & Direct Storage Upload
  const handleBeforePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingPhoto(true)
    try {
      const storageUrl = await uploadJobProof(file, `before-${job.id}.jpg`)
      const reader = new FileReader()
      reader.onload = () => {
        const finalUrl = storageUrl || (reader.result as string)
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            pos => startJobBeforePhoto(job.id, finalUrl, pos.coords.latitude, pos.coords.longitude),
            () => startJobBeforePhoto(job.id, finalUrl, 30.2673, -97.7430)
          )
        } else {
          startJobBeforePhoto(job.id, finalUrl, 30.2673, -97.7430)
        }
      }
      reader.readAsDataURL(file)
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  // STEP 2: Handle After Photo Capture & Direct Storage Upload
  const handleAfterPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingPhoto(true)
    try {
      const storageUrl = await uploadJobProof(file, `after-${job.id}.jpg`)
      const reader = new FileReader()
      reader.onload = () => {
        const finalUrl = storageUrl || (reader.result as string)
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            pos => setJobAfterPhoto(job.id, finalUrl, pos.coords.latitude, pos.coords.longitude),
            () => setJobAfterPhoto(job.id, finalUrl, 30.2673, -97.7430)
          )
        } else {
          setJobAfterPhoto(job.id, finalUrl, 30.2673, -97.7430)
        }
      }
      reader.readAsDataURL(file)
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  // STEP 3: Voice Memo Recording & Direct Storage Upload
  const startRecordingMemo = async () => {
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
        setWorkerVoiceUrl(localAudioUrl)

        const storageUrl = await uploadJobProof(audioBlob, `memo-${job.id}.webm`)
        const finalUrl = storageUrl || localAudioUrl

        setWorkerVoiceUrl(finalUrl)
        submitJobReport(job.id, textNote, finalUrl)
        stream.getTracks().forEach(t => t.stop())
      }

      recorder.start()
      setIsRecording(true)
    } catch {
      alert('Microphone access unavailable on this device.')
    }
  }

  const stopRecordingMemo = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop()
      setIsRecording(false)
    }
  }

  // STEP 4: Submit & Lock Job
  const handleFinalSubmit = async () => {
    if (!canComplete) return
    setIsSubmitting(true)

    submitJobReport(job.id, textNote, workerVoiceUrl || undefined)

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async pos => {
          await completeJob(job.id, pos.coords.latitude, pos.coords.longitude)
          setIsSubmitting(false)
          navigate('/worker')
        },
        async () => {
          await completeJob(job.id, 30.2673, -97.7430)
          setIsSubmitting(false)
          navigate('/worker')
        }
      )
    } else {
      await completeJob(job.id, 30.2673, -97.7430)
      setIsSubmitting(false)
      navigate('/worker')
    }
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <Link
          to="/worker"
          className="inline-flex items-center text-xs font-bold text-slate-700 hover:text-slate-900 space-x-1 rtl:space-x-reverse"
        >
          <ArrowBackIcon size={14} />
          <span>{t('worker.back_to_tasks', 'العودة لقائمة المهام')}</span>
        </Link>
        <Badge variant={job.status} size="sm" />
      </div>

      {/* Task Overview Card */}
      <div className="worker-card p-4 space-y-2">
        <h1 className="font-bold text-base text-slate-900 leading-snug">
          {job.title}
        </h1>
        <p className="text-xs font-bold text-slate-700">
          {job.client_name}
        </p>
        <p className="text-xs text-slate-500 flex items-center">
          <MapPin size={13} className="mr-1 rtl:mr-0 rtl:ml-1 text-slate-400 shrink-0" />
          <span>{job.address_text}</span>
        </p>

        {job.task_description && (
          <div className="mt-2 pt-2 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase text-slate-400">
              {t('proof.scope_instructions', 'نطاق العمل والتعليمات:')}
            </p>
            <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
              {job.task_description}
            </p>
          </div>
        )}
      </div>

      {/* Admin Voice Briefing (if present) */}
      {job.admin_voice_note_url && (
        <div className="worker-card p-3.5 bg-slate-900 text-white space-y-2">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-bold uppercase text-slate-200">
            <Volume2 size={15} className="text-blue-400" />
            <span>{t('jobs.admin_briefing', 'توجيه الإدارة الصوتي')}</span>
          </div>
          <audio src={job.admin_voice_note_url} controls className="w-full h-8" />
        </div>
      )}

      {/* 4-STEP ACCOUNTABILITY TASK CHECKLIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {t('jobs.title_page', 'توثيق وإثبات تنفيذ المهمة')}
          </h2>
          {isCompleted && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {t('worker.job_verified', 'مكتمل وموثق')}
            </span>
          )}
        </div>

        {/* STEP 1: BEFORE PHOTO */}
        <div className={`worker-card p-4 space-y-2.5 ${hasBefore ? 'border-emerald-200 bg-emerald-50/20' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${hasBefore ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                1
              </span>
              <span className="text-xs font-bold text-slate-900 uppercase">
                {t('worker.step1_title', 'الخطوة 1: صورة قبل بدء الخدمة')}
              </span>
            </div>
            {hasBefore && <CheckCircle2 size={16} className="text-emerald-600" />}
          </div>

          {job.before_photo_url ? (
            <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200">
              <img src={job.before_photo_url} alt="Before" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 rtl:left-auto rtl:right-2 bg-black/75 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                {t('jobs.before', 'تم الالتقاط:')} {formatTime(job.before_photo_taken_at)}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-500 mb-2">
                {t('worker.step1_desc', 'التقط صورة لحالة الوحدة قبل بدء إجراءات الصيانة.')}
              </p>
              <label className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-2 rtl:space-x-reverse cursor-pointer transition-colors">
                {isUploadingPhoto ? <UploadCloud size={14} className="animate-spin" /> : <Camera size={14} />}
                <span>{isUploadingPhoto ? t('create_job.uploading_voice', 'جاري الرفع...') : t('worker.capture_before', 'التقاط صورة قبل البدء')}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleBeforePhotoChange}
                />
              </label>
            </div>
          )}
        </div>

        {/* STEP 2: AFTER PHOTO */}
        <div className={`worker-card p-4 space-y-2.5 ${hasAfter ? 'border-emerald-200 bg-emerald-50/20' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${hasAfter ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                2
              </span>
              <span className="text-xs font-bold text-slate-900 uppercase">
                {t('worker.step2_title', 'الخطوة 2: صورة بعد إنجاز الخدمة')}
              </span>
            </div>
            {hasAfter && <CheckCircle2 size={16} className="text-emerald-600" />}
          </div>

          {job.after_photo_url ? (
            <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200">
              <img src={job.after_photo_url} alt="After" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 rtl:left-auto rtl:right-2 bg-black/75 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                {t('jobs.after', 'تم الالتقاط:')} {formatTime(job.after_photo_taken_at)}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-500 mb-2">
                {t('worker.step2_desc', 'التقط صورة للوحدة بعد الإصلاح ونظافة مكان العمل.')}
              </p>
              <label className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 rtl:space-x-reverse transition-colors ${
                !hasBefore
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
              }`}>
                {isUploadingPhoto ? <UploadCloud size={14} className="animate-spin" /> : <Camera size={14} />}
                <span>{isUploadingPhoto ? t('create_job.uploading_voice', 'جاري الرفع...') : t('worker.capture_after', 'التقاط صورة بعد الإنجاز')}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  disabled={!hasBefore}
                  className="hidden"
                  onChange={handleAfterPhotoChange}
                />
              </label>
            </div>
          )}
        </div>

        {/* STEP 3: TASK REPORT (TEXT NOTE OR VOICE MEMO) */}
        <div className={`worker-card p-4 space-y-3 ${hasReport ? 'border-emerald-200 bg-emerald-50/20' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${hasReport ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                3
              </span>
              <span className="text-xs font-bold text-slate-900 uppercase">
                {t('worker.step3_title', 'الخطوة 3: تقرير كتابي أو تسجيل صوتي')}
              </span>
            </div>
            {hasReport && <CheckCircle2 size={16} className="text-emerald-600" />}
          </div>

          {!isCompleted ? (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  {t('worker.written_notes', 'ملاحظات الفني الكتابية')}
                </label>
                <textarea
                  rows={3}
                  value={textNote}
                  onChange={e => {
                    setTextNote(e.target.value)
                    submitJobReport(job.id, e.target.value, workerVoiceUrl || undefined)
                  }}
                  placeholder={t('worker.written_placeholder', 'تفاصيل ما تم إنجازه، الضغوط المقاسة، القطع المستبدلة...')}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  {t('worker.or_voice_memo', 'أو سجل ملاحظة صوتية:')}
                </span>
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecordingMemo}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg flex items-center space-x-1.5 rtl:space-x-reverse transition-colors"
                  >
                    <Mic size={14} />
                    <span>{workerVoiceUrl ? t('create_job.rerecord_voice', 'إعادة التسجيل') : t('worker.record_audio', 'تسجيل ملاحظة صوتية')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecordingMemo}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg flex items-center space-x-1.5 rtl:space-x-reverse transition-colors animate-pulse"
                  >
                    <Square size={14} />
                    <span>{t('create_job.stop_record', 'إيقاف التسجيل')}</span>
                  </button>
                )}
              </div>

              {workerVoiceUrl && (
                <div className="p-2 bg-white border border-slate-200 rounded-lg">
                  <audio src={workerVoiceUrl} controls className="w-full h-8" />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {job.worker_note && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800">
                  {job.worker_note}
                </div>
              )}
              {job.worker_voice_memo_url && (
                <audio src={job.worker_voice_memo_url} controls className="w-full h-8" />
              )}
            </div>
          )}
        </div>

        {/* STEP 4: HARD COMPLETION GATE BUTTON */}
        {!isCompleted ? (
          <div className="pt-2">
            <button
              onClick={handleFinalSubmit}
              disabled={!canComplete || isSubmitting}
              className={`w-full py-3.5 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center space-x-2 rtl:space-x-reverse transition-all ${
                canComplete
                  ? 'bg-slate-900 hover:bg-slate-800 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {canComplete ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>{isSubmitting ? t('worker.submitting_job', 'جاري الإرسال والقفل...') : t('worker.submit_job', 'إرسال وتوثيق إنجاز المهمة')}</span>
                </>
              ) : (
                <>
                  <Lock size={15} />
                  <span>{t('worker.step4_unlock', 'أكمل الخطوات 1 و 2 و 3 لفتح زر الإنجاز')}</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-bold text-emerald-800">
            {t('worker.job_verified', '✓ تم إنجاز المهمة وإرسالها لمركز العمليات بنجاح')}
          </div>
        )}
      </div>
    </div>
  )
}
