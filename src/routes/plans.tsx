import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Crown, Check, Zap, Building2, Sparkles, ArrowRight, Tag, Copy } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PremiumPaywallModal } from "@/components/PremiumPaywallModal";
import { toast } from "sonner";
import { get, ref, set } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

export const Route = createFileRoute("/plans")({
  component: PlansPage,
});

// Exactly 4 subscription plans
const PLANS = [
  {
    id: "individual-monthly",
    name: "خطة فردية",
    nameEn: "Individual Plan",
    period: "شهري",
    periodEn: "Monthly",
    icon: Zap,
    price: 1000, // 1,000 DA/month
    features: [
      "إعلان واحد يومياً",
      "صور حتى 30 صورة",
      "نشر ريلز GRAND Stories",
      "دعم فني بالبريد",
      "تجربة مجانية 72 ساعة",
    ],
    featuresEn: [
      "1 post per day",
      "Up to 30 images",
      "Post GRAND Stories reels",
      "Email support",
      "72h free trial",
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
    price: 10000, // 10,000 DA/year
    features: [
      "إعلان واحد يومياً",
      "صور حتى 30 صورة",
      "نشر ريلز GRAND Stories",
      "دعم فني بالبريد",
      "وفر 2 شهر",
    ],
    featuresEn: [
      "1 post per day",
      "Up to 30 images",
      "Post GRAND Stories reels",
      "Email support",
      "Save 2 months",
    ],
    popular: false,
    savings: "Save 2,000 DA",
  },
  {
    id: "showroom-monthly",
    name: "خطة معرض",
    nameEn: "Showroom Plan",
    period: "شهري",
    periodEn: "Monthly",
    icon: Building2,
    price: 2500, // 2,500 DA/month
    features: [
      "إعلانات غير محدودة",
      "صور حتى 30 صورة",
      "ريلز GRAND Stories",
      "شارة معرض موثق",
      "دعم أولوية واتساب",
      "إحصائيات متقدمة",
      "تثبيت الإعلانات",
    ],
    featuresEn: [
      "Unlimited posts",
      "Up to 30 images",
      "GRAND Stories reels",
      "Verified showroom badge",
      "Priority WhatsApp support",
      "Advanced analytics",
      "Pin listings",
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
    price: 25000, // 25,000 DA/year
    features: [
      "إعلانات غير محدودة",
      "صور حتى 30 صورة",
      "ريلز GRAND Stories",
      "شارة معرض موثق",
      "دعم أولوية واتساب",
      "إحصائيات متقدمة",
      "تثبيت الإعلانات",
      "وفر 5,000 دج",
    ],
    featuresEn: [
      "Unlimited posts",
      "Up to 30 images",
      "GRAND Stories reels",
      "Verified showroom badge",
      "Priority WhatsApp support",
      "Advanced analytics",
      "Pin listings",
      "Save 5,000 DA",
    ],
    popular: false,
    savings: "Save 5,000 DA",
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
  const [promoLoading, setPromoLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleApplyPromo = async () => {
    // Guard: check input
    if (!promoCode?.trim()) {
      toast.error("أدخل كود الترويج");
      return;
    }

    // Guard: check user is logged in
    if (!profile?.phone) {
      toast.error("سجل دخول أولاً");
      return;
    }

    setPromoLoading(true);

    try {
      // Step 1: Fetch promo codes from database
      const promoSnap = await get(ref(realtimeDb, "promo_codes"));

      // Guard: check if promo codes exist
      if (!promoSnap?.exists()) {
        toast.error("كود غير صالح");
        return;
      }

      const promosData = promoSnap.val();

      // Guard: validate data is an object
      if (!promosData || typeof promosData !== "object") {
        toast.error("كود غير صالح");
        return;
      }

      // Step 2: Find matching promo code
      const promoEntries = Object.entries(promosData) as [string, any][];
      const matchedEntry = promoEntries.find(([_, p]) => {
        const code = p?.code?.toString?.().toUpperCase?.();
        const isActive = p?.is_active === true;
        return code === promoCode.trim().toUpperCase() && isActive;
      });

      // Guard: no matching promo
      if (!matchedEntry) {
        toast.error("كود غير صالح أو منتهي");
        return;
      }

      const [promoId, promoRaw] = matchedEntry;
      const promo = {
        code: String(promoRaw?.code || ""),
        is_active: Boolean(promoRaw?.is_active),
        days_granted: Number(promoRaw?.days_granted) || 7,
        tier: String(promoRaw?.tier || "individual"),
        max_uses: promoRaw?.max_uses != null ? Number(promoRaw.max_uses) : null,
        uses_count: Number(promoRaw?.uses_count) || 0,
      };

      // Guard: check usage limit
      if (promo.max_uses != null && promo.uses_count >= promo.max_uses) {
        toast.error("تم استخدام الكود الحد الأقصى");
        return;
      }

      // Step 3: Calculate subscription
      const days = Math.max(1, promo.days_granted);
      const tier = promo.tier === "showroom" ? "dealer" : "basic";
      const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      const userPhone = String(profile.phone);

      // Step 4: Update user subscription
      await set(ref(realtimeDb, `users/${userPhone}/subscription_status`), "active");
      await set(ref(realtimeDb, `users/${userPhone}/subscription_tier`), tier);
      await set(ref(realtimeDb, `users/${userPhone}/subscription_until`), until);

      // Step 5: Increment promo usage
      const newUsesCount = promo.uses_count + 1;
      await set(ref(realtimeDb, `promo_codes/${promoId}/uses_count`), newUsesCount);

      // Success
      toast.success(`تم تطبيق الكود! ${days} يوم مجاني - باقة ${promo.tier === "showroom" ? "معرض" : "عادية"}`);

    } catch (error) {
      // Log for debugging but show user-friendly message
      console.error("Promo code application error:", error);
      toast.error("حدث خطأ أثناء تطبيق الكود. حاول مرة أخرى.");
    } finally {
      setPromoLoading(false);
    }
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

        {/* Plans grid - 4 options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isYearly = plan.id.includes("yearly");

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
                    {plan.savings && (
                      <div className="text-xs text-green-400 mt-1">{plan.savings}</div>
                    )}
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
                disabled={promoLoading || !promoCode.trim()}
              >
                {promoLoading ? "..." : "تطبيق"}
              </Button>
            </div>
            <p className="text-xs text-white/40 mt-3">
              الأكواد الترويجية تمنح أيام مجانية إضافية
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
