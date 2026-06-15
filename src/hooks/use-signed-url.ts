import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const cache = new Map<string, { url: string; exp: number }>();

export function useSignedUrl(bucket: string, path?: string | null, expiresIn = 3600) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!path) { setUrl(null); return; }
    const key = `${bucket}/${path}`;
    const c = cache.get(key);
    if (c && c.exp > Date.now()) { setUrl(c.url); return; }
    supabase.storage.from(bucket).createSignedUrl(path, expiresIn).then(({ data }) => {
      if (data?.signedUrl) {
        cache.set(key, { url: data.signedUrl, exp: Date.now() + (expiresIn - 60) * 1000 });
        setUrl(data.signedUrl);
      }
    });
  }, [bucket, path, expiresIn]);
  return url;
}

export async function signUrl(bucket: string, path: string, expiresIn = 3600) {
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  return data?.signedUrl ?? null;
}
