import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { onValue, ref, off, update, get, runTransaction, remove, set } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Film, Plus, Heart, ExternalLink, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reels")({
  head: () => ({ meta: [{ title: "Reels · GRAND Auto Luxe" }] }),
  component: ReelsPage,
});

type Reel = {
  id: string;
  authorId: string;
  authorPhone: string;
  videoUrl: string;
  caption: string | null;
  vehicleId: string | null;
  likesCount: number;
  viewsCount: number;
  createdAt: string;
  author?: { first_name: string; last_name: string; phone: string };
};

function ReelsPage() {
  const auth = useAuth();
  const user = auth?.user;
  const isAdmin = auth?.isAdmin ?? false;

  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reelsRef = ref(realtimeDb, "reels");

    const handleSnapshot = async (snapshot: { val: () => Record<string, any> | null }) => {
      const data = snapshot.val();
      if (!data) {
        setReels([]);
        setLoading(false);
        return;
      }

      const reelList: Reel[] = Object.entries(data).map(([id, v]) => ({
        id,
        authorId: v.authorId,
        authorPhone: v.authorPhone,
        videoUrl: v.videoUrl,
        caption: v.caption,
        vehicleId: v.vehicleId,
        likesCount: Number(v.likesCount) || 0,
        viewsCount: Number(v.viewsCount) || 0,
        createdAt: v.createdAt,
      }));

      reelList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const authorPhones = Array.from(new Set(reelList.map((r) => r.authorPhone)));
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

      const reelsWithAuthors = reelList.map((r) => ({
        ...r,
        author: profileMap.get(r.authorPhone),
      }));

      setReels(reelsWithAuthors);
      setLoading(false);
    };

    onValue(reelsRef, handleSnapshot);

    return () => off(reelsRef);
  }, []);

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

      {loading && (
        <div className="text-center py-24 text-muted-foreground">
          <Film className="h-12 w-12 mx-auto mb-3 text-gold/40 animate-pulse" />
          <p>Loading reels...</p>
        </div>
      )}

      {!loading && reels.length === 0 && (
        <div className="text-center py-24 text-muted-foreground">
          <Film className="h-12 w-12 mx-auto mb-3 text-gold/40" />
          <p>لا يوجد ريلز بعد. كن أول من ينشر!</p>
        </div>
      )}

      {!loading && reels.length > 0 && (
        <div className="max-w-md mx-auto h-[calc(100vh-4rem-4rem)] overflow-y-scroll snap-y snap-mandatory no-scrollbar">
          {reels.map((r) => (
            <ReelCard key={r.id} reel={r} currentUserId={user?.id} isAdmin={isAdmin} onRefresh={() => setLoading(true)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReelCard({ reel, currentUserId, isAdmin, onRefresh }: { reel: Reel; currentUserId?: string; isAdmin: boolean; onRefresh: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(Number(reel.likesCount) || 0);
  const [views, setViews] = useState(Number(reel.viewsCount) || 0);
  const viewedRef = useRef(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editCaption, setEditCaption] = useState(reel.caption || "");
  const [editVehicleId, setEditVehicleId] = useState(reel.vehicleId || "");
  const [saving, setSaving] = useState(false);

  // Check if current user is the owner
  const isOwner = currentUserId && (reel.authorId === currentUserId || reel.authorPhone === currentUserId);
  const canEdit = isOwner || isAdmin;

  // Increment view count once when the reel scrolls into view
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            video.play().then(() => setPlaying(true)).catch(() => {});
            if (!viewedRef.current) {
              viewedRef.current = true;
              try {
                const result = await runTransaction(ref(realtimeDb, `reels/${reel.id}/viewsCount`), (current) => (Number(current) || 0) + 1);
                setViews(Number(result.snapshot.val()) || 0);
              } catch (e) {
                console.error("Failed to increment views:", e);
              }
            }
          } else {
            video.pause();
            setPlaying(false);
          }
        }
      },
      { threshold: [0, 0.6, 1] },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [reel.id]);

  // Check if user already liked this reel
  useEffect(() => {
    if (!currentUserId) return;
    get(ref(realtimeDb, `reels/${reel.id}/likedBy/${currentUserId}`)).then((snap) => {
      setLiked(snap.exists());
    }).catch(() => {});
  }, [currentUserId, reel.id]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setPlaying(false);
    }
  }, []);

  const handleLike = async () => {
    if (!currentUserId) return;
    const newLiked = !liked;
    setLiked(newLiked);
    const newCount = newLiked ? likes + 1 : Math.max(0, likes - 1);
    setLikes(newCount);

    try {
      const updates: Record<string, any> = {
        [`reels/${reel.id}/likesCount`]: newCount,
        [`reels/${reel.id}/likedBy/${currentUserId}`]: newLiked ? true : null,
      };
      await update(ref(realtimeDb), updates);
    } catch (e) {
      console.error("Failed to update likes:", e);
      setLiked(!newLiked);
      setLikes(newLiked ? likes : likes + 1);
    }
  };

  const handleEdit = async () => {
    setSaving(true);
    try {
      await update(ref(realtimeDb, `reels/${reel.id}`), {
        caption: editCaption || null,
        vehicleId: editVehicleId || null,
      });
      toast.success("تم تحديث الريل");
      setShowEditDialog(false);
      onRefresh();
    } catch (e) {
      console.error("Failed to update reel:", e);
      toast.error("فشل في تحديث الريل");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await remove(ref(realtimeDb, `reels/${reel.id}`));
      toast.success("تم حذف الريل");
      setShowDeleteDialog(false);
      onRefresh();
    } catch (e) {
      console.error("Failed to delete reel:", e);
      toast.error("فشل في حذف الريل");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        className="snap-start h-full w-full flex flex-col items-center justify-center bg-black relative"
      >
        <div
          className="relative aspect-[9/16] max-h-[80vh] w-full bg-black flex items-center justify-center"
          onClick={togglePlay}
        >
          <video
            ref={videoRef}
            src={reel.videoUrl}
            className="w-full h-full object-contain"
            loop
            playsInline
            muted={false}
            preload="metadata"
          />
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
              <div className="h-16 w-16 rounded-full bg-gold/20 grid place-items-center">
                <div className="h-0 w-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1" />
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full gold-gradient grid place-items-center">
                <span className="text-xs font-bold text-gold-foreground">
                  {(reel.author?.first_name || reel.authorPhone)?.[0]?.toUpperCase() || "?"}
                </span>
              </div>
              <div className="text-sm font-medium text-white">
                {reel.author?.first_name} {reel.author?.last_name}
              </div>
            </div>
            {reel.caption && (
              <p className="text-sm text-white/80 line-clamp-2">{reel.caption}</p>
            )}
          </div>

          <div className="absolute right-3 bottom-20 flex flex-col items-center gap-5 z-10">
            <button onClick={(e) => { e.stopPropagation(); handleLike(); }} className="flex flex-col items-center gap-1">
              <Heart className={`h-7 w-7 transition-transform ${liked ? "text-red-500 fill-red-500 scale-110" : "text-white"}`} />
              <span className="text-xs text-white font-medium">{likes}</span>
            </button>
            <div className="flex flex-col items-center gap-1">
              <Eye className="h-6 w-6 text-white/80" />
              <span className="text-xs text-white/80 font-medium">{views}</span>
            </div>
            {reel.vehicleId && (
              <Link to={`/vehicle/$id`} params={{ id: reel.vehicleId }} onClick={(e) => e.stopPropagation()}>
                <ExternalLink className="h-6 w-6 text-gold hover:text-gold/80" />
              </Link>
            )}
            {canEdit && (
              <>
                <button onClick={(e) => { e.stopPropagation(); setShowEditDialog(true); }} className="flex flex-col items-center gap-1">
                  <Pencil className="h-6 w-6 text-gold hover:text-gold/80" />
                  <span className="text-xs text-gold">تعديل</span>
                </button>
                <button onClick={(e) => { e.stopPropagation(); setShowDeleteDialog(true); }} className="flex flex-col items-center gap-1">
                  <Trash2 className="h-6 w-6 text-red-500 hover:text-red-400" />
                  <span className="text-xs text-red-500">حذف</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md bg-background border-gold/40">
          <DialogHeader>
            <DialogTitle className="gold-text">تعديل الريل</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">الوصف (Caption)</Label>
              <Textarea
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                placeholder="أضف وصفاً..."
                className="bg-charcoal mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Vehicle ID (optional)</Label>
              <Input
                value={editVehicleId}
                onChange={(e) => setEditVehicleId(e.target.value)}
                placeholder="معرف السيارة"
                className="bg-charcoal mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="gold" onClick={handleEdit} disabled={saving}>
                {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
              <Button variant="ghost" onClick={() => setShowEditDialog(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm bg-background border-gold/40">
          <DialogHeader>
            <DialogTitle className="text-red-500">حذف الريل</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">هل أنت متأكد من حذف هذا الريل؟ لا يمكن التراجع عن هذا الإجراء.</p>
          <div className="flex gap-2 mt-4">
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? "جاري الحذف..." : "حذف"}
            </Button>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
