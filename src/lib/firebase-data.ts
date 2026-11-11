import { get, push, ref, remove, set } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

type Row = Record<string, unknown> & { id: string };
type Result<T = unknown> = { data: T; error: Error | null; count?: number };
type Operation = "select" | "delete";

function tableQuery(table: string) {
  const filters: Record<string, unknown> = {};
  let selected = "*";
  let operation: Operation = "select";

  const execute = async (): Promise<Result<Row[] | null>> => {
    if (!realtimeDb) return { data: null, error: new Error("Firebase Realtime Database is not configured") };
    try {
      const snapshot = await get(ref(realtimeDb, table));
      const raw = snapshot.val();
      const rows: Row[] = raw && typeof raw === "object" && !Array.isArray(raw)
        ? Object.entries(raw).map(([id, value]) => ({ id, ...(value && typeof value === "object" ? value as Record<string, unknown> : {}) }))
        : [];
      const matches = rows.filter((row) => Object.entries(filters).every(([key, expected]) => row[key] === expected));

      if (operation === "delete") {
        await Promise.all(matches.map((row) => remove(ref(realtimeDb, `${table}/${row.id}`))));
        return { data: null, error: null };
      }

      const data = selected === "*"
        ? matches
        : matches.map((row) => Object.fromEntries(selected.split(",").map((key) => [key.trim(), row[key.trim()]])) as Row);
      return { data, error: null, count: data.length };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error("Firebase operation failed") };
    }
  };

  const query = {
    select(columns = "*", _options?: { count?: "exact" | "planned" | "estimated"; head?: boolean }) {
      selected = columns;
      operation = "select";
      return query;
    },
    eq(key: string, value: unknown) {
      filters[key] = value;
      return query;
    },
    in(key: string, values: unknown[]) {
      filters[key] = values;
      return query;
    },
    order(_key: string, _options?: unknown) { return query; },
    limit(_value: number) { return query; },
    maybeSingle: async () => {
      const result = await execute();
      return { data: Array.isArray(result.data) ? result.data[0] ?? null : null, error: result.error };
    },
    then(resolve: (result: Result<Row[] | null>) => unknown, reject?: (error: unknown) => unknown) {
      return execute().then(resolve, reject);
    },
    insert: async (values: Record<string, unknown> | Record<string, unknown>[]) => {
      if (!realtimeDb) return { data: null, error: new Error("Firebase Realtime Database is not configured") };
      try {
        const list = Array.isArray(values) ? values : [values];
        await Promise.all(list.map((value) => set(push(ref(realtimeDb, table)), value)));
        return { data: null, error: null };
      } catch (error) {
        return { data: null, error: error instanceof Error ? error : new Error("Firebase insert failed") };
      }
    },
    delete() {
      operation = "delete";
      return query;
    },
    update(_values: Record<string, unknown>) { return query; },
    upsert(values: Record<string, unknown> | Record<string, unknown>[]) { return query.insert(values); },
    throwOnError() { return query; },
  };
  return query;
}

export function getFirebaseStore() {
  return realtimeDb ? { from: (table: string) => tableQuery(table) } : null;
}

export async function fetchPlatformSettings(): Promise<Record<string, unknown> | null> {
  if (!realtimeDb) return null;
  const snapshot = await get(ref(realtimeDb, "site_settings"));
  const value = snapshot.val();
  return value && typeof value === "object" ? value as Record<string, unknown> : null;
}

export function normalizeVehicleImages(...values: unknown[]): string[] {
  const urls: string[] = [];
  const visit = (value: unknown) => {
    if (typeof value === "string") {
      value.split(/[\n,|]+/).map((item) => item.trim()).filter(Boolean).forEach((url) => {
        if (/^(https?:|data:image\/|blob:)\S+$/i.test(url) && !urls.includes(url)) urls.push(url);
      });
      return;
    }
    if (Array.isArray(value)) { value.forEach(visit); return; }
    if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      [record.url, record.secure_url, record.downloadURL, record.src, record.image_url, record.imageUrl, record.photo_url, record.photoUrl, record.download_url, record.path].forEach(visit);
      Object.entries(record).forEach(([key, item]) => {
        if (!["url", "secure_url", "downloadURL", "src", "image_url"].includes(key)) visit(item);
      });
    }
  };
  values.forEach(visit);
  return urls;
}
