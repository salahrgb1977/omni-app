import React, { useState, useRef } from 'react'
import { Profile, Job } from '../../types/omni'
import { X, PlusCircle, Mic, Square, Volume2, User, DollarSign, MapPin } from 'lucide-react'

interface CreateJobModalProps {
  profiles: Profile[]
  isOpen: boolean
  onClose: () => void
  onCreateJob: (jobData: Partial<Job>) => void
}

export function CreateJobModal({
  profiles,
  isOpen,
  onClose,
  onCreateJob
}: CreateJobModalProps) {
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

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAdminVoiceUrl(audioUrl)
        stream.getTracks().forEach(t => t.stop())
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !clientName.trim() || !addressText.trim()) return

    onCreateJob({
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
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <PlusCircle size={18} className="text-slate-900" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Dispatch New Work Order
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Job Title / Service *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Commercial Condenser Fan Motor Replacement"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Client / Facility Name *
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="e.g. Austin Medical Tower"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Assign Technician
              </label>
              <select
                value={assignedWorkerId}
                onChange={e => setAssignedWorkerId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="">-- Unassigned Queue --</option>
                {workers.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.full_name} ({w.assigned_vehicle === 'van_1' ? 'Van 1' : 'Van 2'}{w.is_daily_captain ? ' · Captain' : ''})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Service Address *
            </label>
            <input
              type="text"
              required
              value={addressText}
              onChange={e => setAddressText(e.target.value)}
              placeholder="e.g. 1100 Colorado St, Austin, TX"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Task Instructions & Scope
            </label>
            <textarea
              rows={2}
              value={taskDescription}
              onChange={e => setTaskDescription(e.target.value)}
              placeholder="Detail HVAC diagnostic steps, unit model, roof access instructions..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Admin Voice Memo Briefing */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <span className="block text-xs font-bold uppercase text-slate-600">
              Admin Voice Briefing (Optional)
            </span>
            <p className="text-[11px] text-slate-500">
              Record a quick audio note for the assigned technician to listen to in the field.
            </p>

            <div className="flex items-center space-x-3">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startAdminRecording}
                  className="px-3 py-1.5 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center space-x-1.5 transition-colors"
                >
                  <Mic size={14} />
                  <span>{adminVoiceUrl ? 'Re-record Briefing' : 'Record Audio Briefing'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopAdminRecording}
                  className="px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors animate-pulse"
                >
                  <Square size={14} />
                  <span>Stop Recording</span>
                </button>
              )}

              {adminVoiceUrl && (
                <div className="flex-1">
                  <audio src={adminVoiceUrl} controls className="w-full h-8" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Client Invoice Price ($)
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
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
            >
              Dispatch Work Order
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
