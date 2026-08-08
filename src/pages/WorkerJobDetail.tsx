import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { MapPin, Camera, CheckCircle, ArrowLeft, Mic } from 'lucide-react'
import { Link } from 'react-router-dom'

export function WorkerJobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Task Report State
  const [taskNote, setTaskNote] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState('idle') // idle, uploading, done
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])

  useEffect(() => {
    fetchJob()
  }, [id])

  useEffect(() => {
    if (job?.task_note) setTaskNote(job.task_note)
  }, [job])

  const fetchJob = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`*, clients ( full_name, address_text )`)
        .eq('id', id)
        .single()
      
      if (error) throw error
      if (data) setJob(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const beforePhotoRef = useRef<HTMLInputElement>(null)
  const afterPhotoRef = useRef<HTMLInputElement>(null)

  const handleCheckIn = () => {
    setLoading(true)
    setError('')
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const { error } = await supabase
            .from('jobs')
            .update({ status: 'in_progress', check_in_lat: latitude, check_in_lng: longitude })
            .eq('id', id)
            
          if (error) throw error
          setJob({ ...job, status: 'in_progress', check_in_lat: latitude, check_in_lng: longitude })
        } catch (err: any) {
          setError(err.message || 'Failed to check in')
        } finally {
          setLoading(false)
        }
      },
      () => {
        setError('Failed to get location. Please allow location access.')
        setLoading(false)
      }
    )
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${job.id}-${type}-${Math.random()}.${fileExt}`
      const timestamp = new Date().toISOString()

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage.from('job-photos').upload(fileName, file)
      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage.from('job-photos').getPublicUrl(fileName)
      
      // Update Job Record with Photo URL and EXACT Timestamp
      const updates = { 
        [`${type}_photo_url`]: publicUrl,
        [`${type}_photo_taken_at`]: timestamp
      }
      
      const { error: updateError } = await supabase.from('jobs').update(updates).eq('id', id)
      if (updateError) throw updateError
      
      setJob({ ...job, ...updates })
    } catch (err: any) {
      setError(err.message || `Failed to upload ${type} photo`)
    } finally {
      setLoading(false)
    }
  }

  // Native Browser MediaRecorder Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorder.current = recorder
      audioChunks.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data)
      }

      recorder.onstop = async () => {
        setVoiceStatus('uploading')
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' })
        const fileName = `${job.id}-voice-${Date.now()}.webm`
        
        try {
          const { error: uploadError } = await supabase.storage.from('job-audio').upload(fileName, audioBlob)
          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage.from('job-audio').getPublicUrl(fileName)
          
          await supabase.from('jobs').update({ voice_memo_url: publicUrl }).eq('id', job.id)
          setJob((prev: any) => ({ ...prev, voice_memo_url: publicUrl }))
          setVoiceStatus('done')
        } catch (err: any) {
          setError('Failed to upload voice memo')
          setVoiceStatus('idle')
        }
        
        // Stop all tracks to turn off the OS microphone indicator
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setIsRecording(true)
    } catch (err) {
      setError('Microphone access denied. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop()
      setIsRecording(false)
    }
  }

  const handleComplete = async () => {
    // HARD GATE LOGIC 
    if (!job.before_photo_url || !job.after_photo_url) return
    if (taskNote.length <= 5 && !job.voice_memo_url) return
    
    setLoading(true)
    try {
      const { error } = await supabase.from('jobs').update({ 
        status: 'completed',
        task_note: taskNote 
      }).eq('id', id)
      
      if (error) throw error
      
      setJob({ ...job, status: 'completed', task_note: taskNote })
      navigate('/worker')
    } catch (err: any) {
      setError(err.message || 'Failed to complete job')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !job) return <div className="p-4 bg-slate-50 min-h-screen text-slate-500 font-medium">Loading job details...</div>
  if (!job) return <div className="p-4 bg-slate-50 min-h-screen text-slate-500 font-medium">Job not found.</div>

  // Boolean gate variables for UI disable logic
  const hasBothPhotos = !!(job.before_photo_url && job.after_photo_url)
  const hasValidReport = taskNote.length > 5 || !!job.voice_memo_url
  const canComplete = hasBothPhotos && hasValidReport

  return (
    <div className="flex flex-col min-h-full bg-slate-50 p-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <Link to="/worker" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to Jobs
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Job #{job.id.slice(0, 8)}</h1>
        <p className="text-lg font-bold text-slate-700 mt-2">{job.clients?.full_name}</p>
        <p className="text-sm font-medium text-slate-500 mt-1 flex items-center">
          <MapPin size={14} className="mr-1.5 text-indigo-500" />
          {job.clients?.address_text}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm font-medium shadow-sm">
          {error}
        </div>
      )}

      {/* Task Description */}
      <div className="premium-card p-5 mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Task Description</h3>
        <p className="text-slate-700 font-medium leading-relaxed">{job.task_description}</p>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        {job.status === 'pending' && (
          <button
            onClick={handleCheckIn}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 shadow hover:shadow-md text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:transform-none"
          >
            <MapPin size={20} />
            <span>Check In (GPS)</span>
          </button>
        )}

        {job.status === 'in_progress' && (
          <div className="space-y-4">
            
            {/* Before Photo */}
            <div className="premium-card p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Before Photo</h3>
              {job.before_photo_url ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                  <img src={job.before_photo_url} alt="Before" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-mono px-2 py-1 rounded">
                    {new Date(job.before_photo_taken_at).toLocaleTimeString()}
                  </div>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={beforePhotoRef}
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'before')}
                  />
                  <button
                    onClick={() => beforePhotoRef.current?.click()}
                    disabled={loading}
                    className="w-full border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50 text-slate-600 font-bold py-10 rounded-xl flex flex-col items-center justify-center space-y-3 transition-all disabled:opacity-50"
                  >
                    <Camera size={28} className="text-slate-400" />
                    <span>Capture Before Photo</span>
                  </button>
                </>
              )}
            </div>

            {/* After Photo */}
            <div className="premium-card p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">After Photo</h3>
              {job.after_photo_url ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                  <img src={job.after_photo_url} alt="After" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-mono px-2 py-1 rounded">
                    {new Date(job.after_photo_taken_at).toLocaleTimeString()}
                  </div>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={afterPhotoRef}
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'after')}
                  />
                  <button
                    onClick={() => afterPhotoRef.current?.click()}
                    disabled={loading}
                    className="w-full border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50 text-slate-600 font-bold py-10 rounded-xl flex flex-col items-center justify-center space-y-3 transition-all disabled:opacity-50"
                  >
                    <Camera size={28} className="text-slate-400" />
                    <span>Capture After Photo</span>
                  </button>
                </>
              )}
            </div>

            {/* Task Report Section */}
            <div className="premium-card p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Task Report</h3>
              <p className="text-sm text-slate-500 mb-4 font-medium leading-relaxed">Provide a text summary OR a voice memo detailing what was done on this job.</p>
              
              <textarea
                value={taskNote}
                onChange={(e) => setTaskNote(e.target.value)}
                placeholder="Job notes... (Min 5 chars)"
                className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none mb-4 min-h-[100px] text-slate-700 bg-slate-50 font-medium"
              />
              
              {!job.voice_memo_url ? (
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={voiceStatus === 'uploading'}
                  className={`w-full py-4 rounded-xl flex items-center justify-center font-bold transition-all ${
                    isRecording 
                      ? 'bg-rose-100 text-rose-600 border border-rose-200 animate-pulse' 
                      : voiceStatus === 'uploading' 
                        ? 'bg-slate-100 text-slate-400' 
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  <Mic size={20} className="mr-2" />
                  {isRecording ? 'Tap to Stop Recording' : voiceStatus === 'uploading' ? 'Uploading...' : 'Record Voice Memo'}
                </button>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex flex-col space-y-3">
                  <div className="flex items-center text-emerald-700 font-bold text-sm">
                    <Mic size={16} className="mr-2" />
                    Voice Memo Attached
                  </div>
                  <audio src={job.voice_memo_url} controls className="w-full h-10" />
                </div>
              )}
            </div>

            {/* Complete Job - The Hard Gate */}
            <button
              onClick={handleComplete}
              disabled={loading || !canComplete}
              className="w-full bg-teal-600 hover:bg-teal-700 hover:-translate-y-0.5 shadow hover:shadow-md text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none disabled:transform-none mt-6"
            >
              <CheckCircle size={20} />
              <span>{canComplete ? 'Complete Job' : 'Pending Requirements'}</span>
            </button>
          </div>
        )}

        {job.status === 'completed' && (
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8 text-center mt-6 shadow-sm">
            <CheckCircle size={48} className="text-teal-500 mx-auto mb-4" />
            <h3 className="text-xl font-extrabold text-teal-900 mb-1">Job Completed</h3>
            <p className="font-medium text-teal-600">Great work!</p>
          </div>
        )}
      </div>
    </div>
  )
}
