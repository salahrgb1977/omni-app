-- ====================================================================
-- OMNI HVAC OS: MASTER DATABASE SCHEMA & MIGRATION SCRIPT
-- ====================================================================

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'worker');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE item_category AS ENUM ('equipment', 'consumable');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE job_status AS ENUM ('pending', 'in_progress', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE vehicle_id AS ENUM ('van_1', 'van_2');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. PROFILES (Users & Daily Captain Designation)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  role user_role DEFAULT 'worker',
  is_daily_captain BOOLEAN DEFAULT false,
  assigned_vehicle vehicle_id DEFAULT 'van_1',
  performance_score NUMERIC DEFAULT 100.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SHIFTS & SILENT LOCATION TRACKING
CREATE TABLE IF NOT EXISTS public.shifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  start_lat FLOAT,
  start_lng FLOAT,
  end_time TIMESTAMPTZ,
  end_lat FLOAT,
  end_lng FLOAT,
  is_paid BOOLEAN DEFAULT false,
  paid_amount NUMERIC DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS public.location_pings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shift_id UUID REFERENCES public.shifts(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 4. VAN INVENTORY & DEDUCTION LOGS
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  category item_category DEFAULT 'equipment',
  quantity NUMERIC DEFAULT 1,
  assigned_vehicle vehicle_id NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID,
  captain_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE,
  quantity_deducted NUMERIC NOT NULL,
  vehicle vehicle_id NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 5. JOBS & TASKS
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  address_text TEXT NOT NULL,
  lat FLOAT,
  lng FLOAT,
  assigned_worker_id UUID REFERENCES public.profiles(id),
  admin_voice_note_url TEXT,
  task_description TEXT,
  status job_status DEFAULT 'pending',
  scheduled_date TIMESTAMPTZ,
  
  -- Secret Accountability Fields
  before_photo_url TEXT,
  before_photo_taken_at TIMESTAMPTZ,
  before_lat FLOAT,
  before_lng FLOAT,
  
  after_photo_url TEXT,
  after_photo_taken_at TIMESTAMPTZ,
  after_lat FLOAT,
  after_lng FLOAT,
  
  completion_time TIMESTAMPTZ,
  task_duration_minutes INT,
  worker_note TEXT,
  worker_voice_memo_url TEXT,
  
  -- Client Financials
  client_price NUMERIC DEFAULT 0.00,
  is_client_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ATOMIC CONSUMABLE DEDUCTION RPC
CREATE OR REPLACE FUNCTION log_consumable_usage(
  p_job_id UUID, 
  p_captain_id UUID, 
  p_item_id UUID, 
  p_quantity NUMERIC,
  p_vehicle vehicle_id
) 
RETURNS void AS $$
BEGIN
  UPDATE public.inventory
  SET quantity = quantity - p_quantity
  WHERE id = p_item_id;

  INSERT INTO public.inventory_logs (job_id, captain_id, item_id, quantity_deducted, vehicle)
  VALUES (p_job_id, p_captain_id, p_item_id, p_quantity, p_vehicle);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_pings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view all profiles, but only admins or self can update
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile or admin can update all" 
ON public.profiles FOR UPDATE TO authenticated 
USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Shifts: Workers can view/insert/update their own shifts; Admins can view/update all
CREATE POLICY "Shifts accessible by owner or admin" 
ON public.shifts FOR ALL TO authenticated 
USING (worker_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Location Pings: Workers can insert their own pings; Admins can view all
CREATE POLICY "Location pings insertable by worker, viewable by admin" 
ON public.location_pings FOR ALL TO authenticated 
USING (worker_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Inventory: Viewable by all workers; Insert/Update/Delete restricted to admin or RPC
CREATE POLICY "Inventory viewable by all authenticated" 
ON public.inventory FOR SELECT TO authenticated USING (true);

CREATE POLICY "Inventory editable by admin" 
ON public.inventory FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Inventory Logs: Privacy Protection - ONLY Admins can view audit logs
CREATE POLICY "Inventory logs viewable by admin only" 
ON public.inventory_logs FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Inventory logs insertable by captain or admin" 
ON public.inventory_logs FOR INSERT TO authenticated 
WITH CHECK (captain_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Jobs: Workers can see assigned jobs; Admins can see and manage all
CREATE POLICY "Jobs accessible by assigned worker or admin" 
ON public.jobs FOR ALL TO authenticated 
USING (assigned_worker_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
