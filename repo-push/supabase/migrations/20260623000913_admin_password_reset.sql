-- Admin password reset function (admin-only)
CREATE OR REPLACE FUNCTION public.admin_reset_user_password(p_user_id uuid, p_new_password text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Verify caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can reset passwords';
  END IF;
  
  -- Update user password via auth schema
  UPDATE auth.users
  SET encrypted_password = crypt(p_new_password, gen_salt('bf'))
  WHERE id = p_user_id;
  
  -- Log the action
  INSERT INTO public.admin_logs (admin_id, action, target_type, target_id)
  VALUES (auth.uid(), 'password_reset', 'user', p_user_id::text);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_reset_user_password TO authenticated;
