import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-CSRoKnxW.mjs";
import { t as supabase } from "./client-ZItgt3Kh.mjs";
import { t as useAuth } from "./use-auth-CdkwkgTz.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { E as Phone, ft as Calendar, n as X, tt as Clock, ut as Check } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/my-appointments-BZ-1YUHl.js
var import_jsx_runtime = require_jsx_runtime();
function MyAppointmentsPage() {
	const { user, loading } = useAuth();
	const qc = useQueryClient();
	const { data = [] } = useQuery({
		queryKey: ["my-appointments", user?.id],
		queryFn: async () => {
			if (!user) return [];
			const { data } = await supabase.from("appointments").select(`
          *,
          vehicle:vehicles ( id, brand, model, year, photos )
        `).eq("seller_id", user.id).order("created_at", { ascending: false });
			return data ?? [];
		},
		enabled: !!user
	});
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "max-w-5xl mx-auto px-6 py-20 text-center text-muted-foreground",
		children: "Loading…"
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-md mx-auto px-6 py-24 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-10 w-10 text-gold mx-auto mb-3" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl mb-2",
				children: "Sign in Required"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground text-sm mb-4",
				children: "Please sign in to view your appointments."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "gold",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/auth",
					children: "Sign in"
				})
			})
		]
	});
	const pending = data.filter((a) => a.status === "pending");
	const confirmed = data.filter((a) => a.status === "confirmed");
	const completed = data.filter((a) => a.status === "completed");
	const cancelled = data.filter((a) => a.status === "cancelled");
	const updateStatus = async (apt, status) => {
		await supabase.from("appointments").update({ status }).eq("id", apt.id);
		toast.success("Status updated");
		qc.invalidateQueries({ queryKey: ["my-appointments", user.id] });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-5xl mx-auto px-4 sm:px-6 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-10 w-10 rounded-lg gold-gradient grid place-items-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-5 w-5 text-gold-foreground" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl",
					children: "My Appointments"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Manage viewing requests from interested buyers"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Pending",
						value: pending.length,
						className: "bg-gold-soft text-gold"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Confirmed",
						value: confirmed.length,
						className: "bg-emerald-500/15 text-emerald-400"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Completed",
						value: completed.length,
						className: "bg-blue-500/15 text-blue-400"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Cancelled",
						value: cancelled.length,
						className: "bg-destructive/15 text-destructive"
					})
				]
			}),
			data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "premium-card rounded-xl p-12 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-12 w-12 text-gold/40 mx-auto mb-4" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-xl mb-2",
						children: "No Appointments Yet"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted-foreground text-sm",
						children: "When buyers request to view your vehicles, they will appear here."
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-4",
				children: data.map((apt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "premium-card rounded-xl p-4 grid sm:grid-cols-[auto_1fr_auto] gap-4 items-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-20 h-16 rounded-lg bg-charcoal overflow-hidden shrink-0",
							children: apt.vehicle?.photos?.[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: apt.vehicle.photos[0],
								alt: "",
								className: "w-full h-full object-cover"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-full h-full grid place-items-center text-gold/40",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-6 w-6" })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 flex-wrap",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/vehicle/$id",
										params: { id: apt.vehicle_id },
										className: "font-semibold hover:text-gold transition-colors",
										children: [
											apt.vehicle?.brand,
											" ",
											apt.vehicle?.model,
											" (",
											apt.vehicle?.year,
											")"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `px-2 py-0.5 rounded-full text-xs ${apt.status === "pending" ? "bg-gold-soft text-gold" : apt.status === "confirmed" ? "bg-emerald-500/15 text-emerald-400" : apt.status === "completed" ? "bg-blue-500/15 text-blue-400" : "bg-destructive/15 text-destructive"}`,
										children: apt.status
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-sm mt-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium",
											children: apt.client_name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground mx-2",
											children: "·"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											href: `tel:${apt.client_phone}`,
											className: "text-gold hover:underline",
											children: apt.client_phone
										})
									]
								}),
								apt.preferred_date && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground mt-1 flex items-center gap-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3 w-3" }),
										new Date(apt.preferred_date).toLocaleDateString(),
										apt.preferred_time && ` at ${apt.preferred_time}`
									]
								}),
								apt.message && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground mt-1 italic",
									children: [
										"\"",
										apt.message,
										"\""
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2 flex-wrap justify-end",
							children: [apt.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "gold",
								size: "sm",
								onClick: () => updateStatus(apt, "confirmed"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }), " Confirm"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => updateStatus(apt, "cancelled"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
							})] }), apt.status === "confirmed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "gold-outline",
								size: "sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: `tel:${apt.client_phone}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-4 w-4" }), " Call"]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => updateStatus(apt, "completed"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }), " Mark Done"]
							})] })]
						})
					]
				}, apt.id))
			})
		]
	});
}
function StatCard({ label, value, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `premium-card rounded-lg p-4 text-center ${className}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-2xl font-display font-bold",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs uppercase tracking-widest opacity-70",
			children: label
		})]
	});
}
//#endregion
export { MyAppointmentsPage as component };
