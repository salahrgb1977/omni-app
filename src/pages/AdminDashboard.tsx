import { useState, useEffect } from 'react'
import { PlusCircle, Search, ImageIcon, Star } from 'lucide-react'
import { NewJobModal } from '../components/NewJobModal'
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
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {label}
    </span>
  )
}

export function AdminDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [jobs, setJobs] = useState<any[]>([])

  useEffect(() => {
    fetchJobs()
    
    // Subscribe to realtime changes
    const channel = supabase.channel('public:jobs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
        fetchJobs()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Live Dispatch Board</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage today's jobs and field operations.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 shadow-sm hover:shadow text-white px-5 py-2.5 rounded-xl font-medium flex items-center space-x-2 transition-all duration-200"
        >
          <PlusCircle size={20} />
          <span>Dispatch New Job</span>
        </button>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search jobs..." 
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-sm"
            />
          </div>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold">Job ID</th>
              <th className="p-4 font-semibold">Client</th>
              <th className="p-4 font-semibold">Assigned To</th>
              <th className="p-4 font-semibold">Scheduled Time</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Verify Proof</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-b border-slate-100 hover:bg-slate-50 transition-all duration-200">
                <td className="p-4 font-mono text-xs text-slate-500">#{job.id.slice(0, 8)}</td>
                <td className="p-4 text-slate-900 font-medium">
                  <div className="flex items-center space-x-2">
                    <span>{job.clients?.full_name}</span>
                    {job.clients?.is_vip_member && (
                      <span title="VIP Client" className="flex items-center justify-center bg-yellow-50 text-yellow-600 ring-1 ring-yellow-600/20 rounded-full w-5 h-5">
                        <Star size={12} className="fill-yellow-600" />
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-slate-600">{job.profiles?.full_name || 'Unassigned'}</td>
                <td className="p-4 text-slate-600 font-medium">
                  {new Date(job.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="p-4">
                  <StatusBadge status={job.status} />
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    {job.before_photo_url ? (
                      <a href={job.before_photo_url} target="_blank" rel="noreferrer" title="View Before Photo" className="text-indigo-600 hover:text-indigo-800 transition-colors">
                        <ImageIcon size={20} />
                      </a>
                    ) : (
                      <div className="w-5 h-5" />
                    )}
                    {job.after_photo_url && (
                      <a href={job.after_photo_url} target="_blank" rel="noreferrer" title="View After Photo" className="text-emerald-600 hover:text-emerald-800 transition-colors">
                        <ImageIcon size={20} />
                      </a>
                    )}
                    {!job.before_photo_url && !job.after_photo_url && (
                      <span className="text-slate-400 text-xs italic">Pending</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NewJobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
