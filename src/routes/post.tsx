import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import { push, set, ref as dbRef } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { uploadImagesToCloudinary, uploadVideoToCloudinary } from "@/lib/cloudinary";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload, X, Car, GripVertical, ImagePlus, Check } from "lucide-react";
import { WILAYAS, BRANDS } from "@/lib/wilayas";
import { toast } from "sonner";
import { PremiumPaywallModal } from "@/components/PremiumPaywallModal";

const MAX_PHOTOS = 30;

export const Route = createFileRoute("/post")({
  head: () => ({ meta: [{ title: "List your vehicle · GRAND Auto Luxe" }] }),
  component: PostPage,
});

function PostPage() {
  const auth = useAuth();
  const user = auth?.user;
  const access = auth?.access ?? "locked";

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
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, percent: 0 });
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showPaywall, setShowPaywall] = useState(false);

  // Instant state check
  const canPost = user && access !== "locked";

  const handleFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (arr.length === 0) return;
    setPhotos((prev) => [...prev, ...arr].slice(0, MAX_PHOTOS));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDraggedIdx(null);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleReorder = useCallback((fromIdx: number, toIdx: number) => {
    setPhotos((prev) => {
      const arr = [...prev];
      const [removed] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, removed);
      return arr;
    });
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    handleReorder(draggedIdx, idx);
    setDraggedIdx(idx);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h2 className="font-display text-2xl mb-2">Sign in to list a vehicle</h2>
        <Button asChild variant="gold" className="mt-4">
          <Link to="/auth">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (access === "locked") {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h2 className="font-display text-2xl mb-2 gold-text">Premium Required</h2>
        <p className="text-sm text-muted-foreground">يجب تفعيل اشتراكك قبل نشر إعلان جديد.</p>
        <Button variant="gold" className="mt-4" onClick={() => setShowPaywall(true)}>
          Upgrade Now
        </Button>
        <PremiumPaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (photos.length === 0) {
      toast.error("Please upload at least one photo.");
      return;
    }
    setBusy(true);
    setUploadProgress({ current: 0, total: photos.length + (video ? 1 : 0), percent: 0 });

    try {
      // Step 1: Upload images to Cloudinary (highest quality)
      const imageUrls = await uploadImagesToCloudinary(photos, (current, total, percent) => {
        setUploadProgress({ current, total, percent });
      });

      // Step 2: Upload video to Cloudinary if present
      let videoUrl: string | null = null;
      if (video) {
        setUploadProgress({ current: photos.length, total: photos.length + 1, percent: 0 });
        videoUrl = await uploadVideoToCloudinary(video, (percent) => {
          setUploadProgress({ current: photos.length + 1, total: photos.length + 1, percent });
        });
      }

      // Step 3: Save to Firebase Realtime Database
      const vehicleRef = push(dbRef(realtimeDb, "vehicles"));
      const vehicleId = vehicleRef.key!;

      const auction_ends_at = f.price_type === "auction"
        ? new Date(Date.now() + f.auction_hours * 3600_000).toISOString()
        : null;

      await set(vehicleRef, {
        id: vehicleId,
        sellerId: user.id,
        sellerPhone: user.phone,
        brand: f.brand,
        model: f.model,
        year: f.year,
        mileage: f.mileage,
        engine_type: f.engine_type || null,
        fuel_type: f.fuel_type,
        transmission: f.transmission,
        wilaya: f.wilaya,
        phone: f.phone || user.phone,
        description: f.description,
        images: imageUrls, // Cloudinary URLs
        video_url: videoUrl, // Cloudinary URL
        price_type: f.price_type,
        fixed_price: f.price_type === "fixed" ? f.fixed_price : null,
        starting_price: f.price_type === "auction" ? f.starting_price : null,
        current_highest_bid: null,
        auction_ends_at,
        status: "pending",
        created_at: new Date().toISOString(),
      });

      toast.success("تم استلام إعلانك · بانتظار مراجعة الإدارة");
      navigate({ to: "/my-listings" });
    } catch (err: any) {
      toast.error(err.message ?? "Failed to list vehicle");
    } finally {
      setBusy(false);
      setUploadProgress({ current: 0, total: 0, percent: 0 });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl gold-gradient grid place-items-center">
          <Car className="h-6 w-6 text-gold-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl">List your vehicle</h1>
          <p className="text-sm text-muted-foreground">Images & videos uploaded to Cloudinary · Highest quality retained</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <Section title={`Photos · ${photos.length}/${MAX_PHOTOS} (Cloudinary Upload)`}>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gold/30 rounded-xl p-6 text-center bg-charcoal/30 hover:border-gold/60 transition cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="h-10 w-10 mx-auto text-gold/60 mb-2" />
            <div className="text-sm text-muted-foreground">Drag & drop photos here, or click to browse</div>
            <div className="text-xs text-gold/60 mt-1">
              Up to {MAX_PHOTOS} photos · Highest quality · No compression
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files ?? [])}
            />
          </div>

          {photos.length > 0 && (
            <div className="mt-4 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {photos.map((p, i) => (
                <div
                  key={i}
                  draggable
                  onDragStart={() => setDraggedIdx(i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDragEnd={() => setDraggedIdx(null)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition cursor-grab ${
                    i === 0 ? "border-gold" : draggedIdx === i ? "border-gold/60" : "border-transparent hover:border-gold/40"
                  }`}
                >
                  <img src={URL.createObjectURL(p)} className="h-full w-full object-cover" alt="" loading="lazy" />
                  {i === 0 && <div className="absolute bottom-0 left-0 right-0 bg-gold/90 text-black text-[8px] text-center py-0.5">Cover</div>}
                  <div className="absolute top-0.5 left-0.5 opacity-0 hover:opacity-100 transition">
                    <GripVertical className="h-4 w-4 text-white drop-shadow" />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotos(photos.filter((_, j) => j !== i));
                    }}
                    className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/80 grid place-items-center hover:bg-destructive transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Video Reel (Cloudinary Upload)
            </Label>
            <input
              type="file"
              accept="video/*"
              className="mt-2 block w-full text-sm"
              onChange={(e) => setVideo(e.target.files?.[0] ?? null)}
            />
            {video && (
              <div className="text-xs text-gold mt-1 flex items-center gap-1">
                <Check className="h-3 w-3" />
                {video.name} - Ready for Cloudinary upload
              </div>
            )}
          </div>
        </Section>

        <Section title="Vehicle Details">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Brand">
              <Select value={f.brand} onValueChange={(v) => setF({ ...f, brand: v })}>
                <SelectTrigger className="bg-charcoal">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {BRANDS.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Model">
              <Input className="bg-charcoal" required value={f.model} onChange={(e) => setF({ ...f, model: e.target.value })} />
            </Field>
            <Field label="Year">
              <Input type="number" className="bg-charcoal" required value={f.year} onChange={(e) => setF({ ...f, year: Number(e.target.value) })} />
            </Field>
            <Field label="Mileage (km)">
              <Input type="number" className="bg-charcoal" required value={f.mileage} onChange={(e) => setF({ ...f, mileage: Number(e.target.value) })} />
            </Field>
            <Field label="Engine">
              <Input className="bg-charcoal" placeholder="e.g. 1.6 TDI" value={f.engine_type} onChange={(e) => setF({ ...f, engine_type: e.target.value })} />
            </Field>
            <Field label="Fuel Type">
              <Select value={f.fuel_type} onValueChange={(v) => setF({ ...f, fuel_type: v })}>
                <SelectTrigger className="bg-charcoal"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Diesel", "Essence", "GPL", "Hybrid", "Electrique"].map((x) => (
                    <SelectItem key={x} value={x}>{x}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Transmission">
              <Select value={f.transmission} onValueChange={(v) => setF({ ...f, transmission: v })}>
                <SelectTrigger className="bg-charcoal"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manuelle">Manuelle</SelectItem>
                  <SelectItem value="Automatique">Automatique</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Wilaya">
              <Select value={f.wilaya} onValueChange={(v) => setF({ ...f, wilaya: v })}>
                <SelectTrigger className="bg-charcoal"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {WILAYAS.map((w) => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Phone Number">
            <Input className="bg-charcoal" required value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder={user?.phone || ""} />
          </Field>
          <Field label="Description">
            <Textarea className="bg-charcoal min-h-[100px]" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Describe your vehicle..." />
          </Field>
        </Section>

        <Section title="Pricing">
          <div className="flex gap-4 items-center mb-4">
            <Button
              type="button"
              variant={f.price_type === "fixed" ? "gold" : "outline"}
              size="sm"
              onClick={() => setF({ ...f, price_type: "fixed" })}
            >
              Fixed Price
            </Button>
            <Button
              type="button"
              variant={f.price_type === "auction" ? "gold" : "outline"}
              size="sm"
              onClick={() => setF({ ...f, price_type: "auction" })}
            >
              Auction
            </Button>
          </div>

          {f.price_type === "fixed" ? (
            <Field label="Price (DZD)">
              <Input
                type="number"
                className="bg-charcoal"
                required
                value={f.fixed_price || ""}
                onChange={(e) => setF({ ...f, fixed_price: Number(e.target.value) })}
              />
            </Field>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Starting Price (DZD)">
                <Input
                  type="number"
                  className="bg-charcoal"
                  required
                  value={f.starting_price || ""}
                  onChange={(e) => setF({ ...f, starting_price: Number(e.target.value) })}
                />
              </Field>
              <Field label="Duration (hours)">
                <Select value={String(f.auction_hours)} onValueChange={(v) => setF({ ...f, auction_hours: Number(v) })}>
                  <SelectTrigger className="bg-charcoal"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="48">48 hours</SelectItem>
                    <SelectItem value="72">72 hours</SelectItem>
                    <SelectItem value="168">1 week</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          )}
        </Section>

        {/* Progress indicator */}
        {busy && uploadProgress.total > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                Uploading to Cloudinary... ({uploadProgress.current}/{uploadProgress.total})
              </span>
              <span className="text-gold">{uploadProgress.percent}%</span>
            </div>
            <Progress value={uploadProgress.percent} className="h-2" />
          </div>
        )}

        <Button type="submit" variant="gold" size="lg" className="w-full" disabled={busy || photos.length === 0}>
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Publish Listing
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="premium-card rounded-xl p-4 border border-gold/20 space-y-4">
      <h2 className="font-display text-lg">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
