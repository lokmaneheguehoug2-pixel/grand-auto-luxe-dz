import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth, normalizePhone, isAdminPhone } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader as Loader2, CircleAlert as AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in · GRAND Auto Luxe" }] }),
  component: AuthPage,
});

type Lang = "ar" | "en" | "fr";

const TRANSLATIONS: Record<Lang, Record<string, string>> = {
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
    invalid: "رقم الهاتف أو كلمة السر غير صحيحة.",
    alreadyRegistered: "هذا الرقم مسجل بحساب آخر.",
    startTrial: "ابدأ تجربة مجانية 3 أيام",
    trialNote: "باستمرارك، توافق على الشروط. التجربة صالحة 72 ساعة.",
    welcome: "مرحباً بعودتك.",
    welcomeNew: "مرحباً بك في GRAND Auto Luxe. بدأت تجربتك المجانية.",
    adminAccess: "تم منح صلاحيات المدير."
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
    invalid: "Invalid phone number or password.",
    alreadyRegistered: "This phone number is already registered.",
    startTrial: "Start 3-Day Free Trial",
    trialNote: "By signing up you agree to our terms. Trial valid for 72 hours.",
    welcome: "Welcome back.",
    welcomeNew: "Welcome to GRAND Auto Luxe. Your 3-day free trial has started.",
    adminAccess: "Admin access granted."
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
    invalid: "Numéro ou mot de passe invalide.",
    alreadyRegistered: "Ce numéro est déjà enregistré.",
    startTrial: "Commencer l'essai gratuit de 3 jours",
    trialNote: "En vous inscrivant, vous acceptez les termes. Essai valable 72h.",
    welcome: "Bienvenue.",
    welcomeNew: "Bienvenue sur GRAND Auto Luxe. Votre essai gratuit de 3 jours a commencé.",
    adminAccess: "Accès administrateur accordé."
  }
};

function AuthPage() {
  const [lang, setLang] = useState<Lang>("en");
  const t = TRANSLATIONS[lang];
  const isRtl = lang === "ar";

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-charcoal overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.25),transparent_50%)]" />
        <Link to="/" className="relative flex items-center gap-3">
          <img src="/my-logo.png.PNG" alt="GRANDA Auto Luxe" className="h-12 w-12 rounded-lg object-contain" />
          <div className="font-display text-xl"><span className="gold-text">GRAND</span><span className="text-gold/80">A</span> Auto Luxe</div>
        </Link>
        <div className="relative">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">{t.membership}</div>
          <h1 className="font-display text-5xl leading-tight mb-4">{t.title.split("premium")[0]}<span className="gold-text">premium</span>{t.title.split("premium")[1]}</h1>
          <p className="text-muted-foreground max-w-md">{t.subtitle}</p>
        </div>
        <div className="relative text-xs text-muted-foreground">Vehicles only · No real estate · No electronics</div>
      </div>
      <div className="flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="flex items-center justify-end w-full max-w-md mb-6">
          <div className="inline-flex rounded-full border border-gold/30 bg-black/50 p-1">
            {(["ar", "en", "fr"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 rounded-full text-xs transition ${lang === l ? "bg-gold text-black" : "text-white/60 hover:text-white"}`}
              >
                {l === "ar" ? "العربية" : l === "en" ? "English" : "Français"}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full max-w-md" dir={isRtl ? "rtl" : "ltr"}>
          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 mb-6 bg-charcoal border border-border">
              <TabsTrigger value="signin" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">{t.signin}</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">{t.signup}</TabsTrigger>
            </TabsList>
            <TabsContent value="signin"><SignIn t={t} /></TabsContent>
            <TabsContent value="signup"><SignUp t={t} /></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function SignIn({ t }: { t: Record<string, string> }) {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    try {
      const result = await signIn(phone, password, promoCode || undefined);
      const normalizedPhone = normalizePhone(phone);

      // Check if admin bypass or admin user
      if (result.bypass || isAdminPhone(normalizedPhone) || isAdminPhone(phone)) {
        toast.success(t.adminAccess);
        navigate({ to: "/admin" });
      } else if (result.promoApplied) {
        toast.success("Promo code applied! Subscription activated.");
        navigate({ to: "/" });
      } else {
        toast.success(t.welcome);
        navigate({ to: "/" });
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        setErr(t.invalid);
      } else {
        setErr(msg || t.invalid);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">{t.phone}</Label>
        <Input
          className="mt-1.5 bg-charcoal border-border"
          placeholder="+213 555 000 000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      <div>
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">{t.password}</Label>
        <Input
          type="password"
          className="mt-1.5 bg-charcoal border-border"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <Label className="text-xs uppercase tracking-widest text-gold/70">Promo Code (optional) · كود البرومو</Label>
        <Input
          className="mt-1.5 bg-charcoal border-gold/30"
          placeholder="GRAND2025"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
        />
      </div>
      {err && <ErrorBox>{err}</ErrorBox>}
      <Button variant="gold" className="w-full h-11" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />} {t.signin}
      </Button>
    </form>
  );
}

function SignUp({ t }: { t: Record<string, string> }) {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [f, setF] = useState({ first_name: "", last_name: "", phone: "", password: "", promoCode: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    try {
      const result = await signUp(f.phone, f.password, { first_name: f.first_name, last_name: f.last_name }, f.promoCode) as any;

      // Check if admin phone
      if (isAdminPhone(normalizePhone(f.phone))) {
        toast.success(t.adminAccess);
        navigate({ to: "/admin" });
      } else if (result?.promoApplied) {
        toast.success("Promo code applied! Your subscription is now active.");
        navigate({ to: "/" });
      } else {
        toast.success(t.welcomeNew);
        navigate({ to: "/" });
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("email-already-in-use") || msg.includes("already")) {
        setErr(t.alreadyRegistered);
      } else {
        setErr(msg || t.invalid);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label={t.firstName}>
          <Input
            className="bg-charcoal border-border"
            required
            value={f.first_name}
            onChange={(e) => setF({ ...f, first_name: e.target.value })}
          />
        </Field>
        <Field label={t.lastName}>
          <Input
            className="bg-charcoal border-border"
            required
            value={f.last_name}
            onChange={(e) => setF({ ...f, last_name: e.target.value })}
          />
        </Field>
      </div>
      <Field label={t.phone}>
        <Input
          className="bg-charcoal border-border"
          required
          placeholder="+213 555 000 000"
          value={f.phone}
          onChange={(e) => setF({ ...f, phone: e.target.value })}
        />
      </Field>
      <Field label={t.password}>
        <Input
          type="password"
          className="bg-charcoal border-border"
          required
          minLength={6}
          value={f.password}
          onChange={(e) => setF({ ...f, password: e.target.value })}
        />
      </Field>
      <Field label="Promo Code (optional) · كود البرومو">
        <Input
          className="bg-charcoal border-border border-gold/30"
          placeholder="GRAND2025"
          value={f.promoCode}
          onChange={(e) => setF({ ...f, promoCode: e.target.value.toUpperCase() })}
        />
      </Field>
      {err && <ErrorBox>{err}</ErrorBox>}
      <Button variant="gold" className="w-full h-11" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />} {t.startTrial}
      </Button>
      <p className="text-[11px] text-muted-foreground text-center">{t.trialNote}</p>
    </form>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-destructive/60 bg-destructive/10 p-3 text-sm text-destructive-foreground">
      <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
      <div className="text-destructive font-medium">{children}</div>
    </div>
  );
}
