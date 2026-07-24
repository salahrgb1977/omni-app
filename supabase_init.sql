-- Omni (Growth Partner System) Supabase Initialization Script

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('admin', 'worker');
CREATE TYPE job_status AS ENUM ('pending', 'in_progress', 'completed', 'needs_rework');
CREATE TYPE inventory_status AS ENUM ('in_van', 'checked_out', 'lost');
CREATE TYPE transaction_type AS ENUM ('income', 'expense');

-- 2. Create Tables

-- Profiles Table (Linked to Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'worker',
  full_name TEXT NOT NULL,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Clients Table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone_number TEXT,
  address_text TEXT,
  geo_lat FLOAT,
  geo_lng FLOAT,
  is_vip_member BOOLEAN DEFAULT false,
  membership_expiry TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Jobs Table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status job_status NOT NULL DEFAULT 'pending',
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  task_description TEXT NOT NULL,
  before_photo_url TEXT,
  after_photo_url TEXT,
  check_in_lat FLOAT,
  check_in_lng FLOAT,
  worker_payout DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  client_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inventory (The Omni Vault)
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  barcode_id TEXT UNIQUE NOT NULL,
  status inventory_status NOT NULL DEFAULT 'in_van',
  assigned_worker_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Transactions (Cash Flow Ledger)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  type transaction_type NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Row Level Security (RLS) Setup

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Helper Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles Policies
-- Admins can do everything
CREATE POLICY "Admins have full access to profiles" ON profiles FOR ALL USING (is_admin());
-- Users can read all profiles (useful for assigning workers, etc. or restricted if preferred)
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Clients Policies
CREATE POLICY "Admins have full access to clients" ON clients FOR ALL USING (is_admin());
-- Workers can view all clients (they need to see client details for their jobs)
CREATE POLICY "Workers can view clients" ON clients FOR SELECT USING (auth.role() = 'authenticated');

-- Jobs Policies
CREATE POLICY "Admins have full access to jobs" ON jobs FOR ALL USING (is_admin());
-- Workers can only see their own jobs
CREATE POLICY "Workers can view own jobs" ON jobs FOR SELECT USING (worker_id = auth.uid());
-- Workers can update their own jobs (status, photos, check-in)
CREATE POLICY "Workers can update own jobs" ON jobs FOR UPDATE USING (worker_id = auth.uid());

-- Inventory Policies
CREATE POLICY "Admins have full access to inventory" ON inventory FOR ALL USING (is_admin());
-- Workers can view all inventory (to know what's in the van)
CREATE POLICY "Workers can view inventory" ON inventory FOR SELECT USING (auth.role() = 'authenticated');
-- Workers can update inventory assigned to them (or maybe checkout process updates it)
CREATE POLICY "Workers can update own assigned inventory" ON inventory FOR UPDATE USING (assigned_worker_id = auth.uid());

-- Transactions Policies
-- Only Admins can access transactions
CREATE POLICY "Admins have full access to transactions" ON transactions FOR ALL USING (is_admin());

-- 4. Storage Bucket for Photos
-- You will need to create a storage bucket named 'job-photos' in the Supabase UI
-- Alternatively, SQL for bucket creation (requires superuser, usually done via UI or migrations):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('job-photos', 'job-photos', false);
-- Storage RLS:
-- CREATE POLICY "Workers can upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'job-photos' AND auth.role() = 'authenticated');
-- CREATE POLICY "Everyone can view photos" ON storage.objects FOR SELECT USING (bucket_id = 'job-photos');

-- 5. Triggers for updated_at
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$ language 'plpgsql';

CREATE TRIGGER update_jobs_modtime 
BEFORE UPDATE ON jobs 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- 6. Trigger for New User Profile Creation
-- Automatically creates a worker profile when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New Worker'),
    'worker'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
