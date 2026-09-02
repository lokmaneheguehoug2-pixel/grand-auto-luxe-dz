/*
# Create vehicle_inquiries table

1. New Tables
- `vehicle_inquiries` — tracks each buyer inquiry/contact made on a vehicle listing
  - `id` uuid primary key
  - `vehicle_id` text not null (matches Firebase vehicle key)
  - `inquirer_id` text (user id or phone, nullable for anonymous)
  - `inquiry_type` text (call, whatsapp, chat) — how the buyer contacted
  - `created_at` timestamptz default now()
  - Index on vehicle_id for fast count lookups

2. Security
- Enable RLS on `vehicle_inquiries`
- Public read (anyone can see inquiry counts) and insert (anyone can record an inquiry)
- Single-tenant analytics table — all data is shared/public

3. Important Notes
- Inquiries are inserted by the frontend whenever a user calls, WhatsApps, or chats with a seller
- The homepage and vehicle cards display the total inquiry count per vehicle
- This powers the "آخر السومات / تفاعلات السعر" badge on cards
*/

CREATE TABLE IF NOT EXISTS vehicle_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id text NOT NULL,
  inquirer_id text,
  inquiry_type text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_inquiries_vehicle_id ON vehicle_inquiries(vehicle_id);

ALTER TABLE vehicle_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_vehicle_inquiries" ON vehicle_inquiries;
CREATE POLICY "anon_select_vehicle_inquiries" ON vehicle_inquiries FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_vehicle_inquiries" ON vehicle_inquiries;
CREATE POLICY "anon_insert_vehicle_inquiries" ON vehicle_inquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);
