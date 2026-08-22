import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { useI18n } from '../contexts/I18nContext'
import { Badge } from '../components/common/Badge'
import { MaterialDeductionModal } from '../components/worker/MaterialDeductionModal'
import { formatVehicle } from '../lib/formatters'
import {
  Package,
  Wrench,
  Truck,
  PackageMinus,
  AlertCircle
} from 'lucide-react'

export function WorkerVault() {
  const { currentProfile, isCaptain, assignedVehicle } = useAuth()
  const { inventory, jobs, deductMaterial } = useData()
  const { t } = useI18n()
  const [isDeductionModalOpen, setIsDeductionModalOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'equipment' | 'consumable'>('all')

  // Van inventory for this worker's assigned vehicle
  const vanStock = inventory.filter(item => {
    if (item.assigned_vehicle !== assignedVehicle) return false
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
    return true
  })

  const myJobs = jobs.filter(j => j.assigned_worker_id === currentProfile.id)

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {t('vault.title', 'مخزون')} {assignedVehicle === 'van_1' ? t('vehicle.van_1', 'شاحنة 1') : t('vehicle.van_2', 'شاحنة 2')}
          </h2>
          <p className="text-[11px] text-slate-500">
            {t('vault.desc', 'الأدوات المسندة والمستهلكات المحملة')}
          </p>
        </div>

        {/* Daily Captain Material Deduction Trigger */}
        {isCaptain && (
          <button
            onClick={() => setIsDeductionModalOpen(true)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 rtl:space-x-reverse shadow-sm transition-colors"
          >
            <PackageMinus size={14} />
            <span>{t('worker.log_material_btn', 'تسجيل خصم قطع')}</span>
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex items-center space-x-1 rtl:space-x-reverse bg-slate-200 p-1 rounded-lg text-xs font-bold">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`flex-1 py-1 rounded-md transition-colors ${categoryFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
        >
          {t('vault.all_items', 'الكل')} ({inventory.filter(i => i.assigned_vehicle === assignedVehicle).length})
        </button>
        <button
          onClick={() => setCategoryFilter('equipment')}
          className={`flex-1 py-1 rounded-md transition-colors ${categoryFilter === 'equipment' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
        >
          {t('vault.tools', 'الأدوات')}
        </button>
        <button
          onClick={() => setCategoryFilter('consumable')}
          className={`flex-1 py-1 rounded-md transition-colors ${categoryFilter === 'consumable' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
        >
          {t('vault.consumables', 'المستهلكات')}
        </button>
      </div>

      {/* Stock Cards */}
      <div className="space-y-2">
        {vanStock.map(item => (
          <div
            key={item.id}
            className="worker-card p-3.5 flex items-center justify-between space-x-3 rtl:space-x-reverse"
          >
            <div className="flex items-center space-x-2.5 rtl:space-x-reverse min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                {item.category === 'equipment' ? <Wrench size={15} /> : <Package size={15} className="text-blue-600" />}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-slate-900 truncate">{item.item_name}</p>
                <span className="text-[10px] text-slate-500 font-medium">
                  {item.category === 'equipment' ? t('vault.van_tool', 'أداة شاحنة') : t('vault.consumable_part', 'قطعة مستهلكة')}
                </span>
              </div>
            </div>

            <div className="text-right rtl:text-left shrink-0">
              <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded border ${
                item.quantity <= 0
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-slate-50 text-slate-900 border-slate-200'
              }`}>
                {item.quantity}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Material Deduction Modal for Captains */}
      {isCaptain && (
        <MaterialDeductionModal
          isOpen={isDeductionModalOpen}
          onClose={() => setIsDeductionModalOpen(false)}
          inventory={inventory}
          captainId={currentProfile.id}
          defaultVehicle={assignedVehicle}
          jobs={myJobs}
          onDeduct={deductMaterial}
        />
      )}
    </div>
  )
}
