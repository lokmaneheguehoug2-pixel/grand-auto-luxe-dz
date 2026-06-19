import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatDZD } from "@/lib/format";
import { Phone, MessageCircle, Gauge, MapPin, Fuel, Cog, Calendar, Gavel, Trophy } from "lucide-react";
import { useSignedUrl } from "@/hooks/use-signed-url";
import { Countdown } from "@/components/Countdown";
import { useState } from "react";
import { toast } from "sonner";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { SoldOverlay } from "@/routes/my-listings";
import { formatCentimes } from "@/lib/format";
import { ChatDialog } from "@/components/ChatDialog";

export const Route = createFileRoute("/vehicle/$id")({
  component: VehicleDetail,
});

function VehicleDetail() {
  const { id } = Route.useParams();
  const { user, access } = useAuth();
  const qc = useQueryClient();
  const { data: v } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicles").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });
  const { data: bids = [] } = useQuery({
    queryKey: ["bids", id],
    queryFn: async () => {
      const { data } = await supabase.from("bids").select("*").eq("vehicle_id", id).order("amount", { ascending: false }).limit(10);
      return data ?? [];
    },
    refetchInterval: 5000,
  });

  if (!v) return <div className="max-w-5xl mx-auto px-6 py-20 text-center text-muted-foreground">Loading…</div>;

  const isAuction = v.price_type === "auction";
  const auctionEnded = isAuction && v.auction_ends_at && new Date(v.auction_ends_at) <= new Date();
  const price = isAuction ? (v.current_highest_bid ?? v.starting_price) : v.fixed_price;
  const isSeller = user?.id === v.seller_id;
  const isWinner = user?.id === v.current_highest_bidder;
  // Hide owner phone during active auction; show for fixed price, after auction (to seller+winner), and to any unlocked user otherwise
  const showOwnerNumber = !isAuction
    ? access !== "locked"
    : auctionEnded
      ? (isSeller || isWinner)
      : access !== "locked" && !isSeller;

  const refresh = () => { qc.invalidateQueries({ queryKey: ["vehicle", id] }); qc.invalidateQueries({ queryKey: ["bids", id] }); };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
        <div className="space-y-3">
          {v.photos && v.photos.length > 0 && (
            <div className="relative">
              <Carousel className="w-full">
                <CarouselContent>
                  {v.photos.map((p: string, i: number) => (
                    <CarouselItem key={i}>
                      <Photo path={p} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-3 bg-black/70 border-gold/40 text-gold hover:bg-black/90" />
                <CarouselNext className="right-3 bg-black/70 border-gold/40 text-gold hover:bg-black/90" />
              </Carousel>
              {v.status === "sold" && (
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                  <SoldOverlay />
                </div>
              )}
            </div>
          )}
          {v.video_url && <Video path={v.video_url} />}
        </div>
        <div className="lg:sticky lg:top-20 self-start space-y-5">
          <div>
            <div className="text-xs uppercase tracking-widest text-gold">{v.wilaya}</div>
            <h1 className="font-display text-4xl mt-1">{v.brand} {v.model}</h1>
            <div className="mt-1 text-sm text-muted-foreground">{v.year}</div>
          </div>

          <div className="premium-card rounded-2xl p-5">
            {isAuction ? (
              <>
                <div className="text-[10px] uppercase tracking-widest text-gold mb-1">Current Highest Bid</div>
                <div className="gold-text font-display text-4xl font-bold">{formatDZD(price)}</div>
                {!auctionEnded && v.auction_ends_at && (
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Auction ends in</span>
                    <Countdown endsAt={v.auction_ends_at} className="text-gold font-semibold" />
                  </div>
                )}
                {auctionEnded ? (
                  <div className="mt-4">
                    <div className="rounded-lg border border-premium-red/40 bg-premium-red/10 px-3 py-2 text-sm text-destructive font-semibold text-center">Bidding Closed</div>
                    {isSeller && v.current_highest_bidder && (
                      <ContactWinner vehicleId={id} winnerId={v.current_highest_bidder} />
                    )}
                  </div>
                ) : (
                  user && !isSeller && access !== "locked" && (
                    <BidDialog vehicleId={id} currentHighest={v.current_highest_bid ?? v.starting_price} onPlaced={refresh} />
                  )
                )}
              </>
            ) : (
              <>
                <div className="text-[10px] uppercase tracking-widest text-gold mb-1">Price</div>
                <div className="gold-text font-display text-4xl font-bold">{formatDZD(price)}</div>
                <div className="text-xs text-gold/70 mt-1">{formatCentimes(price)}</div>
              </>
            )}
          </div>

          {showOwnerNumber && (
            <div className="grid grid-cols-2 gap-3">
              <Button asChild variant="gold" className="h-12"><a href={`tel:${v.phone}`}><Phone className="h-4 w-4" /> Call Owner</a></Button>
              <Button asChild variant="gold-outline" className="h-12"><a href={`https://wa.me/${v.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" /> WhatsApp</a></Button>
            </div>
          )}
          {user && !isSeller && access !== "locked" && (
            <ChatDialog vehicleId={id} sellerId={v.seller_id} vehicleTitle={`${v.brand} ${v.model}`} />
          )}

          <div className="premium-card rounded-2xl p-5 grid grid-cols-2 gap-4 text-sm">
            <Spec icon={<Calendar className="h-4 w-4" />} label="Year" value={v.year} />
            <Spec icon={<Gauge className="h-4 w-4" />} label="Mileage" value={`${v.mileage.toLocaleString()} km`} />
            <Spec icon={<Fuel className="h-4 w-4" />} label="Fuel" value={v.fuel_type} />
            <Spec icon={<Cog className="h-4 w-4" />} label="Transmission" value={v.transmission} />
            <Spec icon={<MapPin className="h-4 w-4" />} label="Wilaya" value={v.wilaya} />
            {v.engine_type && <Spec icon={<Cog className="h-4 w-4" />} label="Engine" value={v.engine_type} />}
          </div>

          {v.description && (
            <div className="premium-card rounded-2xl p-5">
              <div className="text-xs uppercase tracking-widest text-gold mb-2">Description</div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{v.description}</p>
            </div>
          )}

          {isAuction && bids.length > 0 && (
            <div className="premium-card rounded-2xl p-5">
              <div className="text-xs uppercase tracking-widest text-gold mb-3 flex items-center gap-2"><Gavel className="h-3 w-3" /> Bid History</div>
              <div className="space-y-2">
                {bids.map((b: any) => (
                  <div key={b.id} className="flex justify-between text-sm border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground">{new Date(b.created_at).toLocaleString()}</span>
                    <span className="font-semibold gold-text">{formatDZD(b.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link to="/" className="inline-block text-xs text-muted-foreground hover:text-gold">← Back to marketplace</Link>
        </div>
      </div>
    </div>
  );
}

function Photo({ path }: { path: string }) {
  const url = useSignedUrl("vehicle-media", path);
  return <div className="rounded-2xl overflow-hidden bg-charcoal aspect-[4/3]">{url && <img src={url} className="h-full w-full object-cover" alt="" />}</div>;
}
function Video({ path }: { path: string }) {
  const url = useSignedUrl("vehicle-media", path);
  return <div className="rounded-2xl overflow-hidden bg-charcoal">{url && <video src={url} controls className="w-full h-auto" />}</div>;
}

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="text-gold mt-0.5">{icon}</div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="font-medium truncate">{value}</div>
      </div>
    </div>
  );
}

function BidDialog({ vehicleId, currentHighest, onPlaced }: { vehicleId: string; currentHighest: number; onPlaced: () => void }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(currentHighest + 10000);
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();

  const place = async () => {
    if (!user) return;
    if (amount <= currentHighest) { toast.error("Bid must be higher than the current highest bid."); return; }
    setBusy(true);
    const { error } = await supabase.from("bids").insert({ vehicle_id: vehicleId, bidder_id: user.id, amount });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Bid placed.");
    setOpen(false);
    onPlaced();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gold" className="w-full mt-4 h-12"><Gavel className="h-4 w-4" /> Place a Bid</Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader><DialogTitle className="font-display">Place your bid</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">Current highest: <span className="gold-text font-semibold">{formatDZD(currentHighest)}</span></div>
          <Input type="number" className="bg-charcoal" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          <Button variant="gold" className="w-full" disabled={busy} onClick={place}>Confirm Bid</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ContactWinner({ vehicleId, winnerId }: { vehicleId: string; winnerId: string }) {
  const [revealed, setRevealed] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const reveal = async () => {
    setBusy(true);
    const { data } = await supabase.from("profiles").select("phone, first_name, last_name").eq("id", winnerId).maybeSingle();
    setBusy(false);
    if (data?.phone) setRevealed(`${data.first_name} ${data.last_name} · ${data.phone}`);
    else toast.error("Could not retrieve winner contact.");
  };
  return revealed ? (
    <div className="mt-3 rounded-xl gold-border p-4 bg-gold-soft">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold mb-1"><Trophy className="h-3 w-3" /> Winning Bidder</div>
      <div className="font-semibold">{revealed}</div>
    </div>
  ) : (
    <Button variant="gold" className="w-full mt-3 h-12" disabled={busy} onClick={reveal}><Trophy className="h-4 w-4" /> Contact the Winning Bidder</Button>
  );
}
