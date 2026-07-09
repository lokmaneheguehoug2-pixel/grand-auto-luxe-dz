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
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [checkingLimit, setCheckingLimit] = useState(true);

  const isShowroom = profile?.subscription?.plan === "showroom";

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const snap = await get(dbRef(realtimeDb, "vehicles"));
        if (snap.exists()) {
          const vehicles = Object.entries(snap.val()) as [string, any][];
          const myVehicles = vehicles
            .filter(([_, v]) => v.sellerId === user.id)
            .map(([id, v]) => ({
              id,
              brand: v.brand,
              model: v.model,
              year: v.year,
            }));
          setMyVehicles(myVehicles);
        }
      } catch (e) {
        console.error("Error loading vehicles:", e);
      }
    };
    load();
  }, [user]);

  // Check daily reel limit for non-showroom users
  useEffect(() => {
    if (!user || access === "locked") { setCheckingLimit(false); return; }
    if (isShowroom) { setCheckingLimit(false); return; }

    const checkLimit = async () => {
      try {
        const snap = await get(dbRef(realtimeDb, "reels"));
        if (!snap.exists()) { setCheckingLimit(false); return; }

        const today = new Date().toISOString().split("T")[0];
        const myReelsToday = Object.values(snap.val() as Record<string, any>).filter(
          (r) => r.authorId === user.id && r.createdAt?.startsWith(today),
        );

        if (myReelsToday.length >= 1) {
          setDailyLimitReached(true);
        }
      } catch (e) {
        console.error("Error checking daily limit:", e);
      } finally {
        setCheckingLimit(false);
      }
    };
    checkLimit();
  }, [user, access, isShowroom]);

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
    if (!file || !user) {
      toast.error("اختر ملف فيديو");
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
      const reelRef = push(dbRef(realtimeDb, "reels"));
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
    } catch (e: any) {
      toast.error(e.message ?? "فشل النشر");
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

        {/* Daily limit warning for non-showroom users */}
        {dailyLimitReached && !isShowroom && (
          <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-gold shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-gold">Daily Reel Limit Reached</div>
              <div className="text-xs text-muted-foreground mt-1">
                Your Individual plan allows 1 reel per day. Upgrade to Showroom for unlimited reels.
              </div>
              <Button asChild variant="gold-outline" size="sm" className="mt-2">
                <Link to="/plans">Upgrade to Showroom</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Submit */}
        <Button
          variant="gold"
          size="lg"
          className="w-full"
          disabled={busy || !file || dailyLimitReached || checkingLimit}
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
