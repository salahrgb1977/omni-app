import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../lib/supabase'

export function NewInventoryModal({ isOpen, onClose, onAdded }: { isOpen: boolean; onClose: () => void; onAdded: () => void }) {
  if (!isOpen) return null

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    item_name: '',
    barcode_id: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = await supabase.from('inventory').insert([
        {
          item_name: formData.item_name,
          barcode_id: formData.barcode_id,
          status: 'in_van'
        }
      ])
      
      if (error) throw error
      
      onAdded()
      onClose()
    } catch (error) {
      console.error('Error adding inventory item:', error)
      alert('Failed to add inventory item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Add Inventory Item</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
            <input 
              type="text" 
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. HVAC Filter 16x20x1"
              required
              value={formData.item_name}
              onChange={e => setFormData({...formData, item_name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Barcode ID (Optional)</label>
            <input 
              type="text" 
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. FIL-16201"
              value={formData.barcode_id}
              onChange={e => setFormData({...formData, barcode_id: e.target.value})}
            />
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
              {loading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
