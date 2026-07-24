-- Site Settings Table for dynamic social links
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policies for site_settings (public read, admin write)
CREATE POLICY "public_read_settings" ON public.site_settings
  FOR SELECT TO public USING (true);

CREATE POLICY "admin_manage_settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Insert default social links
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
  ('whatsapp_number', '+213555000000'),
  ('instagram_url', 'https://instagram.com/grandautoluxe'),
  ('facebook_url', 'https://facebook.com/grandautoluxe'),
  ('gmail_address', 'contact@grandautoluxe.com'),
  ('site_name', 'GRAND Auto Luxe'),
  ('site_tagline', 'Premium Algerian Vehicle Marketplace')
ON CONFLICT (setting_key) DO NOTHING;

-- Appointments / Viewing Requests Table
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  client_email text,
  preferred_date date,
  preferred_time text,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Policies for appointments
CREATE POLICY "sellers_view_own_appointments" ON public.appointments
  FOR SELECT TO authenticated USING (auth.uid() = seller_id);

CREATE POLICY "admin_view_all_appointments" ON public.appointments
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admin_manage_appointments" ON public.appointments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow anyone to insert appointments (from car detail page)
CREATE POLICY "public_insert_appointments" ON public.appointments
  FOR INSERT TO public WITH CHECK (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_appointments_seller ON public.appointments(seller_id);
CREATE INDEX IF NOT EXISTS idx_appointments_vehicle ON public.appointments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
