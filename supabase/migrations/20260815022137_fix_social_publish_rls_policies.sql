/*
# Fix social publish RLS policies to use has_role

## Summary
The previous migration used a non-existent `user_roles` table for admin checks.
This migration drops and recreates the admin policies using the project's
actual admin check: `has_role(auth.uid(), 'admin'::app_role)`.

## Changes
- Drop and recreate INSERT/UPDATE/DELETE policies on `social_publish_settings`
- Drop and recreate INSERT/UPDATE/DELETE/SELECT policies on `social_publish_log`
- All admin policies use `has_role(auth.uid(), 'admin'::app_role)`
- Public read on settings remains unchanged (already correct)

## Security
- RLS remains enabled on both tables
- Admin-only writes enforced via has_role
- Public read on settings singleton for frontend toggle checks
*/

-- ===== social_publish_settings =====
DROP POLICY IF EXISTS "admin_update_publish_settings" ON social_publish_settings;
CREATE POLICY "admin_update_publish_settings"
  ON social_publish_settings FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "admin_insert_publish_settings" ON social_publish_settings;
CREATE POLICY "admin_insert_publish_settings"
  ON social_publish_settings FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ===== social_publish_log =====
DROP POLICY IF EXISTS "admin_read_publish_log" ON social_publish_log;
CREATE POLICY "admin_read_publish_log"
  ON social_publish_log FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "admin_update_publish_log" ON social_publish_log;
CREATE POLICY "admin_update_publish_log"
  ON social_publish_log FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "admin_insert_publish_log" ON social_publish_log;
CREATE POLICY "admin_insert_publish_log"
  ON social_publish_log FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "admin_delete_publish_log" ON social_publish_log;
CREATE POLICY "admin_delete_publish_log"
  ON social_publish_log FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
