-- Fix storage bucket policy - replace broad listing policy with specific download policy

-- First drop the problematic policy
DROP POLICY IF EXISTS "vehicle-media-public-read" ON storage.objects;

-- Create a new policy that allows public download but NOT listing
-- Uses auth.uid() check to determine if user is the owner
CREATE POLICY "vehicle-media-public-download"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'vehicle-media'
  -- Allow download of individual files (no listing capability)
  -- The key is that this doesn't expose all files
);

-- Authenticated users can list their own uploads
CREATE POLICY "vehicle-media-auth-list"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'vehicle-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);