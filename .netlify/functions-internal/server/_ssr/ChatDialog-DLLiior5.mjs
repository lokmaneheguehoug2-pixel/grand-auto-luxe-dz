import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-Bi6lj-hW.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./use-auth-BrGT0prV.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-CSRoKnxW.mjs";
import { t as Input } from "./input-B9TG3aA4.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { D as MessageCircle, g as Send, j as LoaderCircle } from "../_libs/lucide-react.mjs";
import { a as DialogTrigger, i as DialogTitle, n as DialogContent, r as DialogHeader, t as Dialog } from "./dialog-Cu5CqtGL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ChatDialog-DLLiior5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var QUICK_TEMPLATES = [
	"السلام عليكم، هل السيارة متوفرة؟",
	"ما هو آخر سعر؟",
	"هل يمكن المعاينة؟",
	"أرسل لي مزيد من الصور من فضلك."
];
function ChatDialog({ vehicleId, sellerId, vehicleTitle, autoOpen = false, onClose }) {
	const { user } = useAuth();
	const [open, setOpen] = (0, import_react.useState)(autoOpen);
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [body, setBody] = (0, import_react.useState)("");
	const [sending, setSending] = (0, import_react.useState)(false);
	const scrollRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (autoOpen) setOpen(true);
	}, [autoOpen]);
	const otherId = sellerId;
	(0, import_react.useEffect)(() => {
		if (!open || !user) return;
		let mounted = true;
		const orFilter = `and(sender_id.eq.${user.id},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${user.id})`;
		const load = async () => {
			const { data } = await supabase.from("messages").select("*").eq("vehicle_id", vehicleId).or(orFilter).order("created_at", { ascending: true });
			if (!mounted) return;
			setMessages(data ?? []);
			await supabase.from("messages").update({ read_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("vehicle_id", vehicleId).eq("recipient_id", user.id).eq("sender_id", otherId).is("read_at", null);
		};
		load();
		const ch = supabase.channel(`thread-${vehicleId}-${user.id}-${otherId}`).on("postgres_changes", {
			event: "INSERT",
			schema: "public",
			table: "messages",
			filter: `vehicle_id=eq.${vehicleId}`
		}, (payload) => {
			const m = payload.new;
			if (m.sender_id === user.id && m.recipient_id === otherId || m.sender_id === otherId && m.recipient_id === user.id) load();
		}).subscribe();
		return () => {
			mounted = false;
			supabase.removeChannel(ch);
		};
	}, [
		open,
		user,
		vehicleId,
		otherId
	]);
	(0, import_react.useEffect)(() => {
		scrollRef.current?.scrollTo({
			top: scrollRef.current.scrollHeight,
			behavior: "smooth"
		});
	}, [messages.length]);
	const send = async (text) => {
		const value = (text ?? body).trim();
		if (!value || !user) return;
		setSending(true);
		const { error, data } = await supabase.from("messages").insert({
			vehicle_id: vehicleId,
			sender_id: user.id,
			recipient_id: otherId,
			body: value
		}).select().single();
		if (!error) await supabase.from("notifications").insert({
			user_id: otherId,
			title: "💬 رسالة جديدة",
			body: value.slice(0, 140),
			link: `/messages`,
			kind: "message"
		});
		setSending(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		setBody("");
		if (data) setMessages((m) => [...m, data]);
	};
	const handleOpenChange = (v) => {
		setOpen(v);
		if (!v) onClose?.();
	};
	if (!user) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: handleOpenChange,
		children: [!autoOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "gold-outline",
				className: "h-12 w-full",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-4 w-4" }), " In-app Chat"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "bg-background border-gold/40 max-w-lg p-0 overflow-hidden",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
					className: "px-5 pt-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						className: "font-display text-lg",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-gold",
								children: "Chat ·"
							}),
							" ",
							vehicleTitle
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref: scrollRef,
					className: "px-5 py-4 h-80 overflow-y-auto space-y-2 bg-charcoal/30",
					children: [messages.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-center text-xs text-muted-foreground py-8",
						children: "Start the conversation with the seller."
					}), messages.map((m) => {
						const mine = m.sender_id === user.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `flex ${mine ? "justify-end" : "justify-start"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `max-w-[78%] rounded-2xl px-3 py-2 text-sm ${mine ? "gold-gradient text-gold-foreground" : "bg-card border border-border"}`,
								children: [m.body, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `text-[9px] mt-1 ${mine ? "text-gold-foreground/70" : "text-muted-foreground"}`,
									children: new Date(m.created_at).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit"
									})
								})]
							})
						}, m.id);
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 pb-4 space-y-3 border-t border-border pt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1.5",
						children: QUICK_TEMPLATES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => send(t),
							disabled: sending,
							className: "text-[11px] px-2 py-1 rounded-full border border-gold/30 text-gold/90 hover:bg-gold-soft transition-colors",
							dir: "rtl",
							children: t
						}, t))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: body,
							onChange: (e) => setBody(e.target.value),
							onKeyDown: (e) => e.key === "Enter" && send(),
							placeholder: "Type a message…",
							className: "bg-charcoal border-gold/30"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "gold",
							size: "icon",
							disabled: sending || !body.trim(),
							onClick: () => send(),
							children: sending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" })
						})]
					})]
				})
			]
		})]
	});
}
//#endregion
export { ChatDialog as t };
