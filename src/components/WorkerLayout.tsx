import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { formatVehicle, formatTime } from '../lib/formatters'
import {
  CheckSquare,
  Package,
  DollarSign,
  User,
  Power,
  Clock,
  Truck,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react'

export function WorkerLayout() {
  const { currentProfile, currentRole, setCurrentRole, isCaptain, assignedVehicle } = useAuth()
  const { shifts, startShift, endShift, addLocationPing } = useData()
  const navigate = useNavigate()
  const location = useLocation()

  // Find active shift for the logged-in technician
  const myActiveShift = shifts.find(s => s.worker_id === currentProfile.id && !s.end_time)
  const isShiftActive = Boolean(myActiveShift)

  // Silent 5-minute background GPS tracking loop
  useEffect(() => {
    if (!isShiftActive || !myActiveShift) return

    const sendSilentPing = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            addLocationPing(myActiveShift.id, currentProfile.id, pos.coords.latitude, pos.coords.longitude)
          },
          () => {
            // Fallback simulation coordinate in Austin area if browser geolocation blocked
            const baseLat = 30.2672 + (Math.random() - 0.5) * 0.005
            const baseLng = -97.7431 + (Math.random() - 0.5) * 0.005
            addLocationPing(myActiveShift.id, currentProfile.id, baseLat, baseLng)
          }
        )
      }
    }

    // Ping every 5 minutes (300,000 ms)
    const interval = setInterval(sendSilentPing, 300000)
    return () => clearInterval(interval)
  }, [isShiftActive, myActiveShift, currentProfile.id, addLocationPing])

  const handleStartShift = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          startShift(currentProfile.id, pos.coords.latitude, pos.coords.longitude)
        },
        () => {
          startShift(currentProfile.id, 30.2672, -97.7431)
        }
      )
    } else {
      startShift(currentProfile.id, 30.2672, -97.7431)
    }
  }

  const handleEndShift = () => {
    if (!myActiveShift) return
    if (confirm('Are you sure you want to end your shift?')) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            endShift(myActiveShift.id, pos.coords.latitude, pos.coords.longitude)
          },
          () => {
            endShift(myActiveShift.id, 30.2672, -97.7431)
          }
        )
      } else {
        endShift(myActiveShift.id, 30.2672, -97.7431)
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans max-w-lg mx-auto shadow-xl border-x border-slate-200">
      
      {/* Worker App Header (Clean checklist style, NO radar pulses) */}
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={currentProfile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt={currentProfile.full_name}
            className="w-9 h-9 rounded-lg object-cover border border-slate-700"
          />
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-sm font-bold text-white leading-tight">
                {currentProfile.full_name}
              </h1>
              {isCaptain && (
                <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                  CAPTAIN
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 flex items-center mt-0.5">
              <Truck size={11} className="mr-1 text-slate-400" />
              {formatVehicle(assignedVehicle)}
            </p>
          </div>
        </div>

        {/* Shift Control Button */}
        <div className="flex items-center space-x-2">
          {isShiftActive ? (
            <button
              onClick={handleEndShift}
              className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center space-x-1 transition-colors"
            >
              <Power size={12} />
              <span>End Shift</span>
            </button>
          ) : (
            <button
              onClick={handleStartShift}
              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1 transition-colors"
            >
              <Power size={12} />
              <span>Start Shift</span>
            </button>
          )}

          {/* Switch back to Admin */}
          <button
            onClick={() => {
              setCurrentRole('admin')
              navigate('/admin')
            }}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Return to Admin Command"
          >
            <ShieldCheck size={16} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 overflow-y-auto pb-20">
        {!isShiftActive ? (
          /* HARD SHIFT GATE: App locks until worker taps Start Shift */
          <div className="py-12 px-6 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-200 text-slate-700 rounded-2xl flex items-center justify-center mx-auto">
              <Clock size={32} />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Shift Gate Locked
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                You must clock in to access your assigned work orders and log task evidence.
              </p>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl text-left text-xs space-y-1.5 text-slate-600 shadow-sm max-w-xs mx-auto">
              <p className="font-semibold text-slate-800">Technician Status:</p>
              <p>• Assigned: <strong>{currentProfile.full_name}</strong></p>
              <p>• Vehicle: <strong>{formatVehicle(assignedVehicle)}</strong></p>
              <p>• Role: <strong>{isCaptain ? 'Daily Van Captain' : 'Technician'}</strong></p>
            </div>

            <button
              onClick={handleStartShift}
              className="w-full max-w-xs mx-auto py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-2"
            >
              <Power size={16} />
              <span>Start Today's Shift & Clock In</span>
            </button>
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      {/* Bottom Mobile Tab Bar */}
      {isShiftActive && (
        <nav className="bg-white border-t border-slate-200 p-2 fixed bottom-0 left-0 right-0 max-w-lg mx-auto flex items-center justify-around z-30 shadow-lg">
          <NavLink
            to="/worker"
            end
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-bold transition-colors ${
                isActive ? 'text-slate-900 bg-slate-100' : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <CheckSquare size={18} className="mb-0.5" />
            <span>My Tasks</span>
          </NavLink>

          <NavLink
            to="/worker/vault"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-bold transition-colors ${
                isActive ? 'text-slate-900 bg-slate-100' : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <Package size={18} className="mb-0.5" />
            <span>Van Stock</span>
          </NavLink>

          <NavLink
            to="/worker/earnings"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-bold transition-colors ${
                isActive ? 'text-slate-900 bg-slate-100' : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <DollarSign size={18} className="mb-0.5" />
            <span>My Shifts</span>
          </NavLink>

          <NavLink
            to="/worker/profile"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-bold transition-colors ${
                isActive ? 'text-slate-900 bg-slate-100' : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <User size={18} className="mb-0.5" />
            <span>Profile</span>
          </NavLink>
        </nav>
      )}
    </div>
  )
}
