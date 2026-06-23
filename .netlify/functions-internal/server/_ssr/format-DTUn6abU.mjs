//#region node_modules/.nitro/vite/services/ssr/assets/format-DTUn6abU.js
var fmt = new Intl.NumberFormat("fr-DZ");
var formatDZD = (n) => {
	if (n == null) return "—";
	if (n >= 1e4) {
		const m = n * 100 / 1e6;
		const rounded = Number.isInteger(m) ? m : Number(m.toFixed(1));
		return `${fmt.format(rounded)} Millions DZD`;
	}
	return `${fmt.format(n)} DZD`;
};
var formatCentimes = (dzd) => {
	if (dzd == null) return "—";
	return `${fmt.format(dzd)} DZD`;
};
var formatAlgerianPrice = (dzd) => {
	if (dzd == null) return "—";
	return `${formatDZD(dzd)} · ${formatCentimes(dzd)}`;
};
var normalizePhone = (raw) => raw.replace(/\s|-/g, "");
var phoneToEmail = (phone) => `${normalizePhone(phone).replace(/[^0-9+]/g, "")}@grandauto.local`;
//#endregion
export { phoneToEmail as a, normalizePhone as i, formatCentimes as n, formatDZD as r, formatAlgerianPrice as t };
