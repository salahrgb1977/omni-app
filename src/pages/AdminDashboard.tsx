import { useState, useEffect } from 'react'
import { PlusCircle, Search, Star, Clock } from 'lucide-react'
import { NewJobModal } from '../components/NewJobModal'
import { JobProofModal } from '../components/JobProofModal'
import { supabase } from '../lib/supabase'

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20',
    in_progress: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20',
    completed: 'bg-green-50 text-green-700 ring-1 ring-green-600/20',
    needs_rework: 'bg-red-50 text-red-700 ring-1 ring-red-600/20'
  }
  const color = colors[status] || 'bg-slate-50 text-slate-700 ring-1 ring-slate-600/20'
  const label = status.replace('_', ' ').toUpperCase()
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide ${color}`}>
      {label}
    </span>
  )
}

const ShiftCard = ({ shift }: { shift: any }) => {
  const [duration, setDuration] = useState('')

  useEffect(() => {
    const update = () => {
      const diffMs = Date.now() - new Date(shift.start_time).getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const hours = Math.floor(diffMins / 60)
      const mins = diffMins % 60
      setDuration(hours > 0 ? `${hours}h ${mins}m` : `${mins}m`)
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [shift.start_time])

  return (
    <div className="premium-card p-5 flex items-center justify-between border-l-4 border-l-green-500 bg-white/70 backdrop-blur-sm">
      <div>
        <p className="font-extrabold text-slate-900">{shift.profiles?.full_name}</p>
        <p className="text-xs font-medium text-slate-500 mt-1 flex items-center">
          <Clock size={12} className="mr-1 opacity-70" />
          Started {new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <div className="text-right">
        <div className="flex items-center space-x-1.5 mb-1 justify-end">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Active</span>
        </div>
        <p className="text-sm font-extrabold text-slate-700 font-mono bg-slate-100 px-2 py-0.5 rounded-md">{duration}</p>
      </div>
    </div>
  )
}

export function AdminDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [jobs, setJobs] = useState<any[]>([])
  const [activeShifts, setActiveShifts] = useState<any[]>([])
  const [proofJob, setProofJob] = useState<any>(null)

  useEffect(() => {
    fetchJobs()
    fetchActiveShifts()
    
    // Subscribe to realtime changes for jobs
    const jobsChannel = supabase.channel('public:jobs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
        fetchJobs()
      })
      .subscribe()

    // Subscribe to realtime changes for shifts
    const shiftsChannel = supabase.channel('public:shifts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shifts' }, () => {
        fetchActiveShifts()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(jobsChannel)
      supabase.removeChannel(shiftsChannel)
    }
  }, [])

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        clients ( full_name, is_vip_member ),
        profiles ( full_name )
      `)
      .order('scheduled_date', { ascending: true })
    
    if (!error && data) {
      setJobs(data)
    }
  }

  const fetchActiveShifts = async () => {
    const { data, error } = await supabase
      .from('shifts')
      .select('*, profiles(full_name)')
      .is('end_time', null)
      .order('start_time', { ascending: false })
      
    if (!error && data) {
      setActiveShifts(data)
    }
  }

  const getJobDuration = (job: any) => {
    if (job.status !== 'completed' || !job.before_photo_taken_at || !job.after_photo_taken_at) {
      return '-'
    }
    const diffMs = new Date(job.after_photo_taken_at).getTime() - new Date(job.before_photo_taken_at).getTime()
    if (diffMs < 0) return '0m'
    const diffMins = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }

  return (
    <div className="p-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Live Dispatch Board</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage today's field operations and accountability.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 shadow-sm hover:shadow-md text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all duration-200"
        >
          <PlusCircle size={20} />
          <span>Dispatch New Job</span>
        </button>
      </div>

      {/* Active Shifts Monitor */}
      <div className="mb-10">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center">
          <Clock size={14} className="mr-2" /> Active Field Shifts
        </h2>
        {activeShifts.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-6 text-center text-slate-500 font-medium">
            No workers currently on shift.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {activeShifts.map(shift => (
              <ShiftCard key={shift.id} shift={shift} />
            ))}
          </div>
        )}
      </div>

      {/* Jobs Table */}
      <div className="premium-card overflow-hidden">
        <div className="p-5 border-b border-slate-200/60 flex justify-between items-center bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search jobs..." 
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64 text-sm font-medium bg-white/70 backdrop-blur-sm"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 text-[11px] uppercase tracking-wider">
                <th className="p-4 font-bold">Job ID</th>
                <th className="p-4 font-bold">Client</th>
                <th className="p-4 font-bold">Assigned To</th>
                <th className="p-4 font-bold">Scheduled Time</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Duration</th>
                <th className="p-4 font-bold text-right pr-6">Proof</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-b border-slate-100/60 hover:bg-slate-50/80 transition-all duration-200">
                  <td className="p-4 font-mono text-xs font-semibold text-slate-500">#{job.id.slice(0, 8)}</td>
                  <td className="p-4 text-slate-900 font-bold">
                    <div className="flex items-center space-x-2">
                      <span>{job.clients?.full_name}</span>
                      {job.clients?.is_vip_member && (
                        <span title="VIP Client" className="flex items-center justify-center bg-yellow-50 text-yellow-600 ring-1 ring-yellow-600/30 rounded-full w-5 h-5 shadow-sm">
                          <Star size={12} className="fill-yellow-600" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 font-medium">{job.profiles?.full_name || 'Unassigned'}</td>
                  <td className="p-4 text-slate-600 font-medium">
                    {new Date(job.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="p-4 text-right text-slate-600 font-mono font-bold text-sm">
                    {getJobDuration(job)}
                  </td>
                  <td className="p-4 text-right pr-6">
                    {job.status === 'completed' ? (
                      <button
                        onClick={() => setProofJob(job)}
                        className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold px-4 py-2 rounded-lg text-xs transition-colors shadow-sm ring-1 ring-indigo-600/10 hover:ring-indigo-600/20"
                      >
                        View Report
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs italic font-medium pr-2">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <NewJobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* Proof Modal */}
      <JobProofModal isOpen={!!proofJob} onClose={() => setProofJob(null)} job={proofJob} />
    </div>
  )
}
