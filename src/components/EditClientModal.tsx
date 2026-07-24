import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../lib/supabase'

export function EditClientModal({ isOpen, onClose, onUpdated, client }: { isOpen: boolean; onClose: () => void; onUpdated: () => void; client: any }) {
  if (!isOpen || !client) return null

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    is_vip_member: false,
    membership_expiry: ''
  })

  useEffect(() => {
    if (client) {
      setFormData({
        is_vip_member: client.is_vip_member || false,
        membership_expiry: client.membership_expiry ? new Date(client.membership_expiry).toISOString().slice(0, 16) : ''
      })
    }
  }, [client])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const updateData: any = {
        is_vip_member: formData.is_vip_member,
      }
      
      if (formData.is_vip_member && formData.membership_expiry) {
        updateData.membership_expiry = new Date(formData.membership_expiry).toISOString()
      } else {
        updateData.membership_expiry = null
      }

      const { error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', client.id)
      
      if (error) throw error
      
      onUpdated()
      onClose()
    } catch (error) {
      console.error('Error updating client:', error)
      alert('Failed to update client VIP status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Edit Client: {client.full_name}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <input 
              type="checkbox" 
              id="vip_status"
              className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
              checked={formData.is_vip_member}
              onChange={e => setFormData({...formData, is_vip_member: e.target.checked})}
            />
            <label htmlFor="vip_status" className="text-sm font-medium text-slate-700">
              VIP Membership Active
            </label>
          </div>

          {formData.is_vip_member && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Membership Expiry Date</label>
              <input 
                type="datetime-local" 
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required={formData.is_vip_member}
                value={formData.membership_expiry}
                onChange={e => setFormData({...formData, membership_expiry: e.target.value})}
              />
            </div>
          )}

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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
