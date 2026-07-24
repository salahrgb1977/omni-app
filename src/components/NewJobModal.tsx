import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../lib/supabase'

export function NewJobModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [workers, setWorkers] = useState<any[]>([])
  const [formData, setFormData] = useState({
    client_id: '',
    worker_id: '',
    task_description: '',
    scheduled_date: '',
    client_price: '',
    worker_payout: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchOptions()
    }
  }, [isOpen])

  const fetchOptions = async () => {
    const { data: clientsData } = await supabase.from('clients').select('*')
    if (clientsData) setClients(clientsData)

    const { data: workersData } = await supabase.from('profiles').select('*').eq('role', 'worker')
    if (workersData) setWorkers(workersData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = await supabase.from('jobs').insert([
        {
          client_id: formData.client_id,
          worker_id: formData.worker_id,
          task_description: formData.task_description,
          scheduled_date: new Date(formData.scheduled_date).toISOString(),
          client_price: parseFloat(formData.client_price),
          worker_payout: parseFloat(formData.worker_payout),
          status: 'pending'
        }
      ])
      
      if (error) throw error
      
      onClose()
      // Ideally trigger a refresh in the parent component here
    } catch (error) {
      console.error('Error creating job:', error)
      alert('Failed to create job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Dispatch New Job</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Client</label>
              <select 
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                required
                value={formData.client_id}
                onChange={e => setFormData({...formData, client_id: e.target.value})}
              >
                <option value="">Select a client...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.full_name} ({client.address_text})</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Assign Worker</label>
              <select 
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                required
                value={formData.worker_id}
                onChange={e => setFormData({...formData, worker_id: e.target.value})}
              >
                <option value="">Select a worker...</option>
                {workers.map(worker => (
                  <option key={worker.id} value={worker.id}>{worker.full_name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Task Description</label>
              <textarea 
                rows={3} 
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Describe the task..."
                required
                value={formData.task_description}
                onChange={e => setFormData({...formData, task_description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled Date & Time</label>
              <input 
                type="datetime-local" 
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                value={formData.scheduled_date}
                onChange={e => setFormData({...formData, scheduled_date: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 col-span-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Client Price ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  value={formData.client_price}
                  onChange={e => setFormData({...formData, client_price: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Worker Payout ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  value={formData.worker_payout}
                  onChange={e => setFormData({...formData, worker_payout: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Dispatching...' : 'Dispatch Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
