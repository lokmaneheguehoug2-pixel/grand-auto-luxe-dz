import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as supabase } from "./client-Bi6lj-hW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-signed-url-7GRrwbbN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var cache = /* @__PURE__ */ new Map();
function useSignedUrl(bucket, path, expiresIn = 3600) {
	const [url, setUrl] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!path) {
			setUrl(null);
			return;
		}
		const key = `${bucket}/${path}`;
		const c = cache.get(key);
		if (c && c.exp > Date.now()) {
			setUrl(c.url);
			return;
		}
		supabase.storage.from(bucket).createSignedUrl(path, expiresIn).then(({ data }) => {
			if (data?.signedUrl) {
				cache.set(key, {
					url: data.signedUrl,
					exp: Date.now() + (expiresIn - 60) * 1e3
				});
				setUrl(data.signedUrl);
			}
		});
	}, [
		bucket,
		path,
		expiresIn
	]);
	return url;
}
async function signUrl(bucket, path, expiresIn = 3600) {
	const { data } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
	return data?.signedUrl ?? null;
}
//#endregion
export { useSignedUrl as n, signUrl as t };
