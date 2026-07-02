import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Crown, Check, Zap, Building2, Sparkles, ArrowRight, Tag } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PremiumPaywallModal } from "@/components/PremiumPaywallModal";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/plans")({
  component: PlansPage,
});

const PLANS = [
  {
    id: "individual",
    name: "خطة فردية",
    nameEn: "Individual Plan",
    icon: Zap,
    monthly: 1000,
    yearly: 10000,
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
    id: "showroom",
    name: "خطة معرض",
    nameEn: "Showroom Plan",
    icon: Building2,
    monthly: 2500,
    yearly: 25000,
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
];

function PlansPage() {
  const { profile, access } = useAuth();
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const [showPaywall, setShowPaywall] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    if (!profile) {
      toast.error("سجل دخول أولاً");
      return;
    }
    setPromoLoading(true);
    try {
      const { data, error } = await supabase.rpc("apply_promo_code", {
        p_user_id: profile.id,
        p_code: promoCode.trim().toUpperCase(),
      });
      if (error) throw error;
      const result = data as { success?: boolean; days_granted?: number; error?: string } | null;
      if (result?.success) {
        toast.success(`تم تفعيل ${result.days_granted} أيام مجانية!`);
        setPromoCode("");
      } else {
        toast.error(result?.error || "كود غير صالح");
      }
    } catch (e: any) {
      toast.error(e.message || "خطأ في تطبيق الكود");
    } finally {
      setPromoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.15),transparent_50%)]" />

      <div className="relative max-w-5xl mx-auto px-4 py-16">
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

        {/* Billing toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-full border border-gold/30 bg-black/50 p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-6 py-2 rounded-full text-sm transition ${
                billing === "monthly"
                  ? "bg-gold text-black font-medium"
                  : "text-white/60 hover:text-white"
              }`}
            >
              شهري
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-6 py-2 rounded-full text-sm transition ${
                billing === "yearly"
                  ? "bg-gold text-black font-medium"
                  : "text-white/60 hover:text-white"
              }`}
            >
              سنوي · وفر 20%
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {PLANS.map((plan) => {
            const price = billing === "monthly" ? plan.monthly : plan.yearly;
            const Icon = plan.icon;

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

                <div className="relative p-6 md:p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`h-5 w-5 ${plan.popular ? "text-gold" : "text-white/60"}`} />
                        <span className="text-sm text-white/60">{plan.nameEn}</span>
                      </div>
                      <h3 className="font-display text-2xl gold-text">{plan.name}</h3>
                    </div>
                    {plan.popular && (
                      <span className="px-3 py-1 rounded-full text-xs bg-gold text-black font-medium">
                        الأكثر طلباً
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-4xl gold-shine">
                        {price.toLocaleString()}
                      </span>
                      <span className="text-white/60">DZD / {billing === "monthly" ? "شهر" : "سنة"}</span>
                    </div>
                    {billing === "yearly" && (
                      <div className="text-sm text-gold/80 mt-1">
                        {Math.round(price / 12).toLocaleString()} DZD/شهر
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <Check className="h-4 w-4 text-gold shrink-0" />
                        <span className="text-white/80">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    variant={plan.popular ? "gold" : "outline"}
                    className={`w-full h-12 ${
                      !plan.popular ? "border-gold/50 text-gold hover:bg-gold/10" : ""
                    }`}
                    onClick={() => setShowPaywall(true)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {access === "locked" ? "تفعيل الآن" : "ترقية الخطة"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Promo code section */}
        <div className="max-w-md mx-auto">
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
              الأكواد الترويجية تمنح أيام مجانية إضافية، وليس خصومات على السعر
            </p>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center mt-12">
          <p className="text-sm text-white/40">
            الدفع عبر Baridimob / CCP · التفعيل يدوي خلال دقائق
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
      />
    </div>
  );
}
