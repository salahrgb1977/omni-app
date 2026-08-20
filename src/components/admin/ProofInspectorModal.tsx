import React, { useState } from 'react'
import { Job } from '../../types/omni'
import { Badge } from '../common/Badge'
import { formatDateTime, formatCurrency, formatDuration } from '../../lib/formatters'
import {
  X,
  CheckCircle,
  MapPin,
  Clock,
  User,
  Mic,
  Volume2,
  FileText,
  DollarSign,
  AlertCircle
} from 'lucide-react'

interface ProofInspectorModalProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
  onToggleClientPaid?: (jobId: string, isPaid: boolean) => void
}

export function ProofInspectorModal({
  job,
  isOpen,
  onClose,
  onToggleClientPaid
}: ProofInspectorModalProps) {
  if (!isOpen || !job) return null

  // Calculate task duration
  const taskDuration = job.task_duration_minutes
    ? `${job.task_duration_minutes} mins`
    : job.before_photo_taken_at && job.after_photo_taken_at
      ? formatDuration(job.before_photo_taken_at, job.after_photo_taken_at)
      : 'In Progress'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <div>
              <div className="flex items-center space-x-2">
                <Badge variant={job.status} size="sm" />
                {job.is_client_paid ? (
                  <Badge variant="paid" size="sm" label="Client Invoiced (Paid)" />
                ) : (
                  <Badge variant="unpaid" size="sm" label="Invoice Pending" />
                )}
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                {job.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Summary Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="admin-card p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Client & Location</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">{job.client_name}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 flex items-center">
                <MapPin size={12} className="mr-1 text-slate-400 shrink-0" />
                <span className="truncate">{job.address_text}</span>
              </p>
            </div>

            <div className="admin-card p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Technician</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">{job.assigned_worker_name || 'Unassigned'}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 flex items-center">
                <Clock size={12} className="mr-1 text-slate-400 shrink-0" />
                Duration: <strong className="ml-1 text-slate-900 font-mono">{taskDuration}</strong>
              </p>
            </div>

            <div className="admin-card p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Invoice Total</span>
                <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                  {formatCurrency(job.client_price)}
                </p>
              </div>

              {onToggleClientPaid && (
                <button
                  onClick={() => onToggleClientPaid(job.id, !job.is_client_paid)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
                    job.is_client_paid 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' 
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {job.is_client_paid ? 'Mark Unpaid' : 'Mark as Paid'}
                </button>
              )}
            </div>
          </div>

          {/* Admin Voice Briefing (if present) */}
          {job.admin_voice_note_url && (
            <div className="admin-card p-4 bg-slate-50 border-slate-200">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase text-slate-700 mb-2">
                <Volume2 size={15} className="text-slate-800" />
                <span>Admin Audio Briefing to Technician</span>
              </div>
              <audio src={job.admin_voice_note_url} controls className="w-full h-8" />
            </div>
          )}

          {/* SIDE-BY-SIDE BEFORE & AFTER PROOF PHOTOS */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Visual Proof of Work (Before vs After)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* BEFORE PHOTO */}
              <div className="admin-card overflow-hidden">
                <div className="p-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 uppercase">Before Service</span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {job.before_photo_taken_at ? formatDateTime(job.before_photo_taken_at) : 'Not recorded'}
                  </span>
                </div>

                <div className="relative aspect-video bg-slate-100 flex items-center justify-center">
                  {job.before_photo_url ? (
                    <>
                      <img src={job.before_photo_url} alt="Before" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 bg-black/75 text-white text-[10px] font-mono px-2 py-1 rounded">
                        GPS: {job.before_lat ? `${job.before_lat.toFixed(4)}, ${job.before_lng?.toFixed(4)}` : 'Logged'}
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">No Before photo captured</span>
                  )}
                </div>
              </div>

              {/* AFTER PHOTO */}
              <div className="admin-card overflow-hidden">
                <div className="p-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase">After Service (Completed)</span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {job.after_photo_taken_at ? formatDateTime(job.after_photo_taken_at) : 'Not recorded'}
                  </span>
                </div>

                <div className="relative aspect-video bg-slate-100 flex items-center justify-center">
                  {job.after_photo_url ? (
                    <>
                      <img src={job.after_photo_url} alt="After" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 bg-black/75 text-white text-[10px] font-mono px-2 py-1 rounded">
                        GPS: {job.after_lat ? `${job.after_lat.toFixed(4)}, ${job.after_lng?.toFixed(4)}` : 'Logged'}
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">No After photo captured</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* TECHNICIAN REPORT & AUDIO MEMO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Written Note */}
            <div className="admin-card p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Written Technician Report
              </h4>
              {job.worker_note ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 leading-relaxed font-medium">
                  {job.worker_note}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-400">
                  No text report entered.
                </div>
              )}
            </div>

            {/* Voice Memo Audio Player */}
            <div className="admin-card p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Technician Audio Voice Memo
              </h4>
              {job.worker_voice_memo_url ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700">
                    <Mic size={14} />
                    <span>Voice Memo Attached</span>
                  </div>
                  <audio src={job.worker_voice_memo_url} controls className="w-full h-8" />
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-400">
                  No voice memo recorded.
                </div>
              )}
            </div>
          </div>

          {/* Scope of Work */}
          {job.task_description && (
            <div className="admin-card p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Initial Scope & Instructions
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {job.task_description}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  )
}
