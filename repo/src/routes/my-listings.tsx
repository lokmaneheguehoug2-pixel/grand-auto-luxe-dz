import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDZD } from "@/lib/format";
import { MoveVertical as MoreVertical, CreditCard as Edit3, Trash2, CircleCheck as CheckCircle2, RotateCcw, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { ref, onValue, off, set, remove } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

export const Route = createFileRoute("/my-listings")({
  head: () => ({ meta: [{ title: "My Listings · GRAND Auto Luxe" }] }),
  component: MyListingsPage,
});

type Listing = {
  id: string;
  brand: string;
  model: string;
  year: number;
  wilaya: string;
  images: string[];
  price_type: "fixed" | "auction";
  fixed_price: number | null;
  starting_price: number | null;
  current_highest_bid: number | null;
  status: "pending" | "active" | "sold" | "rejected";
  created_at: string;
};

function MyListingsPage() {
  const auth = useAuth();
  const user = auth?.user;
  const loading = auth?.loading ?? true;

  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const vehiclesRef = ref(realtimeDb, "vehicles");

    const handleSnapshot = (snapshot: { val: () => Record<string, any> | null }) => {
      const data = snapshot.val();
      if (data) {
        const myListings = Object.entries(data)
          .map(([id, v]) => ({
            id,
            brand: v.brand,
            model: v.model,
            year: v.year,
            wilaya: v.wilaya,
            images: v.images || [],
            price_type: v.price_type,
            fixed_price: v.fixed_price,
            starting_price: v.starting_price,
            current_highest_bid: v.current_highest_bid,
            status: v.status,
            created_at: v.created_at,
          }))
          .filter((v) => {
            // Check if sellerId or sellerPhone matches user
            const vehicleData = data[v.id];
            return vehicleData.sellerId === user.id ||
                   vehicleData.sellerPhone === user.phone ||
                   vehicleData.seller_id === user.id;
          })
          .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        setListings(myListings);
      } else {
        setListings([]);
      }
      setIsLoading(false);
    };

    onValue(vehiclesRef, handleSnapshot);
    return () => off(vehiclesRef);
  }, [user]);

  if (loading) return <div className="py-24 text-center text-muted-foreground">Loading…</div>;
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h2 className="font-display text-2xl mb-2">Sign in to manage your listings</h2>
        <Button asChild variant="gold" className="mt-4">
          <Link to="/auth">Sign in</Link>
        </Button>
      </div>
    );
  }

  const markSold = async (id: string) => {
    try {
      await set(ref(realtimeDb, `vehicles/${id}/status`), "sold");
      toast.success("Marked as sold");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to update listing");
    }
  };

  const markActive = async (id: string) => {
    try {
      await set(ref(realtimeDb, `vehicles/${id}/status`), "active");
      toast.success("Re-listed");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to update listing");
    }
  };

  const removeListing = async (id: string) => {
    if (!confirm("Delete this listing permanently?")) return;
    try {
      await remove(ref(realtimeDb, `vehicles/${id}`));
      toast.success("Listing deleted");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to delete listing");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-1">Seller Dashboard</div>
          <h1 className="font-display text-3xl">My Listings</h1>
        </div>
        <Button asChild variant="gold">
          <Link to="/post">
            <Plus className="h-4 w-4" /> New Listing
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="premium-card rounded-xl aspect-[4/5] animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="premium-card rounded-2xl p-12 text-center text-muted-foreground">
          You have no listings yet.{" "}
          <Link to="/post" className="text-gold underline ml-1">
            List your first vehicle
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((v) => (
            <OwnerCard
              key={v.id}
              v={v}
              onSold={() => markSold(v.id)}
              onActivate={() => markActive(v.id)}
              onDelete={() => removeListing(v.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OwnerCard({
  v,
  onSold,
  onActivate,
  onDelete,
}: {
  v: Listing;
  onSold: () => void;
  onActivate: () => void;
  onDelete: () => void;
}) {
  const coverUrl = v.images?.[0] || "/my-logo.png.PNG";
  const price = v.price_type === "fixed" ? v.fixed_price : v.current_highest_bid ?? v.starting_price;
  const sold = v.status === "sold";
  const pending = v.status === "pending";

  return (
    <div className="group premium-card rounded-xl overflow-hidden relative">
      <Link
        to="/vehicle/$id"
        params={{ id: v.id }}
        className="block aspect-[4/3] bg-charcoal relative overflow-hidden"
      >
        <img
          src={coverUrl}
          alt={`${v.brand} ${v.model}`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {sold && <SoldOverlay />}
        {pending && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
            Pending Review
          </div>
        )}
      </Link>

      <div className="absolute top-2.5 right-2.5 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80"
            >
              <MoreVertical className="h-4 w-4 text-gold" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-gold/30">
            <DropdownMenuItem asChild>
              <Link to="/edit-listing/$id" params={{ id: v.id }}>
                <Edit3 className="h-4 w-4 mr-2 text-gold" /> Edit Listing
              </Link>
            </DropdownMenuItem>
            {sold ? (
              <DropdownMenuItem onClick={onActivate}>
                <RotateCcw className="h-4 w-4 mr-2 text-gold" /> Re-list
              </DropdownMenuItem>
            ) : v.status === "active" ? (
              <DropdownMenuItem onClick={onSold}>
                <CheckCircle2 className="h-4 w-4 mr-2 text-gold" /> Mark as Sold
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-lg truncate">
            {v.brand} {v.model}
          </h3>
          <span className="text-xs text-muted-foreground shrink-0">{v.year}</span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {v.wilaya}
        </div>
        <div className="mt-3">
          <div className="gold-text font-display text-lg font-bold leading-tight">
            {formatDZD(price || 0)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SoldOverlay() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-black/55 backdrop-blur-[2px] pointer-events-none">
      <div className="rotate-[-12deg] border-2 border-gold bg-gold/20 backdrop-blur-md px-6 py-2 rounded-md gold-glow">
        <div className="font-display text-2xl gold-shine font-bold tracking-widest">SOLD</div>
        <div className="text-[10px] text-gold text-center tracking-[0.3em]">مباع</div>
      </div>
    </div>
  );
}
