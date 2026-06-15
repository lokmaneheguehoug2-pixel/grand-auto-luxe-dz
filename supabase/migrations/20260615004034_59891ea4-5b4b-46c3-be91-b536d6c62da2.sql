
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin','user');
CREATE TYPE public.subscription_status AS ENUM ('trial','active','locked');
CREATE TYPE public.price_type AS ENUM ('fixed','auction');
CREATE TYPE public.vehicle_status AS ENUM ('active','closed');
CREATE TYPE public.payment_status AS ENUM ('pending','approved','rejected');
CREATE TYPE public.fuel_type AS ENUM ('Diesel','Essence','GPL','Hybrid','Electrique');
CREATE TYPE public.transmission_type AS ENUM ('Manuelle','Automatique');

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dob DATE NOT NULL,
  place_of_birth TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  trial_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  subscription_status public.subscription_status NOT NULL DEFAULT 'trial',
  subscription_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles select" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "admin roles select" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Admin extra policies on profiles
CREATE POLICY "admin profile select" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin profile update" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- vehicles
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT NOT NULL,
  mileage INT NOT NULL,
  engine_type TEXT,
  fuel_type public.fuel_type NOT NULL,
  transmission public.transmission_type NOT NULL,
  wilaya TEXT NOT NULL,
  phone TEXT NOT NULL,
  description TEXT,
  photos TEXT[] NOT NULL DEFAULT '{}',
  video_url TEXT,
  price_type public.price_type NOT NULL,
  fixed_price BIGINT,
  starting_price BIGINT,
  current_highest_bid BIGINT,
  current_highest_bidder UUID REFERENCES auth.users(id),
  auction_ends_at TIMESTAMPTZ,
  status public.vehicle_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vehicles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read vehicles" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "own insert vehicles" ON public.vehicles FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "own update vehicles" ON public.vehicles FOR UPDATE TO authenticated USING (auth.uid() = seller_id);
CREATE POLICY "own delete vehicles" ON public.vehicles FOR DELETE TO authenticated USING (auth.uid() = seller_id);
CREATE POLICY "admin delete vehicles" ON public.vehicles FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update vehicles" ON public.vehicles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- bids
CREATE TABLE public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bids TO anon;
GRANT SELECT, INSERT ON public.bids TO authenticated;
GRANT ALL ON public.bids TO service_role;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read bids" ON public.bids FOR SELECT USING (true);
CREATE POLICY "auth insert bids" ON public.bids FOR INSERT TO authenticated WITH CHECK (auth.uid() = bidder_id);

-- Bid validation trigger
CREATE OR REPLACE FUNCTION public.validate_and_apply_bid()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v public.vehicles%ROWTYPE;
BEGIN
  SELECT * INTO v FROM public.vehicles WHERE id = NEW.vehicle_id FOR UPDATE;
  IF v.price_type <> 'auction' THEN RAISE EXCEPTION 'Vehicle is not an auction'; END IF;
  IF v.status <> 'active' OR v.auction_ends_at <= now() THEN RAISE EXCEPTION 'Auction is closed'; END IF;
  IF v.seller_id = NEW.bidder_id THEN RAISE EXCEPTION 'Sellers cannot bid on their own vehicle'; END IF;
  IF NEW.amount <= COALESCE(v.current_highest_bid, v.starting_price - 1) THEN
    RAISE EXCEPTION 'Bid must be higher than current highest bid';
  END IF;
  UPDATE public.vehicles
    SET current_highest_bid = NEW.amount, current_highest_bidder = NEW.bidder_id
    WHERE id = NEW.vehicle_id;
  RETURN NEW;
END; $$;
CREATE TRIGGER bids_validate BEFORE INSERT ON public.bids
  FOR EACH ROW EXECUTE FUNCTION public.validate_and_apply_bid();

-- payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  screenshot_url TEXT NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);
GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own payments select" ON public.payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own payments insert" ON public.payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admin payments select" ON public.payments FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin payments update" ON public.payments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Auto-create profile on signup using user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, dob, place_of_birth, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name',''),
    COALESCE(NEW.raw_user_meta_data->>'last_name',''),
    COALESCE((NEW.raw_user_meta_data->>'dob')::date, '1970-01-01'::date),
    COALESCE(NEW.raw_user_meta_data->>'place_of_birth',''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.id::text)
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
