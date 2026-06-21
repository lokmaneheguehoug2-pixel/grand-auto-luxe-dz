import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSignedUrl } from "@/hooks/use-signed-url";
import { formatDZD } from "@/lib/format";
import { BadgeCheck, Car, MapPin, Gauge } from "lucide-react";

export const Route = createFileRoute("/seller/$id")({
  head: () => ({ meta: [{ title: "Seller Profile · GRAND Auto Luxe" }] }),
  component: SellerProfile,
});

function SellerProfile() {
  const { id } = Route.useParams();

  const { data: profile } = useQuery({
    queryKey: ["seller-profile", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, subscription_status, subscription_until")
        .eq("id", id)
        .maybeSingle();
      return data;
    },
  });

  // Live counter — refetches on focus and every 15s so the badge tracks the seller's real listings
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

  const verified =
    profile?.subscription_status === "active" &&
    profile?.subscription_until &&
    new Date(profile.subscription_until) > new Date();

  const name = profile ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Seller" : "Seller";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
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
              {verified ? "Verified Premium Seller" : "Standard Seller"}
            </div>
          </div>
          <div className="rounded-xl gold-border bg-gold-soft/30 px-5 py-4 text-center min-w-[140px]">
            <div className="text-[10px] uppercase tracking-widest text-gold/80">Vehicles</div>
            <div className="font-display text-4xl gold-text mt-1 flex items-center justify-center gap-2">
              <Car className="h-6 w-6" />
              {vehicles.length}
            </div>
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
