import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-CSRoKnxW.mjs";
import { t as supabase } from "./client-Bi6lj-hW.mjs";
import { t as useAuth } from "./use-auth-BrGT0prV.mjs";
import { n as useSignedUrl } from "./use-signed-url-7GRrwbbN.mjs";
import { r as formatDZD } from "./format-DTUn6abU.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { Q as Crown, W as Gauge, dt as Car, f as Tag, ft as Calendar, gt as BadgeCheck, j as MapPin, l as TriangleAlert } from "../_libs/lucide-react.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as PremiumPaywallModal } from "./PremiumPaywallModal-rDrgaw0r.mjs";
import { t as Route } from "./seller._id-BHXvIequ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/seller._id-Cl77BK74.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SellerProfile() {
	const { id } = Route.useParams();
	const { user, profile: me, access } = useAuth();
	const isOwnProfile = user?.id === id;
	const { data: profile } = useQuery({
		queryKey: ["seller-profile", id],
		queryFn: async () => {
			const { data } = await supabase.from("profiles").select("id, first_name, last_name, subscription_status, subscription_until, plan_type, is_showroom, showroom_name, phone").eq("id", id).maybeSingle();
			return data;
		}
	});
	const { data: vehicles = [] } = useQuery({
		queryKey: ["seller-vehicles", id],
		refetchInterval: 15e3,
		queryFn: async () => {
			const { data } = await supabase.from("vehicles").select("*").eq("seller_id", id).eq("status", "active").order("created_at", { ascending: false });
			return data ?? [];
		}
	});
	const verified = profile?.is_showroom || profile?.subscription_status === "active" && profile?.subscription_until && new Date(profile.subscription_until) > /* @__PURE__ */ new Date();
	const name = profile ? profile.showroom_name || `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Seller" : "Seller";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-6xl mx-auto px-4 sm:px-6 py-10",
		children: [
			isOwnProfile && access === "trial" && me && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrialExpiryBanner, { trialStartedAt: me.trial_started_at }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "premium-card rounded-2xl p-6 sm:p-8 relative overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(212,175,55,0.18),transparent_50%)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex flex-col sm:flex-row sm:items-center gap-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-20 w-20 rounded-2xl gold-gradient grid place-items-center text-3xl font-display text-gold-foreground shrink-0",
							children: name.charAt(0).toUpperCase()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "font-display text-3xl",
										children: name
									}), verified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										title: "Verified Showroom",
										className: "inline-flex items-center gap-1 text-gold",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "h-6 w-6" })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs uppercase tracking-widest text-gold/80 mt-1",
									children: profile?.plan_type === "showroom" ? "Showroom Plan" : profile?.plan_type === "individual" ? "Individual Plan" : verified ? "Verified Premium Seller" : "Standard Seller"
								}),
								isOwnProfile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 flex items-center gap-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "sm",
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/plans",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "h-4 w-4 text-gold" }), " Upgrade Plan"]
										})
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl gold-border bg-gold-soft/30 px-5 py-4 text-center min-w-[120px]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] uppercase tracking-widest text-gold/80",
									children: "Vehicles"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-display text-3xl gold-text mt-1 flex items-center justify-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Car, { className: "h-5 w-5" }), vehicles.length]
								})]
							}), isOwnProfile && me?.subscription_until && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubscriptionCountdown, {
								until: me.subscription_until,
								status: me.subscription_status
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl mt-10 mb-4",
				children: "Active Listings"
			}),
			vehicles.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-center text-muted-foreground py-16",
				children: "No active vehicles yet."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5",
				children: vehicles.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SellerCard, { v }, v.id))
			})
		]
	});
}
function TrialExpiryBanner({ trialStartedAt }) {
	const [hoursLeft, setHoursLeft] = (0, import_react.useState)(0);
	const [showPaywall, setShowPaywall] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const calc = () => {
			const expiry = new Date(trialStartedAt).getTime() + 4320 * 60 * 1e3;
			setHoursLeft(Math.max(0, (expiry - Date.now()) / (1e3 * 60 * 60)));
		};
		calc();
		const id = setInterval(calc, 6e4);
		return () => clearInterval(id);
	}, [trialStartedAt]);
	const daysLeft = Math.ceil(hoursLeft / 24);
	if (hoursLeft > 72) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `rounded-xl border p-4 mb-6 flex items-center justify-between ${daysLeft <= 1 ? "border-destructive bg-destructive/10" : "border-gold/40 bg-gold-soft/20"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: `h-5 w-5 ${daysLeft <= 1 ? "text-destructive" : "text-gold"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-medium",
					children: daysLeft <= 1 ? "اخر يوم!" : `تبقى ${Math.floor(hoursLeft)} ساعة على انتهاء التجربة`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted-foreground",
					children: daysLeft <= 1 ? "خصص اشتراكك الآن للاستمرار في النشر" : "فعّل اشتراكك للاستمرار في نشر الإعلانات والريلز"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "gold",
				size: "sm",
				onClick: () => setShowPaywall(true),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "h-4 w-4" }), " تفعيل الآن"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PremiumPaywallModal, {
				open: showPaywall,
				onOpenChange: setShowPaywall
			})
		]
	});
}
function SubscriptionCountdown({ until, status }) {
	const [daysLeft, setDaysLeft] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const calc = () => {
			setDaysLeft(Math.max(0, (new Date(until).getTime() - Date.now()) / (1e3 * 60 * 60 * 24)));
		};
		calc();
		const id = setInterval(calc, 6e4);
		return () => clearInterval(id);
	}, [until]);
	if (status !== "active") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-center min-w-[120px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] uppercase tracking-widest text-emerald-400",
			children: "Subscription"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "font-display text-2xl text-emerald-400 mt-1 flex items-center justify-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-5 w-5" }),
				Math.ceil(daysLeft),
				"d"
			]
		})]
	});
}
function SellerCard({ v }) {
	const cover = useSignedUrl("vehicle-media", v.photos?.[0]);
	const price = v.price_type === "fixed" ? v.fixed_price : v.current_highest_bid ?? v.starting_price;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/vehicle/$id",
		params: { id: v.id },
		className: "group premium-card rounded-xl overflow-hidden hover:gold-border transition-all",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "aspect-[4/3] bg-charcoal overflow-hidden",
			children: cover && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: cover,
				className: "h-full w-full object-cover group-hover:scale-105 transition-transform duration-500",
				alt: `${v.brand} ${v.model}`,
				loading: "lazy"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "font-display text-lg truncate",
						children: [
							v.brand,
							" ",
							v.model
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground shrink-0",
						children: v.year
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1 flex items-center gap-3 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3 w-3" }), v.wilaya]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, { className: "h-3 w-3" }),
							v.mileage?.toLocaleString(),
							" km"
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "gold-text font-display text-xl font-bold mt-2",
					children: formatDZD(price)
				})
			]
		})]
	});
}
//#endregion
export { SellerProfile as component };
