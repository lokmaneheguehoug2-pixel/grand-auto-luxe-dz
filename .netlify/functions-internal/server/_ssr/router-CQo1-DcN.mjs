import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as cn, t as Button } from "./button-CSRoKnxW.mjs";
import { t as supabase } from "./client-5T_ILqww.mjs";
import { t as useAuth } from "./use-auth-eLhv7lHk.mjs";
import { n as useSignedUrl } from "./use-signed-url-BkLg4u9y.mjs";
import { n as formatCentimes, r as formatDZD } from "./format-DTUn6abU.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { n as QueryClientProvider, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { C as Plus, D as MessageSquare, F as Instagram, K as Film, M as LogOut, O as MessageCircle, Q as Crown, R as House, S as RefreshCw, T as Phone, _t as ArrowRight, c as TriangleAlert, ft as Calendar, i as User, j as Mail, m as Shield, mt as Bell, n as X, p as Sparkles, q as Facebook, u as Trash2, y as Scale } from "../_libs/lucide-react.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { _ as useNavigate, c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, l as useRouterState, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route$12 } from "./edit-listing._id-DXFp-qz_.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, t as Dialog } from "./dialog-zroENDAE.mjs";
import { t as PremiumPaywallModal } from "./PremiumPaywallModal-rDrgaw0r.mjs";
import { n as useCompare, t as compareStore } from "./compare-DGn_cp8p.mjs";
import { t as Route$13 } from "./my-listings-YsAaelXU.mjs";
import { t as Route$14 } from "./vehicle._id-BLvmubTJ.mjs";
import { t as Route$15 } from "./seller._id--JprZh09.mjs";
import { i as Trigger, n as Portal, r as Root2, t as Content2 } from "../_libs/radix-ui__react-popover.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CQo1-DcN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-B1BJASt2.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
var ErrorBoundary = class extends import_react.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}
	static getDerivedStateFromError(error) {
		return {
			hasError: true,
			error
		};
	}
	componentDidCatch(error, errorInfo) {
		console.error("ErrorBoundary caught:", error, errorInfo);
	}
	handleReset = () => {
		this.setState({
			hasError: false,
			error: void 0
		});
		window.location.href = "/";
	};
	handleReload = () => {
		window.location.reload();
	};
	render() {
		if (this.state.hasError) {
			if (this.props.fallback) return this.props.fallback;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-screen bg-background flex items-center justify-center p-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-md text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-8 w-8 text-destructive" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-2xl mb-2",
							children: "Something went wrong"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted-foreground mb-6",
							children: "We encountered an unexpected error. Please try refreshing the page or go back to the home page."
						}),
						false,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-3 justify-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "gold",
								onClick: this.handleReload,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-4 w-4 mr-2" }), " Refresh"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								onClick: this.handleReset,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-4 w-4 mr-2" }), " Home"]
							})]
						})
					]
				})
			});
		}
		return this.props.children;
	}
};
function LoadingFallback() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-center justify-center py-20",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "animate-spin h-8 w-8 border-2 border-gold border-t-transparent rounded-full" })
	});
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function PaywallGate() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "w-full max-w-lg my-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "premium-card gold-border rounded-2xl p-6 sm:p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 mb-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-12 w-12 rounded-xl gold-gradient grid place-items-center shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "h-6 w-6 text-gold-foreground" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs uppercase tracking-[0.2em] text-gold",
							children: "Access Locked"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: "Activate Premium"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground leading-relaxed",
						children: "Your 3-day free trial has expired. Activate your subscription to keep listing vehicles and reach the premium Algerian automotive market."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-gold/30 bg-charcoal p-4 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] uppercase tracking-widest text-gold/70",
								children: "Monthly"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "gold-text font-display text-2xl mt-1",
								children: "1,000 DZD"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-gold/50 bg-gold-soft p-4 text-center relative overflow-hidden",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] uppercase tracking-widest text-gold",
								children: "Yearly · Best"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "gold-text font-display text-2xl mt-1",
								children: "10,000 DZD"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "gold",
						className: "w-full mt-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/checkout",
							children: ["Continue to checkout ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
						})
					})
				]
			})
		})
	});
}
function CompareTray() {
	const ids = useCompare();
	const [open, setOpen] = (0, import_react.useState)(false);
	if (ids.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed bottom-4 left-1/2 -translate-x-1/2 z-40 premium-card gold-border rounded-2xl px-4 py-3 flex items-center gap-3 shadow-[0_10px_40px_-10px_rgba(212,175,55,0.6)] backdrop-blur-xl bg-background/85",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-xs uppercase tracking-widest text-gold",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "h-4 w-4" }),
					" Compare · ",
					ids.length,
					"/2"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "gold",
				size: "sm",
				disabled: ids.length < 2,
				onClick: () => setOpen(true),
				children: "Open"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon",
				className: "h-8 w-8",
				onClick: () => compareStore.clear(),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 text-destructive" })
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-4xl bg-background border-gold/40",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
				className: "font-display text-2xl gold-text flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "h-5 w-5 text-gold" }), " Luxury Compare"]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompareGrid, { ids })]
		})
	})] });
}
function CompareGrid({ ids }) {
	const { data: vehicles = [], isLoading } = useQuery({
		queryKey: ["compare", ids],
		queryFn: async () => {
			const { data } = await supabase.from("vehicles").select("*").in("id", ids);
			return data ?? [];
		}
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "py-10 text-center text-muted-foreground text-sm",
		children: "Loading…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-4",
		children: vehicles.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompareCol, { v }, v.id))
	});
}
var ROWS = [
	{
		label: "Year",
		get: (v) => String(v.year)
	},
	{
		label: "Mileage",
		get: (v) => `${v.mileage.toLocaleString()} km`
	},
	{
		label: "Fuel",
		get: (v) => v.fuel_type
	},
	{
		label: "Transmission",
		get: (v) => v.transmission
	},
	{
		label: "Engine",
		get: (v) => v.engine_type || "—"
	},
	{
		label: "Wilaya",
		get: (v) => v.wilaya
	},
	{
		label: "Paint",
		get: (v) => v.paint_condition || "—"
	},
	{
		label: "Documents",
		get: (v) => v.documents_status || "—"
	}
];
function CompareCol({ v }) {
	const cover = useSignedUrl("vehicle-media", v.photos?.[0]);
	const price = v.price_type === "fixed" ? v.fixed_price : v.current_highest_bid ?? v.starting_price;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "premium-card rounded-xl overflow-hidden border border-gold/30",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative aspect-[4/3] bg-charcoal",
			children: [cover && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: cover,
				className: "h-full w-full object-cover",
				alt: ""
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon",
				className: "absolute top-2 right-2 h-7 w-7 bg-black/70 hover:bg-black",
				onClick: () => compareStore.remove(v.id),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5 text-gold" })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-display text-lg",
					children: [
						v.brand,
						" ",
						v.model
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "gold-text font-display text-xl mt-1",
					children: formatDZD(price)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] text-gold/60",
					children: formatCentimes(price)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 space-y-1.5 text-sm",
					children: ROWS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between border-b border-border/40 pb-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground text-xs uppercase tracking-widest",
							children: r.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: r.get(v)
						})]
					}, r.label))
				})
			]
		})]
	});
}
var Popover = Root2;
var PopoverTrigger = Trigger;
var PopoverContent = import_react.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	align,
	sideOffset,
	className: cn("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)", className),
	...props
}) }));
PopoverContent.displayName = Content2.displayName;
function NotificationBell() {
	const { user } = useAuth();
	const [items, setItems] = (0, import_react.useState)([]);
	const unread = items.filter((n) => !n.read_at).length;
	const load = async () => {
		if (!user) return;
		const [{ data: n }, { data: b }] = await Promise.all([supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(15), supabase.from("broadcast_messages").select("id,title,body,created_at").order("created_at", { ascending: false }).limit(5)]);
		setItems([...n ?? [], ...(b ?? []).map((m) => ({
			id: `b-${m.id}`,
			title: `📢 ${m.title}`,
			body: m.body,
			link: null,
			kind: "broadcast",
			read_at: null,
			created_at: m.created_at
		}))].sort((a, z) => +new Date(z.created_at) - +new Date(a.created_at)));
	};
	(0, import_react.useEffect)(() => {
		if (!user) return;
		load();
		const ch = supabase.channel(`notif-${user.id}`).on("postgres_changes", {
			event: "INSERT",
			schema: "public",
			table: "notifications",
			filter: `user_id=eq.${user.id}`
		}, () => load()).on("postgres_changes", {
			event: "INSERT",
			schema: "public",
			table: "broadcast_messages"
		}, () => load()).subscribe();
		return () => {
			supabase.removeChannel(ch);
		};
	}, [user]);
	const markAll = async () => {
		if (!user) return;
		await supabase.from("notifications").update({ read_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("user_id", user.id).is("read_at", null);
		load();
	};
	if (!user) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			className: "relative h-9 w-9 grid place-items-center rounded-md hover:bg-gold-soft/40 transition",
			"aria-label": "Notifications",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4 text-gold" }), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full gold-gradient text-gold-foreground text-[10px] font-bold grid place-items-center",
				children: unread > 9 ? "9+" : unread
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
		align: "end",
		className: "w-80 bg-charcoal border-gold/40 p-0 max-h-[70vh] overflow-y-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between p-3 border-b border-border sticky top-0 bg-charcoal",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-semibold gold-text",
					children: "التنبيهات"
				}), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: markAll,
					className: "text-[11px] text-gold/80 hover:text-gold",
					children: "تعليم كمقروءة"
				})]
			}),
			items.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-8 text-center text-xs text-muted-foreground",
				children: "لا توجد تنبيهات"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "divide-y divide-border/60",
				children: items.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `p-3 ${n.read_at ? "opacity-70" : "bg-gold-soft/20"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-semibold",
							children: n.title
						}),
						n.body && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground mt-0.5 line-clamp-3",
							children: n.body
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] text-gold/60 mt-1 uppercase tracking-widest",
							children: new Date(n.created_at).toLocaleString()
						})
					]
				}, n.id))
			})
		]
	})] });
}
function CustomerServiceFooter() {
	const [settings, setSettings] = (0, import_react.useState)({
		whatsapp_number: "",
		instagram_url: "",
		facebook_url: "",
		gmail_address: ""
	});
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		async function loadSettings() {
			try {
				const { data, error } = await supabase.from("site_settings").select("setting_key, setting_value");
				if (!error && data) {
					const settingsMap = {};
					data.forEach((item) => {
						settingsMap[item.setting_key] = item.setting_value;
					});
					setSettings({
						whatsapp_number: settingsMap.whatsapp_number || "",
						instagram_url: settingsMap.instagram_url || "",
						facebook_url: settingsMap.facebook_url || "",
						gmail_address: settingsMap.gmail_address || ""
					});
				}
			} catch (err) {
				console.error("Failed to load site settings:", err);
			} finally {
				setLoading(false);
			}
		}
		loadSettings();
	}, []);
	const whatsappLink = settings.whatsapp_number ? `https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}` : "#";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "border-t border-border/60 bg-charcoal/40 py-8 mt-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-7xl mx-auto px-4 sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-3 gap-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-8 w-8 rounded-lg gold-gradient grid place-items-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-sm font-bold text-gold-foreground",
									children: "G"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-lg gold-text",
								children: "GRAND Auto Luxe"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Premium Algerian vehicle marketplace with live auctions, verified sellers, and trusted transactions."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-semibold text-sm uppercase tracking-wider",
							children: "Quick Links"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
							className: "flex flex-col gap-2 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "/brands",
									className: "text-muted-foreground hover:text-gold transition-colors",
									children: "Browse Brands"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "/plans",
									className: "text-muted-foreground hover:text-gold transition-colors",
									children: "Subscription Plans"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "/auth",
									className: "text-muted-foreground hover:text-gold transition-colors",
									children: "Sign In / Register"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-semibold text-sm uppercase tracking-wider",
								children: "Customer Service"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-3",
								children: [
									settings.whatsapp_number && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: whatsappLink,
										target: "_blank",
										rel: "noopener noreferrer",
										className: "h-10 w-10 rounded-full bg-green-600/10 hover:bg-green-600/20 flex items-center justify-center transition-colors group",
										title: "WhatsApp",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" })
									}),
									settings.instagram_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: settings.instagram_url,
										target: "_blank",
										rel: "noopener noreferrer",
										className: "h-10 w-10 rounded-full bg-pink-600/10 hover:bg-pink-600/20 flex items-center justify-center transition-colors group",
										title: "Instagram",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Instagram, { className: "h-5 w-5 text-pink-600 group-hover:scale-110 transition-transform" })
									}),
									settings.facebook_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: settings.facebook_url,
										target: "_blank",
										rel: "noopener noreferrer",
										className: "h-10 w-10 rounded-full bg-blue-600/10 hover:bg-blue-600/20 flex items-center justify-center transition-colors group",
										title: "Facebook",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Facebook, { className: "h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" })
									}),
									settings.gmail_address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: `mailto:${settings.gmail_address}`,
										className: "h-10 w-10 rounded-full bg-red-600/10 hover:bg-red-600/20 flex items-center justify-center transition-colors group",
										title: "Gmail",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-5 w-5 text-red-600 group-hover:scale-110 transition-transform" })
									})
								]
							}),
							settings.whatsapp_number && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-sm text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: settings.whatsapp_number })]
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 pt-6 border-t border-border/40 text-center text-xs text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "gold-text font-semibold",
						children: "GRAND Auto Luxe"
					}),
					" · Made in Algeria · ",
					(/* @__PURE__ */ new Date()).getFullYear()
				]
			})]
		})
	});
}
function AppShell() {
	const { user, profile, isAdmin, signOut, access, hoursLeft } = useAuth();
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const isAuthPage = pathname === "/auth";
	const unreadMsgs = useUnreadMessages(user?.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen flex flex-col bg-background",
		children: [
			!isAuthPage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-40 border-b border-border/60 backdrop-blur-xl bg-background/80",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "flex items-center gap-2.5 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/my-logo.png.PNG",
							alt: "GRANDA Auto Luxe",
							className: "h-11 w-11 shrink-0 rounded-lg object-contain"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-display text-lg leading-none tracking-wide truncate",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "gold-shine font-bold",
										children: "GRAND"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "gold-text",
										children: "A"
									}),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "gold-text",
										children: "Auto Luxe"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] uppercase tracking-[0.2em] text-gold/70",
								children: "Algeria · Premium"
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "flex items-center gap-1 sm:gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "ghost",
								size: "sm",
								className: "hidden sm:inline-flex",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/brands",
									children: "Brands"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "ghost",
								size: "sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/reels",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { className: "h-4 w-4" }),
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "hidden sm:inline",
											children: "Reels"
										})
									]
								})
							}),
							user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "ghost",
								size: "sm",
								className: "hidden sm:inline-flex",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/my-listings",
									children: "My Listings"
								})
							}),
							user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "ghost",
								size: "sm",
								className: "hidden sm:inline-flex",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/my-appointments",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4" }),
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "hidden md:inline",
											children: "Appointments"
										})
									]
								})
							}),
							user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "gold-outline",
								size: "sm",
								className: "hidden sm:inline-flex",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/post",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " List a Vehicle"]
								})
							}),
							user && access === "trial" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "hidden md:inline-flex items-center text-xs text-gold font-semibold px-3 py-1 rounded-full border border-gold/40 bg-gold-soft",
								children: [
									"Trial · ",
									hoursLeft,
									"h left"
								]
							}),
							isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "ghost",
								size: "sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/admin",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4 w-4" }), " Admin"]
								})
							}),
							user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "ghost",
									size: "icon",
									className: "relative",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/messages",
										"aria-label": "Messages",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-4 w-4 text-gold" }), unreadMsgs > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold grid place-items-center",
											children: unreadMsgs > 9 ? "9+" : unreadMsgs
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationBell, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden sm:inline text-sm text-muted-foreground truncate max-w-[120px]",
									children: profile?.first_name ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4 inline" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									onClick: () => {
										signOut();
										navigate({ to: "/auth" });
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" })
								})
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "gold",
								size: "sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/auth",
									children: "Sign in"
								})
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
			}),
			!isAuthPage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerServiceFooter, {}),
			user && access === "locked" && !isAdmin && !isAuthPage && ![
				"/paywall",
				"/checkout",
				"/post",
				"/post-reel"
			].includes(pathname) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaywallGate, {}),
			!isAuthPage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompareTray, {}),
			user && !isAuthPage && !isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloatingPostButton, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, { theme: "dark" })
		]
	});
}
function FloatingPostButton() {
	const { access, profile } = useAuth();
	const [showPaywall, setShowPaywall] = (0, import_react.useState)(false);
	const [checking, setChecking] = (0, import_react.useState)(false);
	const navigate = useNavigate();
	const handleClick = async () => {
		if (access === "locked") {
			setShowPaywall(true);
			return;
		}
		setChecking(true);
		const { data, error } = await supabase.rpc("can_post_vehicle", { p_user_id: profile?.id });
		setChecking(false);
		if (error) {
			console.error(error);
			return;
		}
		if (data?.can_post) navigate({ to: "/post" });
		else setShowPaywall(true);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		onClick: handleClick,
		disabled: checking,
		className: "fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full gold-gradient shadow-[0_0_30px_rgba(212,175,55,0.5)] grid place-items-center hover:scale-105 transition-transform active:scale-95 gold-glow",
		"aria-label": "Create post",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-6 w-6 text-gold-foreground" })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PremiumPaywallModal, {
		open: showPaywall,
		onOpenChange: setShowPaywall
	})] });
}
function useUnreadMessages(userId) {
	const [count, setCount] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (!userId) {
			setCount(0);
			return;
		}
		let mounted = true;
		const load = async () => {
			const { count: c } = await supabase.from("messages").select("id", {
				count: "exact",
				head: true
			}).eq("recipient_id", userId).is("read_at", null);
			if (mounted) setCount(c ?? 0);
		};
		load();
		const ch = supabase.channel(`unread-${userId}`).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "messages",
			filter: `recipient_id=eq.${userId}`
		}, () => load()).subscribe();
		return () => {
			mounted = false;
			supabase.removeChannel(ch);
		};
	}, [userId]);
	return count;
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$11 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "GRAND Auto Luxe — Premium Algerian Vehicle Marketplace" },
			{
				name: "description",
				content: "Buy, sell, and auction premium vehicles across Algeria. Luxury automotive marketplace with live bidding."
			},
			{
				name: "author",
				content: "GRAND Auto Luxe"
			},
			{
				property: "og:title",
				content: "GRAND Auto Luxe"
			},
			{
				property: "og:description",
				content: "Premium Algerian vehicle marketplace with live auctions."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700;900&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$11.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBoundary, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
			fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingFallback, {}),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {})
		}) })
	});
}
var $$splitComponentImporter$10 = () => import("./reels-B4TzpSrY.mjs");
var Route$10 = createFileRoute("/reels")({
	head: () => ({ meta: [{ title: "Reels · GRAND Auto Luxe" }] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./post-reel-k2EsmGJW.mjs");
var Route$9 = createFileRoute("/post-reel")({
	head: () => ({ meta: [{ title: "نشر ريلز · GRAND Auto Luxe" }] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./post-CXmxlHXz.mjs");
var Route$8 = createFileRoute("/post")({
	head: () => ({ meta: [{ title: "List your vehicle · GRAND Auto Luxe" }] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./plans-nCQVDlTQ.mjs");
var Route$7 = createFileRoute("/plans")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./my-appointments-D2829Fza.mjs");
var Route$6 = createFileRoute("/my-appointments")({
	head: () => ({ meta: [{ title: "My Appointments · GRAND Auto Luxe" }] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./messages-D0XPhjtq.mjs");
var Route$5 = createFileRoute("/messages")({
	head: () => ({ meta: [{ title: "Messages · GRAND Auto Luxe" }] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./checkout-B9VxUS0f.mjs");
var Route$4 = createFileRoute("/checkout")({
	head: () => ({ meta: [{ title: "Activation · GRAND Auto Luxe" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./brands--fyCnfk-.mjs");
var Route$3 = createFileRoute("/brands")({
	head: () => ({ meta: [
		{ title: "Explore Brands — GRAND Auto Luxe" },
		{
			name: "description",
			content: "Browse popular European, Chinese and Asian car brands and models available in Algeria with realistic Algerian Dinar pricing."
		},
		{
			property: "og:title",
			content: "Explore Brands — GRAND Auto Luxe"
		},
		{
			property: "og:description",
			content: "Premium catalogue of vehicles popular in the Algerian market."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./auth-CdTYRg4N.mjs");
var Route$2 = createFileRoute("/auth")({
	head: () => ({ meta: [{ title: "Sign in · GRAND Auto Luxe" }] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./admin-j1RdaSpD.mjs");
var Route$1 = createFileRoute("/admin")({
	head: () => ({ meta: [{ title: "Admin · GRAND Auto Luxe" }] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./routes-DJ2oaxZi.mjs");
var Route = createFileRoute("/")({
	head: () => ({ meta: [{ title: "GRAND Auto Luxe — Premium Algerian Vehicle Marketplace" }, {
		name: "description",
		content: "Browse and bid on premium vehicles across Algeria. Reels and grid views, live auctions."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var ReelsRoute = Route$10.update({
	id: "/reels",
	path: "/reels",
	getParentRoute: () => Route$11
});
var PostReelRoute = Route$9.update({
	id: "/post-reel",
	path: "/post-reel",
	getParentRoute: () => Route$11
});
var PostRoute = Route$8.update({
	id: "/post",
	path: "/post",
	getParentRoute: () => Route$11
});
var PlansRoute = Route$7.update({
	id: "/plans",
	path: "/plans",
	getParentRoute: () => Route$11
});
var MyListingsRoute = Route$13.update({
	id: "/my-listings",
	path: "/my-listings",
	getParentRoute: () => Route$11
});
var MyAppointmentsRoute = Route$6.update({
	id: "/my-appointments",
	path: "/my-appointments",
	getParentRoute: () => Route$11
});
var MessagesRoute = Route$5.update({
	id: "/messages",
	path: "/messages",
	getParentRoute: () => Route$11
});
var CheckoutRoute = Route$4.update({
	id: "/checkout",
	path: "/checkout",
	getParentRoute: () => Route$11
});
var BrandsRoute = Route$3.update({
	id: "/brands",
	path: "/brands",
	getParentRoute: () => Route$11
});
var AuthRoute = Route$2.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$11
});
var AdminRoute = Route$1.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => Route$11
});
var IndexRoute = Route.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$11
});
var VehicleIdRoute = Route$14.update({
	id: "/vehicle/$id",
	path: "/vehicle/$id",
	getParentRoute: () => Route$11
});
var SellerIdRoute = Route$15.update({
	id: "/seller/$id",
	path: "/seller/$id",
	getParentRoute: () => Route$11
});
var rootRouteChildren = {
	IndexRoute,
	AdminRoute,
	AuthRoute,
	BrandsRoute,
	CheckoutRoute,
	MessagesRoute,
	MyAppointmentsRoute,
	MyListingsRoute,
	PlansRoute,
	PostRoute,
	PostReelRoute,
	ReelsRoute,
	EditListingIdRoute: Route$12.update({
		id: "/edit-listing/$id",
		path: "/edit-listing/$id",
		getParentRoute: () => Route$11
	}),
	SellerIdRoute,
	VehicleIdRoute
};
var routeTree = Route$11._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
