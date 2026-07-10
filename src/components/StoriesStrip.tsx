import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { signUrl } from "@/hooks/use-signed-url";
import { Plus, Film } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type Reel = {
  id: string;
  author_id: string;
  video_url: string;
  caption: string | null;
  author_name?: string;
};

export function StoriesStrip() {
  const { user, access } = useAuth();
  const [reels, setReels] = useState<(Reel & { thumb?: string })[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!db) return;
      try {
        const q = query(collection(db, "stories"), orderBy("created_at", "desc"), limit(12));
        const snap = await getDocs(q);
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() } as any));

        const ids = Array.from(new Set((rows ?? []).map((r) => r.author_id)));
        let profs: any[] = [];
        if (ids.length > 0) {
          const profDocs = await Promise.all(
            ids.map((id) => getDocs(query(collection(db, "profiles"), where("id", "==", id))))
          );
          profs = profDocs.flatMap((d) => d.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        }
        const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
        const withUrls = await Promise.all(
          (rows ?? []).map(async (r) => {
            const thumb = await signUrl("reels", r.video_url, 3600);
            const p = map.get(r.author_id);
            const author_name = p?.is_showroom && p.showroom_name ? p.showroom_name : `${p?.first_name ?? ""} ${p?.last_name ?? ""}`.trim();
            return { ...r, thumb: thumb ?? undefined, author_name };
          }),
        );
        if (mounted) setReels(withUrls);
      } catch (e) {
        console.error("Error loading stories strip:", e);
      }
    };
    load();
    const interval = setInterval(load, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  if (reels.length === 0 && !user) return null;

  return (
    <div className="border-b border-border/60 bg-gradient-to-b from-charcoal/60 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2 mb-3">
          <Film className="h-4 w-4 text-gold" />
          <h2 className="text-xs uppercase tracking-[0.25em] gold-text font-semibold">GRAND Stories</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
          {user && access !== "locked" && (
            <Link
              to="/post-reel"
              className="shrink-0 w-20 group"
              aria-label="Post a new reel"
            >
              <div className="relative h-28 w-20 rounded-xl overflow-hidden gold-border bg-charcoal grid place-items-center group-hover:brightness-110 transition">
                <div className="h-9 w-9 rounded-full gold-gradient grid place-items-center">
                  <Plus className="h-5 w-5 text-gold-foreground" />
                </div>
              </div>
              <div className="text-[10px] text-center mt-1.5 text-gold/90 truncate">Your reel</div>
            </Link>
          )}
          {reels.map((r) => (
            <Link
              key={r.id}
              to="/reels"
              className="shrink-0 w-20 group"
            >
              <div className="relative h-28 w-20 rounded-xl overflow-hidden gold-border bg-black">
                {r.thumb ? (
                  <video
                    src={r.thumb}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                    onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play().catch(() => {})}
                    onMouseLeave={(e) => { const v = e.currentTarget as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center text-gold/40">
                    <Film className="h-5 w-5" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-1 inset-x-1 text-[9px] text-white text-center truncate font-semibold drop-shadow">
                  {r.author_name || "User"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
