import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Copy, Check, Upload, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Activation · GRAND Auto Luxe" }] }),
  component: CheckoutPage,
});

const PAYMENT_INFO = {
  name: "HEGUEHOUG LOKMANE CHAOUKI",
  rip: "007 99999 0043958063 39",
  ccp: "0043958063 clé 39",
};

const PLANS = [
  { value: "monthly", label: "Monthly · 1,000 DZD", amount: 1000 },
  { value: "yearly", label: "Yearly · 10,000 DZD", amount: 10000 },
] as const;

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`${label} copied`);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gold/20 bg-charcoal/60 px-3 py-2.5">
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-gold/70">{label}</div>
        <div className="font-mono text-sm truncate">{value}</div>
      </div>
      <Button variant="gold-outline" size="sm" onClick={copy} className="shrink-0">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}

function CheckoutPage() {
  const { user, reloadProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selected = PLANS.find((p) => p.value === plan)!;

  if (!loading && !user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-2xl mb-3">Sign in required</h1>
        <Button asChild variant="gold"><Link to="/auth">Go to sign in</Link></Button>
      </div>
    );
  }

  const submit = async () => {
    if (!file || !user) return;
    setSubmitting(true);
    const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("payment-receipts").upload(path, file);
    if (upErr) { toast.error(upErr.message); setSubmitting(false); return; }
    const { error } = await supabase.from("pending_subscriptions").insert({
      user_id: user.id,
      plan,
      amount: selected.amount,
      receipt_url: path,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Receipt submitted · Admin will activate shortly");
    reloadProfile();
    navigate({ to: "/my-listings" });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl gold-gradient grid place-items-center">
          <Crown className="h-6 w-6 text-gold-foreground" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-gold">Premium Activation</div>
          <h1 className="font-display text-3xl">Activate your subscription</h1>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="premium-card gold-border rounded-2xl p-6">
          <div className="text-xs uppercase tracking-widest text-gold mb-3">Step 1 · Pay via Baridimob / CCP</div>
          <div className="space-y-2.5">
            <CopyRow label="Recipient" value={PAYMENT_INFO.name} />
            <CopyRow label="RIP" value={PAYMENT_INFO.rip} />
            <CopyRow label="CCP" value={PAYMENT_INFO.ccp} />
          </div>
          <div className="mt-5 rounded-lg border border-gold/30 bg-gold-soft p-3 text-xs text-muted-foreground leading-relaxed">
            Send the exact plan amount, take a clear screenshot of the confirmation, then upload it on the right.
          </div>
        </section>

        <section className="premium-card gold-border rounded-2xl p-6">
          <div className="text-xs uppercase tracking-widest text-gold mb-3">Step 2 · Submit receipt</div>

          <div className="space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Plan</Label>
              <Select value={plan} onValueChange={(v) => setPlan(v as "monthly" | "yearly")}>
                <SelectTrigger className="bg-charcoal border-gold/30 mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLANS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border border-gold/30 bg-charcoal p-3 flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Amount due</span>
              <span className="gold-text font-display text-2xl">{selected.amount.toLocaleString("fr-DZ")} DZD</span>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Receipt screenshot</Label>
              <Input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="bg-charcoal border-gold/30 mt-1.5"
              />
              {file && <div className="text-xs text-gold/80 mt-1.5 truncate">{file.name}</div>}
            </div>

            <Button variant="gold" className="w-full" disabled={!file || submitting} onClick={submit}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Submit for activation
            </Button>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-gold" />
              Manually reviewed within 24h by the GRAND Auto Luxe team.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
