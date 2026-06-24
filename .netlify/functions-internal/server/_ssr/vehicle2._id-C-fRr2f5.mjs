import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as cn, t as Button } from "./button-CSRoKnxW.mjs";
import { t as supabase } from "./client-Bi6lj-hW.mjs";
import { t as useAuth } from "./use-auth-BrGT0prV.mjs";
import { n as useSignedUrl } from "./use-signed-url-7GRrwbbN.mjs";
import { n as formatCentimes, r as formatDZD } from "./format-DTUn6abU.mjs";
import { t as Input } from "./input-B9TG3aA4.mjs";
import { t as Textarea } from "./textarea-DkED4GNe.mjs";
import { t as Label } from "./label-DrCE_Ido.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { D as PenLine, E as Phone, G as Fuel, M as Mail, O as MessageSquare, P as LoaderCircle, U as Gavel, W as Gauge, _t as ArrowRight, c as Trophy, et as Cog, ft as Calendar, i as User, it as CircleCheckBig, j as MapPin, k as MessageCircle, tt as Clock, vt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogDescription, t as Dialog } from "./dialog-zroENDAE.mjs";
import { t as ChatDialog } from "./ChatDialog-CHwHeNBp.mjs";
import { n as SoldOverlay } from "./my-listings-BgCg75GG.mjs";
import { t as Route } from "./vehicle._id-Ddg050MR.mjs";
import { t as Countdown } from "./Countdown-CwiACDsk.mjs";
import { t as useEmblaCarousel } from "../_libs/embla-carousel-react+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/vehicle2._id-C-fRr2f5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CarouselContext = import_react.createContext(null);
function useCarousel() {
	const context = import_react.useContext(CarouselContext);
	if (!context) throw new Error("useCarousel must be used within a <Carousel />");
	return context;
}
var Carousel = import_react.forwardRef(({ orientation = "horizontal", opts, setApi, plugins, className, children, ...props }, ref) => {
	const [carouselRef, api] = useEmblaCarousel({
		...opts,
		axis: orientation === "horizontal" ? "x" : "y"
	}, plugins);
	const [canScrollPrev, setCanScrollPrev] = import_react.useState(false);
	const [canScrollNext, setCanScrollNext] = import_react.useState(false);
	const onSelect = import_react.useCallback((api) => {
		if (!api) return;
		setCanScrollPrev(api.canScrollPrev());
		setCanScrollNext(api.canScrollNext());
	}, []);
	const scrollPrev = import_react.useCallback(() => {
		api?.scrollPrev();
	}, [api]);
	const scrollNext = import_react.useCallback(() => {
		api?.scrollNext();
	}, [api]);
	const handleKeyDown = import_react.useCallback((event) => {
		if (event.key === "ArrowLeft") {
			event.preventDefault();
			scrollPrev();
		} else if (event.key === "ArrowRight") {
			event.preventDefault();
			scrollNext();
		}
	}, [scrollPrev, scrollNext]);
	import_react.useEffect(() => {
		if (!api || !setApi) return;
		setApi(api);
	}, [api, setApi]);
	import_react.useEffect(() => {
		if (!api) return;
		onSelect(api);
		api.on("reInit", onSelect);
		api.on("select", onSelect);
		return () => {
			api?.off("select", onSelect);
		};
	}, [api, onSelect]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarouselContext.Provider, {
		value: {
			carouselRef,
			api,
			opts,
			orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
			scrollPrev,
			scrollNext,
			canScrollPrev,
			canScrollNext
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref,
			onKeyDownCapture: handleKeyDown,
			className: cn("relative", className),
			role: "region",
			"aria-roledescription": "carousel",
			...props,
			children
		})
	});
});
Carousel.displayName = "Carousel";
var CarouselContent = import_react.forwardRef(({ className, ...props }, ref) => {
	const { carouselRef, orientation } = useCarousel();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: carouselRef,
		className: "overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref,
			className: cn("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", className),
			...props
		})
	});
});
CarouselContent.displayName = "CarouselContent";
var CarouselItem = import_react.forwardRef(({ className, ...props }, ref) => {
	const { orientation } = useCarousel();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		role: "group",
		"aria-roledescription": "slide",
		className: cn("min-w-0 shrink-0 grow-0 basis-full", orientation === "horizontal" ? "pl-4" : "pt-4", className),
		...props
	});
});
CarouselItem.displayName = "CarouselItem";
var CarouselPrevious = import_react.forwardRef(({ className, variant = "outline", size = "icon", ...props }, ref) => {
	const { orientation, scrollPrev, canScrollPrev } = useCarousel();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		ref,
		variant,
		size,
		className: cn("absolute  h-8 w-8 rounded-full", orientation === "horizontal" ? "-left-12 top-1/2 -translate-y-1/2" : "-top-12 left-1/2 -translate-x-1/2 rotate-90", className),
		disabled: !canScrollPrev,
		onClick: scrollPrev,
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Previous slide"
		})]
	});
});
CarouselPrevious.displayName = "CarouselPrevious";
var CarouselNext = import_react.forwardRef(({ className, variant = "outline", size = "icon", ...props }, ref) => {
	const { orientation, scrollNext, canScrollNext } = useCarousel();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		ref,
		variant,
		size,
		className: cn("absolute h-8 w-8 rounded-full", orientation === "horizontal" ? "-right-12 top-1/2 -translate-y-1/2" : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90", className),
		disabled: !canScrollNext,
		onClick: scrollNext,
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Next slide"
		})]
	});
});
CarouselNext.displayName = "CarouselNext";
function AppointmentBooking({ vehicleId, sellerId, vehicleName }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [success, setSuccess] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		client_name: "",
		client_phone: "",
		client_email: "",
		preferred_date: "",
		preferred_time: "",
		message: ""
	});
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!form.client_name || !form.client_phone) {
			toast.error("Please fill in your name and phone number");
			return;
		}
		setLoading(true);
		try {
			const { error } = await supabase.from("appointments").insert({
				vehicle_id: vehicleId,
				seller_id: sellerId,
				client_name: form.client_name,
				client_phone: form.client_phone,
				client_email: form.client_email || null,
				preferred_date: form.preferred_date || null,
				preferred_time: form.preferred_time || null,
				message: form.message || null
			});
			if (error) throw error;
			setSuccess(true);
			toast.success("Appointment request sent successfully!");
			setTimeout(() => {
				setOpen(false);
				setSuccess(false);
				setForm({
					client_name: "",
					client_phone: "",
					client_email: "",
					preferred_date: "",
					preferred_time: "",
					message: ""
				});
			}, 2e3);
		} catch (err) {
			console.error(err);
			toast.error("Failed to send appointment request");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		variant: "gold",
		size: "lg",
		className: "w-full",
		onClick: () => setOpen(true),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-5 w-5 mr-2" }), "Book a Viewing"]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-5 w-5 text-gold" }), "Book a Viewing Appointment"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: ["Request a viewing for ", vehicleName] })] }), success ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center py-8 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-16 w-16 text-green-500" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center font-medium",
						children: "Appointment Request Sent!"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-sm text-muted-foreground",
						children: "The seller will contact you shortly."
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "client_name",
							children: "Your Name *"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "client_name",
								placeholder: "Your full name",
								className: "pl-9",
								value: form.client_name,
								onChange: (e) => setForm({
									...form,
									client_name: e.target.value
								}),
								required: true
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "client_phone",
							children: "Phone Number *"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "client_phone",
								placeholder: "+213 555 00 00 00",
								className: "pl-9",
								value: form.client_phone,
								onChange: (e) => setForm({
									...form,
									client_phone: e.target.value
								}),
								required: true
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "client_email",
							children: "Email (optional)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "client_email",
								type: "email",
								placeholder: "your@email.com",
								className: "pl-9",
								value: form.client_email,
								onChange: (e) => setForm({
									...form,
									client_email: e.target.value
								})
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "preferred_date",
								children: "Preferred Date"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "preferred_date",
								type: "date",
								value: form.preferred_date,
								onChange: (e) => setForm({
									...form,
									preferred_date: e.target.value
								}),
								min: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "preferred_time",
								children: "Preferred Time"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "preferred_time",
									type: "time",
									className: "pl-9",
									value: form.preferred_time,
									onChange: (e) => setForm({
										...form,
										preferred_time: e.target.value
									})
								})]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "message",
							children: "Message (optional)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "message",
								placeholder: "Any specific questions or requests...",
								className: "pl-9 min-h-[80px]",
								value: form.message,
								onChange: (e) => setForm({
									...form,
									message: e.target.value
								})
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						variant: "gold",
						className: "w-full",
						disabled: loading,
						children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }), "Sending..."] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4 mr-2" }), "Submit Request"] })
					})
				]
			})]
		})
	})] });
}
/** Algerian phone helpers — accept "05XXXXXXXX" or "+213..." and produce dial/whatsapp formats. */
function normalizeAlgPhone(raw) {
	const digits = (raw ?? "").replace(/\D/g, "");
	if (digits.startsWith("213")) return `+${digits}`;
	if (digits.startsWith("0")) return `+213${digits.slice(1)}`;
	return `+213${digits}`;
}
function toWhatsApp(raw) {
	return normalizeAlgPhone(raw).replace(/\D/g, "");
}
function VehicleDetail() {
	const { id } = Route.useParams();
	const { user, access } = useAuth();
	const qc = useQueryClient();
	const { data: v } = useQuery({
		queryKey: ["vehicle", id],
		queryFn: async () => {
			const { data, error } = await supabase.from("vehicles").select("*").eq("id", id).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	const { data: bids = [] } = useQuery({
		queryKey: ["bids", id],
		queryFn: async () => {
			const { data } = await supabase.from("bids").select("*").eq("vehicle_id", id).order("amount", { ascending: false }).limit(10);
			return data ?? [];
		},
		refetchInterval: 5e3
	});
	if (!v) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "max-w-5xl mx-auto px-6 py-20 text-center text-muted-foreground",
		children: "Loading…"
	});
	const isAuction = v.price_type === "auction";
	const auctionEnded = isAuction && v.auction_ends_at && new Date(v.auction_ends_at) <= /* @__PURE__ */ new Date();
	const price = isAuction ? v.current_highest_bid ?? v.starting_price : v.fixed_price;
	const isSeller = user?.id === v.seller_id;
	const isWinner = user?.id === v.current_highest_bidder;
	const showOwnerNumber = !isAuction ? access !== "locked" : auctionEnded ? isSeller || isWinner : access !== "locked" && !isSeller;
	const refresh = () => {
		qc.invalidateQueries({ queryKey: ["vehicle", id] });
		qc.invalidateQueries({ queryKey: ["bids", id] });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "max-w-6xl mx-auto px-4 sm:px-6 py-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid lg:grid-cols-[1.4fr_1fr] gap-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [v.photos && v.photos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Carousel, {
						className: "w-full",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarouselContent, { children: v.photos.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarouselItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Photo, { path: p }) }, i)) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarouselPrevious, { className: "left-3 bg-black/70 border-gold/40 text-gold hover:bg-black/90" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarouselNext, { className: "right-3 bg-black/70 border-gold/40 text-gold hover:bg-black/90" })
						]
					}), v.status === "sold" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 rounded-2xl overflow-hidden pointer-events-none",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoldOverlay, {})
					})]
				}), v.video_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { path: v.video_url })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:sticky lg:top-20 self-start space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs uppercase tracking-widest text-gold",
							children: v.wilaya
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "font-display text-4xl mt-1",
							children: [
								v.brand,
								" ",
								v.model
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 text-sm text-muted-foreground",
							children: v.year
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "premium-card rounded-2xl p-5",
						children: isAuction ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] uppercase tracking-widest text-gold mb-1",
								children: "Current Highest Bid"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "gold-text font-display text-4xl font-bold",
								children: formatDZD(price)
							}),
							!auctionEnded && v.auction_ends_at && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex items-center justify-between text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Auction ends in"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Countdown, {
									endsAt: v.auction_ends_at,
									className: "text-gold font-semibold"
								})]
							}),
							auctionEnded ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-lg border border-premium-red/40 bg-premium-red/10 px-3 py-2 text-sm text-destructive font-semibold text-center",
									children: "Bidding Closed"
								}), isSeller && v.current_highest_bidder && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactWinner, {
									vehicleId: id,
									winnerId: v.current_highest_bidder
								})]
							}) : user && !isSeller && access !== "locked" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BidDialog, {
								vehicleId: id,
								currentHighest: v.current_highest_bid ?? v.starting_price,
								onPlaced: refresh
							})
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] uppercase tracking-widest text-gold mb-1",
								children: "Price"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "gold-text font-display text-4xl font-bold",
								children: formatDZD(price)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-gold/70 mt-1",
								children: formatCentimes(price)
							})
						] })
					}),
					isSeller && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "gold",
						className: "h-12 w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/edit-listing/$id",
							params: { id },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "h-4 w-4" }), " تعديل الإعلان · Edit Listing"]
						})
					}),
					!isSeller && showOwnerNumber && v.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "gold",
							className: "h-12",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: `tel:${normalizeAlgPhone(v.phone)}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-4 w-4" }), " Call Owner"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "gold-outline",
							className: "h-12",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: `https://wa.me/${toWhatsApp(v.phone)}`,
								target: "_blank",
								rel: "noopener noreferrer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-4 w-4" }), " WhatsApp"]
							})
						})]
					}),
					user && !isSeller && access !== "locked" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatDialog, {
						vehicleId: id,
						sellerId: v.seller_id,
						vehicleTitle: `${v.brand} ${v.model}`
					}),
					!isSeller && !v.is_auction && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppointmentBooking, {
						vehicleId: id,
						sellerId: v.seller_id,
						vehicleName: `${v.brand} ${v.model}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/seller/$id",
						params: { id: v.seller_id },
						className: "block premium-card rounded-2xl p-4 hover:gold-border transition-all",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] uppercase tracking-widest text-gold mb-1",
							children: "Seller Profile"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm",
							children: "View seller's other listings →"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "premium-card rounded-2xl p-5 grid grid-cols-2 gap-4 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spec, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4" }),
								label: "Year",
								value: v.year
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spec, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, { className: "h-4 w-4" }),
								label: "Mileage",
								value: `${v.mileage.toLocaleString()} km`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spec, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fuel, { className: "h-4 w-4" }),
								label: "Fuel",
								value: v.fuel_type
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spec, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cog, { className: "h-4 w-4" }),
								label: "Transmission",
								value: v.transmission
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spec, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4" }),
								label: "Wilaya",
								value: v.wilaya
							}),
							v.engine_type && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spec, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cog, { className: "h-4 w-4" }),
								label: "Engine",
								value: v.engine_type
							})
						]
					}),
					v.description && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "premium-card rounded-2xl p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs uppercase tracking-widest text-gold mb-2",
							children: "Description"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap",
							children: v.description
						})]
					}),
					isAuction && bids.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "premium-card rounded-2xl p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs uppercase tracking-widest text-gold mb-3 flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gavel, { className: "h-3 w-3" }), " Bid History"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: bids.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between text-sm border-b border-border/50 pb-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: new Date(b.created_at).toLocaleString()
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold gold-text",
									children: formatDZD(b.amount)
								})]
							}, b.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-block text-xs text-muted-foreground hover:text-gold",
						children: "← Back to marketplace"
					})
				]
			})]
		})
	});
}
function Photo({ path }) {
	const url = useSignedUrl("vehicle-media", path);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-2xl overflow-hidden bg-charcoal aspect-[4/3]",
		children: url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: url,
			className: "h-full w-full object-cover",
			alt: ""
		})
	});
}
function Video({ path }) {
	const url = useSignedUrl("vehicle-media", path);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-2xl overflow-hidden bg-charcoal",
		children: url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
			src: url,
			controls: true,
			className: "w-full h-auto"
		})
	});
}
function Spec({ icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start gap-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-gold mt-0.5",
			children: icon
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] uppercase tracking-widest text-muted-foreground",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-medium truncate",
				children: value
			})]
		})]
	});
}
function BidDialog({ vehicleId, currentHighest, onPlaced }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [amount, setAmount] = (0, import_react.useState)(currentHighest + 1e4);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const { user } = useAuth();
	const place = async () => {
		if (!user) return;
		if (amount <= currentHighest) {
			toast.error("Bid must be higher than the current highest bid.");
			return;
		}
		setBusy(true);
		const { error } = await supabase.from("bids").insert({
			vehicle_id: vehicleId,
			bidder_id: user.id,
			amount
		});
		setBusy(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Bid placed.");
		setOpen(false);
		onPlaced();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "gold",
				className: "w-full mt-4 h-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gavel, { className: "h-4 w-4" }), " Place a Bid"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "bg-card border-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				className: "font-display",
				children: "Place your bid"
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-sm text-muted-foreground",
						children: ["Current highest: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "gold-text font-semibold",
							children: formatDZD(currentHighest)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						className: "bg-charcoal",
						value: amount,
						onChange: (e) => setAmount(Number(e.target.value))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "gold",
						className: "w-full",
						disabled: busy,
						onClick: place,
						children: "Confirm Bid"
					})
				]
			})]
		})]
	});
}
function ContactWinner({ vehicleId, winnerId }) {
	const [revealed, setRevealed] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const reveal = async () => {
		setBusy(true);
		const { data } = await supabase.from("profiles").select("phone, first_name, last_name").eq("id", winnerId).maybeSingle();
		setBusy(false);
		if (data?.phone) setRevealed(`${data.first_name} ${data.last_name} · ${data.phone}`);
		else toast.error("Could not retrieve winner contact.");
	};
	return revealed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 rounded-xl gold-border p-4 bg-gold-soft",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 text-xs uppercase tracking-widest text-gold mb-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "h-3 w-3" }), " Winning Bidder"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-semibold",
			children: revealed
		})]
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		variant: "gold",
		className: "w-full mt-3 h-12",
		disabled: busy,
		onClick: reveal,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "h-4 w-4" }), " Contact the Winning Bidder"]
	});
}
//#endregion
export { VehicleDetail as component };
