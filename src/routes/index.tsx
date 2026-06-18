import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";
import { WILAYAS, BRANDS } from "@/lib/wilayas";
import { formatDZD } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, MapPin, Gauge, Fuel, Cog, Play, Grid3X3, Film, Phone } from "lucide-react";
import { Countdown } from "@/components/Countdown";
import { useSignedUrl } from "@/hooks/use-signed-url";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GRAND Auto Luxe — Premium Algerian Vehicle Marketplace" },
      { name: "description", content: "Browse and bid on premium vehicles across Algeria. Reels and grid views, live auctions." },
    ],
  }),
  component: Home,
});

type Vehicle = {
  id: string; brand: string; model: string; year: number; mileage: number;
  fuel_type: string; transmission: string; wilaya: string; phone: string;
  photos: string[]; video_url: string | null;
  price_type: "fixed" | "auction"; fixed_price: number | null; starting_price: number | null;
  current_highest_bid: number | null; auction_ends_at: string | null; status: string;
};

import { SoldOverlay } from "@/routes/my-listings";
import { formatCentimes } from "@/lib/format";

function Home() {
  const [filters, setFilters] = useState({ q: "", brand: "all", fuel: "all", trans: "all", wilaya: "all", min: "", max: "", year: "" });

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .in("status", ["active", "sold"])
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as Vehicle[];
    },
  });

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      if (filters.q && !`${v.brand} ${v.model}`.toLowerCase().includes(filters.q.toLowerCase())) return false;
      if (filters.brand !== "all" && v.brand !== filters.brand) return false;
      if (filters.fuel !== "all" && v.fuel_type !== filters.fuel) return false;
      if (filters.trans !== "all" && v.transmission !== filters.trans) return false;
      if (filters.wilaya !== "all" && v.wilaya !== filters.wilaya) return false;
      if (filters.year && v.year !== Number(filters.year)) return false;
      const price = v.price_type === "fixed" ? v.fixed_price : (v.current_highest_bid ?? v.starting_price);
      if (filters.min && (price ?? 0) < Number(filters.min)) return false;
      if (filters.max && (price ?? Infinity) > Number(filters.max)) return false;
      return true;
    });
  }, [vehicles, filters]);

  const reelsVehicles = filtered.filter((v) => v.video_url);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(212,175,55,0.18),transparent_50%),radial-gradient(circle_at_80%_100%,rgba(212,175,55,0.12),transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Marketplace · Vehicles Only</div>
            <h1 className="font-display text-4xl sm:text-6xl leading-[1.05] mb-4">
              The premium <span className="gold-text">Algerian</span> automotive market.
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
              Discover, bid, and acquire exceptional vehicles. Reels-style discovery, live auctions, and trusted owners across all 58 wilayas.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border/60 bg-charcoal/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            <div className="col-span-2 md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search brand or model…" className="pl-9 bg-background border-border" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
            </div>
            <Select value={filters.brand} onValueChange={(v) => setFilters({ ...filters, brand: v })}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="Brand" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All brands</SelectItem>{BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filters.fuel} onValueChange={(v) => setFilters({ ...filters, fuel: v })}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="Fuel" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All fuels</SelectItem>
                {["Diesel","Essence","GPL","Hybrid","Electrique"].map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.trans} onValueChange={(v) => setFilters({ ...filters, trans: v })}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="Trans." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Manuelle">Manuelle</SelectItem>
                <SelectItem value="Automatique">Automatique</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.wilaya} onValueChange={(v) => setFilters({ ...filters, wilaya: v })}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="Wilaya" /></SelectTrigger>
              <SelectContent className="max-h-72"><SelectItem value="all">All wilayas</SelectItem>{WILAYAS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="number" placeholder="Min DZD" className="bg-background" value={filters.min} onChange={(e) => setFilters({ ...filters, min: e.target.value })} />
            <Input type="number" placeholder="Max DZD" className="bg-background" value={filters.max} onChange={(e) => setFilters({ ...filters, max: e.target.value })} />
          </div>
        </div>
      </section>

      {/* Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Tabs defaultValue="grid">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl">{filtered.length} vehicles</h2>
              <p className="text-xs text-muted-foreground">Updated live</p>
            </div>
            <TabsList className="bg-charcoal border border-border">
              <TabsTrigger value="grid" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground"><Grid3X3 className="h-4 w-4 mr-1" />Grid</TabsTrigger>
              <TabsTrigger value="reels" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground"><Film className="h-4 w-4 mr-1" />Reels</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="grid">
            {isLoading ? <SkeletonGrid /> : filtered.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((v) => <VehicleCard key={v.id} v={v} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reels">
            {reelsVehicles.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">No video reels yet. Sellers can upload short vertical videos when posting.</div>
            ) : (
              <ReelsFeed vehicles={reelsVehicles} />
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

function VehicleCard({ v }: { v: Vehicle }) {
  const cover = useSignedUrl("vehicle-media", v.photos?.[0]);
  const price = v.price_type === "fixed" ? v.fixed_price : (v.current_highest_bid ?? v.starting_price);
  return (
    <Link to="/vehicle/$id" params={{ id: v.id }} className="group premium-card rounded-xl overflow-hidden hover:gold-border transition-all">
      <div className="aspect-[4/3] bg-charcoal relative overflow-hidden">
        {cover ? (
          <img src={cover} alt={`${v.brand} ${v.model}`} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="h-full w-full grid place-items-center text-muted-foreground"><Play className="h-8 w-8" /></div>
        )}
        {v.status === "sold" && <SoldOverlay />}
        {v.status !== "sold" && v.price_type === "auction" && v.auction_ends_at && new Date(v.auction_ends_at) > new Date() && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gold text-gold-foreground text-[10px] font-bold uppercase tracking-wider">Live Auction</div>
        )}
        {v.video_url && (
          <div className="absolute top-3 right-3 h-7 w-7 rounded-full bg-black/60 grid place-items-center"><Play className="h-3 w-3 text-gold" /></div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-lg truncate">{v.brand} {v.model}</h3>
          <span className="text-xs text-muted-foreground shrink-0">{v.year}</span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{v.wilaya}</span>
          <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{v.mileage.toLocaleString()} km</span>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            {v.price_type === "auction" && <div className="text-[10px] uppercase tracking-wider text-gold mb-0.5">Highest Bid</div>}
            <div className="gold-text font-display text-xl font-bold">{formatDZD(price)}</div>
            <div className="text-[10px] text-gold/60 mt-0.5">{formatCentimes(price)}</div>
          </div>
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-lg truncate">{v.brand} {v.model}</h3>
          <span className="text-xs text-muted-foreground shrink-0">{v.year}</span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{v.wilaya}</span>
          <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{v.mileage.toLocaleString()} km</span>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            {v.price_type === "auction" && <div className="text-[10px] uppercase tracking-wider text-gold mb-0.5">Highest Bid</div>}
            <div className="gold-text font-display text-xl font-bold">{formatDZD(price)}</div>
          </div>
          {v.price_type === "auction" && v.auction_ends_at && new Date(v.auction_ends_at) > new Date() && (
            <Countdown endsAt={v.auction_ends_at} className="text-[11px] text-gold" />
          )}
        </div>
      </div>
    </Link>
  );
}

function ReelsFeed({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <div className="h-[calc(100vh-220px)] overflow-y-auto snap-y-mandatory no-scrollbar rounded-2xl border border-border bg-black">
      {vehicles.map((v) => <Reel key={v.id} v={v} />)}
    </div>
  );
}

function Reel({ v }: { v: Vehicle }) {
  const url = useSignedUrl("vehicle-media", v.video_url);
  const price = v.price_type === "fixed" ? v.fixed_price : (v.current_highest_bid ?? v.starting_price);
  return (
    <div className="snap-start h-full min-h-[80vh] relative grid place-items-center bg-black">
      {url && <video src={url} className="absolute inset-0 h-full w-full object-cover" autoPlay loop muted playsInline />}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="relative z-10 w-full max-w-md px-6 pb-10 self-end mt-auto">
        <div className="text-xs uppercase tracking-widest text-gold mb-2">{v.wilaya}</div>
        <h3 className="font-display text-3xl text-white mb-1">{v.brand} {v.model}</h3>
        <div className="text-sm text-white/70 mb-3">{v.year} · {v.fuel_type} · {v.transmission}</div>
        <div className="flex items-center gap-3 mb-4">
          <span className="gold-text font-display text-2xl font-bold">{formatDZD(price)}</span>
          {v.price_type === "auction" && v.auction_ends_at && <Countdown endsAt={v.auction_ends_at} className="text-sm text-gold border border-gold/40 px-2 py-1 rounded-md" />}
        </div>
        <div className="flex gap-2">
          <Button asChild variant="gold" className="flex-1"><Link to="/vehicle/$id" params={{ id: v.id }}>View Details</Link></Button>
          <Button asChild variant="gold-outline" size="icon"><a href={`tel:${v.phone}`}><Phone className="h-4 w-4" /></a></Button>
        </div>
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => <div key={i} className="premium-card rounded-xl aspect-[4/5] animate-pulse" />)}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-24">
      <div className="inline-flex h-16 w-16 rounded-2xl gold-gradient items-center justify-center mb-4"><Cog className="h-8 w-8 text-gold-foreground" /></div>
      <h3 className="font-display text-2xl mb-2">No vehicles match</h3>
      <p className="text-muted-foreground text-sm">Try adjusting your filters or be the first to list a premium vehicle.</p>
      <Button asChild variant="gold" className="mt-6"><Link to="/post">List a Vehicle</Link></Button>
    </div>
  );
}
