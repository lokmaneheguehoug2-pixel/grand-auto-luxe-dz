import { useEffect, useState } from "react";

const KEY = "gal:compare";
const MAX_COMPARE = 4;

let ids: string[] = [];
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  try {
    ids = JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    ids = [];
  }
}

function emit() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {}
  }
  listeners.forEach((fn) => fn());
}

export const compareStore = {
  get: () => ids,
  toggle: (id: string) => {
    if (ids.includes(id)) ids = ids.filter((x) => x !== id);
    else if (ids.length < MAX_COMPARE) ids = [...ids, id];
    else ids = [...ids.slice(1), id];
    emit();
  },
  clear: () => {
    ids = [];
    emit();
  },
  remove: (id: string) => {
    ids = ids.filter((x) => x !== id);
    emit();
  },
};

export function useCompare() {
  const [snap, setSnap] = useState<string[]>([]);
  useEffect(() => {
    const fn = () => setSnap([...ids]);
    listeners.add(fn);
    fn();
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return snap;
}
