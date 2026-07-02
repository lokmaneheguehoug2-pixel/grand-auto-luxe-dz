// Emergency admin bypass — allows the site owner to unlock the admin panel
// even when Supabase auth / roles are unreachable. Client-side only convenience.

const KEY = "gal:admin:bypass";

// Accepted phone variants for the primary owner.
const ADMIN_PHONES = new Set([
  "0781606765",
  "781606765",
  "+213781606765",
  "213781606765",
  "0782606765",
  "+213782606765",
]);

// Master bypass password — change here to rotate.
export const ADMIN_BYPASS_PASSWORD = "GrandAdmin2026!";

export function normalizeAdminPhone(raw: string): string {
  return raw.replace(/[\s\-()]/g, "");
}

export function isAdminPhone(raw: string): boolean {
  return ADMIN_PHONES.has(normalizeAdminPhone(raw));
}

export function tryAdminBypass(phone: string, password: string): boolean {
  if (!isAdminPhone(phone) || password !== ADMIN_BYPASS_PASSWORD) return false;
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(KEY, "1"); } catch { /* ignore */ }
  }
  return true;
}

export function hasAdminBypass(): boolean {
  if (typeof window === "undefined") return false;
  try { return window.localStorage.getItem(KEY) === "1"; } catch { return false; }
}

export function clearAdminBypass(): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(KEY); } catch { /* ignore */ }
}
