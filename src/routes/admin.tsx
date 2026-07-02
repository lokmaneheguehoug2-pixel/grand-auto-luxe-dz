import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Shield, Trash2, Check, X, Eye, DollarSign, Send, Ban, UserCheck, Crown, Megaphone, Zap,
  Tag, AlertTriangle, Ticket, BarChart3, Users, Car, TrendingUp, Clock, RefreshCw, Settings,
  Calendar, Phone, Mail, MessageCircle, Instagram, Facebook, Globe
} from "lucide-react";
import { useSignedUrl } from "@/hooks/use-signed-url";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { formatDZD } from "@/lib/format";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · GRAND Auto Luxe" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div className="py-24 text-center text-muted-foreground">Loading…</div>;
  if (!isAdmin) return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      <Shield className="h-10 w-10 text-gold mx-auto mb-3" />
      <h1 className="font-display text-2xl mb-2">Restricted</h1>
      <p className="text-muted-foreground text-sm">This area is reserved for administrators.</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg gold-gradient grid place-items-center"><Shield className="h-5 w-5 text-gold-foreground" /></div>
        <h1 className="font-display text-3xl">Admin Control</h1>
      </div>

      <AnalyticsWidget />

      <Tabs defaultValue="subscriptions" className="mt-6">
        <TabsList className="bg-charcoal border border-border mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="subscriptions" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">Subscriptions</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">Users</TabsTrigger>
          <TabsTrigger value="listings" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">Listings</TabsTrigger>
          <TabsTrigger value="appointments" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">Appointments</TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">Reports</TabsTrigger>
          <TabsTrigger value="promocodes" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">Promo Codes</TabsTrigger>
          <TabsTrigger value="support" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">Support</TabsTrigger>
          <TabsTrigger value="sitesettings" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">Site Settings</TabsTrigger>
          <TabsTrigger value="broadcast" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">Broadcast</TabsTrigger>
        </TabsList>
        <TabsContent value="subscriptions"><SubscriptionsTab /></TabsContent>
        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="listings"><ListingsTab /></TabsContent>
        <TabsContent value="appointments"><AppointmentsTab /></TabsContent>
        <TabsContent value="reports"><ReportsTab /></TabsContent>
        <TabsContent value="promocodes"><PromoCodesTab /></TabsContent>
        <TabsContent value="support"><SupportTab /></TabsContent>
        <TabsContent value="sitesettings"><SiteSettingsTab /></TabsContent>
        <TabsContent value="broadcast"><BroadcastTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function AnalyticsWidget() {
  const { data } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [subsRes, usersRes, vehiclesRes, reportsRes] = await Promise.all([
        supabase.from("pending_subscriptions").select("amount, plan, status, reviewed_at, submitted_at").order("submitted_at", { ascending: false }).limit(100),
        supabase.from("profiles").select("id, subscription_status, plan_type, is_showroom, is_banned, created_at"),
        supabase.from("vehicles").select("id, status, created_at").order("created_at", { ascending: false }).limit(500),
        supabase.from("vehicle_reports").select("id, status").not("status", "is", null),
      ]);

      const approved = (subsRes.data ?? []).filter((d) => d.status === "approved");
      const total = approved.reduce((s, r) => s + Number(r.amount), 0);
      const pending = (subsRes.data ?? []).filter((d) => d.status === "pending").length;

      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
      const mtd = approved.filter((r) => r.reviewed_at && new Date(r.reviewed_at) >= monthStart).reduce((s, r) => s + Number(r.amount), 0);

      const users = usersRes.data ?? [];
      const activeCount = users.filter((u) => u.subscription_status === "active").length;
      const trialCount = users.filter((u) => u.subscription_status === "trial").length;
      const showroomCount = users.filter((u) => u.is_showroom).length;

      const vehicles = vehiclesRes.data ?? [];
      const activeVehicles = vehicles.filter((v) => v.status === "active").length;
      const pendingVehicles = vehicles.filter((v) => v.status === "pending").length;

      const reports = reportsRes.data ?? [];
      const openReports = reports.filter((r) => r.status === "open").length;

      return { total, mtd, pending, totalSubs: approved.length, activeCount, trialCount, showroomCount, activeVehicles, pendingVehicles, openReports };
    },
  });

  const stats = [
    { label: "Total Revenue", value: formatDZD(data?.total ?? 0), icon: DollarSign },
    { label: "Month-to-date", value: formatDZD(data?.mtd ?? 0), icon: TrendingUp },
    { label: "Active Users", value: String(data?.activeCount ?? 0), icon: Users },
    { label: "Trial Users", value: String(data?.trialCount ?? 0), icon: Clock },
    { label: "Showrooms", value: String(data?.showroomCount ?? 0), icon: Crown },
    { label: "Active Vehicles", value: String(data?.activeVehicles ?? 0), icon: Car },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="premium-card gold-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold/80">
            <s.icon className="h-3.5 w-3.5" /> {s.label}
          </div>
          <div className="mt-2 font-display text-2xl gold-text">{s.value}</div>
        </div>
      ))}
    </div>
  );
}

function SubscriptionsTab() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-pending-subs"],
    queryFn: async () => {
      const { data: subs } = await supabase.from("pending_subscriptions").select("*").order("submitted_at", { ascending: false });
      const ids = Array.from(new Set((subs ?? []).map((s) => s.user_id)));
      const { data: profs } = ids.length ? await supabase.from("profiles").select("id,first_name,last_name,phone").in("id", ids) : { data: [] };
      const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
      return (subs ?? []).map((s) => ({ ...s, profiles: map.get(s.user_id) }));
    },
  });
  const approve = async (p: any) => {
    const days = p.plan === "yearly" ? 365 : 30;
    const until = new Date(Date.now() + days * 86400_000).toISOString();
    await supabase.from("profiles").update({ subscription_status: "active", subscription_until: until }).eq("id", p.user_id);
    await supabase.from("pending_subscriptions").update({ status: "approved", reviewed_at: new Date().toISOString() }).eq("id", p.id);
    toast.success(`Activated · ${days} days`);
    qc.invalidateQueries({ queryKey: ["admin-pending-subs", "admin-analytics"] });
  };
  const reject = async (p: any) => {
    await supabase.from("pending_subscriptions").update({ status: "rejected", reviewed_at: new Date().toISOString() }).eq("id", p.id);
    qc.invalidateQueries({ queryKey: ["admin-pending-subs"] });
    toast.success("Rejected");
  };
  return (
    <div className="space-y-3">
      {data.length === 0 && <div className="text-center text-muted-foreground py-12">No subscription requests.</div>}
      {data.map((p: any) => <SubRow key={p.id} p={p} onApprove={() => approve(p)} onReject={() => reject(p)} />)}
    </div>
  );
}

function SubRow({ p, onApprove, onReject }: { p: any; onApprove: () => void; onReject: () => void }) {
  const url = useSignedUrl("payment-receipts", p.receipt_url, 600);
  const [open, setOpen] = useState(false);
  return (
    <div className="premium-card gold-border rounded-xl p-4 grid sm:grid-cols-[1fr_auto] gap-3 items-center">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold">{p.profiles?.first_name} {p.profiles?.last_name}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gold-soft text-gold uppercase tracking-widest">{p.plan}</span>
          <span className="gold-text font-display">{formatDZD(p.amount)}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">{p.profiles?.phone} · {new Date(p.submitted_at).toLocaleString()}</div>
        <div className="mt-1 text-xs"><span className={`px-2 py-0.5 rounded-full ${p.status==='pending'?'bg-gold-soft text-gold':p.status==='approved'?'bg-emerald-500/15 text-emerald-400':'bg-destructive/15 text-destructive'}`}>{p.status}</span></div>
        {open && url && <a href={url} target="_blank" rel="noreferrer"><img src={url} alt="receipt" className="mt-3 max-h-80 rounded-lg border border-gold/30" /></a>}
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}><Eye className="h-4 w-4" /> View</Button>
        {p.status === "pending" && (<><Button variant="gold" size="sm" onClick={onApprove}><Check className="h-4 w-4" /> Activate</Button><Button variant="ghost" size="sm" onClick={onReject}><X className="h-4 w-4" /> Reject</Button></>)}
      </div>
    </div>
  );
}

function UsersTab() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const toggleBan = async (u: any) => {
    await supabase.from("profiles").update({ is_banned: !u.is_banned }).eq("id", u.id);
    toast.success(u.is_banned ? "Reactivated" : "Banned");
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  };
  const toggleShowroom = async (u: any) => {
    await supabase.from("profiles").update({ is_showroom: !u.is_showroom }).eq("id", u.id);
    toast.success(u.is_showroom ? "Showroom badge removed" : "Verified as showroom");
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  };
  const activate = async (u: any, days: number) => {
    const until = new Date(Date.now() + days * 86400_000).toISOString();
    await supabase.from("profiles").update({ subscription_status: "active", subscription_until: until }).eq("id", u.id);
    await supabase.from("notifications").insert({ user_id: u.id, title: "تم تفعيل اشتراكك", body: `حسابك مفعّل لمدة ${days} يوم.`, kind: "subscription" });
    toast.success(`Activated · ${days} days`);
    qc.invalidateQueries({ queryKey: ["admin-users", "admin-analytics"] });
  };
  const resetPassword = async (u: any) => {
    if (!confirm(`Reset password for ${u.phone}?`)) return;
    // Generate a random password
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
    let pass = "";
    for (let i = 0; i < 12; i++) pass += chars[Math.floor(Math.random() * chars.length)];
    const { error } = await supabase.rpc("admin_reset_user_password", { user_id: u.id, new_password: pass });
    if (error) { toast.error(error.message); return; }
    await navigator.clipboard.writeText(pass);
    toast.success("Password copied to clipboard");
  };

  return (
    <div className="premium-card rounded-xl overflow-x-auto">
      <table className="w-full text-sm min-w-[900px]">
        <thead className="bg-charcoal text-xs uppercase tracking-widest text-muted-foreground">
          <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Phone</th><th className="text-left p-3">Status</th><th className="text-left p-3">Plan</th><th className="text-left p-3">Joined</th><th></th></tr>
        </thead>
        <tbody>
          {data.map((u: any) => (
            <tr key={u.id} className="border-t border-border">
              <td className="p-3">
                {u.first_name} {u.last_name}
                {u.is_showroom && <BadgeCheck className="h-4 w-4 text-gold inline ml-1" />}
                {u.is_banned && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-destructive/20 text-destructive uppercase">Banned</span>}
              </td>
              <td className="p-3 font-mono text-xs">{u.phone}</td>
              <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs ${u.subscription_status==='active'?'bg-emerald-500/15 text-emerald-400':u.subscription_status==='trial'?'bg-gold-soft text-gold':'bg-destructive/15 text-destructive'}`}>{u.subscription_status}</span></td>
              <td className="p-3 text-xs">{u.plan_type ?? "individual"}</td>
              <td className="p-3 text-muted-foreground text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
              <td className="p-3 text-right whitespace-nowrap">
                <Button variant="ghost" size="sm" onClick={() => toggleShowroom(u)} title="Toggle showroom badge">
                  {u.is_showroom ? <BadgeCheck className="h-4 w-4 text-gold" /> : <Crown className="h-4 w-4 text-muted-foreground" />}
                </Button>
                <Button variant="gold" size="sm" className="mx-1" onClick={() => activate(u, 30)} title="30 days">30d</Button>
                <Button variant="gold-outline" size="sm" className="mr-1" onClick={() => resetPassword(u)} title="Reset password"><RefreshCw className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="sm" onClick={() => toggleBan(u)}>
                  {u.is_banned ? <><UserCheck className="h-4 w-4 text-emerald-400" /></> : <Ban className="h-4 w-4 text-destructive" />}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListingsTab() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const { data = [] } = useQuery({
    queryKey: ["admin-listings", tab],
    queryFn: async () => {
      let q = supabase.from("vehicles").select("id, brand, model, year, wilaya, created_at, status, seller_id").order("created_at", { ascending: false }).limit(200);
      if (tab === "pending") q = q.eq("status", "pending");
      const { data } = await q;
      return data ?? [];
    },
  });
  const setStatus = async (v: any, status: "active" | "rejected", notif: { title: string; body: string }) => {
    await supabase.from("vehicles").update({ status }).eq("id", v.id);
    await supabase.from("notifications").insert({ user_id: v.seller_id, title: notif.title, body: notif.body, link: `/vehicle/${v.id}`, kind: status === "active" ? "approved" : "rejected" });
    toast.success(status === "active" ? "Approved" : "Rejected");
    qc.invalidateQueries({ queryKey: ["admin-listings", "admin-analytics"] });
  };
  const del = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("vehicles").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-listings"] });
    toast.success("Deleted");
  };
  const pendingCount = data.filter((v: any) => v.status === "pending").length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button size="sm" variant={tab === "pending" ? "gold" : "ghost"} onClick={() => setTab("pending")}>Pending {tab === "pending" && pendingCount > 0 ? `· ${pendingCount}` : ""}</Button>
        <Button size="sm" variant={tab === "all" ? "gold" : "ghost"} onClick={() => setTab("all")}>All</Button>
      </div>
      <div className="premium-card rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-charcoal text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="text-left p-3">Vehicle</th><th className="text-left p-3">Wilaya</th><th className="text-left p-3">Status</th><th className="text-left p-3">Date</th><th></th></tr>
          </thead>
          <tbody>
            {data.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No listings.</td></tr>}
            {data.map((v: any) => (
              <tr key={v.id} className="border-t border-border">
                <td className="p-3">{v.brand} {v.model} <span className="text-muted-foreground text-xs">· {v.year}</span></td>
                <td className="p-3">{v.wilaya}</td>
                <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full border ${v.status==='pending'?'bg-gold-soft text-gold border-gold/40':v.status==='active'?'bg-emerald-500/10 text-emerald-400 border-emerald-500/30':v.status==='rejected'?'bg-destructive/10 text-destructive border-destructive/40':'bg-charcoal border-border'}`}>{v.status}</span></td>
                <td className="p-3 text-muted-foreground text-xs">{new Date(v.created_at).toLocaleDateString()}</td>
                <td className="p-3 text-right whitespace-nowrap">
                  {v.status === "pending" && (<><Button variant="gold" size="sm" className="mr-1" onClick={() => setStatus(v, "active", { title: "تم قبول إعلانك", body: `${v.brand} ${v.model} ظهر في السوق.` })}><Check className="h-3.5 w-3.5" /> Approve</Button><Button variant="ghost" size="sm" className="mr-1" onClick={() => setStatus(v, "rejected", { title: "تم رفض إعلانك", body: `إعلان ${v.brand} ${v.model} لم يستوفِ الشروط.` })}><X className="h-3.5 w-3.5" /> Reject</Button></>)}
                  <Button variant="ghost" size="sm" onClick={() => del(v.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportsTab() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data: reports } = await supabase.from("vehicle_reports").select("*").order("created_at", { ascending: false });
      const vehicleIds = Array.from(new Set((reports ?? []).map((r) => r.vehicle_id)));
      const { data: devs } = vehicleIds.length ? await supabase.from("vehicles").select("id, brand, model").in("id", vehicleIds) : { data: [] };
      const vMap = new Map((devs ?? []).map((v: any) => [v.id, v]));
      return (reports ?? []).map((r) => ({ ...r, vehicle: vMap.get(r.vehicle_id) }));
    },
  });
  const markFake = async (r: any) => {
    // Increment fake_reports_count on the reporter (anti-spam)
    const { data: profile } = await supabase.from("profiles").select("fake_reports_count").eq("id", r.reporter_id).single();
    const newCount = (profile?.fake_reports_count ?? 0) + 1;
    await supabase.from("profiles").update({ fake_reports_count: newCount, last_fake_report_at: new Date().toISOString() }).eq("id", r.reporter_id);
    // Auto-ban after 5 fake reports
    if (newCount >= 5) {
      await supabase.from("profiles").update({ is_banned: true }).eq("id", r.reporter_id);
      toast.success("Reporter auto-banned (5 fake reports)");
    }
    await supabase.from("vehicle_reports").update({ status: "fake" }).eq("id", r.id);
    qc.invalidateQueries({ queryKey: ["admin-reports"] });
    toast.success("Marked as fake");
  };
  const close = async (r: any) => {
    await supabase.from("vehicle_reports").update({ status: "closed" }).eq("id", r.id);
    qc.invalidateQueries({ queryKey: ["admin-reports"] });
    toast.success("Closed");
  };

  return (
    <div className="premium-card rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-charcoal text-xs uppercase tracking-widest text-muted-foreground">
          <tr><th className="text-left p-3">Vehicle</th><th className="text-left p-3">Reason</th><th className="text-left p-3">Status</th><th className="text-left p-3">Date</th><th></th></tr>
        </thead>
        <tbody>
          {data.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No reports.</td></tr>}
          {data.map((r: any) => (
            <tr key={r.id} className="border-t border-border">
              <td className="p-3">{r.vehicle?.brand} {r.vehicle?.model}</td>
              <td className="p-3">{r.reason}<span className="text-muted-foreground block text-xs">{r.details}</span></td>
              <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs ${r.status==='open'?'bg-gold-soft text-gold':r.status==='fake'?'bg-destructive/20 text-destructive':'bg-emerald-500/15 text-emerald-400'}`}>{r.status}</span></td>
              <td className="p-3 text-muted-foreground text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
              <td className="p-3 text-right whitespace-nowrap">
                {r.status === "open" && (<><Button variant="ghost" size="sm" onClick={() => markFake(r)}><AlertTriangle className="h-4 w-4 text-destructive" /> Fake</Button><Button variant="ghost" size="sm" onClick={() => close(r)}><Check className="h-4 w-4" /> Close</Button></>)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PromoCodesTab() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-promocodes"],
    queryFn: async () => {
      const { data } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const [form, setForm] = useState({ code: "", plan_type: "individual", days_granted: 3, max_uses: "" });
  const createCode = async () => {
    if (!form.code.trim() || !user) return;
    const { error } = await supabase.from("promo_codes").insert({
      code: form.code.trim().toUpperCase(),
      plan_type: form.plan_type,
      days_granted: Number(form.days_granted),
      max_uses: form.max_uses ? Number(form.max_uses) : null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Promo code created");
    setForm({ code: "", plan_type: "individual", days_granted: 3, max_uses: "" });
    qc.invalidateQueries({ queryKey: ["admin-promocodes"] });
  };
  const toggleActive = async (c: any) => {
    await supabase.from("promo_codes").update({ is_active: !c.is_active }).eq("id", c.id);
    qc.invalidateQueries({ queryKey: ["admin-promocodes"] });
    toast.success(c.is_active ? "Deactivated" : "Activated");
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="premium-card gold-border rounded-xl p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold mb-4"><Tag className="h-4 w-4" /> Create Promo Code</div>
        <div className="space-y-3">
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Code</Label>
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="bg-charcoal border-gold/30 mt-1.5 uppercase" placeholder="GRAND30" maxLength={20} />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Plan Type</Label>
            <select value={form.plan_type} onChange={(e) => setForm({ ...form, plan_type: e.target.value })} className="w-full mt-1.5 bg-charcoal border border-gold/30 rounded-lg px-3 py-2 text-sm">
              <option value="individual">Individual</option>
              <option value="showroom">Showroom</option>
            </select>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Days Granted</Label>
            <Input type="number" value={form.days_granted} onChange={(e) => setForm({ ...form, days_granted: e.target.value })} className="bg-charcoal border-gold/30 mt-1.5" min={1} max={365} />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Max Uses (optional)</Label>
            <Input value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} className="bg-charcoal border-gold/30 mt-1.5" placeholder="Unlimited" type="number" min={1} />
          </div>
          <Button variant="gold" className="w-full" onClick={createCode}>Create Code</Button>
        </div>
      </div>
      <div className="md:col-span-2 premium-card rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-charcoal text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="text-left p-3">Code</th><th className="text-left p-3">Plan</th><th className="text-left p-3">Days</th><th className="text-left p-3">Uses</th><th className="text-left p-3">Expires</th><th className="text-left p-3">Status</th><th></th></tr>
          </thead>
          <tbody>
            {data.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No promo codes yet.</td></tr>}
            {data.map((c: any) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3 font-mono">{c.code}</td>
                <td className="p-3">{c.plan_type}</td>
                <td className="p-3">{c.days_granted}</td>
                <td className="p-3">{c.uses_count}{c.max_uses ? `/${c.max_uses}` : ""}</td>
                <td className="p-3 text-muted-foreground text-xs">{new Date(c.expires_at).toLocaleDateString()}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs ${c.is_active ? "bg-emerald-500/15 text-emerald-400" : "bg-destructive/15 text-destructive"}`}>{c.is_active ? "Active" : "Inactive"}</span></td>
                <td className="p-3"><Button variant="ghost" size="sm" onClick={() => toggleActive(c)}>{c.is_active ? "Deactivate" : "Activate"}</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SupportTab() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-support"],
    queryFn: async () => {
      const { data } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const updateStatus = async (t: any, status: string) => {
    await supabase.from("support_tickets").update({ status, resolved_at: status === "resolved" ? new Date().toISOString() : null, closed_at: status === "closed" ? new Date().toISOString() : null }).eq("id", t.id);
    qc.invalidateQueries({ queryKey: ["admin-support"] });
    toast.success("Updated");
  };

  return (
    <div className="premium-card rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-charcoal text-xs uppercase tracking-widest text-muted-foreground">
          <tr><th className="text-left p-3">Subject</th><th className="text-left p-3">Status</th><th className="text-left p-3">Priority</th><th className="text-left p-3">Created</th><th></th></tr>
        </thead>
        <tbody>
          {data.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No support tickets.</td></tr>}
          {data.map((t: any) => (
            <tr key={t.id} className="border-t border-border">
              <td className="p-3">
                <div className="font-medium">{t.subject}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">{t.description}</div>
              </td>
              <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs ${t.status==='open'?'bg-gold-soft text-gold':t.status==='resolved'?'bg-emerald-500/15 text-emerald-400':'bg-charcoal'}`}>{t.status}</span></td>
              <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs ${t.priority==='high'||t.priority==='urgent'?'bg-destructive/15 text-destructive':'bg-charcoal'}`}>{t.priority}</span></td>
              <td className="p-3 text-muted-foreground text-xs">{new Date(t.created_at).toLocaleDateString()}</td>
              <td className="p-3 text-right whitespace-nowrap">
                {t.status !== "closed" && t.status !== "resolved" && <Button variant="ghost" size="sm" onClick={() => updateStatus(t, "resolved")}><Check className="h-4 w-4" /> Resolve</Button>}
                {t.status !== "closed" && <Button variant="ghost" size="sm" onClick={() => updateStatus(t, "closed")}><X className="h-4 w-4" /> Close</Button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AppointmentsTab() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select(`
          *,
          vehicle:vehicles ( id, brand, model, year ),
          seller:profiles!appointments_seller_id_fkey ( id, first_name, last_name, phone )
        `)
        .order("created_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });

  const updateStatus = async (apt: any, status: string) => {
    await supabase.from("appointments").update({ status }).eq("id", apt.id);
    toast.success("Status updated");
    qc.invalidateQueries({ queryKey: ["admin-appointments"] });
  };

  return (
    <div className="premium-card rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-charcoal text-xs uppercase tracking-widest text-muted-foreground">
          <tr>
            <th className="text-left p-3">Client</th>
            <th className="text-left p-3">Vehicle</th>
            <th className="text-left p-3">Seller</th>
            <th className="text-left p-3">Scheduled</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No appointments yet.</td></tr>}
          {data.map((apt: any) => (
            <tr key={apt.id} className="border-t border-border">
              <td className="p-3">
                <div className="font-medium">{apt.client_name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {apt.client_phone}
                </div>
                {apt.client_email && (
                  <div className="text-xs text-muted-foreground">{apt.client_email}</div>
                )}
              </td>
              <td className="p-3">
                <div className="font-medium">{apt.vehicle?.brand} {apt.vehicle?.model}</div>
                <div className="text-xs text-muted-foreground">{apt.vehicle?.year}</div>
              </td>
              <td className="p-3">
                <div>{apt.seller?.first_name} {apt.seller?.last_name}</div>
                <div className="text-xs text-muted-foreground">{apt.seller?.phone}</div>
              </td>
              <td className="p-3 text-muted-foreground text-xs">
                {apt.preferred_date ? (
                  <div>
                    <div>{new Date(apt.preferred_date).toLocaleDateString()}</div>
                    {apt.preferred_time && <div>{apt.preferred_time}</div>}
                  </div>
                ) : "-"}
              </td>
              <td className="p-3">
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  apt.status === 'pending' ? 'bg-gold-soft text-gold' :
                  apt.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-400' :
                  apt.status === 'completed' ? 'bg-blue-500/15 text-blue-400' :
                  'bg-destructive/15 text-destructive'
                }`}>
                  {apt.status}
                </span>
              </td>
              <td className="p-3 text-muted-foreground text-xs">
                {new Date(apt.created_at).toLocaleDateString()}
              </td>
              <td className="p-3 text-right whitespace-nowrap">
                {apt.status === "pending" && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => updateStatus(apt, "confirmed")}>
                      <Check className="h-4 w-4" /> Confirm
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => updateStatus(apt, "cancelled")}>
                      <X className="h-4 w-4" /> Cancel
                    </Button>
                  </>
                )}
                {apt.status === "confirmed" && (
                  <Button variant="ghost" size="sm" onClick={() => updateStatus(apt, "completed")}>
                    <Check className="h-4 w-4" /> Complete
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SiteSettingsTab() {
  const qc = useQueryClient();
  const { data: settings = [] } = useQuery({
    queryKey: ["admin-site-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*");
      return data ?? [];
    },
  });

  const [editing, setEditing] = useState<string | null>(null);
  const [value, setValue] = useState("");

  const settingsMap = settings.reduce((acc: Record<string, string>, s: any) => {
    acc[s.setting_key] = s.setting_value;
    return acc;
  }, {});

  const updateSetting = async (key: string) => {
    await supabase.from("site_settings").upsert({ setting_key: key, setting_value: value }, { onConflict: "setting_key" });
    toast.success("Setting updated");
    setEditing(null);
    setValue("");
    qc.invalidateQueries({ queryKey: ["admin-site-settings"] });
  };

  const startEdit = (key: string, currentValue: string) => {
    setEditing(key);
    setValue(currentValue);
  };

  const socialSettings = [
    { key: "whatsapp_number", label: "WhatsApp Number", icon: MessageCircle, placeholder: "+213555000000" },
    { key: "instagram_url", label: "Instagram URL", icon: Instagram, placeholder: "https://instagram.com/grandautoluxe" },
    { key: "facebook_url", label: "Facebook URL", icon: Facebook, placeholder: "https://facebook.com/grandautoluxe" },
    { key: "gmail_address", label: "Contact Email", icon: Mail, placeholder: "contact@grandautoluxe.com" },
  ];

  return (
    <div className="space-y-6">
      <div className="premium-card gold-border rounded-xl p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold mb-4">
          <Globe className="h-4 w-4" /> Social Media & Contact Links
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Update these links to change what appears in the website footer. Changes take effect immediately.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {socialSettings.map(({ key, label, icon: Icon, placeholder }) => (
            <div key={key} className="p-4 rounded-lg border border-border bg-charcoal space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Icon className="h-4 w-4 text-gold" />
                {label}
              </div>
              {editing === key ? (
                <div className="flex gap-2">
                  <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1"
                  />
                  <Button variant="gold" size="sm" onClick={() => updateSetting(key)}>Save</Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground truncate flex-1">
                    {settingsMap[key] || <span className="text-gold/60 italic">Not set</span>}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => startEdit(key, settingsMap[key] || "")}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="premium-card rounded-xl p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold mb-4">
          <Shield className="h-4 w-4" /> Create Admin User
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          After a user signs up, use this to promote them to Admin. First, find their phone number from the Users tab.
        </p>
        <div className="text-sm bg-charcoal p-4 rounded-lg border border-border">
          <code>SELECT public.setup_admin_user('+213555000000');</code>
          <p className="text-xs text-muted-foreground mt-2">
            Run this SQL in Supabase Dashboard SQL Editor with the user's phone number.
          </p>
        </div>
      </div>
    </div>
  );
}

function BroadcastTab() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const { data = [] } = useQuery({
    queryKey: ["admin-broadcast"],
    queryFn: async () => {
      const { data } = await supabase.from("broadcast_messages").select("*").order("created_at", { ascending: false }).limit(20);
      return data ?? [];
    },
  });
  const send = async () => {
    if (!title.trim() || !body.trim() || !user) return;
    setSending(true);
    await supabase.from("broadcast_messages").insert({ admin_id: user.id, title: title.trim(), body: body.trim() });
    const { data: targets } = await supabase.from("profiles").select("id").eq("is_banned", false);
    if (targets && targets.length > 0) {
      const rows = targets.map((t: any) => ({ user_id: t.id, title: `📢 ${title.trim()}`, body: body.trim(), kind: "broadcast" }));
      for (let i = 0; i < rows.length; i += 200) await supabase.from("notifications").insert(rows.slice(i, i + 200));
    }
    setSending(false);
    setTitle(""); setBody("");
    toast.success(`Sent · ${targets?.length ?? 0} users`);
    qc.invalidateQueries({ queryKey: ["admin-broadcast"] });
  };
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="premium-card gold-border rounded-xl p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold mb-3"><Megaphone className="h-4 w-4" /> Send to all users</div>
        <div className="space-y-3">
          <div><Label className="text-xs uppercase tracking-widest text-muted-foreground">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-charcoal border-gold/30 mt-1.5" maxLength={120} /></div>
          <div><Label className="text-xs uppercase tracking-widest text-muted-foreground">Message</Label><Textarea value={body} onChange={(e) => setBody(e.target.value)} className="bg-charcoal border-gold/30 mt-1.5 min-h-[120px]" maxLength={1000} /></div>
          <Button variant="gold" className="w-full" disabled={sending || !title.trim() || !body.trim()} onClick={send}><Send className="h-4 w-4" /> Broadcast</Button>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-widest text-gold/80 mb-2">Recent broadcasts</div>
        {data.length === 0 && <div className="text-sm text-muted-foreground">No broadcasts yet.</div>}
        {data.map((b: any) => (
          <div key={b.id} className="premium-card rounded-lg p-3 border border-border">
            <div className="font-semibold text-sm">{b.title}</div>
            <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{b.body}</div>
            <div className="text-[10px] text-gold/60 uppercase tracking-widest mt-2">{new Date(b.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
