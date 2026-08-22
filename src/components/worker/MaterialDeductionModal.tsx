import React, { useState } from 'react'
import { InventoryItem, VehicleId, Job } from '../../types/omni'
import { useI18n } from '../../contexts/I18nContext'
import { formatVehicle } from '../../lib/formatters'
import { X, PackageMinus, Truck, Check, AlertCircle } from 'lucide-react'

interface MaterialDeductionModalProps {
  isOpen: boolean
  onClose: () => void
  inventory: InventoryItem[]
  captainId: string
  defaultVehicle: VehicleId
  jobs: Job[]
  activeJobId?: string | null
  onDeduct: (
    jobId: string | null,
    captainId: string,
    itemId: string,
    quantity: number,
    vehicle: VehicleId
  ) => Promise<void>
}

export function MaterialDeductionModal({
  isOpen,
  onClose,
  inventory,
  captainId,
  defaultVehicle,
  jobs,
  activeJobId,
  onDeduct
}: MaterialDeductionModalProps) {
  const { t } = useI18n()
  if (!isOpen) return null

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleId>(defaultVehicle)
  const [selectedItemId, setSelectedItemId] = useState<string>('')
  const [quantity, setQuantity] = useState<string>('1')
  const [selectedJobId, setSelectedJobId] = useState<string>(activeJobId || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState(false)

  // Filter consumables for selected vehicle
  const vehicleConsumables = inventory.filter(
    item => item.assigned_vehicle === selectedVehicle && item.category === 'consumable'
  )

  const selectedItem = inventory.find(i => i.id === selectedItemId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItemId || !quantity || Number(quantity) <= 0) return

    setIsSubmitting(true)
    try {
      await onDeduct(
        selectedJobId || null,
        captainId,
        selectedItemId,
        Number(quantity),
        selectedVehicle
      )
      setSuccessMsg(true)
      setTimeout(() => {
        setSuccessMsg(false)
        onClose()
      }, 1000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <PackageMinus size={18} className="text-slate-300" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider">
                {t('deduct.title', 'تسجيل خصم المواد (خاص بقائد الشاحنة)')}
              </h3>
              <span className="text-[10px] text-slate-400">
                {t('deduct.desc', 'تسجيل القطع المستهلكة لحساب التكاليف ومزامنة المخزون')}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 sm:space-y-4">
          {successMsg ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Check size={24} />
              </div>
              <p className="text-sm font-bold text-slate-900">{t('deduct.success_title', 'تم تسجيل الخصم بنجاح')}</p>
              <p className="text-xs text-slate-500">{t('deduct.success_desc', 'تم تحديث مخزون الشاحنة وربط المواد بأمر العمل.')}</p>
            </div>
          ) : (
            <>
              {/* Van Selector */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  {t('deduct.source_van', 'الشاحنة المصدر')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedVehicle('van_1')
                      setSelectedItemId('')
                    }}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center space-x-1.5 rtl:space-x-reverse transition-colors ${
                      selectedVehicle === 'van_1'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Truck size={14} />
                    <span>{t('vehicle.van_1', 'شاحنة 1')}</span>
                    {defaultVehicle === 'van_1' && <span className="text-[10px] opacity-75">{t('deduct.my_van', '(شاحنتي)')}</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedVehicle('van_2')
                      setSelectedItemId('')
                    }}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center space-x-1.5 rtl:space-x-reverse transition-colors ${
                      selectedVehicle === 'van_2'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Truck size={14} />
                    <span>{t('vehicle.van_2', 'شاحنة 2')}</span>
                    {defaultVehicle === 'van_2' && <span className="text-[10px] opacity-75">{t('deduct.my_van', '(شاحنتي)')}</span>}
                  </button>
                </div>
              </div>

              {/* Consumable Item Selector */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  {t('deduct.select_part', 'اختر القطعة المستهلكة *')}
                </label>
                <select
                  required
                  value={selectedItemId}
                  onChange={e => setSelectedItemId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="">{t('deduct.choose_part', '-- اختر القطعة --')}</option>
                  {vehicleConsumables.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.item_name} ({t('inv.col_stock', 'المخزون')}: {item.quantity})
                    </option>
                  ))}
                </select>
                {selectedItem && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    {t('deduct.current_stock', 'المخزون الحالي:')} <strong className="font-mono text-slate-800">{selectedItem.quantity}</strong>
                    {selectedItem.quantity <= 0 && (
                      <span className="text-amber-600 mx-1">{t('deduct.negative_note', '(سيتم تسجيل مخزون سالب)')}</span>
                    )}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  {t('deduct.qty_deducted', 'الكمية المستهلكة *')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Related Job */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  {t('deduct.attach_job', 'ربط بأمر العمل (اختياري)')}
                </label>
                <select
                  value={selectedJobId}
                  onChange={e => setSelectedJobId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="">{t('deduct.general_use', '-- استهلاك عام (غير مرتبط بمهمة) --')}</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.client_name} - {j.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end space-x-2 rtl:space-x-reverse">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  {t('create_job.cancel', 'إلغاء')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedItemId}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold transition-colors"
                >
                  {isSubmitting ? t('deduct.logging', 'جاري التسجيل...') : t('deduct.confirm', 'تأكيد خصم المواد')}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
