import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  Profile,
  Shift,
  LocationPing,
  InventoryItem,
  InventoryLog,
  Job,
  VehicleId,
  ItemCategory,
  JobStatus
} from '../types/omni'
import { supabase, isSupabaseConfigured, rpcLogConsumableUsage } from '../lib/supabase'

interface DataContextType {
  profiles: Profile[]
  shifts: Shift[]
  locationPings: LocationPing[]
  inventory: InventoryItem[]
  inventoryLogs: InventoryLog[]
  jobs: Job[]
  isLoading: boolean
  
  // Refresh & Sync
  refreshAllData: () => Promise<void>
  
  // Captain & Vehicle Management
  setCaptain: (workerId: string, vehicle: VehicleId, isCaptain: boolean) => Promise<void>
  setWorkerVehicle: (workerId: string, vehicle: VehicleId) => Promise<void>
  
  // Inventory Management (Admin)
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>
  deleteInventoryItem: (id: string) => Promise<void>
  
  // Material Deduction (Captains Only)
  deductMaterial: (
    jobId: string | null,
    captainId: string,
    itemId: string,
    quantity: number,
    vehicle: VehicleId
  ) => Promise<void>
  
  // Shifts & GPS
  startShift: (workerId: string, lat?: number, lng?: number) => Promise<Shift>
  endShift: (shiftId: string, lat?: number, lng?: number) => Promise<void>
  addLocationPing: (shiftId: string, workerId: string, lat: number, lng: number) => Promise<void>
  markShiftPaid: (shiftId: string, isPaid: boolean, amount?: number) => Promise<void>
  
  // Jobs & Stealth Accountability
  createJob: (jobData: Partial<Job>) => Promise<Job>
  startJobBeforePhoto: (jobId: string, photoUrl: string, lat?: number, lng?: number) => Promise<void>
  setJobAfterPhoto: (jobId: string, photoUrl: string, lat?: number, lng?: number) => Promise<void>
  submitJobReport: (jobId: string, note?: string, voiceMemoUrl?: string) => Promise<void>
  completeJob: (jobId: string, lat?: number, lng?: number) => Promise<void>
  setJobClientPaid: (jobId: string, isPaid: boolean) => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const OFFLINE_QUEUE_KEY = 'omni_hvac_offline_queue'
const CACHE_PREFIX = 'omni_hvac_cache_'

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const cached = localStorage.getItem(CACHE_PREFIX + 'profiles')
    return cached ? JSON.parse(cached) : []
  })

  const [shifts, setShifts] = useState<Shift[]>(() => {
    const cached = localStorage.getItem(CACHE_PREFIX + 'shifts')
    return cached ? JSON.parse(cached) : []
  })

  const [locationPings, setLocationPings] = useState<LocationPing[]>(() => {
    const cached = localStorage.getItem(CACHE_PREFIX + 'pings')
    return cached ? JSON.parse(cached) : []
  })

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const cached = localStorage.getItem(CACHE_PREFIX + 'inventory')
    return cached ? JSON.parse(cached) : []
  })

  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>(() => {
    const cached = localStorage.getItem(CACHE_PREFIX + 'inventory_logs')
    return cached ? JSON.parse(cached) : []
  })

  const [jobs, setJobs] = useState<Job[]>(() => {
    const cached = localStorage.getItem(CACHE_PREFIX + 'jobs')
    return cached ? JSON.parse(cached) : []
  })

  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Update local cache for offline resilience
  useEffect(() => {
    localStorage.setItem(CACHE_PREFIX + 'profiles', JSON.stringify(profiles))
  }, [profiles])
  useEffect(() => {
    localStorage.setItem(CACHE_PREFIX + 'shifts', JSON.stringify(shifts))
  }, [shifts])
  useEffect(() => {
    localStorage.setItem(CACHE_PREFIX + 'pings', JSON.stringify(locationPings))
  }, [locationPings])
  useEffect(() => {
    localStorage.setItem(CACHE_PREFIX + 'inventory', JSON.stringify(inventory))
  }, [inventory])
  useEffect(() => {
    localStorage.setItem(CACHE_PREFIX + 'inventory_logs', JSON.stringify(inventoryLogs))
  }, [inventoryLogs])
  useEffect(() => {
    localStorage.setItem(CACHE_PREFIX + 'jobs', JSON.stringify(jobs))
  }, [jobs])

  // --- LIVE SUPABASE DATA FETCHING ---
  const fetchLiveProfiles = async () => {
    if (!isSupabaseConfigured) return
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (data) setProfiles(data as Profile[])
  }

  const fetchLiveShifts = async () => {
    if (!isSupabaseConfigured) return
    const { data } = await supabase.from('shifts').select('*').order('start_time', { ascending: false })
    if (data) setShifts(data as Shift[])
  }

  const fetchLiveLocationPings = async () => {
    if (!isSupabaseConfigured) return
    const { data } = await supabase.from('location_pings').select('*').order('timestamp', { ascending: false }).limit(200)
    if (data) setLocationPings(data as LocationPing[])
  }

  const fetchLiveInventory = async () => {
    if (!isSupabaseConfigured) return
    const { data } = await supabase.from('inventory').select('*').order('created_at', { ascending: false })
    if (data) setInventory(data as InventoryItem[])
  }

  const fetchLiveInventoryLogs = async () => {
    if (!isSupabaseConfigured) return
    const { data } = await supabase.from('inventory_logs').select('*').order('timestamp', { ascending: false })
    if (data) setInventoryLogs(data as InventoryLog[])
  }

  const fetchLiveJobs = async () => {
    if (!isSupabaseConfigured) return
    const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
    if (data) setJobs(data as Job[])
  }

  const refreshAllData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false)
      return
    }

    try {
      await Promise.all([
        fetchLiveProfiles(),
        fetchLiveShifts(),
        fetchLiveLocationPings(),
        fetchLiveInventory(),
        fetchLiveInventoryLogs(),
        fetchLiveJobs()
      ])
    } catch (err) {
      console.warn('Error fetching live Supabase data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Mount Fetch & Realtime Subscriptions
  useEffect(() => {
    refreshAllData()

    if (!isSupabaseConfigured) return

    // 1. Realtime Jobs Channel
    const jobsChannel = supabase
      .channel('public:jobs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
        fetchLiveJobs()
      })
      .subscribe()

    // 2. Realtime Shifts Channel
    const shiftsChannel = supabase
      .channel('public:shifts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shifts' }, () => {
        fetchLiveShifts()
      })
      .subscribe()

    // 3. Realtime Location Pings Channel
    const pingsChannel = supabase
      .channel('public:location_pings')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'location_pings' }, payload => {
        if (payload.new) {
          setLocationPings(prev => [payload.new as LocationPing, ...prev])
        }
      })
      .subscribe()

    // 4. Realtime Inventory Channel
    const inventoryChannel = supabase
      .channel('public:inventory')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => {
        fetchLiveInventory()
      })
      .subscribe()

    // 5. Realtime Inventory Logs Channel
    const inventoryLogsChannel = supabase
      .channel('public:inventory_logs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_logs' }, () => {
        fetchLiveInventoryLogs()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(jobsChannel)
      supabase.removeChannel(shiftsChannel)
      supabase.removeChannel(pingsChannel)
      supabase.removeChannel(inventoryChannel)
      supabase.removeChannel(inventoryLogsChannel)
    }
  }, [refreshAllData])

  // --- CAPTAIN & VEHICLE ACTIONS ---
  const setCaptain = async (workerId: string, vehicle: VehicleId, isCaptain: boolean) => {
    // Optimistic local update
    setProfiles(prev => prev.map(p => {
      if (isCaptain && p.assigned_vehicle === vehicle && p.id !== workerId) {
        return { ...p, is_daily_captain: false }
      }
      if (p.id === workerId) {
        return { ...p, is_daily_captain: isCaptain, assigned_vehicle: vehicle }
      }
      return p
    }))

    if (isSupabaseConfigured) {
      if (isCaptain) {
        // Unset other captains on this vehicle
        await supabase
          .from('profiles')
          .update({ is_daily_captain: false })
          .eq('assigned_vehicle', vehicle)
      }

      await supabase
        .from('profiles')
        .update({ is_daily_captain: isCaptain, assigned_vehicle: vehicle })
        .eq('id', workerId)
    }
  }

  const setWorkerVehicle = async (workerId: string, vehicle: VehicleId) => {
    setProfiles(prev => prev.map(p => p.id === workerId ? { ...p, assigned_vehicle: vehicle } : p))

    if (isSupabaseConfigured) {
      await supabase
        .from('profiles')
        .update({ assigned_vehicle: vehicle })
        .eq('id', workerId)
    }
  }

  // --- INVENTORY MANAGEMENT (ADMIN) ---
  const addInventoryItem = async (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
      created_at: new Date().toISOString()
    }

    setInventory(prev => [newItem, ...prev])

    if (isSupabaseConfigured) {
      const { data } = await supabase.from('inventory').insert([{
        item_name: item.item_name,
        category: item.category,
        quantity: item.quantity,
        assigned_vehicle: item.assigned_vehicle
      }]).select().single()

      if (data) {
        setInventory(prev => prev.map(i => i.id === newItem.id ? (data as InventoryItem) : i))
      }
    }
  }

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item))

    if (isSupabaseConfigured) {
      await supabase.from('inventory').update(updates).eq('id', id)
    }
  }

  const deleteInventoryItem = async (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id))

    if (isSupabaseConfigured) {
      await supabase.from('inventory').delete().eq('id', id)
    }
  }

  // --- ATOMIC MATERIAL DEDUCTION (CAPTAINS ONLY) ---
  const deductMaterial = async (
    jobId: string | null,
    captainId: string,
    itemId: string,
    quantity: number,
    vehicle: VehicleId
  ) => {
    const item = inventory.find(i => i.id === itemId)
    const captain = profiles.find(p => p.id === captainId)

    // 1. Optimistic update
    setInventory(prev => prev.map(inv => {
      if (inv.id === itemId) {
        return { ...inv, quantity: Number((inv.quantity - quantity).toFixed(2)) }
      }
      return inv
    }))

    const newLog: InventoryLog = {
      id: `log-${Date.now()}`,
      job_id: jobId,
      captain_id: captainId,
      captain_name: captain?.full_name || 'Captain',
      item_id: itemId,
      item_name: item?.item_name || 'Consumable Item',
      quantity_deducted: quantity,
      vehicle,
      timestamp: new Date().toISOString()
    }
    setInventoryLogs(prev => [newLog, ...prev])

    // 2. Live Supabase Atomic RPC execution
    if (isSupabaseConfigured) {
      await rpcLogConsumableUsage(jobId, captainId, itemId, quantity, vehicle)
    }
  }

  // --- SHIFTS & GPS ---
  const startShift = async (workerId: string, lat?: number, lng?: number): Promise<Shift> => {
    const worker = profiles.find(p => p.id === workerId)
    const shiftId = `shift-${Date.now()}`
    const nowIso = new Date().toISOString()

    const newShift: Shift = {
      id: shiftId,
      worker_id: workerId,
      worker_name: worker?.full_name || 'Technician',
      worker_avatar: worker?.avatar_url,
      start_time: nowIso,
      start_lat: lat || null,
      start_lng: lng || null,
      end_time: null,
      end_lat: null,
      end_lng: null,
      is_paid: false,
      paid_amount: 0.00
    }

    setShifts(prev => [newShift, ...prev])

    if (lat && lng) {
      addLocationPing(shiftId, workerId, lat, lng)
    }

    if (isSupabaseConfigured) {
      const { data } = await supabase.from('shifts').insert([{
        worker_id: workerId,
        start_time: nowIso,
        start_lat: lat || null,
        start_lng: lng || null,
        is_paid: false,
        paid_amount: 0.00
      }]).select().single()

      if (data) {
        setShifts(prev => prev.map(s => s.id === shiftId ? { ...data, worker_name: worker?.full_name, worker_avatar: worker?.avatar_url } : s))
        return data as Shift
      }
    }

    return newShift
  }

  const endShift = async (shiftId: string, lat?: number, lng?: number) => {
    const nowIso = new Date().toISOString()
    const shift = shifts.find(s => s.id === shiftId)
    const worker = profiles.find(p => p.id === shift?.worker_id)
    const start = shift ? new Date(shift.start_time).getTime() : Date.now()
    const durationHours = Math.max(0, (new Date(nowIso).getTime() - start) / 3600000)
    const rate = worker?.hourly_rate || 45
    const estAmount = Number((durationHours * rate).toFixed(2))

    setShifts(prev => prev.map(s => {
      if (s.id === shiftId) {
        return {
          ...s,
          end_time: nowIso,
          end_lat: lat || null,
          end_lng: lng || null,
          paid_amount: s.paid_amount || estAmount
        }
      }
      return s
    }))

    if (isSupabaseConfigured) {
      await supabase.from('shifts').update({
        end_time: nowIso,
        end_lat: lat || null,
        end_lng: lng || null,
        paid_amount: estAmount
      }).eq('id', shiftId)
    }
  }

  const addLocationPing = async (shiftId: string, workerId: string, lat: number, lng: number) => {
    const newPing: LocationPing = {
      id: `ping-${Date.now()}`,
      shift_id: shiftId,
      worker_id: workerId,
      lat,
      lng,
      timestamp: new Date().toISOString()
    }

    setLocationPings(prev => [newPing, ...prev])

    if (isSupabaseConfigured) {
      await supabase.from('location_pings').insert([{
        shift_id: shiftId.startsWith('shift-') ? null : shiftId,
        worker_id: workerId,
        lat,
        lng,
        timestamp: newPing.timestamp
      }])
    }
  }

  const markShiftPaid = async (shiftId: string, isPaid: boolean, amount?: number) => {
    setShifts(prev => prev.map(s => {
      if (s.id === shiftId) {
        return {
          ...s,
          is_paid: isPaid,
          paid_amount: amount !== undefined ? amount : s.paid_amount
        }
      }
      return s
    }))

    if (isSupabaseConfigured) {
      const updates: any = { is_paid: isPaid }
      if (amount !== undefined) updates.paid_amount = amount
      await supabase.from('shifts').update(updates).eq('id', shiftId)
    }
  }

  // --- JOBS & STEALTH ACCOUNTABILITY ---
  const createJob = async (jobData: Partial<Job>): Promise<Job> => {
    const id = `job-${Date.now()}`
    const worker = profiles.find(p => p.id === jobData.assigned_worker_id)
    const nowIso = new Date().toISOString()

    const newJob: Job = {
      id,
      title: jobData.title || 'HVAC Service Order',
      client_name: jobData.client_name || 'Client',
      address_text: jobData.address_text || 'Field Address',
      lat: jobData.lat || null,
      lng: jobData.lng || null,
      assigned_worker_id: worker?.id || null,
      assigned_worker_name: worker?.full_name || null,
      assigned_worker_avatar: worker?.avatar_url || null,
      admin_voice_note_url: jobData.admin_voice_note_url || null,
      task_description: jobData.task_description || '',
      status: 'pending',
      scheduled_date: jobData.scheduled_date || nowIso,
      client_price: jobData.client_price || 0.00,
      is_client_paid: false,
      created_at: nowIso
    }

    setJobs(prev => [newJob, ...prev])

    if (isSupabaseConfigured) {
      const { data } = await supabase.from('jobs').insert([{
        title: newJob.title,
        client_name: newJob.client_name,
        address_text: newJob.address_text,
        lat: newJob.lat,
        lng: newJob.lng,
        assigned_worker_id: newJob.assigned_worker_id,
        admin_voice_note_url: newJob.admin_voice_note_url,
        task_description: newJob.task_description,
        status: 'pending',
        scheduled_date: newJob.scheduled_date,
        client_price: newJob.client_price,
        is_client_paid: false
      }]).select().single()

      if (data) {
        setJobs(prev => prev.map(j => j.id === id ? {
          ...data,
          assigned_worker_name: worker?.full_name,
          assigned_worker_avatar: worker?.avatar_url
        } : j))
        return data as Job
      }
    }

    return newJob
  }

  const startJobBeforePhoto = async (jobId: string, photoUrl: string, lat?: number, lng?: number) => {
    const nowIso = new Date().toISOString()
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          status: 'in_progress',
          before_photo_url: photoUrl,
          before_photo_taken_at: nowIso,
          before_lat: lat || j.lat || null,
          before_lng: lng || j.lng || null
        }
      }
      return j
    }))

    if (isSupabaseConfigured) {
      await supabase.from('jobs').update({
        status: 'in_progress',
        before_photo_url: photoUrl,
        before_photo_taken_at: nowIso,
        before_lat: lat || null,
        before_lng: lng || null
      }).eq('id', jobId)
    }
  }

  const setJobAfterPhoto = async (jobId: string, photoUrl: string, lat?: number, lng?: number) => {
    const nowIso = new Date().toISOString()
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          after_photo_url: photoUrl,
          after_photo_taken_at: nowIso,
          after_lat: lat || j.lat || null,
          after_lng: lng || j.lng || null
        }
      }
      return j
    }))

    if (isSupabaseConfigured) {
      await supabase.from('jobs').update({
        after_photo_url: photoUrl,
        after_photo_taken_at: nowIso,
        after_lat: lat || null,
        after_lng: lng || null
      }).eq('id', jobId)
    }
  }

  const submitJobReport = async (jobId: string, note?: string, voiceMemoUrl?: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          worker_note: note || j.worker_note,
          worker_voice_memo_url: voiceMemoUrl || j.worker_voice_memo_url
        }
      }
      return j
    }))

    if (isSupabaseConfigured) {
      const updates: any = {}
      if (note !== undefined) updates.worker_note = note
      if (voiceMemoUrl !== undefined) updates.worker_voice_memo_url = voiceMemoUrl
      await supabase.from('jobs').update(updates).eq('id', jobId)
    }
  }

  const completeJob = async (jobId: string, lat?: number, lng?: number) => {
    const nowIso = new Date().toISOString()
    const targetJob = jobs.find(j => j.id === jobId)
    const startTime = targetJob?.before_photo_taken_at
      ? new Date(targetJob.before_photo_taken_at).getTime()
      : new Date(targetJob?.created_at || nowIso).getTime()
    const durationMinutes = Math.max(1, Math.round((new Date(nowIso).getTime() - startTime) / 60000))

    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          status: 'completed',
          completion_time: nowIso,
          task_duration_minutes: durationMinutes,
          after_lat: lat || j.after_lat || j.lat || null,
          after_lng: lng || j.after_lng || j.lng || null
        }
      }
      return j
    }))

    if (isSupabaseConfigured) {
      await supabase.from('jobs').update({
        status: 'completed',
        completion_time: nowIso,
        task_duration_minutes: durationMinutes,
        after_lat: lat || null,
        after_lng: lng || null
      }).eq('id', jobId)
    }
  }

  const setJobClientPaid = async (jobId: string, isPaid: boolean) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, is_client_paid: isPaid } : j))

    if (isSupabaseConfigured) {
      await supabase.from('jobs').update({ is_client_paid: isPaid }).eq('id', jobId)
    }
  }

  return (
    <DataContext.Provider
      value={{
        profiles,
        shifts,
        locationPings,
        inventory,
        inventoryLogs,
        jobs,
        isLoading,
        refreshAllData,
        setCaptain,
        setWorkerVehicle,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        deductMaterial,
        startShift,
        endShift,
        addLocationPing,
        markShiftPaid,
        createJob,
        startJobBeforePhoto,
        setJobAfterPhoto,
        submitJobReport,
        completeJob,
        setJobClientPaid
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
