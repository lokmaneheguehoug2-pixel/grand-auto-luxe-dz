import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as supabase } from "./client-Bi6lj-hW.mjs";
import { t as useAuth } from "./use-auth-BrGT0prV.mjs";
import { I as Inbox, k as MessageCircle } from "../_libs/lucide-react.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as ChatDialog } from "./ChatDialog-CHwHeNBp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/messages-wJWsQeAd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MessagesPage() {
	const { user, loading } = useAuth();
	const [threads, setThreads] = (0, import_react.useState)([]);
	const [active, setActive] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		let mounted = true;
		const load = async () => {
			const { data: rows } = await supabase.from("messages").select("vehicle_id,sender_id,recipient_id,body,created_at,read_at").or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`).order("created_at", { ascending: false }).limit(500);
			const map = /* @__PURE__ */ new Map();
			for (const m of rows ?? []) {
				const other = m.sender_id === user.id ? m.recipient_id : m.sender_id;
				const key = `${m.vehicle_id}|${other}`;
				const isUnread = !m.read_at && m.recipient_id === user.id;
				const existing = map.get(key);
				if (!existing) map.set(key, {
					vehicle_id: m.vehicle_id,
					other_id: other,
					last_body: m.body,
					last_at: m.created_at,
					unread: isUnread ? 1 : 0
				});
				else if (isUnread) existing.unread += 1;
			}
			const arr = Array.from(map.values());
			const vIds = Array.from(new Set(arr.map((t) => t.vehicle_id)));
			const uIds = Array.from(new Set(arr.map((t) => t.other_id)));
			const [{ data: vs }, { data: ps }] = await Promise.all([vIds.length ? supabase.from("vehicles").select("id,brand,model,year").in("id", vIds) : Promise.resolve({ data: [] }), uIds.length ? supabase.from("profiles").select("id,first_name,last_name,showroom_name,is_showroom").in("id", uIds) : Promise.resolve({ data: [] })]);
			const vMap = new Map((vs ?? []).map((v) => [v.id, `${v.brand} ${v.model} · ${v.year}`]));
			const pMap = new Map((ps ?? []).map((p) => [p.id, p.is_showroom && p.showroom_name ? p.showroom_name : `${p.first_name} ${p.last_name}`.trim()]));
			const enriched = arr.map((t) => ({
				...t,
				vehicle_title: vMap.get(t.vehicle_id),
				other_name: pMap.get(t.other_id)
			}));
			if (mounted) setThreads(enriched);
		};
		load();
		const ch = supabase.channel(`inbox-${user.id}`).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "messages"
		}, () => load()).subscribe();
		return () => {
			mounted = false;
			supabase.removeChannel(ch);
		};
	}, [user]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "py-20 text-center text-muted-foreground",
		children: "…"
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-md mx-auto px-6 py-24 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, { className: "h-10 w-10 mx-auto mb-3 text-gold" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl mb-2",
				children: "Sign in to view messages"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/auth",
				className: "text-gold underline",
				children: "Sign in"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-3xl mx-auto px-4 sm:px-6 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-10 w-10 rounded-lg gold-gradient grid place-items-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, { className: "h-5 w-5 text-gold-foreground" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl gold-text",
					children: "صندوق الرسائل"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground uppercase tracking-widest",
					children: "All conversations · live"
				})] })]
			}),
			threads.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center py-20 premium-card gold-border rounded-2xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-10 w-10 mx-auto mb-3 text-gold/60" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground text-sm",
					children: "لا توجد محادثات بعد. ابدأ من صفحة أي سيارة."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: threads.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setActive({
						vehicleId: t.vehicle_id,
						sellerId: t.other_id,
						title: t.vehicle_title ?? "Conversation"
					}),
					className: "w-full text-left premium-card rounded-xl p-4 hover:gold-border transition flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-11 w-11 rounded-full gold-gradient grid place-items-center text-gold-foreground font-bold shrink-0",
							children: (t.other_name ?? "?").charAt(0).toUpperCase()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-semibold truncate",
										children: t.other_name ?? "User"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] text-muted-foreground shrink-0",
										children: new Date(t.last_at).toLocaleString()
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-gold/80 truncate",
									children: t.vehicle_title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm text-muted-foreground truncate mt-0.5",
									children: t.last_body
								})
							]
						}),
						t.unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "shrink-0 min-w-[22px] h-[22px] px-1.5 rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold grid place-items-center",
							children: t.unread > 9 ? "9+" : t.unread
						})
					]
				}, `${t.vehicle_id}-${t.other_id}`))
			}),
			active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatDialogAutoOpen, {
				vehicleId: active.vehicleId,
				sellerId: active.sellerId,
				title: active.title,
				onClose: () => setActive(null)
			}, `${active.vehicleId}-${active.sellerId}`)
		]
	});
}
function ChatDialogAutoOpen({ vehicleId, sellerId, title, onClose }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatDialog, {
		vehicleId,
		sellerId,
		vehicleTitle: title,
		autoOpen: true,
		onClose
	});
}
//#endregion
export { MessagesPage as component };
