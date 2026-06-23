import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-Bi6lj-hW.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-auth-BrGT0prV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useAuth() {
	const [session, setSession] = (0, import_react.useState)(null);
	const [user, setUser] = (0, import_react.useState)(null);
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [isAdmin, setIsAdmin] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [, setTick] = (0, import_react.useState)(0);
	const loadProfile = (0, import_react.useCallback)(async (uid) => {
		const [{ data: p }, { data: roles }] = await Promise.all([supabase.from("profiles").select("*").eq("id", uid).maybeSingle(), supabase.from("user_roles").select("role").eq("user_id", uid)]);
		setProfile(p);
		setIsAdmin(!!roles?.some((r) => r.role === "admin"));
	}, []);
	(0, import_react.useEffect)(() => {
		const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
			setSession(s);
			setUser(s?.user ?? null);
			if (s?.user) setTimeout(() => loadProfile(s.user.id), 0);
			else {
				setProfile(null);
				setIsAdmin(false);
			}
		});
		supabase.auth.getSession().then(({ data }) => {
			setSession(data.session);
			setUser(data.session?.user ?? null);
			if (data.session?.user) loadProfile(data.session.user.id).finally(() => setLoading(false));
			else setLoading(false);
		});
		return () => sub.subscription.unsubscribe();
	}, [loadProfile]);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		const channel = supabase.channel(`profile:${user.id}`).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "profiles",
			filter: `id=eq.${user.id}`
		}, () => loadProfile(user.id)).subscribe();
		const interval = setInterval(() => setTick((t) => t + 1), 6e4);
		return () => {
			supabase.removeChannel(channel);
			clearInterval(interval);
		};
	}, [user, loadProfile]);
	const signOut = (0, import_react.useCallback)(async () => {
		await supabase.auth.signOut();
	}, []);
	let access = "locked";
	let hoursLeft = 0;
	if (profile) if (profile.subscription_status === "active" && profile.subscription_until && new Date(profile.subscription_until) > /* @__PURE__ */ new Date()) {
		access = "active";
		hoursLeft = Math.ceil((new Date(profile.subscription_until).getTime() - Date.now()) / (3600 * 1e3));
	} else {
		const trialEnds = new Date(new Date(profile.trial_started_at).getTime() + 4320 * 60 * 1e3);
		if (trialEnds > /* @__PURE__ */ new Date()) {
			access = "trial";
			hoursLeft = Math.ceil((trialEnds.getTime() - Date.now()) / (3600 * 1e3));
		} else access = "locked";
	}
	return {
		session,
		user,
		profile,
		isAdmin,
		loading,
		signOut,
		access,
		hoursLeft,
		reloadProfile: () => user && loadProfile(user.id)
	};
}
//#endregion
export { useAuth as t };
