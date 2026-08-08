import { X, Clock, Mic, FileText, ImageIcon } from 'lucide-react'

export function JobProofModal({ isOpen, onClose, job }: { isOpen: boolean, onClose: () => void, job: any }) {
  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-200/50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Job Proof & Report</h2>
            <p className="text-sm font-medium text-slate-500 mt-0.5">#{job.id.slice(0, 8)} - {job.clients?.full_name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200/50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[80vh] space-y-8">
          
          {/* Photo Evidence */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center">
              <ImageIcon size={14} className="mr-2" /> Photographic Evidence
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-sm font-semibold text-slate-700 ml-1">Before</span>
                {job.before_photo_url ? (
                  <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-video ring-1 ring-slate-200/50 shadow-sm group">
                    <img src={job.before_photo_url} alt="Before" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-[11px] font-mono px-3 py-1.5 rounded-lg flex items-center shadow-lg">
                      <Clock size={12} className="mr-1.5 opacity-70" />
                      {new Date(job.before_photo_taken_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-slate-100 aspect-video flex items-center justify-center text-slate-400 text-sm font-medium ring-1 ring-slate-200/50 shadow-sm">No Photo</div>
                )}
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-semibold text-slate-700 ml-1">After</span>
                {job.after_photo_url ? (
                  <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-video ring-1 ring-slate-200/50 shadow-sm group">
                    <img src={job.after_photo_url} alt="After" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-[11px] font-mono px-3 py-1.5 rounded-lg flex items-center shadow-lg">
                      <Clock size={12} className="mr-1.5 opacity-70" />
                      {new Date(job.after_photo_taken_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-slate-100 aspect-video flex items-center justify-center text-slate-400 text-sm font-medium ring-1 ring-slate-200/50 shadow-sm">No Photo</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Task Report */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center">
              <FileText size={14} className="mr-2" /> Task Report & Notes
            </h3>
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 shadow-sm">
              <p className="text-slate-700 whitespace-pre-wrap font-medium leading-relaxed">
                {job.task_note || <span className="text-slate-400 italic">No written report provided.</span>}
              </p>
            </div>
          </div>

          {/* Voice Memo */}
          {job.voice_memo_url && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center">
                <Mic size={14} className="mr-2" /> Voice Memo
              </h3>
              <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-2xl p-5 flex items-center shadow-sm">
                <audio src={job.voice_memo_url} controls className="w-full h-12" />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
