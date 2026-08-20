import React, { createContext, useContext, useState, useEffect } from 'react'
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
import {
  initialProfiles,
  initialShifts,
  initialLocationPings,
  initialInventory,
  initialInventoryLogs,
  initialJobs
} from '../lib/mockData'
import { rpcLogConsumableUsage } from '../lib/supabase'

interface DataContextType {
  profiles: Profile[]
  shifts: Shift[]
  locationPings: LocationPing[]
  inventory: InventoryItem[]
  inventoryLogs: InventoryLog[]
  jobs: Job[]
  
  // Captain & Vehicle Management
  setCaptain: (workerId: string, vehicle: VehicleId, isCaptain: boolean) => void
  setWorkerVehicle: (workerId: string, vehicle: VehicleId) => void
  
  // Inventory Management (Admin)
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void
  deleteInventoryItem: (id: string) => void
  
  // Material Deduction (Captains Only)
  deductMaterial: (
    jobId: string | null,
    captainId: string,
    itemId: string,
    quantity: number,
    vehicle: VehicleId
  ) => Promise<void>
  
  // Shifts & GPS
  startShift: (workerId: string, lat?: number, lng?: number) => Shift
  endShift: (shiftId: string, lat?: number, lng?: number) => void
  addLocationPing: (shiftId: string, workerId: string, lat: number, lng: number) => void
  markShiftPaid: (shiftId: string, isPaid: boolean, amount?: number) => void
  
  // Jobs & Stealth Accountability
  createJob: (jobData: Partial<Job>) => Job
  startJobBeforePhoto: (jobId: string, photoUrl: string, lat?: number, lng?: number) => void
  setJobAfterPhoto: (jobId: string, photoUrl: string, lat?: number, lng?: number) => void
  submitJobReport: (jobId: string, note?: string, voiceMemoUrl?: string) => void
  completeJob: (jobId: string, lat?: number, lng?: number) => void
  setJobClientPaid: (jobId: string, isPaid: boolean) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const STORAGE_PREFIX = 'omni_hvac_v2_'

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'profiles')
    return saved ? JSON.parse(saved) : initialProfiles
  })

  const [shifts, setShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'shifts')
    return saved ? JSON.parse(saved) : initialShifts
  })

  const [locationPings, setLocationPings] = useState<LocationPing[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'pings')
    return saved ? JSON.parse(saved) : initialLocationPings
  })

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'inventory')
    return saved ? JSON.parse(saved) : initialInventory
  })

  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'inventory_logs')
    return saved ? JSON.parse(saved) : initialInventoryLogs
  })

  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'jobs')
    return saved ? JSON.parse(saved) : initialJobs
  })

  // Persist state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'profiles', JSON.stringify(profiles))
  }, [profiles])
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'shifts', JSON.stringify(shifts))
  }, [shifts])
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'pings', JSON.stringify(locationPings))
  }, [locationPings])
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'inventory', JSON.stringify(inventory))
  }, [inventory])
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'inventory_logs', JSON.stringify(inventoryLogs))
  }, [inventoryLogs])
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'jobs', JSON.stringify(jobs))
  }, [jobs])

  // --- CAPTAIN & VEHICLE ACTIONS ---
  const setCaptain = (workerId: string, vehicle: VehicleId, isCaptain: boolean) => {
    setProfiles(prev => prev.map(p => {
      // If setting this worker as captain, unassign other captains on the same vehicle
      if (isCaptain && p.assigned_vehicle === vehicle && p.id !== workerId) {
        return { ...p, is_daily_captain: false }
      }
      if (p.id === workerId) {
        return { ...p, is_daily_captain: isCaptain, assigned_vehicle: vehicle }
      }
      return p
    }))
  }

  const setWorkerVehicle = (workerId: string, vehicle: VehicleId) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === workerId) {
        return { ...p, assigned_vehicle: vehicle }
      }
      return p
    }))
  }

  // --- INVENTORY MANAGEMENT (ADMIN) ---
  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
      created_at: new Date().toISOString()
    }
    setInventory(prev => [newItem, ...prev])
  }

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item))
  }

  const deleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id))
  }

  // --- ATOMIC MATERIAL DEDUCTION (CAPTAIN ONLY) ---
  const deductMaterial = async (
    jobId: string | null,
    captainId: string,
    itemId: string,
    quantity: number,
    vehicle: VehicleId
  ) => {
    const item = inventory.find(i => i.id === itemId)
    const captain = profiles.find(p => p.id === captainId)
    
    // 1. Update local inventory quantity (allow negative stock to never block field work)
    setInventory(prev => prev.map(inv => {
      if (inv.id === itemId) {
        return { ...inv, quantity: Number((inv.quantity - quantity).toFixed(2)) }
      }
      return inv
    }))

    // 2. Append to private audit log
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

    // 3. Trigger Supabase RPC if connected
    try {
      await rpcLogConsumableUsage(jobId, captainId, itemId, quantity, vehicle)
    } catch {
      // Offline fallback
    }
  }

  // --- SHIFTS & GPS ---
  const startShift = (workerId: string, lat?: number, lng?: number): Shift => {
    const worker = profiles.find(p => p.id === workerId)
    const shiftId = `shift-${Date.now()}`
    
    const newShift: Shift = {
      id: shiftId,
      worker_id: workerId,
      worker_name: worker?.full_name || 'Technician',
      worker_avatar: worker?.avatar_url,
      start_time: new Date().toISOString(),
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

    return newShift
  }

  const endShift = (shiftId: string, lat?: number, lng?: number) => {
    const nowIso = new Date().toISOString()
    setShifts(prev => prev.map(s => {
      if (s.id === shiftId) {
        const start = new Date(s.start_time).getTime()
        const durationHours = Math.max(0, (new Date(nowIso).getTime() - start) / 3600000)
        const worker = profiles.find(p => p.id === s.worker_id)
        const rate = worker?.hourly_rate || 45
        const estAmount = Number((durationHours * rate).toFixed(2))

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
  }

  const addLocationPing = (shiftId: string, workerId: string, lat: number, lng: number) => {
    const newPing: LocationPing = {
      id: `ping-${Date.now()}`,
      shift_id: shiftId,
      worker_id: workerId,
      lat,
      lng,
      timestamp: new Date().toISOString()
    }
    setLocationPings(prev => [newPing, ...prev])
  }

  const markShiftPaid = (shiftId: string, isPaid: boolean, amount?: number) => {
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
  }

  // --- JOBS & STEALTH ACCOUNTABILITY ---
  const createJob = (jobData: Partial<Job>): Job => {
    const id = `job-${Date.now()}`
    const worker = profiles.find(p => p.id === jobData.assigned_worker_id)

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
      scheduled_date: jobData.scheduled_date || new Date().toISOString(),
      client_price: jobData.client_price || 0.00,
      is_client_paid: false,
      created_at: new Date().toISOString()
    }

    setJobs(prev => [newJob, ...prev])
    return newJob
  }

  const startJobBeforePhoto = (jobId: string, photoUrl: string, lat?: number, lng?: number) => {
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
  }

  const setJobAfterPhoto = (jobId: string, photoUrl: string, lat?: number, lng?: number) => {
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
  }

  const submitJobReport = (jobId: string, note?: string, voiceMemoUrl?: string) => {
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
  }

  const completeJob = (jobId: string, lat?: number, lng?: number) => {
    const nowIso = new Date().toISOString()
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        // Calculate task duration minutes
        const startTime = j.before_photo_taken_at ? new Date(j.before_photo_taken_at).getTime() : new Date(j.created_at || nowIso).getTime()
        const durationMinutes = Math.max(1, Math.round((new Date(nowIso).getTime() - startTime) / 60000))

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
  }

  const setJobClientPaid = (jobId: string, isPaid: boolean) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, is_client_paid: isPaid } : j))
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
