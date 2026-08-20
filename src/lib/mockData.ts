import { Profile, Shift, LocationPing, InventoryItem, InventoryLog, Job } from '../types/omni'

const now = new Date()
const minutesAgo = (mins: number) => new Date(now.getTime() - mins * 60000).toISOString()
const hoursAgo = (hrs: number) => new Date(now.getTime() - hrs * 3600000).toISOString()
const daysAgo = (days: number) => new Date(now.getTime() - days * 86400000).toISOString()

// Clean audio samples
const SAMPLE_ADMIN_AUDIO = "https://actions.google.com/sounds/v1/doors/door_open_close.ogg"
const SAMPLE_WORKER_AUDIO = "https://actions.google.com/sounds/v1/speech/man_says_hello.ogg"

export const initialProfiles: Profile[] = [
  {
    id: 'admin-1',
    full_name: 'Operations Command',
    phone_number: '(512) 555-0100',
    role: 'admin',
    is_daily_captain: false,
    assigned_vehicle: 'van_1',
    performance_score: 100.0,
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250',
    created_at: daysAgo(60)
  },
  {
    id: 'worker-1',
    full_name: 'Marcus Vance',
    phone_number: '(512) 555-0192',
    role: 'worker',
    is_daily_captain: true, // Captain of Van 1
    assigned_vehicle: 'van_1',
    performance_score: 98.5,
    hourly_rate: 48,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    created_at: daysAgo(45)
  },
  {
    id: 'worker-2',
    full_name: 'Elena Rostova',
    phone_number: '(512) 555-0148',
    role: 'worker',
    is_daily_captain: true, // Captain of Van 2
    assigned_vehicle: 'van_2',
    performance_score: 99.0,
    hourly_rate: 52,
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    created_at: daysAgo(40)
  },
  {
    id: 'worker-3',
    full_name: 'Devon Miller',
    phone_number: '(512) 555-0174',
    role: 'worker',
    is_daily_captain: false,
    assigned_vehicle: 'van_1',
    performance_score: 94.0,
    hourly_rate: 42,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    created_at: daysAgo(30)
  },
  {
    id: 'worker-4',
    full_name: 'Sarah Chen',
    phone_number: '(512) 555-0119',
    role: 'worker',
    is_daily_captain: false,
    assigned_vehicle: 'van_2',
    performance_score: 96.5,
    hourly_rate: 50,
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
    created_at: daysAgo(20)
  }
]

export const initialShifts: Shift[] = [
  {
    id: 'shift-101',
    worker_id: 'worker-1',
    worker_name: 'Marcus Vance',
    worker_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    start_time: hoursAgo(2.4),
    start_lat: 30.2650,
    start_lng: -97.7460,
    end_time: null,
    end_lat: null,
    end_lng: null,
    is_paid: false,
    paid_amount: 0.00
  },
  {
    id: 'shift-102',
    worker_id: 'worker-2',
    worker_name: 'Elena Rostova',
    worker_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    start_time: hoursAgo(1.8),
    start_lat: 30.2700,
    start_lng: -97.7420,
    end_time: null,
    end_lat: null,
    end_lng: null,
    is_paid: false,
    paid_amount: 0.00
  },
  {
    id: 'shift-100',
    worker_id: 'worker-3',
    worker_name: 'Devon Miller',
    worker_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    start_time: daysAgo(1),
    start_lat: 30.2450,
    start_lng: -97.7600,
    end_time: new Date(new Date(daysAgo(1)).getTime() + 7.5 * 3600000).toISOString(),
    end_lat: 30.2520,
    end_lng: -97.7560,
    is_paid: true,
    paid_amount: 315.00
  },
  {
    id: 'shift-99',
    worker_id: 'worker-4',
    worker_name: 'Sarah Chen',
    worker_avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
    start_time: daysAgo(1),
    start_lat: 30.2800,
    start_lng: -97.7350,
    end_time: new Date(new Date(daysAgo(1)).getTime() + 8.0 * 3600000).toISOString(),
    end_lat: 30.2862,
    end_lng: -97.7394,
    is_paid: false,
    paid_amount: 0.00
  }
]

export const initialLocationPings: LocationPing[] = [
  { id: 'ping-1', shift_id: 'shift-101', worker_id: 'worker-1', lat: 30.2650, lng: -97.7460, timestamp: hoursAgo(2.4) },
  { id: 'ping-2', shift_id: 'shift-101', worker_id: 'worker-1', lat: 30.2662, lng: -97.7445, timestamp: hoursAgo(1.5) },
  { id: 'ping-3', shift_id: 'shift-101', worker_id: 'worker-1', lat: 30.2675, lng: -97.7425, timestamp: hoursAgo(0.8) },
  { id: 'ping-4', shift_id: 'shift-101', worker_id: 'worker-1', lat: 30.2685, lng: -97.7410, timestamp: minutesAgo(2) },
  
  { id: 'ping-5', shift_id: 'shift-102', worker_id: 'worker-2', lat: 30.2700, lng: -97.7420, timestamp: hoursAgo(1.8) },
  { id: 'ping-6', shift_id: 'shift-102', worker_id: 'worker-2', lat: 30.2725, lng: -97.7410, timestamp: hoursAgo(0.9) },
  { id: 'ping-7', shift_id: 'shift-102', worker_id: 'worker-2', lat: 30.2747, lng: -97.7403, timestamp: minutesAgo(4) }
]

export const initialInventory: InventoryItem[] = [
  // --- VAN 1: EQUIPMENT (TOOLS) ---
  { id: 'inv-101', item_name: 'FLIR E8-XT Infrared Thermal Camera', category: 'equipment', quantity: 1, assigned_vehicle: 'van_1', created_at: daysAgo(30) },
  { id: 'inv-102', item_name: 'Fieldpiece SMAN 4-Port Digital Manifold', category: 'equipment', quantity: 1, assigned_vehicle: 'van_1', created_at: daysAgo(30) },
  { id: 'inv-103', item_name: 'Milwaukee M18 FUEL Cordless Vacuum Pump 6 CFM', category: 'equipment', quantity: 1, assigned_vehicle: 'van_1', created_at: daysAgo(30) },
  { id: 'inv-104', item_name: 'Appion G5 Twin Refrigerant Recovery Machine', category: 'equipment', quantity: 1, assigned_vehicle: 'van_1', created_at: daysAgo(30) },
  { id: 'inv-105', item_name: 'Yellow Jacket Electronic Refrigerant Scale', category: 'equipment', quantity: 1, assigned_vehicle: 'van_1', created_at: daysAgo(30) },

  // --- VAN 1: CONSUMABLES ---
  { id: 'inv-106', item_name: 'R-410A Refrigerant 25lb Cylinder', category: 'consumable', quantity: 3.5, assigned_vehicle: 'van_1', created_at: daysAgo(30) },
  { id: 'inv-107', item_name: '45+5 MFD 440V Dual Round Run Capacitor', category: 'consumable', quantity: 8, assigned_vehicle: 'van_1', created_at: daysAgo(30) },
  { id: 'inv-108', item_name: '3/4" Copper 90-Degree Short Radius Elbows (Pack)', category: 'consumable', quantity: 32, assigned_vehicle: 'van_1', created_at: daysAgo(30) },
  { id: 'inv-109', item_name: '7/8" ACR Copper Tubing 50ft Coil', category: 'consumable', quantity: 2, assigned_vehicle: 'van_1', created_at: daysAgo(30) },
  { id: 'inv-110', item_name: '16x25x1 MERV 11 Pleated Air Filters', category: 'consumable', quantity: 12, assigned_vehicle: 'van_1', created_at: daysAgo(30) },
  { id: 'inv-111', item_name: 'Sil-Fos 15% Silver Brazing Rods (Tubes)', category: 'consumable', quantity: 16, assigned_vehicle: 'van_1', created_at: daysAgo(30) },
  { id: 'inv-112', item_name: 'Contactor 2-Pole 30A 24V Coil', category: 'consumable', quantity: 6, assigned_vehicle: 'van_1', created_at: daysAgo(30) },

  // --- VAN 2: EQUIPMENT (TOOLS) ---
  { id: 'inv-201', item_name: 'Testo 557s Smart Digital Manifold Kit', category: 'equipment', quantity: 1, assigned_vehicle: 'van_2', created_at: daysAgo(30) },
  { id: 'inv-202', item_name: 'Navac Cordless Automatic Flaring Tool', category: 'equipment', quantity: 1, assigned_vehicle: 'van_2', created_at: daysAgo(30) },
  { id: 'inv-203', item_name: 'Inficon TEK-Mate Refrigerant Leak Detector', category: 'equipment', quantity: 1, assigned_vehicle: 'van_2', created_at: daysAgo(30) },
  { id: 'inv-204', item_name: 'Ridgid 300 Compact Pipe Threading Machine', category: 'equipment', quantity: 1, assigned_vehicle: 'van_2', created_at: daysAgo(30) },
  { id: 'inv-205', item_name: 'DeWalt 20V Max Hammer Drill & Impact Driver Set', category: 'equipment', quantity: 1, assigned_vehicle: 'van_2', created_at: daysAgo(30) },

  // --- VAN 2: CONSUMABLES ---
  { id: 'inv-206', item_name: 'R-454B Low-GWP Refrigerant 20lb Cylinder', category: 'consumable', quantity: 2.0, assigned_vehicle: 'van_2', created_at: daysAgo(30) },
  { id: 'inv-207', item_name: '35+5 MFD 370V Round Run Capacitor', category: 'consumable', quantity: 5, assigned_vehicle: 'van_2', created_at: daysAgo(30) },
  { id: 'inv-208', item_name: '20x20x1 MERV 8 Pleated Air Filters', category: 'consumable', quantity: 14, assigned_vehicle: 'van_2', created_at: daysAgo(30) },
  { id: 'inv-209', item_name: 'Stay-Brite 8 Solder & Liquid Flux Kit', category: 'consumable', quantity: 4, assigned_vehicle: 'van_2', created_at: daysAgo(30) },
  { id: 'inv-210', item_name: 'Condensate Neutralizer Inline Cartridge', category: 'consumable', quantity: 5, assigned_vehicle: 'van_2', created_at: daysAgo(30) },
  { id: 'inv-211', item_name: '3/8" Liquid Line Filter Drier', category: 'consumable', quantity: 7, assigned_vehicle: 'van_2', created_at: daysAgo(30) }
]

export const initialInventoryLogs: InventoryLog[] = [
  {
    id: 'log-1',
    job_id: 'job-102',
    captain_id: 'worker-2',
    captain_name: 'Elena Rostova',
    item_id: 'inv-211',
    item_name: '3/8" Liquid Line Filter Drier',
    quantity_deducted: 1,
    vehicle: 'van_2',
    timestamp: hoursAgo(3.5)
  },
  {
    id: 'log-2',
    job_id: 'job-102',
    captain_id: 'worker-2',
    captain_name: 'Elena Rostova',
    item_id: 'inv-207',
    item_name: '35+5 MFD 370V Round Run Capacitor',
    quantity_deducted: 1,
    vehicle: 'van_2',
    timestamp: hoursAgo(3.5)
  },
  {
    id: 'log-3',
    job_id: 'job-101',
    captain_id: 'worker-1',
    captain_name: 'Marcus Vance',
    item_id: 'inv-107',
    item_name: '45+5 MFD 440V Dual Round Run Capacitor',
    quantity_deducted: 2,
    vehicle: 'van_1',
    timestamp: hoursAgo(1.2)
  }
]

export const initialJobs: Job[] = [
  {
    id: 'job-101',
    title: 'Emergency Chiller System Inspection & Thermostat Relay Overhaul',
    client_name: 'Apex Tower Management',
    address_text: '401 Congress Ave, Ste 1200, Austin, TX 78701',
    lat: 30.2673,
    lng: -97.7430,
    assigned_worker_id: 'worker-1',
    assigned_worker_name: 'Marcus Vance',
    assigned_worker_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    admin_voice_note_url: SAMPLE_ADMIN_AUDIO,
    task_description: 'Inspect 40-ton rooftop air handling unit 4B. High-pressure cutoff tripped twice during afternoon peak. Replace thermal expansion valve and re-torque electrical terminals.',
    status: 'in_progress',
    scheduled_date: hoursAgo(3),
    
    // Secret Accountability
    before_photo_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800',
    before_photo_taken_at: hoursAgo(2.1),
    before_lat: 30.2673,
    before_lng: -97.7430,
    after_photo_url: null,
    after_photo_taken_at: null,
    after_lat: null,
    after_lng: null,
    completion_time: null,
    task_duration_minutes: null,
    worker_note: 'Pressure sensor reading 18% above nominal on circuit B. Commencing valve replacement now.',
    worker_voice_memo_url: null,
    
    client_price: 680.00,
    is_client_paid: false,
    created_at: hoursAgo(4)
  },
  {
    id: 'job-102',
    title: 'Medical Grade Autoclave Water Line Recalibration & Filter Replacement',
    client_name: 'Sterling Pediatric Clinic',
    address_text: '1100 Colorado St, Austin, TX 78701',
    lat: 30.2748,
    lng: -97.7402,
    assigned_worker_id: 'worker-2',
    assigned_worker_name: 'Elena Rostova',
    assigned_worker_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    admin_voice_note_url: null,
    task_description: 'Perform multi-stage RO filter replacement on Sterilization Suite A. Test flow rate, replace pressure regulator, and verify zero backflow into potable water line.',
    status: 'completed',
    scheduled_date: hoursAgo(5),
    
    // Secret Accountability
    before_photo_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800',
    before_photo_taken_at: hoursAgo(4.5),
    before_lat: 30.2748,
    before_lng: -97.7402,
    after_photo_url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80&w=800',
    after_photo_taken_at: hoursAgo(3.2),
    after_lat: 30.2748,
    after_lng: -97.7402,
    completion_time: hoursAgo(3.1),
    task_duration_minutes: 78,
    worker_note: 'Successfully replaced triple-stage micron filter cartridge and calibrated pressure reduction valve to 45 PSI. Tested with colorimetric reagent for zero particulate leakage. Cleaned sterilization bay floor.',
    worker_voice_memo_url: SAMPLE_WORKER_AUDIO,
    
    client_price: 850.00,
    is_client_paid: true,
    created_at: hoursAgo(6)
  },
  {
    id: 'job-103',
    title: 'Poolside Commercial Ice Maker & Beverage Line Overhaul',
    client_name: 'The South Congress Hotel',
    address_text: '1603 S Congress Ave, Austin, TX 78704',
    lat: 30.2521,
    lng: -97.7559,
    assigned_worker_id: 'worker-3',
    assigned_worker_name: 'Devon Miller',
    assigned_worker_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    admin_voice_note_url: SAMPLE_ADMIN_AUDIO,
    task_description: 'Service Scotsman Prodigy ice machine at rooftop lounge. Heavy scale buildup detected on evaporator plates. Sanitize with nickel-safe solution and replace water solenoid.',
    status: 'pending',
    scheduled_date: hoursAgo(1),
    
    before_photo_url: null,
    before_photo_taken_at: null,
    before_lat: null,
    before_lng: null,
    after_photo_url: null,
    after_photo_taken_at: null,
    after_lat: null,
    after_lng: null,
    completion_time: null,
    task_duration_minutes: null,
    worker_note: null,
    worker_voice_memo_url: null,
    
    client_price: 520.00,
    is_client_paid: false,
    created_at: hoursAgo(2)
  },
  {
    id: 'job-104',
    title: 'Cleanroom Solar Micro-Inverter Diagnostic & Grid Sync',
    client_name: 'Horizon BioTech Labs',
    address_text: '2400 Speedway, Austin, TX 78705',
    lat: 30.2861,
    lng: -97.7395,
    assigned_worker_id: 'worker-4',
    assigned_worker_name: 'Sarah Chen',
    assigned_worker_avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
    admin_voice_note_url: null,
    task_description: 'Diagnose intermittent fault on SolarEdge 3-phase inverter array 7. Thermal imaging indicated hot spot on contactor terminal L2.',
    status: 'completed',
    scheduled_date: daysAgo(1),
    
    before_photo_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&q=80&w=800',
    before_photo_taken_at: daysAgo(1),
    before_lat: 30.2861,
    before_lng: -97.7395,
    after_photo_url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&q=80&w=800',
    after_photo_taken_at: daysAgo(1),
    after_lat: 30.2861,
    after_lng: -97.7395,
    completion_time: daysAgo(1),
    task_duration_minutes: 110,
    worker_note: 'Replaced degraded 60A breaker and torqued terminal lugs to 50 in-lbs with calibrated torque wrench. Re-ran thermal scan: temperature dropped from 148°F to 82°F under full load.',
    worker_voice_memo_url: SAMPLE_WORKER_AUDIO,
    
    client_price: 1100.00,
    is_client_paid: true,
    created_at: daysAgo(2)
  }
]
