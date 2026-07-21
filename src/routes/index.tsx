import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { ref, onValue, off } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { WILAYAS, BRANDS } from "@/lib/wilayas";
import { formatDZD } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, MapPin, Gauge, Fuel, Cog, Play, Grid3x2 as Grid3X3, Film } from "lucide-react";
import { Countdown } from "@/components/Countdown";
import { compareStore, useCompare } from "@/lib/compare";
import { useAuth } from "@/hooks/use-auth";
import { PremiumPaywallModal } from "@/components/PremiumPaywallModal";
import { StoriesStrip } from "@/components/StoriesStrip";

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
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  wilaya: string;
  phone: string;
  images: string[]; // Cloudinary URLs
  video_url: string | null;
  price_type: "fixed" | "auction";
  fixed_price: number | null;
  starting_price: number | null;
  current_highest_bid: number | null;
  auction_ends_at: string | null;
  status: string;
  created_at: string;
};

function SoldOverlay() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-black/55 backdrop-blur-[2px] z-10 pointer-events-none">
      <div className="rotate-[-12deg] border-2 border-gold bg-gold/20 backdrop-blur-md px-6 py-2 rounded-md gold-glow">
        <div className="font-display text-2xl gold-shine font-bold tracking-widest">SOLD</div>
        <div className="text-[10px] text-gold text-center tracking-[0.3em]">مباع</div>
      </div>
    </div>
  );
}

function Home() {
  const [filters, setFilters] = useState({
    q: "",
    brand: "all",
    fuel: "all",
    trans: "all",
    wilaya: "all",
    min: "",
    max: "",
    year: "",
    sort: "newest"
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const vehiclesRef = ref(realtimeDb, "vehicles");

    const handleSnapshot = (snapshot: { val: () => Record<string, any> | null }) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data)
          .map(([id, v]) => ({
            id,
            brand: v.brand,
            model: v.model,
            year: v.year,
            mileage: v.mileage,
            fuel_type: v.fuel_type,
            transmission: v.transmission,
            wilaya: v.wilaya,
            phone: v.phone,
            images: v.images || [], // Cloudinary URLs
            video_url: v.video_url || null,
            price_type: v.price_type,
            fixed_price: v.fixed_price,
            starting_price: v.starting_price,
            current_highest_bid: v.current_highest_bid,
            auction_ends_at: v.auction_ends_at,
            status: v.status,
            created_at: v.created_at,
          }))
          .filter((v) => v.status === "active" || v.status === "sold")
          .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

        setVehicles(list);
      } else {
        setVehicles([]);
      }
      setLoading(false);
    };

    onValue(vehiclesRef, handleSnapshot);
    return () => off(vehiclesRef);
  }, []);

  const filtered = useMemo(() => {
    const priceOf = (v: Vehicle) =>
      v.price_type === "fixed" ? (v.fixed_price ?? 0) : (v.current_highest_bid ?? v.starting_price ?? 0);

    const list = vehicles.filter((v) => {
      if (filters.q && !`${v.brand} ${v.model}`.toLowerCase().includes(filters.q.toLowerCase())) return false;
      if (filters.brand !== "all" && v.brand !== filters.brand) return false;
      if (filters.fuel !== "all" && v.fuel_type !== filters.fuel) return false;
      if (filters.trans !== "all" && v.transmission !== filters.trans) return false;
      if (filters.wilaya !== "all" && v.wilaya !== filters.wilaya) return false;
      if (filters.year && v.year !== Number(filters.year)) return false;
      const price = priceOf(v);
      if (filters.min && price < Number(filters.min)) return false;
      if (filters.max && price > Number(filters.max)) return false;
      return true;
    });

    if (filters.sort === "price_asc") list.sort((a, b) => priceOf(a) - priceOf(b));
    else if (filters.sort === "price_desc") list.sort((a, b) => priceOf(b) - priceOf(a));
    else if (filters.sort === "year_desc") list.sort((a, b) => b.year - a.year);

    return list;
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

      {/* Stories Strip */}
      <StoriesStrip />

      {/* Filters */}
      <section className="border-b border-border/60 sticky top-16 z-20 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search brand, model..."
                className="pl-9 bg-charcoal"
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              />
            </div>
            <Select value={filters.brand} onValueChange={(v) => setFilters({ ...filters, brand: v })}>
              <SelectTrigger className="w-[140px] bg-charcoal"><SelectValue placeholder="Brand" /></SelectTrigger>
              <SelectContent>{BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filters.wilaya} onValueChange={(v) => setFilters({ ...filters, wilaya: v })}>
              <SelectTrigger className="w-[140px] bg-charcoal"><SelectValue placeholder="Wilaya" /></SelectTrigger>
              <SelectContent>{WILAYAS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filters.sort} onValueChange={(v) => setFilters({ ...filters, sort: v })}>
              <SelectTrigger className="w-[120px] bg-charcoal"><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_asc">Price ↑</SelectItem>
                <SelectItem value="price_desc">Price ↓</SelectItem>
                <SelectItem value="year_desc">Year ↓</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs defaultValue="grid">
          <TabsList className="mb-4">
            <TabsTrigger value="grid"><Grid3X3 className="h-4 w-4 mr-1" />Grid</TabsTrigger>
            {reelsVehicles.length > 0 && (
              <TabsTrigger value="reels"><Film className="h-4 w-4 mr-1" />Reels</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="grid">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-charcoal rounded-xl h-64" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">No vehicles found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} />
                ))}
              </div>
            )}
          </TabsContent>

          {reelsVehicles.length > 0 && (
            <TabsContent value="reels">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {reelsVehicles.map((v) => (
                  <VehicleReelCard key={v.id} vehicle={v} />
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </section>
    </div>
  );
}

function VehicleCard({ vehicle: v }: { vehicle: Vehicle }) {
  const imageUrl = v.images?.[0] || "/my-logo.png.PNG";
  const compare = useCompare();

  return (
    <Link
      to="/vehicle/$id"
      params={{ id: v.id }}
      className="group premium-card rounded-xl overflow-hidden border border-gold/20 block relative"
    >
      {v.status === "sold" && <SoldOverlay />}

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-charcoal">
        <img
          src={imageUrl}
          alt={`${v.brand} ${v.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {v.video_url && (
          <div className="absolute bottom-2 right-2 bg-black/70 rounded-full p-1">
            <Play className="h-4 w-4 text-gold" />
          </div>
        )}
        {v.price_type === "auction" && v.auction_ends_at && (
          <div className="absolute top-2 left-2 bg-red-500/90 text-white text-xs px-2 py-1 rounded-full font-medium">
            LIVE AUCTION
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="font-medium text-sm mb-1">{v.brand} {v.model} ({v.year})</div>
        <div className="text-xs text-muted-foreground flex items-center gap-2 mb-2">
          <MapPin className="h-3 w-3" />{v.wilaya}
          <span className="text-gold font-display">
            {v.price_type === "fixed" && v.fixed_price ? formatDZD(v.fixed_price) :
             v.price_type === "auction" ? `${formatDZD(v.current_highest_bid || v.starting_price || 0)}+` : ""}
          </span>
        </div>

        {v.price_type === "auction" && v.auction_ends_at && (
          <Countdown endsAt={v.auction_ends_at} />
        )}
      </div>

      {/* Compare checkbox */}
      <button
        onClick={(e) => { e.preventDefault(); compareStore.toggle(v.id); }}
        className={`absolute bottom-2 right-2 w-6 h-6 rounded-md border flex items-center justify-center transition ${
          compare.includes(v.id) ? "bg-gold border-gold" : "border-gold/40 hover:border-gold"
        }`
      >
        {compare.includes(v.id) && <span className="text-black text-xs font-bold">✓</span>}
      </button>
    </Link>
  );
}

function VehicleReelCard({ vehicle: v }: { vehicle: Vehicle }) {
  return (
    <Link
      to="/vehicle/$id"
      params={{ id: v.id }}
      className="group rounded-xl overflow-hidden border border-gold/20 block relative aspect-[9/16] bg-charcoal"
    >
      {v.video_url && (
        <video
          src={v.video_url}
          className="w-full h-full object-cover"
          muted
          loop
          playsInline
          onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
          onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
        />
      }

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="font-display text-lg mb-1">{v.brand} {v.model}</div>
        <div className="text-xs text-white/60">{v.year} · {v.wilaya}</div>
        <div className="text-gold font-display mt-1">
          {v.price_type === "fixed" && v.fixed_price ? formatDZD(v.fixed_price) :
           v.price_type === "auction" ? `${formatDZD(v.current_highest_bid || v.starting_price || 0)}+` : ""}
        </div>
      </div>

      {v.status === "sold" && <SoldOverlay />}
    </Link>
  );
}
