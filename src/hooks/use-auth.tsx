import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

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
  // tick re-evaluates derived access state every 60s so expiry flips live without a page refresh
  const [, setTick] = useState(0);

  const loadProfile = useCallback(async (uid: string) => {
    const [{ data: p }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setProfile(p as Profile | null);
    setIsAdmin(!!roles?.some((r) => r.role === "admin"));
  }, []);

  useEffect(() => {
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
      if (data.session?.user) loadProfile(data.session.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  // Realtime: keep profile row + access state in sync with DB changes (admin extends/expires subscription, etc.)
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`profile:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        () => loadProfile(user.id),
      )
      .subscribe();
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user, loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // Compute access
  let access: "trial" | "active" | "locked" = "locked";
  let hoursLeft = 0;
  if (profile) {
    if (profile.subscription_status === "active" && profile.subscription_until && new Date(profile.subscription_until) > new Date()) {
      access = "active";
      hoursLeft = Math.ceil((new Date(profile.subscription_until).getTime() - Date.now()) / (60 * 60 * 1000));
    } else {
      const trialEnds = new Date(new Date(profile.trial_started_at).getTime() + 72 * 60 * 60 * 1000);
      if (trialEnds > new Date()) {
        access = "trial";
        hoursLeft = Math.ceil((trialEnds.getTime() - Date.now()) / (60 * 60 * 1000));
      } else access = "locked";
    }
  }

  return { session, user, profile, isAdmin, loading, signOut, access, hoursLeft, reloadProfile: () => user && loadProfile(user.id) };
}
