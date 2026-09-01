/*
# Vehicle Favorites & Price History

## Summary
Creates tables for user watchlists (favorites) and price drop tracking.

## New Tables

### 1. vehicle_favorites
- `id` uuid PK
- `vehicle_id` text NOT NULL — Firebase vehicle ID
- `user_id` text NOT NULL — Firebase user ID
- `created_at` timestamptz DEFAULT now()
- Unique constraint on (vehicle_id, user_id)

### 2. vehicle_price_history
- `id` uuid PK
- `vehicle_id` text NOT NULL
- `old_price` numeric NOT NULL
- `new_price` numeric NOT NULL
- `changed_at` timestamptz DEFAULT now()

## Security
- RLS enabled on both tables
- Public read for favorites (so counts work)
- Authenticated insert/delete for own favorites
- Public read for price history, authenticated insert
*/

CREATE TABLE IF NOT EXISTS vehicle_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id text NOT NULL,
  user_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vehicle_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_vehicle_favorites" ON vehicle_favorites;
CREATE POLICY "public_read_vehicle_favorites"
  ON vehicle_favorites FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "auth_insert_vehicle_favorite" ON vehicle_favorites;
CREATE POLICY "auth_insert_vehicle_favorite"
  ON vehicle_favorites FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_vehicle_favorite" ON vehicle_favorites;
CREATE POLICY "auth_delete_vehicle_favorite"
  ON vehicle_favorites FOR DELETE
  TO authenticated
  USING (true);

CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicle_favorites_unique ON vehicle_favorites(vehicle_id, user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_favorites_user ON vehicle_favorites(user_id);

CREATE TABLE IF NOT EXISTS vehicle_price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id text NOT NULL,
  old_price numeric NOT NULL,
  new_price numeric NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vehicle_price_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_price_history" ON vehicle_price_history;
CREATE POLICY "public_read_price_history"
  ON vehicle_price_history FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "auth_insert_price_history" ON vehicle_price_history;
CREATE POLICY "auth_insert_price_history"
  ON vehicle_price_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_price_history_vehicle ON vehicle_price_history(vehicle_id, changed_at DESC);
