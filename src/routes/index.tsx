import { createFileRoute, Link } from "@tanstack/react-router";
import { Component, useState, useMemo, useEffect, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import { ref, get, set, remove, onValue, off } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { WILAYAS, BRANDS } from "@/lib/wilayas";
import { formatDZD, formatDZDArabic } from "@/lib/format";
import { calculateDeal } from "@/lib/pricing";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, MapPin, Play, Grid3x2 as Grid3X3, Film, Heart, Eye, Star, TrendingDown, Bookmark, Pin, Bell, MessageCircle } from "lucide-react";
import { Countdown } from "@/components/Countdown";
import { compareStore, useCompare } from "@/lib/compare";
import { useAuth } from "@/hooks/use-auth";
import { StoriesStrip } from "@/components/StoriesStrip";
import { getSupabase } from "@/lib/supabase";
import { supabaseSucceeded } from "@/lib/listing-interactions";
import { toast } from "sonner";
import { demoKeys, useDemoCounterMap, useDemoSet } from "@/lib/demo-state";

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
  pinned?: boolean;
  condition?: string;
  documents_status?: string;
  original_color?: string;
  paint_condition?: string;
  inquiry_count?: number;
  views?: number;
};

type LikeData = Record<string, { count: number; liked: boolean }>;
type FavoriteData = Record<string, boolean>;
type ViewData = Record<string, number>;

type MaybeVehicle = Vehicle | null | undefined;
type FeedComment = { id: string; text: string; authorId: string; createdAt: string };

function isValidVehicle(value: MaybeVehicle): value is Vehicle {
  return Boolean(value && typeof value === "object" && typeof value.id === "string" && value.id.length > 0);
}

function priceOf(v: Vehicle): number {
  return v.price_type === "fixed" ? (v.fixed_price ?? 0) : (v.current_highest_bid ?? v.starting_price ?? 0);
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

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

class VehicleRenderBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[v0] Skipping corrupted vehicle card", error);
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

type HomeErrorBoundaryState = {
  error: Error | null;
};

class HomeErrorBoundary extends Component<{ children: (retryKey: number) => ReactNode }, HomeErrorBoundaryState & { retryKey: number }> {
  state: HomeErrorBoundaryState & { retryKey: number } = { error: null, retryKey: 0 };

  static getDerivedStateFromError(error: Error): HomeErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("EXACT RUNTIME ERROR:", error);
  }

  render() {
    if (!this.state.error) return this.props.children(this.state.retryKey);

    return (
      <main className="min-h-screen bg-background px-4 py-10 text-foreground">
        <section className="mx-auto max-w-md rounded-xl border border-red-500/30 bg-charcoal p-6 text-center shadow-lg sm:p-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-400">GRAND Auto Luxe</p>
          <h1 className="mb-3 text-2xl font-bold text-foreground">حدث خطأ مؤقت</h1>
          <p className="mb-6 text-sm text-muted-foreground">تعذر تحميل الصفحة. حاول مرة أخرى.</p>
          <div className="flex justify-center gap-3">
            <button type="button" onClick={() => this.setState((state) => ({ error: null, retryKey: state.retryKey + 1 }))} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">إعادة المحاولة</button>
            <a href="/" className="rounded-md border border-input px-4 py-2 text-sm font-medium">الرئيسية</a>
          </div>
        </section>
      </main>
    );
  }
}

function Home() {
  return (
    <HomeErrorBoundary>
      {(retryKey) => <HomeContent key={retryKey} />}
    </HomeErrorBoundary>
  );
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
  const safeVehicle = isValidVehicle(v) ? v : null;
  const safeVehicles = (Array.isArray(allVehicles) ? allVehicles : []).filter(isValidVehicle);
  if (!safeVehicle) return null;
  const deal = calculateDeal(priceOf(safeVehicle), safeVehicle.brand, safeVehicle.model, safeVehicle.year, safeVehicles);
  if (!deal) return null;
  return (
    <div className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full border ${deal.badgeClass}`} title={deal.tooltip}>
      {deal.rating === "great" && <Star className="h-2.5 w-2.5" />}
      {deal.label}
    </div>
  );
}

function PriceDropTag({ vehicle: v }: { vehicle: Vehicle }) {
  if (!isValidVehicle(v)) return null;
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

function HomeContent() {
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
  const [vehiclesError, setVehiclesError] = useState(false);
  const [vehiclesRetryKey, setVehiclesRetryKey] = useState(0);
  const auth = useAuth();
  const [guestId] = useState(() => {
    if (typeof window === "undefined") return "guest-preview";
    const key = "grand-auto-luxe-guest-id";
    try {
      const existing = window.localStorage.getItem(key);
      if (existing) return existing;
      const created = `guest-${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`}`;
      window.localStorage.setItem(key, created);
      return created;
    } catch {
      return `guest-${Date.now()}-${Math.random()}`;
    }
  });
  const userId = auth?.user?.id ?? auth?.user?.phone ?? guestId;
  const [likeData, setLikeData] = useState<LikeData>({});
  const [favorites, setFavorites] = useState<FavoriteData>({});
  const [viewData, setViewData] = useState<ViewData>({});
  const [localLikes, setLocalLikes] = useDemoCounterMap(demoKeys.likes);
  const [localLiked, setLocalLiked] = useState<Record<string, boolean>>({});
  const [localSaved, toggleLocalSaved] = useDemoSet(demoKeys.saved);
  const [localViews, incrementLocalView] = useDemoCounterMap(demoKeys.views);
  const [localPinned] = useDemoSet(demoKeys.pinned);
  const [localAlerts, toggleLocalAlert] = useDemoSet(demoKeys.alerts);
  const [commentVehicleId, setCommentVehicleId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Record<string, FeedComment[]>>({});
  const shuffleSeed = useRef<string>("");

  useEffect(() => {

    const handleSnapshot = (snapshot: { exists?: () => boolean; val: () => unknown }) => {
      try {
        if (snapshot.exists && !snapshot.exists()) {
          setVehicles([]);
          setVehiclesError(false);
          return;
        }

        const data = snapshot.val();
        if (!data || typeof data !== "object" || Array.isArray(data)) {
          setVehicles([]);
          return;
        }

        const list: Vehicle[] = Object.entries(data)
          .filter(([, raw]) => Boolean(raw && typeof raw === "object"))
          .map(([id, raw]) => {
            if (!raw || typeof raw !== "object") return null;
            const v = raw as Record<string, unknown>;
            const images = Array.isArray(v.images)
              ? v.images.filter((image): image is string => typeof image === "string" && image.length > 0)
              : [];
            const videoUrl = typeof v.video_url === "string" && v.video_url.length > 0 ? v.video_url : null;
            return {
              id,
              brand: typeof v.brand === "string" ? v.brand : "Unknown",
              model: typeof v.model === "string" ? v.model : "Vehicle",
              year: Number.isFinite(Number(v.year)) ? Number(v.year) : 0,
              mileage: Number.isFinite(Number(v.mileage)) ? Number(v.mileage) : 0,
              fuel_type: typeof v.fuel_type === "string" ? v.fuel_type : "Unknown",
              transmission: typeof v.transmission === "string" ? v.transmission : "Unknown",
              wilaya: typeof v.wilaya === "string" ? v.wilaya : "Algeria",
              phone: typeof v.phone === "string" ? v.phone : "",
              images,
              video_url: videoUrl,
              price_type: v.price_type === "auction" ? "auction" : "fixed",
              fixed_price: Number.isFinite(Number(v.fixed_price)) ? Number(v.fixed_price) : null,
              starting_price: Number.isFinite(Number(v.starting_price)) ? Number(v.starting_price) : null,
              current_highest_bid: Number.isFinite(Number(v.current_highest_bid)) ? Number(v.current_highest_bid) : null,
              auction_ends_at: typeof v.auction_ends_at === "string" ? v.auction_ends_at : null,
              status: typeof v.status === "string" ? v.status : "active",
              created_at: typeof v.created_at === "string" ? v.created_at : new Date().toISOString(),
              previous_price: Number.isFinite(Number(v.previous_price)) ? Number(v.previous_price) : null,
              pinned: v.pinned === true || localPinned.has(id),
              condition: typeof v.condition === "string" ? v.condition : undefined,
              documents_status: typeof v.documents_status === "string" ? v.documents_status : undefined,
              original_color: typeof v.original_color === "string" ? v.original_color : undefined,
              paint_condition: typeof v.paint_condition === "string" ? v.paint_condition : undefined,
              inquiry_count: Number(v.inquiry_count) || 0,
              views: Number(v.views) || 0,
            } satisfies Vehicle;
          })
          .filter((vehicle): vehicle is Vehicle => vehicle !== null && (vehicle.status === "active" || vehicle.status === "sold"));

        setVehiclesError(false);
        setVehicles(list);
      } catch (error) {
        console.error("[v0] Failed to sanitize Firebase vehicles", error);
        setVehiclesError(true);
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    if (!realtimeDb) {
      setVehicles([]);
      setLoading(false);
      return;
    }

    let firebaseVehiclesRef: ReturnType<typeof ref> | null = null;
    try {
      firebaseVehiclesRef = ref(realtimeDb, "vehicles");
      onValue(firebaseVehiclesRef, handleSnapshot, (error) => {
        console.warn("[v0] Firebase vehicles unavailable", error.message);
        setVehiclesError(false);
        setVehicles([]);
        setLoading(false);
      });
    } catch (error) {
      console.error("[v0] Failed to subscribe to Firebase vehicles", error);
      setVehicles([]);
      setLoading(false);
    }

    return () => {
      try {
        if (firebaseVehiclesRef) off(firebaseVehiclesRef);
      } catch (error) {
        console.error("[v0] Failed to clean up Firebase vehicle listener", error);
      }
    };
  }, [vehiclesRetryKey]);

  const loadLikes = useCallback(async () => {
    if (!realtimeDb) return;
    try {
      const snapshot = await get(ref(realtimeDb, "vehicleLikes"));
      const raw = snapshot.val();
      if (!raw || typeof raw !== "object") return;
      const map: LikeData = {};
    for (const [vehicleId, users] of Object.entries(raw as Record<string, unknown>)) {
      if (!vehicleId || !users || typeof users !== "object") continue;
      const userIds = Object.keys(users as Record<string, unknown>);
      map[vehicleId] = { count: userIds.length, liked: userIds.includes(userId) };
    }
      setLikeData(map);
    } catch (error) {
      console.warn("[v0] Likes unavailable", error);
      setLikeData({});
    }
  }, [userId]);

  const loadFavorites = useCallback(async () => {
    const client = getSupabase();
    if (!client || !userId) {
      if (typeof window !== "undefined") {
        try {
          const saved = JSON.parse(window.localStorage.getItem("grand-auto-luxe-saved") || "[]") as unknown;
          const map: FavoriteData = {};
          if (Array.isArray(saved)) saved.forEach((id) => { if (typeof id === "string") map[id] = true; });
          setFavorites(map);
        } catch {
          setFavorites({});
        }
      }
      return;
    }
    try {
      const { data } = await client.from("vehicle_favorites").select("vehicle_id").eq("user_id", userId).throwOnError();
      if (!Array.isArray(data)) return;
    const map: FavoriteData = {};
    for (const row of data) {
      if (row && typeof row.vehicle_id === "string") map[row.vehicle_id] = true;
    }
      setFavorites(map);
    } catch (error) {
      console.warn("[v0] Favorites unavailable", error);
      setFavorites({});
    }
  }, [userId]);

  const loadViews = useCallback(async () => {
    const client = getSupabase();
    if (!client) return;
    try {
      const { data } = await client.from("vehicle_views").select("vehicle_id").throwOnError();
      if (!Array.isArray(data)) return;
      const map: ViewData = {};
    for (const row of data) {
      if (!row || typeof row.vehicle_id !== "string") continue;
      map[row.vehicle_id] = (map[row.vehicle_id] ?? 0) + 1;
    }
      setViewData(map);
    } catch (error) {
      console.warn("[v0] Views unavailable", error);
      setViewData({});
    }
  }, []);

  useEffect(() => {
    void Promise.allSettled([loadLikes(), loadFavorites(), loadViews()]).catch(() => undefined);
    try {
      const stored = JSON.parse(window.localStorage.getItem("grand-auto-luxe-liked") || "{}") as unknown;
      if (stored && typeof stored === "object" && !Array.isArray(stored)) setLocalLiked(stored as Record<string, boolean>);
    } catch { /* optional guest storage */ }
  }, [loadLikes, loadFavorites, loadViews]);

  const effectiveLikeData = useMemo(() => {
    const next = { ...likeData };
    Object.entries(localLikes).forEach(([id, count]) => {
      next[id] = { count: Math.max(next[id]?.count ?? 0, count), liked: localLiked[id] ?? next[id]?.liked ?? false };
    });
    return next;
  }, [likeData, localLikes, localLiked]);
  const effectiveFavorites = useMemo(() => {
    const next = { ...favorites };
    localSaved.forEach((id) => { next[id] = true; });
    return next;
  }, [favorites, localSaved]);
  const effectiveViewData = useMemo(() => ({ ...viewData, ...localViews }), [viewData, localViews]);

  const safeVehicles = useMemo(() => (Array.isArray(vehicles) ? vehicles : []).filter((vehicle): vehicle is Vehicle => Boolean(vehicle?.id)), [vehicles]);

  const filtered = useMemo(() => {
    const list = safeVehicles
      .filter((vehicle): vehicle is Vehicle => Boolean(vehicle?.id))
      .map((vehicle) => ({ ...vehicle, pinned: vehicle.pinned === true || localPinned.has(vehicle.id) }))
      .filter((vehicle): vehicle is Vehicle => {
      if (!isValidVehicle(vehicle)) return false;
      const v = vehicle;
      const brand = typeof v.brand === "string" ? v.brand : "";
      const model = typeof v.model === "string" ? v.model : "";
      const fuel = typeof v.fuel_type === "string" ? v.fuel_type : "";
      const transmission = typeof v.transmission === "string" ? v.transmission : "";
      const wilaya = typeof v.wilaya === "string" ? v.wilaya : "";
      const query = typeof filters.q === "string" ? filters.q.trim().toLowerCase() : "";
      if (query && !`${brand} ${model}`.toLowerCase().includes(query)) return false;
      if (filters.brand !== "all" && brand !== filters.brand) return false;
      if (filters.fuel !== "all" && fuel !== filters.fuel) return false;
      if (filters.trans !== "all" && transmission !== filters.trans) return false;
      if (filters.wilaya !== "all" && wilaya !== filters.wilaya) return false;
      if (filters.year && Number.isFinite(Number(filters.year)) && v.year !== Number(filters.year)) return false;
      const price = Number.isFinite(priceOf(v)) ? priceOf(v) : 0;
      if (filters.min && price < Number(filters.min)) return false;
      if (filters.max && price > Number(filters.max)) return false;
      return true;
    });

    if (filters.sort === "price_asc") list.sort((a, b) => priceOf(a) - priceOf(b));
    else if (filters.sort === "price_desc") list.sort((a, b) => priceOf(b) - priceOf(a));
    else if (filters.sort === "year_desc") list.sort((a, b) => b.year - a.year);
    else {
      // Default: pinned first, then randomized with a stable seed
      const pinned = list.filter((v) => v.pinned);
      const nonPinned = list.filter((v) => !v.pinned);

      // Generate one random seed per vehicle-set change so the initial feed is shuffled
      // without reshuffling on every render caused by filters or engagement updates.
      const vehicleSetKey = nonPinned.map((vehicle) => vehicle.id).sort().join(",");
      if (!shuffleSeed.current.startsWith(`${vehicleSetKey}:`)) {
        shuffleSeed.current = `${vehicleSetKey}:${Math.random()}`;
      }

      const shuffled = seededShuffle(nonPinned, shuffleSeed.current);
      return [...pinned, ...shuffled];
    }

    return list;
  }, [safeVehicles, filters, localPinned]);

  const reelsVehicles = (Array.isArray(filtered) ? filtered : [])
    .filter(isValidVehicle)
    .filter((vehicle) => typeof vehicle.video_url === "string" && vehicle.video_url.length > 0);

  const openComments = useCallback((item: Vehicle | null | undefined) => {
    if (!item?.id) return;
    const vehicleId = item.id;
    setCommentVehicleId(vehicleId);
    setCommentText("");
    try {
      const stored = JSON.parse(window.localStorage.getItem(`grand-auto-luxe-comments-${vehicleId}`) || "[]") as unknown;
      const safeComments: FeedComment[] = Array.isArray(stored)
        ? stored.filter((item): item is FeedComment => Boolean(item && typeof item === "object" && typeof (item as FeedComment).id === "string" && typeof (item as FeedComment).text === "string" && typeof (item as FeedComment).authorId === "string" && typeof (item as FeedComment).createdAt === "string"))
        : [];
      setComments((current) => ({ ...current, [vehicleId]: safeComments }));
    } catch { setComments((current) => ({ ...current, [vehicleId]: [] })); }
  }, []);

  const submitFeedComment = useCallback(() => {
    if (!commentVehicleId || !commentText.trim()) return;
    const next = [...(comments[commentVehicleId] ?? []), { id: `${Date.now()}-${Math.random()}`, text: commentText.trim(), authorId: userId, createdAt: new Date().toISOString() }];
    setComments((current) => ({ ...current, [commentVehicleId]: next }));
    setCommentText("");
    try { window.localStorage.setItem(`grand-auto-luxe-comments-${commentVehicleId}`, JSON.stringify(next)); } catch { /* optional storage */ }
  }, [commentText, commentVehicleId, comments]);

  const handleView = useCallback(async (item: Vehicle | null | undefined) => {
    if (!item?.id) return;
    const vehicleId = item.id;
    setViewData((previous) => ({ ...previous, [vehicleId]: (previous[vehicleId] ?? localViews[vehicleId] ?? 0) + 1 }));
    incrementLocalView(vehicleId);
    const client = getSupabase();
    if (!client) return;
    try {
      const result = await client.from("vehicle_views").insert({ vehicle_id: vehicleId, viewer_id: userId });
      if (!supabaseSucceeded(result)) throw result.error;
    } catch (error) {
      setViewData((previous) => ({ ...previous, [vehicleId]: Math.max(0, (previous[vehicleId] ?? 1) - 1) }));
      console.error("[v0] Failed to record vehicle view", error);
    }
  }, [userId, localViews, incrementLocalView]);

  const handleLike = useCallback(async (item: Vehicle | null | undefined) => {
    if (!item?.id) return;
    const vehicleId = item.id;
    const current = effectiveLikeData[vehicleId] ?? { count: localLikes[vehicleId] ?? 0, liked: false };
    const newLiked = !current.liked;
    setLikeData((prev) => ({ ...prev, [vehicleId]: { count: Math.max(0, current.count + (newLiked ? 1 : -1)), liked: newLiked } }));
    setLocalLikes((prev) => ({ ...prev, [vehicleId]: Math.max(0, (prev[vehicleId] ?? current.count) + (newLiked ? 1 : -1)) }));
    setLocalLiked((previous) => {
      const next = { ...previous, [vehicleId]: newLiked };
      try { window.localStorage.setItem("grand-auto-luxe-liked", JSON.stringify(next)); } catch { /* optional guest storage */ }
      return next;
    });
    if (!realtimeDb) return;

    try {
      const likeRef = ref(realtimeDb, `vehicleLikes/${vehicleId}/${userId}`);
      if (newLiked) await set(likeRef, true);
      else await remove(likeRef);
    } catch {
      setLikeData(prev => ({
        ...prev,
        [vehicleId]: { count: current.count, liked: current.liked }
      }));
      setLocalLikes((previous) => ({ ...previous, [vehicleId]: current.count }));
      setLocalLiked((previous) => ({ ...previous, [vehicleId]: current.liked }));
      toast.error("تعذر حفظ الإعجاب، حاول مرة أخرى");
    }
  }, [userId, effectiveLikeData, localLikes, setLocalLikes]);

  const handleFavorite = useCallback(async (item: Vehicle | null | undefined) => {
    if (!item?.id) return;
    const vehicleId = item.id;
    const client = getSupabase();
    if (!client) {
      const next = !effectiveFavorites[vehicleId];
      setFavorites((previous) => ({ ...previous, [vehicleId]: next }));
      toggleLocalSaved(vehicleId);
      if (typeof window !== "undefined") {
        try {
          const saved = JSON.parse(window.localStorage.getItem("grand-auto-luxe-saved") || "[]") as unknown;
          const ids = Array.isArray(saved) ? saved.filter((id): id is string => typeof id === "string") : [];
          const updated = next ? [...new Set([...ids, vehicleId])] : ids.filter((id) => id !== vehicleId);
          window.localStorage.setItem("grand-auto-luxe-saved", JSON.stringify(updated));
        } catch { /* storage is optional */ }
      }
      return;
    }
    const isFav = effectiveFavorites[vehicleId] ?? false;
    setFavorites(prev => ({ ...prev, [vehicleId]: !isFav }));
    toggleLocalSaved(vehicleId);
    if (typeof window !== "undefined") {
      const saved = JSON.parse(window.localStorage.getItem("grand-auto-luxe-saved") || "[]") as unknown;
      const ids = Array.isArray(saved) ? saved.filter((id): id is string => typeof id === "string") : [];
      window.localStorage.setItem("grand-auto-luxe-saved", JSON.stringify(!isFav ? [...new Set([...ids, vehicleId])] : ids.filter((id) => id !== vehicleId)));
    }
    try {
      const result = !isFav
        ? await client.from("vehicle_favorites").insert({ vehicle_id: vehicleId, user_id: userId })
        : await client.from("vehicle_favorites").delete().eq("vehicle_id", vehicleId).eq("user_id", userId);
      if (!supabaseSucceeded(result)) throw result.error;
    } catch {
      setFavorites(prev => ({ ...prev, [vehicleId]: isFav }));
    }
  }, [userId, effectiveFavorites, toggleLocalSaved]);

  return (
    <div>
      <VehicleRenderBoundary>
        <StoriesStrip />
      </VehicleRenderBoundary>

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
                <SelectItem value="newest">Shuffled</SelectItem>
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
        {filtered.some((vehicle) => (effectiveLikeData[vehicle.id]?.count ?? 0) >= 3 || (effectiveViewData[vehicle.id] ?? vehicle.views ?? 0) >= 10) && (
          <div className="mb-4 rounded-xl border border-gold/20 bg-gold-soft/10 px-4 py-3">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div><p className="text-[10px] uppercase tracking-[0.2em] text-gold">Popular in Algeria</p><p className="text-xs text-muted-foreground">High-interest vehicles right now</p></div>
              <TrendingDown className="h-4 w-4 text-gold rotate-180" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">{filtered.filter((vehicle) => (effectiveLikeData[vehicle.id]?.count ?? 0) >= 3 || (effectiveViewData[vehicle.id] ?? vehicle.views ?? 0) >= 10).slice(0, 4).map((vehicle) => <Link key={vehicle.id} to="/vehicle/$id" params={{ id: vehicle.id }} className="shrink-0 rounded-lg bg-charcoal px-3 py-2 text-xs hover:border-gold/40 border border-transparent">{vehicle.brand} {vehicle.model}</Link>)}</div>
          </div>
        )}
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
            ) : vehiclesError ? (
              <div className="premium-card rounded-xl p-8 text-center">
                <p className="text-muted-foreground">تعذر تحميل السيارات.</p>
                <Button variant="gold" size="sm" className="mt-4" onClick={() => { setVehiclesError(false); setLoading(true); setVehiclesRetryKey((key) => key + 1); }}>إعادة المحاولة</Button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">لا توجد سيارات منشورة حاليًا.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {(Array.isArray(filtered) ? filtered : []).filter(isValidVehicle).map((v, index) => (
                  <VehicleRenderBoundary key={v?.id ? `car-${v.id}` : `car-index-${index}`}>
                    <VehicleCard
                      vehicle={v}
                      allVehicles={safeVehicles}
                    likeInfo={v?.id ? effectiveLikeData[v.id] : undefined}
                    isFavorite={v?.id ? effectiveFavorites[v.id] ?? false : false}
                    viewCount={v?.id ? effectiveViewData[v.id] ?? 0 : 0}
                    onLike={() => handleLike(v)}
                      onFavorite={() => handleFavorite(v)}
                      onView={() => handleView(v)}
                      priceAlert={v?.id ? localAlerts.has(v.id) : false}
                      onPriceAlert={() => v?.id && toggleLocalAlert(v.id)}
                      commentCount={v?.id ? comments[v.id]?.length ?? 0 : 0}
                      onComments={() => openComments(v)}
                    />
                  </VehicleRenderBoundary>
                ))}
              </div>
            )}
          </TabsContent>

          {reelsVehicles.length > 0 && (
            <TabsContent value="reels">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {(Array.isArray(reelsVehicles) ? reelsVehicles : []).filter(isValidVehicle).map((v, index) => (
                  <VehicleRenderBoundary key={v?.id ? `car-${v.id}` : `car-index-${index}`}>
                    <VehicleReelCard
                      vehicle={v}
                      likeInfo={v?.id ? effectiveLikeData[v.id] : undefined}
                      viewCount={v?.id ? effectiveViewData[v.id] ?? 0 : 0}
                      onLike={() => handleLike(v)}
                      onView={() => handleView(v)}
                    />
                  </VehicleRenderBoundary>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </section>
      <Dialog open={Boolean(commentVehicleId)} onOpenChange={(open) => { if (!open) setCommentVehicleId(null); }}>
        <DialogContent className="max-w-md bg-background border-gold/40">
          <DialogHeader><DialogTitle>Comments</DialogTitle></DialogHeader>
          {commentVehicleId ? (
            <CommentList
              comments={comments[commentVehicleId] ?? []}
              commentText={commentText}
              onChange={setCommentText}
              onSubmit={submitFeedComment}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CommentList({ comments, commentText, onChange, onSubmit }: {
  comments: FeedComment[];
  commentText: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <>
      <div className="max-h-64 overflow-y-auto space-y-2">
        {comments.length > 0 ? comments.map((comment) => (
          <div key={comment.id} className="rounded-lg bg-charcoal px-3 py-2 text-sm">{comment.text}</div>
        )) : <p className="text-sm text-muted-foreground">No comments yet.</p>}
      </div>
      <div className="flex gap-2">
        <Input
          value={commentText}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Write a comment"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.nativeEvent.isComposing && event.keyCode !== 229) onSubmit();
          }}
        />
        <Button type="button" variant="gold" disabled={!commentText.trim()} onClick={onSubmit}>Post</Button>
      </div>
    </>
  );
}

function VehicleCard({ vehicle: v, allVehicles, likeInfo, isFavorite, viewCount, onLike, onFavorite, onView, priceAlert, onPriceAlert, commentCount, onComments }: {
  vehicle: Vehicle | null | undefined;
  allVehicles: Vehicle[];
  likeInfo?: { count: number; liked: boolean };
  isFavorite: boolean;
  viewCount: number;
  onLike: () => void;
  onFavorite: () => void;
  onView: () => void;
  priceAlert: boolean;
  onPriceAlert: () => void;
  commentCount: number;
  onComments: () => void;
}) {
  if (!v?.id) return null;
  const fallbackImage = "/my-logo.png.PNG";
  const imageUrl = Array.isArray(v?.images) && typeof v.images[0] === "string" && v.images[0].length > 0 ? v.images[0] : fallbackImage;
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
      onClick={onView}
  >
      {v.status === "sold" && <SoldOverlay />}

      <div className="relative aspect-[4/3] overflow-hidden bg-charcoal">
        <img
          src={imageUrl}
          alt={`${v.brand} ${v.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(event) => {
            if (event.currentTarget.src.endsWith(fallbackImage)) return;
            event.currentTarget.src = fallbackImage;
          }}
        />
        {v.pinned && (
          <div className="absolute top-2 left-2 bg-gold text-gold-foreground text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 z-10">
            <Pin className="h-2.5 w-2.5" /> Pinned
          </div>
        )}
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
          <div className="mb-1.5 flex items-center justify-between gap-1">
            <PriceDropTag vehicle={v} />
            <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); onPriceAlert(); }} className={`inline-flex items-center gap-1 text-[9px] ${priceAlert ? "text-gold" : "text-muted-foreground"}`} aria-label="Watch price"><Bell className={`h-3 w-3 ${priceAlert ? "fill-gold" : ""}`} />{priceAlert ? "Watching" : "Alert"}</button>
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
            <span className="text-[10px] text-muted-foreground">{viewCount || 0}</span>
          </div>
          <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); onComments(); }} className="flex items-center gap-1 text-muted-foreground hover:text-gold" aria-label="Comments">
            <MessageCircle className="h-4 w-4" /><span className="text-[10px]">{commentCount || 0}</span>
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (compare.includes(v.id) || compareStore.canAdd()) compareStore.toggle(v.id); }}
            className={`ml-auto w-5 h-5 rounded-md border flex items-center justify-center transition ${
              compare.includes(v.id) ? "bg-gold border-gold" : compareStore.canAdd() ? "border-gold/40 hover:border-gold" : "border-muted/30 opacity-40 cursor-not-allowed"
            }`}
            title={compare.includes(v.id) ? "Remove from compare" : compareStore.canAdd() ? "Add to compare" : "Compare is full (4/4)"}
          >
            {compare.includes(v.id) && <span className="text-black text-[8px] font-bold">✓</span>}
          </button>
        </div>
      </div>
    </Link>
  );
}

function VehicleReelCard({ vehicle: v, likeInfo, viewCount, onLike, onView }: {
  vehicle: Vehicle | null | undefined;
  likeInfo?: { count: number; liked: boolean };
  viewCount: number;
  onLike: () => void;
  onView: () => void;
}) {
  if (!v?.id) return null;
  const likeCount = likeInfo?.count ?? 0;
  const liked = likeInfo?.liked ?? false;
  const price = priceOf(v);
  const videoUrl = typeof v?.video_url === "string" && v.video_url.length > 0 ? v.video_url : null;
  const imageUrl = Array.isArray(v?.images) && typeof v.images[0] === "string" && v.images[0].length > 0 ? v.images[0] : "/my-logo.png.PNG";

  return (
    <Link
      to="/vehicle/$id"
      params={{ id: v.id }}
      className="group rounded-xl overflow-hidden border border-gold/20 block relative aspect-[9/16] bg-charcoal"
      onClick={onView}
  >
      {videoUrl ? (
        <video
          src={videoUrl}
          poster={imageUrl}
          className="w-full h-full object-cover"
          muted
          loop
          playsInline
          preload="metadata"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
          onMouseOver={(event) => { void event.currentTarget.play().catch(() => undefined); }}
          onMouseOut={(event) => event.currentTarget.pause()}
        />
      ) : (
        <img
          src={imageUrl}
          alt={`${v.brand} ${v.model}`}
          className="w-full h-full object-cover"
          onError={(event) => {
            const image = event.currentTarget;
            if (image.dataset.fallbackApplied === "true") return;
            image.dataset.fallbackApplied = "true";
            image.src = "/my-logo.png.PNG";
          }}
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
            <span className="text-[10px] text-white/80">{viewCount}</span>
          </div>
        </div>
      </div>

      {v.status === "sold" && <SoldOverlay />}
    </Link>
  );
}
