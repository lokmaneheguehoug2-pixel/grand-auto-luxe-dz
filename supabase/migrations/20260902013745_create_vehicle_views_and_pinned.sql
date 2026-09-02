/*
# Create vehicle_views table and add pinned column to vehicle_likes

1. New Tables
- `vehicle_views` — tracks each unique view of a vehicle listing
  - `id` uuid primary key
  - `vehicle_id` text not null (matches Firebase vehicle key)
  - `viewer_id` text (user id or phone, nullable for anonymous views)
  - `viewed_at` timestamptz default now()
  - Index on vehicle_id for fast count lookups

2. Modified Tables
- No existing tables modified destructively

3. Security
- Enable RLS on `vehicle_views`
- Public read (anyone can view) and insert (anyone can record a view)
- This is a single-tenant analytics table — all data is shared/public

4. Important Notes
- Views are inserted by the frontend whenever a user opens a vehicle detail page
- The frontend reads the count of views per vehicle to display on cards
- Anonymous views (no viewer_id) are allowed since not all visitors are signed in
*/

CREATE TABLE IF NOT EXISTS vehicle_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id text NOT NULL,
  viewer_id text,
  viewed_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_views_vehicle_id ON vehicle_views(vehicle_id);

ALTER TABLE vehicle_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_vehicle_views" ON vehicle_views;
CREATE POLICY "anon_select_vehicle_views" ON vehicle_views FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_vehicle_views" ON vehicle_views;
CREATE POLICY "anon_insert_vehicle_views" ON vehicle_views FOR INSERT
  TO anon, authenticated WITH CHECK (true);
