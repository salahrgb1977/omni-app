import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { WorkerLayout } from './components/WorkerLayout'
import { AdminLayout } from './components/AdminLayout'
import { WorkerJobs } from './pages/WorkerJobs'
import { WorkerJobDetail } from './pages/WorkerJobDetail'
import { WorkerEarnings } from './pages/WorkerEarnings'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminLedger } from './pages/AdminLedger'
import { AdminInventory } from './pages/AdminInventory'
import { AdminClients } from './pages/AdminClients'
import { AuthLogin } from './pages/AuthLogin'
import { AuthProvider, useAuth } from './contexts/AuthContext'

import { WorkerEquipment } from './pages/WorkerEquipment'

function WorkerProfile() {
  return <div className="p-4"><h2>Worker Profile</h2></div>
}

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole: 'admin' | 'worker' }) {
  const { user, role, loading } = useAuth()

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  
  if (!user) return <Navigate to="/login" replace />
  
  // If role is loaded and doesn't match required role, redirect them
  if (role && role !== requiredRole) {
    return <Navigate to={role === 'admin' ? '/admin' : '/worker'} replace />
  }

  // If role is still null (maybe fetching), could wait or assume it matches till we know.
  // Wait, our AuthContext sets loading=false ONLY AFTER fetching role if user exists.
  // So if loading is false and user exists, role MUST be set (unless network error).
  
  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<AuthLogin />} />

          {/* Worker Routes */}
          <Route path="/worker" element={<ProtectedRoute requiredRole="worker"><WorkerLayout /></ProtectedRoute>}>
            <Route index element={<WorkerJobs />} />
            <Route path="job/:id" element={<WorkerJobDetail />} />
            <Route path="equipment" element={<WorkerEquipment />} />
            <Route path="earnings" element={<WorkerEarnings />} />
            <Route path="profile" element={<WorkerProfile />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="ledger" element={<AdminLedger />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="settings" element={<div className="p-8">Settings Placeholder</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
