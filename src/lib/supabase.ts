import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  const { data, error } = await supabase
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

export async function savePlatformSettings(settings: Omit<PlatformSettings, "id" | "updated_at">): Promise<boolean> {
  const { error } = await supabase
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
