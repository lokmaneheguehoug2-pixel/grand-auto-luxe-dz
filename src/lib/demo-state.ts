import { useCallback, useSyncExternalStore } from "react";

const PREFIX = "gal:demo:";
const listeners = new Set<() => void>();
const snapshotCache = new Map<string, { raw: string | null; value: unknown }>();
const EMPTY_VALUES: string[] = [];
const EMPTY_COUNTS: Record<string, number> = {};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(`${PREFIX}${key}`);
    const cached = snapshotCache.get(key);
    if (cached?.raw === raw) return cached.value as T;
    const value = raw == null ? fallback : (JSON.parse(raw) as T);
    snapshotCache.set(key, { raw, value });
    return value;
  } catch {
    snapshotCache.set(key, { raw: null, value: fallback });
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window !== "undefined") {
    try {
      const raw = JSON.stringify(value);
      window.localStorage.setItem(`${PREFIX}${key}`, raw);
      snapshotCache.set(key, { raw, value });
    } catch {}
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (typeof window !== "undefined") window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", listener);
  };
}

export function useDemoRecord<T>(key: string, fallback: T) {
  const value = useSyncExternalStore(subscribe, () => read(key, fallback), () => fallback);
  const setValue = useCallback((next: T | ((current: T) => T)) => {
    const current = read(key, fallback);
    write(key, typeof next === "function" ? (next as (current: T) => T)(current) : next);
  }, [key, fallback]);
  return [value, setValue] as const;
}

export function useDemoSet(key: string) {
  const [storedValues, setValues] = useDemoRecord<unknown>(key, EMPTY_VALUES);
  const values = Array.isArray(storedValues)
    ? storedValues.filter((value): value is string => typeof value === "string")
    : EMPTY_VALUES;
  const toggle = useCallback((id: string) => {
    setValues((current) => {
      const safeCurrent = Array.isArray(current)
        ? current.filter((value): value is string => typeof value === "string")
        : [];
      return safeCurrent.includes(id)
        ? safeCurrent.filter((item) => item !== id)
        : [...safeCurrent, id];
    });
  }, [setValues]);
  return [new Set(values), toggle, setValues] as const;
}

export function useDemoCounterMap(key: string) {
  const [storedCounts, setCounts] = useDemoRecord<unknown>(key, EMPTY_COUNTS);
  const counts = storedCounts && typeof storedCounts === "object" && !Array.isArray(storedCounts)
    ? Object.fromEntries(Object.entries(storedCounts).filter(([, value]) => typeof value === "number" && Number.isFinite(value)))
    : EMPTY_COUNTS;
  const increment = useCallback((id: string, amount = 1) => {
    setCounts((current) => {
      const safeCurrent = current && typeof current === "object" && !Array.isArray(current)
        ? current as Record<string, number>
        : {};
      return { ...safeCurrent, [id]: Math.max(0, (safeCurrent[id] ?? 0) + amount) };
    });
  }, [setCounts]);
  return [counts, increment, setCounts] as const;
}

export function getDemoValue<T>(key: string, fallback: T) {
  return read(key, fallback);
}

export function setDemoValue<T>(key: string, value: T) {
  write(key, value);
}

export function toggleDemoSet(key: string, id: string) {
  const values = read<string[]>(key, []);
  write(key, values.includes(id) ? values.filter((item) => item !== id) : [...values, id]);
}

export function incrementDemoCounter(key: string, id: string, amount = 1) {
  const counts = read<Record<string, number>>(key, {});
  write(key, { ...counts, [id]: Math.max(0, (counts[id] ?? 0) + amount) });
}

export function getDemoGuestId() {
  const existing = read<string | null>("guest-id", null);
  if (existing) return existing;
  const id = `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  write("guest-id", id);
  return id;
}

export const demoKeys = {
  likes: "likes",
  saved: "saved",
  views: "views",
  pinned: "pinned",
  alerts: "alerts",
  activity: "activity",
  subscription: "subscription",
};

export function formatActivityLabel(action: string) {
  return action.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
