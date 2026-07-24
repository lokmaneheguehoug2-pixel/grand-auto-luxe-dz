/*
# Site Settings — Structured Contact Channel Table

## Summary
Replaces the existing key-value `site_settings` table with a structured single-row table
that mirrors the fields the application's admin SettingsTab and CustomerServiceFooter
expect. This brings the platform settings into Supabase as the durable source of truth
for all customer service contact channels.

## Changes
1. New Table: `platform_settings` (structured, single active row)
   - `id` — uuid primary key (fixed singleton row)
   - `whatsapp_number` — text, nullable — WhatsApp business number for customer contact
   - `support_phone` — text, nullable — direct support phone line
   - `facebook_url` — text, nullable — Facebook page URL
   - `instagram_url` — text, nullable — Instagram profile URL
   - `tiktok_url` — text, nullable — TikTok account URL
   - `baridi_mob_number` — text, nullable — CCP / Baridi Mob payment number
   - `appointment_email` — text, nullable — Email for viewing appointment notifications
   - `gmail_address` — text, nullable — General contact/inquiry Gmail address
   - `updated_at` — timestamptz, auto-updated on change
   - `updated_by` — uuid, nullable — admin who last changed settings

2. Security
   - RLS enabled on `platform_settings`
   - Public read (anon + authenticated) — all site visitors need to see contact channels
   - Admin-only write (INSERT/UPDATE/DELETE) — restricted via user_roles check

3. Notes
   - The old `site_settings` key-value table is left in place to avoid data loss.
   - The new `platform_settings` table uses a singleton pattern (single row with fixed id).
   - A seed row is inserted with empty values so the app never reads a null table.
*/

CREATE TABLE IF NOT EXISTS platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_number text,
  support_phone text,
  facebook_url text,
  instagram_url text,
  tiktok_url text,
  baridi_mob_number text,
  appointment_email text,
  gmail_address text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_platform_settings" ON platform_settings;
CREATE POLICY "public_read_platform_settings"
  ON platform_settings FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_insert_platform_settings" ON platform_settings;
CREATE POLICY "admin_insert_platform_settings"
  ON platform_settings FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

DROP POLICY IF EXISTS "admin_update_platform_settings" ON platform_settings;
CREATE POLICY "admin_update_platform_settings"
  ON platform_settings FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

DROP POLICY IF EXISTS "admin_delete_platform_settings" ON platform_settings;
CREATE POLICY "admin_delete_platform_settings"
  ON platform_settings FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- Seed a singleton row so the app always has a row to read
INSERT INTO platform_settings (id, whatsapp_number, support_phone, facebook_url, instagram_url, tiktok_url, baridi_mob_number, appointment_email, gmail_address)
SELECT '00000000-0000-0000-0000-000000000001', '', '', '', '', '', '', '', ''
WHERE NOT EXISTS (SELECT 1 FROM platform_settings);

-- Auto-update updated_at on changes
CREATE OR REPLACE FUNCTION update_platform_settings_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS platform_settings_updated_at ON platform_settings;
CREATE TRIGGER platform_settings_updated_at
  BEFORE UPDATE ON platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_settings_timestamp();
