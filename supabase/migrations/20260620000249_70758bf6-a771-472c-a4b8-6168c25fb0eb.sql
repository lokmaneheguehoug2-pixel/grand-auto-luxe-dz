
-- Allow any active/trial subscribed user to post reels (rename stories table semantics)
ALTER TABLE public.stories DROP CONSTRAINT IF EXISTS stories_showroom_id_fkey;
ALTER TABLE public.stories RENAME COLUMN showroom_id TO author_id;
ALTER TABLE public.stories ADD CONSTRAINT stories_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.stories ALTER COLUMN expires_at SET DEFAULT now() + interval '30 days';
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS views_count integer NOT NULL DEFAULT 0;

DROP POLICY IF EXISTS "story insert showroom" ON public.stories;
DROP POLICY IF EXISTS "story delete own or admin" ON public.stories;
DROP POLICY IF EXISTS "story read all" ON public.stories;

CREATE POLICY "reel read authenticated" ON public.stories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "reel insert subscriber" ON public.stories
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.is_banned = false
        AND (
          p.subscription_status = 'active'
          OR (p.subscription_status = 'trial' AND p.trial_started_at > now() - interval '72 hours')
        )
    )
  );

CREATE POLICY "reel update own" ON public.stories
  FOR UPDATE TO authenticated USING (auth.uid() = author_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "reel delete own or admin" ON public.stories
  FOR DELETE TO authenticated USING (auth.uid() = author_id OR has_role(auth.uid(), 'admin'));

-- Storage policies for reels bucket
CREATE POLICY "reels read authenticated" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'reels');

CREATE POLICY "reels upload own folder" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'reels' AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "reels delete own" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'reels' AND (storage.foldername(name))[1] = auth.uid()::text
  );
