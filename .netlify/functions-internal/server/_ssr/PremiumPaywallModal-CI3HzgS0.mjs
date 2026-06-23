import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-CSRoKnxW.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { G as Crown, K as Copy, at as Building2, lt as ArrowRight, nt as Check, p as Sparkles, t as Zap } from "../_libs/lucide-react.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as DialogContent, t as Dialog } from "./dialog-Cu5CqtGL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PremiumPaywallModal-CI3HzgS0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PAYMENT_INFO = [{
	label: "Baridimob / CCP",
	value: "0079999001234567890"
}, {
	label: "Account holder",
	value: "HEGUEHOUG LOKMANE CHAOUKI"
}];
var PLANS = [{
	id: "individual",
	name: "خطة فردية",
	nameEn: "Individual",
	icon: Zap,
	monthly: 1e3,
	yearly: 1e4
}, {
	id: "showroom",
	name: "خطة معرض",
	nameEn: "Showroom",
	icon: Building2,
	monthly: 2500,
	yearly: 25e3
}];
function PremiumPaywallModal({ open, onOpenChange, reason }) {
	const [copiedIdx, setCopiedIdx] = (0, import_react.useState)(null);
	const [billing, setBilling] = (0, import_react.useState)("yearly");
	const [selectedPlan, setSelectedPlan] = (0, import_react.useState)("individual");
	const copy = (text, i) => {
		navigator.clipboard.writeText(text);
		setCopiedIdx(i);
		toast.success("Copié");
		setTimeout(() => setCopiedIdx(null), 1500);
	};
	const price = billing === "monthly" ? PLANS.find((p) => p.id === selectedPlan).monthly : PLANS.find((p) => p.id === selectedPlan).yearly;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			className: "bg-black border-gold/60 max-w-lg p-0 overflow-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(212,175,55,0.25),transparent_60%),radial-gradient(circle_at_80%_100%,rgba(212,175,55,0.18),transparent_55%)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 mb-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-12 w-12 rounded-xl gold-gradient grid place-items-center shrink-0 gold-glow",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "h-6 w-6 text-gold-foreground" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] uppercase tracking-[0.25em] text-gold",
								children: "Premium Required"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl gold-shine",
								children: "Activate to Publish"
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-white/80 leading-relaxed",
							children: reason ?? "للنشر على GRAND Auto Luxe (إعلان أو ريلز) يجب تفعيل اشتراكك الفاخر."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-5 grid grid-cols-2 gap-3",
							children: PLANS.map((plan) => {
								const Icon = plan.icon;
								const isSelected = selectedPlan === plan.id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setSelectedPlan(plan.id),
									className: `rounded-xl border p-4 text-left transition ${isSelected ? "border-gold bg-gold/10" : "border-white/10 bg-black/40 hover:border-gold/30"}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 mb-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `h-4 w-4 ${isSelected ? "text-gold" : "text-white/60"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-white/60",
												children: plan.nameEn
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-medium gold-text",
											children: plan.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs text-white/50 mt-1",
											children: plan.id === "individual" ? "1 post/day" : "Unlimited"
										})
									]
								}, plan.id);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 flex justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "inline-flex rounded-full border border-gold/30 bg-black/50 p-1 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setBilling("monthly"),
									className: `px-4 py-1.5 rounded-full transition ${billing === "monthly" ? "bg-gold text-black" : "text-white/60"}`,
									children: "Monthly"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setBilling("yearly"),
									className: `px-4 py-1.5 rounded-full transition ${billing === "yearly" ? "bg-gold text-black" : "text-white/60"}`,
									children: "Yearly · Save 20%"
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 text-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-3xl gold-shine",
									children: price.toLocaleString()
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-white/60 text-sm",
									children: ["DZD / ", billing === "monthly" ? "شهر" : "سنة"]
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 rounded-xl border border-gold/30 bg-black/50 p-4 space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] uppercase tracking-widest text-gold/80 mb-1",
								children: "طرق الدفع · Baridimob"
							}), PAYMENT_INFO.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => copy(p.value, i),
								className: "w-full flex items-center justify-between text-left rounded-lg px-2 py-1.5 hover:bg-gold-soft/20 transition",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] uppercase tracking-widest text-white/50",
									children: p.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-mono text-sm text-white",
									children: p.value
								})] }), copiedIdx === i ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4 text-gold" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-4 w-4 text-gold/60" })]
							}, p.label))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "gold",
							className: "w-full mt-5 h-12",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/checkout",
								state: {
									plan: selectedPlan,
									billing
								},
								onClick: () => onOpenChange(false),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 mr-2" }),
									"رفع وصل الدفع · Continue ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4 ml-2" })
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] text-white/40 text-center mt-3",
							children: "بعد التحويل، أرفع صورة الوصل وسيقوم المسؤول بتفعيل حسابك خلال دقائق."
						})
					]
				})]
			})
		})
	});
}
//#endregion
export { PremiumPaywallModal as t };
