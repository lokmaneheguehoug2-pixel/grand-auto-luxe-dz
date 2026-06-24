import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/client-ZItgt3Kh.js
function createSupabaseClient() {
	return createClient("https://dqdkuisbpmkviulgtrxk.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZGt1aXNicG1rdml1bGd0cnhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NzQ3MTYsImV4cCI6MjA5NzA1MDcxNn0.ph6c8LQ8ueTlm5X9Ts0IUeBZB6WOUCi5nlS__5JPFu4", { auth: {
		storage: typeof window !== "undefined" ? localStorage : void 0,
		persistSession: true,
		autoRefreshToken: true
	} });
}
var _supabase;
var supabase = new Proxy({}, { get(_, prop, receiver) {
	if (!_supabase) _supabase = createSupabaseClient();
	return Reflect.get(_supabase, prop, receiver);
} });
//#endregion
export { supabase as t };
