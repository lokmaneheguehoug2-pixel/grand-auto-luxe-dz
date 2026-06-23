import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSignedUrl } from "@/hooks/use-signed-url";
import { useAuth } from "@/hooks/use-auth";
import { formatDZD } from "@/lib/format";
import { BadgeCheck, Car, MapPin, Gauge, Clock, Crown, AlertTriangle, Tag, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumPaywallModal } from "@/components/PremiumPaywallModal";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/seller/$id")({
  head: () => ({ meta: [{ title: "Seller Profile · GRAND Auto Luxe" }] }),
  component: SellerProfile,
});

function SellerProfile() {
  const { id } = Route.useParams();
  const { user, profile: me, access } = useAuth();
  const isOwnProfile = user?.id === id;

  const { data: profile } = useQuery({
    queryKey: ["seller-profile", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, subscription_status, subscription_until, plan_type, is_showroom, showroom_name, phone")
        .eq("id", id)
        .maybeSingle();
      return data;
    },
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["seller-vehicles", id],
    refetchInterval: 15_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("vehicles")
        .select("*")
        .eq("seller_id", id)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const verified = profile?.is_showroom || (
    profile?.subscription_status === "active" &&
    profile?.subscription_until &&
    new Date(profile.subscription_until) > new Date()
  );

  const name = profile
    ? (profile.showroom_name || `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Seller")
    : "Seller";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* 3-day trial expiry banner for own profile */}
      {isOwnProfile && access === "trial" && me && (
        <TrialExpiryBanner trialStartedAt={me.trial_started_at} />
      )}

      <div className="premium-card rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(212,175,55,0.18),transparent_50%)]" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="h-20 w-20 rounded-2xl gold-gradient grid place-items-center text-3xl font-display text-gold-foreground shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-3xl">{name}</h1>
              {verified && (
                <span title="Verified Showroom" className="inline-flex items-center gap-1 text-gold">
                  <BadgeCheck className="h-6 w-6" />
                </span>
              )}
            </div>
            <div className="text-xs uppercase tracking-widest text-gold/80 mt-1">
              {profile?.plan_type === "showroom" ? "Showroom Plan" : profile?.plan_type === "individual" ? "Individual Plan" : verified ? "Verified Premium Seller" : "Standard Seller"}
            </div>
            {isOwnProfile && (
              <div className="mt-3 flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/plans">
                    <Crown className="h-4 w-4 text-gold" /> Upgrade Plan
                  </Link>
                </Button>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <div className="rounded-xl gold-border bg-gold-soft/30 px-5 py-4 text-center min-w-[120px]">
              <div className="text-[10px] uppercase tracking-widest text-gold/80">Vehicles</div>
              <div className="font-display text-3xl gold-text mt-1 flex items-center justify-center gap-2">
                <Car className="h-5 w-5" />
                {vehicles.length}
              </div>
            </div>
            {isOwnProfile && me?.subscription_until && (
              <SubscriptionCountdown until={me.subscription_until} status={me.subscription_status} />
            )}
          </div>
        </div>
      </div>

      <h2 className="font-display text-2xl mt-10 mb-4">Active Listings</h2>
      {vehicles.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">No active vehicles yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((v: any) => <SellerCard key={v.id} v={v} />)}
        </div>
      )}
    </div>
  );
}

function TrialExpiryBanner({ trialStartedAt }: { trialStartedAt: string }) {
  const [hoursLeft, setHoursLeft] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    const calc = () => {
      const expiry = new Date(trialStartedAt).getTime() + 72 * 60 * 60 * 1000;
      const left = Math.max(0, (expiry - Date.now()) / (1000 * 60 * 60));
      setHoursLeft(left);
    };
    calc();
    const id = setInterval(calc, 60_000);
    return () => clearInterval(id);
  }, [trialStartedAt]);

  const daysLeft = Math.ceil(hoursLeft / 24);

  if (hoursLeft > 72) return null;

  return (
    <div className={`rounded-xl border p-4 mb-6 flex items-center justify-between ${daysLeft <= 1 ? "border-destructive bg-destructive/10" : "border-gold/40 bg-gold-soft/20"}`}>
      <div className="flex items-center gap-3">
        <AlertTriangle className={`h-5 w-5 ${daysLeft <= 1 ? "text-destructive" : "text-gold"}`} />
        <div>
          <div className="font-medium">
            {daysLeft <= 1 ? "اخر يوم!" : `تبقى ${Math.floor(hoursLeft)} ساعة على انتهاء التجربة`}
          </div>
          <div className="text-xs text-muted-foreground">
            {daysLeft <= 1 ? "خصص اشتراكك الآن للاستمرار في النشر" : "فعّل اشتراكك للاستمرار في نشر الإعلانات والريلز"}
          </div>
        </div>
      </div>
      <Button variant="gold" size="sm" onClick={() => setShowPaywall(true)}>
        <Tag className="h-4 w-4" /> تفعيل الآن
      </Button>
      <PremiumPaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
    </div>
  );
}

function SubscriptionCountdown({ until, status }: { until: string; status: string }) {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const calc = () => {
      const left = Math.max(0, (new Date(until).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      setDaysLeft(left);
    };
    calc();
    const id = setInterval(calc, 60_000);
    return () => clearInterval(id);
  }, [until]);

  if (status !== "active") return null;

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-center min-w-[120px]">
      <div className="text-[10px] uppercase tracking-widest text-emerald-400">Subscription</div>
      <div className="font-display text-2xl text-emerald-400 mt-1 flex items-center justify-center gap-2">
        <Calendar className="h-5 w-5" />
        {Math.ceil(daysLeft)}d
      </div>
    </div>
  );
}

function SellerCard({ v }: { v: any }) {
  const cover = useSignedUrl("vehicle-media", v.photos?.[0]);
  const price = v.price_type === "fixed" ? v.fixed_price : (v.current_highest_bid ?? v.starting_price);
  return (
    <Link to="/vehicle/$id" params={{ id: v.id }} className="group premium-card rounded-xl overflow-hidden hover:gold-border transition-all">
      <div className="aspect-[4/3] bg-charcoal overflow-hidden">
        {cover && <img src={cover} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" alt={`${v.brand} ${v.model}`} loading="lazy" />}
      </div>
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-lg truncate">{v.brand} {v.model}</h3>
          <span className="text-xs text-muted-foreground shrink-0">{v.year}</span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{v.wilaya}</span>
          <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{v.mileage?.toLocaleString()} km</span>
        </div>
        <div className="gold-text font-display text-xl font-bold mt-2">{formatDZD(price)}</div>
      </div>
    </Link>
  );
}
