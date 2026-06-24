import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-CSRoKnxW.mjs";
import { t as supabase } from "./client-Bi6lj-hW.mjs";
import { t as useAuth } from "./use-auth-BrGT0prV.mjs";
import { t as Input } from "./input-B9TG3aA4.mjs";
import { t as Textarea } from "./textarea-DkED4GNe.mjs";
import { t as Label } from "./label-DrCE_Ido.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { P as LoaderCircle, vt as ArrowLeft, x as Save } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as WILAYAS } from "./wilayas-B1ZbMp-l.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCm-LKYR.mjs";
import { t as Route } from "./edit-listing._id-2-tj2MCZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/edit-listing._id-BUIVDhpk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function EditListing() {
	const { id } = Route.useParams();
	const { user, loading } = useAuth();
	const navigate = useNavigate();
	const { data: v, isLoading } = useQuery({
		queryKey: ["vehicle-edit", id],
		queryFn: async () => {
			const { data, error } = await supabase.from("vehicles").select("*").eq("id", id).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	const [f, setF] = (0, import_react.useState)({
		model: "",
		description: "",
		phone: "",
		wilaya: "Alger",
		fixed_price: 0,
		starting_price: 0,
		paint_condition: "",
		documents_status: ""
	});
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (v) setF({
			model: v.model ?? "",
			description: v.description ?? "",
			phone: v.phone ?? "",
			wilaya: v.wilaya ?? "Alger",
			fixed_price: v.fixed_price ?? 0,
			starting_price: v.starting_price ?? 0,
			paint_condition: v.paint_condition ?? "",
			documents_status: v.documents_status ?? ""
		});
	}, [v]);
	if (loading || isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "py-24 text-center text-muted-foreground",
		children: "Loading…"
	});
	if (!user || !v) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "py-24 text-center text-muted-foreground",
		children: "Not found."
	});
	if (v.seller_id !== user.id) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "py-24 text-center text-muted-foreground",
		children: "You can only edit your own listings."
	});
	const save = async (e) => {
		e.preventDefault();
		setSaving(true);
		const patch = {
			model: f.model,
			description: f.description,
			phone: f.phone,
			wilaya: f.wilaya,
			paint_condition: f.paint_condition || null,
			documents_status: f.documents_status || null
		};
		if (v.price_type === "fixed") patch.fixed_price = f.fixed_price;
		else patch.starting_price = f.starting_price;
		const { error } = await supabase.from("vehicles").update(patch).eq("id", id);
		setSaving(false);
		if (error) return toast.error(error.message);
		toast.success("Listing updated");
		navigate({
			to: "/vehicle/$id",
			params: { id }
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-2xl mx-auto px-4 sm:px-6 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/my-listings",
				className: "inline-flex items-center text-xs text-muted-foreground hover:text-gold mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3 w-3 mr-1" }), " My Listings"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs uppercase tracking-[0.3em] text-gold mb-1",
					children: "Edit Listing"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "font-display text-3xl",
					children: [
						v.brand,
						" ",
						v.model
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: save,
				className: "premium-card rounded-2xl p-6 space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Model",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "bg-charcoal",
							value: f.model,
							onChange: (e) => setF({
								...f,
								model: e.target.value
							})
						})
					}),
					v.price_type === "fixed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Price (DZD)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							className: "bg-charcoal",
							value: f.fixed_price,
							onChange: (e) => setF({
								...f,
								fixed_price: Number(e.target.value)
							})
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Starting Price (DZD)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							className: "bg-charcoal",
							value: f.starting_price,
							onChange: (e) => setF({
								...f,
								starting_price: Number(e.target.value)
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Phone Number",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "bg-charcoal",
							value: f.phone,
							onChange: (e) => setF({
								...f,
								phone: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Wilaya",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: f.wilaya,
							onValueChange: (x) => setF({
								...f,
								wilaya: x
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
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Paint / Body Condition",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: f.paint_condition || "none",
							onValueChange: (x) => setF({
								...f,
								paint_condition: x === "none" ? "" : x
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "bg-charcoal",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "—" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "none",
									children: "— Unspecified —"
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
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Documents Status",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: f.documents_status || "none",
							onValueChange: (x) => setF({
								...f,
								documents_status: x === "none" ? "" : x
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "bg-charcoal",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "—" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "none",
									children: "— Unspecified —"
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
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Description",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							className: "bg-charcoal",
							rows: 5,
							value: f.description,
							onChange: (e) => setF({
								...f,
								description: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "gold",
						type: "submit",
						disabled: saving,
						className: "w-full h-12",
						children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }), " Save Changes"]
					})
				]
			})
		]
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
export { EditListing as component };
