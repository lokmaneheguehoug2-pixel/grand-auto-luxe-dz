import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Shield, Check, X, Eye, DollarSign, Ban, UserCheck, Crown, Users, Car, Clock, RefreshCw, Key, ChartBar as BarChart3, Activity, Tag, Megaphone, Settings, Copy, Trash2, Plus, Send, Receipt, Mail, UserX, Film, Play, Gauge, Fuel, Cog, MapPin, Calendar, FileText, Flag } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import { formatDZD } from "@/lib/format";
import { ref, onValue, set, off, get, push, remove, update } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { savePlatformSettings, fetchPlatformSettings } from "@/lib/supabase";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · GRAND Auto Luxe" }] }),
  component: AdminPage,
});

type FirebaseUser = {
  id: string;
  phone: string;
  first_name: string;
  last_name: string;
  subscription_status: "trial" | "active" | "pending" | "locked";
  subscription_tier: "basic" | "pro" | "dealer" | null;
  subscription_until: string | null;
  trial_started_at: string;
  is_banned: boolean;
  role: "admin" | "user";
  created_at: string;
  password?: string;
};

type FirebaseVehicle = {
  id: string;
  sellerId: string;
  sellerPhone?: string;
  brand: string;
  model: string;
  year: number;
  mileage?: number;
  fuel_type?: string;
  transmission?: string;
  engine_type?: string;
  status: "pending" | "active" | "sold" | "rejected";
  price_type: "fixed" | "auction";
  fixed_price: number | null;
  starting_price: number | null;
  current_highest_bid?: number | null;
  auction_ends_at?: string | null;
  wilaya: string;
  phone?: string;
  images?: string[];
  video_url?: string | null;
  description?: string;
  created_at: string;
};

type FirebaseReel = {
  id: string;
  authorId: string;
  authorPhone: string;
  videoUrl: string;
  caption: string | null;
  vehicleId: string | null;
  status?: "pending" | "active" | "rejected";
  likesCount?: number;
  viewsCount?: number;
  createdAt: string;
  author?: { first_name: string; last_name: string; phone: string } | null;
};

type Report = {
  id: string;
  contentType: "vehicle" | "reel";
  contentId: string;
  contentTitle: string;
  reporterId: string;
  reporterPhone?: string;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
};

type PromoCode = {
  id: string;
  code: string;
  tier: "individual" | "showroom";
  days_granted: number;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  created_at: string;
  is_active: boolean;
};

type Broadcast = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  sent_by: string;
};

type SiteSettings = {
  whatsapp_number: string;
  support_phone: string;
  facebook_url: string;
  instagram_url: string;
  tiktok_url: string;
  baridi_mob_number: string;
  appointment_email: string;
  gmail_address: string;
};

function AdminPage() {
  const auth = useAuth();
  const isAdmin = auth?.isAdmin ?? false;
  const loading = auth?.loading ?? true;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="animate-pulse">
          <div className="h-10 w-10 rounded-lg bg-gold/20 mb-4"></div>
          <div className="h-8 w-48 bg-gold/20 rounded mb-6"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <Shield className="h-10 w-10 text-gold mx-auto mb-3" />
        <h1 className="font-display text-2xl mb-2">Restricted</h1>
        <p className="text-muted-foreground text-sm">This area is reserved for administrators.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg gold-gradient grid place-items-center">
          <Shield className="h-5 w-5 text-gold-foreground" />
        </div>
        <h1 className="font-display text-3xl">Admin Control</h1>
      </div>

      <AnalyticsWidget />

      <Tabs defaultValue="users" className="mt-6">
        <TabsList className="bg-charcoal border border-border mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="users" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">
            <Users className="h-4 w-4 mr-1" /> Users
          </TabsTrigger>
          <TabsTrigger value="listings" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">
            <Car className="h-4 w-4 mr-1" /> Listings
          </TabsTrigger>
          <TabsTrigger value="reels" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">
            <Film className="h-4 w-4 mr-1" /> Reels
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">
            <Flag className="h-4 w-4 mr-1" /> Reports
          </TabsTrigger>
          <TabsTrigger value="promos" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">
            <Tag className="h-4 w-4 mr-1" /> Promo Codes
          </TabsTrigger>
          <TabsTrigger value="broadcast" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">
            <Megaphone className="h-4 w-4 mr-1" /> Broadcast
          </TabsTrigger>
          <TabsTrigger value="receipts" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">
            <Receipt className="h-4 w-4 mr-1" /> Receipts
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">
            <Settings className="h-4 w-4 mr-1" /> Settings
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">
            <BarChart3 className="h-4 w-4 mr-1" /> Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users"><UsersManagementTab /></TabsContent>
        <TabsContent value="listings"><ListingsTab /></TabsContent>
        <TabsContent value="reels"><ReelsModerationTab /></TabsContent>
        <TabsContent value="reports"><ReportsTab /></TabsContent>
        <TabsContent value="promos"><PromoCodesTab /></TabsContent>
        <TabsContent value="broadcast"><BroadcastTab /></TabsContent>
        <TabsContent value="receipts"><ReceiptsTab /></TabsContent>
        <TabsContent value="settings"><SettingsTab /></TabsContent>
        <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function AnalyticsWidget() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalVehicles: 0,
    pendingApprovals: 0,
  });

  useEffect(() => {
    const usersRef = ref(realtimeDb, "users");
    const vehiclesRef = ref(realtimeDb, "vehicles");

    const handleUsers = (snapshot: { val: () => Record<string, FirebaseUser> | null }) => {
      const data = snapshot.val();
      if (data) {
        const users = Object.values(data);
        setStats((prev) => ({
          ...prev,
          totalUsers: users.length,
          activeSubscriptions: users.filter((u) => u.subscription_status === "active").length,
        }));
      }
    };

    const handleVehicles = (snapshot: { val: () => Record<string, FirebaseVehicle> | null }) => {
      const data = snapshot.val();
      if (data) {
        const vehicles = Object.values(data);
        setStats((prev) => ({
          ...prev,
          totalVehicles: vehicles.length,
          pendingApprovals: vehicles.filter((v) => v.status === "pending").length,
        }));
      }
    };

    onValue(usersRef, handleUsers);
    onValue(vehiclesRef, handleVehicles);

    return () => {
      off(usersRef);
      off(vehiclesRef);
    };
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard icon={Users} label="Total Users" value={stats.totalUsers} />
      <StatCard icon={Crown} label="Active VIPs" value={stats.activeSubscriptions} color="text-green-400" />
      <StatCard icon={Car} label="Vehicles" value={stats.totalVehicles} color="text-gold" />
      <StatCard icon={Clock} label="Pending" value={stats.pendingApprovals} color="text-yellow-400" />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color?: string }) {
  return (
    <div className="premium-card rounded-xl p-4 border border-gold/20">
      <Icon className={`h-5 w-5 mb-2 ${color || "text-gold"}`} />
      <div className="text-2xl font-display">{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-widest">{label}</div>
    </div>
  );
}

function UsersManagementTab() {
  const [users, setUsers] = useState<FirebaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchPhone, setSearchPhone] = useState("");
  const [editingPassword, setEditingPassword] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const usersRef = ref(realtimeDb, "users");
    const handleSnapshot = (snapshot: { val: () => Record<string, FirebaseUser> | null }) => {
      const data = snapshot.val();
      if (data) {
        const usersList = Object.values(data);
        const sorted = usersList.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        setUsers(sorted);
      } else { setUsers([]); }
      setLoading(false);
    };
    onValue(usersRef, handleSnapshot);
    return () => off(usersRef);
  }, []);

  const toggleBan = async (user: FirebaseUser, ban: boolean) => {
    try {
      await set(ref(realtimeDb, `users/${user.phone}/is_banned`), ban);
      setUsers(users.map((u) => u.phone === user.phone ? { ...u, is_banned: ban } : u));
      toast.success(ban ? "User banned" : "User unbanned");
    } catch (err) { toast.error("Failed to update user"); }
  };

  const grantSubscription = async (user: FirebaseUser, planId: string) => {
    try {
      let days = 30;
      let tier: "individual" | "showroom" = "individual";
      if (planId === "individual-yearly" || planId === "showroom-yearly") { days = 365; }
      if (planId.startsWith("showroom")) { tier = "showroom"; }
      const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      await set(ref(realtimeDb, `users/${user.phone}/subscription_status`), "active");
      await set(ref(realtimeDb, `users/${user.phone}/subscription_until`), until);
      await set(ref(realtimeDb, `users/${user.phone}/subscription_tier`), tier);
      setUsers(users.map((u) => u.phone === user.phone ? { ...u, subscription_status: "active", subscription_until: until, subscription_tier: tier } : u));
      toast.success(`Activated for ${days} days`);
    } catch (err) { toast.error("Failed to grant subscription"); }
  };

  const deleteUser = async (user: FirebaseUser) => {
    if (user.role === "admin") { toast.error("Cannot delete admin account"); return; }
    if (!confirm(`Delete ${user.first_name} ${user.last_name}?`)) return;
    try {
      await remove(ref(realtimeDb, `users/${user.phone}`));
      setUsers(users.filter((u) => u.phone !== user.phone));
      toast.success("User deleted");
    } catch (err) { toast.error("Failed to delete user"); }
  };

  const updatePassword = async (user: FirebaseUser) => {
    if (!newPassword || newPassword.length < 4) { toast.error("Password must be at least 4 characters"); return; }
    try {
      await set(ref(realtimeDb, `users/${user.phone}/password`), newPassword);
      setUsers(users.map((u) => u.phone === user.phone ? { ...u, password: newPassword } : u));
      setEditingPassword(null); setNewPassword("");
      toast.success("Password updated");
    } catch (err) { toast.error("Failed to update password"); }
  };

  const safeString = (val: unknown): string => { try { if (val == null) return ""; return String(val).toLowerCase(); } catch { return ""; } };
  const filteredUsers = searchPhone.trim()
    ? users.filter((u) => { try { const s = safeString(searchPhone); return safeString(u?.phone).includes(s) || safeString(u?.first_name).includes(s) || safeString(u?.last_name).includes(s); } catch { return false; } })
    : users;

  if (loading) return <div className="py-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <Input placeholder="Search by phone..." value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} className="max-w-xs bg-charcoal border-border" />
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div key={user.id || user.phone} className="premium-card rounded-xl p-4 border border-gold/20 flex items-center gap-4">
            <div className="flex-1">
              <div className="font-medium flex items-center gap-2">{user.first_name} {user.last_name}{user.role === "admin" && <Badge variant="outline" className="text-xs border-gold/40 text-gold">Admin</Badge>}</div>
              <div className="text-xs text-muted-foreground">{user.phone}</div>
              <div className="text-xs flex items-center gap-2 mt-1"><span className={user.subscription_status === "active" ? "text-green-400" : "text-yellow-400"}>{user.subscription_status}</span></div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {!user.is_banned ? <Button variant="destructive" size="sm" onClick={() => toggleBan(user, true)}><Ban className="h-4 w-4" /></Button> : <Button variant="outline" size="sm" onClick={() => toggleBan(user, false)}><UserCheck className="h-4 w-4" /></Button>}
              {user.role !== "admin" && <Button variant="gold" size="sm" onClick={() => grantSubscription(user, "individual-monthly")}>IM</Button>}
              <Button variant="ghost" size="sm" onClick={() => { setEditingPassword(user.phone); setNewPassword(""); }}><Key className="h-4 w-4" /></Button>
              {user.role !== "admin" && <Button variant="destructive" size="sm" onClick={() => deleteUser(user)}><UserX className="h-4 w-4" /></Button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListingsTab() {
  const [vehicles, setVehicles] = useState<FirebaseVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [reviewVehicle, setReviewVehicle] = useState<FirebaseVehicle | null>(null);
  const [deleteVehicle, setDeleteVehicle] = useState<FirebaseVehicle | null>(null);

  useEffect(() => {
    const vehiclesRef = ref(realtimeDb, "vehicles");
    const handleSnapshot = (snapshot: { val: () => Record<string, FirebaseVehicle & { [key: string]: any }> | null }) => {
      const data = snapshot.val();
      if (data) { const vehiclesList = Object.entries(data).map(([id, v]) => ({ ...v, id })); const sorted = vehiclesList.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()); setVehicles(sorted); } else { setVehicles([]); }
      setLoading(false);
    };
    onValue(vehiclesRef, handleSnapshot);
    return () => off(vehiclesRef);
  }, []);

  const updateVehicleStatus = async (vehicle: FirebaseVehicle, status: "active" | "rejected" | "sold") => {
    try { await set(ref(realtimeDb, `vehicles/${vehicle.id}/status`), status); setVehicles(vehicles.map((v) => v.id === vehicle.id ? { ...v, status } : v)); toast.success(`Vehicle ${status}`); if (reviewVehicle?.id === vehicle.id) setReviewVehicle({ ...reviewVehicle, status }); } catch (err) { toast.error("Failed to update vehicle"); }
  };

  const deleteVehiclePermanent = async (vehicle: FirebaseVehicle) => {
    try { await remove(ref(realtimeDb, `vehicles/${vehicle.id}`)); setVehicles(vehicles.filter((v) => v.id !== vehicle.id)); setDeleteVehicle(null); if (reviewVehicle?.id === vehicle.id) setReviewVehicle(null); toast.success("Vehicle deleted permanently"); } catch (err) { toast.error("Failed to delete vehicle"); }
  };

  const filteredVehicles = statusFilter === "all" ? vehicles : vehicles.filter((v) => v.status === statusFilter);
  if (loading) return <div className="py-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-1 flex-wrap">
        {["all", "pending", "active", "sold", "rejected"].map((s) => (
          <Button key={s} variant={statusFilter === s ? "gold" : "outline"} size="sm" onClick={() => setStatusFilter(s)} className="capitalize">{s} {s === "pending" ? `(${vehicles.filter(v => v.status === "pending").length})` : ""}</Button>
        ))}
      </div>
      <div className="space-y-3">
        {filteredVehicles.map((v) => (
          <div key={v.id} className="premium-card rounded-xl p-4 border border-gold/20 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{v.brand} {v.model} ({v.year})</div>
              <div className="text-xs text-muted-foreground">{v.wilaya} · Seller: {v.sellerId?.slice(0, 8)}...</div>
              <div className="text-xs flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className={`${v.status === "active" ? "border-green-500 text-green-400" : ""} ${v.status === "pending" ? "border-yellow-500 text-yellow-400" : ""} ${v.status === "sold" ? "border-blue-500 text-blue-400" : ""} ${v.status === "rejected" ? "border-red-500 text-red-400" : ""}`}>{v.status}</Badge>
                <span className="text-muted-foreground">{v.price_type === "fixed" && v.fixed_price ? formatDZD(v.fixed_price) : v.price_type === "auction" && v.starting_price ? `Start: ${formatDZD(v.starting_price)}` : ""}</span>
                {(v.images?.length ?? 0) > 0 && <span className="text-muted-foreground flex items-center gap-1"><Eye className="h-3 w-3" /> {v.images!.length} photos</span>}
                {v.video_url && <span className="text-muted-foreground flex items-center gap-1"><Play className="h-3 w-3" /> Video</span>}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => setReviewVehicle(v)} title="Review details"><Eye className="h-4 w-4" /></Button>
              {v.status === "pending" && (<><Button variant="gold" size="sm" onClick={() => updateVehicleStatus(v, "active")} title="Approve"><Check className="h-4 w-4" /></Button><Button variant="destructive" size="sm" onClick={() => updateVehicleStatus(v, "rejected")} title="Reject"><X className="h-4 w-4" /></Button></>)}
              {v.status === "active" && <Button variant="outline" size="sm" onClick={() => updateVehicleStatus(v, "sold")} title="Mark Sold"><DollarSign className="h-4 w-4" /></Button>}
              <Button variant="destructive" size="sm" onClick={() => setDeleteVehicle(v)} title="Delete permanently"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
      {reviewVehicle && (<Dialog open={!!reviewVehicle} onOpenChange={(open) => { if (!open) setReviewVehicle(null); }}><DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-gold/40"><DialogHeader><DialogTitle className="gold-text flex items-center gap-2"><Car className="h-5 w-5" /> Review Listing</DialogTitle></DialogHeader><div className="space-y-4">{(reviewVehicle.images?.length ?? 0) > 0 && (<div><div className="text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1"><Eye className="h-3 w-3" /> Photos ({reviewVehicle.images!.length})</div><Carousel className="w-full"><CarouselContent>{reviewVehicle.images!.map((url, i) => (<CarouselItem key={i}><img src={url} alt={`${reviewVehicle.brand} ${reviewVehicle.model} - Photo ${i + 1}`} className="w-full aspect-[4/3] object-cover rounded-lg" /></CarouselItem>))}</CarouselContent>{reviewVehicle.images!.length > 1 && (<><CarouselPrevious className="left-2 bg-black/70 border-gold/40 text-gold hover:bg-black/90" /><CarouselNext className="right-2 bg-black/70 border-gold/40 text-gold hover:bg-black/90" /></>)}</Carousel></div>)}{reviewVehicle.video_url && (<div><div className="text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1"><Play className="h-3 w-3" /> Video</div><video src={reviewVehicle.video_url} controls className="w-full rounded-lg max-h-[400px] object-contain bg-black" /></div>)}<div className="premium-card rounded-xl p-4 border border-gold/20 space-y-3"><div className="flex items-center gap-2"><Badge variant="outline" className={`${reviewVehicle.status === "active" ? "border-green-500 text-green-400" : ""} ${reviewVehicle.status === "pending" ? "border-yellow-500 text-yellow-400" : ""} ${reviewVehicle.status === "sold" ? "border-blue-500 text-blue-400" : ""} ${reviewVehicle.status === "rejected" ? "border-red-500 text-red-400" : ""}`}>{reviewVehicle.status}</Badge><span className="text-xs text-muted-foreground">Listed {new Date(reviewVehicle.created_at).toLocaleString()}</span></div><div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm"><div><span className="text-muted-foreground">Brand:</span> {reviewVehicle.brand}</div><div><span className="text-muted-foreground">Model:</span> {reviewVehicle.model}</div><div><span className="text-muted-foreground">Year:</span> {reviewVehicle.year}</div>{reviewVehicle.mileage != null && <div className="flex items-center gap-1"><Gauge className="h-3 w-3 text-muted-foreground" /> <span className="text-muted-foreground">Mileage:</span> {reviewVehicle.mileage.toLocaleString()} km</div>}{reviewVehicle.fuel_type && <div className="flex items-center gap-1"><Fuel className="h-3 w-3 text-muted-foreground" /> <span className="text-muted-foreground">Fuel:</span> {reviewVehicle.fuel_type}</div>}{reviewVehicle.transmission && <div className="flex items-center gap-1"><Cog className="h-3 w-3 text-muted-foreground" /> <span className="text-muted-foreground">Transmission:</span> {reviewVehicle.transmission}</div>}<div className="flex items-center gap-1"><MapPin className="h-3 w-3 text-muted-foreground" /> <span className="text-muted-foreground">Wilaya:</span> {reviewVehicle.wilaya}</div>{reviewVehicle.engine_type && <div><span className="text-muted-foreground">Engine:</span> {reviewVehicle.engine_type}</div>}<div><span className="text-muted-foreground">Seller ID:</span> {reviewVehicle.sellerId?.slice(0, 12)}...</div>{reviewVehicle.sellerPhone && <div><span className="text-muted-foreground">Seller Phone:</span> {reviewVehicle.sellerPhone}</div>}{reviewVehicle.phone && <div><span className="text-muted-foreground">Contact:</span> {reviewVehicle.phone}</div>}</div><div className="border-t border-border/60 pt-3"><div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Pricing</div>{reviewVehicle.price_type === "fixed" ? (<div className="text-lg gold-text font-display">{formatDZD(reviewVehicle.fixed_price)}</div>) : (<div className="space-y-1"><div className="text-sm"><span className="text-muted-foreground">Starting:</span> {formatDZD(reviewVehicle.starting_price)}</div>{reviewVehicle.current_highest_bid != null && <div className="text-sm"><span className="text-muted-foreground">Current bid:</span> {formatDZD(reviewVehicle.current_highest_bid)}</div>}{reviewVehicle.auction_ends_at && <div className="text-sm"><span className="text-muted-foreground">Auction ends:</span> {new Date(reviewVehicle.auction_ends_at).toLocaleString()}</div>}</div>)}</div>{reviewVehicle.description && (<div className="border-t border-border/60 pt-3"><div className="text-xs uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1"><FileText className="h-3 w-3" /> Description</div><p className="text-sm text-muted-foreground whitespace-pre-wrap">{reviewVehicle.description}</p></div>)}</div><div className="flex gap-2 flex-wrap">{reviewVehicle.status === "pending" && (<><Button variant="gold" onClick={() => updateVehicleStatus(reviewVehicle, "active")}><Check className="h-4 w-4 mr-1" /> Approve</Button><Button variant="destructive" onClick={() => updateVehicleStatus(reviewVehicle, "rejected")}><X className="h-4 w-4 mr-1" /> Reject</Button></>)}{reviewVehicle.status === "active" && <Button variant="outline" onClick={() => updateVehicleStatus(reviewVehicle, "sold")}><DollarSign className="h-4 w-4 mr-1" /> Mark Sold</Button>}<Button variant="destructive" onClick={() => setDeleteVehicle(reviewVehicle)}><Trash2 className="h-4 w-4 mr-1" /> Delete Permanently</Button></div></div></DialogContent></Dialog>)}
      {deleteVehicle && (<Dialog open={!!deleteVehicle} onOpenChange={(open) => { if (!open) setDeleteVehicle(null); }}><DialogContent className="max-w-sm bg-background border-red-500/40"><DialogHeader><DialogTitle className="text-red-500">Delete Listing Permanently</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground">Are you sure you want to permanently delete <strong>{deleteVehicle.brand} {deleteVehicle.model} ({deleteVehicle.year})</strong>? This action cannot be undone.</p><div className="flex gap-2 mt-4"><Button variant="destructive" onClick={() => deleteVehiclePermanent(deleteVehicle)}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button><Button variant="ghost" onClick={() => setDeleteVehicle(null)}>Cancel</Button></div></DialogContent></Dialog>)}
    </div>
  );
}

function ReelsModerationTab() {
  const [reels, setReels] = useState<FirebaseReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewReel, setReviewReel] = useState<FirebaseReel | null>(null);
  const [deleteReel, setDeleteReel] = useState<FirebaseReel | null>(null);

  useEffect(() => {
    const reelsRef = ref(realtimeDb, "reels");
    const handleSnapshot = async (snapshot: { val: () => Record<string, any> | null }) => {
      const data = snapshot.val();
      if (!data) { setReels([]); setLoading(false); return; }
      const reelList: FirebaseReel[] = Object.entries(data).map(([id, v]) => ({ id, authorId: v.authorId || "", authorPhone: v.authorPhone || "", videoUrl: v.videoUrl || "", caption: v.caption || null, vehicleId: v.vehicleId || null, status: v.status || "active", likesCount: Number(v.likesCount) || 0, viewsCount: Number(v.viewsCount) || 0, createdAt: v.createdAt || new Date().toISOString() }));
      reelList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const authorPhones = Array.from(new Set(reelList.map((r) => r.authorPhone).filter(Boolean)));
      const profileSnaps = await Promise.all(authorPhones.map((phone) => get(ref(realtimeDb, `users/${phone}`)).catch(() => null)));
      const profileMap = new Map<string, any>();
      authorPhones.forEach((phone, i) => { if (profileSnaps[i]?.exists()) profileMap.set(phone, profileSnaps[i].val()); });
      setReels(reelList.map((r) => ({ ...r, author: profileMap.get(r.authorPhone) || null })));
      setLoading(false);
    };
    onValue(reelsRef, handleSnapshot);
    return () => off(reelsRef);
  }, []);

  const updateReelStatus = async (reel: FirebaseReel, status: "active" | "rejected") => {
    try { await set(ref(realtimeDb, `reels/${reel.id}/status`), status); setReels(reels.map((r) => r.id === reel.id ? { ...r, status } : r)); toast.success(`Reel ${status}`); if (reviewReel?.id === reel.id) setReviewReel({ ...reviewReel, status }); } catch (err) { toast.error("Failed to update reel"); }
  };

  const deleteReelPermanent = async (reel: FirebaseReel) => {
    try { await remove(ref(realtimeDb, `reels/${reel.id}`)); setReels(reels.filter((r) => r.id !== reel.id)); setDeleteReel(null); if (reviewReel?.id === reel.id) setReviewReel(null); toast.success("Reel deleted permanently"); } catch (err) { toast.error("Failed to delete reel"); }
  };

  if (loading) return <div className="py-10 text-center text-muted-foreground">Loading reels...</div>;

  return (
    <div className="space-y-4">
      <span className="text-sm text-muted-foreground">{reels.length} reels</span>
      <div className="space-y-3">
        {reels.map((r) => (
          <div key={r.id} className="premium-card rounded-xl p-4 border border-gold/20 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{r.author?.first_name || "Unknown"} {r.author?.last_name || ""}</div>
              <div className="text-xs text-muted-foreground">{r.authorPhone || "No phone"} · {new Date(r.createdAt).toLocaleDateString()}</div>
              <div className="text-xs flex items-center gap-2 mt-1 flex-wrap">{r.caption && <span className="text-muted-foreground truncate max-w-xs">"{r.caption}"</span>}<span className="text-muted-foreground">Likes: {r.likesCount || 0}</span><span className="text-muted-foreground">Views: {r.viewsCount || 0}</span></div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => setReviewReel(r)} title="Review & play video"><Eye className="h-4 w-4" /></Button>
              {r.status === "pending" && (<><Button variant="gold" size="sm" onClick={() => updateReelStatus(r, "active")} title="Approve"><Check className="h-4 w-4" /></Button><Button variant="destructive" size="sm" onClick={() => updateReelStatus(r, "rejected")} title="Reject"><X className="h-4 w-4" /></Button></>)}
              <Button variant="destructive" size="sm" onClick={() => setDeleteReel(r)} title="Delete permanently"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
      {reviewReel && (<Dialog open={!!reviewReel} onOpenChange={(open) => { if (!open) setReviewReel(null); }}><DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-gold/40"><DialogHeader><DialogTitle className="gold-text flex items-center gap-2"><Film className="h-5 w-5" /> Review Reel</DialogTitle></DialogHeader><div className="space-y-4">{reviewReel.videoUrl && (<div><div className="text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1"><Play className="h-3 w-3" /> Video</div><video src={reviewReel.videoUrl} controls className="w-full rounded-lg max-h-[500px] object-contain bg-black" /></div>)}<div className="premium-card rounded-xl p-4 border border-gold/20 space-y-2 text-sm"><div><span className="text-muted-foreground">Author:</span> {reviewReel.author?.first_name || "Unknown"} {reviewReel.author?.last_name || ""}</div><div><span className="text-muted-foreground">Phone:</span> {reviewReel.authorPhone || "N/A"}</div><div><span className="text-muted-foreground">Created:</span> {new Date(reviewReel.createdAt).toLocaleString()}</div><div><span className="text-muted-foreground">Likes:</span> {reviewReel.likesCount || 0} · <span className="text-muted-foreground">Views:</span> {reviewReel.viewsCount || 0}</div>{reviewReel.vehicleId && <div><span className="text-muted-foreground">Linked vehicle:</span> {reviewReel.vehicleId}</div>}{reviewReel.caption && (<div className="border-t border-border/60 pt-2"><div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Caption</div><p className="text-muted-foreground whitespace-pre-wrap">{reviewReel.caption}</p></div>)}</div><div className="flex gap-2 flex-wrap">{reviewReel.status === "pending" && (<><Button variant="gold" onClick={() => updateReelStatus(reviewReel, "active")}><Check className="h-4 w-4 mr-1" /> Approve</Button><Button variant="destructive" onClick={() => updateReelStatus(reviewReel, "rejected")}><X className="h-4 w-4 mr-1" /> Reject</Button></>)}<Button variant="destructive" onClick={() => setDeleteReel(reviewReel)}><Trash2 className="h-4 w-4 mr-1" /> Delete Permanently</Button></div></div></DialogContent></Dialog>)}
      {deleteReel && (<Dialog open={!!deleteReel} onOpenChange={(open) => { if (!open) setDeleteReel(null); }}><DialogContent className="max-w-sm bg-background border-red-500/40"><DialogHeader><DialogTitle className="text-red-500">Delete Reel Permanently</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground">Are you sure you want to permanently delete this reel? This action cannot be undone.</p><div className="flex gap-2 mt-4"><Button variant="destructive" onClick={() => deleteReelPermanent(deleteReel)}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button><Button variant="ghost" onClick={() => setDeleteReel(null)}>Cancel</Button></div></DialogContent></Dialog>)}
    </div>
  );
}

function ReportsTab() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reportsRef = ref(realtimeDb, "reports");
    const handleSnapshot = (snapshot: { val: () => Record<string, Report> | null }) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReports(list);
      } else { setReports([]); }
      setLoading(false);
    };
    onValue(reportsRef, handleSnapshot);
    return () => off(reportsRef);
  }, []);

  const resolveReport = async (report: Report) => {
    try { await update(ref(realtimeDb, `reports/${report.id}/status`), "resolved"); setReports(reports.map((r) => r.id === report.id ? { ...r, status: "resolved" } : r)); toast.success("Report resolved"); } catch { toast.error("Failed to resolve"); }
  };

  const dismissReport = async (report: Report) => {
    try { await update(ref(realtimeDb, `reports/${report.id}/status`), "dismissed"); setReports(reports.map((r) => r.id === report.id ? { ...r, status: "dismissed" } : r)); toast.success("Report dismissed"); } catch { toast.error("Failed to dismiss"); }
  };

  const deleteReport = async (report: Report) => {
    try { await remove(ref(realtimeDb, `reports/${report.id}`)); setReports(reports.filter((r) => r.id !== report.id)); toast.success("Report deleted"); } catch { toast.error("Failed to delete"); }
  };

  if (loading) return <div className="py-10 text-center text-muted-foreground">Loading reports...</div>;

  const pending = reports.filter((r) => r.status === "pending");

  return (
    <div className="space-y-4">
      <span className="text-sm text-muted-foreground">{pending.length} pending · {reports.length} total</span>
      <div className="space-y-3">
        {reports.length === 0 && <div className="text-muted-foreground text-center py-8">No reports.</div>}
        {reports.map((r) => (
          <div key={r.id} className="premium-card rounded-xl p-4 border border-gold/20">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Flag className="h-4 w-4 text-destructive" />
                  <span className="font-medium text-sm">{r.contentTitle}</span>
                  <Badge variant="outline" className={r.status === "pending" ? "border-yellow-500 text-yellow-400" : r.status === "resolved" ? "border-green-500 text-green-400" : "border-gray-500 text-gray-400"}>{r.status}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-1">Type: {r.contentType} · By: {r.reporterId?.slice(0, 8)}... · {new Date(r.createdAt).toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-1">"{r.reason}"</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {r.contentType === "vehicle" && <Button variant="outline" size="sm" onClick={() => window.open(`/vehicle/${r.contentId}`, "_blank")}><Eye className="h-4 w-4" /></Button>}
                {r.status === "pending" && (<><Button variant="gold" size="sm" onClick={() => resolveReport(r)}><Check className="h-4 w-4" /></Button><Button variant="ghost" size="sm" onClick={() => dismissReport(r)}><X className="h-4 w-4" /></Button></>)}
                <Button variant="destructive" size="sm" onClick={() => deleteReport(r)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PromoCodesTab() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newPromo, setNewPromo] = useState({ code: "", tier: "individual" as "individual" | "showroom", days_granted: 7, max_uses: 100 });

  useEffect(() => {
    const promosRef = ref(realtimeDb, "promo_codes");
    const handleSnapshot = (snapshot: { val: () => Record<string, any> | null }) => {
      try {
        const data = snapshot.val();
        if (!data || typeof data !== "object") { setPromoCodes([]); setLoading(false); return; }
        const safePromoList: PromoCode[] = Object.entries(data).map(([id, v]) => ({ id: id || "unknown", code: String(v?.code || "UNKNOWN").toUpperCase(), tier: (v?.tier === "showroom" || v?.tier === "individual") ? v.tier : "individual", days_granted: Number(v?.days_granted ?? 7) || 7, max_uses: v?.max_uses != null ? Number(v.max_uses) : null, uses_count: Number(v?.uses_count ?? 0) || 0, expires_at: v?.expires_at || null, created_at: v?.created_at || new Date().toISOString(), is_active: Boolean(v?.is_active ?? true) }));
        setPromoCodes(safePromoList);
      } catch (err) { setPromoCodes([]); }
      setLoading(false);
    };
    onValue(promosRef, handleSnapshot);
    return () => off(promosRef);
  }, []);

  const createPromoCode = async () => {
    if (!newPromo.code || newPromo.code.length < 3) { toast.error("Code too short"); return; }
    try { const promoRef = push(ref(realtimeDb, "promo_codes")); const promo: PromoCode = { id: promoRef.key!, code: newPromo.code.toUpperCase(), tier: newPromo.tier, days_granted: newPromo.days_granted, max_uses: newPromo.max_uses, uses_count: 0, expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), created_at: new Date().toISOString(), is_active: true }; await set(promoRef, promo); setPromoCodes([...promoCodes, promo]); setShowCreate(false); setNewPromo({ code: "", tier: "individual", days_granted: 7, max_uses: 100 }); toast.success("Created"); } catch { toast.error("Failed"); }
  };

  const deletePromoCode = async (id: string) => { try { await remove(ref(realtimeDb, `promo_codes/${id}`)); setPromoCodes(promoCodes.filter((p) => p.id !== id)); toast.success("Deleted"); } catch { toast.error("Failed"); } };
  const toggleActive = async (promo: PromoCode) => { try { await set(ref(realtimeDb, `promo_codes/${promo.id}/is_active`), !promo.is_active); setPromoCodes(promoCodes.map((p) => p.id === promo.id ? { ...p, is_active: !promo.is_active } : p)); toast.success("Updated"); } catch { toast.error("Failed"); } };

  if (loading) return <div className="py-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">{promoCodes.length} promo codes</span><Button variant="gold" size="sm" onClick={() => setShowCreate(!showCreate)}><Plus className="h-4 w-4 mr-1" /> Create</Button></div>
      {showCreate && (<div className="premium-card rounded-xl p-4 border border-gold/20 space-y-3"><div className="grid grid-cols-2 md:grid-cols-4 gap-3"><Input value={newPromo.code} onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })} placeholder="CODE" className="bg-charcoal" /><select value={newPromo.tier} onChange={(e) => setNewPromo({ ...newPromo, tier: e.target.value as any })} className="h-10 rounded-md border bg-charcoal px-3"><option value="individual">Individual</option><option value="showroom">Showroom</option></select><Input type="number" value={newPromo.days_granted} onChange={(e) => setNewPromo({ ...newPromo, days_granted: Number(e.target.value) || 7 })} className="bg-charcoal" /><Input type="number" value={newPromo.max_uses} onChange={(e) => setNewPromo({ ...newPromo, max_uses: Number(e.target.value) || 100 })} className="bg-charcoal" /></div><Button variant="gold" size="sm" onClick={createPromoCode}>Create</Button></div>)}
      <div className="space-y-3">{promoCodes.map((promo) => (<div key={promo.id} className="premium-card rounded-xl p-4 border border-gold/20 flex items-center gap-4"><div className="flex-1"><div className="font-medium flex items-center gap-2">{promo.code}{promo.is_active ? <Badge className="bg-green-500/20 text-green-400">Active</Badge> : <Badge variant="outline">Inactive</Badge>}</div><div className="text-xs text-muted-foreground">{promo.tier} / {promo.days_granted}d / {promo.uses_count}/{promo.max_uses || "inf"}</div></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => toggleActive(promo)}>{promo.is_active ? "Off" : "On"}</Button><Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(promo.code); toast.success("Copied"); }}><Copy className="h-4 w-4" /></Button><Button variant="destructive" size="sm" onClick={() => deletePromoCode(promo.id)}><Trash2 className="h-4 w-4" /></Button></div></div>))}</div>
    </div>
  );
}

function BroadcastTab() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    const broadcastsRef = ref(realtimeDb, "broadcasts");
    const handleSnapshot = (snapshot: { val: () => Record<string, Broadcast> | null }) => {
      const data = snapshot.val();
      if (data) setBroadcasts(Object.values(data).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      else setBroadcasts([]);
      setLoading(false);
    };
    onValue(broadcastsRef, handleSnapshot);
    return () => off(broadcastsRef);
  }, []);

  const sendBroadcast = async () => {
    if (!title.trim() || !body.trim()) { toast.error("Required"); return; }
    try { const broadcastRef = push(ref(realtimeDb, "broadcasts")); const broadcast: Broadcast = { id: broadcastRef.key!, title, body, created_at: new Date().toISOString(), sent_by: "admin" }; await set(broadcastRef, broadcast); setBroadcasts([broadcast, ...broadcasts]); setTitle(""); setBody(""); toast.success("Sent"); } catch { toast.error("Failed"); }
  };

  if (loading) return <div className="py-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="premium-card rounded-xl p-4 border border-gold/20 space-y-3"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="bg-charcoal" /><Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message" className="bg-charcoal min-h-[100px]" /><Button variant="gold" onClick={sendBroadcast}><Send className="h-4 w-4 mr-2" />Send</Button></div>
      <div className="space-y-3">{broadcasts.map((b) => (<div key={b.id} className="premium-card rounded-xl p-4 border border-gold/20"><div className="font-medium">{b.title}</div><div className="text-sm text-muted-foreground mt-1">{b.body}</div></div>))}</div>
    </div>
  );
}

function SettingsTab() {
  const [settings, setSettings] = useState<SiteSettings>({ whatsapp_number: "", support_phone: "", facebook_url: "", instagram_url: "", tiktok_url: "", baridi_mob_number: "", appointment_email: "", gmail_address: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const settingsRef = ref(realtimeDb, "site_settings");
    const handleSnapshot = (snapshot: { val: () => SiteSettings | null }) => { const data = snapshot.val(); if (data) setSettings(prev => ({ ...prev, ...data })); setLoading(false); };
    onValue(settingsRef, handleSnapshot);
    fetchPlatformSettings().then((supaData) => { if (supaData) setSettings(prev => ({ ...prev, ...supaData })); }).catch(() => {});
    return () => off(settingsRef);
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try { await set(ref(realtimeDb, "site_settings"), settings); await savePlatformSettings(settings); toast.success("Settings saved"); } catch { toast.error("Failed to save"); }
    setSaving(false);
  };

  if (loading) return <div className="py-10 text-center text-muted-foreground">Loading...</div>;

  const fields: { key: keyof SiteSettings; label: string; placeholder: string; type?: string }[] = [
    { key: "whatsapp_number", label: "WhatsApp Number", placeholder: "213XXXXXXXXX" },
    { key: "support_phone", label: "Support Phone", placeholder: "0XXXXXXXXX" },
    { key: "facebook_url", label: "Facebook URL", placeholder: "https://facebook.com/..." },
    { key: "instagram_url", label: "Instagram URL", placeholder: "https://instagram.com/..." },
    { key: "tiktok_url", label: "TikTok URL", placeholder: "https://tiktok.com/@..." },
    { key: "baridi_mob_number", label: "Baridi Mob (CCP) Number", placeholder: "CCP / Baridi Mob number" },
    { key: "gmail_address", label: "Contact Email (Gmail)", placeholder: "contact@gmail.com", type: "email" },
    { key: "appointment_email", label: "Appointment Notification Email", placeholder: "appointments@...", type: "email" },
  ];

  return (
    <div className="space-y-6">
      <div><h3 className="text-sm font-semibold text-gold mb-1">Customer Service Contact Channels</h3><p className="text-xs text-muted-foreground mb-4">Configure all contact channels displayed in the footer.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((f) => (<div key={f.key} className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{f.label}</label><Input value={settings[f.key] || ""} onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })} placeholder={f.placeholder} type={f.type || "text"} className="bg-charcoal" /></div>))}
      </div>
      <Button variant="gold" onClick={saveSettings} disabled={saving}>{saving ? "Saving..." : "Save Settings"}</Button>
      <WeeklyReminderSection />
    </div>
  );
}

function WeeklyReminderSection() {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ remindersSent: number; message: string } | null>(null);

  const sendReminders = async () => {
    setSending(true);
    setResult(null);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const firebaseDbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL;

      if (!firebaseDbUrl) {
        toast.error("Firebase database URL not configured. Set VITE_FIREBASE_DATABASE_URL in your environment.");
        return;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/weekly-unsold-reminder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseDbUrl }),
      });
      const data = await response.json();
      if (response.ok) {
        setResult({ remindersSent: data.remindersSent || 0, message: data.message || "Reminders sent" });
        toast.success(`${data.remindersSent || 0} reminder(s) sent to owners of unsold listings`);
      } else {
        throw new Error(data.error || "Failed to send reminders");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to send reminders");
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="premium-card rounded-xl p-4 border border-gold/20">
      <h3 className="font-medium mb-3 flex items-center gap-2"><Clock className="h-5 w-5 text-gold" />Automated Weekly Reminder — Unsold Listings</h3>
      <p className="text-sm text-muted-foreground mb-3">Sends a notification to owners of unsold (active) listings older than 7 days: "Is your vehicle still available? Please update your listing status or mark it as sold."</p>
      <div className="flex items-center gap-3">
        <Button variant="gold" onClick={sendReminders} disabled={sending}>{sending ? (<><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Sending reminders...</>) : (<><Send className="h-4 w-4 mr-2" /> Send Reminders Now</>)}</Button>
        {result && <span className="text-sm text-green-400">{result.remindersSent} reminder(s) sent successfully</span>}
      </div>
      <p className="text-xs text-muted-foreground mt-2">This runs automatically every 7 days via a scheduled edge function. Use the button above to trigger it manually.</p>
    </div>
  );
}

function AnalyticsTab() {
  const [analytics, setAnalytics] = useState({ totalUsers: 0, activeSubscriptions: 0, trialUsers: 0, totalVehicles: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const usersSnap = await get(ref(realtimeDb, "users"));
      const vehiclesSnap = await get(ref(realtimeDb, "vehicles"));
      const users = usersSnap.val() ? Object.values(usersSnap.val()) as FirebaseUser[] : [];
      const vehicles = vehiclesSnap.val() ? Object.values(vehiclesSnap.val()) as FirebaseVehicle[] : [];
      setAnalytics({ totalUsers: users.length, activeSubscriptions: users.filter((u) => u.subscription_status === "active").length, trialUsers: users.filter((u) => u.subscription_status === "trial").length, totalVehicles: vehicles.length });
      setLoading(false);
    };
    loadStats();
  }, []);

  if (loading) return <div className="py-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div><div className="text-2xl font-display">{analytics.totalUsers}</div><div className="text-xs text-muted-foreground">Users</div></div>
      <div><div className="text-2xl font-display text-gold">{analytics.activeSubscriptions}</div><div className="text-xs text-muted-foreground">Active</div></div>
      <div><div className="text-2xl font-display">{analytics.trialUsers}</div><div className="text-xs text-muted-foreground">Trial</div></div>
      <div><div className="text-2xl font-display">{analytics.totalVehicles}</div><div className="text-xs text-muted-foreground">Vehicles</div></div>
    </div>
  );
}

function ReceiptsTab() {
  const [subscriptions, setSubscriptions] = useState<{ id: string; userPhone: string; plan: string; status: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subsRef = ref(realtimeDb, "subscriptions");
    const handle = (snapshot: { val: () => Record<string, any> | null }) => {
      const data = snapshot.val();
      if (data) setSubscriptions(Object.entries(data).map(([id, v]) => ({ id, userPhone: v.userPhone || "", plan: v.plan || "", status: v.status || "pending" })));
      else setSubscriptions([]);
      setLoading(false);
    };
    onValue(subsRef, handle);
    return () => off(subsRef);
  }, []);

  if (loading) return <div className="py-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-3">
      {subscriptions.filter((s) => s.status === "pending").map((s) => (
        <div key={s.id} className="premium-card rounded-xl p-4 border border-gold/20">{s.plan} / {s.userPhone}</div>
      ))}
    </div>
  );
}
