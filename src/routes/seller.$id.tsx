import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { formatDZD } from "@/lib/format";
import { BadgeCheck, Car, MapPin, Gauge, Clock, Crown, AlertTriangle, Tag, Calendar, Instagram, Phone, MessageCircle, Camera, Pencil, Trash2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumPaywallModal } from "@/components/PremiumPaywallModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { realtimeDb } from "@/lib/firebase";
import { ref, get, set, remove, onValue, off, push } from "firebase/database";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

export const Route = createFileRoute("/seller/$id")({
  head: () => ({ meta: [{ title: "Seller Profile · GRAND Auto Luxe" }] }),
  component: SellerProfile,
});

type SellerProfileData = {
  id: string;
  phone: string;
  first_name: string;
  last_name: string;
  showroom_name?: string;
  bio?: string;
  avatar_url?: string;
  avatar_updated_at?: string;
  subscription_status: string;
  subscription_until?: string;
  subscription_tier?: string;
  is_showroom?: boolean;
  plan_type?: string;
  instagram?: string;
};

type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  wilaya: string;
  mileage: number;
  photos?: string[];
  images?: string[];
  price_type: "fixed" | "auction";
  fixed_price?: number;
  current_highest_bid?: number;
  starting_price?: number;
  status: string;
  created_at?: string;
  sellerId?: string;
  sellerPhone?: string;
};

function SellerProfile() {
  const { id } = Route.useParams();
  const { user, profile: me, access, isAdmin } = useAuth();
  const navigate = useNavigate();
  const isOwnProfile = user?.id === id || user?.phone === id;

  const [profile, setProfile] = useState<SellerProfileData | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "sold">("active");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editShowroomName, setEditShowroomName] = useState("");
  const [editAvatar, setEditAvatar] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const profileSnap = await get(ref(realtimeDb, `users/${id}`));
        if (profileSnap.exists()) {
          const data = profileSnap.val();
          setProfile({
            id,
            phone: data.phone || id,
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            showroom_name: data.showroom_name,
            bio: data.bio,
            avatar_url: data.avatar_url,
            avatar_updated_at: data.avatar_updated_at,
            subscription_status: data.subscription_status || "trial",
            subscription_until: data.subscription_until,
            subscription_tier: data.subscription_tier,
            is_showroom: data.subscription_tier === "dealer" || data.subscription_tier === "showroom",
            plan_type: data.subscription_tier === "dealer" || data.subscription_tier === "showroom" ? "showroom" : "individual",
            instagram: data.instagram,
          });
          setEditBio(data.bio || "");
          setEditShowroomName(data.showroom_name || "");
        }

        const vehiclesSnap = await get(ref(realtimeDb, "vehicles"));
        if (vehiclesSnap.exists()) {
          const allVehicles = vehiclesSnap.val() as Record<string, Vehicle>;
          const sellerVehicles = Object.entries(allVehicles)
            .filter(([_, v]) => v.sellerId === id || v.sellerPhone === id)
            .map(([vid, v]) => ({ ...v, id: vid }))
            .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
          setVehicles(sellerVehicles);
        }
      } catch (err) {
        console.error("Error loading seller profile:", err);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const verified = profile?.is_showroom || (
    profile?.subscription_status === "active" &&
    profile?.subscription_until &&
    new Date(profile.subscription_until) > new Date()
  );

  const name = profile
    ? (profile.showroom_name || `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Seller")
    : "Seller";

  const canChangeAvatar = useCallback(() => {
    if (!profile?.avatar_updated_at) return true;
    const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return new Date(profile.avatar_updated_at).getTime() < oneMonthAgo;
  }, [profile]);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      if (editBio !== (profile?.bio || "")) {
        await set(ref(realtimeDb, `users/${id}/bio`), editBio.trim() || null);
      }
      if (profile?.is_showroom && editShowroomName !== (profile?.showroom_name || "")) {
        await set(ref(realtimeDb, `users/${id}/showroom_name`), editShowroomName.trim() || null);
      }

      if (editAvatar && canChangeAvatar()) {
        const avatarUrl = await uploadImageToCloudinary(editAvatar);
        await set(ref(realtimeDb, `users/${id}/avatar_url`), avatarUrl);
        await set(ref(realtimeDb, `users/${id}/avatar_updated_at`), new Date().toISOString());
      }

      setProfile(prev => prev ? { ...prev, bio: editBio, showroom_name: editShowroomName || prev.showroom_name } : null);
      setShowEditProfile(false);
      toast.success("Profile updated");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const deleteListing = async (vehicleId: string) => {
    if (!confirm("Delete this listing permanently?")) return;
    try {
      await remove(ref(realtimeDb, `vehicles/${vehicleId}`));
      setVehicles(vehicles.filter((v) => v.id !== vehicleId));
      toast.success("Listing deleted");
    } catch (err) {
      toast.error("Failed to delete listing");
    }
  };

  const markAsSold = async (vehicleId: string) => {
    try {
      await set(ref(realtimeDb, `vehicles/${vehicleId}/status`), "sold");
      setVehicles(vehicles.map((v) => v.id === vehicleId ? { ...v, status: "sold" } : v));
      toast.success("Marked as sold");
    } catch (err) {
      toast.error("Failed to update listing");
    }
  };

  const getInstagramUrl = (username: string) => {
    if (!username) return null;
    const clean = username.replace("@", "").trim();
    if (clean.startsWith("http")) return clean;
    return `https://instagram.com/${clean}`;
  };

  const instagramUrl = profile?.instagram ? getInstagramUrl(profile.instagram) : null;

  const activeVehicles = vehicles.filter((v) => v.status === "active" || !v.status);
  const soldVehicles = vehicles.filter((v) => v.status === "sold");
  const displayVehicles = activeTab === "active" ? activeVehicles : soldVehicles;

  if (loading) return <div className="max-w-6xl mx-auto px-6 py-20 text-center text-muted-foreground">Loading...</div>;
  if (!profile) return (
    <div className="max-w-6xl mx-auto px-6 py-20 text-center">
      <h1 className="font-display text-2xl gold-text">Seller not found</h1>
      <Button asChild variant="gold" className="mt-4"><Link to="/">Back</Link></Button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {isOwnProfile && access === "trial" && me && <TrialExpiryBanner trialStartedAt={me.trial_started_at} />}

      {/* Luxury Profile Card */}
      <div className="premium-card rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(212,175,55,0.18),transparent_50%)]" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="h-24 w-24 rounded-2xl overflow-hidden gold-gradient grid place-items-center text-3xl font-display text-gold-foreground shadow-lg">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={name} className="h-full w-full object-cover" />
              ) : (
                <span>{name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            {isOwnProfile && (
              <button
                onClick={() => setShowEditProfile(true)}
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-background border border-gold/40 grid place-items-center hover:bg-gold/10 transition"
                title="Edit profile"
              >
                <Camera className="h-3.5 w-3.5 text-gold" />
              </button>
            )}
          </div>

          {/* Name + badges */}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl sm:text-3xl">{name}</h1>
              {verified && profile?.is_showroom && (
                <span title="Golden Verified Showroom" className="inline-flex">
                  <svg className="h-6 w-6 text-gold" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.5 21l-1.7-3.3L4 16l3.8-1.7L9.5 11l1.7 3.3L15 16l-3.8 1.7L9.5 21zM18 14l-1-2-1 2-2 1 2 1 1 2 1-2 2-1-2-1zM14.5 6l-1.3-2.5L12 6l-2.5 1.3L12 8.5l1.2 2.5L14.5 8.5l2.5-1.2L14.5 6z" />
                  </svg>
                </span>
              )}
              {verified && !profile?.is_showroom && (
                <BadgeCheck className="h-6 w-6 text-blue-400" />
              )}
            </div>
            <div className="text-xs uppercase tracking-widest text-gold/80 mt-1">
              {profile?.plan_type === "showroom" ? "Showroom Account" : "Individual Account"}
            </div>

            {/* Bio */}
            {profile?.bio && (
              <p className="text-sm text-muted-foreground mt-3 max-w-lg">{profile.bio}</p>
            )}

            {/* Contact links */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-pink-500 hover:text-pink-400">
                  <Instagram className="h-4 w-4" /><span>{profile.instagram}</span>
                </a>
              )}
              {profile.phone && (access === "active" || isOwnProfile) && (
                <a href={`tel:${profile.phone}`} className="inline-flex items-center gap-1.5 text-sm text-gold hover:text-gold/80">
                  <Phone className="h-4 w-4" /><span>{profile.phone}</span>
                </a>
              )}
              {profile.phone && (access === "active" || isOwnProfile) && (
                <a href={`https://wa.me/${profile.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-green-500 hover:text-green-400">
                  <MessageCircle className="h-4 w-4" /><span>WhatsApp</span>
                </a>
              )}
              {access !== "active" && !isOwnProfile && profile.phone && (
                <span className="text-xs text-muted-foreground italic">Subscribe to view contact</span>
              )}
            </div>

            {isOwnProfile && (
              <div className="mt-3 flex gap-2 flex-wrap">
                <Button variant="ghost" size="sm" onClick={() => setShowEditProfile(true)}>
                  <Pencil className="h-4 w-4 mr-1" /> Edit Profile
                </Button>
                <Button variant="ghost" size="sm" asChild><Link to="/plans"><Crown className="h-4 w-4 text-gold" /> Upgrade</Link></Button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-3">
            <div className="rounded-xl gold-border bg-gold-soft/30 px-5 py-4 text-center min-w-[100px]">
              <div className="text-[10px] uppercase tracking-widest text-gold/80">Active</div>
              <div className="font-display text-2xl gold-text mt-1 flex items-center justify-center gap-1">
                <Car className="h-4 w-4" />{activeVehicles.length}
              </div>
            </div>
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-4 text-center min-w-[100px]">
              <div className="text-[10px] uppercase tracking-widest text-blue-400">Sold</div>
              <div className="font-display text-2xl text-blue-400 mt-1 flex items-center justify-center gap-1">
                <Tag className="h-4 w-4" />{soldVehicles.length}
              </div>
            </div>
            {isOwnProfile && me?.subscription_until && (
              <SubscriptionCountdown until={me.subscription_until} status={me.subscription_status} />
            )}
          </div>
        </div>
      </div>

      {/* Listings Tabs */}
      <div className="mt-8">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "active" ? "gold-gradient text-gold-foreground" : "bg-charcoal text-muted-foreground hover:text-foreground"}`}
          >
            Active ({activeVehicles.length})
          </button>
          <button
            onClick={() => setActiveTab("sold")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "sold" ? "gold-gradient text-gold-foreground" : "bg-charcoal text-muted-foreground hover:text-foreground"}`}
          >
            Sold ({soldVehicles.length})
          </button>
        </div>

        {displayVehicles.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">
            <Car className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <p>{activeTab === "active" ? "No active listings." : "No sold listings."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayVehicles.map((v) => (
              <SellerCard
                key={v.id}
                v={v}
                isOwner={isOwnProfile}
                onDelete={deleteListing}
                onMarkSold={markAsSold}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="max-w-md bg-background border-gold/40">
          <DialogHeader>
            <DialogTitle className="gold-text flex items-center gap-2">
              <Pencil className="h-5 w-5" /> Edit Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Avatar */}
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Profile Picture</label>
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-xl overflow-hidden gold-border bg-charcoal grid place-items-center">
                  {editAvatar ? (
                    <img src={URL.createObjectURL(editAvatar)} alt="" className="h-full w-full object-cover" />
                  ) : profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-gold">{name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditAvatar(e.target.files?.[0] ?? null)}
                    className="block w-full text-xs text-muted-foreground"
                    disabled={!canChangeAvatar()}
                  />
                  {!canChangeAvatar() && (
                    <p className="text-[10px] text-yellow-500 mt-1">Can change once per month</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Bio</label>
              <Textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Tell buyers about yourself..."
                className="bg-charcoal min-h-[80px]"
                maxLength={200}
              />
              <p className="text-[10px] text-muted-foreground mt-1">{editBio.length}/200</p>
            </div>

            {/* Showroom Name */}
            {profile?.is_showroom && (
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Showroom Name</label>
                <Input
                  value={editShowroomName}
                  onChange={(e) => setEditShowroomName(e.target.value)}
                  placeholder="Your showroom name"
                  className="bg-charcoal"
                />
              </div>
            )}

            <Button variant="gold" className="w-full" disabled={savingProfile} onClick={saveProfile}>
              {savingProfile ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TrialExpiryBanner({ trialStartedAt }: { trialStartedAt: string }) {
  const [hoursLeft, setHoursLeft] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    const calc = () => {
      const expiry = new Date(trialStartedAt).getTime() + 72 * 60 * 60 * 1000;
      setHoursLeft(Math.max(0, (expiry - Date.now()) / (1000 * 60 * 60)));
    };
    calc();
    const id = setInterval(calc, 60_000);
    return () => clearInterval(id);
  }, [trialStartedAt]);

  const daysLeft = Math.ceil(hoursLeft / 24);
  if (hoursLeft > 72) return null;

  return (
    <div className={`rounded-xl border p-4 mb-6 flex items-center justify-between ${daysLeft <= 1 ? "border-destructive bg-destructive/10" : "border-gold/40 bg-gold-soft/20"}`}>
      <div className="flex items-center gap-3">
        <AlertTriangle className={`h-5 w-5 ${daysLeft <= 1 ? "text-destructive" : "text-gold"}`} />
        <div>
          <div className="font-medium">{daysLeft <= 1 ? "Last day!" : `${Math.floor(hoursLeft)}h left`}</div>
          <div className="text-xs text-muted-foreground">Upgrade to continue posting</div>
        </div>
      </div>
      <Button variant="gold" size="sm" onClick={() => setShowPaywall(true)}><Tag className="h-4 w-4" /></Button>
      <PremiumPaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
    </div>
  );
}

function SubscriptionCountdown({ until, status }: { until: string; status: string }) {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const calc = () => setDaysLeft(Math.max(0, (new Date(until).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    calc();
    const id = setInterval(calc, 60_000);
    return () => clearInterval(id);
  }, [until]);

  if (status !== "active") return null;

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-center min-w-[100px]">
      <div className="text-[10px] uppercase tracking-widest text-emerald-400">Subscription</div>
      <div className="font-display text-2xl text-emerald-400 mt-1 flex items-center justify-center gap-2">
        <Calendar className="h-5 w-5" />{Math.ceil(daysLeft)}d
      </div>
    </div>
  );
}

function SellerCard({ v, isOwner, onDelete, onMarkSold }: { v: Vehicle; isOwner: boolean; onDelete: (id: string) => void; onMarkSold: (id: string) => void }) {
  const cover = v.photos?.[0] || v.images?.[0];
  const price = v.price_type === "fixed" ? v.fixed_price : (v.current_highest_bid ?? v.starting_price);
  return (
    <div className="group premium-card rounded-xl overflow-hidden hover:gold-border transition-all relative">
      <Link to="/vehicle/$id" params={{ id: v.id }}>
        <div className="aspect-[4/3] bg-charcoal overflow-hidden">
          {cover && <img src={cover} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" alt={`${v.brand} ${v.model}`} loading="lazy" />}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-2">
          <Link to="/vehicle/$id" params={{ id: v.id }}>
            <h3 className="font-display text-lg truncate">{v.brand} {v.model}</h3>
          </Link>
          <span className="text-xs text-muted-foreground shrink-0">{v.year}</span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{v.wilaya}</span>
          <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{v.mileage?.toLocaleString()} km</span>
        </div>
        <div className="gold-text font-display text-xl font-bold mt-2">{formatDZD(price ?? 0)}</div>

        {v.status === "sold" && (
          <div className="mt-2 inline-block text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">SOLD</div>
        )}

        {/* Owner actions */}
        {isOwner && v.status !== "sold" && (
          <div className="mt-3 flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onMarkSold(v.id)}>
              <Tag className="h-3.5 w-3.5 mr-1" /> Mark Sold
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/edit-listing/$id" params={{ id: v.id }}>
                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
              </Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(v.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
        {isOwner && v.status === "sold" && (
          <div className="mt-3 flex gap-2">
            <Button variant="destructive" size="sm" onClick={() => onDelete(v.id)}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
