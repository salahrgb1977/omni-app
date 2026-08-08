import { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Briefcase, Package, User, DollarSign, Play, Square } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function WorkerLayout() {
  const { user } = useAuth()
  const [activeShift, setActiveShift] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const pingInterval = useRef<number | null>(null)

  // On mount/auth change, check if there's an ongoing shift
  useEffect(() => {
    if (user) {
      checkActiveShift()
    }
    return () => {
      if (pingInterval.current) clearInterval(pingInterval.current)
    }
  }, [user])

  const checkActiveShift = async () => {
    try {
      const { data } = await supabase
        .from('shifts')
        .select('*')
        .eq('worker_id', user?.id)
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setActiveShift(data)
        startLocationTracking(data.id)
      }
    } catch {
      console.error('No active shift found or error checking shift.')
    } finally {
      setLoading(false)
    }
  }

  const startShift = () => {
    setError('')
    setLoading(true)
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      setLoading(false)
      return
    }

    // Require location access BEFORE allowing the shift to start
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords
        
        // 1. Create the shift in the database
        const { data: shift, error: shiftError } = await supabase
          .from('shifts')
          .insert({ worker_id: user?.id })
          .select()
          .single()
          
        if (shiftError) throw shiftError

        // 2. Immediately send the first location ping
        await supabase.from('location_pings').insert({
          shift_id: shift.id,
          worker_id: user?.id,
          lat: latitude,
          lng: longitude
        })

        setActiveShift(shift)
        startLocationTracking(shift.id)
      } catch (err: any) {
        // We explicitly use err here, so TS won't complain
        setError(err.message || 'Failed to start shift')
      } finally {
        setLoading(false)
      }
    }, () => {
      setError('GPS is required to start your shift. Please enable location permissions.')
      setLoading(false)
    })
  }

  const endShift = async () => {
    if (!activeShift) return
    setLoading(true)
    try {
      await supabase
        .from('shifts')
        .update({ end_time: new Date().toISOString() })
        .eq('id', activeShift.id)
        
      setActiveShift(null)
      if (pingInterval.current) {
        clearInterval(pingInterval.current)
        pingInterval.current = null
      }
    } catch {
      setError('Failed to end shift')
    } finally {
      setLoading(false)
    }
  }

  const startLocationTracking = (shiftId: string) => {
    // Clear any existing intervals
    if (pingInterval.current) clearInterval(pingInterval.current)
    
    // Ping location every 5 minutes (300000 ms) silently
    pingInterval.current = window.setInterval(() => {
      if (!navigator.geolocation) return
      
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          await supabase.from('location_pings').insert({
            shift_id: shiftId,
            worker_id: user?.id,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          })
        } catch {
          // Fail silently in the background
        }
      })
    }, 300000)
  }

  if (loading && !activeShift) {
    return <div className="p-4 bg-slate-50 min-h-screen flex items-center justify-center text-slate-500 font-medium">Authenticating shift status...</div>
  }

  // --- THE SHIFT GATE ---
  if (!activeShift) {
    return (
      <div className="flex flex-col h-screen bg-slate-950 justify-center items-center px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-slate-950"></div>
        <div className="z-10 w-full max-w-sm text-center">
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Ready to Work?</h1>
          <p className="text-slate-400 mb-12 font-medium">GPS location is required to begin your shift.</p>
          
          {error && <div className="mb-6 p-4 bg-rose-500/10 text-rose-400 rounded-xl text-sm font-medium">{error}</div>}
          
          <button 
            onClick={startShift}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-2xl py-6 rounded-3xl shadow-[0_0_40px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center disabled:opacity-50"
          >
            <Play size={28} className="mr-3" fill="currentColor" />
            START SHIFT
          </button>
        </div>
      </div>
    )
  }

  // --- ACTIVE APP (ON SHIFT) ---
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      
      <div className="bg-indigo-600 text-white px-4 py-3 flex justify-between items-center shadow-md z-20">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
          <span className="font-bold text-sm tracking-wide uppercase">On Shift</span>
        </div>
        <button onClick={endShift} className="bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg text-xs font-bold flex items-center transition-colors">
          <Square size={12} className="mr-1.5" fill="currentColor" />
          END SHIFT
        </button>
      </div>

      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 w-full glass-nav flex justify-around items-center h-20 max-w-md mx-auto px-2 z-20">
        <NavLink 
          to="/worker" 
          end
          className={({isActive}) => `flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 ${isActive ? 'bg-indigo-50 text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          style={{ width: '64px', height: '64px' }}
        >
          <Briefcase size={22} className="mb-1" />
          <span className="text-[10px] font-semibold">Jobs</span>
        </NavLink>
        <NavLink 
          to="/worker/equipment" 
          className={({isActive}) => `flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 ${isActive ? 'bg-indigo-50 text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          style={{ width: '64px', height: '64px' }}
        >
          <Package size={22} className="mb-1" />
          <span className="text-[10px] font-semibold">Vault</span>
        </NavLink>
        <NavLink 
          to="/worker/earnings" 
          className={({isActive}) => `flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 ${isActive ? 'bg-indigo-50 text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          style={{ width: '64px', height: '64px' }}
        >
          <DollarSign size={22} className="mb-1" />
          <span className="text-[10px] font-semibold">Pay</span>
        </NavLink>
        <NavLink 
          to="/worker/profile" 
          className={({isActive}) => `flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 ${isActive ? 'bg-indigo-50 text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          style={{ width: '64px', height: '64px' }}
        >
          <User size={22} className="mb-1" />
          <span className="text-[10px] font-semibold">Profile</span>
        </NavLink>
      </nav>
    </div>
  )
}
