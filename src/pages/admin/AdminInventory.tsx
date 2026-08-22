import React, { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useI18n } from '../../contexts/I18nContext'
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
  const { t } = useI18n()

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
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900">
            {t('inv.title', 'مخزون الشاحنات ونظام القائد اليومي')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('inv.desc', 'عزل الشاحنات (شاحنة 1 ضد شاحنة 2)، وتعيين القائد اليومي، وسجل الخصم الخاص بالإدارة.')}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 rtl:space-x-reverse shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>{t('inv.add_item', 'إضافة صنف للمخزون')}</span>
        </button>
      </div>

      {/* Daily Captains Assignment Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Van 1 Captain Card */}
        <div className="admin-card p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border-slate-200">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  {t('inv.van1_captain', 'قائد شاحنة الخدمة 1')}
                </h3>
                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {t('badge.van_1', 'شاحنة 1')}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {t('inv.current_captain', 'القائد الحالي:')} <strong className="text-slate-900">{currentVan1Captain?.full_name || t('inv.none_assigned', 'لم يتم التعيين')}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <select
              value={currentVan1Captain?.id || ''}
              onChange={e => {
                const workerId = e.target.value
                if (workerId) {
                  setCaptain(workerId, 'van_1', true)
                }
              }}
              className="w-full sm:w-auto bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="">{t('inv.swap_captain', '-- تغيير القائد --')}</option>
              {workers.map(w => (
                <option key={w.id} value={w.id}>
                  {w.full_name} {w.is_daily_captain ? '★' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Van 2 Captain Card */}
        <div className="admin-card p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border-slate-200">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 font-bold shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  {t('inv.van2_captain', 'قائد شاحنة الخدمة 2')}
                </h3>
                <span className="bg-cyan-100 text-cyan-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {t('badge.van_2', 'شاحنة 2')}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {t('inv.current_captain', 'القائد الحالي:')} <strong className="text-slate-900">{currentVan2Captain?.full_name || t('inv.none_assigned', 'لم يتم التعيين')}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <select
              value={currentVan2Captain?.id || ''}
              onChange={e => {
                const workerId = e.target.value
                if (workerId) {
                  setCaptain(workerId, 'van_2', true)
                }
              }}
              className="w-full sm:w-auto bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="">{t('inv.swap_captain', '-- تغيير القائد --')}</option>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2 gap-2">
        <div className="flex items-center space-x-2 rtl:space-x-reverse overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === 'stock'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {t('inv.tab_stock', 'مصفوفة مخزون الشاحنات')}
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 rtl:space-x-reverse transition-colors whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History size={13} />
            <span>{t('inv.tab_logs', 'سجل خصم المواد الخاص')} ({inventoryLogs.length})</span>
          </button>
        </div>

        {activeTab === 'stock' && (
          <div className="flex items-center space-x-2 rtl:space-x-reverse self-start sm:self-auto overflow-x-auto no-scrollbar">
            {/* Vehicle Selector */}
            <div className="flex items-center bg-slate-200 p-0.5 rounded-lg text-xs font-bold">
              <button
                onClick={() => setSelectedVehicle('van_1')}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${selectedVehicle === 'van_1' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
              >
                {t('vehicle.van_1', 'شاحنة 1')}
              </button>
              <button
                onClick={() => setSelectedVehicle('van_2')}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${selectedVehicle === 'van_2' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
              >
                {t('vehicle.van_2', 'شاحنة 2')}
              </button>
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="all">{t('inv.all_categories', 'جميع الفئات')}</option>
              <option value="equipment">{t('inv.cat_equipment', 'المعدات (الأدوات)')}</option>
              <option value="consumable">{t('inv.cat_consumable', 'المستهلكات (القطع)')}</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: VEHICLE STOCK MATRIX */}
      {activeTab === 'stock' && (
        <div className="admin-card overflow-hidden">
          <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Truck size={16} className="text-slate-700" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {selectedVehicle === 'van_1' ? t('vehicle.van_1', 'شاحنة 1') : t('vehicle.van_2', 'شاحنة 2')}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {filteredInventory.length} {t('inv.col_stock', 'أصناف')}
            </span>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredInventory.map(item => (
              <div key={item.id} className="p-3.5 space-y-2 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    {item.category === 'equipment' ? (
                      <Wrench size={15} className="text-slate-500 shrink-0" />
                    ) : (
                      <Package size={15} className="text-blue-500 shrink-0" />
                    )}
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{item.item_name}</h4>
                      <div className="flex items-center space-x-1.5 rtl:space-x-reverse mt-1">
                        <Badge variant={item.category} size="sm" />
                      </div>
                    </div>
                  </div>

                  <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded border ${
                    item.quantity <= 0 
                      ? 'bg-rose-50 text-rose-700 border-rose-200' 
                      : item.quantity <= 2 
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : 'bg-slate-50 text-slate-900 border-slate-200'
                  }`}>
                    {t('inv.col_stock', 'الكمية:')} {item.quantity}
                  </span>
                </div>

                <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse pt-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs flex items-center space-x-1 rtl:space-x-reverse"
                  >
                    <Edit2 size={12} />
                    <span>{t('inv.edit_item', 'تعديل')}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(t('inv.delete_confirm', 'هل أنت متأكد من حذف هذا الصنف من المخزون الرئيسي؟'))) {
                        deleteInventoryItem(item.id)
                      }
                    }}
                    className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center space-x-1 rtl:space-x-reverse"
                  >
                    <Trash2 size={12} />
                    <span>{t('inv.delete_item', 'حذف')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200 text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">{t('inv.col_name', 'اسم الصنف')}</th>
                  <th className="px-4 py-3">{t('inv.col_category', 'الفئة')}</th>
                  <th className="px-4 py-3">{t('inv.col_vehicle', 'الشاحنة')}</th>
                  <th className="px-4 py-3">{t('inv.col_stock', 'المخزون الحالي')}</th>
                  <th className="px-4 py-3 text-right rtl:text-left">{t('inv.col_actions', 'إجراءات')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredInventory.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
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
                      {item.assigned_vehicle === 'van_1' ? t('vehicle.van_1', 'شاحنة 1') : t('vehicle.van_2', 'شاحنة 2')}
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

                    <td className="px-4 py-3 text-right rtl:text-left space-x-1 rtl:space-x-reverse">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
                        title={t('inv.edit_item', 'تعديل الصنف')}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(t('inv.delete_confirm', 'هل أنت متأكد من حذف هذا الصنف من المخزون الرئيسي؟'))) {
                            deleteInventoryItem(item.id)
                          }
                        }}
                        className="p-1.5 rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
                        title={t('inv.delete_item', 'حذف الصنف')}
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
          <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Shield size={16} className="text-slate-800 shrink-0" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {t('inv.tab_logs', 'سجل خصم المواد الخاص (للإدارة فقط)')}
                </span>
                <p className="text-[10px] text-slate-500">
                  {t('inv.authorized_captain', 'عمليات الخصم الموثقة من قادة الشاحنات اليوميين.')}
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {inventoryLogs.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200 text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">{t('inv.log_timestamp', 'التوقيت')}</th>
                  <th className="px-4 py-3">{t('inv.log_captain', 'اسم القائد')}</th>
                  <th className="px-4 py-3">{t('inv.log_part', 'القطعة المخصومة')}</th>
                  <th className="px-4 py-3">{t('inv.log_qty', 'الكمية')}</th>
                  <th className="px-4 py-3">{t('inv.log_vehicle', 'الشاحنة')}</th>
                  <th className="px-4 py-3">{t('inv.log_job', 'المرجع / أمر العمل')}</th>
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
                      <span className="block text-[10px] text-blue-700 font-semibold">{t('inv.authorized_captain', 'قائد معتمد')}</span>
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
                      {log.job_id ? `#${log.job_id.slice(-6)}` : t('inv.general_usage', 'استهلاك عام')}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                {editingItem ? t('inv.modal_edit_title', 'تعديل صنف المخزون') : t('inv.modal_add_title', 'إضافة صنف جديد')}
              </h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-4 sm:p-5 space-y-3.5 sm:space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  {t('inv.modal_item_name', 'اسم الصنف / الأداة *')}
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  placeholder="e.g. 45+5 MFD Capacitor"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    {t('inv.col_category', 'الفئة')}
                  </label>
                  <select
                    value={itemCategory}
                    onChange={e => setItemCategory(e.target.value as ItemCategory)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="consumable">{t('inv.cat_consumable', 'مستهلك (قطع)')}</option>
                    <option value="equipment">{t('inv.cat_equipment', 'معدة (أداة)')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    {t('inv.col_vehicle', 'الشاحنة')}
                  </label>
                  <select
                    value={itemVehicle}
                    onChange={e => setItemVehicle(e.target.value as VehicleId)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="van_1">{t('vehicle.van_1', 'شاحنة 1')}</option>
                    <option value="van_2">{t('vehicle.van_2', 'شاحنة 2')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  {t('inv.modal_quantity', 'الكمية')}
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

              <div className="pt-2 flex justify-end space-x-2 rtl:space-x-reverse">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  {t('create_job.cancel', 'إلغاء')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                >
                  {editingItem ? t('inv.modal_save', 'حفظ التغييرات') : t('inv.modal_create', 'إنشاء الصنف')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
