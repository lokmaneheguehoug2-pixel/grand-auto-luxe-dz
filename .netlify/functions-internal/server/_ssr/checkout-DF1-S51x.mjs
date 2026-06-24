import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-CSRoKnxW.mjs";
import { t as supabase } from "./client-Bi6lj-hW.mjs";
import { t as useAuth } from "./use-auth-BrGT0prV.mjs";
import { t as Input } from "./input-B9TG3aA4.mjs";
import { t as Label } from "./label-DrCE_Ido.mjs";
import { $ as Copy, P as LoaderCircle, Q as Crown, g as ShieldCheck, s as Upload, ut as Check } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCm-LKYR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/checkout-DF1-S51x.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PAYMENT_INFO = {
	name: "HEGUEHOUG LOKMANE CHAOUKI",
	rip: "007 99999 0043958063 39",
	ccp: "0043958063 clé 39"
};
var PLANS = [{
	value: "monthly",
	label: "Monthly · 1,000 DZD",
	amount: 1e3
}, {
	value: "yearly",
	label: "Yearly · 10,000 DZD",
	amount: 1e4
}];
function CopyRow({ label, value }) {
	const [copied, setCopied] = (0, import_react.useState)(false);
	const copy = async () => {
		await navigator.clipboard.writeText(value);
		setCopied(true);
		toast.success(`${label} copied`);
		setTimeout(() => setCopied(false), 1800);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-3 rounded-lg border border-gold/20 bg-charcoal/60 px-3 py-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] uppercase tracking-widest text-gold/70",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-sm truncate",
				children: value
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "gold-outline",
			size: "sm",
			onClick: copy,
			className: "shrink-0",
			children: copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-4 w-4" })
		})]
	});
}
function CheckoutPage() {
	const { user, reloadProfile, loading } = useAuth();
	const navigate = useNavigate();
	const [plan, setPlan] = (0, import_react.useState)("monthly");
	const [file, setFile] = (0, import_react.useState)(null);
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const selected = PLANS.find((p) => p.value === plan);
	if (!loading && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-md mx-auto px-6 py-24 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-2xl mb-3",
			children: "Sign in required"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "gold",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/auth",
				children: "Go to sign in"
			})
		})]
	});
	const submit = async () => {
		if (!file || !user) return;
		setSubmitting(true);
		const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
		const { error: upErr } = await supabase.storage.from("payment-receipts").upload(path, file);
		if (upErr) {
			toast.error(upErr.message);
			setSubmitting(false);
			return;
		}
		const { error } = await supabase.from("pending_subscriptions").insert({
			user_id: user.id,
			plan,
			amount: selected.amount,
			receipt_url: path
		});
		setSubmitting(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Receipt submitted · Admin will activate shortly");
		reloadProfile();
		navigate({ to: "/my-listings" });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-3xl mx-auto px-4 sm:px-6 py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-8 flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-12 w-12 rounded-xl gold-gradient grid place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "h-6 w-6 text-gold-foreground" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs uppercase tracking-[0.25em] text-gold",
				children: "Premium Activation"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Activate your subscription"
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid md:grid-cols-2 gap-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "premium-card gold-border rounded-2xl p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs uppercase tracking-widest text-gold mb-3",
						children: "Step 1 · Pay via Baridimob / CCP"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyRow, {
								label: "Recipient",
								value: PAYMENT_INFO.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyRow, {
								label: "RIP",
								value: PAYMENT_INFO.rip
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyRow, {
								label: "CCP",
								value: PAYMENT_INFO.ccp
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 rounded-lg border border-gold/30 bg-gold-soft p-3 text-xs text-muted-foreground leading-relaxed",
						children: "Send the exact plan amount, take a clear screenshot of the confirmation, then upload it on the right."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "premium-card gold-border rounded-2xl p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs uppercase tracking-widest text-gold mb-3",
					children: "Step 2 · Submit receipt"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs uppercase tracking-widest text-muted-foreground",
							children: "Plan"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: plan,
							onValueChange: (v) => setPlan(v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "bg-charcoal border-gold/30 mt-1.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: PLANS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: p.value,
								children: p.label
							}, p.value)) })]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-gold/30 bg-charcoal p-3 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs uppercase tracking-widest text-muted-foreground",
								children: "Amount due"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "gold-text font-display text-2xl",
								children: [selected.amount.toLocaleString("fr-DZ"), " DZD"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs uppercase tracking-widest text-muted-foreground",
								children: "Receipt screenshot"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "file",
								accept: "image/*,application/pdf",
								onChange: (e) => setFile(e.target.files?.[0] ?? null),
								className: "bg-charcoal border-gold/30 mt-1.5"
							}),
							file && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-gold/80 mt-1.5 truncate",
								children: file.name
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "gold",
							className: "w-full",
							disabled: !file || submitting,
							onClick: submit,
							children: [submitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-4 w-4" }), "Submit for activation"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-[11px] text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5 text-gold" }), "Manually reviewed within 24h by the GRAND Auto Luxe team."]
						})
					]
				})]
			})]
		})]
	});
}
//#endregion
export { CheckoutPage as component };
