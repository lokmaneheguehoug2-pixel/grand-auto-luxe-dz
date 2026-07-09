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

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · GRAND Auto Luxe" }] }),
  component: AdminPage,
});

// Firebase types
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
        // Sort by created_at descending
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
      // Determine days based on plan
      let days = 30;
      let tier: "individual" | "showroom" = "individual";

      if (planId === "individual-monthly") {
        days = 30;
        tier = "individual";
      } else if (planId === "individual-yearly") {
        days = 365;
        tier = "individual";
      } else if (planId === "showroom-monthly") {
        days = 30;
        tier = "showroom";
      } else if (planId === "showroom-yearly") {
        days = 365;
        tier = "showroom";
      }

      const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

      await set(ref(realtimeDb, `users/${user.phone}/subscription_status`), "active");
      await set(ref(realtimeDb, `users/${user.phone}/subscription_until`), until);
      await set(ref(realtimeDb, `users/${user.phone}/subscription_tier`), tier);
      await set(ref(realtimeDb, `users/${user.phone}/subscription_plan`), planId);

      setUsers(users.map((u) => u.phone === user.phone ? {
        ...u,
        subscription_status: "active",
        subscription_until: until,
        subscription_tier: tier,
      } : u));

      toast.success(`Activated ${planId.replace("-", " ")} for ${days} days`);
    } catch (err) {
      toast.error("Failed to grant subscription");
    }
  };

  const deleteUser = async (user: FirebaseUser) => {
    if (user.role === "admin") {
      toast.error("Cannot delete admin account");
      return;
    }
    if (!confirm(`Permanently delete ${user.first_name} ${user.last_name} (${user.phone})? This cannot be undone.`)) return;
    try {
      await remove(ref(realtimeDb, `users/${user.phone}`));
      setUsers(users.filter((u) => u.phone !== user.phone));
      toast.success("User account deleted");
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

  // Filter users by phone search (instant, multi-format support) - BULLETPROOF
  const normalizeSearchPhone = (raw: unknown): string => {
    try {
      let digits = String(raw ?? "").replace(/\s|-/g, "");
      if (digits.startsWith("+213")) digits = digits.slice(4);
      else if (digits.startsWith("213")) digits = digits.slice(3);
      return digits || "";
    } catch {
      return "";
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
          const safeUserPhone = safeString(u?.phone);
          const safeFirstName = safeString(u?.first_name);
          const safeLastName = safeString(u?.last_name);
          const safeUserId = safeString(u?.id);

          const normalizedSearch = normalizeSearchPhone(searchPhone);
          const normalizedUserPhone = normalizeSearchPhone(u?.phone);
          const searchLower = safeString(searchPhone);
          const fullName = `${safeFirstName} ${safeLastName}`.trim();

          return (
            normalizedUserPhone.includes(normalizedSearch) ||
            safeUserPhone.includes(searchLower) ||
            safeUserId.includes(searchLower) ||
            fullName.includes(searchLower) ||
            safeFirstName.includes(searchLower) ||
            safeLastName.includes(searchLower)
          );
        } catch {
          return false;
        }
      })
    : users;

  if (loading) {
    return <div className="py-10 text-center text-muted-foreground">Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search by phone..."
          value={searchPhone}
          onChange={(e) => setSearchPhone(e.target.value)}
          className="max-w-xs bg-charcoal border-border"
        />
        <span className="text-sm text-muted-foreground">{filteredUsers.length} users</span>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-muted-foreground text-center py-8">No users found.</div>
      )}

      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div key={user.id || user.phone} className="premium-card rounded-xl p-4 border border-gold/20 flex items-center gap-4">
            <div className="flex-1">
              <div className="font-medium flex items-center gap-2">
                {user.first_name} {user.last_name}
                {user.role === "admin" && (
                  <Badge variant="outline" className="text-xs border-gold/40 text-gold">Admin</Badge>
                )}
                {user.is_banned && (
                  <Badge variant="destructive" className="text-xs">Banned</Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">{user.phone}</div>
              <div className="text-xs flex items-center gap-2 mt-1">
                <span className={user.subscription_status === "active" ? "text-green-400" : user.subscription_status === "trial" ? "text-yellow-400" : "text-red-400"}>
                  {user.subscription_status}
                </span>
                {user.subscription_tier && (
                  <Badge variant="outline" className="text-xs text-gold">{user.subscription_tier}</Badge>
                )}
                {user.subscription_until && (
                  <span className="text-muted-foreground">
                    until {new Date(user.subscription_until).toLocaleDateString()}
                  </span>
                )}
              </div>
              {editingPassword === user.phone && (
                <div className="flex gap-2 mt-2">
                  <Input
                    type="text"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-8 text-sm bg-charcoal"
                  />
                  <Button size="sm" variant="gold" onClick={() => updatePassword(user)}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setEditingPassword(null); setNewPassword(""); }}>Cancel</Button>
                </div>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {!user.is_banned ? (
                <Button variant="destructive" size="sm" onClick={() => toggleBan(user, true)} title="Ban">
                  <Ban className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => toggleBan(user, false)} title="Unban">
                  <UserCheck className="h-4 w-4" />
                </Button>
              )}
              {user.role !== "admin" && (
                <div className="flex gap-1">
                  <Button variant="gold" size="sm" onClick={() => grantSubscription(user, "individual-monthly")} title="Individual Monthly (1,000 DA)">
                    IM
                  </Button>
                  <Button variant="gold" size="sm" onClick={() => grantSubscription(user, "individual-yearly")} title="Individual Yearly (10,000 DA)">
                    IY
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => grantSubscription(user, "showroom-monthly")} title="Showroom Monthly (2,500 DA)">
                    SM
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => grantSubscription(user, "showroom-yearly")} title="Showroom Yearly (25,000 DA)">
                    SY
                  </Button>
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={() => { setEditingPassword(user.phone); setNewPassword(""); }} title="Change Password">
                <Key className="h-4 w-4" />
              </Button>
              {user.password && (
                <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(user.password || ""); toast.success("Password copied"); }} title="Copy Password">
                  <Copy className="h-4 w-4" />
                </Button>
              )}
              {user.role !== "admin" && (
                <Button variant="destructive" size="sm" onClick={() => deleteUser(user)} title="Delete Account">
                  <UserX className="h-4 w-4" />
                </Button>
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
        const vehiclesList = Object.entries(data).map(([id, v]) => ({
          ...v,
          id: id,
        }));
        const sorted = vehiclesList.sort((a, b) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
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

  const filteredVehicles = statusFilter === "all"
    ? vehicles
    : vehicles.filter((v) => v.status === statusFilter);

  if (loading) {
    return <div className="py-10 text-center text-muted-foreground">Loading vehicles...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex gap-1">
          {["all", "pending", "active", "sold", "rejected"].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "gold" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className="capitalize"
            >
              {s} {s === "pending" ? `(${vehicles.filter(v => v.status === "pending").length})` : ""}
            </Button>
          ))}
        </div>
        <span className="text-sm text-muted-foreground">{filteredVehicles.length} vehicles</span>
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-muted-foreground text-center py-8">No vehicles found.</div>
      )}

      <div className="space-y-3">
        {filteredVehicles.map((v) => (
          <div key={v.id} className="premium-card rounded-xl p-4 border border-gold/20 flex items-center gap-4">
            <div className="flex-1">
              <div className="font-medium">{v.brand} {v.model} ({v.year})</div>
              <div className="text-xs text-muted-foreground">
                {v.wilaya} · Seller: {v.sellerId?.slice(0, 8)}...
              </div>
              <div className="text-xs flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`
                  ${v.status === "active" ? "border-green-500 text-green-400" : ""}
                  ${v.status === "pending" ? "border-yellow-500 text-yellow-400" : ""}
                  ${v.status === "sold" ? "border-blue-500 text-blue-400" : ""}
                  ${v.status === "rejected" ? "border-red-500 text-red-400" : ""}
                `}>
                  {v.status}
                </Badge>
                <span className="text-muted-foreground">
                  {v.price_type === "fixed" && v.fixed_price ? formatDZD(v.fixed_price) :
                   v.price_type === "auction" && v.starting_price ? `Start: ${formatDZD(v.starting_price)}` : ""}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {v.status === "pending" && (
                <>
                  <Button variant="gold" size="sm" onClick={() => updateVehicleStatus(v, "active")} title="Approve">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => updateVehicleStatus(v, "rejected")} title="Reject">
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
              {v.status === "active" && (
                <Button variant="outline" size="sm" onClick={() => updateVehicleStatus(v, "sold")} title="Mark Sold">
                  <DollarSign className="h-4 w-4" />
                </Button>
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
  const [showCreate, setShowCreate] = useState(false);
  const [newPromo, setNewPromo] = useState({
    code: "",
    tier: "individual" as "individual" | "showroom",
    days_granted: 7,
    max_uses: 100,
  });

  useEffect(() => {
    const promosRef = ref(realtimeDb, "promo_codes");

    const handleSnapshot = (snapshot: { val: () => Record<string, PromoCode> | null }) => {
      const data = snapshot.val();
      if (data) {
        setPromoCodes(Object.values(data));
      } else {
        setPromoCodes([]);
      }
      setLoading(false);
    };

    onValue(promosRef, handleSnapshot);
    return () => off(promosRef);
  }, []);

  const createPromoCode = async () => {
    if (!newPromo.code || newPromo.code.length < 3) {
      toast.error("Code must be at least 3 characters");
      return;
    }
    try {
      const promoRef = push(ref(realtimeDb, "promo_codes"));
      const promo: PromoCode = {
        id: promoRef.key!,
        code: newPromo.code.toUpperCase(),
        tier: newPromo.tier,
        days_granted: newPromo.days_granted,
        max_uses: newPromo.max_uses,
        uses_count: 0,
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        is_active: true,
      };
      await set(promoRef, promo);
      setPromoCodes([...promoCodes, promo]);
      setShowCreate(false);
      setNewPromo({ code: "", tier: "individual", days_granted: 7, max_uses: 100 });
      toast.success("Promo code created");
    } catch (err) {
      toast.error("Failed to create promo code");
    }
  };

  const deletePromoCode = async (id: string) => {
    try {
      await remove(ref(realtimeDb, `promo_codes/${id}`));
      setPromoCodes(promoCodes.filter((p) => p.id !== id));
      toast.success("Promo code deleted");
    } catch (err) {
      toast.error("Failed to delete promo code");
    }
  };

  const toggleActive = async (promo: PromoCode) => {
    try {
      await set(ref(realtimeDb, `promo_codes/${promo.id}/is_active`), !promo.is_active);
      setPromoCodes(promoCodes.map((p) => p.id === promo.id ? { ...p, is_active: !p.is_active } : p));
      toast.success(promo.is_active ? "Promo deactivated" : "Promo activated");
    } catch (err) {
      toast.error("Failed to update promo");
    }
  };

  if (loading) {
    return <div className="py-10 text-center text-muted-foreground">Loading promo codes...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{promoCodes.length} promo codes</span>
        <Button variant="gold" size="sm" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4 mr-1" /> Create
        </Button>
      </div>

      {showCreate && (
        <div className="premium-card rounded-xl p-4 border border-gold/20 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Code</label>
              <Input
                value={newPromo.code}
                onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                placeholder="GRAND2024"
                className="bg-charcoal"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Plan Tier · الباقة</label>
              <Select
                value={newPromo.tier}
                onValueChange={(v) => setNewPromo({ ...newPromo, tier: v as "individual" | "showroom" })}
              >
                <SelectTrigger className="bg-charcoal">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual · عادية</SelectItem>
                  <SelectItem value="showroom">Showroom · معرض</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Days Granted</label>
              <Input
                type="number"
                value={newPromo.days_granted}
                onChange={(e) => setNewPromo({ ...newPromo, days_granted: Number(e.target.value) })}
                className="bg-charcoal"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Max Uses</label>
              <Input
                type="number"
                value={newPromo.max_uses}
                onChange={(e) => setNewPromo({ ...newPromo, max_uses: Number(e.target.value) })}
                className="bg-charcoal"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="gold" size="sm" onClick={createPromoCode}>Create Promo</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {promoCodes.length === 0 && (
        <div className="text-muted-foreground text-center py-8">No promo codes yet.</div>
      )}

      <div className="space-y-3">
        {promoCodes.map((promo) => (
          <div key={promo.id} className="premium-card rounded-xl p-4 border border-gold/20 flex items-center gap-4">
            <div className="flex-1">
              <div className="font-medium flex items-center gap-2">
                {promo.code}
                {promo.is_active ? (
                  <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {promo.tier === "showroom" ? "Showroom" : "Individual"} · {promo.days_granted} days · {promo.uses_count}/{promo.max_uses || "∞"} uses
              </div>
              {promo.expires_at && (
                <div className="text-xs text-muted-foreground">
                  Expires: {new Date(promo.expires_at).toLocaleDateString()}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toggleActive(promo)}>
                {promo.is_active ? "Deactivate" : "Activate"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(promo.code); toast.success("Copied"); }}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="sm" onClick={() => deletePromoCode(promo.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
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
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const broadcastsRef = ref(realtimeDb, "broadcasts");

    const handleSnapshot = (snapshot: { val: () => Record<string, Broadcast> | null }) => {
      const data = snapshot.val();
      if (data) {
        setBroadcasts(Object.values(data).sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      } else {
        setBroadcasts([]);
      }
      setLoading(false);
    };

    onValue(broadcastsRef, handleSnapshot);
    return () => off(broadcastsRef);
  }, []);

  const sendBroadcast = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and message required");
      return;
    }
    setSending(true);
    try {
      const broadcastRef = push(ref(realtimeDb, "broadcasts"));
      const broadcast: Broadcast = {
        id: broadcastRef.key!,
        title,
        body,
        created_at: new Date().toISOString(),
        sent_by: "admin",
      };
      await set(broadcastRef, broadcast);

      // Also send to all users' notifications
      const usersSnap = await get(ref(realtimeDb, "users"));
      if (usersSnap.exists()) {
        const users = usersSnap.val() as Record<string, FirebaseUser>;
        for (const phone of Object.keys(users)) {
          const notifRef = push(ref(realtimeDb, `users/${phone}/notifications`));
          await set(notifRef, {
            id: notifRef.key,
            title,
            body,
            read: false,
            created_at: new Date().toISOString(),
          });
        }
      }

      setBroadcasts([broadcast, ...broadcasts]);
      setTitle("");
      setBody("");
      toast.success("Broadcast sent to all users");
    } catch (err) {
      toast.error("Failed to send broadcast");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="premium-card rounded-xl p-4 border border-gold/20">
        <h3 className="font-display text-lg mb-4 flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-gold" />
          خانة نداء - Broadcast Message
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Message title..."
              className="bg-charcoal mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Message</label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Your broadcast message to all users..."
              className="bg-charcoal mt-1 min-h-[100px]"
            />
          </div>
          <Button variant="gold" onClick={sendBroadcast} disabled={sending}>
            <Send className="h-4 w-4 mr-2" />
            {sending ? "Sending..." : "Send to All Users"}
          </Button>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Previous Broadcasts</h3>
        {broadcasts.length === 0 ? (
          <div className="text-muted-foreground text-center py-4">No broadcasts sent yet.</div>
        ) : (
          <div className="space-y-3">
            {broadcasts.map((b) => (
              <div key={b.id} className="premium-card rounded-xl p-4 border border-gold/20">
                <div className="font-medium">{b.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{b.body}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  {new Date(b.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsTab() {
  const [settings, setSettings] = useState<SiteSettings>({
    whatsapp_number: "",
    support_phone: "",
    facebook_url: "",
    instagram_url: "",
    tiktok_url: "",
    baridi_mob_number: "",
    appointment_email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const settingsRef = ref(realtimeDb, "site_settings");

    const handleSnapshot = (snapshot: { val: () => SiteSettings | null }) => {
      const data = snapshot.val();
      if (data) {
        setSettings(data);
      }
      setLoading(false);
    };

    onValue(settingsRef, handleSnapshot);
    return () => off(settingsRef);
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await set(ref(realtimeDb, "site_settings"), settings);
      toast.success("Settings saved");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-10 text-center text-muted-foreground">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="premium-card rounded-xl p-4 border border-gold/20">
        <h3 className="font-display text-lg mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-gold" />
          Platform Settings
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">WhatsApp Number</label>
              <Input
                value={settings.whatsapp_number}
                onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                placeholder="0555123456"
                className="bg-charcoal mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Support Phone</label>
              <Input
                value={settings.support_phone}
                onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                placeholder="0555123456"
                className="bg-charcoal mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">BaridiMob Payment Number</label>
              <Input
                value={settings.baridi_mob_number}
                onChange={(e) => setSettings({ ...settings, baridi_mob_number: e.target.value })}
                placeholder="0555123456"
                className="bg-charcoal mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Appointment Notification Email</label>
              <Input
                type="email"
                value={settings.appointment_email}
                onChange={(e) => setSettings({ ...settings, appointment_email: e.target.value })}
                placeholder="appointments@grandauto.dz"
                className="bg-charcoal mt-1"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Booking notifications will be sent to this email</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Facebook URL</label>
              <Input
                value={settings.facebook_url}
                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                placeholder="https://facebook.com/..."
                className="bg-charcoal mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Instagram URL</label>
              <Input
                value={settings.instagram_url}
                onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                placeholder="https://instagram.com/..."
                className="bg-charcoal mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">TikTok URL</label>
              <Input
                value={settings.tiktok_url}
                onChange={(e) => setSettings({ ...settings, tiktok_url: e.target.value })}
                placeholder="https://tiktok.com/..."
                className="bg-charcoal mt-1"
              />
            </div>
          </div>

          <Button variant="gold" onClick={saveSettings} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      <div className="premium-card rounded-xl p-4 border border-gold/20">
        <h3 className="font-medium mb-3">Subscription Pricing</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-border">
            <span>Individual Plan (1 Month)</span>
            <span className="text-gold font-medium">1,000 DA</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span>Showroom Plan (1 Month)</span>
            <span className="text-gold font-medium">2,500 DA</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Note: Only 1 Month subscriptions available. Pay via BaridiMob to: {settings.baridi_mob_number || "Configure above"}
          </p>
        </div>
      </div>
    </div>
  );
}

function AnalyticsTab() {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    trialUsers: 0,
    totalVehicles: 0,
    activeVehicles: 0,
    pendingVehicles: 0,
    soldVehicles: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = ref(realtimeDb, "users");
    const vehiclesRef = ref(realtimeDb, "vehicles");

    const loadStats = async () => {
      const usersSnap = await get(usersRef);
      const vehiclesSnap = await get(vehiclesRef);

      const users = usersSnap.val() ? Object.values(usersSnap.val()) as FirebaseUser[] : [];
      const vehicles = vehiclesSnap.val() ? Object.values(vehiclesSnap.val()) as FirebaseVehicle[] : [];

      setAnalytics({
        totalUsers: users.length,
        activeSubscriptions: users.filter((u) => u.subscription_status === "active").length,
        trialUsers: users.filter((u) => u.subscription_status === "trial").length,
        totalVehicles: vehicles.length,
        activeVehicles: vehicles.filter((v) => v.status === "active").length,
        pendingVehicles: vehicles.filter((v) => v.status === "pending").length,
        soldVehicles: vehicles.filter((v) => v.status === "sold").length,
      });
      setLoading(false);
    };

    loadStats();
  }, []);

  if (loading) {
    return <div className="py-10 text-center text-muted-foreground">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnalyticsCard
          icon={Users}
          title="User Growth"
          value={analytics.totalUsers}
          subtitle={`${analytics.trialUsers} on trial`}
          color="text-blue-400"
        />
        <AnalyticsCard
          icon={Crown}
          title="Active Subscriptions"
          value={analytics.activeSubscriptions}
          subtitle="Premium users"
          color="text-gold"
        />
        <AnalyticsCard
          icon={Car}
          title="Total Vehicles"
          value={analytics.totalVehicles}
          subtitle={`${analytics.pendingVehicles} pending`}
          color="text-gold"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnalyticsCard
          icon={Check}
          title="Active"
          value={analytics.activeVehicles}
          color="text-green-400"
        />
        <AnalyticsCard
          icon={Clock}
          title="Pending"
          value={analytics.pendingVehicles}
          color="text-yellow-400"
        />
        <AnalyticsCard
          icon={DollarSign}
          title="Sold"
          value={analytics.soldVehicles}
          color="text-gold"
        />
        <AnalyticsCard
          icon={Activity}
          title="Trial Users"
          value={analytics.trialUsers}
          color="text-blue-400"
        />
      </div>

      <div className="premium-card rounded-xl p-6 border border-gold/20">
        <h3 className="font-display text-lg mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-gold" />
          Platform Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-3xl font-display text-green-400">{analytics.activeVehicles}</div>
            <div className="text-xs text-muted-foreground">Active Listings</div>
          </div>
          <div>
            <div className="text-3xl font-display text-yellow-400">{analytics.pendingVehicles}</div>
            <div className="text-xs text-muted-foreground">Pending Approval</div>
          </div>
          <div>
            <div className="text-3xl font-display text-blue-400">{analytics.trialUsers}</div>
            <div className="text-xs text-muted-foreground">Trial Users</div>
          </div>
          <div>
            <div className="text-3xl font-display text-gold">{analytics.activeSubscriptions}</div>
            <div className="text-xs text-muted-foreground">Premium Users</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsCard({ icon: Icon, title, value, subtitle, color }: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}) {
  return (
    <div className="premium-card rounded-xl p-5 border border-gold/20">
      <div className="flex items-center gap-3 mb-3">
        <Icon className={`h-5 w-5 ${color || "text-gold"}`} />
        <span className="text-sm text-muted-foreground">{title}</span>
      </div>
      <div className="text-3xl font-display">{value}</div>
      {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
    </div>
  );
}

type Subscription = {
  id: string;
  userId: string;
  userPhone: string;
  plan: string;
  amount: number;
  receiptUrl: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
};

function ReceiptsTab() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingReceipt, setViewingReceipt] = useState<Subscription | null>(null);

  useEffect(() => {
    const subsRef = ref(realtimeDb, "subscriptions");
    const handle = (snapshot: { val: () => Record<string, any> | null }) => {
      const data = snapshot.val();
      if (!data) {
        setSubscriptions([]);
        setLoading(false);
        return;
      }
      const list: Subscription[] = Object.entries(data).map(([id, v]) => ({
        id,
        userId: v.userId || "",
        userPhone: v.userPhone || "",
        plan: v.plan || "",
        amount: Number(v.amount) || 0,
        receiptUrl: v.receiptUrl || "",
        status: v.status || "pending",
        submittedAt: v.submittedAt || "",
      }));
      list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      setSubscriptions(list);
      setLoading(false);
    };
    onValue(subsRef, handle);
    return () => off(subsRef);
  }, []);

  const approve = async (sub: Subscription) => {
    try {
      await set(ref(realtimeDb, `subscriptions/${sub.id}/status`), "approved");
      const planType = sub.plan.startsWith("showroom") ? "showroom" : "individual";
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      await set(ref(realtimeDb, `users/${sub.userPhone}/subscription`), {
        plan: planType,
        status: "active",
        expiresAt: expiresAt.toISOString(),
        activatedAt: new Date().toISOString(),
      });
      setSubscriptions(subscriptions.map((s) => s.id === sub.id ? { ...s, status: "approved" } : s));
      toast.success("Subscription approved & user activated");
    } catch (err) {
      toast.error("Failed to approve subscription");
    }
  };

  const reject = async (sub: Subscription) => {
    try {
      await set(ref(realtimeDb, `subscriptions/${sub.id}/status`), "rejected");
      setSubscriptions(subscriptions.map((s) => s.id === sub.id ? { ...s, status: "rejected" } : s));
      toast.success("Subscription rejected");
    } catch (err) {
      toast.error("Failed to reject subscription");
    }
  };

  const planLabel = (plan: string) => {
    const labels: Record<string, string> = {
      "individual-monthly": "Individual Monthly",
      "individual-yearly": "Individual Yearly",
      "showroom-monthly": "Showroom Monthly",
      "showroom-yearly": "Showroom Yearly",
    };
    return labels[plan] || plan;
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground">Loading receipts...</div>;

  const pending = subscriptions.filter((s) => s.status === "pending");
  const processed = subscriptions.filter((s) => s.status !== "pending");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl gold-text mb-4">Pending Receipts ({pending.length})</h2>
        {pending.length === 0 ? (
          <div className="premium-card rounded-xl p-8 text-center text-muted-foreground">
            No pending receipts
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pending.map((sub) => (
              <div key={sub.id} className="premium-card rounded-xl p-4 border border-gold/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{planLabel(sub.plan)}</div>
                    <div className="text-xs text-muted-foreground">{sub.userPhone}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg gold-text">{sub.amount.toLocaleString()} DZD</div>
                    <div className="text-[10px] text-muted-foreground">{new Date(sub.submittedAt).toLocaleDateString()}</div>
                  </div>
                </div>
                {sub.receiptUrl && (
                  <button onClick={() => setViewingReceipt(sub)} className="block w-full">
                    <img src={sub.receiptUrl} alt="Receipt" className="w-full max-h-40 object-contain rounded-lg border border-gold/20 hover:border-gold/50 transition" />
                  </button>
                )}
                <div className="flex gap-2">
                  <Button variant="gold" size="sm" className="flex-1" onClick={() => approve(sub)}>
                    <Check className="h-4 w-4 mr-1" /> Approve
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1" onClick={() => reject(sub)}>
                    <X className="h-4 w-4 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {processed.length > 0 && (
        <div>
          <h3 className="font-display text-lg text-muted-foreground mb-3">Processed ({processed.length})</h3>
          <div className="space-y-2">
            {processed.slice(0, 10).map((sub) => (
              <div key={sub.id} className="premium-card rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {sub.receiptUrl && (
                    <button onClick={() => setViewingReceipt(sub)}>
                      <img src={sub.receiptUrl} alt="Receipt" className="h-12 w-12 object-cover rounded border border-gold/20" />
                    </button>
                  )}
                  <div>
                    <div className="text-sm">{planLabel(sub.plan)} · {sub.userPhone}</div>
                    <div className="text-xs text-muted-foreground">{sub.amount.toLocaleString()} DZD · {new Date(sub.submittedAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <Badge variant={sub.status === "approved" ? "default" : "destructive"} className={sub.status === "approved" ? "bg-green-600/20 text-green-400 border-green-600/40" : ""}>
                  {sub.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewingReceipt && (
        <Dialog open={!!viewingReceipt} onOpenChange={(v) => !v && setViewingReceipt(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Receipt · {planLabel(viewingReceipt.plan)}</DialogTitle>
            </DialogHeader>
            <img src={viewingReceipt.receiptUrl} alt="Full receipt" className="w-full rounded-lg" />
            <div className="text-sm text-muted-foreground">
              <div>User: {viewingReceipt.userPhone}</div>
              <div>Amount: {viewingReceipt.amount.toLocaleString()} DZD</div>
              <div>Date: {new Date(viewingReceipt.submittedAt).toLocaleString()}</div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

