import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { realtimeDb } from "@/lib/firebase";
import { ref, onValue, off, get } from "firebase/database";
import { Plus, Film } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type Story = {
  id: string;
  authorId: string;
  authorPhone: string;
  videoUrl: string;
  caption: string | null;
  createdAt: string;
  author_name?: string;
};

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export function StoriesStrip() {
  const { user, access } = useAuth();
  const [stories, setStories] = useState<(Story & { thumb?: string })[]>([]);

  useEffect(() => {
    if (!realtimeDb) return;
    const storiesRef = ref(realtimeDb, "stories");

    const handleSnapshot = async (snapshot: { val: () => Record<string, any> | null }) => {
      const data = snapshot.val();
      if (!data) {
        setStories([]);
        return;
      }

      const now = Date.now();
      const allStories = Object.entries(data)
        .map(([id, s]: [string, any]) => ({
          id,
          authorId: s.authorId,
          authorPhone: s.authorPhone,
          videoUrl: s.videoUrl,
          caption: s.caption,
          createdAt: s.createdAt,
        }))
        .filter((s) => {
          const age = now - new Date(s.createdAt).getTime();
          return age < TWENTY_FOUR_HOURS_MS;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 12);

      const authorPhones = Array.from(new Set(allStories.map((s) => s.authorPhone)));
      const profilePromises = authorPhones.map((phone) =>
        get(ref(realtimeDb, `users/${phone}`)),
      );
      const profileSnaps = await Promise.all(profilePromises);

      const profileMap = new Map<string, any>();
      authorPhones.forEach((phone, i) => {
        if (profileSnaps[i].exists()) {
          profileMap.set(phone, profileSnaps[i].val());
        }
      });

      const withAuthors = allStories.map((s) => {
        const p = profileMap.get(s.authorPhone);
        const author_name = p?.is_showroom && p.showroom_name
          ? p.showroom_name
          : `${p?.first_name ?? ""} ${p?.last_name ?? ""}`.trim();
        return { ...s, thumb: s.videoUrl, author_name };
      });

      setStories(withAuthors);

      // Client-side cleanup: delete expired stories
      const expired = Object.entries(data)
        .filter(([, s]: [string, any]) => {
          const age = now - new Date(s.createdAt).getTime();
          return age >= TWENTY_FOUR_HOURS_MS;
        })
        .map(([id]) => id);

      if (expired.length > 0) {
        import("firebase/database").then(({ remove }) => {
          expired.forEach((id) => {
            remove(ref(realtimeDb, `stories/${id}`)).catch(() => {});
          });
        });
      }
    };

    onValue(storiesRef, handleSnapshot);
    return () => off(storiesRef);
  }, []);

  if (stories.length === 0 && !user) return null;

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
              to="/post-story"
              className="shrink-0 w-20 group"
              aria-label="Post a new story"
            >
              <div className="relative h-28 w-20 rounded-xl overflow-hidden gold-border bg-charcoal grid place-items-center group-hover:brightness-110 transition">
                <div className="h-9 w-9 rounded-full gold-gradient grid place-items-center">
                  <Plus className="h-5 w-5 text-gold-foreground" />
                </div>
              </div>
              <div className="text-[10px] text-center mt-1.5 text-gold/90 truncate">Your story</div>
            </Link>
          )}
          {stories.map((s) => (
            <Link
              key={s.id}
              to="/reels"
              className="shrink-0 w-20 group"
            >
              <div className="relative h-28 w-20 rounded-xl overflow-hidden gold-border bg-black">
                {s.thumb ? (
                  <video
                    src={s.thumb}
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
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
