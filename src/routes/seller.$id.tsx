import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { formatDZD } from "@/lib/format";
import { BadgeCheck, Car, MapPin, Gauge, Clock, Crown, AlertTriangle, Tag, Calendar, Instagram, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumPaywallModal } from "@/components/PremiumPaywallModal";
import { useState, useEffect } from "react";
import { realtimeDb } from "@/lib/firebase";
import { ref, get } from "firebase/database";

export const Route = createFileRoute("/seller/$id")({
  head: () => ({ meta: [{ title: "Seller Profile · GRAND Auto Luxe" }] }),
  component: SellerProfile,
});

type SellerProfile = {
  id: string;
  phone: string;
  first_name: string;
  last_name: string;
  showroom_name?: string;
  subscription_status: string;
  subscription_until?: string;
  is_showroom?: boolean;
  plan_type?: string;
  instagram?: string;
};

type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  wilaya: string;
  mileage: number;
  photos?: string[];
  price_type: "fixed" | "auction";
  fixed_price?: number;
  current_highest_bid?: number;
  starting_price?: number;
  status: string;
  created_at?: string;
};

function SellerProfile() {
  const { id } = Route.useParams();
  const { user, profile: me, access } = useAuth();
  const isOwnProfile = user?.id === id;

  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const profileSnap = await get(ref(realtimeDb, `users/${id}`));
        if (profileSnap.exists()) {
          const data = profileSnap.val();
          setProfile({
            id,
            phone: data.phone || id,
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            showroom_name: data.showroom_name,
            subscription_status: data.subscription_status || "trial",
            subscription_until: data.subscription_until,
            is_showroom: data.subscription_tier === "dealer",
            plan_type: data.subscription_tier === "dealer" ? "showroom" : "individual",
            instagram: data.instagram,
          });
        }

        const vehiclesSnap = await get(ref(realtimeDb, "vehicles"));
        if (vehiclesSnap.exists()) {
          const allVehicles = vehiclesSnap.val() as Record<string, Vehicle>;
          const sellerVehicles = Object.entries(allVehicles)
            .filter(([_, v]) => v.sellerId === id || v.sellerPhone === id)
            .filter(([_, v]) => v.status === "active")
            .map(([vid, v]) => ({ ...v, id: vid }))
            .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
          setVehicles(sellerVehicles);
        }
      } catch (err) {
        console.error("Error loading seller profile:", err);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const verified = profile?.is_showroom || (
    profile?.subscription_status === "active" &&
    profile?.subscription_until &&
    new Date(profile.subscription_until) > new Date()
  );

  const name = profile
    ? (profile.showroom_name || `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Seller")
    : "Seller";

  const getInstagramUrl = (username: string) => {
    if (!username) return null;
    const clean = username.replace("@", "").trim();
    if (clean.startsWith("http")) return clean;
    return `https://instagram.com/${clean}`;
  };

  const instagramUrl = profile?.instagram ? getInstagramUrl(profile.instagram) : null;

  if (loading) return <div className="max-w-6xl mx-auto px-6 py-20 text-center text-muted-foreground">Loading...</div>;
  if (!profile) return (
    <div className="max-w-6xl mx-auto px-6 py-20 text-center">
      <h1 className="font-display text-2xl gold-text">Seller not found</h1>
      <Button asChild variant="gold" className="mt-4"><Link to="/">Back</Link></Button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {isOwnProfile && access === "trial" && me && <TrialExpiryBanner trialStartedAt={me.trial_started_at} />}

      <div className="premium-card rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(212,175,55,0.18),transparent_50%)]" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="h-20 w-20 rounded-2xl gold-gradient grid place-items-center text-3xl font-display text-gold-foreground shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-3xl">{name}</h1>
              {verified && <span title="Verified" className="text-gold"><BadgeCheck className="h-6 w-6" /></span>}
            </div>
            <div className="text-xs uppercase tracking-widest text-gold/80 mt-1">
              {profile?.plan_type === "showroom" ? "Showroom" : "Individual"}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-pink-500 hover:text-pink-400">
                  <Instagram className="h-4 w-4" /><span>{profile.instagram}</span>
                </a>
              )}
              {profile.phone && (
                <a href={`tel:${profile.phone}`} className="inline-flex items-center gap-1.5 text-sm text-gold hover:text-gold/80">
                  <Phone className="h-4 w-4" /><span>{profile.phone}</span>
                </a>
              )}
              {profile.phone && (
                <a href={`https://wa.me/${profile.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-green-500 hover:text-green-400">
                  <MessageCircle className="h-4 w-4" /><span>WhatsApp</span>
                </a>
              )}
            </div>

            {isOwnProfile && (
              <div className="mt-3">
                <Button variant="ghost" size="sm" asChild><Link to="/plans"><Crown className="h-4 w-4 text-gold" /> Upgrade</Link></Button>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <div className="rounded-xl gold-border bg-gold-soft/30 px-5 py-4 text-center min-w-[120px]">
              <div className="text-[10px] uppercase tracking-widest text-gold/80">Vehicles</div>
              <div className="font-display text-3xl gold-text mt-1 flex items-center justify-center gap-2">
                <Car className="h-5 w-5" />{vehicles.length}
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
        <div className="text-center text-muted-foreground py-16">No listings yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((v) => <SellerCard key={v.id} v={v} />)}
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
      setHoursLeft(Math.max(0, (expiry - Date.now()) / (1000 * 60 * 60)));
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
          <div className="font-medium">{daysLeft <= 1 ? "Last day!" : `${Math.floor(hoursLeft)}h left`}</div>
          <div className="text-xs text-muted-foreground">Upgrade to continue posting</div>
        </div>
      </div>
      <Button variant="gold" size="sm" onClick={() => setShowPaywall(true)}><Tag className="h-4 w-4" /></Button>
      <PremiumPaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
    </div>
  );
}

function SubscriptionCountdown({ until, status }: { until: string; status: string }) {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const calc = () => setDaysLeft(Math.max(0, (new Date(until).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    calc();
    const id = setInterval(calc, 60_000);
    return () => clearInterval(id);
  }, [until]);

  if (status !== "active") return null;

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-center min-w-[120px]">
      <div className="text-[10px] uppercase tracking-widest text-emerald-400">Subscription</div>
      <div className="font-display text-2xl text-emerald-400 mt-1 flex items-center justify-center gap-2">
        <Calendar className="h-5 w-5" />{Math.ceil(daysLeft)}d
      </div>
    </div>
  );
}

function SellerCard({ v }: { v: Vehicle }) {
  const cover = v.photos?.[0];
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
        <div className="gold-text font-display text-xl font-bold mt-2">{formatDZD(price ?? 0)}</div>
      </div>
    </Link>
  );
}
