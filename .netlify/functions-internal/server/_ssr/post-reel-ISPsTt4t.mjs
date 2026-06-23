import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-Bi6lj-hW.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useAuth } from "./use-auth-BrGT0prV.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-CSRoKnxW.mjs";
import { t as Textarea } from "./textarea-DkED4GNe.mjs";
import { t as Label } from "./label-DrCE_Ido.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { B as Film, o as Upload, p as Sparkles } from "../_libs/lucide-react.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/post-reel-ISPsTt4t.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PostReelPage() {
	const { user, access, loading } = useAuth();
	const navigate = useNavigate();
	const [file, setFile] = (0, import_react.useState)(null);
	const [caption, setCaption] = (0, import_react.useState)("");
	const [vehicleId, setVehicleId] = (0, import_react.useState)("");
	const [myVehicles, setMyVehicles] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [preview, setPreview] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		supabase.from("vehicles").select("id,brand,model,year").eq("seller_id", user.id).then(({ data }) => setMyVehicles(data ?? []));
	}, [user]);
	(0, import_react.useEffect)(() => {
		if (!file) {
			setPreview(null);
			return;
		}
		const u = URL.createObjectURL(file);
		setPreview(u);
		return () => URL.revokeObjectURL(u);
	}, [file]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "py-24 text-center text-muted-foreground",
		children: "…"
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-md mx-auto px-6 py-24 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-2xl mb-3",
			children: "Sign in required"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "gold",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/auth",
				children: "Sign in"
			})
		})]
	});
	if (access === "locked") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-md mx-auto px-6 py-24 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-10 w-10 text-gold mx-auto mb-3" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl mb-2",
				children: "اشتراك مطلوب"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground text-sm mb-4",
				children: "يجب أن يكون لديك اشتراك فعّال لنشر الريلز."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "gold",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/checkout",
					children: "اشترك الآن"
				})
			})
		]
	});
	const submit = async () => {
		if (!file || !user) {
			toast.error("اختر ملف فيديو");
			return;
		}
		if (file.size > 50 * 1024 * 1024) {
			toast.error("الحد الأقصى 50MB");
			return;
		}
		setBusy(true);
		try {
			const ext = file.name.split(".").pop() || "mp4";
			const path = `${user.id}/${Date.now()}.${ext}`;
			const { error: upErr } = await supabase.storage.from("reels").upload(path, file, { contentType: file.type });
			if (upErr) throw upErr;
			const { error: insErr } = await supabase.from("stories").insert({
				author_id: user.id,
				video_url: path,
				caption: caption.trim() || null,
				vehicle_id: vehicleId || null
			});
			if (insErr) throw insErr;
			toast.success("تم نشر الريل بنجاح ✨");
			navigate({ to: "/reels" });
		} catch (e) {
			toast.error(e.message ?? "فشل النشر");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-2xl mx-auto px-4 sm:px-6 py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3 mb-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-10 w-10 rounded-lg gold-gradient grid place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { className: "h-5 w-5 text-gold-foreground" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl gold-text",
				children: "نشر ريلز"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground uppercase tracking-widest",
				children: "Premium Reel · Up to 50MB · MP4"
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "premium-card gold-border rounded-2xl p-6 space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs uppercase tracking-widest text-gold/80",
					children: "Video"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-2 block cursor-pointer",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-2 border-dashed border-gold/40 rounded-xl p-8 text-center hover:bg-gold-soft/30 transition",
						children: preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							src: preview,
							className: "max-h-72 mx-auto rounded-lg",
							controls: true
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-8 w-8 mx-auto text-gold mb-2" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm",
								children: "اضغط لاختيار فيديو"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground mt-1",
								children: "Vertical 9:16 recommended"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "file",
						accept: "video/*",
						className: "hidden",
						onChange: (e) => setFile(e.target.files?.[0] ?? null)
					})]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs uppercase tracking-widest text-gold/80",
					children: "Caption"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value: caption,
					onChange: (e) => setCaption(e.target.value),
					maxLength: 300,
					className: "bg-charcoal border-gold/30 mt-1.5 min-h-[90px]",
					placeholder: "اوصف سيارتك بأسلوب فخم..."
				})] }),
				myVehicles.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs uppercase tracking-widest text-gold/80",
					children: "Link a vehicle (optional)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: vehicleId,
					onChange: (e) => setVehicleId(e.target.value),
					className: "w-full mt-1.5 bg-charcoal border border-gold/30 rounded-md h-9 px-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "— None —"
					}), myVehicles.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value: v.id,
						children: [
							v.brand,
							" ",
							v.model,
							" · ",
							v.year
						]
					}, v.id))]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "gold",
					className: "w-full",
					disabled: busy || !file,
					onClick: submit,
					children: busy ? "جاري الرفع..." : "نشر الريل"
				})
			]
		})]
	});
}
//#endregion
export { PostReelPage as component };
