import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Shield, Trash2, Check, X, Eye } from "lucide-react";
import { useSignedUrl } from "@/hooks/use-signed-url";
import { toast } from "sonner";
import { useState } from "react";

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
      <Tabs defaultValue="payments">
        <TabsList className="bg-charcoal border border-border mb-6">
          <TabsTrigger value="payments" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">Pending Payments</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">Users</TabsTrigger>
          <TabsTrigger value="listings" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">Listings</TabsTrigger>
        </TabsList>
        <TabsContent value="payments"><PaymentsTab /></TabsContent>
        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="listings"><ListingsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function PaymentsTab() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data } = await supabase.from("payments").select("*, profiles!payments_user_id_fkey(first_name,last_name,phone)").order("submitted_at", { ascending: false });
      return data ?? [];
    },
  });

  const approve = async (p: any) => {
    const until = new Date(Date.now() + 30 * 86400_000).toISOString();
    const { error: e1 } = await supabase.from("profiles").update({ subscription_status: "active", subscription_until: until }).eq("id", p.user_id);
    const { error: e2 } = await supabase.from("payments").update({ status: "approved", reviewed_at: new Date().toISOString() }).eq("id", p.id);
    if (e1 || e2) { toast.error((e1||e2)!.message); return; }
    toast.success("Subscription activated.");
    qc.invalidateQueries({ queryKey: ["admin-payments"] });
  };
  const reject = async (p: any) => {
    await supabase.from("payments").update({ status: "rejected", reviewed_at: new Date().toISOString() }).eq("id", p.id);
    qc.invalidateQueries({ queryKey: ["admin-payments"] });
  };

  return (
    <div className="space-y-3">
      {data.length === 0 && <div className="text-center text-muted-foreground py-12">No payments submitted.</div>}
      {data.map((p: any) => <PaymentRow key={p.id} p={p} onApprove={() => approve(p)} onReject={() => reject(p)} />)}
    </div>
  );
}

function PaymentRow({ p, onApprove, onReject }: { p: any; onApprove: () => void; onReject: () => void }) {
  const url = useSignedUrl("payment-receipts", p.screenshot_url, 600);
  const [open, setOpen] = useState(false);
  return (
    <div className="premium-card rounded-xl p-4 grid sm:grid-cols-[1fr_auto] gap-3 items-center">
      <div>
        <div className="font-semibold">{p.profiles?.first_name} {p.profiles?.last_name}</div>
        <div className="text-xs text-muted-foreground">{p.profiles?.phone} · {new Date(p.submitted_at).toLocaleString()}</div>
        <div className="mt-1 text-xs"><span className={`px-2 py-0.5 rounded-full ${p.status==='pending'?'bg-gold-soft text-gold':p.status==='approved'?'bg-emerald-500/15 text-emerald-400':'bg-destructive/15 text-destructive'}`}>{p.status}</span></div>
        {open && url && <img src={url} alt="receipt" className="mt-3 max-h-80 rounded-lg border border-border" />}
      </div>
      <div className="flex gap-2">
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
  const { data = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  return (
    <div className="premium-card rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-charcoal text-xs uppercase tracking-widest text-muted-foreground">
          <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Phone</th><th className="text-left p-3">Status</th><th className="text-left p-3">Joined</th></tr>
        </thead>
        <tbody>
          {data.map((u: any) => (
            <tr key={u.id} className="border-t border-border">
              <td className="p-3">{u.first_name} {u.last_name}</td>
              <td className="p-3 font-mono text-xs">{u.phone}</td>
              <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs ${u.subscription_status==='active'?'bg-emerald-500/15 text-emerald-400':u.subscription_status==='trial'?'bg-gold-soft text-gold':'bg-destructive/15 text-destructive'}`}>{u.subscription_status}</span></td>
              <td className="p-3 text-muted-foreground text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
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
      const { data } = await supabase.from("vehicles").select("id, brand, model, year, wilaya, created_at").order("created_at", { ascending: false });
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
    <div className="premium-card rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-charcoal text-xs uppercase tracking-widest text-muted-foreground">
          <tr><th className="text-left p-3">Vehicle</th><th className="text-left p-3">Wilaya</th><th className="text-left p-3">Date</th><th></th></tr>
        </thead>
        <tbody>
          {data.map((v: any) => (
            <tr key={v.id} className="border-t border-border">
              <td className="p-3">{v.brand} {v.model} <span className="text-muted-foreground text-xs">· {v.year}</span></td>
              <td className="p-3">{v.wilaya}</td>
              <td className="p-3 text-muted-foreground text-xs">{new Date(v.created_at).toLocaleDateString()}</td>
              <td className="p-3 text-right"><Button variant="ghost" size="sm" onClick={() => del(v.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
