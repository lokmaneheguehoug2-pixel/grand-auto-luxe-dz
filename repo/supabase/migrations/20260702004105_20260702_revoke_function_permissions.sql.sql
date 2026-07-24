-- Revoke dangerous function permissions from anon and limit authenticated access

-- Admin functions: Only admins should call these (authenticated with admin role check inside)
REVOKE EXECUTE ON FUNCTION public.admin_reset_user_password(uuid, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.setup_admin_user(text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_confirm_email() FROM anon, authenticated;

-- User management functions: Block anon completely
REVOKE EXECUTE ON FUNCTION public.reset_daily_post_counter() FROM anon;
REVOKE EXECUTE ON FUNCTION public.increment_post_count() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_last_seen() FROM anon;

-- Promo codes: Only authenticated users
REVOKE EXECUTE ON FUNCTION public.apply_promo_code(uuid, text) FROM anon;

-- Helper functions: Block anon
REVOKE EXECUTE ON FUNCTION public.can_post_vehicle(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;

-- Grant appropriate permissions to authenticated
GRANT EXECUTE ON FUNCTION public.update_last_seen() TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_post_count() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_post_vehicle(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_promo_code(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid) TO authenticated;