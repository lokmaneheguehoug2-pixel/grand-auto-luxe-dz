import { createFileRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Crown, Copy, Check, Upload, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { push, set, ref as dbRef } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Activation · GRAND Auto Luxe" }] }),
  component: CheckoutPage,
});

// Verified CCP Payment Details
const CCP_DETAILS = {
  beneficiary: "HEGUEHOUG LOKMANE CHAOUKI",
  rip: "007 99999 0043958063 39",
  account: "0043958063",
  key: "39",
};

// 4 Plans
const PLANS = [
  { id: "individual-monthly", label: "Individual Monthly · 1,000 DZD", amount: 1000 },
  { id: "individual-yearly", label: "Individual Yearly · 10,000 DZD", amount: 10000 },
  { id: "showroom-monthly", label: "Showroom Monthly · 2,500 DZD", amount: 2500 },
  { id: "showroom-yearly", label: "Showroom Yearly · 25,000 DZD", amount: 25000 },
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
  const auth = useAuth();
  const user = auth?.user;
  const loading = auth?.loading ?? true;

  const navigate = useNavigate();
  const routerState = useRouterState();
  const planFromState = (routerState.location.state as any)?.plan || "individual-monthly";

  const [plan, setPlan] = useState<string>(planFromState);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selected = PLANS.find((p) => p.id === plan) || PLANS[0];

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

    try {
      // Upload receipt to Cloudinary
      const receiptUrl = await uploadImageToCloudinary(file);

      // Create pending subscription in Firebase Realtime Database
      const subRef = push(dbRef(realtimeDb, "subscriptions"));
      const subId = subRef.key!;

      await set(subRef, {
        id: subId,
        userId: user.id,
        userPhone: user.phone,
        plan,
        amount: selected.amount,
        receiptUrl, // Cloudinary URL
        status: "pending",
        submittedAt: new Date().toISOString(),
      });

      toast.success("Receipt submitted · Admin will activate shortly");
      navigate({ to: "/my-listings" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl gold-gradient grid place-items-center shrink-0 gold-glow">
          <Crown className="h-6 w-6 text-gold-foreground" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-gold">Subscription Activation</div>
          <h1 className="font-display text-3xl gold-shine">تفعيل الاشتراك</h1>
        </div>
      </div>

      {/* Payment Details */}
      <div className="premium-card rounded-xl p-6 border border-gold/20 mb-6">
        <h2 className="font-display text-lg mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-gold" />
          معلومات الدفع CCP
        </h2>

        <div className="space-y-2">
          <CopyRow label="Beneficiary" value={CCP_DETAILS.beneficiary} />
          <CopyRow label="RIP" value={CCP_DETAILS.rip} />
          <CopyRow label="CCP Account" value={`${CCP_DETAILS.account} / ${CCP_DETAILS.key}`} />
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Pay via CCP / Baridimob and upload receipt below
        </p>
      </div>

      {/* Plan Selection */}
      <div className="premium-card rounded-xl p-6 border border-gold/20 mb-6">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Select Plan</Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {PLANS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlan(p.id)}
              className={`rounded-lg border p-3 text-left transition ${
                plan === p.id
                  ? "border-gold bg-gold/10"
                  : "border-white/10 bg-charcoal/40 hover:border-gold/30"
              }`}
            >
              <div className="text-xs text-white/60">{p.id.includes("yearly") ? "Yearly" : "Monthly"}</div>
              <div className="font-medium">{p.amount.toLocaleString()} DZD</div>
            </button>
          ))}
        </div>
      </div>

      {/* Receipt Upload */}
      <div className="premium-card rounded-xl p-6 border border-gold/20 mb-6">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">
          Upload Receipt (PNG/JPG)
        </Label>
        <div className="mt-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm"
          />
          {file && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-400" />
              <span className="text-white/80">{file.name}</span>
            </div>
          )}
        </div>

        {/* Image Preview */}
        {file && (
          <div className="mt-4">
            <img
              src={URL.createObjectURL(file)}
              alt="Receipt preview"
              className="max-h-48 rounded-lg border border-gold/20"
            />
          </div>
        )}
      </div>

      {/* Submit */}
      <Button
        variant="gold"
        size="lg"
        className="w-full"
        disabled={submitting || !file}
        onClick={submit}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Submit Receipt · {selected.amount.toLocaleString()} DZD
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Admin will verify and activate within minutes
      </p>
    </div>
  );
}
