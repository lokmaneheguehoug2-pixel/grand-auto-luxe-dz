import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Film, Plus, Heart, ExternalLink, Trash2 } from "lucide-react";
import { useSignedUrl } from "@/hooks/use-signed-url";
import { toast } from "sonner";

export const Route = createFileRoute("/reels")({
  head: () => ({ meta: [{ title: "Reels · GRAND Auto Luxe" }] }),
  component: ReelsPage,
});

type Reel = {
  id: string;
  author_id: string;
  video_url: string;
  caption: string | null;
  vehicle_id: string | null;
  likes_count: number;
  views_count: number;
  created_at: string;
  author?: { first_name: string; last_name: string; showroom_name: string | null; is_showroom: boolean };
};

function ReelsPage() {
  const { user } = useAuth();
  const { data: reels = [], refetch } = useQuery({
    queryKey: ["reels-feed"],
    queryFn: async () => {
      const { data: rows } = await supabase.from("stories").select("*").order("created_at", { ascending: false }).limit(50);
      const ids = Array.from(new Set((rows ?? []).map((r) => r.author_id)));
      const { data: profs } = ids.length
        ? await supabase.from("profiles").select("id,first_name,last_name,showroom_name,is_showroom").in("id", ids)
        : { data: [] as any[] };
      const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
      return (rows ?? []).map((r) => ({ ...r, author: map.get(r.author_id) })) as Reel[];
    },
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-black">
      <div className="max-w-md mx-auto py-4 px-3 flex items-center justify-between sticky top-16 z-30 bg-gradient-to-b from-black/95 to-transparent">
        <div className="flex items-center gap-2">
          <Film className="h-5 w-5 text-gold" />
          <h1 className="font-display text-xl gold-text">Reels</h1>
        </div>
        {user && (
          <Button asChild variant="gold" size="sm">
            <Link to="/post-reel"><Plus className="h-4 w-4" /> ريل</Link>
          </Button>
        )}
      </div>

      <div className="max-w-md mx-auto space-y-4 px-3 pb-10">
        {reels.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            <Film className="h-12 w-12 mx-auto mb-3 text-gold/40" />
            <p>لا يوجد ريلز بعد. كن أول من ينشر!</p>
          </div>
        )}
        {reels.map((r) => <ReelCard key={r.id} reel={r} onChange={refetch} currentUserId={user?.id} />)}
      </div>
    </div>
  );
}

function ReelCard({ reel, onChange, currentUserId }: { reel: Reel; onChange: () => void; currentUserId?: string }) {
  const url = useSignedUrl("reels", reel.video_url, 3600);
  const ref = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { el.play().catch(() => {}); }
        else { el.pause(); }
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [url]);

  const like = async () => {
    setLiked(true);
    await supabase.from("stories").update({ likes_count: reel.likes_count + 1 }).eq("id", reel.id);
    onChange();
  };
  const del = async () => {
    if (!confirm("حذف الريل؟")) return;
    await supabase.from("stories").delete().eq("id", reel.id);
    await supabase.storage.from("reels").remove([reel.video_url]);
    toast.success("تم الحذف");
    onChange();
  };

  const name = reel.author?.is_showroom && reel.author.showroom_name
    ? reel.author.showroom_name
    : `${reel.author?.first_name ?? ""} ${reel.author?.last_name ?? ""}`.trim();

  return (
    <div className="relative rounded-2xl overflow-hidden gold-border bg-black aspect-[9/16]">
      {url ? (
        <video ref={ref} src={url} className="w-full h-full object-cover" loop muted playsInline />
      ) : (
        <div className="w-full h-full grid place-items-center text-muted-foreground text-sm">Loading…</div>
      )}
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

      {/* Right rail */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 z-10">
        <button onClick={like} className="flex flex-col items-center gap-1 group">
          <div className="h-11 w-11 rounded-full bg-black/60 backdrop-blur grid place-items-center border border-gold/40 group-hover:border-gold transition">
            <Heart className={`h-5 w-5 ${liked ? "fill-gold text-gold" : "text-gold"}`} />
          </div>
          <span className="text-[10px] text-gold font-semibold">{reel.likes_count + (liked ? 1 : 0)}</span>
        </button>
        {reel.vehicle_id && (
          <Link to="/vehicle/$id" params={{ id: reel.vehicle_id }} className="flex flex-col items-center gap-1">
            <div className="h-11 w-11 rounded-full bg-black/60 backdrop-blur grid place-items-center border border-gold/40">
              <ExternalLink className="h-5 w-5 text-gold" />
            </div>
            <span className="text-[10px] text-gold font-semibold">View</span>
          </Link>
        )}
        {currentUserId === reel.author_id && (
          <button onClick={del} className="h-11 w-11 rounded-full bg-black/60 backdrop-blur grid place-items-center border border-destructive/40">
            <Trash2 className="h-4 w-4 text-destructive" />
          </button>
        )}
      </div>

      {/* Bottom info */}
      <div className="absolute left-3 right-20 bottom-4 z-10 text-white">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="h-8 w-8 rounded-full gold-gradient grid place-items-center text-gold-foreground font-bold text-xs">
            {name.charAt(0).toUpperCase() || "?"}
          </div>
          <div className="text-sm font-semibold gold-text">{name || "User"}</div>
        </div>
        {reel.caption && <p className="text-sm leading-snug line-clamp-3 drop-shadow-lg">{reel.caption}</p>}
      </div>
    </div>
  );
}
