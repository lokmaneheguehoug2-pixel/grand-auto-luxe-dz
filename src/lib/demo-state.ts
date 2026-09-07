import { useCallback, useSyncExternalStore } from "react";

const PREFIX = "gal:demo:";
const listeners = new Set<() => void>();

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(`${PREFIX}${key}`);
    return value == null ? fallback : (JSON.parse(value) as T);
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value)); } catch {}
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
  const [values, setValues] = useDemoRecord<string[]>(key, []);
  const toggle = useCallback((id: string) => {
    setValues((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }, [setValues]);
  return [new Set(values), toggle, setValues] as const;
}

export function useDemoCounterMap(key: string) {
  const [counts, setCounts] = useDemoRecord<Record<string, number>>(key, {});
  const increment = useCallback((id: string, amount = 1) => {
    setCounts((current) => ({ ...current, [id]: Math.max(0, (current[id] ?? 0) + amount) }));
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
