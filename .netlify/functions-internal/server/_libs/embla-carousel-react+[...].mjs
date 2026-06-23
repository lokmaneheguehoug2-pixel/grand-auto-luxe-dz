import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "./@floating-ui/react-dom+[...].mjs";
import { t as EmblaCarousel } from "./embla-carousel.mjs";
//#region node_modules/embla-carousel-reactive-utils/esm/embla-carousel-reactive-utils.esm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function isObject(subject) {
	return Object.prototype.toString.call(subject) === "[object Object]";
}
function isRecord(subject) {
	return isObject(subject) || Array.isArray(subject);
}
function canUseDOM() {
	return !!(typeof window !== "undefined" && window.document && window.document.createElement);
}
function areOptionsEqual(optionsA, optionsB) {
	const optionsAKeys = Object.keys(optionsA);
	const optionsBKeys = Object.keys(optionsB);
	if (optionsAKeys.length !== optionsBKeys.length) return false;
	if (JSON.stringify(Object.keys(optionsA.breakpoints || {})) !== JSON.stringify(Object.keys(optionsB.breakpoints || {}))) return false;
	return optionsAKeys.every((key) => {
		const valueA = optionsA[key];
		const valueB = optionsB[key];
		if (typeof valueA === "function") return `${valueA}` === `${valueB}`;
		if (!isRecord(valueA) || !isRecord(valueB)) return valueA === valueB;
		return areOptionsEqual(valueA, valueB);
	});
}
function sortAndMapPluginToOptions(plugins) {
	return plugins.concat().sort((a, b) => a.name > b.name ? 1 : -1).map((plugin) => plugin.options);
}
function arePluginsEqual(pluginsA, pluginsB) {
	if (pluginsA.length !== pluginsB.length) return false;
	const optionsA = sortAndMapPluginToOptions(pluginsA);
	const optionsB = sortAndMapPluginToOptions(pluginsB);
	return optionsA.every((optionA, index) => {
		const optionB = optionsB[index];
		return areOptionsEqual(optionA, optionB);
	});
}
//#endregion
//#region node_modules/embla-carousel-react/esm/embla-carousel-react.esm.js
function useEmblaCarousel(options = {}, plugins = []) {
	const storedOptions = (0, import_react.useRef)(options);
	const storedPlugins = (0, import_react.useRef)(plugins);
	const [emblaApi, setEmblaApi] = (0, import_react.useState)();
	const [viewport, setViewport] = (0, import_react.useState)();
	const reInit = (0, import_react.useCallback)(() => {
		if (emblaApi) emblaApi.reInit(storedOptions.current, storedPlugins.current);
	}, [emblaApi]);
	(0, import_react.useEffect)(() => {
		if (areOptionsEqual(storedOptions.current, options)) return;
		storedOptions.current = options;
		reInit();
	}, [options, reInit]);
	(0, import_react.useEffect)(() => {
		if (arePluginsEqual(storedPlugins.current, plugins)) return;
		storedPlugins.current = plugins;
		reInit();
	}, [plugins, reInit]);
	(0, import_react.useEffect)(() => {
		if (canUseDOM() && viewport) {
			EmblaCarousel.globalOptions = useEmblaCarousel.globalOptions;
			const newEmblaApi = EmblaCarousel(viewport, storedOptions.current, storedPlugins.current);
			setEmblaApi(newEmblaApi);
			return () => newEmblaApi.destroy();
		} else setEmblaApi(void 0);
	}, [viewport, setEmblaApi]);
	return [setViewport, emblaApi];
}
useEmblaCarousel.globalOptions = void 0;
//#endregion
export { useEmblaCarousel as t };
