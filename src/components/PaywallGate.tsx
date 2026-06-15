import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, Upload, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

export function PaywallGate() {
  const { user, reloadProfile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    if (!file || !user) return;
    setSubmitting(true);
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("payment-receipts").upload(path, file);
    if (upErr) { toast.error(upErr.message); setSubmitting(false); return; }
    const { error } = await supabase.from("payments").insert({ user_id: user.id, screenshot_url: path });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    setSubmitted(true);
    toast.success("Receipt submitted. Awaiting admin activation.");
    reloadProfile();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg my-8">
        <div className="premium-card gold-border rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl gold-gradient grid place-items-center shrink-0">
              <Crown className="h-6 w-6 text-gold-foreground" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-gold">Access Locked</div>
              <h2 className="font-display text-2xl">Activate Premium</h2>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your 3-day free trial has expired. To maintain access to the premium Algerian automotive market and continue receiving prospective buyers, activate your monthly subscription for{" "}
            <span className="gold-text font-bold">1000 DZD</span>.
          </p>

          <div className="mt-6 rounded-xl border border-gold/30 bg-charcoal p-4">
            <div className="text-xs uppercase tracking-widest text-gold mb-3">Baridimob Payment</div>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Account Name</span><span className="font-semibold">GRAND AUTO LUXE SARL</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">RIP</span><span className="font-mono">00799999 0012345678 90</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="gold-text font-bold">1000 DZD</span></div>
            </div>
          </div>

          {submitted ? (
            <div className="mt-6 rounded-xl border border-gold/40 bg-gold-soft p-4 text-center">
              <Check className="h-6 w-6 text-gold mx-auto mb-2" />
              <div className="font-semibold">Receipt submitted</div>
              <div className="text-xs text-muted-foreground mt-1">Admin will activate your account shortly.</div>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Upload Receipt Screenshot</Label>
              <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="bg-charcoal border-border" />
              <Button variant="gold" className="w-full" disabled={!file || submitting} onClick={submit}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Submit for Activation
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
