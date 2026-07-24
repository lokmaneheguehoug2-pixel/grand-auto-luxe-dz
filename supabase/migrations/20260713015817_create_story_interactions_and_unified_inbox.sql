/*
# Create story_interactions table and unified inbox function

1. New Tables
- `story_interactions`
  - `id` (uuid, primary key)
  - `story_id` (text, not null) — references Firebase story ID
  - `story_video_url` (text) — thumbnail/video URL of the story/reel
  - `story_caption` (text) — caption shown on the story
  - `author_id` (text, not null) — Firebase UID of the story author (recipient of the interaction)
  - `sender_id` (uuid, not null, default auth.uid()) — Supabase auth user who sent the reply/reaction
  - `interaction_type` (text, not null) — 'reply' | 'reaction'
  - `body` (text, not null) — text content of the reply or reaction
  - `read_at` (timestamptz, nullable) — when the author read the interaction
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `story_interactions`.
- SELECT: sender or story author can read.
- INSERT: only the authenticated sender can insert their own interaction.
- UPDATE: only the story author can update (mark as read).
- DELETE: only the sender can delete their own interaction.

3. New Functions
- `get_unified_inbox(p_user_id uuid)` — returns a unified, chronologically sorted feed combining:
  - Direct messages from the `messages` table where the user is sender or recipient.
  - Story interactions from `story_interactions` where the user is sender or story author.
  - Each row includes a `feed_type` discriminator ('message' | 'story_interaction').
  - Sorted by `created_at` descending (newest first).

4. Important Notes
- The `story_interactions` table stores references to Firebase stories (by story_id text) because stories live in Firebase, not Supabase.
- The `messages` table already exists with its own RLS policies; this migration does not modify it.
- The `get_unified_inbox` function runs with the caller's privileges, so RLS on both tables is respected.
*/

CREATE TABLE IF NOT EXISTS story_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id text NOT NULL,
  story_video_url text,
  story_caption text,
  author_id text NOT NULL,
  sender_id uuid NOT NULL DEFAULT auth.uid(),
  interaction_type text NOT NULL DEFAULT 'reply',
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE story_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "story_interaction_select_participants" ON story_interactions;
CREATE POLICY "story_interaction_select_participants"
ON story_interactions FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR author_id = auth.uid()::text);

DROP POLICY IF EXISTS "story_interaction_insert_own" ON story_interactions;
CREATE POLICY "story_interaction_insert_own"
ON story_interactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "story_interaction_update_author" ON story_interactions;
CREATE POLICY "story_interaction_update_author"
ON story_interactions FOR UPDATE
TO authenticated
USING (author_id = auth.uid()::text)
WITH CHECK (author_id = auth.uid()::text);

DROP POLICY IF EXISTS "story_interaction_delete_own" ON story_interactions;
CREATE POLICY "story_interaction_delete_own"
ON story_interactions FOR DELETE
TO authenticated
USING (auth.uid() = sender_id);

CREATE INDEX IF NOT EXISTS idx_story_interactions_sender ON story_interactions(sender_id);
CREATE INDEX IF NOT EXISTS idx_story_interactions_author ON story_interactions(author_id);
CREATE INDEX IF NOT EXISTS idx_story_interactions_created_at ON story_interactions(created_at DESC);

CREATE OR REPLACE FUNCTION get_unified_inbox(p_user_id uuid)
RETURNS TABLE (
  feed_type text,
  item_id uuid,
  sender_id uuid,
  recipient_id text,
  body text,
  vehicle_id uuid,
  story_id text,
  story_video_url text,
  story_caption text,
  interaction_type text,
  read_at timestamptz,
  created_at timestamptz
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    'message'::text AS feed_type,
    m.id AS item_id,
    m.sender_id,
    m.recipient_id::text AS recipient_id,
    m.body,
    m.vehicle_id,
    NULL::text AS story_id,
    NULL::text AS story_video_url,
    NULL::text AS story_caption,
    NULL::text AS interaction_type,
    m.read_at,
    m.created_at
  FROM messages m
  WHERE m.sender_id = p_user_id OR m.recipient_id = p_user_id

  UNION ALL

  SELECT
    'story_interaction'::text AS feed_type,
    si.id AS item_id,
    si.sender_id,
    si.author_id AS recipient_id,
    si.body,
    NULL::uuid AS vehicle_id,
    si.story_id,
    si.story_video_url,
    si.story_caption,
    si.interaction_type,
    si.read_at,
    si.created_at
  FROM story_interactions si
  WHERE si.sender_id = p_user_id OR si.author_id = p_user_id::text

  ORDER BY created_at DESC;
$$;
