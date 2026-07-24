import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { MapPin, Camera, CheckCircle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function WorkerJobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchJob()
  }, [id])

  const fetchJob = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          clients ( full_name, address_text )
        `)
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
            .update({ 
              status: 'in_progress', 
              check_in_lat: latitude, 
              check_in_lng: longitude 
            })
            .eq('id', id)
            
          if (error) throw error
          
          setJob({ ...job, status: 'in_progress', check_in_lat: latitude, check_in_lng: longitude })
          console.log(`Checked in at ${latitude}, ${longitude}`)
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
      // Create a unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${job.id}-${type}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage.from('job-photos').upload(filePath, file)
      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage.from('job-photos').getPublicUrl(filePath)
      
      // Update Job Record
      const { error: updateError } = await supabase.from('jobs').update({ [`${type}_photo_url`]: publicUrl }).eq('id', id)
      if (updateError) throw updateError
      
      setJob({ ...job, [`${type}_photo_url`]: publicUrl })
    } catch (err: any) {
      setError(err.message || `Failed to upload ${type} photo`)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!job.before_photo_url || !job.after_photo_url) {
      setError('Both before and after photos are required to complete the job.')
      return
    }
    
    setLoading(true)
    try {
      const { error } = await supabase.from('jobs').update({ status: 'completed' }).eq('id', id)
      if (error) throw error
      
      setJob({ ...job, status: 'completed' })
      navigate('/worker')
    } catch (err: any) {
      setError(err.message || 'Failed to complete job')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !job) return <div className="p-4">Loading job details...</div>
  if (!job) return <div className="p-4">Job not found.</div>

  return (
    <div className="flex flex-col min-h-full bg-slate-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <Link to="/worker" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-4">
          <ArrowLeft size={16} className="mr-1" /> Back to Jobs
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Job #{job.id.slice(0, 8)}</h1>
        <p className="text-slate-500">{job.clients?.full_name}</p>
        <p className="text-sm text-slate-400">{job.clients?.address_text}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Task Description */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <h3 className="text-sm font-medium text-slate-500 mb-2">Task Description</h3>
        <p className="text-slate-900">{job.task_description}</p>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        {job.status === 'pending' && (
          <button
            onClick={handleCheckIn}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
          >
            <MapPin size={20} />
            <span>Check In (GPS)</span>
          </button>
        )}

        {job.status === 'in_progress' && (
          <div className="space-y-4">
            {/* Before Photo */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <h3 className="font-medium text-slate-900 mb-3">Before Photo</h3>
              {job.before_photo_url ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                  <img src={job.before_photo_url} alt="Before" className="w-full h-full object-cover" />
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
                    className="w-full border-2 border-dashed border-slate-300 hover:border-blue-500 text-slate-600 font-medium py-8 rounded-lg flex flex-col items-center justify-center space-y-2 transition-colors disabled:opacity-50"
                  >
                    <Camera size={24} className="text-slate-400" />
                    <span>Capture Before Photo</span>
                  </button>
                </>
              )}
            </div>

            {/* After Photo */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <h3 className="font-medium text-slate-900 mb-3">After Photo</h3>
              {job.after_photo_url ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                  <img src={job.after_photo_url} alt="After" className="w-full h-full object-cover" />
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
                    className="w-full border-2 border-dashed border-slate-300 hover:border-blue-500 text-slate-600 font-medium py-8 rounded-lg flex flex-col items-center justify-center space-y-2 transition-colors disabled:opacity-50"
                  >
                    <Camera size={24} className="text-slate-400" />
                    <span>Capture After Photo</span>
                  </button>
                </>
              )}
            </div>

            {/* Complete Job */}
            {job.before_photo_url && job.after_photo_url && (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
              >
                <CheckCircle size={20} />
                <span>Complete Job</span>
              </button>
            )}
          </div>
        )}

        {job.status === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800">Job Completed</h3>
            <p className="text-sm text-green-600">Great work!</p>
          </div>
        )}
      </div>
    </div>
  )
}
