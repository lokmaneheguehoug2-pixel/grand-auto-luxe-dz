import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Shield, Trash2, Check, X, Eye, DollarSign, Send, Ban, UserCheck, Crown, Megaphone, Zap } from "lucide-react";
import { useSignedUrl } from "@/hooks/use-signed-url";
import { toast } from "sonner";
import { useState } from "react";
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

      <RevenueWidget />

      <Tabs defaultValue="subscriptions" className="mt-6">
        <TabsList className="bg-charcoal border border-border mb-6 flex-wrap h-auto">
          <TabsTrigger value="subscriptions" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">Subscriptions</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">Users</TabsTrigger>
          <TabsTrigger value="listings" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">Listings</TabsTrigger>
          <TabsTrigger value="broadcast" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">Broadcast</TabsTrigger>
        </TabsList>
        <TabsContent value="subscriptions"><SubscriptionsTab /></TabsContent>
        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="listings"><ListingsTab /></TabsContent>
        <TabsContent value="broadcast"><BroadcastTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function RevenueWidget() {
  const { data } = useQuery({
    queryKey: ["admin-revenue"],
    queryFn: async () => {
      const { data } = await supabase
        .from("pending_subscriptions")
        .select("amount, plan, status, reviewed_at");
      const approved = (data ?? []).filter((d) => d.status === "approved");
      const total = approved.reduce((s, r) => s + Number(r.amount), 0);
      const pending = (data ?? []).filter((d) => d.status === "pending").length;
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
      const mtd = approved.filter((r) => r.reviewed_at && new Date(r.reviewed_at) >= monthStart).reduce((s, r) => s + Number(r.amount), 0);
      return { total, pending, mtd, count: approved.length };
    },
  });
  const stats = [
    { label: "Total Revenue", value: formatDZD(data?.total ?? 0), icon: DollarSign },
    { label: "Month-to-date", value: formatDZD(data?.mtd ?? 0), icon: Crown },
    { label: "Approved subs", value: String(data?.count ?? 0), icon: UserCheck },
    { label: "Pending review", value: String(data?.pending ?? 0), icon: Send },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
      const { data: subs } = await supabase
        .from("pending_subscriptions")
        .select("*")
        .order("submitted_at", { ascending: false });
      const ids = Array.from(new Set((subs ?? []).map((s) => s.user_id)));
      const { data: profs } = ids.length
        ? await supabase.from("profiles").select("id,first_name,last_name,phone").in("id", ids)
        : { data: [] as any[] };
      const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
      return (subs ?? []).map((s) => ({ ...s, profiles: map.get(s.user_id) }));
    },
  });

  const approve = async (p: any) => {
    const days = p.plan === "yearly" ? 365 : 30;
    const until = new Date(Date.now() + days * 86400_000).toISOString();
    const { error: e1 } = await supabase.from("profiles").update({ subscription_status: "active", subscription_until: until }).eq("id", p.user_id);
    const { error: e2 } = await supabase.from("pending_subscriptions").update({ status: "approved", reviewed_at: new Date().toISOString() }).eq("id", p.id);
    if (e1 || e2) { toast.error((e1||e2)!.message); return; }
    toast.success(`Subscription activated · ${days} days`);
    qc.invalidateQueries({ queryKey: ["admin-pending-subs"] });
    qc.invalidateQueries({ queryKey: ["admin-revenue"] });
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
        <div className="mt-1 text-xs">
          <span className={`px-2 py-0.5 rounded-full ${p.status==='pending'?'bg-gold-soft text-gold':p.status==='approved'?'bg-emerald-500/15 text-emerald-400':'bg-destructive/15 text-destructive'}`}>{p.status}</span>
        </div>
        {open && url && (
          <a href={url} target="_blank" rel="noreferrer">
            <img src={url} alt="receipt" className="mt-3 max-h-80 rounded-lg border border-gold/30" />
          </a>
        )}
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}><Eye className="h-4 w-4" /> View</Button>
        {p.status === "pending" && (
          <>
            <Button variant="gold" size="sm" onClick={onApprove}><Check className="h-4 w-4" /> Activate</Button>
            <Button variant="ghost" size="sm" onClick={onReject}><X className="h-4 w-4" /> Reject</Button>
          </>
        )}
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
    const { error } = await supabase.from("profiles").update({ is_banned: !u.is_banned }).eq("id", u.id);
    if (error) { toast.error(error.message); return; }
    toast.success(u.is_banned ? "User reactivated" : "User banned");
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  };
  const activate = async (u: any, days: number) => {
    const until = new Date(Date.now() + days * 86400_000).toISOString();
    const { error } = await supabase.from("profiles").update({ subscription_status: "active", subscription_until: until }).eq("id", u.id);
    if (error) { toast.error(error.message); return; }
    await supabase.from("notifications").insert({
      user_id: u.id,
      title: "✨ تم تفعيل اشتراكك",
      body: `حسابك مفعّل لمدة ${days} يوم. يمكنك الآن نشر الإعلانات والريلز بدون قيود.`,
      kind: "subscription",
    });
    toast.success(`Activated · ${days} days`);
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  };
  return (
    <div className="premium-card rounded-xl overflow-x-auto">
      <table className="w-full text-sm min-w-[720px]">
        <thead className="bg-charcoal text-xs uppercase tracking-widest text-muted-foreground">
          <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Phone</th><th className="text-left p-3">Status</th><th className="text-left p-3">Joined</th><th></th></tr>
        </thead>
        <tbody>
          {data.map((u: any) => (
            <tr key={u.id} className="border-t border-border">
              <td className="p-3">
                {u.first_name} {u.last_name}
                {u.is_banned && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-destructive/20 text-destructive uppercase">Banned</span>}
              </td>
              <td className="p-3 font-mono text-xs">{u.phone}</td>
              <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs ${u.subscription_status==='active'?'bg-emerald-500/15 text-emerald-400':u.subscription_status==='trial'?'bg-gold-soft text-gold':'bg-destructive/15 text-destructive'}`}>{u.subscription_status}</span></td>
              <td className="p-3 text-muted-foreground text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
              <td className="p-3 text-right whitespace-nowrap">
                <Button variant="gold" size="sm" className="mr-1" onClick={() => activate(u, 30)} title="Activate 30 days">
                  <Zap className="h-3.5 w-3.5" /> 30d
                </Button>
                <Button variant="gold-outline" size="sm" className="mr-1" onClick={() => activate(u, 365)}>
                  365d
                </Button>
                <Button variant="ghost" size="sm" onClick={() => toggleBan(u)}>
                  {u.is_banned ? <><UserCheck className="h-4 w-4 text-emerald-400" /> Unban</> : <><Ban className="h-4 w-4 text-destructive" /> Ban</>}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
        </thead>
        <tbody>
          {data.map((u: any) => (
            <tr key={u.id} className="border-t border-border">
              <td className="p-3">
                {u.first_name} {u.last_name}
                {u.is_banned && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-destructive/20 text-destructive uppercase">Banned</span>}
              </td>
              <td className="p-3 font-mono text-xs">{u.phone}</td>
              <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs ${u.subscription_status==='active'?'bg-emerald-500/15 text-emerald-400':u.subscription_status==='trial'?'bg-gold-soft text-gold':'bg-destructive/15 text-destructive'}`}>{u.subscription_status}</span></td>
              <td className="p-3 text-muted-foreground text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
              <td className="p-3 text-right">
                <Button variant="ghost" size="sm" onClick={() => toggleBan(u)}>
                  {u.is_banned ? <><UserCheck className="h-4 w-4 text-emerald-400" /> Unban</> : <><Ban className="h-4 w-4 text-destructive" /> Ban</>}
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
  const { data = [] } = useQuery({
    queryKey: ["admin-listings"],
    queryFn: async () => {
      const { data } = await supabase.from("vehicles").select("id, brand, model, year, wilaya, created_at, status").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const del = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    await supabase.from("vehicles").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-listings"] });
    toast.success("Listing removed.");
  };
  return (
    <div className="premium-card rounded-xl overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead className="bg-charcoal text-xs uppercase tracking-widest text-muted-foreground">
          <tr><th className="text-left p-3">Vehicle</th><th className="text-left p-3">Wilaya</th><th className="text-left p-3">Status</th><th className="text-left p-3">Date</th><th></th></tr>
        </thead>
        <tbody>
          {data.map((v: any) => (
            <tr key={v.id} className="border-t border-border">
              <td className="p-3">{v.brand} {v.model} <span className="text-muted-foreground text-xs">· {v.year}</span></td>
              <td className="p-3">{v.wilaya}</td>
              <td className="p-3"><span className="text-xs px-2 py-0.5 rounded-full bg-charcoal border border-border">{v.status}</span></td>
              <td className="p-3 text-muted-foreground text-xs">{new Date(v.created_at).toLocaleDateString()}</td>
              <td className="p-3 text-right"><Button variant="ghost" size="sm" onClick={() => del(v.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
            </tr>
          ))}
        </tbody>
      </table>
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
    const { error } = await supabase.from("broadcast_messages").insert({ admin_id: user.id, title: title.trim(), body: body.trim() });
    setSending(false);
    if (error) { toast.error(error.message); return; }
    setTitle(""); setBody("");
    toast.success("Broadcast sent");
    qc.invalidateQueries({ queryKey: ["admin-broadcast"] });
  };
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="premium-card gold-border rounded-xl p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold mb-3"><Megaphone className="h-4 w-4" /> Send to all users</div>
        <div className="space-y-3">
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-charcoal border-gold/30 mt-1.5" maxLength={120} />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Message</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} className="bg-charcoal border-gold/30 mt-1.5 min-h-[120px]" maxLength={1000} />
          </div>
          <Button variant="gold" className="w-full" disabled={sending || !title.trim() || !body.trim()} onClick={send}>
            <Send className="h-4 w-4" /> Broadcast
          </Button>
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
