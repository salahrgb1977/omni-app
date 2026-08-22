import React from 'react'
import { useData } from '../../contexts/DataContext'
import { useI18n } from '../../contexts/I18nContext'
import { Badge } from '../../components/common/Badge'
import { formatCurrency, formatVehicle } from '../../lib/formatters'
import {
  Users,
  Award,
  Clock,
  CheckCircle,
  Truck,
  DollarSign,
  TrendingUp,
  FileCheck
} from 'lucide-react'

export function AdminWorkers() {
  const { profiles, jobs, shifts } = useData()
  const { t } = useI18n()
  const workers = profiles.filter(p => p.role === 'worker')

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150">
      
      {/* Header */}
      <div>
        <h1 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900">
          {t('workers.title', 'بطاقات تقييم أداء الفنيين')}
        </h1>
        <p className="text-xs text-slate-500">
          {t('workers.desc', 'مؤشرات المساءلة، ونسب الالتزام بإثباتات الصور، وأسعار الساعة، والشاحنات المسندة.')}
        </p>
      </div>

      {/* Scorecards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {workers.map(worker => {
          const workerJobs = jobs.filter(j => j.assigned_worker_id === worker.id)
          const completedJobs = workerJobs.filter(j => j.status === 'completed')
          const workerShifts = shifts.filter(s => s.worker_id === worker.id)
          const activeShift = workerShifts.find(s => !s.end_time)
          
          // Photo proof compliance
          const compliantJobs = completedJobs.filter(j => j.before_photo_url && j.after_photo_url).length
          const photoComplianceRate = completedJobs.length > 0
            ? Math.round((compliantJobs / completedJobs.length) * 100)
            : 100

          return (
            <div
              key={worker.id}
              className="admin-card p-4 sm:p-5 flex flex-col justify-between space-y-3.5 sm:space-y-4 hover:border-slate-300 transition-all"
            >
              {/* Profile Card Header */}
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="relative">
                    <img
                      src={worker.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                      alt={worker.full_name}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                    />
                    {activeShift && (
                      <span className="absolute -bottom-1 -right-1 rtl:-right-auto rtl:-left-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>

                  <div className="text-right rtl:text-left">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {t('workers.score', 'التقييم')}
                    </span>
                    <span className="font-mono font-bold text-base text-slate-900">
                      {worker.performance_score}%
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                    <h3 className="font-bold text-sm text-slate-900">{worker.full_name}</h3>
                    {worker.is_daily_captain && (
                      <span className="bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {t('badge.captain', 'قائد')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium flex items-center">
                    <Truck size={12} className="mr-1 rtl:mr-0 rtl:ml-1 text-slate-400" />
                    {worker.assigned_vehicle === 'van_1' ? t('vehicle.van_1', 'شاحنة 1') : t('vehicle.van_2', 'شاحنة 2')}
                  </p>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center">
                    <CheckCircle size={13} className="mr-1 rtl:mr-0 rtl:ml-1 text-emerald-600 shrink-0" />
                    {t('workers.completed_jobs', 'المهام المكتملة')}
                  </span>
                  <span className="font-bold font-mono text-slate-900">{completedJobs.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center">
                    <FileCheck size={13} className="mr-1 rtl:mr-0 rtl:ml-1 text-blue-600 shrink-0" />
                    {t('workers.compliance_rate', 'نسبة الالتزام بالصور')}
                  </span>
                  <span className="font-bold font-mono text-slate-900">{photoComplianceRate}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center">
                    <DollarSign size={13} className="mr-1 rtl:mr-0 rtl:ml-1 text-slate-400 shrink-0" />
                    {t('workers.hourly_rate', 'سعر الساعة')}
                  </span>
                  <span className="font-bold font-mono text-slate-900">{formatCurrency(worker.hourly_rate)}/hr</span>
                </div>
              </div>

              {/* Footer Status */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">{t('workers.field_status', 'الحالة الميدانية')}</span>
                {activeShift ? (
                  <Badge variant="active" size="sm" label={t('workers.on_shift', 'على رأس العمل')} />
                ) : (
                  <Badge variant="neutral" size="sm" label={t('workers.off_duty', 'خارج الدوام')} />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
