import React from 'react'
import { useI18n } from '../../contexts/I18nContext'

export type BadgeVariant = 
  | 'pending' 
  | 'in_progress' 
  | 'completed' 
  | 'paid'
  | 'unpaid'
  | 'active' 
  | 'urgent' 
  | 'neutral'
  | 'equipment'
  | 'consumable'
  | 'van_1'
  | 'van_2'
  | 'captain'

interface BadgeProps {
  variant: BadgeVariant
  label?: string
  children?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  className?: string
}

export function Badge({ variant, label, children, size = 'md', icon, className = '' }: BadgeProps) {
  const { t } = useI18n()
  const content = children || label

  const variantStyles: Record<BadgeVariant, string> = {
    pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
    in_progress: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
    completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
    paid: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
    unpaid: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
    active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
    urgent: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20',
    neutral: 'bg-slate-100 text-slate-700 ring-1 ring-slate-600/10',
    equipment: 'bg-slate-100 text-slate-800 ring-1 ring-slate-600/20',
    consumable: 'bg-blue-50 text-blue-800 ring-1 ring-blue-600/20',
    van_1: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20',
    van_2: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-600/20',
    captain: 'bg-slate-900 text-white ring-1 ring-slate-900'
  }

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-bold gap-1',
    md: 'text-xs px-2.5 py-1 font-bold gap-1.5',
    lg: 'text-sm px-3 py-1.5 font-bold gap-2'
  }

  const getTranslatedLabel = (v: BadgeVariant) => {
    switch (v) {
      case 'pending': return t('badge.pending', 'قيد الانتظار')
      case 'in_progress': return t('badge.in_progress', 'قيد التنفيذ')
      case 'completed': return t('badge.completed', 'مكتملة')
      case 'paid': return t('badge.paid', 'مسدد')
      case 'unpaid': return t('badge.unpaid', 'غير مسدد')
      case 'active': return t('badge.active', 'نشط على رأس العمل')
      case 'urgent': return t('badge.urgent', 'عاجل')
      case 'equipment': return t('badge.equipment', 'أداة / معدة')
      case 'consumable': return t('badge.consumable', 'مستهلك / قطعة غيار')
      case 'van_1': return t('badge.van_1', 'شاحنة 1')
      case 'van_2': return t('badge.van_2', 'شاحنة 2')
      case 'captain': return t('badge.captain', 'قائد الوردية')
      default: return v
    }
  }

  return (
    <span 
      className={`inline-flex items-center rounded-md tracking-tight ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{content || getTranslatedLabel(variant)}</span>
    </span>
  )
}
