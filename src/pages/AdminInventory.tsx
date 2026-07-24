import { useState, useEffect } from 'react'
import { PlusCircle, Search, Package } from 'lucide-react'
import { NewInventoryModal } from '../components/NewInventoryModal'
import { supabase } from '../lib/supabase'

export function AdminInventory() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          profiles ( full_name )
        `)
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setInventory(data)
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err)
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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventory Vault</h1>
          <p className="text-slate-500 mt-1">Manage and track equipment across the field.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
        >
          <PlusCircle size={20} className="mr-2" />
          Add Item
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by item name or barcode..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="p-4 border-b border-slate-100">Item Name</th>
                <th className="p-4 border-b border-slate-100">Barcode ID</th>
                <th className="p-4 border-b border-slate-100">Status</th>
                <th className="p-4 border-b border-slate-100">Assigned Worker</th>
                <th className="p-4 border-b border-slate-100">Added</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500">Loading inventory...</td></tr>
              ) : inventory.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500">No items found in the vault.</td></tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-900 flex items-center">
                      <Package size={16} className="text-slate-400 mr-2" />
                      {item.item_name}
                    </td>
                    <td className="p-4 text-slate-700 font-mono text-xs">{item.barcode_id || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700">{item.profiles?.full_name || 'Unassigned'}</td>
                    <td className="p-4 text-slate-700">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NewInventoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdded={fetchInventory}
      />
    </div>
  )
}
