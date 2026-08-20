/**
 * Industrial Executive Formatters for Omni HVAC OS
 * High-contrast, tabular numerals, non-technical presentation.
 */

// Formats vehicle ID to display label
export function formatVehicle(vehicle: 'van_1' | 'van_2' | string): string {
  if (vehicle === 'van_1') return 'Service Van 1'
  if (vehicle === 'van_2') return 'Service Van 2'
  return vehicle
}

// Converts ISO timestamps to relative time (e.g., "2m ago", "1h ago", "Yesterday")
export function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return '—'
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '—'
  
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 30) return 'Just now'
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Formats date and time into clean string (e.g., "Aug 20, 2026 · 2:30 PM")
export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '—'
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

// Formats time only (e.g., "2:30 PM")
export function formatTime(dateString?: string | null): string {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '—'
  
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

// Formats durations between two timestamps or given minutes/seconds into "1h 24m"
export function formatDuration(startOrMinutes?: string | number | null, endString?: string | null): string {
  if (startOrMinutes === null || startOrMinutes === undefined) return '0m'
  
  let totalMinutes = 0
  
  if (typeof startOrMinutes === 'number') {
    totalMinutes = Math.max(0, Math.floor(startOrMinutes))
  } else {
    const start = new Date(startOrMinutes).getTime()
    const end = endString ? new Date(endString).getTime() : Date.now()
    if (isNaN(start)) return '0m'
    totalMinutes = Math.max(0, Math.floor((end - start) / 60000))
  }
  
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

// Formats live stopwatch duration with seconds: "1h 24m 15s" or "24m 15s"
export function formatLiveStopwatch(startTimeString: string): string {
  const start = new Date(startTimeString).getTime()
  if (isNaN(start)) return '00:00'
  
  const now = Date.now()
  const totalSeconds = Math.max(0, Math.floor((now - start) / 1000))
  
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  }
  return `${minutes}m ${seconds}s`
}

// Formats currency amounts (e.g., "$120.00")
export function formatCurrency(amount?: number | null): string {
  if (amount === undefined || amount === null) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// Formats phone numbers nicely
export function formatPhoneNumber(phone?: string | null): string {
  if (!phone) return '—'
  const cleaned = ('' + phone).replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return phone
}

// Extracts user initials for avatar fallback
export function getInitials(name?: string | null): string {
  if (!name) return 'OP'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}
