import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Crown, ArrowRight, Copy, Check, Zap, Building2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from "@/lib/pricing";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: string;
  selectedPlan?: string | null;
};

const CCP_DETAILS = {
  beneficiary: "HEGUEHOUG LOKMANE CHAOUKI",
  rip: "007 99999 0043958063 39",
  account: "0043958063",
  key: "39",
};

const PLAN_IDS = Object.keys(SUBSCRIPTION_PLANS) as SubscriptionPlan[];
const PLAN_FEATURES: Record<SubscriptionPlan, string[]> = {
  "individual-monthly": ["حتى 30 صورة لكل إعلان", "تفعيل بعد مراجعة الدفع"],
  "individual-yearly": ["حتى 30 صورة لكل إعلان", "تفعيل بعد مراجعة الدفع"],
  "showroom-monthly": ["ملف معرض وإدارة المخزون", "التوثيق بعد مراجعة الإدارة"],
  "showroom-yearly": ["ملف معرض وإدارة المخزون", "التوثيق بعد مراجعة الإدارة"],
};

function normalizePlanId(value?: string | null): SubscriptionPlan {
  return value && Object.prototype.hasOwnProperty.call(SUBSCRIPTION_PLANS, value)
    ? value as SubscriptionPlan
    : "individual-monthly";
}

export function PremiumPaywallModal({ open, onOpenChange, reason, selectedPlan: initialPlan }: Props) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [planId, setPlanId] = useState<SubscriptionPlan>(normalizePlanId(initialPlan));

  useEffect(() => {
    if (open) setPlanId(normalizePlanId(initialPlan));
  }, [initialPlan, open]);

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied");
    setTimeout(() => setCopiedField(null), 1500);
  };

  const plan = SUBSCRIPTION_PLANS[planId];
  const Icon = plan.tier === "dealer" ? Building2 : Zap;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black border-gold/60 max-w-lg p-0 max-h-[90dvh] overflow-y-auto">
        <div className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(212,175,55,0.25),transparent_60%),radial-gradient(circle_at_80%_100%,rgba(212,175,55,0.18),transparent_55%)]" />
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl gold-gradient grid place-items-center shrink-0 gold-glow">
                <Crown className="h-6 w-6 text-gold-foreground" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-gold">Premium Required</div>
                <h2 className="font-display text-2xl gold-shine">Activate to Publish</h2>
              </div>
            </div>

            <p className="text-sm text-white/80 leading-relaxed">
              {reason ?? "للنشر على GRAND Auto Luxe (إعلان أو ريلز) يجب تفعيل اشتراكك الفاخر."}
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
                      isSelected ? "border-gold bg-gold/10 gold-glow" : "border-white/10 bg-black/40 hover:border-gold/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <OptionIcon className={`h-4 w-4 ${isSelected ? "text-gold" : "text-white/60"}`} />
                      <span className="text-xs font-medium text-white">{option.nameEn}</span>
                    </div>
                    <div className="text-[10px] text-gold/70 mb-2">{option.name} · {option.period}</div>
                    <div className="text-sm font-semibold text-white">{option.price.toLocaleString()} DZD</div>
                    <ul className="mt-2 space-y-1">
                      {PLAN_FEATURES[id].map((feature) => (
                        <li key={feature} className="text-[10px] text-white/60 flex items-start gap-1">
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
                <span className="text-white/60 text-sm">DZD</span>
                <span className="text-white/40 text-xs">/ {plan.period}</span>
              </div>
            </div>

            {/* CCP Payment info */}
            <div className="mt-5 rounded-xl border border-gold/30 bg-black/50 p-4 space-y-2">
              <div className="text-[10px] uppercase tracking-widest text-gold/80 mb-2">معاومات الدفع CCP</div>

              <button
                onClick={() => copy(CCP_DETAILS.beneficiary, "beneficiary")}
                className="w-full flex items-center justify-between text-left rounded-lg px-2 py-1.5 hover:bg-gold-soft/20 transition"
              >
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/50">Beneficiary</div>
                  <div className="font-mono text-sm text-white">{CCP_DETAILS.beneficiary}</div>
                </div>
                {copiedField === "beneficiary" ? <Check className="h-4 w-4 text-gold" /> : <Copy className="h-4 w-4 text-gold/60" />}
              </button>

              <button
                onClick={() => copy(CCP_DETAILS.rip, "rip")}
                className="w-full flex items-center justify-between text-left rounded-lg px-2 py-1.5 hover:bg-gold-soft/20 transition"
              >
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/50">RIP</div>
                  <div className="font-mono text-sm text-white">{CCP_DETAILS.rip}</div>
                </div>
                {copiedField === "rip" ? <Check className="h-4 w-4 text-gold" /> : <Copy className="h-4 w-4 text-gold/60" />}
              </button>

              <button
                onClick={() => copy(`${CCP_DETAILS.account}/${CCP_DETAILS.key}`, "account")}
                className="w-full flex items-center justify-between text-left rounded-lg px-2 py-1.5 hover:bg-gold-soft/20 transition"
              >
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/50">CCP Account / Key</div>
                  <div className="font-mono text-sm text-white">{CCP_DETAILS.account} / {CCP_DETAILS.key}</div>
                </div>
                {copiedField === "account" ? <Check className="h-4 w-4 text-gold" /> : <Copy className="h-4 w-4 text-gold/60" />}
              </button>
            </div>

            <Button asChild variant="gold" className="w-full mt-5 h-12">
              <Link to="/checkout" state={(previous) => ({ ...previous, plan: planId })} onClick={() => onOpenChange(false)}>
                <Sparkles className="h-4 w-4 mr-2" />
                رفع وصل الدفع · Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <p className="text-[10px] text-white/40 text-center mt-3">
              يتم تفعيل الاشتراك بعد مراجعة وصل الدفع يدويًا.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
