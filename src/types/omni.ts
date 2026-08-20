export type UserRole = 'admin' | 'worker'
export type ItemCategory = 'equipment' | 'consumable'
export type JobStatus = 'pending' | 'in_progress' | 'completed'
export type VehicleId = 'van_1' | 'van_2'

export interface Profile {
  id: string
  full_name: string
  phone_number?: string
  role: UserRole
  is_daily_captain: boolean
  assigned_vehicle: VehicleId
  performance_score: number // e.g. 98.5
  created_at?: string
  avatar_url?: string
  hourly_rate?: number
}

export interface Shift {
  id: string
  worker_id: string
  start_time: string
  start_lat?: number | null
  start_lng?: number | null
  end_time?: string | null
  end_lat?: number | null
  end_lng?: number | null
  is_paid: boolean
  paid_amount: number
  
  // UI Display Helpers
  worker_name?: string
  worker_avatar?: string
}

export interface LocationPing {
  id: string
  shift_id: string
  worker_id: string
  lat: number
  lng: number
  timestamp: string
}

export interface InventoryItem {
  id: string
  item_name: string
  category: ItemCategory
  quantity: number
  assigned_vehicle: VehicleId
  created_at?: string
}

export interface InventoryLog {
  id: string
  job_id?: string | null
  captain_id: string
  captain_name?: string
  item_id: string
  item_name?: string
  quantity_deducted: number
  vehicle: VehicleId
  timestamp: string
}

export interface Job {
  id: string
  title: string
  client_name: string
  address_text: string
  lat?: number | null
  lng?: number | null
  assigned_worker_id?: string | null
  assigned_worker_name?: string | null
  assigned_worker_avatar?: string | null
  admin_voice_note_url?: string | null
  task_description?: string | null
  status: JobStatus
  scheduled_date?: string | null
  
  // Secret Accountability Fields (Silently logged)
  before_photo_url?: string | null
  before_photo_taken_at?: string | null
  before_lat?: number | null
  before_lng?: number | null
  
  after_photo_url?: string | null
  after_photo_taken_at?: string | null
  after_lat?: number | null
  after_lng?: number | null
  
  completion_time?: string | null
  task_duration_minutes?: number | null
  worker_note?: string | null
  worker_voice_memo_url?: string | null
  
  // Client Financials
  client_price: number
  is_client_paid: boolean
  created_at?: string
}
