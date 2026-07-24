import { useState, useEffect } from 'react'
import { Search, Star, Edit } from 'lucide-react'
import { EditClientModal } from '../components/EditClientModal'
import { supabase } from '../lib/supabase'

export function AdminClients() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingClient, setEditingClient] = useState<any>(null)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('full_name', { ascending: true })
      
      if (!error && data) {
        setClients(data)
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clients CRM</h1>
          <p className="text-slate-500 mt-1">Manage client relationships and VIP memberships.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search clients..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="p-4 border-b border-slate-100">Client Name</th>
                <th className="p-4 border-b border-slate-100">Contact</th>
                <th className="p-4 border-b border-slate-100">Address</th>
                <th className="p-4 border-b border-slate-100">VIP Status</th>
                <th className="p-4 border-b border-slate-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500">Loading clients...</td></tr>
              ) : clients.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500">No clients found.</td></tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{client.full_name}</td>
                    <td className="p-4 text-slate-700">{client.phone_number || 'N/A'}</td>
                    <td className="p-4 text-slate-700">{client.address_text || 'N/A'}</td>
                    <td className="p-4">
                      {client.is_vip_member ? (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200 w-max">
                            <Star size={12} className="mr-1 fill-yellow-600 text-yellow-600" />
                            VIP Active
                          </span>
                          {client.membership_expiry && (
                            <span className="text-[10px] text-slate-500 mt-1">
                              Expires: {new Date(client.membership_expiry).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium">Standard</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => setEditingClient(client)}
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors"
                        title="Edit Client"
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EditClientModal 
        isOpen={!!editingClient} 
        onClose={() => setEditingClient(null)} 
        onUpdated={fetchClients}
        client={editingClient}
      />
    </div>
  )
}
