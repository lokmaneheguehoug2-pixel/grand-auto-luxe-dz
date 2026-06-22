-- Create storage buckets for the GRAND Auto Luxe marketplace
INSERT INTO storage.buckets (id, name, public) VALUES
  ('vehicle-media', 'vehicle-media', true),
  ('payment-receipts', 'payment-receipts', false),
  ('reels', 'reels', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies first (they may reference wrong bucket IDs)
DROP POLICY IF EXISTS "vehicle media public read" ON storage.objects;
DROP POLICY IF EXISTS "vehicle media auth insert" ON storage.objects;
DROP POLICY IF EXISTS "vehicle media owner delete" ON storage.objects;
DROP POLICY IF EXISTS "receipts owner insert" ON storage.objects;
DROP POLICY IF EXISTS "receipts owner select" ON storage.objects;
DROP POLICY IF EXISTS "receipts admin select" ON storage.objects;
DROP POLICY IF EXISTS "reels read authenticated" ON storage.objects;
DROP POLICY IF EXISTS "reels upload own folder" ON storage.objects;
DROP POLICY IF EXISTS "reels delete own" ON storage.objects;

-- ===== VEHICLE-MEDIA BUCKET POLICIES =====
-- Public read (vehicles are visible to everyone)
CREATE POLICY "vehicle-media-public-read" ON storage.objects
  FOR SELECT USING (bucket_id = 'vehicle-media');

-- Authenticated users can upload to their own folder
CREATE POLICY "vehicle-media-auth-insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'vehicle-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own uploads
CREATE POLICY "vehicle-media-owner-delete" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'vehicle-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins can manage all vehicle media
CREATE POLICY "vehicle-media-admin-all" ON storage.objects
  FOR ALL TO authenticated USING (
    bucket_id = 'vehicle-media' 
    AND public.has_role(auth.uid(), 'admin')
  );

-- ===== PAYMENT-RECEIPTS BUCKET POLICIES =====
-- Users can upload their own receipts
CREATE POLICY "receipts-owner-insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'payment-receipts' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can read their own receipts
CREATE POLICY "receipts-owner-select" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'payment-receipts' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins can read all receipts
CREATE POLICY "receipts-admin-select" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'payment-receipts' 
    AND public.has_role(auth.uid(), 'admin')
  );

-- ===== REELS BUCKET POLICIES =====
-- Authenticated users can view reels
CREATE POLICY "reels-auth-select" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'reels');

-- Users can upload reels to their own folder (must be active subscriber)
CREATE POLICY "reels-owner-insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'reels' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own reels
CREATE POLICY "reels-owner-delete" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'reels' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins can manage all reels
CREATE POLICY "reels-admin-all" ON storage.objects
  FOR ALL TO authenticated USING (
    bucket_id = 'reels' 
    AND public.has_role(auth.uid(), 'admin')
  );

-- ===== ADDITIONAL INDEXES FOR PERFORMANCE =====
CREATE INDEX IF NOT EXISTS idx_vehicles_status_created ON public.vehicles(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicles_seller_status ON public.vehicles(seller_id, status);
CREATE INDEX IF NOT EXISTS idx_vehicles_wilaya ON public.vehicles(wilaya);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand ON public.vehicles(brand);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_read ON public.messages(recipient_id, read_at);
CREATE INDEX IF NOT EXISTS idx_bids_vehicle_amount ON public.bids(vehicle_id, amount DESC);

-- ===== FUNCTION TO UPDATE LAST_SEEN_AT =====
CREATE OR REPLACE FUNCTION public.update_last_seen()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.profiles SET last_seen_at = now() WHERE id = auth.uid();
$$;

-- ===== FUNCTION TO CHECK SUBSCRIPTION ACCESS =====
CREATE OR REPLACE FUNCTION public.has_active_subscription(p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_user_id
      AND is_banned = false
      AND (
        subscription_status = 'active'
        OR (subscription_status = 'trial' AND trial_started_at > now() - interval '72 hours')
      )
  );
$$;

-- ===== GRANT EXECUTE ON NEW FUNCTIONS =====
REVOKE EXECUTE ON FUNCTION public.update_last_seen() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_last_seen() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid) TO authenticated;