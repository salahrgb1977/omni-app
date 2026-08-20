import React, { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { Profile, Job, Shift, LocationPing } from '../../types/omni'
import { Badge } from '../common/Badge'
import { formatRelativeTime, formatVehicle } from '../../lib/formatters'
import { MapPin, Navigation, User, Briefcase, Eye } from 'lucide-react'

// Fix default Leaflet icon paths in React bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom technician marker icon
const createWorkerIcon = (worker: Profile) => {
  return L.divIcon({
    className: 'custom-worker-marker',
    html: `
      <div style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
        <div style="width: 32px; height: 32px; border-radius: 8px; border: 2px solid #0f172a; background: #ffffff; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15);">
          <img src="${worker.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}" alt="${worker.full_name}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

// Custom job marker icon
const createJobIcon = (status: string) => {
  const bg = status === 'completed' ? '#059669' : status === 'in_progress' ? '#2563eb' : '#d97706'
  return L.divIcon({
    className: 'custom-job-marker',
    html: `
      <div style="display: flex; align-items: center; justify-content: center; width: 30px; height: 30px;">
        <div style="width: 26px; height: 26px; border-radius: 6px; background: ${bg}; color: #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

interface LiveMapProps {
  profiles: Profile[]
  jobs: Job[]
  shifts: Shift[]
  locationPings: LocationPing[]
  onSelectJob?: (job: Job) => void
  height?: string
  className?: string
}

export function LiveMap({
  profiles,
  jobs,
  shifts,
  locationPings,
  onSelectJob,
  height = '420px',
  className = ''
}: LiveMapProps) {
  const [filter, setFilter] = useState<'all' | 'workers' | 'jobs'>('all')

  const defaultCenter: [number, number] = [30.2672, -97.7431] // Austin Metro

  const activeShifts = shifts.filter(s => !s.end_time)
  
  // Find latest ping or start location for active workers
  const activeWorkersWithLocation = activeShifts.map(shift => {
    const worker = profiles.find(p => p.id === shift.worker_id)
    const workerPings = locationPings
      .filter(p => p.shift_id === shift.id || p.worker_id === shift.worker_id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    const latestPing = workerPings[0]
    const lat = latestPing?.lat || shift.start_lat || 30.2672
    const lng = latestPing?.lng || shift.start_lng || -97.7431
    const lastTime = latestPing?.timestamp || shift.start_time

    return {
      worker,
      shift,
      lat,
      lng,
      lastTime
    }
  }).filter(item => item.worker)

  const mappedJobs = jobs.filter(j => j.lat && j.lng)

  return (
    <div className={`admin-card overflow-hidden flex flex-col ${className}`}>
      {/* Map Control Bar */}
      <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between z-20">
        <div className="flex items-center space-x-2">
          <Navigation size={16} className="text-slate-700" />
          <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
            Live Field Operations Map
          </span>
          <span className="text-xs text-slate-500 font-medium">
            ({activeWorkersWithLocation.length} active technicians · {mappedJobs.length} work sites)
          </span>
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-md transition-colors ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            All Pins
          </button>
          <button
            onClick={() => setFilter('workers')}
            className={`px-2.5 py-1 rounded-md transition-colors ${filter === 'workers' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Active Techs ({activeWorkersWithLocation.length})
          </button>
          <button
            onClick={() => setFilter('jobs')}
            className={`px-2.5 py-1 rounded-md transition-colors ${filter === 'jobs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Job Sites ({mappedJobs.length})
          </button>
        </div>
      </div>

      {/* Leaflet Map */}
      <div style={{ height, width: '100%' }} className="relative z-10">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* Active Technician Markers */}
          {(filter === 'all' || filter === 'workers') &&
            activeWorkersWithLocation.map(({ worker, shift, lat, lng, lastTime }) => {
              if (!worker) return null

              return (
                <Marker
                  key={worker.id}
                  position={[lat, lng]}
                  icon={createWorkerIcon(worker)}
                >
                  <Popup>
                    <div className="p-1 space-y-2 min-w-[180px]">
                      <div className="flex items-center space-x-2">
                        <img
                          src={worker.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                          alt={worker.full_name}
                          className="w-7 h-7 rounded object-cover border border-slate-300"
                        />
                        <div>
                          <p className="font-bold text-xs text-slate-900">{worker.full_name}</p>
                          <p className="text-[10px] text-slate-500">{formatVehicle(worker.assigned_vehicle)}</p>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
                        <p className="text-[10px] text-emerald-700 font-bold uppercase">Active On Shift</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Last ping: {formatRelativeTime(lastTime)}
                        </p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            })}

          {/* Job Site Markers */}
          {(filter === 'all' || filter === 'jobs') &&
            mappedJobs.map(job => {
              if (!job.lat || !job.lng) return null

              return (
                <Marker
                  key={job.id}
                  position={[job.lat, job.lng]}
                  icon={createJobIcon(job.status)}
                >
                  <Popup>
                    <div className="p-1 space-y-2 min-w-[200px]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 truncate">{job.client_name}</span>
                        <Badge variant={job.status} size="sm" />
                      </div>

                      <div>
                        <p className="text-xs text-slate-700 font-medium line-clamp-1">{job.title}</p>
                        <p className="text-[10px] text-slate-500 truncate flex items-center mt-0.5">
                          <MapPin size={10} className="mr-1 text-slate-400 shrink-0" />
                          {job.address_text}
                        </p>
                      </div>

                      <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Tech: {job.assigned_worker_name || 'Unassigned'}</span>
                      </div>

                      {onSelectJob && (
                        <button
                          onClick={() => onSelectJob(job)}
                          className="w-full mt-1 py-1 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center justify-center transition-colors"
                        >
                          <Eye size={12} className="mr-1" />
                          View Proof & Details
                        </button>
                      )}
                    </div>
                  </Popup>
                </Marker>
              )
            })}
        </MapContainer>
      </div>
    </div>
  )
}
