import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Car, Loader2, AlertCircle } from "lucide-react";
import { phoneToEmail, normalizePhone } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in · GRAND Auto Luxe" }] }),
  component: AuthPage,
});

function AuthPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-charcoal overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.25),transparent_50%)]" />
        <Link to="/" className="relative flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg gold-gradient grid place-items-center"><Car className="h-5 w-5 text-gold-foreground" /></div>
          <div className="font-display text-xl"><span className="gold-text">GRAND</span> Auto Luxe</div>
        </Link>
        <div className="relative">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Membership</div>
          <h1 className="font-display text-5xl leading-tight mb-4">Enter the premium <span className="gold-text">Algerian</span> auto market.</h1>
          <p className="text-muted-foreground max-w-md">3 days free. Live auctions, verified sellers, and direct contact with owners across all wilayas.</p>
        </div>
        <div className="relative text-xs text-muted-foreground">Vehicles only · No real estate · No electronics</div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 mb-6 bg-charcoal border border-border">
              <TabsTrigger value="signin" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">Create Account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin"><SignIn /></TabsContent>
            <TabsContent value="signup"><SignUp /></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function SignIn() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email: phoneToEmail(phone), password });
    setLoading(false);
    if (error) { setErr("Invalid phone number or password."); return; }
    toast.success("Welcome back.");
    navigate({ to: "/" });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Phone Number</Label>
        <Input className="mt-1.5 bg-charcoal border-border" placeholder="+213 555 000 000" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </div>
      <div>
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Password</Label>
        <Input type="password" className="mt-1.5 bg-charcoal border-border" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {err && <ErrorBox>{err}</ErrorBox>}
      <Button variant="gold" className="w-full h-11" disabled={loading}>{loading && <Loader2 className="h-4 w-4 animate-spin" />} Sign In</Button>
    </form>
  );
}

function SignUp() {
  const navigate = useNavigate();
  const [f, setF] = useState({ first_name: "", last_name: "", dob: "", place_of_birth: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr(null);
    const phone = normalizePhone(f.phone);

    // Pre-check phone uniqueness against profiles
    const { data: existing } = await supabase.from("profiles").select("id").eq("phone", phone).maybeSingle();
    if (existing) {
      setLoading(false);
      setErr("This phone number is already registered to another account.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: phoneToEmail(phone),
      password: f.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { first_name: f.first_name, last_name: f.last_name, dob: f.dob, place_of_birth: f.place_of_birth, phone },
      },
    });
    setLoading(false);
    if (error) {
      const msg = error.message?.toLowerCase() ?? "";
      if (msg.includes("phone") || msg.includes("duplicate") || msg.includes("unique") || msg.includes("registered") || msg.includes("already")) {
        setErr("This phone number is already registered to another account.");
      } else {
        setErr(error.message);
      }
      return;
    }
    toast.success("Welcome to GRAND Auto Luxe. Your 3-day free trial has started.");
    navigate({ to: "/" });
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name"><Input className="bg-charcoal border-border" required value={f.first_name} onChange={(e) => setF({ ...f, first_name: e.target.value })} /></Field>
        <Field label="Last Name"><Input className="bg-charcoal border-border" required value={f.last_name} onChange={(e) => setF({ ...f, last_name: e.target.value })} /></Field>
      </div>
      <Field label="Date of Birth"><Input type="date" className="bg-charcoal border-border" required value={f.dob} onChange={(e) => setF({ ...f, dob: e.target.value })} /></Field>
      <Field label="Place of Birth"><Input className="bg-charcoal border-border" required placeholder="e.g. Alger" value={f.place_of_birth} onChange={(e) => setF({ ...f, place_of_birth: e.target.value })} /></Field>
      <Field label="Phone Number"><Input className="bg-charcoal border-border" required placeholder="+213 555 000 000" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
      <Field label="Password"><Input type="password" className="bg-charcoal border-border" required minLength={6} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
      {err && <ErrorBox>{err}</ErrorBox>}
      <Button variant="gold" className="w-full h-11" disabled={loading}>{loading && <Loader2 className="h-4 w-4 animate-spin" />} Start 3-Day Free Trial</Button>
      <p className="text-[11px] text-muted-foreground text-center">By signing up you agree to our terms. Trial valid for 72 hours.</p>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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
