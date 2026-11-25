import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { realtimeDb } from "@/lib/firebase";
import { push, set, ref as dbRef, get, query, orderByChild, equalTo } from "firebase/database";
import { uploadVideoToCloudinary } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Film, Upload, Sparkles, Loader as Loader2, Check, CircleAlert as AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/post-reel")({
  head: () => ({ meta: [{ title: "نشر ريلز · GRAND Auto Luxe" }] }),
  component: PostReelPage,
});

function PostReelPage() {
  const auth = useAuth();
  const user = auth?.user;
  const access = auth?.access ?? "locked";
  const loading = auth?.loading ?? true;
  const profile = auth?.profile;

  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [vehicleId, setVehicleId] = useState<string>("");
  const [myVehicles, setMyVehicles] = useState<{ id: string; brand: string; model: string; year: number }[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [monthlyLimitReached, setMonthlyLimitReached] = useState(false);
  const [limitCheckFailed, setLimitCheckFailed] = useState(false);
  const [checkingLimit, setCheckingLimit] = useState(true);

  const isShowroom = profile?.subscription_tier === "dealer";
  const monthlyReelLimit = isShowroom
    ? 50
    : profile?.subscription_tier === "basic" || profile?.subscription_tier === "pro"
      ? 15
      : 1;

  useEffect(() => {
    const database = realtimeDb;
    if (!user || !database) {
      setMyVehicles([]);
      return;
    }

    const load = async () => {
      try {
        const snap = await get(dbRef(database, "vehicles"));
        const raw = snap.val();
        if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
          setMyVehicles([]);
          return;
        }
        const vehicles = Object.entries(raw).flatMap(([id, value]) => {
          if (!value || typeof value !== "object" || Array.isArray(value)) return [];
          const vehicle = value as Record<string, unknown>;
          if (vehicle.sellerId !== user.id) return [];
          return [{
            id,
            brand: typeof vehicle.brand === "string" ? vehicle.brand : "",
            model: typeof vehicle.model === "string" ? vehicle.model : "",
            year: typeof vehicle.year === "number" ? vehicle.year : 0,
          }];
        });
        setMyVehicles(vehicles);
      } catch (error) {
        console.error("Error loading vehicles:", error);
        setMyVehicles([]);
      }
    };
    void load();
  }, [user]);

  useEffect(() => {
    const database = realtimeDb;
    if (!user || access === "locked") { setCheckingLimit(false); return; }
    if (!database) {
      setLimitCheckFailed(true);
      setCheckingLimit(false);
      return;
    }

    let cancelled = false;
    const checkLimit = async () => {
      setCheckingLimit(true);
      setLimitCheckFailed(false);
      try {
        const reelsQuery = query(dbRef(database, "reels"), orderByChild("authorId"), equalTo(user.id));
        const snap = await get(reelsQuery);
        const currentMonth = new Date().toISOString().slice(0, 7);
        const myReelsThisMonth = snap.exists()
          ? Object.values(snap.val() as Record<string, { createdAt?: unknown }>).filter(
              (reel) => typeof reel.createdAt === "string" && reel.createdAt.slice(0, 7) === currentMonth,
            )
          : [];
        if (!cancelled) setMonthlyLimitReached(myReelsThisMonth.length >= monthlyReelLimit);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to verify monthly Reel quota:", error);
          setLimitCheckFailed(true);
        }
      } finally {
        if (!cancelled) setCheckingLimit(false);
      }
    };
    void checkLimit();
    return () => { cancelled = true; };
  }, [user, access, monthlyReelLimit]);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  if (loading) return <div className="py-24 text-center text-muted-foreground">Loading...</div>;
  if (!user) return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      <h1 className="font-display text-2xl mb-3">Sign in required</h1>
      <Button asChild variant="gold"><Link to="/auth">Sign in</Link></Button>
    </div>
  );
  if (checkingLimit) return (
    <div className="max-w-md mx-auto px-6 py-24 text-center text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
      <p>Checking your posting limit…</p>
    </div>
  );
  if (access === "locked") return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      <Sparkles className="h-10 w-10 text-gold mx-auto mb-3" />
      <h1 className="font-display text-2xl mb-2">اشتراك مطلوب</h1>
      <p className="text-muted-foreground text-sm mb-4">يجب أن يكون لديك اشتراك فعّال لنشر الريلز.</p>
      <Button asChild variant="gold"><Link to="/plans">إشترك الآن</Link></Button>
    </div>
  );

  const submit = async () => {
    const database = realtimeDb;
    if (!file || !user) {
      toast.error("اختر ملف فيديو");
      return;
    }
    if (!database) {
      toast.error("خدمة النشر غير متاحة حاليًا.");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error("الحد الأقصى 100MB");
      return;
    }
    setBusy(true);
    setUploadProgress(0);

    try {
      // Upload to Cloudinary (bypassing Firebase Storage)
      const videoUrl = await uploadVideoToCloudinary(file, (percent) => {
        setUploadProgress(percent);
      });

      setUploadProgress(100);

      // Save to Firebase Realtime Database
      const reelRef = push(dbRef(database, "reels"));
      const reelId = reelRef.key!;

      await set(reelRef, {
        id: reelId,
        authorId: user.id,
        authorPhone: user.phone,
        videoUrl: videoUrl, // Cloudinary URL
        caption: caption.trim() || null,
        vehicleId: vehicleId || null,
        likesCount: 0,
        viewsCount: 0,
        createdAt: new Date().toISOString(),
      });

      toast.success("تم نشر الريل بنجاح ✨");
      navigate({ to: "/reels" });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "فشل النشر");
    } finally {
      setBusy(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg gold-gradient grid place-items-center">
          <Film className="h-5 w-5 text-gold-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl gold-text">نشر ريلز</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            Cloudinary Upload · Up to 100MB · MP4/MOV
          </p>
        </div>
      </div>

      <div className="premium-card rounded-xl p-6 border border-gold/20 space-y-6">
        {/* Video Upload */}
        <div>
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">
            Video File
          </Label>
          <div className="mt-2">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm"
            />
            {file && (
              <div className="mt-2 flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-400" />
                <span className="text-white/80">{file.name}</span>
                <span className="text-white/40">({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
              </div>
            )}
          </div>
        </div>

        {/* Video Preview */}
        {preview && (
          <div className="rounded-xl overflow-hidden border border-gold/20">
            <video
              src={preview}
              controls
              className="w-full max-h-[400px] object-contain bg-black"
            />
          </div>
        )}

        {/* Caption */}
        <div>
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">
            Caption (optional)
          </Label>
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            className="mt-2 bg-charcoal min-h-[80px]"
          />
        </div>

        {/* Link to Vehicle */}
        {myVehicles.length > 0 && (
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Link to Vehicle (optional)
            </Label>
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger className="mt-2 bg-charcoal">
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {myVehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.brand} {v.model} ({v.year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Upload Progress */}
        {busy && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Uploading to Cloudinary...</span>
              <span className="text-gold">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {monthlyLimitReached && (
          <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-gold shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-gold">Monthly Reel Limit Reached</div>
              <div className="text-xs text-muted-foreground mt-1">
                وصل حسابك إلى الحد الشهري البالغ {monthlyReelLimit} ريلز.
              </div>
              <Button asChild variant="gold-outline" size="sm" className="mt-2">
                <Link to="/plans">عرض الخطط</Link>
              </Button>
            </div>
          </div>
        )}
        {limitCheckFailed && (
          <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
            تعذر التحقق من حد النشر. أعد المحاولة بعد استعادة اتصال قاعدة البيانات.
          </div>
        )}

        {/* Submit */}
        <Button
          variant="gold"
          size="lg"
          className="w-full"
          disabled={busy || !file || monthlyLimitReached || checkingLimit || limitCheckFailed}
          onClick={submit}
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Publish Reel
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
