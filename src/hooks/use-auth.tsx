import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { getLocalUserSession, clearLocalUserSession, type LocalUserSession } from "@/lib/local-session";
import { hasAdminBypass, clearAdminBypass } from "@/lib/admin-bypass";

export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  trial_started_at: string;
  subscription_status: "trial" | "active" | "locked";
  subscription_until: string | null;
};

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [localSession, setLocalSession] = useState<LocalUserSession | null>(null);
  const [, setTick] = useState(0);

  const loadProfile = useCallback(async (uid: string) => {
    const [{ data: p }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setProfile(p as Profile | null);
    setIsAdmin(!!roles?.some((r) => r.role === "admin") || hasAdminBypass());
  }, []);

  useEffect(() => {
    // Graceful fallback: user was created locally when Supabase was unreachable during signup
    const local = getLocalUserSession();
    if (local) {
      setLocalSession(local);
      setProfile(local.profile as unknown as Profile);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => loadProfile(s.user.id), 0);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadProfile(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  // Realtime profile subscription — skipped for local-session users (no real DB row)
  useEffect(() => {
    if (!user || localSession) return;
    const channel = supabase.channel(`profile:${user.id}`);
    try {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        () => loadProfile(user.id),
      );
      channel.subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          // Non-fatal — realtime not available
        }
      });
    } catch {
      // Realtime not available — skip silently
    }
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => {
      try { supabase.removeChannel(channel); } catch {}
      clearInterval(interval);
    };
  }, [user, loadProfile, localSession]);

  const signOut = useCallback(async () => {
    if (localSession) {
      clearLocalUserSession();
      setLocalSession(null);
      setProfile(null);
      setIsAdmin(false);
      return;
    }
    await supabase.auth.signOut();
  }, [localSession]);

  let access: "trial" | "active" | "locked" = "locked";
  let hoursLeft = 0;

  if (localSession) {
    access = "trial";
    hoursLeft = localSession.hoursLeft;
  } else if (profile) {
    if (
      profile.subscription_status === "active" &&
      profile.subscription_until &&
      new Date(profile.subscription_until) > new Date()
    ) {
      access = "active";
      hoursLeft = Math.ceil(
        (new Date(profile.subscription_until).getTime() - Date.now()) / (60 * 60 * 1000),
      );
    } else {
      const trialEnds = new Date(
        new Date(profile.trial_started_at).getTime() + 72 * 60 * 60 * 1000,
      );
      if (trialEnds > new Date()) {
        access = "trial";
        hoursLeft = Math.ceil((trialEnds.getTime() - Date.now()) / (60 * 60 * 1000));
      } else {
        access = "locked";
      }
    }
  }

  const effectiveUser = localSession
    ? ({
        id: localSession.user.id,
        email: localSession.user.email,
        user_metadata: {
          phone: localSession.user.phone,
          first_name: localSession.user.first_name,
          last_name: localSession.user.last_name,
        },
      } as unknown as User)
    : user;

  return {
    session: localSession ? null : session,
    user: effectiveUser,
    profile,
    isAdmin,
    loading,
    signOut,
    access,
    hoursLeft,
    reloadProfile: () => user && !localSession && loadProfile(user.id),
  };
}
