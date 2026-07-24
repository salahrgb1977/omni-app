import { useState, useEffect } from 'react'
import { Package } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function WorkerEquipment() {
  const { user } = useAuth()
  const [equipment, setEquipment] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchEquipment()
    }
  }, [user])

  const fetchEquipment = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('assigned_worker_id', user?.id)
        .order('item_name', { ascending: true })
      
      if (!error && data) {
        setEquipment(data)
      }
    } catch (err) {
      console.error('Failed to fetch equipment:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'in_van': return 'bg-green-100 text-green-700'
      case 'checked_out': return 'bg-yellow-100 text-yellow-700'
      case 'lost': return 'bg-red-100 text-red-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  if (loading) return <div className="p-4">Loading equipment...</div>

  return (
    <div className="p-4 bg-slate-50 min-h-full pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Equipment</h1>
        <p className="text-slate-500 text-sm mt-1">Items currently assigned to you or in your van.</p>
      </div>

      <div className="space-y-4">
        {equipment.length === 0 ? (
          <div className="text-center text-slate-500 py-8 bg-white rounded-xl border border-slate-200">
            <Package className="mx-auto text-slate-300 mb-2" size={32} />
            <p>No equipment assigned to you.</p>
          </div>
        ) : (
          equipment.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-3">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{item.item_name}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{item.barcode_id || 'No barcode'}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                {item.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
