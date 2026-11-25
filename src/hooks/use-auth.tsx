import { useEffect, useState, useCallback } from "react";
import { ref, get, set, onValue, off } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";

const RESERVED_ADMIN_PHONES = ["0781606765", "781606765"];

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

export function useAuth() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      const sessionPhone = readSessionPhone();
      if (sessionPhone && realtimeDb) {
        try {
          const snap = await get(ref(realtimeDb, "users/" + sessionPhone));
          if (snap.exists()) {
            const data = snap.val() as UserProfile;
            if (!cancelled) {
              setUser({ id: sessionPhone, uid: sessionPhone, phone: sessionPhone });
              setProfile(data);
              setIsAdmin(data.role === "admin");
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

  const signIn = useCallback(async (phone: string, password: string) => {
    const normalizedPhone = normalizePhone(phone);

    // Regular user: look up in Realtime Database
    if (!realtimeDb) throw new Error("service-unavailable");
    const snap = await get(ref(realtimeDb, "users/" + normalizedPhone));
    if (!snap.exists()) {
      throw new Error("user-not-found");
    }
    const data = snap.val() as UserProfile & { password?: string };
    if (data.password !== password) {
      throw new Error("wrong-password");
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
    setIsAdmin(userProfile.role === "admin");
    saveSession(normalizedPhone);

    return { user: { uid: normalizedPhone }, isAdmin: userProfile.role === "admin" };
  }, []);

  const signUp = useCallback(async (
    phone: string,
    password: string,
    data: { first_name: string; last_name: string }
  ) => {
    const normalizedPhone = normalizePhone(phone);

    // Block admin phone numbers from regular signup
    if (RESERVED_ADMIN_PHONES.includes(normalizedPhone) || RESERVED_ADMIN_PHONES.includes(phone)) {
      throw new Error("email-already-in-use");
    }

    // Check if already registered
    if (!realtimeDb) throw new Error("service-unavailable");
    const existing = await get(ref(realtimeDb, "users/" + normalizedPhone));
    if (existing.exists()) {
      throw new Error("email-already-in-use");
    }

    const now = new Date().toISOString();

    const subscriptionStatus = "trial" as const;
    const subscriptionTier = null;
    const subscriptionUntil = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

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

    return { user: { uid: normalizedPhone } };
  }, []);

  const signOut = useCallback(async () => {
    clearSession();
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  }, []);

  const reloadProfile = useCallback(async () => {
    if (!user) return;
    if (isAdmin || !realtimeDb) return;
    try {
      const snap = await get(ref(realtimeDb, "users/" + user.phone));
      if (snap.exists()) {
        const data = snap.val() as UserProfile;
        setProfile(data);
        setIsAdmin(data.role === "admin");
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
