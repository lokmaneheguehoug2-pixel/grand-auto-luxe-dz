import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as cn, t as Button } from "./button-CSRoKnxW.mjs";
import { t as supabase } from "./client-5T_ILqww.mjs";
import { t as useAuth } from "./use-auth-eLhv7lHk.mjs";
import { t as Input } from "./input-B9TG3aA4.mjs";
import { t as Textarea } from "./textarea-DkED4GNe.mjs";
import { t as Label } from "./label-DrCE_Ido.mjs";
import { B as GripVertical, L as ImagePlus, P as LoaderCircle, dt as Car, n as X, nt as Circle, o as Upload } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as WILAYAS, t as BRANDS } from "./wilayas-B1ZbMp-l.mjs";
import { n as RadioGroupIndicator, r as RadioGroupItem$1, t as RadioGroup$1 } from "../_libs/@radix-ui/react-radio-group+[...].mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCm-LKYR.mjs";
import { t as PremiumPaywallModal } from "./PremiumPaywallModal-rDrgaw0r.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/post-CXmxlHXz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var RadioGroup = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroup$1, {
		className: cn("grid gap-2", className),
		...props,
		ref
	});
});
RadioGroup.displayName = RadioGroup$1.displayName;
var RadioGroupItem = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem$1, {
		ref,
		className: cn("aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupIndicator, {
			className: "flex items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-3.5 w-3.5 fill-primary" })
		})
	});
});
RadioGroupItem.displayName = RadioGroupItem$1.displayName;
var MAX_PHOTOS = 30;
var COMPRESSION_OPTIONS = {
	maxWidth: 1920,
	maxHeight: 1080,
	quality: .8,
	maxSizeMB: 1.5
};
async function compressImage(file) {
	const img = new window.Image();
	img.src = URL.createObjectURL(file);
	await new Promise((r) => {
		img.onload = r;
		img.onerror = r;
	});
	const canvas = document.createElement("canvas");
	let { width, height } = img;
	if (width > COMPRESSION_OPTIONS.maxWidth || height > COMPRESSION_OPTIONS.maxHeight) {
		const ratio = Math.min(COMPRESSION_OPTIONS.maxWidth / width, COMPRESSION_OPTIONS.maxHeight / height);
		width *= ratio;
		height *= ratio;
	}
	canvas.width = width;
	canvas.height = height;
	canvas.getContext("2d").drawImage(img, 0, 0, width, height);
	let quality = COMPRESSION_OPTIONS.quality;
	const maxSize = COMPRESSION_OPTIONS.maxSizeMB * 1024 * 1024;
	let blob = null;
	for (let i = 0; i < 5; i++) {
		blob = await new Promise((r) => canvas.toBlob((b) => r(b), "image/jpeg", quality));
		if (blob.size <= maxSize) break;
		quality *= .8;
	}
	return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
}
function PostPage() {
	const { user, access, profile } = useAuth();
	const navigate = useNavigate();
	const [f, setF] = (0, import_react.useState)({
		brand: "",
		model: "",
		year: (/* @__PURE__ */ new Date()).getFullYear(),
		mileage: 0,
		engine_type: "",
		fuel_type: "Essence",
		transmission: "Manuelle",
		wilaya: "Alger",
		phone: "",
		description: "",
		price_type: "fixed",
		fixed_price: 0,
		starting_price: 0,
		auction_hours: 24
	});
	const [photos, setPhotos] = (0, import_react.useState)([]);
	const [video, setVideo] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [compressing, setCompressing] = (0, import_react.useState)(false);
	const [draggedIdx, setDraggedIdx] = (0, import_react.useState)(null);
	const fileInputRef = (0, import_react.useRef)(null);
	const [canPost, setCanPost] = (0, import_react.useState)(null);
	const [showPaywall, setShowPaywall] = (0, import_react.useState)(false);
	import_react.useEffect(() => {
		if (!user || access === "locked") return;
		supabase.rpc("can_post_vehicle", { p_user_id: user.id }).then(({ data }) => {
			setCanPost(data);
			if (!data?.can_post) setShowPaywall(true);
		});
	}, [user, access]);
	const handleFiles = (0, import_react.useCallback)(async (files) => {
		const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
		if (arr.length === 0) return;
		setCompressing(true);
		const compressed = [];
		for (const file of arr) try {
			compressed.push(await compressImage(file));
		} catch {
			compressed.push(file);
		}
		setCompressing(false);
		setPhotos((prev) => {
			return [...prev, ...compressed].slice(0, MAX_PHOTOS);
		});
	}, []);
	const handleDrop = (0, import_react.useCallback)((e) => {
		e.preventDefault();
		setDraggedIdx(null);
		handleFiles(e.dataTransfer.files);
	}, [handleFiles]);
	const handleReorder = (0, import_react.useCallback)((fromIdx, toIdx) => {
		setPhotos((prev) => {
			const arr = [...prev];
			const [removed] = arr.splice(fromIdx, 1);
			arr.splice(toIdx, 0, removed);
			return arr;
		});
	}, []);
	const handleDragOver = (e, idx) => {
		e.preventDefault();
		if (draggedIdx === null || draggedIdx === idx) return;
		handleReorder(draggedIdx, idx);
		setDraggedIdx(idx);
	};
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-md mx-auto px-6 py-24 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-2xl mb-2",
			children: "Sign in to list a vehicle"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "gold",
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/auth",
				children: "Sign in"
			})
		})]
	});
	if (access === "locked" || canPost && !canPost.can_post) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-md mx-auto px-6 py-24 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-2xl mb-2 gold-text",
			children: "Premium Required"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: canPost?.reason ?? "يجب تفعيل اشتراكك قبل نشر إعلان جديد."
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PremiumPaywallModal, {
		open: showPaywall,
		onOpenChange: setShowPaywall
	})] });
	const submit = async (e) => {
		e.preventDefault();
		if (photos.length === 0) {
			toast.error("Please upload at least one photo.");
			return;
		}
		setBusy(true);
		try {
			const photoPaths = [];
			for (const p of photos) {
				const path = `${user.id}/${Date.now()}-${p.name}`;
				const { error } = await supabase.storage.from("vehicle-media").upload(path, p);
				if (error) throw error;
				photoPaths.push(path);
			}
			let videoPath = null;
			if (video) {
				const path = `${user.id}/${Date.now()}-${video.name}`;
				const { error } = await supabase.storage.from("vehicle-media").upload(path, video);
				if (error) throw error;
				videoPath = path;
			}
			const auction_ends_at = f.price_type === "auction" ? new Date(Date.now() + f.auction_hours * 36e5).toISOString() : null;
			const { error } = await supabase.from("vehicles").insert({
				seller_id: user.id,
				brand: f.brand,
				model: f.model,
				year: f.year,
				mileage: f.mileage,
				engine_type: f.engine_type || null,
				fuel_type: f.fuel_type,
				transmission: f.transmission,
				wilaya: f.wilaya,
				phone: f.phone,
				description: f.description,
				photos: photoPaths,
				video_url: videoPath,
				price_type: f.price_type,
				fixed_price: f.price_type === "fixed" ? f.fixed_price : null,
				starting_price: f.price_type === "auction" ? f.starting_price : null,
				auction_ends_at
			});
			if (error) throw error;
			toast.success("تم استلام إعلانك · بانتظار مراجعة الإدارة");
			navigate({ to: "/my-listings" });
		} catch (e) {
			toast.error(e.message ?? "Failed to list vehicle");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-3xl mx-auto px-4 sm:px-6 py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-8 flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-12 w-12 rounded-xl gold-gradient grid place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Car, { className: "h-6 w-6 text-gold-foreground" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "List your vehicle"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Strictly vehicles only — listings violating this policy will be removed."
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					title: `Photos & Video · ${photos.length}/${MAX_PHOTOS}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							onDrop: handleDrop,
							onDragOver: (e) => e.preventDefault(),
							className: "border-2 border-dashed border-gold/30 rounded-xl p-6 text-center bg-charcoal/30 hover:border-gold/60 transition cursor-pointer",
							onClick: () => fileInputRef.current?.click(),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "h-10 w-10 mx-auto text-gold/60 mb-2" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm text-muted-foreground",
									children: "Drag & drop photos here, or click to browse"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-gold/60 mt-1",
									children: [
										"Up to ",
										MAX_PHOTOS,
										" photos · Auto-compressed"
									]
								}),
								compressing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-gold mt-2",
									children: "Compressing images…"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: fileInputRef,
									type: "file",
									accept: "image/*",
									multiple: true,
									className: "hidden",
									onChange: (e) => handleFiles(e.target.files ?? [])
								})
							]
						}),
						photos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2",
							children: photos.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								draggable: true,
								onDragStart: () => setDraggedIdx(i),
								onDragOver: (e) => handleDragOver(e, i),
								onDragEnd: () => setDraggedIdx(null),
								className: `relative aspect-square rounded-lg overflow-hidden border-2 transition cursor-grab ${i === 0 ? "border-gold" : draggedIdx === i ? "border-gold/60" : "border-transparent hover:border-gold/40"}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: URL.createObjectURL(p),
										className: "h-full w-full object-cover",
										alt: "",
										loading: "lazy"
									}),
									i === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "absolute bottom-0 left-0 right-0 bg-gold/90 text-black text-[8px] text-center py-0.5",
										children: "Cover"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "absolute top-0.5 left-0.5 opacity-0 hover:opacity-100 transition",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, { className: "h-4 w-4 text-white drop-shadow" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: (e) => {
											e.stopPropagation();
											setPhotos(photos.filter((_, j) => j !== i));
										},
										className: "absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/80 grid place-items-center hover:bg-destructive transition",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" })
									})
								]
							}, i))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs uppercase tracking-widest text-muted-foreground",
								children: "Vertical video (optional, for Reels)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "file",
								accept: "video/*",
								className: "mt-2 block w-full text-sm",
								onChange: (e) => setVideo(e.target.files?.[0] ?? null)
							}),
							video && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground mt-1",
								children: video.name
							})
						] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					title: "Vehicle Details",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Brand",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: f.brand,
										onValueChange: (v) => setF({
											...f,
											brand: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "bg-charcoal",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select brand" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: BRANDS.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: b,
											children: b
										}, b)) })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Model",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "bg-charcoal",
										required: true,
										value: f.model,
										onChange: (e) => setF({
											...f,
											model: e.target.value
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Year",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										className: "bg-charcoal",
										required: true,
										value: f.year,
										onChange: (e) => setF({
											...f,
											year: Number(e.target.value)
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Mileage (km)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										className: "bg-charcoal",
										required: true,
										value: f.mileage,
										onChange: (e) => setF({
											...f,
											mileage: Number(e.target.value)
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Engine",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "bg-charcoal",
										placeholder: "e.g. 1.6 TDI",
										value: f.engine_type,
										onChange: (e) => setF({
											...f,
											engine_type: e.target.value
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Fuel Type",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: f.fuel_type,
										onValueChange: (v) => setF({
											...f,
											fuel_type: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "bg-charcoal",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
											"Diesel",
											"Essence",
											"GPL",
											"Hybrid",
											"Electrique"
										].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: x,
											children: x
										}, x)) })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Transmission",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: f.transmission,
										onValueChange: (v) => setF({
											...f,
											transmission: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "bg-charcoal",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Manuelle",
											children: "Manuelle"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Automatique",
											children: "Automatique"
										})] })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Wilaya",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: f.wilaya,
										onValueChange: (v) => setF({
											...f,
											wilaya: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "bg-charcoal",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
											className: "max-h-72",
											children: WILAYAS.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: w,
												children: w
											}, w))
										})]
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Phone Number",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "bg-charcoal",
								required: true,
								placeholder: "+213 555 000 000",
								value: f.phone,
								onChange: (e) => setF({
									...f,
									phone: e.target.value
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Description",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								className: "bg-charcoal",
								rows: 4,
								value: f.description,
								onChange: (e) => setF({
									...f,
									description: e.target.value
								})
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					title: "Pricing",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioGroup, {
						value: f.price_type,
						onValueChange: (v) => setF({
							...f,
							price_type: v
						}),
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: `rounded-xl border p-4 cursor-pointer ${f.price_type === "fixed" ? "gold-border bg-gold-soft" : "border-border bg-charcoal"}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem, {
									value: "fixed",
									className: "sr-only"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold",
									children: "Fixed Price"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: "Prix Fixe"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: `rounded-xl border p-4 cursor-pointer ${f.price_type === "auction" ? "gold-border bg-gold-soft" : "border-border bg-charcoal"}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem, {
									value: "auction",
									className: "sr-only"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold",
									children: "Start a Bid"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: "Mise aux Enchères"
								})
							]
						})]
					}), f.price_type === "fixed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Price (DZD)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							className: "bg-charcoal",
							required: true,
							value: f.fixed_price,
							onChange: (e) => setF({
								...f,
								fixed_price: Number(e.target.value)
							})
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Starting Price (DZD)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								className: "bg-charcoal",
								required: true,
								value: f.starting_price,
								onChange: (e) => setF({
									...f,
									starting_price: Number(e.target.value)
								})
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Auction Duration",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: String(f.auction_hours),
								onValueChange: (v) => setF({
									...f,
									auction_hours: Number(v)
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "bg-charcoal",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "24",
										children: "24 Hours"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "48",
										children: "48 Hours"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "72",
										children: "3 Days"
									})
								] })]
							})
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "gold",
					className: "w-full h-12 text-base",
					disabled: busy,
					children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-4 w-4" }), " Publish Listing"]
				})
			]
		})]
	});
}
function Section({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "premium-card rounded-xl p-5 space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs uppercase tracking-[0.2em] text-gold",
			children: title
		}), children]
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
		className: "text-xs uppercase tracking-widest text-muted-foreground",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-1.5",
		children
	})] });
}
//#endregion
export { PostPage as component };
