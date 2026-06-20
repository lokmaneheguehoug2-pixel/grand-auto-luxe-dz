import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Film, Upload, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/post-reel")({
  head: () => ({ meta: [{ title: "نشر ريلز · GRAND Auto Luxe" }] }),
  component: PostReelPage,
});

function PostReelPage() {
  const { user, access, loading } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [vehicleId, setVehicleId] = useState<string>("");
  const [myVehicles, setMyVehicles] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("vehicles").select("id,brand,model,year").eq("seller_id", user.id).then(({ data }) => setMyVehicles(data ?? []));
  }, [user]);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  if (loading) return <div className="py-24 text-center text-muted-foreground">…</div>;
  if (!user) return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      <h1 className="font-display text-2xl mb-3">Sign in required</h1>
      <Button asChild variant="gold"><Link to="/auth">Sign in</Link></Button>
    </div>
  );
  if (access === "locked") return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      <Sparkles className="h-10 w-10 text-gold mx-auto mb-3" />
      <h1 className="font-display text-2xl mb-2">اشتراك مطلوب</h1>
      <p className="text-muted-foreground text-sm mb-4">يجب أن يكون لديك اشتراك فعّال لنشر الريلز.</p>
      <Button asChild variant="gold"><Link to="/checkout">اشترك الآن</Link></Button>
    </div>
  );

  const submit = async () => {
    if (!file || !user) { toast.error("اختر ملف فيديو"); return; }
    if (file.size > 50 * 1024 * 1024) { toast.error("الحد الأقصى 50MB"); return; }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "mp4";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("reels").upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      const { error: insErr } = await supabase.from("stories").insert({
        author_id: user.id,
        video_url: path,
        caption: caption.trim() || null,
        vehicle_id: vehicleId || null,
      });
      if (insErr) throw insErr;
      toast.success("تم نشر الريل بنجاح ✨");
      navigate({ to: "/reels" });
    } catch (e: any) {
      toast.error(e.message ?? "فشل النشر");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg gold-gradient grid place-items-center"><Film className="h-5 w-5 text-gold-foreground" /></div>
        <div>
          <h1 className="font-display text-3xl gold-text">نشر ريلز</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Premium Reel · Up to 50MB · MP4</p>
        </div>
      </div>

      <div className="premium-card gold-border rounded-2xl p-6 space-y-5">
        <div>
          <Label className="text-xs uppercase tracking-widest text-gold/80">Video</Label>
          <label className="mt-2 block cursor-pointer">
            <div className="border-2 border-dashed border-gold/40 rounded-xl p-8 text-center hover:bg-gold-soft/30 transition">
              {preview ? (
                <video src={preview} className="max-h-72 mx-auto rounded-lg" controls />
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto text-gold mb-2" />
                  <div className="text-sm">اضغط لاختيار فيديو</div>
                  <div className="text-xs text-muted-foreground mt-1">Vertical 9:16 recommended</div>
                </>
              )}
            </div>
            <input type="file" accept="video/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>

        <div>
          <Label className="text-xs uppercase tracking-widest text-gold/80">Caption</Label>
          <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={300} className="bg-charcoal border-gold/30 mt-1.5 min-h-[90px]" placeholder="اوصف سيارتك بأسلوب فخم..." />
        </div>

        {myVehicles.length > 0 && (
          <div>
            <Label className="text-xs uppercase tracking-widest text-gold/80">Link a vehicle (optional)</Label>
            <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className="w-full mt-1.5 bg-charcoal border border-gold/30 rounded-md h-9 px-3 text-sm">
              <option value="">— None —</option>
              {myVehicles.map((v) => <option key={v.id} value={v.id}>{v.brand} {v.model} · {v.year}</option>)}
            </select>
          </div>
        )}

        <Button variant="gold" className="w-full" disabled={busy || !file} onClick={submit}>
          {busy ? "جاري الرفع..." : "نشر الريل"}
        </Button>
      </div>
    </div>
  );
}
