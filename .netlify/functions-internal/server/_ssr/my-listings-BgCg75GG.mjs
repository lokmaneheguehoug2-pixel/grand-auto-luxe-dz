import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/my-listings-BgCg75GG.js
var import_jsx_runtime = require_jsx_runtime();
var $$splitComponentImporter = () => import("./my-listings-QI6IeL8D.mjs");
var Route = createFileRoute("/my-listings")({
	head: () => ({ meta: [{ title: "My Listings · GRAND Auto Luxe" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
function SoldOverlay() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 grid place-items-center bg-black/55 backdrop-blur-[2px] pointer-events-none",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rotate-[-12deg] border-2 border-gold bg-gold/20 backdrop-blur-md px-6 py-2 rounded-md gold-glow",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-display text-2xl gold-shine font-bold tracking-widest",
				children: "SOLD"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] text-gold text-center tracking-[0.3em]",
				children: "تم البيع"
			})]
		})
	});
}
//#endregion
export { SoldOverlay as n, Route as t };
