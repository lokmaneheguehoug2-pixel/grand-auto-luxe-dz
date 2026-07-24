/*
# Grant Admin After Signup Helper Function

Allows granting admin rights to a user after they sign up via the UI.
Call: SELECT public.grant_admin_after_signup('0781606765');
*/

CREATE OR REPLACE FUNCTION public.grant_admin_after_signup(p_phone text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM public.profiles WHERE phone = p_phone;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with phone %', p_phone;
  END IF;
  
  UPDATE public.profiles
  SET 
    subscription_status = 'active',
    subscription_until = now() + interval '100 years',
    plan_type = 'showroom'
  WHERE id = v_user_id;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.grant_admin_after_signup(text) TO service_role;
