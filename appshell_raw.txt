successfully downloaded text file (SHA: f27d0aa8eba793160f809bd88bdbc6520726da42)
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDZD } from "@/lib/format";
import { Flag, Calendar, Gauge, Fuel, Cog, Gavel, Trophy, Phone, MessageCircle, Lock, Pencil, Trash2, MapPin, Crown, BadgeCheck } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Countdown } from "@/components/Countdown";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ChatDialog } from "@/components/ChatDialog";
import { AppointmentBooking } from "@/components/AppointmentBooking";
import { PremiumPaywallModal } from "@/components/PremiumPaywallModal";
import { ref, get, onValue, off, push, set, remove } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

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
  images: string[];
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
  bidderName: string;
  amount: number;
  createdAt: string;
};

type OwnerProfile = {
  phone: string;
  first_name: string;
  last_name: string;
  showroom_name?: string;
  bio?: string;
  avatar_url?: string;
  subscription_status: string;
  subscription_until?: string;
  subscription_tier?: string;
  is_showroom?: boolean;
  instagram?: string;
};

function VehicleDetail() {
  const { id } = Route.useParams();
  const auth = useAuth();
  const user = auth?.user;
  const access = auth?.access ?? "locked";
  const [v, setV] = useState<Vehicle | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState("");
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);
  const [owner, setOwner] = useState<OwnerProfile | null>(null);

  useEffect(() => {
    const vehicleRef = ref(realtimeDb, `vehicles/${id}`);
    const handleSnapshot = (snapshot: { val: () => (Vehicle & { [key: string]: any }) | null }) => {
      try {
        const data = snapshot.val();
        if (data) {
          setV({
            ...data,
            id,
            brand: data.brand || "Unknown",
            model: data.model || "",
            year: data.year || 0,
            mileage: data.mileage ?? 0,
            fuel_type: data.fuel_type || "N/A",
            transmission: data.transmission || "N/A",
            wilaya: data.wilaya || "N/A",
            phone: data.phone || "",
            sellerPhone: data.sellerPhone || "",
            sellerId: data.sellerId || "",
            images: Array.isArray(data.images) ? data.images : [],
            video_url: data.video_url || null,
            fixed_price: data.fixed_price ?? null,
            starting_price: data.starting_price ?? null,
            current_highest_bid: data.current_highest_bid ?? null,
            current_highest_bidder: data.current_highest_bidder ?? null,
            auction_ends_at: data.auction_ends_at ?? null,
            status: data.status || "active",
          });
        } else setV(null);
      } catch (err) {
        console.error("Error loading vehicle:", err);
        setV(null);
      }
    };
    onValue(vehicleRef, handleSnapshot);
    return () => off(vehicleRef);
  }, [id]);

  useEffect(() => {
    if (!v || v.price_type !== "auction") return;
    const bidsRef = ref(realtimeDb, `bids/${id}`);
    const handleBids = (snapshot: { val: () => Record<string, Bid> | null }) => {
      try {
        const data = snapshot.val();
        if (data) {
          const list = Object.values(data).sort((a, b) => b.amount - a.amount);
          setBids(list);
        } else {
          setBids([]);
        }
      } catch (err) {
        console.error("Error loading bids:", err);
        setBids([]);
      }
    };
    onValue(bidsRef, handleBids);
    return () => off(bidsRef);
  }, [id, v?.price_type]);

  useEffect(() => {
    async function loadOwner() {
      if (!v?.sellerPhone && !v?.sellerId) return;
      let phoneKey = v.sellerPhone || v.sellerId;
      if (phoneKey.startsWith("admin-")) {
        phoneKey = phoneKey.replace("admin-", "");
      }
      try {
        let snap = await get(ref(realtimeDb, `users/${phoneKey}`));
        if (!snap.exists() && v.sellerId) {
          const vehiclesSnap = await get(ref(realtimeDb, "vehicles"));
          if (vehiclesSnap.exists()) {
            const allV = vehiclesSnap.val() as Record<string, any>;
            const match = Object.values(allV).find((veh) => veh.sellerId === v.sellerId);
            if (match?.sellerPhone) {
              phoneKey = match.sellerPhone;
              snap = await get(ref(realtimeDb, `users/${phoneKey}`));
            }
          }
        }
        if (snap.exists()) {
          const data = snap.val();
          setOwner({
            phone: data.phone || phoneKey,
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            showroom_name: data.showroom_name,
            bio: data.bio,
            avatar_url: data.avatar_url,
            subscription_status: data.subscription_status || "trial",
            subscription_until: data.subscription_until,
            subscription_tier: data.subscription_tier,
            is_showroom: data.subscription_tier === "dealer" || data.subscription_tier === "showroom",
            instagram: data.instagram,
          });
        }
      } catch (err) {
        console.error("Error loading owner profile:", err);
      }
    }
    loadOwner();
  }, [v?.sellerPhone, v?.sellerId]);

  if (!v) {
    return (
      <div className="py-24 text-center">
        <p className="text-muted-foreground">Loading vehicle...</p>
      </div>
    );
  }

  const isSeller = user?.id === v.sellerId;
  const isWinner = user?.id === v.current_highest_bidder;
  const canSeeContact = access === "active" || isSeller;
  const ownerVerified = owner?.is_showroom && owner?.subscription_status === "active" && owner?.subscription_until && new Date(owner.subscription_until) > new Date();
  const ownerName = owner
    ? (owner.showroom_name || `${owner.first_name ?? ""} ${owner.last_name ?? ""}`.trim() || "Seller")
    : "Seller";

  const handleBid = async () => {
    if (!user) { toast.error("Please sign in to bid"); return; }
    const amount = Number(bidAmount);
    if (!amount || amount <= 0) { toast.error("Enter a valid amount"); return; }
    const minBid = (v.current_highest_bid ?? v.starting_price ?? 0) + 1000;
    if (amount < minBid) { toast.error(`Minimum bid is ${formatDZD(minBid)}`); return; }

    try {
      const bidRef = push(ref(realtimeDb, `bids/${id}`));
      const bid: Bid = {
        id: bidRef.key!,
        bidderId: user.id,
        bidderName: auth?.profile?.first_name || user.phone,
        amount,
        createdAt: new Date().toISOString(),
      };
      await set(bidRef, bid);
      await set(ref(realtimeDb, `vehicles/${id}/current_highest_bid`), amount);
      await set(ref(realtimeDb, `vehicles/${id}/current_highest_bidder`), user.id);
      setBidAmount("");
      toast.success("Bid placed!");
    } catch (err) {
      toast.error("Failed to place bid");
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) { toast.error("Please describe the issue"); return; }
    setReporting(true);
    try {
      const reportRef = push(ref(realtimeDb, "reports"));
      await set(reportRef, {
        id: reportRef.key,
        contentType: "vehicle",
        contentId: v.id,
        contentTitle: `${v.brand} ${v.model} (${v.year})`,
        reporterId: user?.id || "anonymous",
        reporterPhone: user?.phone || "anonymous",
        reason: reportReason.trim(),
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      toast.success("Report submitted. Admin will review it.");
      setShowReportDialog(false);
      setReportReason("");
    } catch (err) {
      toast.error("Failed to submit report");
    } finally {
      setReporting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this listing permanently?")) return;
    try {
      await remove(ref(realtimeDb, `vehicles/${v.id}`));
      toast.success("Listing deleted");
      window.location.href = "/";
    } catch (err) {
      toast.error("Failed to delete listing");
    }
  };

  return (
    <div className="pb-20">
      {/* Gallery */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {v.images && v.images.length > 0 ? (
          <Carousel className="w-full">
            <CarouselContent>
              {v.images.map((url, i) => (
                <CarouselItem key={i}>
                  <img src={url} alt={`${v.brand} ${v.model} ${i + 1}`} className="w-full aspect-[4/3] object-cover rounded-xl" />
                </CarouselItem>
              ))}
            </CarouselContent>
            {v.images.length > 1 && (
              <>
                <CarouselPrevious className="left-2 bg-black/70 border-gold/40 text-gold hover:bg-black/90" />
                <CarouselNext className="right-2 bg-black/70 border-gold/40 text-gold hover:bg-black/90" />
              </>
            )}
          </Carousel>
        ) : (
          <div className="w-full aspect-[4/3] bg-charcoal rounded-xl grid place-items-center">
            <img src="/my-logo.png.PNG" alt="No image" className="h-24 w-24 opacity-30" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl">{v.brand} {v.model}</h1>
            <div className="text-sm text-muted-foreground mt-1">{v.year} · {v.wilaya}</div>
          </div>
          <div className="text-right">
            {v.price_type === "fixed" && v.fixed_price ? (
              <div className="text-2xl gold-text font-display">{formatDZD(v.fixed_price)}</div>
            ) : v.price_type === "auction" ? (
              <div className="text-2xl gold-text font-display">{formatDZD(v.current_highest_bid || v.starting_price || 0)}</div>
            ) : null}
            {v.price_type === "auction" && <div className="text-xs text-muted-foreground uppercase tracking-widest">Current bid</div>}
            {v.price_type === "fixed" && <div className="text-xs text-muted-foreground uppercase tracking-widest">Price</div>}
          </div>
        </div>

        {/* Owner actions */}
        {isSeller && v.status !== "sold" && (
          <div className="mb-4 flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/edit-listing/$id" params={{ id: v.id }}>
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        )}

        {v.status === "sold" && (
          <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium">
            This vehicle has been sold.
          </div>
        )}

        {/* Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Spec icon={Calendar} label="Year" value={String(v.year)} />
          <Spec icon={Gauge} label="Mileage" value={`${v.mileage?.toLocaleString() || 0} km`} />
          <Spec icon={Fuel} label="Fuel" value={v.fuel_type || "—"} />
          <Spec icon={Cog} label="Transmission" value={v.transmission || "—"} />
        </div>

        {v.description && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{v.description}</p>
          </div>
        )}

        {v.video_url && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gold mb-2">Video</h3>
            <video src={v.video_url} controls className="w-full rounded-xl max-h-[400px]" />
          </div>
        )}

        {/* Auction */}
        {v.price_type === "auction" && v.auction_ends_at && v.status !== "sold" && (
          <div className="mb-6 premium-card rounded-xl p-4 border border-gold/20">
            <div className="flex items-center gap-2 mb-3">
              <Gavel className="h-5 w-5 text-gold" />
              <h3 className="font-display text-lg">Live Auction</h3>
            </div>
            <Countdown endsAt={v.auction_ends_at} />
            {isWinner && <div className="mt-2 text-sm text-green-400 flex items-center gap-1"><Trophy className="h-4 w-4" /> You are the highest bidder!</div>}
            {bids.length > 0 && (
              <div className="mt-3 space-y-1">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Bid History</div>
                {bids.slice(0, 5).map((b) => (
                  <div key={b.id} className="text-sm flex justify-between">
                    <span>{b.bidderName}</span>
                    <span className="text-gold">{formatDZD(b.amount)}</span>
                  </div>
                ))}
              </div>
            )}
            {!isSeller && user && (
              <div className="mt-4 flex gap-2">
                <Input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} placeholder={`Min: ${formatDZD((v.current_highest_bid ?? v.starting_price ?? 0) + 1000)}`} className="bg-charcoal" />
                <Button variant="gold" onClick={handleBid}>Place Bid</Button>
              </div>
            )}
            {!user && <p className="text-sm text-muted-foreground mt-3">Sign in to place a bid.</p>}
          </div>
        )}

        {/* Contact Owner - Privacy Locked */}
        <div className="mb-6 premium-card rounded-xl p-4 border border-gold/20">
          <h3 className="text-sm font-semibold text-gold mb-3">Contact Owner</h3>
          {canSeeContact ? (
            <div className="flex gap-2 flex-wrap">
              <a href={`tel:${normalizeAlgPhone(v.phone)}`}>
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4 mr-2" /> Call
                </Button>
              </a>
              <a href={`https://wa.me/${toWhatsApp(v.phone)}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                </Button>
              </a>
              {user && !isSeller && (
                <ChatDialog recipientId={v.sellerId} recipientPhone={v.sellerPhone} vehicleId={v.id} vehicleTitle={`${v.brand} ${v.model} (${v.year})`} />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center py-4 gap-3">
              <Lock className="h-8 w-8 text-gold/50" />
              <p className="text-sm text-muted-foreground text-center">
                Contact details are locked. Subscribe to view phone, WhatsApp, and chat with sellers.
              </p>
              <Button variant="gold" size="sm" onClick={() => setPaywallOpen(true)}>
                <Crown className="h-4 w-4 mr-1" /> Unlock Contact
              </Button>
            </div>
          )}
        </div>

        {/* Appointments */}
        {user && !isSeller && access === "active" && (
          <AppointmentBooking
            vehicleId={v.id}
            vehicleTitle={`${v.brand} ${v.model} (${v.year})`}
            sellerId={v.sellerId}
            sellerPhone={v.sellerPhone}
          />
        )}

        {/* Owner Profile Card */}
        {owner && (
          <div className="mt-8 premium-card rounded-xl p-5 border border-gold/20">
            <h3 className="text-xs uppercase tracking-widest text-gold mb-4">Listing Owner</h3>
            <Link to="/seller/$id" params={{ id: owner.phone }} className="flex items-center gap-4 group">
              <div className="h-14 w-14 rounded-xl overflow-hidden gold-border bg-charcoal grid place-items-center shrink-0">
                {owner.avatar_url ? (
                  <img src={owner.avatar_url} alt={ownerName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-gold">{ownerName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-lg group-hover:text-gold transition truncate">{ownerName}</span>
                  {ownerVerified && owner.is_showroom && (
                    <svg className="h-5 w-5 text-gold shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9.5 21l-1.7-3.3L4 16l3.8-1.7L9.5 11l1.7 3.3L15 16l-3.8 1.7L9.5 21zM18 14l-1-2-1 2-2 1 2 1 1 2 1-2 2-1-2-1zM14.5 6l-1.3-2.5L12 6l-2.5 1.3L12 8.5l1.2 2.5L14.5 8.5l2.5-1.2L14.5 6z" />
                    </svg>
                  )}
                  {ownerVerified && !owner.is_showroom && <BadgeCheck className="h-5 w-5 text-blue-400 shrink-0" />}
                </div>
                {owner.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{owner.bio}</p>}
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{v.wilaya}</span>
                  {owner.is_showroom && <span className="text-gold text-[10px] uppercase tracking-widest">Showroom</span>}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="shrink-0">View Profile</Button>
            </Link>
          </div>
        )}
      </div>

      <PremiumPaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} />

      {/* Report Button */}
      {!isSeller && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-8">
          <Button variant="outline" size="sm" onClick={() => setShowReportDialog(true)} className="text-muted-foreground hover:text-destructive border-border/60">
            <Flag className="h-4 w-4 mr-2" /> تبليغ (Report)
          </Button>
        </div>
      )}

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-md bg-background border-gold/40">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive"><Flag className="h-5 w-5" /> Report Listing</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Describe why you're reporting this listing. Admin will review it.</p>
          <Textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="e.g. fake photos, scam, misleading info..."
            className="bg-charcoal min-h-[80px]"
          />
          <div className="flex gap-2">
            <Button variant="destructive" onClick={handleReport} disabled={reporting}>
              {reporting ? "Submitting..." : "Submit Report"}
            </Button>
            <Button variant="ghost" onClick={() => setShowReportDialog(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Spec({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="premium-card rounded-lg p-3 border border-gold/10">
      <Icon className="h-4 w-4 text-gold mb-1" />
      <div className="text-xs text-muted-foreground uppercase tracking-widest">{label}</div>
      <div className="text-sm font-medium mt-0.5">{value}</div>
    </div>
  );
}
