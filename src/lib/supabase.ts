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

// Storage Upload Helper for Job Evidence (Before/After photos & Worker voice memos)
export async function uploadJobProof(file: Blob | File, filename: string): Promise<string | null> {
  if (!isSupabaseConfigured) return null

  try {
    const filePath = `${Date.now()}-${filename}`
    const { error } = await supabase.storage
      .from('job-proofs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      console.warn('Supabase job proof storage upload error:', error.message)
      return null
    }

    const { data } = supabase.storage.from('job-proofs').getPublicUrl(filePath)
    return data.publicUrl
  } catch (err) {
    console.warn('Storage upload exception:', err)
    return null
  }
}

// Storage Upload Helper for Admin Audio Briefings
export async function uploadVoiceBriefing(file: Blob | File, filename: string): Promise<string | null> {
  if (!isSupabaseConfigured) return null

  try {
    const filePath = `briefing-${Date.now()}-${filename}`
    const { error } = await supabase.storage
      .from('voice-briefings')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      console.warn('Supabase voice briefing upload error:', error.message)
      return null
    }

    const { data } = supabase.storage.from('voice-briefings').getPublicUrl(filePath)
    return data.publicUrl
  } catch (err) {
    console.warn('Storage upload exception:', err)
    return null
  }
}
