
-- Lock down SECURITY DEFINER funcs
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_and_apply_bid() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Storage policies for vehicle-media (public read, owner write)
CREATE POLICY "vehicle media public read" ON storage.objects FOR SELECT USING (bucket_id = 'vehicle-media');
CREATE POLICY "vehicle media auth insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vehicle-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "vehicle media owner delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'vehicle-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for payment-receipts (owner + admin)
CREATE POLICY "receipts owner insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'payment-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "receipts owner select" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'payment-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "receipts admin select" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'payment-receipts' AND public.has_role(auth.uid(),'admin'));
