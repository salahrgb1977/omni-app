import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminLayout } from './components/admin/AdminLayout'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminShifts } from './pages/admin/AdminShifts'
import { AdminJobs } from './pages/admin/AdminJobs'
import { AdminInventory } from './pages/admin/AdminInventory'
import { AdminWorkers } from './pages/admin/AdminWorkers'
import { AdminPayroll } from './pages/admin/AdminPayroll'

import { WorkerLayout } from './components/WorkerLayout'
import { WorkerJobsList } from './pages/WorkerJobsList'
import { WorkerJobDetail } from './pages/WorkerJobDetail'
import { WorkerVault } from './pages/WorkerVault'
import { WorkerEarnings } from './pages/WorkerEarnings'
import { WorkerProfile } from './pages/WorkerProfile'

export function App() {
  return (
    <Routes>
      {/* Admin Operations Command */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="shifts" element={<AdminShifts />} />
        <Route path="jobs" element={<AdminJobs />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="workers" element={<AdminWorkers />} />
        <Route path="payroll" element={<AdminPayroll />} />
      </Route>

      {/* Field Worker Mobile PWA */}
      <Route path="/worker" element={<WorkerLayout />}>
        <Route index element={<WorkerJobsList />} />
        <Route path="job/:id" element={<WorkerJobDetail />} />
        <Route path="vault" element={<WorkerVault />} />
        <Route path="earnings" element={<WorkerEarnings />} />
        <Route path="profile" element={<WorkerProfile />} />
      </Route>

      {/* Default fallback */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}
export default App
