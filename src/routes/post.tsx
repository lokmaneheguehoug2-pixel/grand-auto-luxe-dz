import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Upload, X, Car } from "lucide-react";
import { WILAYAS, BRANDS } from "@/lib/wilayas";
import { toast } from "sonner";
import { PremiumPaywallModal } from "@/components/PremiumPaywallModal";

export const Route = createFileRoute("/post")({
  head: () => ({ meta: [{ title: "List your vehicle · GRAND Auto Luxe" }] }),
  component: PostPage,
});

function PostPage() {
  const { user, access } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({
    brand: "", model: "", year: new Date().getFullYear(), mileage: 0, engine_type: "",
    fuel_type: "Essence", transmission: "Manuelle", wilaya: "Alger", phone: "",
    description: "", price_type: "fixed" as "fixed" | "auction",
    fixed_price: 0, starting_price: 0, auction_hours: 24,
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  if (!user) return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      <h2 className="font-display text-2xl mb-2">Sign in to list a vehicle</h2>
      <Button asChild variant="gold" className="mt-4"><Link to="/auth">Sign in</Link></Button>
    </div>
  );
  if (access === "locked") return (
    <>
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h2 className="font-display text-2xl mb-2 gold-text">Premium Required</h2>
        <p className="text-sm text-muted-foreground">يجب تفعيل اشتراكك قبل نشر إعلان جديد.</p>
      </div>
      <PremiumPaywallModal open onOpenChange={() => navigate({ to: "/" })} reason="لنشر إعلان سيارة على GRAND Auto Luxe يجب أن يكون اشتراكك فعّالاً." />
    </>
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (photos.length === 0) { toast.error("Please upload at least one photo."); return; }
    setBusy(true);
    try {
      const photoPaths: string[] = [];
      for (const p of photos.slice(0, 5)) {
        const path = `${user.id}/${Date.now()}-${p.name}`;
        const { error } = await supabase.storage.from("vehicle-media").upload(path, p);
        if (error) throw error;
        photoPaths.push(path);
      }
      let videoPath: string | null = null;
      if (video) {
        const path = `${user.id}/${Date.now()}-${video.name}`;
        const { error } = await supabase.storage.from("vehicle-media").upload(path, video);
        if (error) throw error;
        videoPath = path;
      }
      const auction_ends_at = f.price_type === "auction"
        ? new Date(Date.now() + f.auction_hours * 3600_000).toISOString()
        : null;

      const { data, error } = await supabase.from("vehicles").insert({
        seller_id: user.id,
        brand: f.brand, model: f.model, year: f.year, mileage: f.mileage,
        engine_type: f.engine_type || null,
        fuel_type: f.fuel_type as never, transmission: f.transmission as never,
        wilaya: f.wilaya, phone: f.phone, description: f.description,
        photos: photoPaths, video_url: videoPath,
        price_type: f.price_type,
        fixed_price: f.price_type === "fixed" ? f.fixed_price : null,
        starting_price: f.price_type === "auction" ? f.starting_price : null,
        auction_ends_at,
      }).select("id").single();
      if (error) throw error;
      toast.success("Vehicle listed.");
      navigate({ to: "/vehicle/$id", params: { id: data.id } });
    } catch (e: any) {
      toast.error(e.message ?? "Failed to list vehicle");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl gold-gradient grid place-items-center"><Car className="h-6 w-6 text-gold-foreground" /></div>
        <div>
          <h1 className="font-display text-3xl">List your vehicle</h1>
          <p className="text-sm text-muted-foreground">Strictly vehicles only — listings violating this policy will be removed.</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <Section title="Photos & Video">
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Photos (up to 5)</Label>
            <input type="file" accept="image/*" multiple className="mt-2 block w-full text-sm" onChange={(e) => setPhotos(Array.from(e.target.files ?? []).slice(0, 5))} />
            {photos.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden border border-border">
                    <img src={URL.createObjectURL(p)} className="h-full w-full object-cover" alt="" />
                    <button type="button" onClick={() => setPhotos(photos.filter((_, j) => j !== i))} className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/70 grid place-items-center"><X className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Vertical video (optional, for Reels)</Label>
            <input type="file" accept="video/*" className="mt-2 block w-full text-sm" onChange={(e) => setVideo(e.target.files?.[0] ?? null)} />
            {video && <div className="text-xs text-muted-foreground mt-1">{video.name}</div>}
          </div>
        </Section>

        <Section title="Vehicle Details">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Brand">
              <Select value={f.brand} onValueChange={(v) => setF({ ...f, brand: v })}>
                <SelectTrigger className="bg-charcoal"><SelectValue placeholder="Select brand" /></SelectTrigger>
                <SelectContent>{BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Model"><Input className="bg-charcoal" required value={f.model} onChange={(e) => setF({ ...f, model: e.target.value })} /></Field>
            <Field label="Year"><Input type="number" className="bg-charcoal" required value={f.year} onChange={(e) => setF({ ...f, year: Number(e.target.value) })} /></Field>
            <Field label="Mileage (km)"><Input type="number" className="bg-charcoal" required value={f.mileage} onChange={(e) => setF({ ...f, mileage: Number(e.target.value) })} /></Field>
            <Field label="Engine">
              <Input className="bg-charcoal" placeholder="e.g. 1.6 TDI" value={f.engine_type} onChange={(e) => setF({ ...f, engine_type: e.target.value })} />
            </Field>
            <Field label="Fuel Type">
              <Select value={f.fuel_type} onValueChange={(v) => setF({ ...f, fuel_type: v })}>
                <SelectTrigger className="bg-charcoal"><SelectValue /></SelectTrigger>
                <SelectContent>{["Diesel","Essence","GPL","Hybrid","Electrique"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Transmission">
              <Select value={f.transmission} onValueChange={(v) => setF({ ...f, transmission: v })}>
                <SelectTrigger className="bg-charcoal"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Manuelle">Manuelle</SelectItem><SelectItem value="Automatique">Automatique</SelectItem></SelectContent>
              </Select>
            </Field>
            <Field label="Wilaya">
              <Select value={f.wilaya} onValueChange={(v) => setF({ ...f, wilaya: v })}>
                <SelectTrigger className="bg-charcoal"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-72">{WILAYAS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Phone Number"><Input className="bg-charcoal" required placeholder="+213 555 000 000" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
          <Field label="Description"><Textarea className="bg-charcoal" rows={4} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        </Section>

        <Section title="Pricing">
          <RadioGroup value={f.price_type} onValueChange={(v) => setF({ ...f, price_type: v as "fixed" | "auction" })} className="grid grid-cols-2 gap-3">
            <label className={`rounded-xl border p-4 cursor-pointer ${f.price_type === "fixed" ? "gold-border bg-gold-soft" : "border-border bg-charcoal"}`}>
              <RadioGroupItem value="fixed" className="sr-only" />
              <div className="font-semibold">Fixed Price</div>
              <div className="text-xs text-muted-foreground">Prix Fixe</div>
            </label>
            <label className={`rounded-xl border p-4 cursor-pointer ${f.price_type === "auction" ? "gold-border bg-gold-soft" : "border-border bg-charcoal"}`}>
              <RadioGroupItem value="auction" className="sr-only" />
              <div className="font-semibold">Start a Bid</div>
              <div className="text-xs text-muted-foreground">Mise aux Enchères</div>
            </label>
          </RadioGroup>
          {f.price_type === "fixed" ? (
            <Field label="Price (DZD)"><Input type="number" className="bg-charcoal" required value={f.fixed_price} onChange={(e) => setF({ ...f, fixed_price: Number(e.target.value) })} /></Field>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Starting Price (DZD)"><Input type="number" className="bg-charcoal" required value={f.starting_price} onChange={(e) => setF({ ...f, starting_price: Number(e.target.value) })} /></Field>
              <Field label="Auction Duration">
                <Select value={String(f.auction_hours)} onValueChange={(v) => setF({ ...f, auction_hours: Number(v) })}>
                  <SelectTrigger className="bg-charcoal"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 Hours</SelectItem>
                    <SelectItem value="48">48 Hours</SelectItem>
                    <SelectItem value="72">3 Days</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          )}
        </Section>

        <Button variant="gold" className="w-full h-12 text-base" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Publish Listing
        </Button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="premium-card rounded-xl p-5 space-y-4">
      <div className="text-xs uppercase tracking-[0.2em] text-gold">{title}</div>
      {children}
    </div>
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
