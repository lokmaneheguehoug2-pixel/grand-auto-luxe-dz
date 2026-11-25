import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Crown, ArrowRight, Check, Zap, Building2, Copy, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from "@/lib/pricing";

const PLAN_IDS = Object.keys(SUBSCRIPTION_PLANS) as SubscriptionPlan[];
const PLAN_FEATURES: Record<SubscriptionPlan, string[]> = {
  "individual-monthly": ["حتى 30 صورة لكل إعلان", "تفعيل بعد مراجعة الدفع"],
  "individual-yearly": ["حتى 30 صورة لكل إعلان", "تفعيل بعد مراجعة الدفع"],
  "showroom-monthly": ["ملف معرض وإدارة المخزون", "التوثيق بعد مراجعة الإدارة"],
  "showroom-yearly": ["ملف معرض وإدارة المخزون", "التوثيق بعد مراجعة الإدارة"],
};

const CCP_DETAILS = {
  beneficiary: "HEGUEHOUG LOKMANE CHAOUKI",
  rip: "007 99999 0043958063 39",
  account: "0043958063",
  key: "39",
};

export function PaywallGate() {
  const [planId, setPlanId] = useState<SubscriptionPlan>("individual-monthly");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const plan = SUBSCRIPTION_PLANS[planId];

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
              Access is currently limited. Choose an available plan; payment receipts are reviewed manually before activation.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {PLAN_IDS.map((id) => {
                const option = SUBSCRIPTION_PLANS[id];
                const OptionIcon = option.tier === "dealer" ? Building2 : Zap;
                const isSelected = planId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setPlanId(id)}
                    className={`rounded-xl border p-3 text-left transition ${
                      isSelected ? "border-gold bg-gold/10 gold-glow" : "border-border bg-charcoal hover:border-gold/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <OptionIcon className={`h-4 w-4 ${isSelected ? "text-gold" : "text-muted-foreground"}`} />
                      <span className="text-xs font-semibold">{option.nameEn}</span>
                    </div>
                    <div className="text-[10px] text-gold/70 mb-2">{option.name} · {option.period}</div>
                    <div className="text-sm font-semibold">{option.price.toLocaleString()} DZD</div>
                    <ul className="mt-2 space-y-1">
                      {PLAN_FEATURES[id].map((feature) => (
                        <li key={feature} className="text-[10px] text-muted-foreground flex items-start gap-1">
                          <Check className="h-2.5 w-2.5 text-gold/60 shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 text-center">
              <div className="flex items-baseline justify-center gap-2">
                <span className="font-display text-3xl gold-shine">{plan.price.toLocaleString()}</span>
                <span className="text-muted-foreground text-sm">DZD</span>
                <span className="text-muted-foreground/60 text-xs">/ {plan.period}</span>
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
              <Link to="/checkout" state={(previous) => ({ ...previous, plan: planId })}>
                <Sparkles className="h-4 w-4 mr-2" />
                رفع وصل الدفع · Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <p className="text-[10px] text-muted-foreground text-center mt-3">
              يتم تفعيل الاشتراك بعد مراجعة وصل الدفع يدويًا.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
