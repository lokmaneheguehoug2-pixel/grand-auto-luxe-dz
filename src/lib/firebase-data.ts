import { get, ref, set, update, push, remove } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

type QueryState = { table: string; filters: Record<string, unknown>; values: Record<string, unknown>; selected?: string[] };
type Result = { data: unknown; error: Error | null; count?: number };

function queryFor(table: string) {
  const state: QueryState = { table, filters: {}, values: {} };
  const execute = async (): Promise<Result> => {
    if (!realtimeDb) return { data: [], error: new Error("Firebase is not configured"), count: 0 };
    try {
      const snapshot = await get(ref(realtimeDb, table));
      const raw = snapshot.val();
      const rows = raw && typeof raw === "object" && !Array.isArray(raw)
        ? Object.entries(raw).map(([id, value]) => ({ id, ...(value && typeof value === "object" ? value as Record<string, unknown> : {}) }))
        : [];
      const filtered = rows.filter((row) => Object.entries(state.filters).every(([key, expected]) => Array.isArray(expected) ? expected.includes(row[key]) : row[key] === expected));
      const projected = state.selected?.length && !state.selected.includes("*")
        ? filtered.map((row) => Object.fromEntries(state.selected!.map((key) => [key, row[key]])))
        : filtered;
      return { data: projected, error: null, count: projected.length };
    } catch (error) { return { data: [], error: error instanceof Error ? error : new Error("Firebase query failed"), count: 0 }; }
  };
  const query = {
    select: (columns = "*", _options?: { count?: "exact" | "planned" | "estimated"; head?: boolean }) => { state.selected = columns.split(",").map((column) => column.trim()); return query; },
    eq: (key: string, value: unknown) => { state.filters[key] = value; return query; },
    in: (key: string, value: unknown[]) => { state.filters[key] = value; return query; },
    limit: (_value: number) => query,
    order: (_key: string, _options?: unknown) => query,
    maybeSingle: async () => { const result = await execute(); return { data: Array.isArray(result.data) ? result.data[0] ?? null : null, error: result.error }; },
    then: (resolve: (value: Result) => unknown) => execute().then(resolve),
    insert: async (values: Record<string, unknown> | Record<string, unknown>[]) => {
      if (!realtimeDb) return { data: null, error: new Error("Firebase is not configured") };
      try { await Promise.all((Array.isArray(values) ? values : [values]).map((value) => set(push(ref(realtimeDb, table)), value))); return { data: null, error: null }; }
      catch (error) { return { data: null, error: error instanceof Error ? error : new Error("Firebase insert failed") }; }
    },
    update: async (values: Record<string, unknown>) => ({ data: null, error: new Error("Use a Firebase record key for updates") }),
    upsert: async (values: Record<string, unknown>) => query.insert(values),
    delete: async () => {
      if (!realtimeDb) return { data: null, error: new Error("Firebase is not configured") };
      const result = await execute();
      if (result.error) return { data: null, error: result.error };
      try {
        const snapshot = await get(ref(realtimeDb, table));
        const raw = snapshot.val();
        if (raw && typeof raw === "object") await Promise.all(Object.entries(raw).filter(([, value]) => Object.entries(state.filters).every(([key, expected]) => Array.isArray(expected) ? expected.includes((value as Record<string, unknown>)?.[key]) : (value as Record<string, unknown>)?.[key] === expected)).map(([key]) => remove(ref(realtimeDb, `${table}/${key}`))));
        return { data: null, error: null };
      } catch (error) { return { data: null, error: error instanceof Error ? error : new Error("Firebase delete failed") }; }
    },
    throwOnError: () => query,
  };
  return query;
}

export function getFirebaseStore() { return { from: (table: string) => queryFor(table) }; }

export function normalizeVehicleImages(...values: unknown[]): string[] {
  const urls: string[] = [];
  const visit = (value: unknown) => {
    if (typeof value === "string") {
      const url = value.trim();
      if (/^(https?:|data:image\/)\S+$/i.test(url) && !urls.includes(url)) urls.push(url);
      return;
    }
    if (Array.isArray(value)) { value.forEach(visit); return; }
    if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      [record.url, record.downloadURL, record.src, record.image_url].forEach(visit);
      Object.entries(record).filter(([key]) => !["url", "downloadURL", "src", "image_url"].includes(key)).forEach(([, item]) => visit(item));
    }
  };
  values.forEach(visit);
  return urls;
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
