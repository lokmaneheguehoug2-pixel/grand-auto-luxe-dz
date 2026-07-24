
ALTER TYPE public.vehicle_status ADD VALUE IF NOT EXISTS 'sold';
ALTER TYPE public.vehicle_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE public.vehicle_status ADD VALUE IF NOT EXISTS 'rejected';
ALTER TYPE public.vehicle_status ADD VALUE IF NOT EXISTS 'archived';
