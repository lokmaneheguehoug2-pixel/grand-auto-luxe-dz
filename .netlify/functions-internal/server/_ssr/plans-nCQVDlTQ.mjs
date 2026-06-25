import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-CSRoKnxW.mjs";
import { t as supabase } from "./client-5T_ILqww.mjs";
import { t as useAuth } from "./use-auth-eLhv7lHk.mjs";
import { Q as Crown, _t as ArrowRight, d as Tag, p as Sparkles, pt as Building2, t as Zap, ut as Check } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as PremiumPaywallModal } from "./PremiumPaywallModal-rDrgaw0r.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/plans-nCQVDlTQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PLANS = [{
	id: "individual",
	name: "خطة فردية",
	nameEn: "Individual Plan",
	icon: Zap,
	monthly: 1e3,
	yearly: 1e4,
	features: [
		"إعلان واحد يومياً",
		"صور حتى 30 صورة",
		"نشر ريلز GRAND Stories",
		"دعم فني بالبريد",
		"تجربة مجانية 72 ساعة"
	],
	featuresEn: [
		"1 post per day",
		"Up to 30 images",
		"Post GRAND Stories reels",
		"Email support",
		"72h free trial"
	],
	popular: false
}, {
	id: "showroom",
	name: "خطة معرض",
	nameEn: "Showroom Plan",
	icon: Building2,
	monthly: 2500,
	yearly: 25e3,
	features: [
		"إعلانات غير محدودة",
		"صور حتى 30 صورة",
		"ريلز GRAND Stories",
		"شارة معرض موثق",
		"دعم أولوية واتساب",
		"إحصائيات متقدمة",
		"تثبيت الإعلانات"
	],
	featuresEn: [
		"Unlimited posts",
		"Up to 30 images",
		"GRAND Stories reels",
		"Verified showroom badge",
		"Priority WhatsApp support",
		"Advanced analytics",
		"Pin listings"
	],
	popular: true
}];
function PlansPage() {
	const { profile, access } = useAuth();
	const [billing, setBilling] = (0, import_react.useState)("yearly");
	const [showPaywall, setShowPaywall] = (0, import_react.useState)(false);
	const [promoCode, setPromoCode] = (0, import_react.useState)("");
	const [promoLoading, setPromoLoading] = (0, import_react.useState)(false);
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
				p_code: promoCode.trim().toUpperCase()
			});
			if (error) throw error;
			if (data?.success) {
				toast.success(`تم تفعيل ${data.days_granted} أيام مجانية!`);
				setPromoCode("");
			} else toast.error(data?.error || "كود غير صالح");
		} catch (e) {
			toast.error(e.message || "خطأ في تطبيق الكود");
		} finally {
			setPromoLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-black text-white",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.15),transparent_50%)]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative max-w-5xl mx-auto px-4 py-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center mb-12",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/5 mb-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "h-4 w-4 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm text-gold",
									children: "GRAND Premium"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-4xl md:text-5xl gold-shine mb-4",
								children: "اختر خطتك الفاخرة"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-white/60 max-w-xl mx-auto",
								children: "انضم إلى مجتمع GRAND Auto Luxe وتمتع بمزايا حصرية لنشر إعلاناتك وريلزاتك"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-center mb-10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "inline-flex rounded-full border border-gold/30 bg-black/50 p-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setBilling("monthly"),
								className: `px-6 py-2 rounded-full text-sm transition ${billing === "monthly" ? "bg-gold text-black font-medium" : "text-white/60 hover:text-white"}`,
								children: "شهري"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setBilling("yearly"),
								className: `px-6 py-2 rounded-full text-sm transition ${billing === "yearly" ? "bg-gold text-black font-medium" : "text-white/60 hover:text-white"}`,
								children: "سنوي · وفر 20%"
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid md:grid-cols-2 gap-6 mb-12",
						children: PLANS.map((plan) => {
							const price = billing === "monthly" ? plan.monthly : plan.yearly;
							const Icon = plan.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `relative rounded-2xl overflow-hidden ${plan.popular ? "border-2 border-gold shadow-[0_0_40px_rgba(212,175,55,0.3)]" : "border border-white/10"}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent backdrop-blur-sm" }),
									plan.popular && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-0 right-0 left-0 h-1 gold-gradient" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative p-6 md:p-8",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-start justify-between mb-6",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2 mb-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `h-5 w-5 ${plan.popular ? "text-gold" : "text-white/60"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-sm text-white/60",
														children: plan.nameEn
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
													className: "font-display text-2xl gold-text",
													children: plan.name
												})] }), plan.popular && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "px-3 py-1 rounded-full text-xs bg-gold text-black font-medium",
													children: "الأكثر طلباً"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mb-6",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-baseline gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-display text-4xl gold-shine",
														children: price.toLocaleString()
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-white/60",
														children: ["DZD / ", billing === "monthly" ? "شهر" : "سنة"]
													})]
												}), billing === "yearly" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-sm text-gold/80 mt-1",
													children: [Math.round(price / 12).toLocaleString(), " DZD/شهر"]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
												className: "space-y-3 mb-8",
												children: plan.features.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
													className: "flex items-center gap-3 text-sm",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4 text-gold shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-white/80",
														children: f
													})]
												}, i))
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												variant: plan.popular ? "gold" : "outline",
												className: `w-full h-12 ${!plan.popular ? "border-gold/50 text-gold hover:bg-gold/10" : ""}`,
												onClick: () => setShowPaywall(true),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 mr-2" }), access === "locked" ? "تفعيل الآن" : "ترقية الخطة"]
											})
										]
									})
								]
							}, plan.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "max-w-md mx-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-gold/30 bg-black/50 p-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 mb-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "h-5 w-5 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-medium gold-text",
										children: "كود ترويجي"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										value: promoCode,
										onChange: (e) => setPromoCode(e.target.value.toUpperCase()),
										placeholder: "أدخل الكود هنا",
										className: "flex-1 bg-black/50 border border-gold/30 rounded-lg px-4 py-2 text-white placeholder:text-white/40 focus:border-gold focus:outline-none",
										dir: "ltr"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "gold",
										onClick: handleApplyPromo,
										disabled: promoLoading || !promoCode.trim(),
										children: promoLoading ? "..." : "تطبيق"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-white/40 mt-3",
									children: "الأكواد الترويجية تمنح أيام مجانية إضافية، وليس خصومات على السعر"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center mt-12",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-white/40",
							children: "الدفع عبر Baridimob / CCP · التفعيل يدوي خلال دقائق"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "link",
							asChild: true,
							className: "mt-4 text-gold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4 ml-2" }), "العودة للرئيسية"]
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PremiumPaywallModal, {
				open: showPaywall,
				onOpenChange: setShowPaywall
			})
		]
	});
}
//#endregion
export { PlansPage as component };
