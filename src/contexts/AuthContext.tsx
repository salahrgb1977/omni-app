import React, { createContext, useContext, useState, useEffect } from 'react'
import { Profile, UserRole, VehicleId } from '../types/omni'
import { initialProfiles } from '../lib/mockData'

interface AuthContextType {
  currentRole: UserRole
  setCurrentRole: (role: UserRole) => void
  currentProfile: Profile
  switchProfile: (profileId: string) => void
  profilesList: Profile[]
  isCaptain: boolean
  assignedVehicle: VehicleId
  user: { id: string; email?: string }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profilesList, setProfilesList] = useState<Profile[]>(initialProfiles)
  const [currentRoleId, setCurrentRoleId] = useState<string>('admin-1')

  const currentProfile = profilesList.find(p => p.id === currentRoleId) || profilesList[0]
  const currentRole = currentProfile.role

  const setCurrentRole = (role: UserRole) => {
    if (role === 'admin') {
      setCurrentRoleId('admin-1')
    } else {
      // Pick first worker (e.g. Marcus Vance)
      const firstWorker = profilesList.find(p => p.role === 'worker') || profilesList[1]
      setCurrentRoleId(firstWorker.id)
    }
  }

  const switchProfile = (profileId: string) => {
    setCurrentRoleId(profileId)
  }

  const isCaptain = Boolean(currentProfile.is_daily_captain)
  const assignedVehicle = currentProfile.assigned_vehicle || 'van_1'

  const user = {
    id: currentProfile.id,
    email: `${currentProfile.full_name.toLowerCase().replace(/\s+/g, '.')}@omnihvac.io`
  }

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
        user
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
