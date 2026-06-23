import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-Bi6lj-hW.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./use-auth-BrGT0prV.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-CSRoKnxW.mjs";
import { n as useSignedUrl, t as signUrl } from "./use-signed-url-7GRrwbbN.mjs";
import { r as formatDZD } from "./format-DTUn6abU.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-B5sbP7os.mjs";
import { t as Input } from "./input-B9TG3aA4.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { B as Film, C as Play, I as Grid3x3, R as Gauge, S as Plus, _ as Search, k as MapPin, q as Cog, v as Scale, w as Phone } from "../_libs/lucide-react.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as WILAYAS, t as BRANDS } from "./wilayas-B1ZbMp-l.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCm-LKYR.mjs";
import { n as useCompare, t as compareStore } from "./compare-DGn_cp8p.mjs";
import { n as SoldOverlay } from "./my-listings-C9z2pH40.mjs";
import { t as Countdown } from "./Countdown-CwiACDsk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B1qTyTYu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StoriesStrip() {
	const { user, access } = useAuth();
	const [reels, setReels] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		let mounted = true;
		const load = async () => {
			const { data: rows } = await supabase.from("stories").select("id,author_id,video_url,caption").order("created_at", { ascending: false }).limit(12);
			const ids = Array.from(new Set((rows ?? []).map((r) => r.author_id)));
			const { data: profs } = ids.length ? await supabase.from("profiles").select("id,first_name,last_name,showroom_name,is_showroom").in("id", ids) : { data: [] };
			const map = new Map((profs ?? []).map((p) => [p.id, p]));
			const withUrls = await Promise.all((rows ?? []).map(async (r) => {
				const thumb = await signUrl("reels", r.video_url, 3600);
				const p = map.get(r.author_id);
				const author_name = p?.is_showroom && p.showroom_name ? p.showroom_name : `${p?.first_name ?? ""} ${p?.last_name ?? ""}`.trim();
				return {
					...r,
					thumb: thumb ?? void 0,
					author_name
				};
			}));
			if (mounted) setReels(withUrls);
		};
		load();
		const ch = supabase.channel("stories-strip").on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "stories"
		}, () => load()).subscribe();
		return () => {
			mounted = false;
			supabase.removeChannel(ch);
		};
	}, []);
	if (reels.length === 0 && !user) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "border-b border-border/60 bg-gradient-to-b from-charcoal/60 to-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-7xl mx-auto px-4 sm:px-6 py-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 mb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { className: "h-4 w-4 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xs uppercase tracking-[0.25em] gold-text font-semibold",
					children: "GRAND Stories"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-3 overflow-x-auto pb-1 no-scrollbar",
				children: [user && access !== "locked" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/post-reel",
					className: "shrink-0 w-20 group",
					"aria-label": "Post a new reel",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative h-28 w-20 rounded-xl overflow-hidden gold-border bg-charcoal grid place-items-center group-hover:brightness-110 transition",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-9 w-9 rounded-full gold-gradient grid place-items-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-5 w-5 text-gold-foreground" })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] text-center mt-1.5 text-gold/90 truncate",
						children: "Your reel"
					})]
				}), reels.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/reels",
					className: "shrink-0 w-20 group",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative h-28 w-20 rounded-xl overflow-hidden gold-border bg-black",
						children: [
							r.thumb ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
								src: r.thumb,
								className: "h-full w-full object-cover",
								muted: true,
								playsInline: true,
								preload: "metadata",
								onMouseEnter: (e) => e.currentTarget.play().catch(() => {}),
								onMouseLeave: (e) => {
									const v = e.currentTarget;
									v.pause();
									v.currentTime = 0;
								}
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full w-full grid place-items-center text-gold/40",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { className: "h-5 w-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute bottom-1 inset-x-1 text-[9px] text-white text-center truncate font-semibold drop-shadow",
								children: r.author_name || "User"
							})
						]
					})
				}, r.id))]
			})]
		})
	});
}
function Home() {
	const [filters, setFilters] = (0, import_react.useState)({
		q: "",
		brand: "all",
		fuel: "all",
		trans: "all",
		wilaya: "all",
		min: "",
		max: "",
		year: "",
		paint: "all",
		docs: "all",
		sort: "newest"
	});
	const { data: vehicles = [], isLoading } = useQuery({
		queryKey: ["vehicles"],
		queryFn: async () => {
			const { data, error } = await supabase.from("vehicles").select("*").in("status", ["active", "sold"]).order("created_at", { ascending: false }).limit(100);
			if (error) throw error;
			return data;
		}
	});
	const filtered = (0, import_react.useMemo)(() => {
		const priceOf = (v) => v.price_type === "fixed" ? v.fixed_price ?? 0 : v.current_highest_bid ?? v.starting_price ?? 0;
		const list = vehicles.filter((v) => {
			if (filters.q && !`${v.brand} ${v.model}`.toLowerCase().includes(filters.q.toLowerCase())) return false;
			if (filters.brand !== "all" && v.brand !== filters.brand) return false;
			if (filters.fuel !== "all" && v.fuel_type !== filters.fuel) return false;
			if (filters.trans !== "all" && v.transmission !== filters.trans) return false;
			if (filters.wilaya !== "all" && v.wilaya !== filters.wilaya) return false;
			if (filters.year && v.year !== Number(filters.year)) return false;
			if (filters.paint !== "all" && v.paint_condition !== filters.paint) return false;
			if (filters.docs !== "all" && v.documents_status !== filters.docs) return false;
			const price = priceOf(v);
			if (filters.min && price < Number(filters.min)) return false;
			if (filters.max && price > Number(filters.max)) return false;
			return true;
		});
		if (filters.sort === "price_asc") list.sort((a, b) => priceOf(a) - priceOf(b));
		else if (filters.sort === "price_desc") list.sort((a, b) => priceOf(b) - priceOf(a));
		else if (filters.sort === "year_desc") list.sort((a, b) => b.year - a.year);
		return list;
	}, [vehicles, filters]);
	const reelsVehicles = filtered.filter((v) => v.video_url);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative overflow-hidden border-b border-border/60",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(212,175,55,0.18),transparent_50%),radial-gradient(circle_at_80%_100%,rgba(212,175,55,0.12),transparent_50%)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-3xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs uppercase tracking-[0.3em] text-gold mb-3",
							children: "Marketplace · Vehicles Only"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "font-display text-4xl sm:text-6xl leading-[1.05] mb-4",
							children: [
								"The premium ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "gold-text",
									children: "Algerian"
								}),
								" automotive market."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted-foreground text-base sm:text-lg max-w-2xl",
							children: "Discover, bid, and acquire exceptional vehicles. Reels-style discovery, live auctions, and trusted owners across all 58 wilayas."
						})
					]
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoriesStrip, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-b border-border/60 bg-charcoal/40",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-7xl mx-auto px-4 sm:px-6 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "col-span-2 md:col-span-2 relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Search brand or model…",
								className: "pl-9 bg-background border-border",
								value: filters.q,
								onChange: (e) => setFilters({
									...filters,
									q: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: filters.brand,
							onValueChange: (v) => setFilters({
								...filters,
								brand: v
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "bg-background",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Brand" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All brands"
							}), BRANDS.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: b,
								children: b
							}, b))] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: filters.fuel,
							onValueChange: (v) => setFilters({
								...filters,
								fuel: v
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "bg-background",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Fuel" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All fuels"
							}), [
								"Diesel",
								"Essence",
								"GPL",
								"Hybrid",
								"Electrique"
							].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: f,
								children: f
							}, f))] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: filters.trans,
							onValueChange: (v) => setFilters({
								...filters,
								trans: v
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "bg-background",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Trans." })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "all",
									children: "All"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "Manuelle",
									children: "Manuelle"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "Automatique",
									children: "Automatique"
								})
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: filters.wilaya,
							onValueChange: (v) => setFilters({
								...filters,
								wilaya: v
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "bg-background",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Wilaya" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
								className: "max-h-72",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "all",
									children: "All wilayas"
								}), WILAYAS.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: w,
									children: w
								}, w))]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							placeholder: "Min DZD",
							className: "bg-background",
							value: filters.min,
							onChange: (e) => setFilters({
								...filters,
								min: e.target.value
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							placeholder: "Max DZD",
							className: "bg-background",
							value: filters.max,
							onChange: (e) => setFilters({
								...filters,
								max: e.target.value
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 md:grid-cols-4 gap-2 mt-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: filters.paint,
							onValueChange: (v) => setFilters({
								...filters,
								paint: v
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "bg-background",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Peinture" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "all",
									children: "All paint"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "original",
									children: "Peinture d'origine"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "touched",
									children: "Choc / Peinture"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "voile",
									children: "Voile / Raccord"
								})
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: filters.docs,
							onValueChange: (v) => setFilters({
								...filters,
								docs: v
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "bg-background",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Documents" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "all",
									children: "All documents"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "clean",
									children: "Carte Grise صافية"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "mujahidine",
									children: "Licence Mujahidine"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "other",
									children: "Autre"
								})
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: filters.sort,
							onValueChange: (v) => setFilters({
								...filters,
								sort: v
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "bg-background",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Trier" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "newest",
									children: "الأحدث · Newest"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "price_asc",
									children: "السعر: الأرخص أولاً"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "price_desc",
									children: "السعر: الأغلى أولاً"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "year_desc",
									children: "سنة الصنع: الأحدث"
								})
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							placeholder: "Year",
							className: "bg-background",
							value: filters.year,
							onChange: (e) => setFilters({
								...filters,
								year: e.target.value
							})
						})
					]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "max-w-7xl mx-auto px-4 sm:px-6 py-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between mb-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "font-display text-2xl",
							children: [filtered.length, " vehicles"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Updated live"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
							className: "bg-charcoal border border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "grid",
								className: "data-[state=active]:bg-gold data-[state=active]:text-gold-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid3x3, { className: "h-4 w-4 mr-1" }), "Grid"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "reels",
								className: "data-[state=active]:bg-gold data-[state=active]:text-gold-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { className: "h-4 w-4 mr-1" }), "Reels"]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "grid",
						children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonGrid, {}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5",
							children: filtered.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VehicleCard, { v }, v.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "reels",
						children: reelsVehicles.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-center py-20 text-muted-foreground",
							children: "No video reels yet. Sellers can upload short vertical videos when posting."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReelsFeed, { vehicles: reelsVehicles })
					})
				]
			})
		})
	] });
}
function VehicleCard({ v }) {
	const cover = useSignedUrl("vehicle-media", v.photos?.[0]);
	const price = v.price_type === "fixed" ? v.fixed_price : v.current_highest_bid ?? v.starting_price;
	const inCompare = useCompare().includes(v.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/vehicle/$id",
		params: { id: v.id },
		className: "group premium-card rounded-xl overflow-hidden hover:gold-border transition-all",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "aspect-[4/3] bg-charcoal relative overflow-hidden",
			children: [
				cover ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: cover,
					alt: `${v.brand} ${v.model}`,
					className: "h-full w-full object-cover group-hover:scale-105 transition-transform duration-500",
					loading: "lazy"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full w-full grid place-items-center text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-8 w-8" })
				}),
				v.status === "sold" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoldOverlay, {}),
				v.status !== "sold" && v.price_type === "auction" && v.auction_ends_at && new Date(v.auction_ends_at) > /* @__PURE__ */ new Date() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gold text-gold-foreground text-[10px] font-bold uppercase tracking-wider",
					children: "Live Auction"
				}),
				v.video_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute top-3 right-3 h-7 w-7 rounded-full bg-black/60 grid place-items-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-3 w-3 text-gold" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: (e) => {
						e.preventDefault();
						e.stopPropagation();
						compareStore.toggle(v.id);
					},
					className: `absolute bottom-3 right-3 h-8 w-8 rounded-full grid place-items-center backdrop-blur transition-all ${inCompare ? "gold-gradient text-gold-foreground" : "bg-black/70 text-gold hover:bg-black/90"}`,
					title: inCompare ? "Remove from compare" : "Add to compare",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "h-3.5 w-3.5" })
				})
			]
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
							v.mileage.toLocaleString(),
							" km"
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-end justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [v.price_type === "auction" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] uppercase tracking-wider text-gold mb-0.5",
						children: "Highest Bid"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "gold-text font-display text-xl font-bold",
						children: formatDZD(price)
					})] }), v.price_type === "auction" && v.auction_ends_at && new Date(v.auction_ends_at) > /* @__PURE__ */ new Date() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Countdown, {
						endsAt: v.auction_ends_at,
						className: "text-[11px] text-gold"
					})]
				})
			]
		})]
	});
}
function ReelsFeed({ vehicles }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-[calc(100vh-220px)] overflow-y-auto snap-y-mandatory no-scrollbar rounded-2xl border border-border bg-black",
		children: vehicles.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reel, { v }, v.id))
	});
}
function Reel({ v }) {
	const url = useSignedUrl("vehicle-media", v.video_url);
	const price = v.price_type === "fixed" ? v.fixed_price : v.current_highest_bid ?? v.starting_price;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "snap-start h-full min-h-[80vh] relative grid place-items-center bg-black",
		children: [
			url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				src: url,
				className: "absolute inset-0 h-full w-full object-cover",
				autoPlay: true,
				loop: true,
				muted: true,
				playsInline: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 w-full max-w-md px-6 pb-10 self-end mt-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs uppercase tracking-widest text-gold mb-2",
						children: v.wilaya
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "font-display text-3xl text-white mb-1",
						children: [
							v.brand,
							" ",
							v.model
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-sm text-white/70 mb-3",
						children: [
							v.year,
							" · ",
							v.fuel_type,
							" · ",
							v.transmission
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "gold-text font-display text-2xl font-bold",
							children: formatDZD(price)
						}), v.price_type === "auction" && v.auction_ends_at && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Countdown, {
							endsAt: v.auction_ends_at,
							className: "text-sm text-gold border border-gold/40 px-2 py-1 rounded-md"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "gold",
							className: "flex-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/vehicle/$id",
								params: { id: v.id },
								children: "View Details"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "gold-outline",
							size: "icon",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: `tel:${v.phone}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-4 w-4" })
							})
						})]
					})
				]
			})
		]
	});
}
function SkeletonGrid() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5",
		children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "premium-card rounded-xl aspect-[4/5] animate-pulse" }, i))
	});
}
function EmptyState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "text-center py-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "inline-flex h-16 w-16 rounded-2xl gold-gradient items-center justify-center mb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cog, { className: "h-8 w-8 text-gold-foreground" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-2xl mb-2",
				children: "No vehicles match"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground text-sm",
				children: "Try adjusting your filters or be the first to list a premium vehicle."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "gold",
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/post",
					children: "List a Vehicle"
				})
			})
		]
	});
}
//#endregion
export { Home as component };
