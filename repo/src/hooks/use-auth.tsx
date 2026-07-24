import { useEffect, useState, useCallback } from "react";
import { ref, get, set, onValue, off } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";

// Admin credentials - ONLY these work for admin access
const ADMIN_PHONES = ["0781606765", "781606765"];
const ADMIN_PASSWORD = "LOK12MANE";

export function isAdminPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return ADMIN_PHONES.includes(normalized) || ADMIN_PHONES.includes(phone);
}

export type UserProfile = {
  id: string;
  phone: string;
  first_name: string;
  last_name: string;
  subscription_status: "trial" | "active" | "pending" | "locked";
  subscription_tier: "basic" | "pro" | "dealer" | null;
  subscription_until: string | null;
  trial_started_at: string;
  is_banned: boolean;
  role: "admin" | "user";
  created_at: string;
};

export type SessionUser = {
  id: string;
  uid: string;
  phone: string;
};

const SESSION_KEY = "gal:session";
const ADMIN_BYPASS_KEY = "gal:admin:bypass";

export function normalizePhone(raw: unknown): string {
  let digits = String(raw ?? "").replace(/\s|-/g, "");
  if (digits.startsWith("+213")) digits = "0" + digits.slice(4);
  else if (digits.startsWith("213")) digits = "0" + digits.slice(3);
  else if (!digits.startsWith("0")) digits = "0" + digits;
  return digits;
}

export function phoneToEmail(phone: unknown): string {
  return `${normalizePhone(phone).replace(/[^0-9]/g, "")}@grandauto.dz`;
}

function buildAdminProfile(phone: string): UserProfile {
  return {
    id: "admin-" + phone,
    phone,
    first_name: "Admin",
    last_name: "User",
    subscription_status: "active",
    subscription_tier: "dealer",
    subscription_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    trial_started_at: new Date().toISOString(),
    is_banned: false,
    role: "admin",
    created_at: new Date().toISOString(),
  };
}

function saveSession(phone: string) {
  if (!isBrowser) return;
  localStorage.setItem(SESSION_KEY, JSON.stringify({ phone, ts: Date.now() }));
}

function readSessionPhone(): string | null {
  if (!isBrowser) return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.phone) return parsed.phone as string;
  } catch {
    /* ignore */
  }
  return null;
}

function clearSession() {
  if (!isBrowser) return;
  localStorage.removeItem(SESSION_KEY);
}

// Synchronously check admin bypass from localStorage (prevents flash)
function checkAdminBypassSync(): { isAdmin: boolean; phone: string } | null {
  if (!isBrowser) return null;
  try {
    const stored = localStorage.getItem(ADMIN_BYPASS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.isAdmin && parsed.phone) {
        return { isAdmin: true, phone: normalizePhone(parsed.phone) };
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function useAuth() {
  // Initialize state synchronously from localStorage to prevent flash
  const adminBypass = checkAdminBypassSync();
  const [user, setUser] = useState<SessionUser | null>(
    adminBypass ? { id: "admin-" + adminBypass.phone, uid: "admin-" + adminBypass.phone, phone: adminBypass.phone } : null
  );
  const [profile, setProfile] = useState<UserProfile | null>(
    adminBypass ? buildAdminProfile(adminBypass.phone) : null
  );
  const [isAdmin, setIsAdmin] = useState(adminBypass?.isAdmin ?? false);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      // 1) Admin bypass via localStorage (already set in initial state, but verify)
      const storedBypass = checkAdminBypassSync();
      if (storedBypass) {
        if (!cancelled) {
          setUser({ id: "admin-" + storedBypass.phone, uid: "admin-" + storedBypass.phone, phone: storedBypass.phone });
          setProfile(buildAdminProfile(storedBypass.phone));
          setIsAdmin(true);
          setLoading(false);
        }
        return;
      }

      // 2) Regular user session via Realtime Database
      const sessionPhone = readSessionPhone();
      if (sessionPhone && realtimeDb) {
        try {
          const snap = await get(ref(realtimeDb, "users/" + sessionPhone));
          if (snap.exists()) {
            const data = snap.val() as UserProfile;
            if (!cancelled) {
              setUser({ id: sessionPhone, uid: sessionPhone, phone: sessionPhone });
              setProfile(data);
              setIsAdmin(data.role === "admin" || isAdminPhone(sessionPhone));
            }
          }
        } catch (err) {
          console.error("Error restoring session:", err);
        }
      }

      if (!cancelled) setLoading(false);
    }

    restore();
    return () => { cancelled = true; };
  }, []);

  const signIn = useCallback(async (phone: string, password: string, promoCode?: string) => {
    const normalizedPhone = normalizePhone(phone);

    // Admin login: MUST match both phone AND password
    const isAdminLogin = ADMIN_PHONES.includes(normalizedPhone) || ADMIN_PHONES.includes(phone);
    if (isAdminLogin) {
      if (password !== ADMIN_PASSWORD) {
        throw new Error("wrong-password");
      }
      const adminProfile = buildAdminProfile(normalizedPhone);
      setUser({ id: "admin-" + normalizedPhone, uid: "admin-" + normalizedPhone, phone: normalizedPhone });
      setProfile(adminProfile);
      setIsAdmin(true);
      localStorage.setItem(ADMIN_BYPASS_KEY, JSON.stringify({
        phone: normalizedPhone,
        isAdmin: true,
        timestamp: Date.now(),
      }));
      return { user: { uid: "admin-" + normalizedPhone }, bypass: true };
    }

    // Regular user: look up in Realtime Database
    const snap = await get(ref(realtimeDb, "users/" + normalizedPhone));
    if (!snap.exists()) {
      throw new Error("user-not-found");
    }
    const data = snap.val() as UserProfile & { password?: string };
    if (data.password !== password) {
      throw new Error("wrong-password");
    }

    // Apply promo code if provided
    let promoApplied = false;
    if (promoCode && promoCode.trim()) {
      const codeKey = promoCode.trim().toUpperCase();
      const promoSnap = await get(ref(realtimeDb, "promo_codes"));
      if (promoSnap.exists()) {
        const allPromos = promoSnap.val() as Record<string, any>;
        const promoEntry = Object.entries(allPromos).find(([_, v]) => v.code === codeKey);
        if (promoEntry) {
          const [promoId, promo] = promoEntry;
          if (promo.is_active && (promo.uses_count || 0) < (promo.max_uses || 999)) {
            const days = promo.days_granted || 7;
            const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
            const tier = promo.tier === "showroom" ? "dealer" : "basic";
            await set(ref(realtimeDb, `users/${normalizedPhone}/subscription_status`), "active");
            await set(ref(realtimeDb, `users/${normalizedPhone}/subscription_tier`), tier);
            await set(ref(realtimeDb, `users/${normalizedPhone}/subscription_until`), until);
            await set(ref(realtimeDb, `promo_codes/${promoId}/uses_count`), (promo.uses_count || 0) + 1);
            data.subscription_status = "active";
            data.subscription_tier = tier;
            data.subscription_until = until;
            promoApplied = true;
          }
        }
      }
    }

    const userProfile: UserProfile = {
      id: normalizedPhone,
      phone: normalizedPhone,
      first_name: data.first_name,
      last_name: data.last_name,
      subscription_status: data.subscription_status,
      subscription_tier: data.subscription_tier,
      subscription_until: data.subscription_until,
      trial_started_at: data.trial_started_at,
      is_banned: data.is_banned,
      role: data.role ?? "user",
      created_at: data.created_at,
    };

    setUser({ id: normalizedPhone, uid: normalizedPhone, phone: normalizedPhone });
    setProfile(userProfile);
    setIsAdmin(userProfile.role === "admin" || isAdminPhone(normalizedPhone));
    saveSession(normalizedPhone);

    return { user: { uid: normalizedPhone }, bypass: false, promoApplied };
  }, []);

  const signUp = useCallback(async (
    phone: string,
    password: string,
    data: { first_name: string; last_name: string },
    promoCode?: string
  ) => {
    const normalizedPhone = normalizePhone(phone);

    // Block admin phone numbers from regular signup
    if (ADMIN_PHONES.includes(normalizedPhone) || ADMIN_PHONES.includes(phone)) {
      throw new Error("email-already-in-use");
    }

    // Check if already registered
    const existing = await get(ref(realtimeDb, "users/" + normalizedPhone));
    if (existing.exists()) {
      throw new Error("email-already-in-use");
    }

    const now = new Date().toISOString();

    // Check promo code if provided
    let subscriptionStatus: "trial" | "active" = "trial";
    let subscriptionTier: "basic" | "pro" | "dealer" | null = null;
    let subscriptionUntil: string = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
    let promoApplied = false;

    if (promoCode && promoCode.trim()) {
      const codeKey = promoCode.trim().toUpperCase();
      const promoSnap = await get(ref(realtimeDb, "promo_codes"));
      if (promoSnap.exists()) {
        const allPromos = promoSnap.val() as Record<string, any>;
        const promoEntry = Object.entries(allPromos).find(([_, v]) => v.code === codeKey);
        if (promoEntry) {
          const [promoId, promo] = promoEntry;
          if (promo.is_active && (promo.uses_count || 0) < (promo.max_uses || 999)) {
            subscriptionStatus = "active";
            const days = promo.days_granted || 7;
            subscriptionUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
            subscriptionTier = promo.tier === "showroom" ? "dealer" : "basic";
            promoApplied = true;

            await set(ref(realtimeDb, `promo_codes/${promoId}/uses_count`), (promo.uses_count || 0) + 1);
          }
        }
      }
    }

    const userProfile: UserProfile & { password: string } = {
      id: normalizedPhone,
      phone: normalizedPhone,
      first_name: data.first_name,
      last_name: data.last_name,
      subscription_status: subscriptionStatus,
      subscription_tier: subscriptionTier,
      subscription_until: subscriptionUntil,
      trial_started_at: now,
      is_banned: false,
      role: "user",
      created_at: now,
      password,
    };

    await set(ref(realtimeDb, "users/" + normalizedPhone), userProfile);

    const { password: _pw, ...publicProfile } = userProfile;

    setUser({ id: normalizedPhone, uid: normalizedPhone, phone: normalizedPhone });
    setProfile(publicProfile);
    setIsAdmin(false);
    saveSession(normalizedPhone);

    return { user: { uid: normalizedPhone }, promoApplied };
  }, []);

  const signOut = useCallback(async () => {
    if (isBrowser) localStorage.removeItem(ADMIN_BYPASS_KEY);
    clearSession();
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  }, []);

  const reloadProfile = useCallback(async () => {
    if (!user) return;
    if (isAdmin) return;
    try {
      const snap = await get(ref(realtimeDb, "users/" + user.phone));
      if (snap.exists()) {
        const data = snap.val() as UserProfile;
        setProfile(data);
        setIsAdmin(data.role === "admin" || isAdminPhone(user.phone));
      }
    } catch (err) {
      console.error("Error reloading profile:", err);
    }
  }, [user, isAdmin]);

  // Compute access level
  let access: "trial" | "active" | "pending" | "locked" = "locked";
  let hoursLeft = 0;

  if (profile) {
    if (profile.is_banned) {
      access = "locked";
    } else if (profile.role === "admin") {
      access = "active";
      hoursLeft = 8760;
    } else if (profile.subscription_status === "active" && profile.subscription_until) {
      const end = new Date(profile.subscription_until);
      if (end > new Date()) {
        access = "active";
        hoursLeft = Math.ceil((end.getTime() - Date.now()) / (60 * 60 * 1000));
      } else {
        access = "locked";
      }
    } else if (profile.subscription_status === "pending") {
      access = "pending";
    } else if (profile.subscription_status === "trial") {
      const trialEnd = new Date(profile.trial_started_at);
      trialEnd.setDate(trialEnd.getDate() + 3);
      if (trialEnd > new Date()) {
        access = "trial";
        hoursLeft = Math.ceil((trialEnd.getTime() - Date.now()) / (60 * 60 * 1000));
      } else {
        access = "locked";
      }
    }
  }

  return {
    user,
    profile,
    isAdmin,
    loading,
    signIn,
    signUp,
    signOut,
    access,
    hoursLeft,
    reloadProfile,
  };
}
