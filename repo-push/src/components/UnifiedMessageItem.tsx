import { Link } from "@tanstack/react-router";
import { Film, MessageCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UnifiedInboxItem } from "@/hooks/use-unified-inbox";

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString();
}

export function UnifiedMessageItem({ item }: { item: UnifiedInboxItem }) {
  const isStory = item.feed_type === "story_interaction";
  const isUnread = !item.read_at;

  return (
    <div
      className={cn(
        "w-full text-left premium-card rounded-xl p-4 hover:gold-border transition flex items-start gap-3",
        isUnread && "ring-1 ring-gold/30",
      )}
    >
      {isStory ? (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-charcoal/50">
          {item.story_video_url ? (
            <video
              src={item.story_video_url}
              className="h-full w-full object-cover"
              muted
              preload="metadata"
            />
          ) : (
            <div className="h-full w-full grid place-items-center">
              <Film className="h-5 w-5 text-gold/60" />
            </div>
          )}
          <div className="absolute inset-0 grid place-items-center bg-black/20">
            <Film className="h-4 w-4 text-white/90" />
          </div>
        </div>
      ) : (
        <div className="h-11 w-11 shrink-0 rounded-full gold-gradient grid place-items-center text-gold-foreground font-bold">
          <MessageCircle className="h-5 w-5" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold truncate text-sm">
              {item.sender_id}
            </span>
            {isStory && (
              <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-medium text-gold">
                <Film className="h-2.5 w-2.5" />
                Story Reply
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
            <Clock className="h-2.5 w-2.5" />
            {formatRelativeTime(item.created_at)}
          </div>
        </div>

        {isStory && item.story_caption && (
          <div className="text-xs text-gold/70 truncate mt-0.5">
            "{item.story_caption}"
          </div>
        )}

        {isStory && item.vehicle_id && (
          <Link
            to="/vehicle/$id"
            params={{ id: item.vehicle_id }}
            className="text-[11px] text-gold/60 underline truncate block mt-0.5"
          >
            View vehicle
          </Link>
        )}

        {!isStory && item.vehicle_id && (
          <Link
            to="/vehicle/$id"
            params={{ id: item.vehicle_id }}
            className="text-xs text-gold/80 truncate block mt-0.5"
          >
            Vehicle inquiry
          </Link>
        )}

        <div
          className={cn(
            "text-sm mt-1 truncate",
            isUnread ? "text-foreground font-medium" : "text-muted-foreground",
          )}
        >
          {item.body}
        </div>
      </div>

      {isUnread && (
        <div className="shrink-0 min-w-[8px] h-[8px] rounded-full bg-gold mt-1.5" />
      )}
    </div>
  );
}
