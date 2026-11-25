import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Crown, Check, Zap, Building2, Sparkles, ArrowRight, Tag, Copy } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PremiumPaywallModal } from "@/components/PremiumPaywallModal";
import { toast } from "sonner";
import { SUBSCRIPTION_PRICES } from "@/lib/pricing";

export const Route = createFileRoute("/plans")({
  component: PlansPage,
});

// The two authorized monthly subscription plans.
const PLANS = [
  {
    id: "individual-monthly",
    name: "خطة فردية",
    nameEn: "Individual Plan",
    period: "شهري",
    periodEn: "Monthly",
    icon: Zap,
    price: SUBSCRIPTION_PRICES.individualMonthly,
    features: [
      "إدارة إعلاناتك الفردية",
      "حتى 30 صورة للإعلان",
      "نشر Reels وفق أهلية الحساب",
      "تفعيل بعد مراجعة الدفع",
    ],
    featuresEn: [
      "Manage your individual listings",
      "Up to 30 photos per listing",
      "Reels subject to account eligibility",
      "Activation after payment review",
    ],
    popular: false,
  },
  {
    id: "individual-yearly",
    name: "خطة فردية",
    nameEn: "Individual Plan",
    period: "سنوي",
    periodEn: "Yearly",
    icon: Zap,
    price: SUBSCRIPTION_PRICES.individualYearly,
    features: ["إدارة إعلاناتك الفردية", "حتى 30 صورة للإعلان", "نشر Reels وفق أهلية الحساب", "وفر شهرين"],
    featuresEn: ["Manage your individual listings", "Up to 30 photos per listing", "Reels subject to account eligibility", "Save 2 months"],
    popular: false,
  },
  {
    id: "showroom-monthly",
    name: "خطة معرض",
    nameEn: "Showroom Plan",
    period: "شهري",
    periodEn: "Monthly",
    icon: Building2,
    price: SUBSCRIPTION_PRICES.showroomMonthly,
    features: [
      "ملف مخصص للمعرض",
      "إدارة مخزون المعرض",
      "حتى 30 صورة للإعلان",
      "نشر Reels وفق أهلية الحساب",
      "التوثيق بعد مراجعة الإدارة فقط",
      "تفعيل بعد مراجعة الدفع",
    ],
    featuresEn: [
      "Dedicated showroom profile",
      "Manage showroom inventory",
      "Up to 30 photos per listing",
      "Reels subject to account eligibility",
      "Verification only after admin review",
      "Activation after payment review",
    ],
    popular: true,
  },
  {
    id: "showroom-yearly",
    name: "خطة معرض",
    nameEn: "Showroom Plan",
    period: "سنوي",
    periodEn: "Yearly",
    icon: Building2,
    price: SUBSCRIPTION_PRICES.showroomYearly,
    features: ["ملف مخصص للمعرض", "إدارة مخزون المعرض", "التوثيق بعد مراجعة الإدارة فقط", "وفر 5,000 دج"],
    featuresEn: ["Dedicated showroom profile", "Manage showroom inventory", "Verification only after admin review", "Save 5,000 DZD"],
    popular: false,
  },

];

// CCP Payment Details
const CCP_DETAILS = {
  beneficiary: "HEGUEHOUG LOKMANE CHAOUKI",
  rip: "007 99999 0043958063 39",
  account: "0043958063",
  key: "39",
};

function PlansPage() {
  const auth = useAuth();
  const profile = auth?.profile;
  const access = auth?.access ?? "locked";
  const [showPaywall, setShowPaywall] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      toast.error("أدخل كود الترويج");
      return;
    }
    toast.info("استرداد الأكواد متوقف مؤقتًا حتى يصبح التحقق من الخادم.");
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaywall(true);
  };

  const copyCCP = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.15),transparent_50%)]" />

      <div className="relative max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/5 mb-6">
            <Crown className="h-4 w-4 text-gold" />
            <span className="text-sm text-gold">GRAND Premium</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl gold-shine mb-4">
            اختر خطتك الفاخرة
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            انضم إلى مجتمع GRAND Auto Luxe وتمتع بمزايا حصرية لنشر إعلاناتك وريلزاتك
          </p>
        </div>

        {profile && (
          <div className="mx-auto mb-8 max-w-xl rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">حالة حسابك</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <span className={`rounded-full px-3 py-1 text-sm ${access === "active" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
                {access === "active" ? "اشتراك فعال" : "بانتظار التفعيل"}
              </span>
              {profile.subscription_until && <span className="text-xs text-white/50">حتى {new Date(profile.subscription_until).toLocaleDateString("ar-DZ")}</span>}
            </div>
          </div>
        )}

        {/* Plans grid - monthly individual and showroom options */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isYearly = plan.id.endsWith("-yearly");

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl overflow-hidden ${
                  plan.popular
                    ? "border-2 border-gold shadow-[0_0_40px_rgba(212,175,55,0.3)]"
                    : "border border-white/10"
                }`}
              >
                {/* Glassmorphic background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent backdrop-blur-sm" />
                {plan.popular && (
                  <div className="absolute top-0 right-0 left-0 h-1 gold-gradient" />
                )}

                <div className="relative p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`h-4 w-4 ${plan.popular ? "text-gold" : "text-white/60"}`} />
                        <span className="text-xs text-white/60">{plan.nameEn}</span>
                      </div>
                      <h3 className="font-display text-xl gold-text">{plan.name}</h3>
                      <div className={`text-xs px-2 py-0.5 rounded mt-1 ${plan.popular ? "bg-gold/20 text-gold" : "bg-white/10 text-white/60"}`}>
                        {plan.period}
                      </div>
                    </div>
                    {plan.popular && (
                      <span className="px-2 py-1 rounded text-xs bg-gold text-black font-medium">
                        الأكثر طلباً
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-3xl gold-shine">
                        {plan.price.toLocaleString()}
                      </span>
                      <span className="text-white/60 text-sm">DZD</span>
                    </div>
                    <div className="text-xs text-white/40">
                      {isYearly ? Math.round(plan.price / 12).toLocaleString() + " DZD/شهر" : plan.periodEn}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-5 text-xs">
                    {plan.features.slice(0, 5).map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-gold shrink-0" />
                        <span className="text-white/80">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    variant={plan.popular ? "gold" : "outline"}
                    className={`w-full h-10 text-sm ${
                      !plan.popular ? "border-gold/50 text-gold hover:bg-gold/10" : ""
                    }`}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    اختر الخطة
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* CCP Payment Details */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="rounded-xl border border-gold/30 bg-black/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-gold" />
              <h3 className="font-medium gold-text">معلومات الدفع - CCP</h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center gap-4 py-2 border-b border-gold/20">
                <span className="text-white/60">Beneficiary</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-mono">{CCP_DETAILS.beneficiary}</span>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyCCP(CCP_DETAILS.beneficiary, "Beneficiary")}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center gap-4 py-2 border-b border-gold/20">
                <span className="text-white/60">RIP</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-mono">{CCP_DETAILS.rip}</span>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyCCP(CCP_DETAILS.rip, "RIP")}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center gap-4 py-2">
                <span className="text-white/60">CCP Account / Key</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-mono">{CCP_DETAILS.account} / {CCP_DETAILS.key}</span>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyCCP(`${CCP_DETAILS.account}/${CCP_DETAILS.key}`, "CCP")}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <p className="text-xs text-white/40 mt-4 text-center">
              After payment, send receipt to WhatsApp for manual activation
            </p>
          </div>
        </div>

        {/* Promo code section */}
        <div className="max-w-md mx-auto mb-8">
          <div className="rounded-xl border border-gold/30 bg-black/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-5 w-5 text-gold" />
              <h3 className="font-medium gold-text">كود ترويجي</h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="أدخل الكود هنا"
                className="flex-1 bg-black/50 border border-gold/30 rounded-lg px-4 py-2 text-white placeholder:text-white/40 focus:border-gold focus:outline-none"
                dir="ltr"
              />
              <Button
                variant="gold"
                onClick={handleApplyPromo}
                disabled={!promoCode.trim()}
              >
                تطبيق
              </Button>
            </div>
            <p className="text-xs text-white/40 mt-3">
              التحقق من الأكواد موقوف مؤقتًا حتى ربطه بخدمة آمنة على الخادم.
            </p>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center">
          <p className="text-sm text-white/40">
            الدفع عبر CCP / Baridimob · التفعيل يدوي خلال دقائق
          </p>
          <Button variant="link" asChild className="mt-4 text-gold">
            <Link to="/">
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة للرئيسية
            </Link>
          </Button>
        </div>
      </div>

      <PremiumPaywallModal
        open={showPaywall}
        onOpenChange={setShowPaywall}
        selectedPlan={selectedPlan}
      />
    </div>
  );
}

function DollarSign({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  );
}
