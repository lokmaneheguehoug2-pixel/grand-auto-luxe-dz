import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Crown, ArrowRight, Copy, Check, Zap, Building2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: string;
};

const PAYMENT_INFO = [
  { label: "Baridimob / CCP", value: "00799999004395806339" },
  { label: "Account holder", value: "HEGUEHOUG LOKMANE CHAOUKI" },
];

const PLANS = [
  {
    id: "individual",
    name: "خطة فردية",
    nameEn: "Individual",
    icon: Zap,
    monthly: 1000,
    yearly: 10000,
  },
  {
    id: "showroom",
    name: "خطة معرض",
    nameEn: "Showroom",
    icon: Building2,
    monthly: 2500,
    yearly: 25000,
  },
];

export function PremiumPaywallModal({ open, onOpenChange, reason }: Props) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const [selectedPlan, setSelectedPlan] = useState<"individual" | "showroom">("individual");
  const copy = (text: string, i: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(i);
    toast.success("Copié");
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const price = billing === "monthly" ? PLANS.find((p) => p.id === selectedPlan)!.monthly : PLANS.find((p) => p.id === selectedPlan)!.yearly;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black border-gold/60 max-w-lg p-0 overflow-hidden">
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

            {/* Plan selector */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              {PLANS.map((plan) => {
                const Icon = plan.icon;
                const isSelected = selectedPlan === plan.id;
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id as any)}
                    className={`rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? "border-gold bg-gold/10"
                        : "border-white/10 bg-black/40 hover:border-gold/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`h-4 w-4 ${isSelected ? "text-gold" : "text-white/60"}`} />
                      <span className="text-xs text-white/60">{plan.nameEn}</span>
                    </div>
                    <div className="font-medium gold-text">{plan.name}</div>
                    <div className="text-xs text-white/50 mt-1">
                      {plan.id === "individual" ? "1 post/day" : "Unlimited"}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Billing toggle */}
            <div className="mt-4 flex justify-center">
              <div className="inline-flex rounded-full border border-gold/30 bg-black/50 p-1 text-xs">
                <button
                  onClick={() => setBilling("monthly")}
                  className={`px-4 py-1.5 rounded-full transition ${
                    billing === "monthly" ? "bg-gold text-black" : "text-white/60"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling("yearly")}
                  className={`px-4 py-1.5 rounded-full transition ${
                    billing === "yearly" ? "bg-gold text-black" : "text-white/60"
                  }`}
                >
                  Yearly · Save 20%
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="mt-4 text-center">
              <div className="flex items-baseline justify-center gap-2">
                <span className="font-display text-3xl gold-shine">{price.toLocaleString()}</span>
                <span className="text-white/60 text-sm">DZD / {billing === "monthly" ? "شهر" : "سنة"}</span>
              </div>
            </div>

            {/* Payment info */}
            <div className="mt-5 rounded-xl border border-gold/30 bg-black/50 p-4 space-y-2">
              <div className="text-[10px] uppercase tracking-widest text-gold/80 mb-1">طرق الدفع · Baridimob</div>
              {PAYMENT_INFO.map((p, i) => (
                <button
                  key={p.label}
                  onClick={() => copy(p.value, i)}
                  className="w-full flex items-center justify-between text-left rounded-lg px-2 py-1.5 hover:bg-gold-soft/20 transition"
                >
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/50">{p.label}</div>
                    <div className="font-mono text-sm text-white">{p.value}</div>
                  </div>
                  {copiedIdx === i ? <Check className="h-4 w-4 text-gold" /> : <Copy className="h-4 w-4 text-gold/60" />}
                </button>
              ))}
            </div>

            <Button asChild variant="gold" className="w-full mt-5 h-12">
              <Link to="/checkout" state={{ plan: selectedPlan, billing }} onClick={() => onOpenChange(false)}>
                <Sparkles className="h-4 w-4 mr-2" />
                رفع وصل الدفع · Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <p className="text-[10px] text-white/40 text-center mt-3">
              بعد التحويل، أرفع صورة الوصل وسيقوم المسؤول بتفعيل حسابك خلال دقائق.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
