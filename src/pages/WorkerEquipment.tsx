import { useState, useEffect } from 'react'
import { Package, Wrench, Wind, Zap, CheckCircle, Search } from 'lucide-react'
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

  const getItemIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('drill') || lower.includes('saw') || lower.includes('tool') || lower.includes('wrench')) return <Wrench size={24} className="text-indigo-600" />;
    if (lower.includes('freon') || lower.includes('filter') || lower.includes('air') || lower.includes('hvac')) return <Wind size={24} className="text-teal-600" />;
    if (lower.includes('wire') || lower.includes('meter') || lower.includes('volt')) return <Zap size={24} className="text-amber-600" />;
    return <Package size={24} className="text-slate-600" />;
  }

  const getItemBg = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('drill') || lower.includes('saw') || lower.includes('tool') || lower.includes('wrench')) return 'bg-indigo-100';
    if (lower.includes('freon') || lower.includes('filter') || lower.includes('air') || lower.includes('hvac')) return 'bg-teal-100';
    if (lower.includes('wire') || lower.includes('meter') || lower.includes('volt')) return 'bg-amber-100';
    return 'bg-slate-100';
  }

  if (loading) return <div className="p-4 flex items-center justify-center h-full text-slate-500 font-medium">Loading equipment...</div>

  const myLoadout = equipment.filter(item => item.assigned_worker_id === user?.id)
  const companyVault = equipment.filter(item => item.assigned_worker_id !== user?.id)

  return (
    <div className="min-h-full pb-24 bg-slate-50">
      <div className="bg-white p-6 rounded-b-3xl shadow-sm border-b border-slate-200 mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Digital Locker</h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">Manage your tools and check out new gear.</p>
      </div>

      <div className="px-4 space-y-8">
        
        {/* Loadout Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">My Current Loadout</h2>
            <span className="bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full text-xs">
              {myLoadout.length} items
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {myLoadout.length === 0 ? (
              <div className="text-center text-slate-500 py-8 bg-white/50 rounded-2xl border border-slate-200 border-dashed">
                <p className="text-sm font-medium">Your loadout is empty.</p>
              </div>
            ) : (
              myLoadout.map((item) => (
                <div key={item.id} className="premium-card p-5">
                  <div className="flex items-start">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 ${getItemBg(item.item_name)}`}>
                      {getItemIcon(item.item_name)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">{item.item_name}</h3>
                      <p className="text-xs text-slate-500 font-mono mt-1 flex items-center">
                        Barcode: {item.barcode_id || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <button className="mt-4 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold transition-colors flex items-center justify-center">
                    <CheckCircle size={18} className="mr-2 text-slate-500" />
                    Check In Tool
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Vault Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Company Vault</h2>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search available tools..." 
              className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {companyVault.map((item) => (
              <div key={item.id} className="premium-card p-5 opacity-90 hover:opacity-100">
                <div className="flex items-start">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 ${getItemBg(item.item_name)}`}>
                    {getItemIcon(item.item_name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{item.item_name}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      Barcode: {item.barcode_id || 'N/A'}
                    </p>
                    <div className="mt-2 flex items-center">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'in_van' || item.status === 'checked_out' 
                          ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-600/20' 
                          : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-600/20'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="mt-4 w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2.5 rounded-xl font-semibold transition-colors">
                  Check Out Tool
                </button>
              </div>
            ))}
            {companyVault.length === 0 && (
              <div className="text-center text-slate-500 py-8">
                <p className="text-sm">No items in the vault.</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
