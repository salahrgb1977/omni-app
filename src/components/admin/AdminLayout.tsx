import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'
import { CreateJobModal } from './CreateJobModal'
import { useData } from '../../contexts/DataContext'

export function AdminLayout() {
  const { profiles, createJob } = useData()
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader onOpenCreateJob={() => setIsCreateJobOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Create Job Modal */}
      <CreateJobModal
        profiles={profiles}
        isOpen={isCreateJobOpen}
        onClose={() => setIsCreateJobOpen(false)}
        onCreateJob={createJob}
      />
    </div>
  )
}
