import { useEffect, useState, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { realtimeDb } from "@/lib/firebase";
import { ref, onValue, off, get, remove, set } from "firebase/database";
import { Plus, Film, Trash2, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type Story = {
  id: string;
  authorId: string;
  authorPhone: string;
  videoUrl: string;
  caption: string | null;
  createdAt: string;
  duration?: number;
  quotaMonth?: string | null;
  author_name?: string;
  is_showroom?: boolean;
};

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export function StoriesStrip() {
  const { user, access, isAdmin } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [viewing, setViewing] = useState<Story | null>(null);

  useEffect(() => {
    if (!realtimeDb) return;
    const storiesRef = ref(realtimeDb, "stories");

    const handleSnapshot = async (snapshot: { val: () => Record<string, any> | null }) => {
      try {
        const data = snapshot.val();
        if (!data) { setStories([]); return; }

        const now = Date.now();
        const allStories = Object.entries(data)
          .map(([id, s]: [string, any]) => ({
            id,
            authorId: s?.authorId || "",
            authorPhone: s?.authorPhone || "",
            videoUrl: s?.videoUrl || "",
            caption: s?.caption || null,
            createdAt: s?.createdAt || new Date().toISOString(),
            duration: s?.duration,
            quotaMonth: s?.quotaMonth,
          }))
          .filter((s) => {
            const age = now - new Date(s.createdAt).getTime();
            return age < TWENTY_FOUR_HOURS_MS;
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 20);

        const authorPhones = Array.from(new Set(allStories.map((s) => s.authorPhone).filter(Boolean)));
        const profilePromises = authorPhones.map((phone) =>
          get(ref(realtimeDb, `users/${phone}`)).catch(() => null),
        );
        const profileSnaps = await Promise.all(profilePromises);

        const profileMap = new Map<string, any>();
        authorPhones.forEach((phone, i) => {
          if (profileSnaps[i]?.exists()) profileMap.set(phone, profileSnaps[i].val());
        });

        const withAuthors = allStories.map((s) => {
          const p = profileMap.get(s.authorPhone);
          const author_name = p?.is_showroom && p.showroom_name
            ? p.showroom_name
            : `${p?.first_name ?? ""} ${p?.last_name ?? ""}`.trim() || "User";
          return { ...s, author_name, is_showroom: p?.is_showroom || p?.subscription_tier === "showroom" || p?.subscription_tier === "dealer" };
        });

        setStories(withAuthors);

        // Client-side cleanup: delete expired stories
        const expired = Object.entries(data)
          .filter(([, s]: [string, any]) => {
            const age = now - new Date(s?.createdAt || 0).getTime();
            return age >= TWENTY_FOUR_HOURS_MS;
          })
          .map(([id]) => id);

        if (expired.length > 0) {
          expired.forEach((id) => {
            remove(ref(realtimeDb, `stories/${id}`)).catch(() => {});
          });
        }
      } catch (err) {
        console.error("StoriesStrip error:", err);
        setStories([]);
      }
    };

    onValue(storiesRef, handleSnapshot);
    return () => off(storiesRef);
  }, []);

  const handleDeleteStory = useCallback(async (story: Story) => {
    try {
      await remove(ref(realtimeDb, `stories/${story.id}`));
      setStories((prev) => prev.filter((s) => s.id !== story.id));
      setViewing(null);

      // Quota refund: only for non-showroom users who have a quotaMonth set
      if (story.quotaMonth && !story.is_showroom) {
        try {
          const quotaRef = ref(realtimeDb, `story_quota/${story.authorPhone}/${story.quotaMonth}`);
          const snap = await get(quotaRef);
          if (snap.exists()) {
            const current = Number(snap.val()) || 0;
            if (current > 0) {
              await set(quotaRef, current - 1);
            }
          }
        } catch (e) {
          console.error("Failed to refund quota:", e);
        }
      }

      toast.success("Story deleted");
    } catch (err) {
      toast.error("Failed to delete story");
    }
  }, []);

  if (stories.length === 0 && !user) return null;

  return (
    <>
      <div className="border-b border-border/60 bg-gradient-to-b from-charcoal/60 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Film className="h-4 w-4 text-gold" />
            <h2 className="text-xs uppercase tracking-[0.25em] gold-text font-semibold">GRAND Stories</h2>
            <span className="text-[10px] text-muted-foreground ml-1">24h · max 30s</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            {user && access !== "locked" && (
              <Link to="/post-story" className="shrink-0 w-20 group" aria-label="Post a new story">
                <div className="relative h-28 w-20 rounded-xl overflow-hidden gold-border bg-charcoal grid place-items-center group-hover:brightness-110 transition">
                  <div className="h-9 w-9 rounded-full gold-gradient grid place-items-center">
                    <Plus className="h-5 w-5 text-gold-foreground" />
                  </div>
                </div>
                <div className="text-[10px] text-center mt-1.5 text-gold/90 truncate">Your story</div>
              </Link>
            )}
            {stories.map((s) => {
              const isOwner = user?.id === s.authorId || user?.phone === s.authorPhone;
              const canDelete = isOwner || isAdmin;
              return (
                <div key={s.id} className="shrink-0 w-20 group cursor-pointer" onClick={() => setViewing(s)}>
                  <div className="relative h-28 w-20 rounded-xl overflow-hidden gold-border bg-black">
                    {s.videoUrl ? (
                      <video
                        src={s.videoUrl}
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
                      {s.author_name || "User"}
                    </div>
                    {canDelete && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteStory(s); }}
                        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/70 grid place-items-center opacity-0 group-hover:opacity-100 transition hover:bg-red-500/80"
                        title="Delete story"
                      >
                        <Trash2 className="h-3 w-3 text-white" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Story Viewer */}
      <Dialog open={!!viewing} onOpenChange={(open) => { if (!open) setViewing(null); }}>
        <DialogContent className="max-w-sm p-0 bg-black border-gold/40 overflow-hidden">
          {viewing && (
            <div className="relative">
              <video
                src={viewing.videoUrl}
                controls
                autoPlay
                playsInline
                className="w-full max-h-[70vh] object-contain bg-black"
              />
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                <div className="text-sm font-medium text-white">{viewing.author_name || "User"}</div>
                {viewing.caption && <p className="text-xs text-white/70 mt-0.5">{viewing.caption}</p>}
                <div className="text-[10px] text-white/50 mt-1">
                  {new Date(viewing.createdAt).toLocaleString()}
                  {viewing.duration && ` · ${viewing.duration}s`}
                </div>
              </div>
              {(() => {
                const isOwner = user?.id === viewing.authorId || user?.phone === viewing.authorPhone;
                const canDelete = isOwner || isAdmin;
                if (!canDelete) return null;
                return (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleDeleteStory(viewing)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
