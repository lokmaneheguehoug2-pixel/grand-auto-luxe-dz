import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Crown, ArrowRight, Check, Zap, Building2, Copy, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type PlanTier = "individual" | "showroom";
type BillingCycle = "monthly" | "yearly";

const PLAN_OPTIONS: Record<
  PlanTier,
  { name: string; nameAr: string; icon: typeof Zap; monthly: number; yearly: number; features: string[] }
> = {
  individual: {
    name: "Individual",
    nameAr: "الخطة الفردية",
    icon: Zap,
    monthly: 1000,
    yearly: 10000,
    features: ["1 post per day", "1 reel per day", "Standard listing"],
  },
  showroom: {
    name: "Showroom",
    nameAr: "خطة المعرض",
    icon: Building2,
    monthly: 2500,
    yearly: 25000,
    features: ["Unlimited posts", "Unlimited reels", "Priority placement", "Verified dealer badge"],
  },
};

const CCP_DETAILS = {
  beneficiary: "HEGUEHOUG LOKMANE CHAOUKI",
  rip: "007 99999 0043958063 39",
  account: "0043958063",
  key: "39",
};

export function PaywallGate() {
  const [tier, setTier] = useState<PlanTier>("individual");
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const plan = PLAN_OPTIONS[tier];
  const price = plan[billing];
  const planId = `${tier}-${billing}`;

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied");
    setTimeout(() => setCopiedField(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg my-8">
        <div className="relative overflow-hidden premium-card gold-border rounded-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(212,175,55,0.20),transparent_60%),radial-gradient(circle_at_80%_100%,rgba(212,175,55,0.14),transparent_55%)]" />
          <div className="relative p-6 sm:p-8">

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl gold-gradient grid place-items-center shrink-0 gold-glow">
                <Crown className="h-6 w-6 text-gold-foreground" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-gold">Access Locked</div>
                <h2 className="font-display text-2xl">Activate Premium</h2>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your 3-day free trial has expired. Activate your subscription to keep listing vehicles and reach the premium Algerian automotive market.
            </p>

            {/* Tier selector */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              {(Object.keys(PLAN_OPTIONS) as PlanTier[]).map((t) => {
                const opt = PLAN_OPTIONS[t];
                const TIcon = opt.icon;
                const isSelected = tier === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTier(t)}
                    className={`rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? "border-gold bg-gold/10 gold-glow"
                        : "border-border bg-charcoal hover:border-gold/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <TIcon className={`h-5 w-5 ${isSelected ? "text-gold" : "text-muted-foreground"}`} />
                      <span className="text-sm font-semibold">{opt.name}</span>
                    </div>
                    <div className="text-[10px] text-gold/70 mb-2">{opt.nameAr}</div>
                    <ul className="space-y-1">
                      {opt.features.map((f) => (
                        <li key={f} className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Check className="h-2.5 w-2.5 text-gold/60 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            {/* Billing cycle toggle */}
            <div className="mt-4 flex gap-2">
              {(["monthly", "yearly"] as BillingCycle[]).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={`flex-1 rounded-lg border py-2 text-sm transition ${
                    billing === b
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border text-muted-foreground hover:border-gold/30"
                  }`}
                >
                  {b === "monthly" ? "شهري · Monthly" : "سنوي · Yearly"}
                  {b === "yearly" && (
                    <span className="block text-[9px] text-gold/60">Save 2,000+ DA</span>
                  )}
                </button>
              ))}
            </div>

            {/* Price display */}
            <div className="mt-4 text-center">
              <div className="flex items-baseline justify-center gap-2">
                <span className="font-display text-3xl gold-shine">{price.toLocaleString()}</span>
                <span className="text-muted-foreground text-sm">DZD</span>
                <span className="text-muted-foreground/60 text-xs">/ {billing === "monthly" ? "شهر" : "سنة"}</span>
              </div>
            </div>

            {/* CCP Payment info */}
            <div className="mt-5 rounded-xl border border-gold/30 bg-black/30 p-4 space-y-2">
              <div className="text-[10px] uppercase tracking-widest text-gold/80 mb-2">معلومات الدفع CCP</div>

              {[
                { label: "Beneficiary", value: CCP_DETAILS.beneficiary, field: "beneficiary" },
                { label: "RIP", value: CCP_DETAILS.rip, field: "rip" },
                { label: "CCP Account / Key", value: `${CCP_DETAILS.account} / ${CCP_DETAILS.key}`, field: "account" },
              ].map(({ label, value, field }) => (
                <button
                  key={field}
                  onClick={() => copy(value, field)}
                  className="w-full flex items-center justify-between text-left rounded-lg px-2 py-1.5 hover:bg-gold/5 transition"
                >
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
                    <div className="font-mono text-sm">{value}</div>
                  </div>
                  {copiedField === field ? (
                    <Check className="h-4 w-4 text-gold" />
                  ) : (
                    <Copy className="h-4 w-4 text-gold/60" />
                  )}
                </button>
              ))}
            </div>

            {/* CTA */}
            <Button asChild variant="gold" className="w-full mt-5 h-12">
              <Link to="/checkout" state={{ plan: planId }}>
                <Sparkles className="h-4 w-4 mr-2" />
                رفع وصل الدفع · Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <p className="text-[10px] text-muted-foreground text-center mt-3">
              بعد التحويل، أرفع صورة الوصل وسيقوم المسؤول بتفعيل حسابك خلال دقائق.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
