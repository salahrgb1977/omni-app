import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Calendar, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function WorkerJobs() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchJobs()
    }
  }, [user])

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          clients ( full_name, address_text )
        `)
        .in('status', ['pending', 'in_progress'])
        .order('scheduled_date', { ascending: true })
      
      if (error) throw error
      if (data) setJobs(data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-4">Loading jobs...</div>
  return (
    <div className="p-4 bg-slate-50 min-h-full">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Assigned Jobs</h1>
      
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="text-center text-slate-500 py-8">No pending jobs.</div>
        ) : jobs.map(job => (
          <div key={job.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-slate-900">{job.clients?.full_name}</h3>
                <div className="flex items-center text-sm text-slate-500 mt-1">
                  <MapPin size={14} className="mr-1" />
                  <span>{job.clients?.address_text}</span>
                </div>
              </div>
            </div>
            
            <p className="text-slate-600 text-sm mb-4 line-clamp-2">{job.task_description}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center text-sm font-medium text-slate-500">
                <Calendar size={16} className="mr-2" />
                <span>{new Date(job.scheduled_date).toLocaleDateString()}</span>
              </div>
              <Link 
                to={`/worker/job/${job.id}`}
                className="flex items-center space-x-1 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                <span>{job.status === 'in_progress' ? 'Resume Job' : 'Start Job'}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
