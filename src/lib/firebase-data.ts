import { get, push, ref, remove, set, update as updateRecord } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

type Row = Record<string, unknown> & { id: string };
type Result<T = unknown> = { data: T; error: Error | null; count?: number };
type Operation = "select" | "delete" | "update";
type Filter = { operator: "eq" | "in"; value: unknown };

const TABLE_PATHS: Record<string, string> = {
  vehicle_likes: "vehicleLikes",
  vehicle_favorites: "vehicleFavorites",
};

function tableQuery(table: string) {
  const tablePath = TABLE_PATHS[table] ?? table;
  const filters: Record<string, Filter> = {};
  let selected = "*";
  let operation: Operation = "select";
  let orderBy: { key: string; ascending: boolean } | null = null;
  let rowLimit: number | null = null;
  let updateValues: Record<string, unknown> | null = null;

  const execute = async (): Promise<Result<Row[] | null>> => {
    const database = realtimeDb;
    if (!database) return { data: null, error: new Error("Firebase Realtime Database is not configured") };
    try {
      const snapshot = await get(ref(database, tablePath));
      const raw = snapshot.val();
      const rows: Row[] = raw && typeof raw === "object" && !Array.isArray(raw)
        ? Object.entries(raw).flatMap(([id, value]) => {
            if ((table === "vehicle_likes" || table === "vehicle_favorites") && value && typeof value === "object") {
              return Object.entries(value as Record<string, unknown>).map(([userId, record]) => ({
                id: `${id}/${userId}`,
                vehicle_id: id,
                user_id: userId,
                ...(record && typeof record === "object" ? record as Record<string, unknown> : {}),
              }));
            }
            return [{ id, ...(value && typeof value === "object" ? value as Record<string, unknown> : {}) }];
          })
        : [];
      let matches = rows.filter((row) => Object.entries(filters).every(([key, filter]) => {
        const actual = row[key];
        return filter.operator === "in"
          ? Array.isArray(filter.value) && filter.value.includes(actual)
          : actual === filter.value;
      }));

      if (orderBy) {
        const { key, ascending } = orderBy;
        matches = [...matches].sort((left, right) => {
          const a = left[key];
          const b = right[key];
          const comparison = typeof a === "number" && typeof b === "number"
            ? a - b
            : String(a ?? "").localeCompare(String(b ?? ""), undefined, { numeric: true });
          return ascending ? comparison : -comparison;
        });
      }
      if (rowLimit !== null) matches = matches.slice(0, rowLimit);

      if (operation !== "select" && Object.keys(filters).length === 0) {
        return { data: null, error: new Error("A filter is required for database updates and deletes") };
      }
      if (operation === "delete") {
        await Promise.all(matches.map((row) => remove(ref(database, `${tablePath}/${row.id}`))));
        return { data: null, error: null, count: matches.length };
      }
      if (operation === "update") {
        const patch = updateValues;
        if (!patch || Object.keys(patch).length === 0) {
          return { data: null, error: new Error("Update values are required") };
        }
        await Promise.all(matches.map((row) => updateRecord(ref(database, `${tablePath}/${row.id}`), patch)));
        return { data: null, error: null, count: matches.length };
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
      filters[key] = { operator: "eq", value };
      return query;
    },
    in(key: string, values: unknown[]) {
      filters[key] = { operator: "in", value: values };
      return query;
    },
    order(key: string, options?: { ascending?: boolean }) {
      orderBy = { key, ascending: options?.ascending ?? true };
      return query;
    },
    limit(value: number) {
      rowLimit = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : null;
      return query;
    },
    maybeSingle: async () => {
      const result = await execute();
      return { data: Array.isArray(result.data) ? result.data[0] ?? null : null, error: result.error };
    },
    then(resolve: (result: Result<Row[] | null>) => unknown, reject?: (error: unknown) => unknown) {
      return execute().then(resolve, reject);
    },
    insert: async (values: Record<string, unknown> | Record<string, unknown>[]) => {
      const database = realtimeDb;
      if (!database) return { data: null, error: new Error("Firebase Realtime Database is not configured") };
      try {
        const list = Array.isArray(values) ? values : [values];
        await Promise.all(list.map((value) => {
          if ((table === "vehicle_likes" || table === "vehicle_favorites") && typeof value.vehicle_id === "string" && typeof value.user_id === "string") {
            return set(ref(database, `${tablePath}/${value.vehicle_id}/${value.user_id}`), value);
          }
          return set(push(ref(database, tablePath)), value);
        }));
        return { data: null, error: null };
      } catch (error) {
        return { data: null, error: error instanceof Error ? error : new Error("Firebase insert failed") };
      }
    },
    delete() {
      operation = "delete";
      return query;
    },
    update(values: Record<string, unknown>) {
      operation = "update";
      updateValues = values;
      return query;
    },
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
  const urls = new Set<string>();
  const visited = new WeakSet<object>();
  const visit = (value: unknown) => {
    if (typeof value === "string") {
      value.split(/[\n,|]+/).forEach((item) => {
        const url = item.trim();
        if (/^(https?:|data:image\/|blob:)\S+$/i.test(url)) urls.add(url);
      });
      return;
    }
    if (!value || typeof value !== "object" || visited.has(value)) return;
    visited.add(value);
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    const record = value as Record<string, unknown>;
    ["images", "photos", "image_urls", "image", "url", "secure_url", "downloadURL", "src", "image_url", "imageUrl", "photo_url", "photoUrl", "download_url", "path"].forEach((key) => {
      try {
        visit(record[key]);
      } catch {
        return;
      }
    });
  };
  try {
    values.forEach(visit);
  } catch {
    return [];
  }
  return [...urls];
}
