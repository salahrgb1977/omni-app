import { createClient } from '@supabase/supabase-js'
import { VehicleId } from '../types/omni'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-omniops-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// RPC Helper: log_consumable_usage
export async function rpcLogConsumableUsage(
  jobId: string | null,
  captainId: string,
  itemId: string,
  quantity: number,
  vehicle: VehicleId
) {
  if (!isSupabaseConfigured) return { data: null, error: null }
  
  return await supabase.rpc('log_consumable_usage', {
    p_job_id: jobId,
    p_captain_id: captainId,
    p_item_id: itemId,
    p_quantity: quantity,
    p_vehicle: vehicle
  })
}
