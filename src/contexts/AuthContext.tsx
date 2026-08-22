import React, { createContext, useContext, useState, useEffect } from 'react'
import { Profile, UserRole, VehicleId } from '../types/omni'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

interface AuthContextType {
  currentRole: UserRole
  setCurrentRole: (role: UserRole) => void
  currentProfile: Profile
  switchProfile: (profileId: string) => void
  profilesList: Profile[]
  isCaptain: boolean
  assignedVehicle: VehicleId
  user: { id: string; email?: string } | null
  isLoading: boolean
  refreshProfiles: () => Promise<void>
}

const defaultAdminProfile: Profile = {
  id: 'admin-1',
  full_name: 'Operations Command',
  role: 'admin',
  is_daily_captain: false,
  assigned_vehicle: 'van_1',
  performance_score: 100.0,
  avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'omni_hvac_active_profile_id'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profilesList, setProfilesList] = useState<Profile[]>([defaultAdminProfile])
  const [currentProfileId, setCurrentProfileId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || 'admin-1'
  })
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Fetch profiles from Supabase public.profiles
  const fetchProfiles = async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true })

      if (!error && data && data.length > 0) {
        setProfilesList(data as Profile[])
        
        // If current profile is not in the list, default to the first
        if (!data.some(p => p.id === currentProfileId)) {
          setCurrentProfileId(data[0].id)
        }
      }
    } catch (err) {
      console.warn('Could not fetch profiles from Supabase:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Bind to Supabase Auth State Changes
  useEffect(() => {
    fetchProfiles()

    if (!isSupabaseConfigured) return

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email })
        
        // Fetch matching profile for authenticated user
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setCurrentProfileId(profile.id)
          localStorage.setItem(STORAGE_KEY, profile.id)
        }
      } else {
        setUser(null)
      }
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const currentProfile = profilesList.find(p => p.id === currentProfileId) || profilesList[0] || defaultAdminProfile
  const currentRole = currentProfile.role

  const setCurrentRole = (role: UserRole) => {
    const target = profilesList.find(p => p.role === role)
    if (target) {
      setCurrentProfileId(target.id)
      localStorage.setItem(STORAGE_KEY, target.id)
    }
  }

  const switchProfile = (profileId: string) => {
    setCurrentProfileId(profileId)
    localStorage.setItem(STORAGE_KEY, profileId)
  }

  const isCaptain = Boolean(currentProfile.is_daily_captain)
  const assignedVehicle = currentProfile.assigned_vehicle || 'van_1'

  return (
    <AuthContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentProfile,
        switchProfile,
        profilesList,
        isCaptain,
        assignedVehicle,
        user,
        isLoading,
        refreshProfiles: fetchProfiles
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
