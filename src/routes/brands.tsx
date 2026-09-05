import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useCallback } from "react";
import { WILAYAS, BRANDS } from "@/lib/wilayas";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, MapPin, Sparkles, Star, Search, Store, Car, TrendingDown, Heart, Eye, Play } from "lucide-react";
import { ref, onValue, off } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { formatDZD, formatDZDArabic, dzdToMillionCentimes, millionCentimesToDZD } from "@/lib/format";
import { calculateDeal, type DealInfo } from "@/lib/pricing";
import { useAuth } from "@/hooks/use-auth";
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "Discover — GRAND Auto Luxe" },
      { name: "description", content: "Search vehicles, brands, and showrooms across Algeria. Smart pricing, budget filters, and real-time discovery." },
      { property: "og:title", content: "Discover — GRAND Auto Luxe" },
      { property: "og:description", content: "Premium vehicle and showroom discovery across all 58 wilayas." },
    ],
  }),
  component: DiscoveryHub,
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
  sellerPhone: string;
  sellerId: string;
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

type Showroom = {
  phone: string;
  first_name: string;
  last_name: string;
  showroom_name: string;
  wilaya: string;
  bio?: string;
  showroom_logo?: string;
  subscription_status: string;
};

type FavoriteData = Record<string, boolean>;
type LikeData = Record<string, { count: number; liked: boolean }>;
type ViewData = Record<string, number>;

function seededShuffle<T>(arr: T[], seed: string): T[] {
  if (arr.length <= 1) return [...arr];
  const copy = [...arr];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  for (let i = copy.length - 1; i > 0; i--) {
    hash = (hash * 9301 + 49297) % 233280;
    const j = Math.floor((hash / 233280) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const BUDGET_PRESETS = [
  { label: "Under 200M", labelAr: "أقل من 200 مليون", min: 0, max: 200 },
  { label: "200M - 400M", labelAr: "200 - 400 مليون", min: 200, max: 400 },
  { label: "400M+", labelAr: "أكثر من 400 مليون", min: 400, max: 10000 },
];

function priceOf(v: Vehicle): number {
  return v.price_type === "fixed" ? (v.fixed_price ?? 0) : (v.current_highest_bid ?? v.starting_price ?? 0);
}

function DiscoveryHub() {
  const [searchTab, setSearchTab] = useState<"vehicles" | "showrooms">("vehicles");
  const [query, setQuery] = useState("");
  const [wilaya, setWilaya] = useState<string>("all");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(10000);
  const [activePreset, setActivePreset] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<FavoriteData>({});
  const [likeData, setLikeData] = useState<LikeData>({});
  const [viewData, setViewData] = useState<ViewData>({});
  const auth = useAuth();
  const userId = auth?.user?.id ?? auth?.user?.phone ?? null;

  useEffect(() => {
    const vehiclesRef = ref(realtimeDb, "vehicles");
    const handleSnapshot = (snapshot: { val: () => Record<string, any> | null }) => {
      const data = snapshot.val();
      if (data) {
        const list: Vehicle[] = Object.entries(data)
          .map(([id, v]) => ({
            id,
            brand: v.brand || "",
            model: v.model || "",
            year: v.year || 0,
            mileage: v.mileage ?? 0,
            fuel_type: v.fuel_type || "",
            transmission: v.transmission || "",
            wilaya: v.wilaya || "",
            phone: v.phone || "",
            sellerPhone: v.sellerPhone || "",
            sellerId: v.sellerId || "",
            images: v.images || [],
            video_url: v.video_url || null,
            price_type: v.price_type || "fixed",
            fixed_price: v.fixed_price ?? null,
            starting_price: v.starting_price ?? null,
            current_highest_bid: v.current_highest_bid ?? null,
            auction_ends_at: v.auction_ends_at ?? null,
            status: v.status || "active",
            created_at: v.created_at || "",
            previous_price: v.previous_price ?? null,
          }))
          .filter((v) => v.status === "active" || v.status === "sold");
        setVehicles(list);
      } else {
        setVehicles([]);
      }
      setLoading(false);
    };
    onValue(vehiclesRef, handleSnapshot);
    return () => off(vehiclesRef);
  }, []);

  useEffect(() => {
    const usersRef = ref(realtimeDb, "users");
    const handleSnapshot = (snapshot: { val: () => Record<string, any> | null }) => {
      const data = snapshot.val();
      if (!data) {
        setShowrooms([]);
        return;
      }
      const list: Showroom[] = Object.entries(data)
        .map(([phone, u]) => ({
          phone,
          first_name: u.first_name || "",
          last_name: u.last_name || "",
          showroom_name: u.showroom_name || "",
          wilaya: u.wilaya || "",
          bio: u.bio,
          showroom_logo: u.showroom_logo,
          subscription_status: u.subscription_status || "trial",
        }))
        .filter((u) => u.showroom_name && u.showroom_name.length > 0);
      setShowrooms(list);
    };
    onValue(usersRef, handleSnapshot);
    return () => off(usersRef);
  }, []);

  const loadFavorites = useCallback(async () => {
    const client = getSupabase();
    if (!client || !userId) return;
    const { data } = await client.from("vehicle_favorites").select("vehicle_id").eq("user_id", userId);
    if (!data) return;
    const map: FavoriteData = {};
    for (const row of data) map[row.vehicle_id] = true;
    setFavorites(map);
  }, [userId]);

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

  const loadViews = useCallback(async () => {
    const client = getSupabase();
    if (!client) return;
    const { data } = await client.from("vehicle_views").select("vehicle_id");
    if (!data) return;
    const map: ViewData = {};
    for (const row of data) {
      map[row.vehicle_id] = (map[row.vehicle_id] ?? 0) + 1;
    }
    setViewData(map);
  }, []);

  useEffect(() => {
    loadFavorites();
    loadLikes();
    loadViews();
  }, [loadFavorites, loadLikes, loadViews]);

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
      setLikeData(prev => ({ ...prev, [vehicleId]: { count: current.count, liked: current.liked } }));
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

  const applyPreset = (preset: typeof BUDGET_PRESETS[0] | null, idx: number) => {
    if (preset === null) {
      setActivePreset(null);
      setBudgetMin(0);
      setBudgetMax(10000);
    } else {
      setActivePreset(idx);
      setBudgetMin(preset.min);
      setBudgetMax(preset.max);
    }
  };

  // Suggestions based on query
  const suggestions = useMemo(() => {
    if (!query || query.length < 2) return [];
    if (searchTab === "vehicles") {
      const brandMatches = BRANDS.filter(b => b.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
      const modelMatches = vehicles
        .filter(v => `${v.brand} ${v.model}`.toLowerCase().includes(query.toLowerCase()))
        .map(v => `${v.brand} ${v.model}`)
        .filter((val, idx, arr) => arr.indexOf(val) === idx)
        .slice(0, 5);
      return [...brandMatches, ...modelMatches];
    } else {
      return showrooms
        .filter(s => s.showroom_name.toLowerCase().includes(query.toLowerCase()))
        .map(s => s.showroom_name)
        .slice(0, 5);
    }
  }, [query, searchTab, vehicles, showrooms]);

  const filteredVehicles = useMemo(() => {
    const minDZD = millionCentimesToDZD(budgetMin);
    const maxDZD = millionCentimesToDZD(budgetMax);

    return vehicles.filter((v) => {
      if (wilaya !== "all" && v.wilaya !== wilaya) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!`${v.brand} ${v.model}`.toLowerCase().includes(q)) return false;
      }
      const price = priceOf(v);
      if (budgetMin > 0 && price < minDZD) return false;
      if (budgetMax < 10000 && price > maxDZD) return false;
      return true;
    });
    // Randomized order instead of newest-first
    const seed = list.map((v) => v.id).sort().join(",");
    return seededShuffle(list, seed);
  }, [vehicles, query, wilaya, budgetMin, budgetMax]);

  const filteredShowrooms = useMemo(() => {
    return showrooms.filter((s) => {
      if (wilaya !== "all" && s.wilaya !== wilaya) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!s.showroom_name.toLowerCase().includes(q) &&
            !s.wilaya.toLowerCase().includes(q) &&
            !`${s.first_name} ${s.last_name}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [showrooms, query, wilaya]);

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_-10%,rgba(212,175,55,0.15),transparent_55%),radial-gradient(circle_at_90%_30%,rgba(212,175,55,0.06),transparent_55%)]" />

      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
        {/* Title */}
        <div className="mb-5 sm:mb-6">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Discovery Hub
          </div>
          <h1 className="font-display text-3xl sm:text-4xl leading-tight">
            Find your next <span className="gold-text">premium vehicle</span>
          </h1>
        </div>

        {/* Unified Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search vehicles, brands, or showrooms..."
            className="pl-12 h-12 bg-charcoal border-gold/30 text-base"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {suggestions.length > 0 && query.length >= 2 && (
            <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-charcoal border border-gold/30 rounded-lg shadow-xl overflow-hidden">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gold-soft transition flex items-center gap-2"
                >
                  <Search className="h-3.5 w-3.5 text-gold/50" />
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Toggle Tabs */}
        <Tabs value={searchTab} onValueChange={(v) => setSearchTab(v as "vehicles" | "showrooms")}>
          <TabsList className="mb-3">
            <TabsTrigger value="vehicles"><Car className="h-4 w-4 mr-1.5" />Vehicles</TabsTrigger>
            <TabsTrigger value="showrooms"><Store className="h-4 w-4 mr-1.5" />Showrooms</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Wilaya Filter */}
        <div className="mb-4">
          <Select value={wilaya} onValueChange={setWilaya}>
            <SelectTrigger className="h-11 bg-charcoal border-gold/30 hover:border-gold/60 transition-colors w-full sm:w-80">
              <MapPin className="h-4 w-4 text-gold mr-2 shrink-0" />
              <SelectValue placeholder="Select Wilaya" />
            </SelectTrigger>
            <SelectContent className="max-h-80 bg-charcoal border-gold/30">
              <SelectItem value="all" className="focus:bg-gold-soft">All Wilayas</SelectItem>
              {WILAYAS.map((w, i) => (
                <SelectItem key={w} value={w} className="focus:bg-gold-soft focus:text-foreground">
                  <span className="text-gold/70 mr-2 text-xs tabular-nums">{String(i+1).padStart(2,"0")}</span>{w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Budget Filter (vehicles only) */}
        {searchTab === "vehicles" && (
          <div className="mb-6 premium-card rounded-xl p-4 border border-gold/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs uppercase tracking-widest text-gold">Budget Range</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {formatDZD(millionCentimesToDZD(budgetMin))} — {budgetMax >= 10000 ? "∞" : formatDZD(millionCentimesToDZD(budgetMax))}
              </span>
            </div>

            {/* Preset chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => applyPreset(null, -1)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${activePreset === null ? "bg-gold text-gold-foreground border-gold" : "border-gold/30 text-muted-foreground hover:border-gold/60"}`}
              >
                All
              </button>
              {BUDGET_PRESETS.map((p, idx) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p, idx)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${activePreset === idx ? "bg-gold text-gold-foreground border-gold" : "border-gold/30 text-muted-foreground hover:border-gold/60"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Dual numeric inputs */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Min (Million)</label>
                <Input
                  type="number"
                  value={budgetMin || ""}
                  onChange={(e) => { setBudgetMin(Number(e.target.value) || 0); setActivePreset(null); }}
                  placeholder="0"
                  className="bg-charcoal h-9 mt-1"
                />
              </div>
              <span className="text-muted-foreground mt-4">—</span>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Max (Million)</label>
                <Input
                  type="number"
                  value={budgetMax >= 10000 ? "" : budgetMax}
                  onChange={(e) => { setBudgetMax(Number(e.target.value) || 10000); setActivePreset(null); }}
                  placeholder="No limit"
                  className="bg-charcoal h-9 mt-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-charcoal rounded-xl h-48 sm:h-56" />
            ))}
          </div>
        ) : searchTab === "vehicles" ? (
          filteredVehicles.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Car className="h-12 w-12 mx-auto mb-3 text-gold/30" />
              <p>No vehicles found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredVehicles.map((v) => (
                <DiscoveryVehicleCard
                  key={v.id}
                  vehicle={v}
                  allVehicles={vehicles}
                  isFavorite={favorites[v.id] ?? false}
                  likeInfo={likeData[v.id]}
                  viewCount={viewData[v.id] ?? 0}
                  onLike={() => handleLike(v.id)}
                  onFavorite={() => handleFavorite(v.id)}
                />
              ))}
            </div>
          )
        ) : filteredShowrooms.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Store className="h-12 w-12 mx-auto mb-3 text-gold/30" />
            <p>No showrooms found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredShowrooms.map((s) => (
              <Link
                key={s.phone}
                to="/seller/$id"
                params={{ id: s.phone }}
                className="premium-card rounded-xl p-5 border border-gold/20 hover:gold-border transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-xl gold-border bg-charcoal grid place-items-center shrink-0 overflow-hidden">
                    {s.showroom_logo ? (
                      <img src={s.showroom_logo} alt={s.showroom_name} className="h-full w-full object-cover" />
                    ) : (
                      <Store className="h-6 w-6 text-gold" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-lg gold-text truncate">{s.showroom_name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{s.wilaya || "Algeria"}
                    </div>
                  </div>
                </div>
                {s.bio && <p className="text-xs text-muted-foreground line-clamp-2">{s.bio}</p>}
                <div className="mt-3 text-xs text-gold font-semibold opacity-0 group-hover:opacity-100 transition">View Showroom →</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DiscoveryVehicleCard({ vehicle: v, allVehicles, isFavorite, likeInfo, viewCount, onLike, onFavorite }: {
  vehicle: Vehicle;
  allVehicles: Vehicle[];
  isFavorite: boolean;
  likeInfo?: { count: number; liked: boolean };
  viewCount: number;
  onLike: () => void;
  onFavorite: () => void;
}) {
  const imageUrl = v.images?.[0] || "/my-logo.png.PNG";
  const price = priceOf(v);
  const deal = calculateDeal(price, v.brand, v.model, v.year, allVehicles);
  const hasPriceDrop = v.previous_price && v.previous_price > price;
  const savings = hasPriceDrop ? (v.previous_price! - price) : 0;
  const likeCount = likeInfo?.count ?? 0;
  const liked = likeInfo?.liked ?? false;

  return (
    <Link
      to="/vehicle/$id"
      params={{ id: v.id }}
      className="group premium-card rounded-xl overflow-hidden border border-gold/20 block relative"
    >
      {v.status === "sold" && (
        <div className="absolute inset-0 grid place-items-center bg-black/55 z-10 pointer-events-none">
          <div className="rotate-[-12deg] border-2 border-gold bg-gold/20 px-4 py-1 rounded gold-glow">
            <div className="font-display text-lg gold-shine font-bold">SOLD</div>
          </div>
        </div>
      )}

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

        {/* Favorite heart */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFavorite(); }}
          className="absolute top-2 right-2 z-10"
          aria-label="Save"
        >
          <Heart className={`h-5 w-5 ${isFavorite ? "text-red-500 fill-red-500" : "text-white/80"} drop-shadow-lg`} />
        </button>
      </div>

      <div className="p-2.5 sm:p-3">
        <div className="font-medium text-xs sm:text-sm mb-1 truncate">{v.brand} {v.model} ({v.year})</div>
        <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
          <MapPin className="h-3 w-3 shrink-0" />{v.wilaya}
        </div>

        {/* Deal badge */}
        {deal && (
          <div className="mb-2">
            <div className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full border ${deal.badgeClass}`} title={deal.tooltip}>
              {deal.rating === "great" && <Star className="h-2.5 w-2.5" />}
              {deal.label} · {deal.labelAr}
            </div>
          </div>
        )}

        {/* Price with drop indicator */}
        <div className="flex items-center gap-2">
          {hasPriceDrop ? (
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground line-through">{formatDZD(v.previous_price)}</span>
              <span className="text-gold font-display text-sm sm:text-base">{formatDZD(price)}</span>
              <span className="text-[9px] text-green-400 flex items-center gap-0.5">
                <TrendingDown className="h-2.5 w-2.5" /> Save {formatDZD(savings)}
              </span>
            </div>
          ) : (
            <span className="text-gold font-display text-sm sm:text-base">{formatDZD(price)}</span>
          )}
          <span className="text-[9px] text-muted-foreground mr-auto">{formatDZDArabic(price)}</span>
        </div>

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
            <span className="text-[10px] text-muted-foreground">{viewCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
