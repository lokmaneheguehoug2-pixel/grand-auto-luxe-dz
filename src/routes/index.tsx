import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useCallback } from "react";
import { ref, onValue, off } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { WILAYAS, BRANDS } from "@/lib/wilayas";
import { formatDZD, formatDZDArabic } from "@/lib/format";
import { calculateDeal } from "@/lib/pricing";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, MapPin, Play, Grid3x2 as Grid3X3, Film, Heart, Eye, Star, TrendingDown, Bookmark } from "lucide-react";
import { Countdown } from "@/components/Countdown";
import { compareStore, useCompare } from "@/lib/compare";
import { useAuth } from "@/hooks/use-auth";
import { StoriesStrip } from "@/components/StoriesStrip";
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";

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
  images: string[];
  video_url: string | null;
  price_type: "fixed" | "auction";
  fixed_price: number | null;
  starting_price: number | null;
  current_highest_bid: number | null;
  auction_ends_at: string | null;
  status: string;
  created_at: string;
  previous_price?: number | null;
};

type LikeData = Record<string, { count: number; liked: boolean }>;
type FavoriteData = Record<string, boolean>;

function priceOf(v: Vehicle): number {
  return v.price_type === "fixed" ? (v.fixed_price ?? 0) : (v.current_highest_bid ?? v.starting_price ?? 0);
}

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

function DealBadge({ vehicle: v, allVehicles }: { vehicle: Vehicle; allVehicles: Vehicle[] }) {
  const deal = calculateDeal(priceOf(v), v.brand, v.model, v.year, allVehicles);
  if (!deal) return null;
  return (
    <div className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full border ${deal.badgeClass}`} title={deal.tooltip}>
      {deal.rating === "great" && <Star className="h-2.5 w-2.5" />}
      {deal.label}
    </div>
  );
}

function PriceDropTag({ vehicle: v }: { vehicle: Vehicle }) {
  const price = priceOf(v);
  const hasDrop = v.previous_price && v.previous_price > price;
  if (!hasDrop) return null;
  const savings = v.previous_price! - price;
  return (
    <div className="flex items-center gap-1 text-[9px] text-green-400">
      <TrendingDown className="h-2.5 w-2.5" />
      <span className="line-through text-muted-foreground">{formatDZD(v.previous_price)}</span>
      <span>→ {formatDZD(price)}</span>
      <span className="text-green-400 font-medium">Save {formatDZD(savings)}</span>
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
  const auth = useAuth();
  const userId = auth?.user?.id ?? auth?.user?.phone ?? null;
  const [likeData, setLikeData] = useState<LikeData>({});
  const [favorites, setFavorites] = useState<FavoriteData>({});

  useEffect(() => {
    const vehiclesRef = ref(realtimeDb, "vehicles");

    const handleSnapshot = (snapshot: { val: () => Record<string, any> | null }) => {
      const data = snapshot.val();
      if (data) {
        const list: Vehicle[] = Object.entries(data)
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
            images: v.images || [],
            video_url: v.video_url || null,
            price_type: v.price_type,
            fixed_price: v.fixed_price,
            starting_price: v.starting_price,
            current_highest_bid: v.current_highest_bid,
            auction_ends_at: v.auction_ends_at,
            status: v.status,
            created_at: v.created_at,
            previous_price: v.previous_price ?? null,
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

  const loadLikes = useCallback(async () => {
    const client = getSupabase();
    if (!client) return;
    const { data } = await client.from("vehicle_likes").select("vehicle_id, user_id");
    if (!data) return;
    const map: LikeData = {};
    for (const row of data) {
      if (!map[row.vehicle_id]) map[row.vehicle_id] = { count: 0, liked: false };
      map[row.vehicle_id].count++;
      if (row.user_id === userId) map[row.vehicle_id].liked = true;
    }
    setLikeData(map);
  }, [userId]);

  const loadFavorites = useCallback(async () => {
    const client = getSupabase();
    if (!client || !userId) return;
    const { data } = await client.from("vehicle_favorites").select("vehicle_id").eq("user_id", userId);
    if (!data) return;
    const map: FavoriteData = {};
    for (const row of data) map[row.vehicle_id] = true;
    setFavorites(map);
  }, [userId]);

  useEffect(() => {
    loadLikes();
    loadFavorites();
  }, [loadLikes, loadFavorites]);

  const filtered = useMemo(() => {
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

  const handleLike = useCallback(async (vehicleId: string) => {
    if (!userId) {
      toast.info("Sign in to like vehicles");
      return;
    }
    const client = getSupabase();
    if (!client) return;

    const current = likeData[vehicleId] ?? { count: 0, liked: false };
    const newLiked = !current.liked;

    setLikeData(prev => ({
      ...prev,
      [vehicleId]: { count: newLiked ? current.count + 1 : Math.max(0, current.count - 1), liked: newLiked }
    }));

    try {
      if (newLiked) {
        await client.from("vehicle_likes").insert({ vehicle_id: vehicleId, user_id: userId });
      } else {
        await client.from("vehicle_likes").delete().eq("vehicle_id", vehicleId).eq("user_id", userId);
      }
    } catch {
      setLikeData(prev => ({
        ...prev,
        [vehicleId]: { count: current.count, liked: current.liked }
      }));
    }
  }, [userId, likeData]);

  const handleFavorite = useCallback(async (vehicleId: string) => {
    if (!userId) {
      toast.info("Sign in to save vehicles");
      return;
    }
    const client = getSupabase();
    if (!client) return;
    const isFav = favorites[vehicleId] ?? false;
    setFavorites(prev => ({ ...prev, [vehicleId]: !isFav }));
    try {
      if (!isFav) {
        await client.from("vehicle_favorites").insert({ vehicle_id: vehicleId, user_id: userId });
      } else {
        await client.from("vehicle_favorites").delete().eq("vehicle_id", vehicleId).eq("user_id", userId);
      }
    } catch {
      setFavorites(prev => ({ ...prev, [vehicleId]: isFav }));
    }
  }, [userId, favorites]);

  return (
    <div>
      <StoriesStrip />

      {/* Filters */}
      <section className="border-b border-border/60 sticky top-14 z-20 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <div className="relative flex-1 min-w-[140px] max-w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search brand, model..."
                className="pl-9 bg-charcoal h-9"
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              />
            </div>
            <Select value={filters.brand} onValueChange={(v) => setFilters({ ...filters, brand: v })}>
              <SelectTrigger className="w-[120px] sm:w-[140px] bg-charcoal h-9"><SelectValue placeholder="Brand" /></SelectTrigger>
              <SelectContent>{BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filters.wilaya} onValueChange={(v) => setFilters({ ...filters, wilaya: v })}>
              <SelectTrigger className="w-[120px] sm:w-[140px] bg-charcoal h-9"><SelectValue placeholder="Wilaya" /></SelectTrigger>
              <SelectContent>{WILAYAS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filters.sort} onValueChange={(v) => setFilters({ ...filters, sort: v })}>
              <SelectTrigger className="w-[100px] sm:w-[120px] bg-charcoal h-9"><SelectValue placeholder="Sort" /></SelectTrigger>
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
      <section className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
        <Tabs defaultValue="grid">
          <TabsList className="mb-4">
            <TabsTrigger value="grid"><Grid3X3 className="h-4 w-4 mr-1" />Grid</TabsTrigger>
            {reelsVehicles.length > 0 && (
              <TabsTrigger value="reels"><Film className="h-4 w-4 mr-1" />Reels</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="grid">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-charcoal rounded-xl h-48 sm:h-64" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">No vehicles found.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {filtered.map((v) => (
                  <VehicleCard
                    key={v.id}
                    vehicle={v}
                    allVehicles={vehicles}
                    likeInfo={likeData[v.id]}
                    isFavorite={favorites[v.id] ?? false}
                    onLike={() => handleLike(v.id)}
                    onFavorite={() => handleFavorite(v.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {reelsVehicles.length > 0 && (
            <TabsContent value="reels">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {reelsVehicles.map((v) => (
                  <VehicleReelCard
                    key={v.id}
                    vehicle={v}
                    likeInfo={likeData[v.id]}
                    onLike={() => handleLike(v.id)}
                  />
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </section>
    </div>
  );
}

function VehicleCard({ vehicle: v, allVehicles, likeInfo, isFavorite, onLike, onFavorite }: {
  vehicle: Vehicle;
  allVehicles: Vehicle[];
  likeInfo?: { count: number; liked: boolean };
  isFavorite: boolean;
  onLike: () => void;
  onFavorite: () => void;
}) {
  const imageUrl = v.images?.[0] || "/my-logo.png.PNG";
  const compare = useCompare();
  const likeCount = likeInfo?.count ?? 0;
  const liked = likeInfo?.liked ?? false;
  const price = priceOf(v);
  const hasPriceDrop = v.previous_price && v.previous_price > price;

  return (
    <Link
      to="/vehicle/$id"
      params={{ id: v.id }}
      className="group premium-card rounded-xl overflow-hidden border border-gold/20 block relative"
    >
      {v.status === "sold" && <SoldOverlay />}

      <div className="relative aspect-[4/3] overflow-hidden bg-charcoal">
        <img
          src={imageUrl}
          alt={`${v.brand} ${v.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {v.video_url && (
          <div className="absolute bottom-2 right-2 bg-black/70 rounded-full p-1">
            <Play className="h-3 w-3 text-gold" />
          </div>
        )}
        {v.price_type === "auction" && v.auction_ends_at && (
          <div className="absolute top-2 left-2 bg-red-500/90 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
            LIVE
          </div>
        )}

        {/* Favorite bookmark */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFavorite(); }}
          className="absolute top-2 right-2 z-10"
          aria-label="Save to watchlist"
        >
          <Bookmark className={`h-5 w-5 ${isFavorite ? "text-gold fill-gold" : "text-white/80"} drop-shadow-lg`} />
        </button>
      </div>

      <div className="p-2.5 sm:p-3">
        <div className="font-medium text-xs sm:text-sm mb-1 truncate">{v.brand} {v.model} ({v.year})</div>
        <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
          <MapPin className="h-3 w-3 shrink-0" />{v.wilaya}
        </div>

        {/* Deal badge */}
        <div className="mb-1.5">
          <DealBadge vehicle={v} allVehicles={allVehicles} />
        </div>

        {/* Price with drop */}
        {hasPriceDrop ? (
          <div className="mb-1.5">
            <PriceDropTag vehicle={v} />
          </div>
        ) : (
          <div className="flex items-baseline gap-1.5 mb-1.5">
            <span className="text-gold font-display text-sm sm:text-base">{formatDZD(price)}</span>
            <span className="text-[9px] text-muted-foreground">{formatDZDArabic(price)}</span>
          </div>
        )}

        {v.price_type === "auction" && v.auction_ends_at && (
          <Countdown endsAt={v.auction_ends_at} />
        )}

        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLike(); }}
            className="flex items-center gap-1 transition-transform active:scale-90"
            aria-label="Like"
          >
            <Heart className={`h-4 w-4 ${liked ? "text-red-500 fill-red-500" : "text-muted-foreground"}`} />
            <span className="text-[10px] text-muted-foreground">{likeCount}</span>
          </button>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">{Math.floor(likeCount * 3.7) + 1}</span>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); compareStore.toggle(v.id); }}
            className={`ml-auto w-5 h-5 rounded-md border flex items-center justify-center transition ${
              compare.includes(v.id) ? "bg-gold border-gold" : "border-gold/40"
            }`}
          >
            {compare.includes(v.id) && <span className="text-black text-[8px] font-bold">✓</span>}
          </button>
        </div>
      </div>
    </Link>
  );
}

function VehicleReelCard({ vehicle: v, likeInfo, onLike }: {
  vehicle: Vehicle;
  likeInfo?: { count: number; liked: boolean };
  onLike: () => void;
}) {
  const likeCount = likeInfo?.count ?? 0;
  const liked = likeInfo?.liked ?? false;
  const price = priceOf(v);

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
          preload="metadata"
          onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
          onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="font-display text-base sm:text-lg mb-1">{v.brand} {v.model}</div>
        <div className="text-[10px] sm:text-xs text-white/60">{v.year} · {v.wilaya}</div>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-gold font-display text-sm sm:text-base">{formatDZD(price)}</span>
          <span className="text-[9px] text-white/50">{formatDZDArabic(price)}</span>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLike(); }}
            className="flex items-center gap-1"
            aria-label="Like"
          >
            <Heart className={`h-4 w-4 ${liked ? "text-red-500 fill-red-500" : "text-white/80"}`} />
            <span className="text-[10px] text-white/80">{likeCount}</span>
          </button>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4 text-white/80" />
            <span className="text-[10px] text-white/80">{Math.floor(likeCount * 3.7) + 1}</span>
          </div>
        </div>
      </div>

      {v.status === "sold" && <SoldOverlay />}
    </Link>
  );
}
