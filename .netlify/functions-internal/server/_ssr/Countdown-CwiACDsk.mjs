import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Countdown-CwiACDsk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Countdown({ endsAt, className = "" }) {
	const [now, setNow] = (0, import_react.useState)(Date.now());
	(0, import_react.useEffect)(() => {
		const id = setInterval(() => setNow(Date.now()), 1e3);
		return () => clearInterval(id);
	}, []);
	const diff = new Date(endsAt).getTime() - now;
	if (diff <= 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `text-premium-red font-semibold ${className}`,
		children: "Bidding Closed"
	});
	const h = Math.floor(diff / 36e5);
	const m = Math.floor(diff % 36e5 / 6e4);
	const s = Math.floor(diff % 6e4 / 1e3);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `tabular-nums font-mono tracking-wider ${className}`,
		children: [
			String(h).padStart(2, "0"),
			"h ",
			String(m).padStart(2, "0"),
			"m ",
			String(s).padStart(2, "0"),
			"s"
		]
	});
}
//#endregion
export { Countdown as t };
