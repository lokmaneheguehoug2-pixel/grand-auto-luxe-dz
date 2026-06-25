import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-CSRoKnxW.mjs";
import { t as supabase } from "./client-5T_ILqww.mjs";
import { t as useAuth } from "./use-auth-eLhv7lHk.mjs";
import { n as useSignedUrl } from "./use-signed-url-BkLg4u9y.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { C as Plus, K as Film, Y as ExternalLink, u as Trash2, z as Heart } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reels-B4TzpSrY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ReelsPage() {
	const { user } = useAuth();
	const { data: reels = [], refetch } = useQuery({
		queryKey: ["reels-feed"],
		queryFn: async () => {
			const { data: rows } = await supabase.from("stories").select("*").order("created_at", { ascending: false }).limit(50);
			const ids = Array.from(new Set((rows ?? []).map((r) => r.author_id)));
			const { data: profs } = ids.length ? await supabase.from("profiles").select("id,first_name,last_name,showroom_name,is_showroom").in("id", ids) : { data: [] };
			const map = new Map((profs ?? []).map((p) => [p.id, p]));
			return (rows ?? []).map((r) => ({
				...r,
				author: map.get(r.author_id)
			}));
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-[calc(100vh-4rem)] bg-black",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md mx-auto py-4 px-3 flex items-center justify-between sticky top-16 z-30 bg-gradient-to-b from-black/95 to-transparent",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { className: "h-5 w-5 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-xl gold-text",
					children: "Reels"
				})]
			}), user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "gold",
				size: "sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/post-reel",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " ريل"]
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md mx-auto space-y-4 px-3 pb-10",
			children: [reels.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center py-24 text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { className: "h-12 w-12 mx-auto mb-3 text-gold/40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "لا يوجد ريلز بعد. كن أول من ينشر!" })]
			}), reels.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReelCard, {
				reel: r,
				onChange: refetch,
				currentUserId: user?.id
			}, r.id))]
		})]
	});
}
function ReelCard({ reel, onChange, currentUserId }) {
	const url = useSignedUrl("reels", reel.video_url, 3600);
	const ref = (0, import_react.useRef)(null);
	const [liked, setLiked] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!ref.current) return;
		const el = ref.current;
		const io = new IntersectionObserver(([e]) => {
			if (e.isIntersecting) el.play().catch(() => {});
			else el.pause();
		}, { threshold: .6 });
		io.observe(el);
		return () => io.disconnect();
	}, [url]);
	const like = async () => {
		setLiked(true);
		await supabase.from("stories").update({ likes_count: reel.likes_count + 1 }).eq("id", reel.id);
		onChange();
	};
	const del = async () => {
		if (!confirm("حذف الريل؟")) return;
		await supabase.from("stories").delete().eq("id", reel.id);
		await supabase.storage.from("reels").remove([reel.video_url]);
		toast.success("تم الحذف");
		onChange();
	};
	const name = reel.author?.is_showroom && reel.author.showroom_name ? reel.author.showroom_name : `${reel.author?.first_name ?? ""} ${reel.author?.last_name ?? ""}`.trim();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative rounded-2xl overflow-hidden gold-border bg-black aspect-[9/16]",
		children: [
			url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				ref,
				src: url,
				className: "w-full h-full object-cover",
				loop: true,
				muted: true,
				playsInline: true
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-full h-full grid place-items-center text-muted-foreground text-sm",
				children: "Loading…"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute right-3 bottom-24 flex flex-col items-center gap-4 z-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: like,
						className: "flex flex-col items-center gap-1 group",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-11 w-11 rounded-full bg-black/60 backdrop-blur grid place-items-center border border-gold/40 group-hover:border-gold transition",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: `h-5 w-5 ${liked ? "fill-gold text-gold" : "text-gold"}` })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] text-gold font-semibold",
							children: reel.likes_count + (liked ? 1 : 0)
						})]
					}),
					reel.vehicle_id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/vehicle/$id",
						params: { id: reel.vehicle_id },
						className: "flex flex-col items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-11 w-11 rounded-full bg-black/60 backdrop-blur grid place-items-center border border-gold/40",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-5 w-5 text-gold" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] text-gold font-semibold",
							children: "View"
						})]
					}),
					currentUserId === reel.author_id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: del,
						className: "h-11 w-11 rounded-full bg-black/60 backdrop-blur grid place-items-center border border-destructive/40",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 text-destructive" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute left-3 right-20 bottom-4 z-10 text-white",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 mb-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-8 w-8 rounded-full gold-gradient grid place-items-center text-gold-foreground font-bold text-xs",
						children: name.charAt(0).toUpperCase() || "?"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm font-semibold gold-text",
						children: name || "User"
					})]
				}), reel.caption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm leading-snug line-clamp-3 drop-shadow-lg",
					children: reel.caption
				})]
			})
		]
	});
}
//#endregion
export { ReelsPage as component };
