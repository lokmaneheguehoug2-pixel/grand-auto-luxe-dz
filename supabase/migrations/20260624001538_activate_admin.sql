/*
# Activate Admin and Grant Admin Role

1. Purpose
- Set subscription to active for 100 years
- Grant admin role
- Set plan_type to showroom
*/

-- Update profile with admin privileges
UPDATE public.profiles
SET 
  subscription_status = 'active',
  subscription_until = now() + interval '100 years',
  plan_type = 'showroom'
WHERE id = '129657f0-5114-43b3-8f72-bcafa7c9e151';

-- Add admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('129657f0-5114-43b3-8f72-bcafa7c9e151', 'admin')
ON CONFLICT DO NOTHING;

-- Verify
SELECT 
  p.id, 
  p.first_name, 
  p.last_name, 
  p.phone,
  p.subscription_status,
  p.subscription_until,
  p.plan_type,
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = p.id AND role = 'admin'
  ) as is_admin
FROM public.profiles p
WHERE p.id = '129657f0-5114-43b3-8f72-bcafa7c9e151';
