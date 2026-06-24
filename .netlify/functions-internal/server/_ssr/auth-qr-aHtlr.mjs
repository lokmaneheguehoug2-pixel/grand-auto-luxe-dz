import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-CSRoKnxW.mjs";
import { t as supabase } from "./client-Bi6lj-hW.mjs";
import { a as phoneToEmail, i as normalizePhone } from "./format-DTUn6abU.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-B5sbP7os.mjs";
import { t as Input } from "./input-B9TG3aA4.mjs";
import { t as Label } from "./label-DrCE_Ido.mjs";
import { P as LoaderCircle, at as CircleAlert, f as Tag } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-qr-aHtlr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TRANSLATIONS = {
	ar: {
		title: "الدخول إلى سوق السيارات الفاخرة الجزائري.",
		subtitle: "3 أيام مجانا. مزادات مباشرة، بائعين موثقين، وتواصل مباشر مع الملاك عبر كل الولايات.",
		membership: "العضوية",
		signin: "تسجيل الدخول",
		signup: "إنشاء حساب",
		phone: "رقم الهاتف",
		password: "كلمة السر",
		firstName: "الاسم",
		lastName: "اللقب",
		dob: "تاريخ الميلاد",
		pob: "مكان الميلاد",
		invalid: "رقم الهاتف أو كلمة السر غير صحيحة.",
		alreadyRegistered: "هذا الرقم مسجل بحساب آخر.",
		startTrial: "ابدأ تجربة مجانية 3 أيام",
		trialNote: "باستمرارك، توافق على الشروط. التجربة صالحة 72 ساعة.",
		promoPlaceholder: "كود ترويجي (اختياري)",
		welcome: "مرحباً بعودتك.",
		welcomeNew: "مرحباً بك في GRAND Auto Luxe. بدأت تجربتك المجانية."
	},
	en: {
		title: "Enter the premium Algerian auto market.",
		subtitle: "3 days free. Live auctions, verified sellers, direct contact with owners across all wilayas.",
		membership: "Membership",
		signin: "Sign In",
		signup: "Create Account",
		phone: "Phone Number",
		password: "Password",
		firstName: "First Name",
		lastName: "Last Name",
		dob: "Date of Birth",
		pob: "Place of Birth",
		invalid: "Invalid phone number or password.",
		alreadyRegistered: "This phone number is already registered.",
		startTrial: "Start 3-Day Free Trial",
		trialNote: "By signing up you agree to our terms. Trial valid for 72 hours.",
		promoPlaceholder: "Promo code (optional)",
		welcome: "Welcome back.",
		welcomeNew: "Welcome to GRAND Auto Luxe. Your 3-day free trial has started."
	},
	fr: {
		title: "Accédez au marché automobile algérien premium.",
		subtitle: "3 jours gratuits. Enchères en direct, vendeurs vérifiés, contact direct avec les propriétaires.",
		membership: "Adhésion",
		signin: "Connexion",
		signup: "Créer un compte",
		phone: "Numéro de téléphone",
		password: "Mot de passe",
		firstName: "Prénom",
		lastName: "Nom",
		dob: "Date de naissance",
		pob: "Lieu de naissance",
		invalid: "Numéro ou mot de passe invalide.",
		alreadyRegistered: "Ce numéro est déjà enregistré.",
		startTrial: "Commencer l'essai gratuit de 3 jours",
		trialNote: "En vous inscrivant, vous acceptez les termes. Essai valable 72h.",
		promoPlaceholder: "Code promo (optionnel)",
		welcome: "Bienvenue.",
		welcomeNew: "Bienvenue sur GRAND Auto Luxe. Votre essai gratuit de 3 jours a commencé."
	}
};
function AuthPage() {
	const [lang, setLang] = (0, import_react.useState)("ar");
	const t = TRANSLATIONS[lang];
	const isRtl = lang === "ar";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen grid lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative hidden lg:flex flex-col justify-between p-12 bg-charcoal overflow-hidden",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.25),transparent_50%)]" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "relative flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/my-logo.png.PNG",
						alt: "GRANDA Auto Luxe",
						className: "h-12 w-12 rounded-lg object-contain"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "font-display text-xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "gold-text",
								children: "GRAND"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-gold/80",
								children: "A"
							}),
							" Auto Luxe"
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs uppercase tracking-[0.3em] text-gold mb-4",
							children: t.membership
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "font-display text-5xl leading-tight mb-4",
							children: [
								t.title.split("premium")[0],
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "gold-text",
									children: "premium"
								}),
								t.title.split("premium")[1]
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted-foreground max-w-md",
							children: t.subtitle
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative text-xs text-muted-foreground",
					children: "Vehicles only · No real estate · No electronics"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center justify-center p-6 sm:p-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-end w-full max-w-md mb-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "inline-flex rounded-full border border-gold/30 bg-black/50 p-1",
					children: [
						"ar",
						"en",
						"fr"
					].map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setLang(l),
						className: `px-3 py-1.5 rounded-full text-xs transition ${lang === l ? "bg-gold text-black" : "text-white/60 hover:text-white"}`,
						children: l === "ar" ? "العربية" : l === "en" ? "English" : "Français"
					}, l))
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-full max-w-md",
				dir: isRtl ? "rtl" : "ltr",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
					defaultValue: "signin",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
							className: "grid grid-cols-2 mb-6 bg-charcoal border border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "signin",
								className: "data-[state=active]:bg-gold data-[state=active]:text-gold-foreground",
								children: t.signin
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "signup",
								className: "data-[state=active]:bg-gold data-[state=active]:text-gold-foreground",
								children: t.signup
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "signin",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignIn, { t })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "signup",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignUp, { t })
						})
					]
				})
			})]
		})]
	});
}
function SignIn({ t }) {
	const navigate = useNavigate();
	const [phone, setPhone] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [err, setErr] = (0, import_react.useState)(null);
	const submit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setErr(null);
		const normalizedPhone = normalizePhone(phone);
		if ((normalizedPhone === "0781606765" || normalizedPhone === "+213781606765" || normalizedPhone === "213781606765") && password === "Admin2024!") {
			const { error } = await supabase.auth.signInWithPassword({
				email: "0781606765@grandauto.local",
				password
			});
			if (error) {
				setLoading(false);
				setErr("Password setup required. Please try signing up first with this phone number, then contact support to grant admin access.");
				return;
			}
			toast.success(t.welcome);
			navigate({ to: "/" });
			return;
		}
		const { error } = await supabase.auth.signInWithPassword({
			email: phoneToEmail(phone),
			password
		});
		setLoading(false);
		if (error) {
			setErr(t.invalid);
			return;
		}
		toast.success(t.welcome);
		navigate({ to: "/" });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: submit,
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				className: "text-xs uppercase tracking-widest text-muted-foreground",
				children: t.phone
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "mt-1.5 bg-charcoal border-border",
				placeholder: "+213 555 000 000",
				value: phone,
				onChange: (e) => setPhone(e.target.value),
				required: true
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				className: "text-xs uppercase tracking-widest text-muted-foreground",
				children: t.password
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				type: "password",
				className: "mt-1.5 bg-charcoal border-border",
				value: password,
				onChange: (e) => setPassword(e.target.value),
				required: true
			})] }),
			err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBox, { children: err }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "gold",
				className: "w-full h-11",
				disabled: loading,
				children: [
					loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
					" ",
					t.signin
				]
			})
		]
	});
}
function SignUp({ t }) {
	const navigate = useNavigate();
	const [f, setF] = (0, import_react.useState)({
		first_name: "",
		last_name: "",
		dob: "",
		place_of_birth: "",
		phone: "",
		password: "",
		promo: ""
	});
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [err, setErr] = (0, import_react.useState)(null);
	const submit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setErr(null);
		const phone = normalizePhone(f.phone);
		const { data: existing } = await supabase.from("profiles").select("id").eq("phone", phone).maybeSingle();
		if (existing) {
			setLoading(false);
			setErr(t.alreadyRegistered);
			return;
		}
		const { error } = await supabase.auth.signUp({
			email: phoneToEmail(phone),
			password: f.password,
			options: {
				emailRedirectTo: `${window.location.origin}/`,
				data: {
					first_name: f.first_name,
					last_name: f.last_name,
					dob: f.dob,
					place_of_birth: f.place_of_birth,
					phone
				}
			}
		});
		if (error) {
			const msg = error.message?.toLowerCase() ?? "";
			if (msg.includes("phone") || msg.includes("duplicate") || msg.includes("unique") || msg.includes("registered") || msg.includes("already")) setErr(t.alreadyRegistered);
			else setErr(error.message);
			setLoading(false);
			return;
		}
		if (f.promo.trim()) {
			const { data: userData } = await supabase.auth.getUser();
			if (userData.user) await supabase.rpc("apply_promo_code", {
				p_user_id: userData.user.id,
				p_code: f.promo.trim().toUpperCase()
			});
		}
		setLoading(false);
		toast.success(t.welcomeNew);
		navigate({ to: "/" });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: submit,
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: t.firstName,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "bg-charcoal border-border",
						required: true,
						value: f.first_name,
						onChange: (e) => setF({
							...f,
							first_name: e.target.value
						})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: t.lastName,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "bg-charcoal border-border",
						required: true,
						value: f.last_name,
						onChange: (e) => setF({
							...f,
							last_name: e.target.value
						})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: t.dob,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "date",
					className: "bg-charcoal border-border",
					required: true,
					value: f.dob,
					onChange: (e) => setF({
						...f,
						dob: e.target.value
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: t.pob,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "bg-charcoal border-border",
					required: true,
					placeholder: "e.g. Alger",
					value: f.place_of_birth,
					onChange: (e) => setF({
						...f,
						place_of_birth: e.target.value
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: t.phone,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "bg-charcoal border-border",
					required: true,
					placeholder: "+213 555 000 000",
					value: f.phone,
					onChange: (e) => setF({
						...f,
						phone: e.target.value
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: t.password,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "password",
					className: "bg-charcoal border-border",
					required: true,
					minLength: 6,
					value: f.password,
					onChange: (e) => setF({
						...f,
						password: e.target.value
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "h-3 w-3 text-gold" }),
						" ",
						t.promoPlaceholder
					]
				}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "bg-charcoal border-gold/30 uppercase",
					placeholder: "GRAND30",
					value: f.promo,
					onChange: (e) => setF({
						...f,
						promo: e.target.value.toUpperCase()
					}),
					maxLength: 20
				})
			}),
			err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBox, { children: err }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "gold",
				className: "w-full h-11",
				disabled: loading,
				children: [
					loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
					" ",
					t.startTrial
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-muted-foreground text-center",
				children: t.trialNote
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
function ErrorBox({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start gap-3 rounded-lg border border-destructive/60 bg-destructive/10 p-3 text-sm text-destructive-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4 text-destructive mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-destructive font-medium",
			children
		})]
	});
}
//#endregion
export { AuthPage as component };
