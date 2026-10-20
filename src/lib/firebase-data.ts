import { get, ref, set, update, push, remove } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

type QueryState = { table: string; filters: Record<string, unknown>; values: Record<string, unknown> };

function emptyQuery(table: string) {
  const state: QueryState = { table, filters: {}, values: {} };
  const query = {
    select: (..._args: unknown[]) => query,
    eq: (key: string, value: unknown) => { state.filters[key] = value; return query; },
    in: (key: string, value: unknown[]) => { state.filters[key] = value; return query; },
    limit: (_value: number) => query,
    order: (_key: string, _options?: unknown) => query,
    maybeSingle: async () => ({ data: null, error: null }),
    then: (resolve: (value: { data: unknown[]; error: null; count: number }) => unknown) => Promise.resolve({ data: [], error: null, count: 0 }).then(resolve),
    insert: async (values: Record<string, unknown> | Record<string, unknown>[]) => {
      if (!realtimeDb) return { data: null, error: null };
      const list = Array.isArray(values) ? values : [values];
      await Promise.all(list.map((value) => set(push(ref(realtimeDb, `${table}/${String(value.id ?? crypto.randomUUID())}`)), value)));
      return { data: null, error: null };
    },
    update: async (values: Record<string, unknown>) => { state.values = values; return { data: null, error: null }; },
    upsert: async (values: Record<string, unknown>) => query.insert(values),
    delete: async () => ({ data: null, error: null }),
    throwOnError: () => query,
  };
  return query;
}

export function getFirebaseStore() {
  return { from: (table: string) => emptyQuery(table) };
}

export type PlatformSettings = { whatsapp_number: string; support_phone: string; facebook_url: string; instagram_url: string; tiktok_url: string; baridi_mob_number: string; appointment_email: string; gmail_address: string };
export async function fetchPlatformSettings(): Promise<PlatformSettings | null> {
  if (!realtimeDb) return null;
  const snapshot = await get(ref(realtimeDb, "platform_settings"));
  return snapshot.exists() ? snapshot.val() as PlatformSettings : null;
}
export async function savePlatformSettings(settings: PlatformSettings): Promise<boolean> {
  if (!realtimeDb) return false;
  await update(ref(realtimeDb, "platform_settings"), settings);
  return true;
}
