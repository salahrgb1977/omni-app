import { useState, useEffect } from 'react'
import { PlusCircle, Search, Package, Wrench, Wind, Zap } from 'lucide-react'
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
      case 'in_van': return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
      case 'checked_out': return 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20'
      case 'lost': return 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20'
      default: return 'bg-slate-50 text-slate-700 ring-1 ring-slate-600/20'
    }
  }

  const getItemIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('drill') || lower.includes('saw') || lower.includes('tool') || lower.includes('wrench')) return <Wrench size={16} className="text-blue-600" />;
    if (lower.includes('freon') || lower.includes('filter') || lower.includes('air') || lower.includes('hvac')) return <Wind size={16} className="text-teal-600" />;
    if (lower.includes('wire') || lower.includes('meter') || lower.includes('volt')) return <Zap size={16} className="text-yellow-600" />;
    return <Package size={16} className="text-slate-600" />;
  }

  const getItemBg = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('drill') || lower.includes('saw') || lower.includes('tool') || lower.includes('wrench')) return 'bg-blue-100';
    if (lower.includes('freon') || lower.includes('filter') || lower.includes('air') || lower.includes('hvac')) return 'bg-teal-100';
    if (lower.includes('wire') || lower.includes('meter') || lower.includes('volt')) return 'bg-yellow-100';
    return 'bg-slate-100';
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Inventory Vault</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage and track equipment across the field.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 shadow-sm hover:shadow text-white px-5 py-2.5 rounded-xl font-medium flex items-center transition-all duration-200"
        >
          <PlusCircle size={20} className="mr-2" />
          Add Item
        </button>
      </div>

      <div className="premium-card overflow-hidden">
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
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Item Name</th>
                <th className="p-4 font-semibold">Barcode ID</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Assigned Worker</th>
                <th className="p-4 font-semibold">Added</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500">Loading inventory...</td></tr>
              ) : inventory.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500">No items found in the vault.</td></tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-all duration-200">
                    <td className="p-4 font-medium text-slate-900 flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getItemBg(item.item_name)}`}>
                        {getItemIcon(item.item_name)}
                      </div>
                      <span>{item.item_name}</span>
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-xs">{item.barcode_id || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{item.profiles?.full_name || 'Unassigned'}</td>
                    <td className="p-4 text-slate-500 text-sm">
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
