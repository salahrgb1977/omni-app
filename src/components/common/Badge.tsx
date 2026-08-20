import React from 'react'

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
    sm: 'text-[11px] px-2 py-0.5 font-semibold gap-1',
    md: 'text-xs px-2.5 py-1 font-semibold gap-1.5',
    lg: 'text-sm px-3 py-1.5 font-semibold gap-2'
  }

  const defaultLabels: Partial<Record<BadgeVariant, string>> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
    paid: 'Paid',
    unpaid: 'Unpaid',
    active: 'Active On Shift',
    urgent: 'Urgent',
    equipment: 'Tool / Equipment',
    consumable: 'Consumable',
    van_1: 'Van 1',
    van_2: 'Van 2',
    captain: 'Daily Captain'
  }

  return (
    <span 
      className={`inline-flex items-center rounded-md font-medium tracking-tight ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{content || defaultLabels[variant] || variant}</span>
    </span>
  )
}
