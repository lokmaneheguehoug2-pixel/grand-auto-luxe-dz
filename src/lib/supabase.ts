import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const isBrowser =
  typeof window !== "undefined" && typeof window.document !== "undefined";

function createSafeClient(): SupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    if (isBrowser) {
      console.warn("[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
    }
    return null;
  }
  try {
    return createClient(url, key);
  } catch (e) {
    console.warn("[supabase] Failed to create client:", e);
    return null;
  }
}

let _client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (_client === undefined) {
    _client = createSafeClient();
  }
  return _client;
}

export type PlatformSettings = {
  id?: string;
  whatsapp_number: string;
  support_phone: string;
  facebook_url: string;
  instagram_url: string;
  tiktok_url: string;
  baridi_mob_number: string;
  appointment_email: string;
  gmail_address: string;
  updated_at?: string;
};

export async function fetchPlatformSettings(): Promise<PlatformSettings | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data, error } = await client
    .from("platform_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch platform settings from Supabase:", error);
    return null;
  }

  return data as PlatformSettings | null;
}

export async function savePlatformSettings(
  settings: Omit<PlatformSettings, "id" | "updated_at">
): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  const { error } = await client
    .from("platform_settings")
    .update({
      whatsapp_number: settings.whatsapp_number || null,
      support_phone: settings.support_phone || null,
      facebook_url: settings.facebook_url || null,
      instagram_url: settings.instagram_url || null,
      tiktok_url: settings.tiktok_url || null,
      baridi_mob_number: settings.baridi_mob_number || null,
      appointment_email: settings.appointment_email || null,
      gmail_address: settings.gmail_address || null,
    })
    .eq("id", "00000000-0000-0000-0000-000000000001");

  if (error) {
    console.error("Failed to save platform settings to Supabase:", error);
    return false;
  }

  return true;
}
