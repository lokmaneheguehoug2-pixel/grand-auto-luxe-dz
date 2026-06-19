// Simple subscribable compare store with localStorage persistence.
// Max 2 vehicles. Used by VehicleCard + CompareTray + CompareDialog.

import { useEffect, useState } from "react";

const KEY = "gal:compare";
let ids: string[] = (() => {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
})();
const listeners = new Set<() => void>();

function emit() {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(ids));
  listeners.forEach((fn) => fn());
}

export const compareStore = {
  get: () => ids,
  toggle: (id: string) => {
    if (ids.includes(id)) ids = ids.filter((x) => x !== id);
    else if (ids.length < 2) ids = [...ids, id];
    else ids = [ids[1], id];
    emit();
  },
  clear: () => { ids = []; emit(); },
  remove: (id: string) => { ids = ids.filter((x) => x !== id); emit(); },
};

export function useCompare() {
  const [snap, setSnap] = useState(ids);
  useEffect(() => {
    const fn = () => setSnap([...ids]);
    listeners.add(fn);
    fn();
    return () => { listeners.delete(fn); };
  }, []);
  return snap;
}
