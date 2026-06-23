-- Fix user_roles policies to allow service_role to manage roles
-- This allows the admin to manage user roles through the dashboard

-- Drop existing policies
DROP POLICY IF EXISTS "own roles select" ON public.user_roles;
DROP POLICY IF EXISTS "admin roles select" ON public.user_roles;

-- Create new policies
CREATE POLICY "user read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "admin manage all roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Grant service_role full access for server-side operations
GRANT ALL ON public.user_roles TO service_role;

-- Create a function to setup admin user (call this manually after first signup)
CREATE OR REPLACE FUNCTION public.setup_admin_user(p_phone text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Find user by phone in profiles
  SELECT id INTO v_user_id FROM public.profiles WHERE phone = p_phone;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User with phone % not found', p_phone;
  END IF;
  
  -- Add admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT DO NOTHING;
  
  -- Update profile to active subscription
  UPDATE public.profiles
  SET subscription_status = 'active',
      subscription_until = now() + interval '100 years'
  WHERE id = v_user_id;
END;
$$;
