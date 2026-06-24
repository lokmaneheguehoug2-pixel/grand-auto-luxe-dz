import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-CSRoKnxW.mjs";
import { t as supabase } from "./client-Bi6lj-hW.mjs";
import { t as useAuth } from "./use-auth-BrGT0prV.mjs";
import { n as useSignedUrl } from "./use-signed-url-7GRrwbbN.mjs";
import { r as formatDZD } from "./format-DTUn6abU.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-B5sbP7os.mjs";
import { t as Input } from "./input-B9TG3aA4.mjs";
import { t as Textarea } from "./textarea-DkED4GNe.mjs";
import { t as Label } from "./label-DrCE_Ido.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { A as Megaphone, C as RefreshCw, E as Phone, F as Instagram, H as Globe, J as Eye, M as Mail, Q as Crown, Z as DollarSign, _ as Settings, d as Trash2, dt as Car, f as Tag, h as Shield, ht as Ban, k as MessageCircle, l as TriangleAlert, n as X, o as UserCheck, q as Facebook, r as Users, tt as Clock, u as TrendingUp, ut as Check, v as Send } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-DU85NiI0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminPage() {
	const { isAdmin, loading } = useAuth();
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "py-24 text-center text-muted-foreground",
		children: "Loading…"
	});
	if (!isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-md mx-auto px-6 py-24 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-10 w-10 text-gold mx-auto mb-3" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl mb-2",
				children: "Restricted"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground text-sm",
				children: "This area is reserved for administrators."
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-7xl mx-auto px-4 sm:px-6 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-10 w-10 rounded-lg gold-gradient grid place-items-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-5 w-5 text-gold-foreground" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl",
					children: "Admin Control"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsWidget, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "subscriptions",
				className: "mt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "bg-charcoal border border-border mb-6 flex-wrap h-auto gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "subscriptions",
								className: "data-[state=active]:bg-gold data-[state=active]:text-gold-foreground",
								children: "Subscriptions"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "users",
								className: "data-[state=active]:bg-gold data-[state=active]:text-gold-foreground",
								children: "Users"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "listings",
								className: "data-[state=active]:bg-gold data-[state=active]:text-gold-foreground",
								children: "Listings"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "appointments",
								className: "data-[state=active]:bg-gold data-[state=active]:text-gold-foreground",
								children: "Appointments"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "reports",
								className: "data-[state=active]:bg-gold data-[state=active]:text-gold-foreground",
								children: "Reports"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "promocodes",
								className: "data-[state=active]:bg-gold data-[state=active]:text-gold-foreground",
								children: "Promo Codes"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "support",
								className: "data-[state=active]:bg-gold data-[state=active]:text-gold-foreground",
								children: "Support"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "sitesettings",
								className: "data-[state=active]:bg-gold data-[state=active]:text-gold-foreground",
								children: "Site Settings"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "broadcast",
								className: "data-[state=active]:bg-gold data-[state=active]:text-gold-foreground",
								children: "Broadcast"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "subscriptions",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubscriptionsTab, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "users",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsersTab, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "listings",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingsTab, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "appointments",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppointmentsTab, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "reports",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportsTab, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "promocodes",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromoCodesTab, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "support",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SupportTab, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "sitesettings",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteSettingsTab, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "broadcast",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BroadcastTab, {})
					})
				]
			})
		]
	});
}
function AnalyticsWidget() {
	const { data } = useQuery({
		queryKey: ["admin-analytics"],
		queryFn: async () => {
			const [subsRes, usersRes, vehiclesRes, reportsRes] = await Promise.all([
				supabase.from("pending_subscriptions").select("amount, plan, status, reviewed_at, submitted_at").order("submitted_at", { ascending: false }).limit(100),
				supabase.from("profiles").select("id, subscription_status, plan_type, is_showroom, is_banned, created_at"),
				supabase.from("vehicles").select("id, status, created_at").order("created_at", { ascending: false }).limit(500),
				supabase.from("vehicle_reports").select("id, status").not("status", "is", null)
			]);
			const approved = (subsRes.data ?? []).filter((d) => d.status === "approved");
			const total = approved.reduce((s, r) => s + Number(r.amount), 0);
			const pending = (subsRes.data ?? []).filter((d) => d.status === "pending").length;
			const monthStart = /* @__PURE__ */ new Date();
			monthStart.setDate(1);
			monthStart.setHours(0, 0, 0, 0);
			const mtd = approved.filter((r) => r.reviewed_at && new Date(r.reviewed_at) >= monthStart).reduce((s, r) => s + Number(r.amount), 0);
			const users = usersRes.data ?? [];
			const activeCount = users.filter((u) => u.subscription_status === "active").length;
			const trialCount = users.filter((u) => u.subscription_status === "trial").length;
			const showroomCount = users.filter((u) => u.is_showroom).length;
			const vehicles = vehiclesRes.data ?? [];
			const activeVehicles = vehicles.filter((v) => v.status === "active").length;
			const pendingVehicles = vehicles.filter((v) => v.status === "pending").length;
			const openReports = (reportsRes.data ?? []).filter((r) => r.status === "open").length;
			return {
				total,
				mtd,
				pending,
				totalSubs: approved.length,
				activeCount,
				trialCount,
				showroomCount,
				activeVehicles,
				pendingVehicles,
				openReports
			};
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3",
		children: [
			{
				label: "Total Revenue",
				value: formatDZD(data?.total ?? 0),
				icon: DollarSign
			},
			{
				label: "Month-to-date",
				value: formatDZD(data?.mtd ?? 0),
				icon: TrendingUp
			},
			{
				label: "Active Users",
				value: String(data?.activeCount ?? 0),
				icon: Users
			},
			{
				label: "Trial Users",
				value: String(data?.trialCount ?? 0),
				icon: Clock
			},
			{
				label: "Showrooms",
				value: String(data?.showroomCount ?? 0),
				icon: Crown
			},
			{
				label: "Active Vehicles",
				value: String(data?.activeVehicles ?? 0),
				icon: Car
			}
		].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "premium-card gold-border rounded-xl p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-xs uppercase tracking-widest text-gold/80",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(s.icon, { className: "h-3.5 w-3.5" }),
					" ",
					s.label
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 font-display text-2xl gold-text",
				children: s.value
			})]
		}, s.label))
	});
}
function SubscriptionsTab() {
	const qc = useQueryClient();
	const { data = [] } = useQuery({
		queryKey: ["admin-pending-subs"],
		queryFn: async () => {
			const { data: subs } = await supabase.from("pending_subscriptions").select("*").order("submitted_at", { ascending: false });
			const ids = Array.from(new Set((subs ?? []).map((s) => s.user_id)));
			const { data: profs } = ids.length ? await supabase.from("profiles").select("id,first_name,last_name,phone").in("id", ids) : { data: [] };
			const map = new Map((profs ?? []).map((p) => [p.id, p]));
			return (subs ?? []).map((s) => ({
				...s,
				profiles: map.get(s.user_id)
			}));
		}
	});
	const approve = async (p) => {
		const days = p.plan === "yearly" ? 365 : 30;
		const until = new Date(Date.now() + days * 864e5).toISOString();
		await supabase.from("profiles").update({
			subscription_status: "active",
			subscription_until: until
		}).eq("id", p.user_id);
		await supabase.from("pending_subscriptions").update({
			status: "approved",
			reviewed_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", p.id);
		toast.success(`Activated · ${days} days`);
		qc.invalidateQueries({ queryKey: ["admin-pending-subs", "admin-analytics"] });
	};
	const reject = async (p) => {
		await supabase.from("pending_subscriptions").update({
			status: "rejected",
			reviewed_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", p.id);
		qc.invalidateQueries({ queryKey: ["admin-pending-subs"] });
		toast.success("Rejected");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [data.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-center text-muted-foreground py-12",
			children: "No subscription requests."
		}), data.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubRow, {
			p,
			onApprove: () => approve(p),
			onReject: () => reject(p)
		}, p.id))]
	});
}
function SubRow({ p, onApprove, onReject }) {
	const url = useSignedUrl("payment-receipts", p.receipt_url, 600);
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "premium-card gold-border rounded-xl p-4 grid sm:grid-cols-[1fr_auto] gap-3 items-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 flex-wrap",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-semibold",
						children: [
							p.profiles?.first_name,
							" ",
							p.profiles?.last_name
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs px-2 py-0.5 rounded-full bg-gold-soft text-gold uppercase tracking-widest",
						children: p.plan
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "gold-text font-display",
						children: formatDZD(p.amount)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-xs text-muted-foreground mt-1",
				children: [
					p.profiles?.phone,
					" · ",
					new Date(p.submitted_at).toLocaleString()
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-xs",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `px-2 py-0.5 rounded-full ${p.status === "pending" ? "bg-gold-soft text-gold" : p.status === "approved" ? "bg-emerald-500/15 text-emerald-400" : "bg-destructive/15 text-destructive"}`,
					children: p.status
				})
			}),
			open && url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: url,
				target: "_blank",
				rel: "noreferrer",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: url,
					alt: "receipt",
					className: "mt-3 max-h-80 rounded-lg border border-gold/30"
				})
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2 flex-wrap",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: () => setOpen(!open),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" }), " View"]
			}), p.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "gold",
				size: "sm",
				onClick: onApprove,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }), " Activate"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: onReject,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), " Reject"]
			})] })]
		})]
	});
}
function UsersTab() {
	const qc = useQueryClient();
	const { data = [] } = useQuery({
		queryKey: ["admin-users"],
		queryFn: async () => {
			const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
			return data ?? [];
		}
	});
	const toggleBan = async (u) => {
		await supabase.from("profiles").update({ is_banned: !u.is_banned }).eq("id", u.id);
		toast.success(u.is_banned ? "Reactivated" : "Banned");
		qc.invalidateQueries({ queryKey: ["admin-users"] });
	};
	const toggleShowroom = async (u) => {
		await supabase.from("profiles").update({ is_showroom: !u.is_showroom }).eq("id", u.id);
		toast.success(u.is_showroom ? "Showroom badge removed" : "Verified as showroom");
		qc.invalidateQueries({ queryKey: ["admin-users"] });
	};
	const activate = async (u, days) => {
		const until = new Date(Date.now() + days * 864e5).toISOString();
		await supabase.from("profiles").update({
			subscription_status: "active",
			subscription_until: until
		}).eq("id", u.id);
		await supabase.from("notifications").insert({
			user_id: u.id,
			title: "تم تفعيل اشتراكك",
			body: `حسابك مفعّل لمدة ${days} يوم.`,
			kind: "subscription"
		});
		toast.success(`Activated · ${days} days`);
		qc.invalidateQueries({ queryKey: ["admin-users", "admin-analytics"] });
	};
	const resetPassword = async (u) => {
		if (!confirm(`Reset password for ${u.phone}?`)) return;
		const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
		let pass = "";
		for (let i = 0; i < 12; i++) pass += chars[Math.floor(Math.random() * 60)];
		const { error } = await supabase.rpc("admin_reset_user_password", {
			user_id: u.id,
			new_password: pass
		});
		if (error) {
			toast.error(error.message);
			return;
		}
		await navigator.clipboard.writeText(pass);
		toast.success("Password copied to clipboard");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "premium-card rounded-xl overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full text-sm min-w-[900px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "bg-charcoal text-xs uppercase tracking-widest text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left p-3",
						children: "Name"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left p-3",
						children: "Phone"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left p-3",
						children: "Status"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left p-3",
						children: "Plan"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left p-3",
						children: "Joined"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
				] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: data.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "p-3",
						children: [
							u.first_name,
							" ",
							u.last_name,
							u.is_showroom && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "h-4 w-4 text-gold inline ml-1" }),
							u.is_banned && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 text-[10px] px-1.5 py-0.5 rounded bg-destructive/20 text-destructive uppercase",
								children: "Banned"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-3 font-mono text-xs",
						children: u.phone
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `px-2 py-0.5 rounded-full text-xs ${u.subscription_status === "active" ? "bg-emerald-500/15 text-emerald-400" : u.subscription_status === "trial" ? "bg-gold-soft text-gold" : "bg-destructive/15 text-destructive"}`,
							children: u.subscription_status
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-3 text-xs",
						children: u.plan_type ?? "individual"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-3 text-muted-foreground text-xs",
						children: new Date(u.created_at).toLocaleDateString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "p-3 text-right whitespace-nowrap",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => toggleShowroom(u),
								title: "Toggle showroom badge",
								children: u.is_showroom ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "h-4 w-4 text-gold" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "h-4 w-4 text-muted-foreground" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "gold",
								size: "sm",
								className: "mx-1",
								onClick: () => activate(u, 30),
								title: "30 days",
								children: "30d"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "gold-outline",
								size: "sm",
								className: "mr-1",
								onClick: () => resetPassword(u),
								title: "Reset password",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => toggleBan(u),
								children: u.is_banned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "h-4 w-4 text-emerald-400" }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ban, { className: "h-4 w-4 text-destructive" })
							})
						]
					})
				]
			}, u.id)) })]
		})
	});
}
function ListingsTab() {
	const qc = useQueryClient();
	const [tab, setTab] = (0, import_react.useState)("pending");
	const { data = [] } = useQuery({
		queryKey: ["admin-listings", tab],
		queryFn: async () => {
			let q = supabase.from("vehicles").select("id, brand, model, year, wilaya, created_at, status, seller_id").order("created_at", { ascending: false }).limit(200);
			if (tab === "pending") q = q.eq("status", "pending");
			const { data } = await q;
			return data ?? [];
		}
	});
	const setStatus = async (v, status, notif) => {
		await supabase.from("vehicles").update({ status }).eq("id", v.id);
		await supabase.from("notifications").insert({
			user_id: v.seller_id,
			title: notif.title,
			body: notif.body,
			link: `/vehicle/${v.id}`,
			kind: status === "active" ? "approved" : "rejected"
		});
		toast.success(status === "active" ? "Approved" : "Rejected");
		qc.invalidateQueries({ queryKey: ["admin-listings", "admin-analytics"] });
	};
	const del = async (id) => {
		if (!confirm("Delete?")) return;
		await supabase.from("vehicles").delete().eq("id", id);
		qc.invalidateQueries({ queryKey: ["admin-listings"] });
		toast.success("Deleted");
	};
	const pendingCount = data.filter((v) => v.status === "pending").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: tab === "pending" ? "gold" : "ghost",
				onClick: () => setTab("pending"),
				children: ["Pending ", tab === "pending" && pendingCount > 0 ? `· ${pendingCount}` : ""]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: tab === "all" ? "gold" : "ghost",
				onClick: () => setTab("all"),
				children: "All"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "premium-card rounded-xl overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm min-w-[720px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-charcoal text-xs uppercase tracking-widest text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left p-3",
							children: "Vehicle"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left p-3",
							children: "Wilaya"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left p-3",
							children: "Status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left p-3",
							children: "Date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [data.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: 5,
					className: "p-8 text-center text-muted-foreground",
					children: "No listings."
				}) }), data.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "p-3",
							children: [
								v.brand,
								" ",
								v.model,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground text-xs",
									children: ["· ", v.year]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-3",
							children: v.wilaya
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `text-xs px-2 py-0.5 rounded-full border ${v.status === "pending" ? "bg-gold-soft text-gold border-gold/40" : v.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : v.status === "rejected" ? "bg-destructive/10 text-destructive border-destructive/40" : "bg-charcoal border-border"}`,
								children: v.status
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-3 text-muted-foreground text-xs",
							children: new Date(v.created_at).toLocaleDateString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "p-3 text-right whitespace-nowrap",
							children: [v.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "gold",
								size: "sm",
								className: "mr-1",
								onClick: () => setStatus(v, "active", {
									title: "تم قبول إعلانك",
									body: `${v.brand} ${v.model} ظهر في السوق.`
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5" }), " Approve"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								className: "mr-1",
								onClick: () => setStatus(v, "rejected", {
									title: "تم رفض إعلانك",
									body: `إعلان ${v.brand} ${v.model} لم يستوفِ الشروط.`
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" }), " Reject"]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => del(v.id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 text-destructive" })
							})]
						})
					]
				}, v.id))] })]
			})
		})]
	});
}
function ReportsTab() {
	const qc = useQueryClient();
	const { data = [] } = useQuery({
		queryKey: ["admin-reports"],
		queryFn: async () => {
			const { data: reports } = await supabase.from("vehicle_reports").select("*").order("created_at", { ascending: false });
			const vehicleIds = Array.from(new Set((reports ?? []).map((r) => r.vehicle_id)));
			const { data: devs } = vehicleIds.length ? await supabase.from("vehicles").select("id, brand, model").in("id", vehicleIds) : { data: [] };
			const vMap = new Map((devs ?? []).map((v) => [v.id, v]));
			return (reports ?? []).map((r) => ({
				...r,
				vehicle: vMap.get(r.vehicle_id)
			}));
		}
	});
	const markFake = async (r) => {
		const { data: profile } = await supabase.from("profiles").select("fake_reports_count").eq("id", r.reporter_id).single();
		const newCount = (profile?.fake_reports_count ?? 0) + 1;
		await supabase.from("profiles").update({
			fake_reports_count: newCount,
			last_fake_report_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", r.reporter_id);
		if (newCount >= 5) {
			await supabase.from("profiles").update({ is_banned: true }).eq("id", r.reporter_id);
			toast.success("Reporter auto-banned (5 fake reports)");
		}
		await supabase.from("vehicle_reports").update({ status: "fake" }).eq("id", r.id);
		qc.invalidateQueries({ queryKey: ["admin-reports"] });
		toast.success("Marked as fake");
	};
	const close = async (r) => {
		await supabase.from("vehicle_reports").update({ status: "closed" }).eq("id", r.id);
		qc.invalidateQueries({ queryKey: ["admin-reports"] });
		toast.success("Closed");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "premium-card rounded-xl overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "bg-charcoal text-xs uppercase tracking-widest text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left p-3",
						children: "Vehicle"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left p-3",
						children: "Reason"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left p-3",
						children: "Status"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left p-3",
						children: "Date"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
				] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [data.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				colSpan: 5,
				className: "p-8 text-center text-muted-foreground",
				children: "No reports."
			}) }), data.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "p-3",
						children: [
							r.vehicle?.brand,
							" ",
							r.vehicle?.model
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "p-3",
						children: [r.reason, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground block text-xs",
							children: r.details
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `px-2 py-0.5 rounded-full text-xs ${r.status === "open" ? "bg-gold-soft text-gold" : r.status === "fake" ? "bg-destructive/20 text-destructive" : "bg-emerald-500/15 text-emerald-400"}`,
							children: r.status
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-3 text-muted-foreground text-xs",
						children: new Date(r.created_at).toLocaleDateString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-3 text-right whitespace-nowrap",
						children: r.status === "open" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => markFake(r),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4 text-destructive" }), " Fake"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => close(r),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }), " Close"]
						})] })
					})
				]
			}, r.id))] })]
		})
	});
}
function PromoCodesTab() {
	const { user } = useAuth();
	const qc = useQueryClient();
	const { data = [] } = useQuery({
		queryKey: ["admin-promocodes"],
		queryFn: async () => {
			const { data } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });
			return data ?? [];
		}
	});
	const [form, setForm] = (0, import_react.useState)({
		code: "",
		plan_type: "individual",
		days_granted: 3,
		max_uses: ""
	});
	const createCode = async () => {
		if (!form.code.trim() || !user) return;
		const { error } = await supabase.from("promo_codes").insert({
			code: form.code.trim().toUpperCase(),
			plan_type: form.plan_type,
			days_granted: Number(form.days_granted),
			max_uses: form.max_uses ? Number(form.max_uses) : null,
			created_by: user.id
		});
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Promo code created");
		setForm({
			code: "",
			plan_type: "individual",
			days_granted: 3,
			max_uses: ""
		});
		qc.invalidateQueries({ queryKey: ["admin-promocodes"] });
	};
	const toggleActive = async (c) => {
		await supabase.from("promo_codes").update({ is_active: !c.is_active }).eq("id", c.id);
		qc.invalidateQueries({ queryKey: ["admin-promocodes"] });
		toast.success(c.is_active ? "Deactivated" : "Activated");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid md:grid-cols-3 gap-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "premium-card gold-border rounded-xl p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-xs uppercase tracking-widest text-gold mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "h-4 w-4" }), " Create Promo Code"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs uppercase tracking-widest text-muted-foreground",
						children: "Code"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: form.code,
						onChange: (e) => setForm({
							...form,
							code: e.target.value.toUpperCase()
						}),
						className: "bg-charcoal border-gold/30 mt-1.5 uppercase",
						placeholder: "GRAND30",
						maxLength: 20
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs uppercase tracking-widest text-muted-foreground",
						children: "Plan Type"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: form.plan_type,
						onChange: (e) => setForm({
							...form,
							plan_type: e.target.value
						}),
						className: "w-full mt-1.5 bg-charcoal border border-gold/30 rounded-lg px-3 py-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "individual",
							children: "Individual"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "showroom",
							children: "Showroom"
						})]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs uppercase tracking-widest text-muted-foreground",
						children: "Days Granted"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						value: form.days_granted,
						onChange: (e) => setForm({
							...form,
							days_granted: e.target.value
						}),
						className: "bg-charcoal border-gold/30 mt-1.5",
						min: 1,
						max: 365
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs uppercase tracking-widest text-muted-foreground",
						children: "Max Uses (optional)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: form.max_uses,
						onChange: (e) => setForm({
							...form,
							max_uses: e.target.value
						}),
						className: "bg-charcoal border-gold/30 mt-1.5",
						placeholder: "Unlimited",
						type: "number",
						min: 1
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "gold",
						className: "w-full",
						onClick: createCode,
						children: "Create Code"
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "md:col-span-2 premium-card rounded-xl overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-charcoal text-xs uppercase tracking-widest text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left p-3",
							children: "Code"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left p-3",
							children: "Plan"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left p-3",
							children: "Days"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left p-3",
							children: "Uses"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left p-3",
							children: "Expires"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left p-3",
							children: "Status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [data.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: 7,
					className: "p-8 text-center text-muted-foreground",
					children: "No promo codes yet."
				}) }), data.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-3 font-mono",
							children: c.code
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-3",
							children: c.plan_type
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-3",
							children: c.days_granted
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "p-3",
							children: [c.uses_count, c.max_uses ? `/${c.max_uses}` : ""]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-3 text-muted-foreground text-xs",
							children: new Date(c.expires_at).toLocaleDateString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `px-2 py-0.5 rounded-full text-xs ${c.is_active ? "bg-emerald-500/15 text-emerald-400" : "bg-destructive/15 text-destructive"}`,
								children: c.is_active ? "Active" : "Inactive"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => toggleActive(c),
								children: c.is_active ? "Deactivate" : "Activate"
							})
						})
					]
				}, c.id))] })]
			})
		})]
	});
}
function SupportTab() {
	const qc = useQueryClient();
	const { data = [] } = useQuery({
		queryKey: ["admin-support"],
		queryFn: async () => {
			const { data } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
			return data ?? [];
		}
	});
	const updateStatus = async (t, status) => {
		await supabase.from("support_tickets").update({
			status,
			resolved_at: status === "resolved" ? (/* @__PURE__ */ new Date()).toISOString() : null,
			closed_at: status === "closed" ? (/* @__PURE__ */ new Date()).toISOString() : null
		}).eq("id", t.id);
		qc.invalidateQueries({ queryKey: ["admin-support"] });
		toast.success("Updated");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "premium-card rounded-xl overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "bg-charcoal text-xs uppercase tracking-widest text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left p-3",
						children: "Subject"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left p-3",
						children: "Status"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left p-3",
						children: "Priority"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left p-3",
						children: "Created"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
				] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [data.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				colSpan: 5,
				className: "p-8 text-center text-muted-foreground",
				children: "No support tickets."
			}) }), data.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium",
							children: t.subject
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground line-clamp-1",
							children: t.description
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `px-2 py-0.5 rounded-full text-xs ${t.status === "open" ? "bg-gold-soft text-gold" : t.status === "resolved" ? "bg-emerald-500/15 text-emerald-400" : "bg-charcoal"}`,
							children: t.status
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `px-2 py-0.5 rounded-full text-xs ${t.priority === "high" || t.priority === "urgent" ? "bg-destructive/15 text-destructive" : "bg-charcoal"}`,
							children: t.priority
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-3 text-muted-foreground text-xs",
						children: new Date(t.created_at).toLocaleDateString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "p-3 text-right whitespace-nowrap",
						children: [t.status !== "closed" && t.status !== "resolved" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => updateStatus(t, "resolved"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }), " Resolve"]
						}), t.status !== "closed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => updateStatus(t, "closed"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), " Close"]
						})]
					})
				]
			}, t.id))] })]
		})
	});
}
function AppointmentsTab() {
	const qc = useQueryClient();
	const { data = [] } = useQuery({
		queryKey: ["admin-appointments"],
		queryFn: async () => {
			const { data } = await supabase.from("appointments").select(`
          *,
          vehicle:vehicles ( id, brand, model, year ),
          seller:profiles!appointments_seller_id_fkey ( id, first_name, last_name, phone )
        `).order("created_at", { ascending: false }).limit(100);
			return data ?? [];
		}
	});
	const updateStatus = async (apt, status) => {
		await supabase.from("appointments").update({ status }).eq("id", apt.id);
		toast.success("Status updated");
		qc.invalidateQueries({ queryKey: ["admin-appointments"] });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "premium-card rounded-xl overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "bg-charcoal text-xs uppercase tracking-widest text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left p-3",
						children: "Client"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left p-3",
						children: "Vehicle"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left p-3",
						children: "Seller"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left p-3",
						children: "Scheduled"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left p-3",
						children: "Status"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left p-3",
						children: "Created"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
				] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [data.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				colSpan: 7,
				className: "p-8 text-center text-muted-foreground",
				children: "No appointments yet."
			}) }), data.map((apt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-medium",
								children: apt.client_name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-muted-foreground flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-3 w-3" }),
									" ",
									apt.client_phone
								]
							}),
							apt.client_email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: apt.client_email
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-medium",
							children: [
								apt.vehicle?.brand,
								" ",
								apt.vehicle?.model
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: apt.vehicle?.year
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							apt.seller?.first_name,
							" ",
							apt.seller?.last_name
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: apt.seller?.phone
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-3 text-muted-foreground text-xs",
						children: apt.preferred_date ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: new Date(apt.preferred_date).toLocaleDateString() }), apt.preferred_time && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: apt.preferred_time })] }) : "-"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `px-2 py-0.5 rounded-full text-xs ${apt.status === "pending" ? "bg-gold-soft text-gold" : apt.status === "confirmed" ? "bg-emerald-500/15 text-emerald-400" : apt.status === "completed" ? "bg-blue-500/15 text-blue-400" : "bg-destructive/15 text-destructive"}`,
							children: apt.status
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-3 text-muted-foreground text-xs",
						children: new Date(apt.created_at).toLocaleDateString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "p-3 text-right whitespace-nowrap",
						children: [apt.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => updateStatus(apt, "confirmed"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }), " Confirm"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => updateStatus(apt, "cancelled"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), " Cancel"]
						})] }), apt.status === "confirmed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => updateStatus(apt, "completed"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }), " Complete"]
						})]
					})
				]
			}, apt.id))] })]
		})
	});
}
function SiteSettingsTab() {
	const qc = useQueryClient();
	const { data: settings = [] } = useQuery({
		queryKey: ["admin-site-settings"],
		queryFn: async () => {
			const { data } = await supabase.from("site_settings").select("*");
			return data ?? [];
		}
	});
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [value, setValue] = (0, import_react.useState)("");
	const settingsMap = settings.reduce((acc, s) => {
		acc[s.setting_key] = s.setting_value;
		return acc;
	}, {});
	const updateSetting = async (key) => {
		await supabase.from("site_settings").upsert({
			setting_key: key,
			setting_value: value
		}, { onConflict: "setting_key" });
		toast.success("Setting updated");
		setEditing(null);
		setValue("");
		qc.invalidateQueries({ queryKey: ["admin-site-settings"] });
	};
	const startEdit = (key, currentValue) => {
		setEditing(key);
		setValue(currentValue);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "premium-card gold-border rounded-xl p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-xs uppercase tracking-widest text-gold mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "h-4 w-4" }), " Social Media & Contact Links"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mb-4",
					children: "Update these links to change what appears in the website footer. Changes take effect immediately."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid md:grid-cols-2 gap-4",
					children: [
						{
							key: "whatsapp_number",
							label: "WhatsApp Number",
							icon: MessageCircle,
							placeholder: "+213555000000"
						},
						{
							key: "instagram_url",
							label: "Instagram URL",
							icon: Instagram,
							placeholder: "https://instagram.com/grandautoluxe"
						},
						{
							key: "facebook_url",
							label: "Facebook URL",
							icon: Facebook,
							placeholder: "https://facebook.com/grandautoluxe"
						},
						{
							key: "gmail_address",
							label: "Contact Email",
							icon: Mail,
							placeholder: "contact@grandautoluxe.com"
						}
					].map(({ key, label, icon: Icon, placeholder }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-4 rounded-lg border border-border bg-charcoal space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-sm font-medium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4 text-gold" }), label]
						}), editing === key ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value,
									onChange: (e) => setValue(e.target.value),
									placeholder,
									className: "flex-1"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "gold",
									size: "sm",
									onClick: () => updateSetting(key),
									children: "Save"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => setEditing(null),
									children: "Cancel"
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm text-muted-foreground truncate flex-1",
								children: settingsMap[key] || /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-gold/60 italic",
									children: "Not set"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => startEdit(key, settingsMap[key] || ""),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-4 w-4" })
							})]
						})]
					}, key))
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "premium-card rounded-xl p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-xs uppercase tracking-widest text-gold mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4 w-4" }), " Create Admin User"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mb-4",
					children: "After a user signs up, use this to promote them to Admin. First, find their phone number from the Users tab."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-sm bg-charcoal p-4 rounded-lg border border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "SELECT public.setup_admin_user('+213555000000');" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-2",
						children: "Run this SQL in Supabase Dashboard SQL Editor with the user's phone number."
					})]
				})
			]
		})]
	});
}
function BroadcastTab() {
	const { user } = useAuth();
	const qc = useQueryClient();
	const [title, setTitle] = (0, import_react.useState)("");
	const [body, setBody] = (0, import_react.useState)("");
	const [sending, setSending] = (0, import_react.useState)(false);
	const { data = [] } = useQuery({
		queryKey: ["admin-broadcast"],
		queryFn: async () => {
			const { data } = await supabase.from("broadcast_messages").select("*").order("created_at", { ascending: false }).limit(20);
			return data ?? [];
		}
	});
	const send = async () => {
		if (!title.trim() || !body.trim() || !user) return;
		setSending(true);
		await supabase.from("broadcast_messages").insert({
			admin_id: user.id,
			title: title.trim(),
			body: body.trim()
		});
		const { data: targets } = await supabase.from("profiles").select("id").eq("is_banned", false);
		if (targets && targets.length > 0) {
			const rows = targets.map((t) => ({
				user_id: t.id,
				title: `📢 ${title.trim()}`,
				body: body.trim(),
				kind: "broadcast"
			}));
			for (let i = 0; i < rows.length; i += 200) await supabase.from("notifications").insert(rows.slice(i, i + 200));
		}
		setSending(false);
		setTitle("");
		setBody("");
		toast.success(`Sent · ${targets?.length ?? 0} users`);
		qc.invalidateQueries({ queryKey: ["admin-broadcast"] });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid md:grid-cols-2 gap-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "premium-card gold-border rounded-xl p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-xs uppercase tracking-widest text-gold mb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "h-4 w-4" }), " Send to all users"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs uppercase tracking-widest text-muted-foreground",
						children: "Title"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: title,
						onChange: (e) => setTitle(e.target.value),
						className: "bg-charcoal border-gold/30 mt-1.5",
						maxLength: 120
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs uppercase tracking-widest text-muted-foreground",
						children: "Message"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: body,
						onChange: (e) => setBody(e.target.value),
						className: "bg-charcoal border-gold/30 mt-1.5 min-h-[120px]",
						maxLength: 1e3
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "gold",
						className: "w-full",
						disabled: sending || !title.trim() || !body.trim(),
						onClick: send,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" }), " Broadcast"]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs uppercase tracking-widest text-gold/80 mb-2",
					children: "Recent broadcasts"
				}),
				data.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm text-muted-foreground",
					children: "No broadcasts yet."
				}),
				data.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "premium-card rounded-lg p-3 border border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-semibold text-sm",
							children: b.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground line-clamp-2 mt-1",
							children: b.body
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] text-gold/60 uppercase tracking-widest mt-2",
							children: new Date(b.created_at).toLocaleString()
						})
					]
				}, b.id))
			]
		})]
	});
}
//#endregion
export { AdminPage as component };
