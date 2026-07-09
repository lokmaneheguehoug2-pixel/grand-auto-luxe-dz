
-- ============ EXTEND VEHICLES ============
DO $$ BEGIN
  CREATE TYPE public.vehicle_status AS ENUM ('pending','active','sold','rejected','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS status public.vehicle_status NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured_until timestamptz,
  ADD COLUMN IF NOT EXISTS is_vip boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS paint_condition text,
  ADD COLUMN IF NOT EXISTS documents_status text,
  ADD COLUMN IF NOT EXISTS transaction_types text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sold_at timestamptz;

-- ============ EXTEND PROFILES ============
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_showroom boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS showroom_name text,
  ADD COLUMN IF NOT EXISTS showroom_logo text,
  ADD COLUMN IF NOT EXISTS showroom_description text,
  ADD COLUMN IF NOT EXISTS trial_started_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

-- ============ PENDING SUBSCRIPTIONS ============
DO $$ BEGIN
  CREATE TYPE public.sub_plan AS ENUM ('monthly','yearly');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.sub_status AS ENUM ('pending','approved','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.pending_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan public.sub_plan NOT NULL,
  amount integer NOT NULL,
  receipt_url text NOT NULL,
  status public.sub_status NOT NULL DEFAULT 'pending',
  reviewer_id uuid,
  review_note text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

GRANT SELECT, INSERT, UPDATE ON public.pending_subscriptions TO authenticated;
GRANT ALL ON public.pending_subscriptions TO service_role;
ALTER TABLE public.pending_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user reads own pending sub" ON public.pending_subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "user creates own pending sub" ON public.pending_subscriptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admin updates pending sub" ON public.pending_subscriptions
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ============ VEHICLE REPORTS ============
CREATE TABLE IF NOT EXISTS public.vehicle_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.vehicle_reports TO authenticated;
GRANT ALL ON public.vehicle_reports TO service_role;
ALTER TABLE public.vehicle_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "report insert by signed in" ON public.vehicle_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "report read self or admin" ON public.vehicle_reports
  FOR SELECT TO authenticated USING (auth.uid() = reporter_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "report update admin" ON public.vehicle_reports
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ============ ADMIN LOGS ============
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text,
  target_id text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_logs TO authenticated;
GRANT ALL ON public.admin_logs TO service_role;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin reads logs" ON public.admin_logs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin writes logs" ON public.admin_logs
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') AND auth.uid() = admin_id);

-- ============ NOTIFICATIONS ============
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  link text,
  kind text NOT NULL DEFAULT 'info',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif read own" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notif update own" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notif insert admin or self" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') OR auth.uid() = user_id);

-- ============ BROADCAST MESSAGES ============
CREATE TABLE IF NOT EXISTS public.broadcast_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.broadcast_messages TO authenticated;
GRANT ALL ON public.broadcast_messages TO service_role;
ALTER TABLE public.broadcast_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "broadcast read all" ON public.broadcast_messages
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "broadcast insert admin" ON public.broadcast_messages
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') AND auth.uid() = admin_id);

-- ============ CAR ALERTS ============
CREATE TABLE IF NOT EXISTS public.car_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand text,
  model text,
  year_min integer,
  year_max integer,
  price_max integer,
  wilaya text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.car_alerts TO authenticated;
GRANT ALL ON public.car_alerts TO service_role;
ALTER TABLE public.car_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alert manage own" ON public.car_alerts
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ MESSAGES (buyer/seller chat) ============
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_thread_idx ON public.messages(vehicle_id, sender_id, recipient_id);
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg read participants" ON public.messages
  FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "msg insert by sender" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "msg update recipient" ON public.messages
  FOR UPDATE TO authenticated USING (auth.uid() = recipient_id);

-- ============ SHOWROOM REVIEWS ============
CREATE TABLE IF NOT EXISTS public.showroom_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  showroom_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(showroom_id, reviewer_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.showroom_reviews TO authenticated;
GRANT SELECT ON public.showroom_reviews TO anon;
GRANT ALL ON public.showroom_reviews TO service_role;
ALTER TABLE public.showroom_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "review read all" ON public.showroom_reviews
  FOR SELECT USING (true);
CREATE POLICY "review insert by reviewer" ON public.showroom_reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id AND auth.uid() <> showroom_id);
CREATE POLICY "review update own" ON public.showroom_reviews
  FOR UPDATE TO authenticated USING (auth.uid() = reviewer_id);
CREATE POLICY "review delete own or admin" ON public.showroom_reviews
  FOR DELETE TO authenticated USING (auth.uid() = reviewer_id OR public.has_role(auth.uid(),'admin'));

-- ============ STORIES (reels) ============
CREATE TABLE IF NOT EXISTS public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  showroom_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  video_url text NOT NULL,
  caption text,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stories TO authenticated;
GRANT SELECT ON public.stories TO anon;
GRANT ALL ON public.stories TO service_role;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "story read all" ON public.stories
  FOR SELECT USING (true);
CREATE POLICY "story insert showroom" ON public.stories
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = showroom_id);
CREATE POLICY "story delete own or admin" ON public.stories
  FOR DELETE TO authenticated USING (auth.uid() = showroom_id OR public.has_role(auth.uid(),'admin'));

-- ============ ADMIN POLICY EXTENSIONS for existing tables ============
DROP POLICY IF EXISTS "admin manage vehicles" ON public.vehicles;
CREATE POLICY "admin manage vehicles" ON public.vehicles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "admin manage profiles" ON public.profiles;
CREATE POLICY "admin manage profiles" ON public.profiles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'));
