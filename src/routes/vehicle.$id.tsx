import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatDZD } from "@/lib/format";
import { Phone, MessageCircle, Gauge, MapPin, Fuel, Cog, Calendar, Gavel, Trophy, CreditCard as Edit3 } from "lucide-react";
import { Countdown } from "@/components/Countdown";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ChatDialog } from "@/components/ChatDialog";
import { AppointmentBooking } from "@/components/AppointmentBooking";
import { PremiumPaywallModal } from "@/components/PremiumPaywallModal";
import { ref, get, onValue, off, push, set } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

/** Algerian phone helpers */
function normalizeAlgPhone(raw: string): string {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (digits.startsWith("213")) return `+${digits}`;
  if (digits.startsWith("0")) return `+213${digits.slice(1)}`;
  return `+213${digits}`;
}

function toWhatsApp(raw: string): string {
  return normalizeAlgPhone(raw).replace(/\D/g, "");
}

export const Route = createFileRoute("/vehicle/$id")({
  component: VehicleDetail,
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
  images: string[]; // Cloudinary URLs
  video_url: string | null;
  price_type: "fixed" | "auction";
  fixed_price: number | null;
  starting_price: number | null;
  current_highest_bid: number | null;
  current_highest_bidder: string | null;
  auction_ends_at: string | null;
  status: string;
  description?: string;
  engine_type?: string;
};

type Bid = {
  id: string;
  bidderId: string;
  amount: number;
  createdAt: string;
};

function VehicleDetail() {
  const { id } = Route.useParams();
  const auth = useAuth();
  const user = auth?.user;
  const access = auth?.access ?? "locked";

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState<Bid[]>([]);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState("");

  useEffect(() => {
    const vehicleRef = ref(realtimeDb, `vehicles/${id}`);

    const handleVehicle = (snapshot: { val: () => Vehicle | null }) => {
      const data = snapshot.val();
      if (data) {
        setVehicle({ ...data, id });
      } else {
        setVehicle(null);
      }
      setLoading(false);
    };

    onValue(vehicleRef, handleVehicle);
    return () => off(vehicleRef);
  }, [id]);

  useEffect(() => {
    const bidsRef = ref(realtimeDb, `bids/${id}`);

    const handleBids = (snapshot: { val: () => Record<string, Bid> | null }) => {
      const data = snapshot.val();
      if (data) {
        const bidsList = Object.values(data).sort((a, b) => b.amount - a.amount);
        setBids(bidsList);
      } else {
        setBids([]);
      }
    };

    onValue(bidsRef, handleBids);
    return () => off(bidsRef);
  }, [id]);

  if (loading) {
    return <div className="max-w-5xl mx-auto px-6 py-20 text-center text-muted-foreground">Loading…</div>;
  }

  if (!vehicle) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="font-display text-2xl gold-text">Vehicle not found</h1>
        <Button asChild variant="gold" className="mt-4">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  const v = vehicle;
  const isAuction = v.price_type === "auction";
  const auctionEnded = isAuction && v.auction_ends_at && new Date(v.auction_ends_at) <= new Date();
  const price = isAuction ? (v.current_highest_bid ?? v.starting_price) : v.fixed_price;
  const isSeller = user?.id === v.sellerId;
  const isWinner = user?.id === v.current_highest_bidder;

  const showOwnerNumber = !isAuction
    ? access !== "locked"
    : auctionEnded
      ? (isSeller || isWinner)
      : access !== "locked" && !isSeller;

  const canAccessPremium = !!user && access !== "locked";

  const placeBid = async () => {
    if (!user) {
      toast.error("Sign in to bid");
      return;
    }
    const amount = Number(bidAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid bid amount");
      return;
    }
    if (v.current_highest_bid && amount <= v.current_highest_bid) {
      toast.error(`Bid must be higher than ${formatDZD(v.current_highest_bid)}`);
      return;
    }

    try {
      const bidRef = push(ref(realtimeDb, `bids/${id}`));
      await set(bidRef, {
        id: bidRef.key,
        bidderId: user.id,
        amount,
        createdAt: new Date().toISOString(),
      });

      // Update vehicle with new highest bid
      await set(ref(realtimeDb, `vehicles/${id}/current_highest_bid`), amount);
      await set(ref(realtimeDb, `vehicles/${id}/current_highest_bidder`), user.id);

      setBidAmount("");
      toast.success("Bid placed successfully");
    } catch (err) {
      toast.error("Failed to place bid");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
        <div className="space-y-3">
          {/* Images Carousel (Cloudinary URLs) */}
          {v.images && v.images.length > 0 && (
            <div className="relative">
              <Carousel className="w-full">
                <CarouselContent>
                  {v.images.map((url, i) => (
                    <CarouselItem key={i}>
                      <img
                        src={url}
                        alt={`${v.brand} ${v.model} - Photo ${i + 1}`}
                        className="w-full aspect-[4/3] object-cover rounded-lg"
                        loading="lazy"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {v.images.length > 1 && (
                  <>
                    <CarouselPrevious className="left-3 bg-black/70 border-gold/40 text-gold hover:bg-black/90" />
                    <CarouselNext className="right-3 bg-black/70 border-gold/40 text-gold hover:bg-black/90" />
                  </>
                )}
              </Carousel>
            </div>
          )}

          {/* Video */}
          {v.video_url && (
            <video
              src={v.video_url}
              controls
              className="w-full rounded-lg"
            />
          )}

          {/* Vehicle Info */}
          <div className="premium-card rounded-xl p-5 border border-gold/20">
            <div className="flex flex-wrap gap-4 text-sm mb-4">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Gauge className="h-4 w-4" /> {v.mileage?.toLocaleString() ?? "N/A"} km
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Fuel className="h-4 w-4" /> {v.fuel_type || "N/A"}
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Cog className="h-4 w-4" /> {v.transmission || "N/A"}
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4" /> {v.wilaya || "N/A"}
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-4 w-4" /> {v.year || "N/A"}
              </div>
            </div>

            {v.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-4">
                {v.description}
              </p>
            )}

            {v.engine_type && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Engine:</span> {v.engine_type}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Header */}
          <div>
            <div className="text-xs text-gold uppercase tracking-widest mb-1">
              {isAuction ? "Live Auction" : "For Sale"}
            </div>
            <h1 className="font-display text-3xl gold-text">
              {v.brand} {v.model}
            </h1>
            <div className="text-muted-foreground text-sm">{v.year}</div>
          </div>

          {/* Price */}
          <div className="premium-card rounded-xl p-5 border border-gold/20">
            {isAuction ? (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Current Bid</div>
                <div className="font-display text-3xl gold-shine">
                  {formatDZD(v.current_highest_bid || v.starting_price || 0)}
                </div>
                {v.auction_ends_at && (
                  <div className="mt-3">
                    <Countdown endsAt={v.auction_ends_at} />
                  </div>
                )}

                {/* Bid Form */}
                {access !== "locked" && !auctionEnded && (
                  <div className="mt-4 flex gap-2">
                    <Input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="Your bid (DZD)"
                      className="bg-charcoal"
                    />
                    <Button variant="gold" onClick={placeBid}>
                      <Gavel className="h-4 w-4 mr-1" /> Bid
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Price</div>
                <div className="font-display text-3xl gold-shine">
                  {formatDZD(v.fixed_price || 0)}
                </div>
              </div>
            )}
          </div>

          {/* Bids List */}
          {isAuction && bids.length > 0 && (
            <div className="premium-card rounded-xl p-4 border border-gold/20">
              <h3 className="font-medium text-sm mb-2">Recent Bids</h3>
              <div className="space-y-2">
                {bids.slice(0, 5).map((bid, i) => (
                  <div key={bid.id} className="flex justify-between text-sm">
                    <span className={i === 0 ? "text-gold font-medium" : "text-muted-foreground"}>
                      {bid.bidderId === user?.id ? "You" : `Bidder ${bid.bidderId.slice(0, 6)}...`}
                    </span>
                    <span className={i === 0 ? "text-gold font-medium" : ""}>
                      {formatDZD(bid.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Owner Contact */}
          {showOwnerNumber && v.phone && (
            <div className="flex gap-2">
              <Button asChild variant="gold" className="flex-1">
                <a href={`tel:${normalizeAlgPhone(v.phone)}`}>
                  <Phone className="h-4 w-4 mr-2" /> Call Owner
                </a>
              </Button>
              <Button asChild variant="outline" className="flex-1 border-gold/50 text-gold hover:bg-gold/10">
                <a href={`https://wa.me/${toWhatsApp(v.phone)}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                </a>
              </Button>
            </div>
          )}

          {/* Chat */}
          {user && !isSeller && canAccessPremium && (
            <ChatDialog
              recipientId={v.sellerId}
              recipientPhone={v.sellerPhone}
              vehicleId={v.id}
              vehicleName={`${v.brand} ${v.model}`}
            />
          )}
          {user && !isSeller && !canAccessPremium && (
            <Button
              variant="outline"
              className="h-12 w-full border-gold/50 text-gold hover:bg-gold/10"
              onClick={() => setPaywallOpen(true)}
            >
              <MessageCircle className="h-4 w-4 mr-2" /> Activate to Chat with Seller
            </Button>
          )}

          {/* Appointment */}
          {user && canAccessPremium && !isSeller && (
            <AppointmentBooking
              vehicleId={v.id}
              sellerId={v.sellerId}
              sellerPhone={v.sellerPhone}
              vehicleName={`${v.brand} ${v.model}`}
            />
          )}

          {/* Edit (owner only) */}
          {isSeller && (
            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1 border-gold/50 text-gold hover:bg-gold/10">
                <Link to="/edit-listing/$id" params={{ id: v.id }}>
                  <Edit3 className="h-4 w-4 mr-2" /> Edit
                </Link>
              </Button>
              <Button
                variant={v.status === "sold" ? "gold" : "outline"}
                className="flex-1"
                onClick={async () => {
                  const newStatus = v.status === "sold" ? "active" : "sold";
                  try {
                    const { ref, update } = await import("firebase/database");
                    await update(ref(realtimeDb, `vehicles/${v.id}`), { status: newStatus });
                    toast.success(newStatus === "sold" ? "Marked as sold" : "Marked as available");
                    window.location.reload();
                  } catch (e) {
                    toast.error("Failed to update status");
                  }
                }}
              >
                {v.status === "sold" ? "Mark Available" : "Mark Sold"}
              </Button>
            </div>
          )}

          {/* Premium Paywall */}
          {!canAccessPremium && (
            <div className="text-center py-4">
              <p className="text-xs text-muted-foreground mb-2">
                Subscribe to see owner contact details
              </p>
              <Button variant="gold" size="sm" onClick={() => setPaywallOpen(true)}>
                Upgrade Now
              </Button>
            </div>
          )}
        </div>
      </div>

      <PremiumPaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} />
    </div>
  );
}
