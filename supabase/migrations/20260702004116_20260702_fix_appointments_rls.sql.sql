-- Fix RLS policy for appointments - only authenticated users can insert
CREATE POLICY "authenticated_insert_appointments" ON public.appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow anyone to select their own appointments (seller or system)
CREATE POLICY "select_own_appointments" ON public.appointments
  FOR SELECT
  TO authenticated
  USING (seller_id = auth.uid());