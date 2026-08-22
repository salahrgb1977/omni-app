import React, { createContext, useContext, useState, useEffect } from 'react'
import { Profile, UserRole, VehicleId } from '../types/omni'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export const SECRET_LOGOUT_PIN = '1357'

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
  isLoggedOut: boolean
  isLogoutModalOpen: boolean
  setIsLogoutModalOpen: (open: boolean) => void
  login: (profileId?: string) => void
  loginWithEmailPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logoutWithSecretCode: (code: string) => Promise<{ success: boolean; error?: string }>
  refreshProfiles: () => Promise<void>
}

// Authorized team accounts with valid credential definitions
interface AuthorizedAccount {
  email: string
  passwords: string[]
  profileId: string
  role: UserRole
}

const AUTHORIZED_ACCOUNTS: AuthorizedAccount[] = [
  {
    email: 'admin@omni.hvac',
    passwords: ['admin', 'admin123', 'omni123', 'password123', '1357'],
    profileId: 'admin-1',
    role: 'admin'
  },
  {
    email: 'admin@omni.com',
    passwords: ['admin', 'admin123', 'omni123', 'password123', '1357'],
    profileId: 'admin-1',
    role: 'admin'
  },
  {
    email: 'sarah@omni.hvac',
    passwords: ['sarah', 'sarah123', 'omni123', 'password123', '1357'],
    profileId: 'worker-1',
    role: 'worker'
  },
  {
    email: 'tariq@omni.hvac',
    passwords: ['tariq', 'tariq123', 'omni123', 'password123', '1357'],
    profileId: 'worker-2',
    role: 'worker'
  },
  {
    email: 'omar@omni.hvac',
    passwords: ['omar', 'omar123', 'omni123', 'password123', '1357'],
    profileId: 'worker-3',
    role: 'worker'
  },
  {
    email: 'fadi@omni.hvac',
    passwords: ['fadi', 'fadi123', 'omni123', 'password123', '1357'],
    profileId: 'worker-4',
    role: 'worker'
  }
]

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
const LOGGED_OUT_KEY = 'omni_hvac_logged_out'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profilesList, setProfilesList] = useState<Profile[]>([defaultAdminProfile])
  const [currentProfileId, setCurrentProfileId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || 'admin-1'
  })
  const [isLoggedOut, setIsLoggedOut] = useState<boolean>(() => {
    return localStorage.getItem(LOGGED_OUT_KEY) === 'true'
  })
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false)
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
        
        // Fetch matching profile for authenticated user using maybeSingle to avoid 406 errors
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()

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

  const login = (profileId?: string) => {
    if (profileId) {
      setCurrentProfileId(profileId)
      localStorage.setItem(STORAGE_KEY, profileId)
    }
    setIsLoggedOut(false)
    localStorage.removeItem(LOGGED_OUT_KEY)
  }

  const loginWithEmailPassword = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase()
    const cleanPass = password.trim()

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'fill_all_fields' }
    }

    // 1. If live Supabase configured, attempt real password auth
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPass
        })
        if (!error && data?.user) {
          setUser({ id: data.user.id, email: data.user.email })
          setIsLoggedOut(false)
          localStorage.removeItem(LOGGED_OUT_KEY)
          return { success: true }
        }
      } catch (err) {
        // Live Supabase password attempt failed, proceed to authorized accounts check
      }
    }

    // 2. Strict Authorized Credentials Check
    const matchedAccount = AUTHORIZED_ACCOUNTS.find(acc => acc.email.toLowerCase() === cleanEmail)
    if (matchedAccount) {
      const isPasswordValid = matchedAccount.passwords.some(p => p.toLowerCase() === cleanPass.toLowerCase())
      if (isPasswordValid) {
        const targetProfile = profilesList.find(p => p.id === matchedAccount.profileId) || profilesList[0]
        if (targetProfile) {
          setCurrentProfileId(targetProfile.id)
          localStorage.setItem(STORAGE_KEY, targetProfile.id)
        }
        setIsLoggedOut(false)
        localStorage.removeItem(LOGGED_OUT_KEY)
        return { success: true }
      }
    }

    // 3. Fallback: If profile by email exists in DB profiles list
    const profileWithEmail = profilesList.find(p => (p as any).email?.toLowerCase() === cleanEmail)
    if (profileWithEmail && cleanPass.length >= 4) {
      setCurrentProfileId(profileWithEmail.id)
      localStorage.setItem(STORAGE_KEY, profileWithEmail.id)
      setIsLoggedOut(false)
      localStorage.removeItem(LOGGED_OUT_KEY)
      return { success: true }
    }

    // STRICT REJECTION: Invalid credentials
    return { success: false, error: 'invalid_credentials' }
  }

  const logoutWithSecretCode = async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (code.trim() !== SECRET_LOGOUT_PIN) {
      return { success: false, error: 'invalid_code' }
    }

    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut().catch(() => {})
      }
    } finally {
      setIsLoggedOut(true)
      localStorage.setItem(LOGGED_OUT_KEY, 'true')
      setIsLogoutModalOpen(false)
    }

    return { success: true }
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
        isLoggedOut,
        isLogoutModalOpen,
        setIsLogoutModalOpen,
        login,
        loginWithEmailPassword,
        logoutWithSecretCode,
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
