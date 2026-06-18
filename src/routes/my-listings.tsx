import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSignedUrl } from "@/hooks/use-signed-url";
import { formatAlgerianPrice } from "@/lib/format";
import { MoreVertical, Edit3, Trash2, CheckCircle2, RotateCcw, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/my-listings")({
  head: () => ({ meta: [{ title: "My Listings · GRAND Auto Luxe" }] }),
  component: MyListingsPage,
});

function MyListingsPage() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["my-listings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("seller_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (loading) return <div className="py-24 text-center text-muted-foreground">Loading…</div>;
  if (!user)
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h2 className="font-display text-2xl mb-2">Sign in to manage your listings</h2>
        <Button asChild variant="gold" className="mt-4">
          <Link to="/auth">Sign in</Link>
        </Button>
      </div>
    );

  const markSold = async (id: string) => {
    const { error } = await supabase
      .from("vehicles")
      .update({ status: "sold", sold_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Marked as sold");
    qc.invalidateQueries({ queryKey: ["my-listings", user.id] });
    qc.invalidateQueries({ queryKey: ["vehicles"] });
  };

  const markActive = async (id: string) => {
    const { error } = await supabase
      .from("vehicles")
      .update({ status: "active", sold_at: null })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Re-listed");
    qc.invalidateQueries({ queryKey: ["my-listings", user.id] });
    qc.invalidateQueries({ queryKey: ["vehicles"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this listing permanently?")) return;
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Listing deleted");
    qc.invalidateQueries({ queryKey: ["my-listings", user.id] });
    qc.invalidateQueries({ queryKey: ["vehicles"] });
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
          {listings.map((v: any) => (
            <OwnerCard
              key={v.id}
              v={v}
              onSold={() => markSold(v.id)}
              onActivate={() => markActive(v.id)}
              onDelete={() => remove(v.id)}
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
  v: any;
  onSold: () => void;
  onActivate: () => void;
  onDelete: () => void;
}) {
  const cover = useSignedUrl("vehicle-media", v.photos?.[0]);
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
        {cover && (
          <img
            src={cover}
            alt={`${v.brand} ${v.model}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
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
            ) : (
              <DropdownMenuItem onClick={onSold}>
                <CheckCircle2 className="h-4 w-4 mr-2 text-gold" /> Mark as Sold
              </DropdownMenuItem>
            )}
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
            {formatAlgerianPrice(price)}
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
        <div className="text-[10px] text-gold text-center tracking-[0.3em]">تم البيع</div>
      </div>
    </div>
  );
}
