import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../contexts/I18nContext'
import { formatCurrency, formatVehicle, formatPhoneNumber } from '../lib/formatters'
import { User, Truck, Phone, Award, Shield, DollarSign } from 'lucide-react'

export function WorkerProfile() {
  const { currentProfile, isCaptain, assignedVehicle } = useAuth()
  const { t } = useI18n()

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      
      {/* Header */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          {t('profile.title', 'الملف التعريفي للفني')}
        </h2>
        <p className="text-[11px] text-slate-500">
          {t('profile.desc', 'بيانات الحساب، الشاحنة المسندة، وتقييم الأداء')}
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="worker-card p-4 sm:p-5 space-y-4">
        <div className="flex items-center space-x-3.5 rtl:space-x-reverse">
          <img
            src={currentProfile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt={currentProfile.full_name}
            className="w-14 h-14 rounded-xl object-cover border border-slate-200"
          />
          <div>
            <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
              <h3 className="font-bold text-base text-slate-900 leading-tight">
                {currentProfile.full_name}
              </h3>
              {isCaptain && (
                <span className="bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {t('badge.captain', 'قائد')}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              ID: #{currentProfile.id.slice(-6)}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 divide-y divide-slate-100 text-xs">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 flex items-center">
              <Truck size={14} className="mr-2 rtl:mr-0 rtl:ml-2 text-slate-400 shrink-0" />
              {t('profile.assigned_vehicle', 'الشاحنة المسندة')}
            </span>
            <span className="font-bold text-slate-900">
              {assignedVehicle === 'van_1' ? t('vehicle.van_1', 'شاحنة الخدمة 1') : t('vehicle.van_2', 'شاحنة الخدمة 2')}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 flex items-center">
              <Shield size={14} className="mr-2 rtl:mr-0 rtl:ml-2 text-slate-400 shrink-0" />
              {t('profile.authority', 'الصلاحية الميدانية')}
            </span>
            <span className="font-bold text-slate-900">
              {isCaptain ? t('profile.captain_auth', 'قائد شاحنة يومي (صلاحية خصم المواد)') : t('profile.tech_auth', 'فني صيانة ميداني')}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 flex items-center">
              <Award size={14} className="mr-2 rtl:mr-0 rtl:ml-2 text-blue-600 shrink-0" />
              {t('profile.score', 'تقييم الموثوقية')}
            </span>
            <span className="font-mono font-bold text-slate-900">{currentProfile.performance_score}%</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 flex items-center">
              <DollarSign size={14} className="mr-2 rtl:mr-0 rtl:ml-2 text-emerald-600 shrink-0" />
              {t('profile.rate', 'سعر الساعة الأساسي')}
            </span>
            <span className="font-mono font-bold text-slate-900">{formatCurrency(currentProfile.hourly_rate || 45)}/hr</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 flex items-center">
              <Phone size={14} className="mr-2 rtl:mr-0 rtl:ml-2 text-slate-400 shrink-0" />
              {t('profile.phone', 'رقم الهاتف المباشر')}
            </span>
            <span className="font-mono text-slate-900">{formatPhoneNumber(currentProfile.phone_number)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
