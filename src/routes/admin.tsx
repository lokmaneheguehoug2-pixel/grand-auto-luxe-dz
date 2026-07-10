import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Check, X, Eye, DollarSign, Ban, UserCheck, Crown, Users, Car, Clock, RefreshCw, Key, ChartBar as BarChart3, Activity, Tag, Megaphone, Settings, Copy, Trash2, Plus, Send, Receipt, Mail, UserX } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import { formatDZD } from "@/lib/format";
import { ref, onValue, set, off, get, push, remove } from "firebase/database";
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
  brand: string;
  model: string;
  year: number;
  status: "pending" | "active" | "sold" | "rejected";
  price_type: "fixed" | "auction";
  fixed_price: number | null;
  starting_price: number | null;
  wilaya: string;
  created_at: string;
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
        const sorted = usersList.sort((a, b) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        setUsers(sorted);
      } else {
        setUsers([]);
      }
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
    } catch (err) {
      toast.error("Failed to update user");
    }
  };

  const grantSubscription = async (user: FirebaseUser, planId: string) => {
    try {
      let days = 30;
      let tier: "individual" | "showroom" = "individual";

      if (planId === "individual-yearly" || planId === "showroom-yearly") {
        days = 365;
      }
      if (planId.startsWith("showroom")) {
        tier = "showroom";
      }

      const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

      await set(ref(realtimeDb, `users/${user.phone}/subscription_status`), "active");
      await set(ref(realtimeDb, `users/${user.phone}/subscription_until`), until);
      await set(ref(realtimeDb, `users/${user.phone}/subscription_tier`), tier);

      setUsers(users.map((u) => u.phone === user.phone ? {
        ...u,
        subscription_status: "active",
        subscription_until: until,
        subscription_tier: tier,
      } : u));

      toast.success(`Activated for ${days} days`);
    } catch (err) {
      toast.error("Failed to grant subscription");
    }
  };

  const deleteUser = async (user: FirebaseUser) => {
    if (user.role === "admin") {
      toast.error("Cannot delete admin account");
      return;
    }
    if (!confirm(`Delete ${user.first_name} ${user.last_name}?`)) return;
    try {
      await remove(ref(realtimeDb, `users/${user.phone}`));
      setUsers(users.filter((u) => u.phone !== user.phone));
      toast.success("User deleted");
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  const updatePassword = async (user: FirebaseUser) => {
    if (!newPassword || newPassword.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }
    try {
      await set(ref(realtimeDb, `users/${user.phone}/password`), newPassword);
      setUsers(users.map((u) => u.phone === user.phone ? { ...u, password: newPassword } : u));
      setEditingPassword(null);
      setNewPassword("");
      toast.success("Password updated");
    } catch (err) {
      toast.error("Failed to update password");
    }
  };

  const safeString = (val: unknown): string => {
    try {
      if (val == null) return "";
      return String(val).toLowerCase();
    } catch {
      return "";
    }
  };

  const filteredUsers = searchPhone.trim()
    ? users.filter((u) => {
        try {
          const searchLower = safeString(searchPhone);
          return safeString(u?.phone).includes(searchLower) ||
            safeString(u?.first_name).includes(searchLower) ||
            safeString(u?.last_name).includes(searchLower);
        } catch {
          return false;
        }
      })
    : users;

  if (loading) return <div className="py-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by phone..."
        value={searchPhone}
        onChange={(e) => setSearchPhone(e.target.value)}
        className="max-w-xs bg-charcoal border-border"
      />
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div key={user.id || user.phone} className="premium-card rounded-xl p-4 border border-gold/20 flex items-center gap-4">
            <div className="flex-1">
              <div className="font-medium flex items-center gap-2">
                {user.first_name} {user.last_name}
                {user.role === "admin" && <Badge variant="outline" className="text-xs border-gold/40 text-gold">Admin</Badge>}
              </div>
              <div className="text-xs text-muted-foreground">{user.phone}</div>
              <div className="text-xs flex items-center gap-2 mt-1">
                <span className={user.subscription_status === "active" ? "text-green-400" : "text-yellow-400"}>
                  {user.subscription_status}
                </span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {!user.is_banned ? (
                <Button variant="destructive" size="sm" onClick={() => toggleBan(user, true)}><Ban className="h-4 w-4" /></Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => toggleBan(user, false)}><UserCheck className="h-4 w-4" /></Button>
              )}
              {user.role !== "admin" && (
                <Button variant="gold" size="sm" onClick={() => grantSubscription(user, "individual-monthly")}>IM</Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => { setEditingPassword(user.phone); setNewPassword(""); }}><Key className="h-4 w-4" /></Button>
              {user.role !== "admin" && (
                <Button variant="destructive" size="sm" onClick={() => deleteUser(user)}><UserX className="h-4 w-4" /></Button>
              )}
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

  useEffect(() => {
    const vehiclesRef = ref(realtimeDb, "vehicles");
    const handleSnapshot = (snapshot: { val: () => Record<string, FirebaseVehicle & { [key: string]: any }> | null }) => {
      const data = snapshot.val();
      if (data) {
        const vehiclesList = Object.entries(data).map(([id, v]) => ({ ...v, id }));
        const sorted = vehiclesList.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        setVehicles(sorted);
      } else {
        setVehicles([]);
      }
      setLoading(false);
    };
    onValue(vehiclesRef, handleSnapshot);
    return () => off(vehiclesRef);
  }, []);

  const updateVehicleStatus = async (vehicle: FirebaseVehicle, status: "active" | "rejected" | "sold") => {
    try {
      await set(ref(realtimeDb, `vehicles/${vehicle.id}/status`), status);
      setVehicles(vehicles.map((v) => v.id === vehicle.id ? { ...v, status } : v));
      toast.success(`Vehicle ${status}`);
    } catch (err) {
      toast.error("Failed to update vehicle");
    }
  };

  const filteredVehicles = statusFilter === "all" ? vehicles : vehicles.filter((v) => v.status === statusFilter);

  if (loading) return <div className="py-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {["all", "pending", "active", "sold", "rejected"].map((s) => (
          <Button key={s} variant={statusFilter === s ? "gold" : "outline"} size="sm" onClick={() => setStatusFilter(s)}>{s}</Button>
        ))}
      </div>
      <div className="space-y-3">
        {filteredVehicles.map((v) => (
          <div key={v.id} className="premium-card rounded-xl p-4 border border-gold/20 flex items-center gap-4">
            <div className="flex-1">
              <div className="font-medium">{v.brand} {v.model} ({v.year})</div>
              <div className="text-xs text-muted-foreground">{v.wilaya}</div>
            </div>
            <div className="flex gap-2">
              {v.status === "pending" && (
                <>
                  <Button variant="gold" size="sm" onClick={() => updateVehicleStatus(v, "active")}><Check className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="sm" onClick={() => updateVehicleStatus(v, "rejected")}><X className="h-4 w-4" /></Button>
                </>
              )}
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
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newPromo, setNewPromo] = useState({ code: "", tier: "individual" as "individual" | "showroom", days_granted: 7, max_uses: 100 });

  useEffect(() => {
    const promosRef = ref(realtimeDb, "promo_codes");
    const handleSnapshot = (snapshot: { val: () => Record<string, any> | null }) => {
      try {
        setError(null);
        const data = snapshot.val();
        if (!data || typeof data !== "object") { setPromoCodes([]); setLoading(false); return; }
        const safePromoList: PromoCode[] = Object.entries(data).map(([id, v]) => ({
          id: id || "unknown",
          code: String(v?.code || "UNKNOWN").toUpperCase(),
          tier: (v?.tier === "showroom" || v?.tier === "individual") ? v.tier : "individual",
          days_granted: Number(v?.days_granted ?? 7) || 7,
          max_uses: v?.max_uses != null ? Number(v.max_uses) : null,
          uses_count: Number(v?.uses_count ?? 0) || 0,
          expires_at: v?.expires_at || null,
          created_at: v?.created_at || new Date().toISOString(),
          is_active: Boolean(v?.is_active ?? true),
        }));
        setPromoCodes(safePromoList);
      } catch (err) { setError("Failed to load"); setPromoCodes([]); }
      setLoading(false);
    };
    onValue(promosRef, handleSnapshot, (err) => { setError("Connection error"); setLoading(false); });
    return () => off(promosRef);
  }, []);

  const createPromoCode = async () => {
    if (!newPromo.code || newPromo.code.length < 3) { toast.error("Code too short"); return; }
    try {
      const promoRef = push(ref(realtimeDb, "promo_codes"));
      const promo: PromoCode = { id: promoRef.key!, code: newPromo.code.toUpperCase(), tier: newPromo.tier, days_granted: newPromo.days_granted, max_uses: newPromo.max_uses, uses_count: 0, expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), created_at: new Date().toISOString(), is_active: true };
      await set(promoRef, promo);
      setPromoCodes([...promoCodes, promo]);
      setShowCreate(false);
      setNewPromo({ code: "", tier: "individual", days_granted: 7, max_uses: 100 });
      toast.success("Created");
    } catch { toast.error("Failed"); }
  };

  const deletePromoCode = async (id: string) => {
    try { await remove(ref(realtimeDb, `promo_codes/${id}`)); setPromoCodes(promoCodes.filter((p) => p.id !== id)); toast.success("Deleted"); } catch { toast.error("Failed"); }
  };

  const toggleActive = async (promo: PromoCode) => {
    try { await set(ref(realtimeDb, `promo_codes/${promo.id}/is_active`), !promo.is_active); setPromoCodes(promoCodes.map((p) => p.id === promo.id ? { ...p, is_active: !promo.is_active } : p)); toast.success("Updated"); } catch { toast.error("Failed"); }
  };

  if (loading) return <div className="py-10 text-center text-muted-foreground">Loading...</div>;
  if (error) return <div className="py-10 text-center text-destructive">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{promoCodes.length} promo codes</span>
        <Button variant="gold" size="sm" onClick={() => setShowCreate(!showCreate)}><Plus className="h-4 w-4 mr-1" /> Create</Button>
      </div>
      {showCreate && (
        <div className="premium-card rounded-xl p-4 border border-gold/20 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Input value={newPromo.code} onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })} placeholder="CODE" className="bg-charcoal" />
            <select value={newPromo.tier} onChange={(e) => setNewPromo({ ...newPromo, tier: e.target.value as any })} className="h-10 rounded-md border bg-charcoal px-3"><option value="individual">Individual</option><option value="showroom">Showroom</option></select>
            <Input type="number" value={newPromo.days_granted} onChange={(e) => setNewPromo({ ...newPromo, days_granted: Number(e.target.value) || 7 })} className="bg-charcoal" />
            <Input type="number" value={newPromo.max_uses} onChange={(e) => setNewPromo({ ...newPromo, max_uses: Number(e.target.value) || 100 })} className="bg-charcoal" />
          </div>
          <Button variant="gold" size="sm" onClick={createPromoCode}>Create</Button>
        </div>
      )}
      <div className="space-y-3">
        {promoCodes.map((promo) => (
          <div key={promo.id} className="premium-card rounded-xl p-4 border border-gold/20 flex items-center gap-4">
            <div className="flex-1">
              <div className="font-medium flex items-center gap-2">
                {promo.code}
                {promo.is_active ? <Badge className="bg-green-500/20 text-green-400">Active</Badge> : <Badge variant="outline">Inactive</Badge>}
              </div>
              <div className="text-xs text-muted-foreground">{promo.tier} / {promo.days_granted}d / {promo.uses_count}/{promo.max_uses || "inf"}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toggleActive(promo)}>{promo.is_active ? "Off" : "On"}</Button>
              <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(promo.code); toast.success("Copied"); }}><Copy className="h-4 w-4" /></Button>
              <Button variant="destructive" size="sm" onClick={() => deletePromoCode(promo.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
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
    try {
      const broadcastRef = push(ref(realtimeDb, "broadcasts"));
      const broadcast: Broadcast = { id: broadcastRef.key!, title, body, created_at: new Date().toISOString(), sent_by: "admin" };
      await set(broadcastRef, broadcast);
      setBroadcasts([broadcast, ...broadcasts]);
      setTitle("");
      setBody("");
      toast.success("Sent");
    } catch { toast.error("Failed"); }
  };

  if (loading) return <div className="py-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="premium-card rounded-xl p-4 border border-gold/20 space-y-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="bg-charcoal" />
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message" className="bg-charcoal min-h-[100px]" />
        <Button variant="gold" onClick={sendBroadcast}><Send className="h-4 w-4 mr-2" />Send</Button>
      </div>
      <div className="space-y-3">
        {broadcasts.map((b) => (
          <div key={b.id} className="premium-card rounded-xl p-4 border border-gold/20">
            <div className="font-medium">{b.title}</div>
            <div className="text-sm text-muted-foreground mt-1">{b.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab() {
  const [settings, setSettings] = useState<SiteSettings>({ whatsapp_number: "", support_phone: "", facebook_url: "", instagram_url: "", tiktok_url: "", baridi_mob_number: "", appointment_email: "", gmail_address: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const settingsRef = ref(realtimeDb, "site_settings");
    const handleSnapshot = (snapshot: { val: () => SiteSettings | null }) => {
      const data = snapshot.val();
      if (data) setSettings(prev => ({ ...prev, ...data }));
      setLoading(false);
    };
    onValue(settingsRef, handleSnapshot);
    fetchPlatformSettings().then((supaData) => {
      if (supaData) setSettings(prev => ({ ...prev, ...supaData }));
    }).catch(() => {});
    return () => off(settingsRef);
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await set(ref(realtimeDb, "site_settings"), settings);
      await savePlatformSettings(settings);
      toast.success("Settings saved to Firebase and Supabase");
    } catch {
      toast.error("Failed to save settings");
    }
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
      <div>
        <h3 className="text-sm font-semibold text-gold mb-1">Customer Service Contact Channels</h3>
        <p className="text-xs text-muted-foreground mb-4">Configure all contact channels displayed in the footer and across the platform.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
            <Input
              value={settings[f.key] || ""}
              onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              type={f.type || "text"}
              className="bg-charcoal"
            />
          </div>
        ))}
      </div>
      <Button variant="gold" onClick={saveSettings} disabled={saving}>{saving ? "Saving..." : "Save Settings"}</Button>
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
