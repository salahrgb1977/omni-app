import React, { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { Badge } from '../../components/common/Badge'
import { InventoryItem, VehicleId, ItemCategory, Profile } from '../../types/omni'
import { formatDateTime, formatVehicle } from '../../lib/formatters'
import {
  Truck,
  Plus,
  Edit2,
  Trash2,
  Shield,
  Package,
  Wrench,
  X,
  History,
  UserCheck
} from 'lucide-react'

export function AdminInventory() {
  const {
    inventory,
    inventoryLogs,
    profiles,
    setCaptain,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
  } = useData()

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleId>('van_1')
  const [categoryFilter, setCategoryFilter] = useState<'all' | ItemCategory>('all')
  const [activeTab, setActiveTab] = useState<'stock' | 'logs'>('stock')
  
  // Modal for Adding/Editing Item
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [itemName, setItemName] = useState('')
  const [itemCategory, setItemCategory] = useState<ItemCategory>('consumable')
  const [itemQuantity, setItemQuantity] = useState('1')
  const [itemVehicle, setItemVehicle] = useState<VehicleId>('van_1')

  const workers = profiles.filter(p => p.role === 'worker')
  const currentVan1Captain = workers.find(w => w.assigned_vehicle === 'van_1' && w.is_daily_captain)
  const currentVan2Captain = workers.find(w => w.assigned_vehicle === 'van_2' && w.is_daily_captain)

  // Filter inventory by vehicle & category
  const filteredInventory = inventory.filter(item => {
    if (item.assigned_vehicle !== selectedVehicle) return false
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
    return true
  })

  // Open modal to add item
  const handleOpenAdd = () => {
    setEditingItem(null)
    setItemName('')
    setItemCategory('consumable')
    setItemQuantity('1')
    setItemVehicle(selectedVehicle)
    setIsItemModalOpen(true)
  }

  // Open modal to edit item
  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setItemName(item.item_name)
    setItemCategory(item.category)
    setItemQuantity(String(item.quantity))
    setItemVehicle(item.assigned_vehicle)
    setIsItemModalOpen(true)
  }

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemName.trim()) return

    if (editingItem) {
      updateInventoryItem(editingItem.id, {
        item_name: itemName,
        category: itemCategory,
        quantity: Number(itemQuantity),
        assigned_vehicle: itemVehicle
      })
    } else {
      addInventoryItem({
        item_name: itemName,
        category: itemCategory,
        quantity: Number(itemQuantity),
        assigned_vehicle: itemVehicle
      })
    }

    setIsItemModalOpen(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold uppercase tracking-wider text-slate-900">
            Van Inventory & Daily Captain System
          </h1>
          <p className="text-xs text-slate-500">
            Dual vehicle isolation (Van 1 vs Van 2), Daily Captain designation, and private material deduction audit logs.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>Add Inventory Item</span>
        </button>
      </div>

      {/* Daily Captains Assignment Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Van 1 Captain Card */}
        <div className="admin-card p-4 flex items-center justify-between bg-white border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
              <Truck size={20} />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  Service Van 1 Captain
                </h3>
                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                  Van 1
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Current: <strong className="text-slate-900">{currentVan1Captain?.full_name || 'None Assigned'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={currentVan1Captain?.id || ''}
              onChange={e => {
                const workerId = e.target.value
                if (workerId) {
                  setCaptain(workerId, 'van_1', true)
                }
              }}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="">-- Swap Captain --</option>
              {workers.map(w => (
                <option key={w.id} value={w.id}>
                  {w.full_name} {w.is_daily_captain ? '★' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Van 2 Captain Card */}
        <div className="admin-card p-4 flex items-center justify-between bg-white border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 font-bold">
              <Truck size={20} />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  Service Van 2 Captain
                </h3>
                <span className="bg-cyan-100 text-cyan-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                  Van 2
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Current: <strong className="text-slate-900">{currentVan2Captain?.full_name || 'None Assigned'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={currentVan2Captain?.id || ''}
              onChange={e => {
                const workerId = e.target.value
                if (workerId) {
                  setCaptain(workerId, 'van_2', true)
                }
              }}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="">-- Swap Captain --</option>
              {workers.map(w => (
                <option key={w.id} value={w.id}>
                  {w.full_name} {w.is_daily_captain ? '★' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Tabs: Van Stock vs Admin Deduction Audit Trail */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'stock'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Vehicle Stock Matrix
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors ${
              activeTab === 'logs'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History size={13} />
            <span>Private Deduction Audit Trail ({inventoryLogs.length})</span>
          </button>
        </div>

        {activeTab === 'stock' && (
          <div className="flex items-center space-x-2">
            {/* Vehicle Selector */}
            <div className="flex items-center bg-slate-200 p-0.5 rounded-lg text-xs font-bold">
              <button
                onClick={() => setSelectedVehicle('van_1')}
                className={`px-3 py-1 rounded-md transition-colors ${selectedVehicle === 'van_1' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
              >
                Service Van 1
              </button>
              <button
                onClick={() => setSelectedVehicle('van_2')}
                className={`px-3 py-1 rounded-md transition-colors ${selectedVehicle === 'van_2' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
              >
                Service Van 2
              </button>
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700"
            >
              <option value="all">All Categories</option>
              <option value="equipment">Equipment (Tools)</option>
              <option value="consumable">Consumables (Materials)</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: VEHICLE STOCK MATRIX */}
      {activeTab === 'stock' && (
        <div className="admin-card overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Truck size={16} className="text-slate-700" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {formatVehicle(selectedVehicle)} Inventory Stock
              </span>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {filteredInventory.length} items loaded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200 text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Item Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Current Stock</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredInventory.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {item.category === 'equipment' ? (
                          <Wrench size={14} className="text-slate-500 shrink-0" />
                        ) : (
                          <Package size={14} className="text-blue-500 shrink-0" />
                        )}
                        <span className="font-bold text-slate-900">{item.item_name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <Badge variant={item.category} size="sm" />
                    </td>

                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {formatVehicle(item.assigned_vehicle)}
                    </td>

                    <td className="px-4 py-3">
                      <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded border ${
                        item.quantity <= 0 
                          ? 'bg-rose-50 text-rose-700 border-rose-200' 
                          : item.quantity <= 2 
                            ? 'bg-amber-50 text-amber-700 border-amber-200' 
                            : 'bg-slate-50 text-slate-900 border-slate-200'
                      }`}>
                        {item.quantity}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
                        title="Edit Item"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${item.item_name}" from master inventory?`)) {
                            deleteInventoryItem(item.id)
                          }
                        }}
                        className="p-1.5 rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PRIVATE DEDUCTION AUDIT TRAIL (ADMIN ONLY) */}
      {activeTab === 'logs' && (
        <div className="admin-card overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield size={16} className="text-slate-800" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Private Material Deduction Audit Log (Admin Only)
                </span>
                <p className="text-[10px] text-slate-500">
                  Non-captains and regular workers have zero access to this ledger.
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {inventoryLogs.length} total deductions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200 text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Captain Name</th>
                  <th className="px-4 py-3">Part Deducted</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Job Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {inventoryLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">
                      {formatDateTime(log.timestamp)}
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900">{log.captain_name}</span>
                      <span className="block text-[10px] text-blue-700 font-semibold">Authorized Captain</span>
                    </td>

                    <td className="px-4 py-3 font-bold text-slate-900">
                      {log.item_name}
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-rose-700">
                      -{log.quantity_deducted}
                    </td>

                    <td className="px-4 py-3">
                      <Badge variant={log.vehicle} size="sm" />
                    </td>

                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                      {log.job_id ? `#${log.job_id.slice(-6)}` : 'General Van Usage'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Item Modal (Add / Edit) */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Item / Tool Name *
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  placeholder="e.g. 45+5 MFD Capacitor or Vacuum Pump"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Category
                  </label>
                  <select
                    value={itemCategory}
                    onChange={e => setItemCategory(e.target.value as ItemCategory)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="consumable">Consumable (Part)</option>
                    <option value="equipment">Equipment (Tool)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Vehicle
                  </label>
                  <select
                    value={itemVehicle}
                    onChange={e => setItemVehicle(e.target.value as VehicleId)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="van_1">Service Van 1</option>
                    <option value="van_2">Service Van 2</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Initial Stock Quantity
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={itemQuantity}
                  onChange={e => setItemQuantity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                >
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
