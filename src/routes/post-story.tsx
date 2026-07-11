import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { realtimeDb } from "@/lib/firebase";
import { push, set, ref as dbRef, get } from "firebase/database";
import { uploadVideoToCloudinary } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Upload, Sparkles, Loader as Loader2, Check, CircleAlert as AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/post-story")({
  head: () => ({ meta: [{ title: "Post Story · GRAND Auto Luxe" }] }),
  component: PostStoryPage,
});

const SHOWROOM_DAILY_LIMIT = 5;
const NORMAL_WEEKLY_LIMIT = 5;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function PostStoryPage() {
  const auth = useAuth();
  const user = auth?.user;
  const access = auth?.access ?? "locked";
  const loading = auth?.loading ?? true;
  const profile = auth?.profile;

  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{ used: number; max: number; period: string } | null>(null);
  const [checkingLimit, setCheckingLimit] = useState(true);

  const isShowroom = profile?.subscription_tier === "showroom" || profile?.subscription_tier === "dealer";

  useEffect(() => {
    if (!user || !realtimeDb) { setCheckingLimit(false); return; }

    const checkLimit = async () => {
      try {
        const snap = await get(dbRef(realtimeDb, "stories"));
        const now = Date.now();

        let myStories: any[] = [];
        if (snap.exists()) {
          const allStories = Object.values(snap.val() as Record<string, any>);
          myStories = allStories.filter((s) => s.authorId === user.id);
        }

        if (isShowroom) {
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          const todayCount = myStories.filter(
            (s) => new Date(s.createdAt).getTime() >= todayStart.getTime(),
          ).length;

          setLimitInfo({ used: todayCount, max: SHOWROOM_DAILY_LIMIT, period: "today" });
          if (todayCount >= SHOWROOM_DAILY_LIMIT) setLimitReached(true);
        } else {
          const weekAgo = now - SEVEN_DAYS_MS;
          const weekCount = myStories.filter(
            (s) => new Date(s.createdAt).getTime() >= weekAgo,
          ).length;

          setLimitInfo({ used: weekCount, max: NORMAL_WEEKLY_LIMIT, period: "this week" });
          if (weekCount >= NORMAL_WEEKLY_LIMIT) setLimitReached(true);
        }
      } catch (e) {
        console.error("Error checking story limit:", e);
      } finally {
        setCheckingLimit(false);
      }
    };
    checkLimit();
  }, [user, isShowroom]);

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
      <p>Checking your story limit...</p>
    </div>
  );
  if (access === "locked") return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      <Sparkles className="h-10 w-10 text-gold mx-auto mb-3" />
      <h1 className="font-display text-2xl mb-2">Subscription required</h1>
      <p className="text-muted-foreground text-sm mb-4">You need an active subscription to post stories.</p>
      <Button asChild variant="gold"><Link to="/plans">Subscribe now</Link></Button>
    </div>
  );

  const submit = async () => {
    if (!file || !user || !realtimeDb) {
      toast.error("Please select a video file");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Maximum 50MB for stories");
      return;
    }
    if (limitReached) {
      toast.error(`Story limit reached (${limitInfo?.used}/${limitInfo?.max} ${limitInfo?.period})`);
      return;
    }

    setBusy(true);
    setUploadProgress(0);

    try {
      const videoUrl = await uploadVideoToCloudinary(file, (percent) => {
        setUploadProgress(percent);
      });

      setUploadProgress(100);

      const storyRef = push(dbRef(realtimeDb, "stories"));
      const storyId = storyRef.key!;

      await set(storyRef, {
        id: storyId,
        authorId: user.id,
        authorPhone: user.phone,
        videoUrl,
        caption: caption.trim() || null,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + TWENTY_FOUR_HOURS_MS).toISOString(),
      });

      toast.success("Story posted! It will expire in 24 hours.");
      navigate({ to: "/" });
    } catch (e: any) {
      toast.error(e.message ?? "Failed to post story");
    } finally {
      setBusy(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg gold-gradient grid place-items-center">
          <Plus className="h-5 w-5 text-gold-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl gold-text">Post a Story</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            24-hour story · Cloudinary · Up to 50MB
          </p>
        </div>
      </div>

      {limitInfo && (
        <div className="mb-4 flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-gold" />
          <span className="text-muted-foreground">
            {isShowroom ? "Showroom" : "Standard"} plan:{" "}
            <span className={limitReached ? "text-destructive font-medium" : "text-gold font-medium"}>
              {limitInfo.used}/{limitInfo.max} stories {limitInfo.period}
            </span>
          </span>
        </div>
      )}

      <div className="premium-card rounded-xl p-6 border border-gold/20 space-y-6">
        {limitReached ? (
          <div className="rounded-xl border border-gold/40 bg-gold/10 p-6 flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-gold shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-gold">Story Limit Reached</div>
              <div className="text-xs text-muted-foreground mt-1">
                You've used {limitInfo?.used}/{limitInfo?.max} stories {limitInfo?.period}.
                {isShowroom
                  ? " Your Showroom plan allows 5 stories per day. Come back tomorrow!"
                  : " Your plan allows 5 stories per week. Upgrade to Showroom for 5 stories per day."}
              </div>
              {!isShowroom && (
                <Button asChild variant="gold-outline" size="sm" className="mt-3">
                  <Link to="/plans">Upgrade to Showroom</Link>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Video File</label>
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

            {preview && (
              <div className="rounded-xl overflow-hidden border border-gold/20">
                <video src={preview} controls className="w-full max-h-[400px] object-contain bg-black" />
              </div>
            )}

            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Caption (optional)</label>
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                className="mt-2 w-full rounded-md border border-border bg-charcoal px-3 py-2 text-sm"
              />
            </div>

            {busy && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Uploading to Cloudinary...</span>
                  <span className="text-gold">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <Button
              variant="gold"
              size="lg"
              className="w-full"
              disabled={busy || !file}
              onClick={submit}
            >
              {busy ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="h-4 w-4 mr-2" /> Post Story</>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
