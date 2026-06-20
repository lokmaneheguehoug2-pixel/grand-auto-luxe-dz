
-- New listings require admin approval before going live
ALTER TABLE public.vehicles ALTER COLUMN status SET DEFAULT 'pending';

-- Enable realtime for live updates across the app
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcast_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;

-- Make sure replica identity is full so realtime payloads contain prior values for updates
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.vehicles REPLICA IDENTITY FULL;
