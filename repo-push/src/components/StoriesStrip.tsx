import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { realtimeDb } from "@/lib/firebase";
import { ref, onValue, off, get, remove, set, push } from "firebase/database";
import { Plus, Film, Trash2, Heart, Send, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
  author_avatar?: string | null;
  is_showroom?: boolean;
  vehicleId?: string | null;
  vehicleTitle?: string | null;
  likedBy?: string[];
};

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export function StoriesStrip() {
  const { user, access, isAdmin } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);

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
            vehicleId: s?.vehicleId || null,
            vehicleTitle: s?.vehicleTitle || null,
            likedBy: Array.isArray(s?.likedBy) ? s.likedBy : [],
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
          return {
            ...s,
            author_name,
            author_avatar: p?.avatar_url || null,
            is_showroom: p?.is_showroom || p?.subscription_tier === "showroom" || p?.subscription_tier === "dealer",
          };
        });

        setStories(withAuthors);

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
      setViewingIndex(null);

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

  const handleLike = useCallback(async (story: Story) => {
    if (!user) { toast.error("Sign in to like stories"); return; }
    try {
      const likes = story.likedBy || [];
      const isLiked = likes.includes(user.id);
      const newLikes = isLiked ? likes.filter((id) => id !== user.id) : [...likes, user.id];
      await set(ref(realtimeDb, `stories/${story.id}/likedBy`), newLikes);
      setStories((prev) => prev.map((s) => s.id === story.id ? { ...s, likedBy: newLikes } : s));

      if (!isLiked && story.authorId !== user.id) {
        const notifRef = push(ref(realtimeDb, `users/${story.authorPhone}/notifications`));
        await set(notifRef, {
          id: notifRef.key,
          title: "New like on your story",
          body: `${user.phone} liked your story`,
          type: "story_like",
          storyId: story.id,
          createdAt: new Date().toISOString(),
          read: false,
        });
      }
    } catch (err) {
      console.error("Failed to like story:", err);
    }
  }, [user]);

  const handleReply = useCallback(async (story: Story, text: string) => {
    if (!user || !text.trim()) return;
    try {
      const msgRef = push(ref(realtimeDb, "messages"));
      await set(msgRef, {
        id: msgRef.key,
        vehicleId: story.vehicleId || "",
        senderId: user.id,
        recipientId: story.authorId,
        body: text.trim(),
        createdAt: new Date().toISOString(),
        readAt: null,
      });

      const notifRef = push(ref(realtimeDb, `users/${story.authorPhone}/notifications`));
      await set(notifRef, {
        id: notifRef.key,
        title: "New story reply",
        body: text.trim().slice(0, 140),
        type: "story_reply",
        storyId: story.id,
        vehicleId: story.vehicleId || "",
        createdAt: new Date().toISOString(),
        read: false,
      });

      toast.success("Reply sent");
    } catch (err) {
      toast.error("Failed to send reply");
    }
  }, [user]);

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
            {stories.map((s, i) => {
              const isOwner = user?.id === s.authorId || user?.phone === s.authorPhone;
              const canDelete = isOwner || isAdmin;
              const liked = s.likedBy?.includes(user?.id || "") ?? false;
              return (
                <div key={s.id} className="shrink-0 w-20 group cursor-pointer" onClick={() => setViewingIndex(i)}>
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
                    {liked && (
                      <Heart className="absolute top-1 left-1 h-3.5 w-3.5 fill-red-500 text-red-500" />
                    )}
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

      {/* Full-screen Story Viewer */}
      {viewingIndex !== null && stories[viewingIndex] && (
        <FullScreenStoryViewer
          stories={stories}
          startIndex={viewingIndex}
          user={user}
          isAdmin={isAdmin}
          onClose={() => setViewingIndex(null)}
          onDelete={handleDeleteStory}
          onLike={handleLike}
          onReply={handleReply}
          onNavigate={setViewingIndex}
        />
      )}
    </>
  );
}

function FullScreenStoryViewer({
  stories,
  startIndex,
  user,
  isAdmin,
  onClose,
  onDelete,
  onLike,
  onReply,
  onNavigate,
}: {
  stories: Story[];
  startIndex: number;
  user: any;
  isAdmin: boolean;
  onClose: () => void;
  onDelete: (s: Story) => void;
  onLike: (s: Story) => void;
  onReply: (s: Story, text: string) => void;
  onNavigate: (index: number) => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const [replyText, setReplyText] = useState("");
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const current = stories[index];

  const goNext = useCallback(() => {
    if (index < stories.length - 1) {
      setIndex(index + 1);
      setProgress(0);
      onNavigate(index + 1);
    } else {
      onClose();
    }
  }, [index, stories.length, onClose, onNavigate]);

  const goPrev = useCallback(() => {
    if (index > 0) {
      setIndex(index - 1);
      setProgress(0);
      onNavigate(index - 1);
    }
  }, [index, onNavigate]);

  useEffect(() => {
    setProgress(0);
    const duration = (current?.duration || 15) * 1000;
    if (progressTimer.current) clearInterval(progressTimer.current);
    progressTimer.current = setInterval(() => {
      setProgress((p) => {
        const next = p + 100 / (duration / 100);
        if (next >= 100) {
          goNext();
          return 0;
        }
        return next;
      });
    }, 100);
    return () => { if (progressTimer.current) clearInterval(progressTimer.current); };
  }, [index, current?.duration, goNext]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, onClose]);

  if (!current) return null;

  const isOwner = user?.id === current.authorId || user?.phone === current.authorPhone;
  const canDelete = isOwner || isAdmin;
  const liked = current.likedBy?.includes(user?.id || "") ?? false;
  const likeCount = current.likedBy?.length || 0;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center select-none">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-3">
        {stories.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100"
              style={{ width: i < index ? "100%" : i === index ? `${progress}%` : "0%" }}
            />
          </div>
        ))}
      </div>

      {/* Close button */}
      <button onClick={onClose} className="absolute top-6 right-4 z-30 h-9 w-9 rounded-full bg-black/50 grid place-items-center hover:bg-black/80 transition">
        <X className="h-5 w-5 text-white" />
      </button>

      {/* Delete button */}
      {canDelete && (
        <button onClick={() => onDelete(current)} className="absolute top-6 right-14 z-30 h-9 w-9 rounded-full bg-black/50 grid place-items-center hover:bg-red-500/80 transition">
          <Trash2 className="h-4 w-4 text-white" />
        </button>
      )}

      {/* Navigation zones */}
      <button onClick={goPrev} className="absolute left-0 top-0 bottom-0 w-1/3 z-10 flex items-center justify-start pl-2 group" disabled={index === 0}>
        {index > 0 && <ChevronLeft className="h-8 w-8 text-white/50 group-hover:text-white/90 transition opacity-0 group-hover:opacity-100" />}
      </button>
      <button onClick={goNext} className="absolute right-0 top-0 bottom-0 w-1/3 z-10 flex items-center justify-end pr-2 group">
        <ChevronRight className="h-8 w-8 text-white/50 group-hover:text-white/90 transition opacity-0 group-hover:opacity-100" />
      </button>

      {/* Video - full screen 16:9, no whitespace */}
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          src={current.videoUrl}
          autoPlay
          playsInline
          className="w-full h-full object-contain bg-black"
          onEnded={goNext}
          onClick={(e) => {
            const v = e.currentTarget;
            if (v.paused) v.play().catch(() => {}); else v.pause();
          }}
        />

        {/* Author info overlay - top left */}
        <div className="absolute top-10 left-4 z-20 flex items-center gap-2">
          <div className="h-9 w-9 rounded-full overflow-hidden gold-border bg-charcoal grid place-items-center">
            {current.author_avatar ? (
              <img src={current.author_avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-gold">{(current.author_name || "U").charAt(0)}</span>
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-1">
              {current.author_name || "User"}
              {current.is_showroom && (
                <svg className="h-4 w-4 text-gold" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.5 21l-1.7-3.3L4 16l3.8-1.7L9.5 11l1.7 3.3L15 16l-3.8 1.7L9.5 21zM18 14l-1-2-1 2-2 1 2 1 1 2 1-2 2-1-2-1zM14.5 6l-1.3-2.5L12 6l-2.5 1.3L12 8.5l1.2 2.5L14.5 8.5l2.5-1.2L14.5 6z" />
                </svg>
              )}
            </div>
            <div className="text-[10px] text-white/60">{new Date(current.createdAt).toLocaleString()}</div>
          </div>
        </div>

        {/* Caption + vehicle context - bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 to-transparent">
          {current.caption && (
            <p className="text-sm text-white/90 mb-2 max-w-2xl">{current.caption}</p>
          )}
          {current.vehicleTitle && (
            <Link to="/vehicle/$id" params={{ id: current.vehicleId! }} onClick={onClose} className="inline-block text-xs text-gold border border-gold/30 rounded-full px-3 py-1 hover:bg-gold/10 transition">
              {current.vehicleTitle}
            </Link>
          )}

          {/* Action bar */}
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={() => onLike(current)}
              className="flex items-center gap-1.5 text-sm text-white/90 hover:text-white transition"
            >
              <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>

            {user && !isOwner && (
              <div className="flex-1 flex gap-2">
                <Input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && replyText.trim()) {
                      onReply(current, replyText);
                      setReplyText("");
                    }
                  }}
                  placeholder="Reply to story..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm h-9"
                />
                <Button
                  variant="gold"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  disabled={!replyText.trim()}
                  onClick={() => {
                    onReply(current, replyText);
                    setReplyText("");
                  }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
