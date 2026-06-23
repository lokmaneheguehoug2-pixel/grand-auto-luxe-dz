import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/compare-DGn_cp8p.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var KEY = "gal:compare";
var ids = (() => {
	if (typeof window === "undefined") return [];
	try {
		return JSON.parse(localStorage.getItem(KEY) ?? "[]");
	} catch {
		return [];
	}
})();
var listeners = /* @__PURE__ */ new Set();
function emit() {
	if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(ids));
	listeners.forEach((fn) => fn());
}
var compareStore = {
	get: () => ids,
	toggle: (id) => {
		if (ids.includes(id)) ids = ids.filter((x) => x !== id);
		else if (ids.length < 2) ids = [...ids, id];
		else ids = [ids[1], id];
		emit();
	},
	clear: () => {
		ids = [];
		emit();
	},
	remove: (id) => {
		ids = ids.filter((x) => x !== id);
		emit();
	}
};
function useCompare() {
	const [snap, setSnap] = (0, import_react.useState)(ids);
	(0, import_react.useEffect)(() => {
		const fn = () => setSnap([...ids]);
		listeners.add(fn);
		fn();
		return () => {
			listeners.delete(fn);
		};
	}, []);
	return snap;
}
//#endregion
export { useCompare as n, compareStore as t };
