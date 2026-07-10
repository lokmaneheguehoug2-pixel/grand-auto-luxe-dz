import { useEffect, useState } from "react";
import { storage } from "@/lib/firebase";
import { ref, getDownloadURL } from "firebase/storage";

const cache = new Map<string, { url: string; exp: number }>();

export function useSignedUrl(bucket: string, path?: string | null, expiresIn = 3600) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!path || !storage) { setUrl(null); return; }
    const key = `${bucket}/${path}`;
    const c = cache.get(key);
    if (c && c.exp > Date.now()) { setUrl(c.url); return; }
    (async () => {
      try {
        const storageRef = ref(storage, path);
        const downloadUrl = await getDownloadURL(storageRef);
        cache.set(key, { url: downloadUrl, exp: Date.now() + (expiresIn - 60) * 1000 });
        setUrl(downloadUrl);
      } catch (e) {
        console.error("Failed to get download URL", e);
      }
    })();
  }, [bucket, path, expiresIn]);
  return url;
}

export async function signUrl(bucket: string, path: string, expiresIn = 3600) {
  if (!storage) return null;
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch {
    return null;
  }
}
