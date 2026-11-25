import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { get, onValue, off, ref } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";

export type UnifiedInboxItem = {
  feed_type: "message" | "story_interaction";
  item_id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  vehicle_id: string | null;
  story_id: string | null;
  story_video_url: string | null;
  story_caption: string | null;
  interaction_type: string | null;
  read_at: string | null;
  created_at: string;
};

type FirebaseMessage = {
  senderId: string;
  recipientId: string;
  body: string;
  vehicleId?: string;
  readAt?: string | null;
  createdAt: string;
};

async function fetchUnifiedInbox(userId: string): Promise<UnifiedInboxItem[]> {
  const snapshot = await get(ref(realtimeDb, "messages"));
  const messages = snapshot.val() as Record<string, FirebaseMessage> | null;

  return Object.entries(messages ?? {})
    .filter(([, message]) => message.senderId === userId || message.recipientId === userId)
    .map(([itemId, message]) => ({
      feed_type: "message",
      item_id: itemId,
      sender_id: message.senderId,
      recipient_id: message.recipientId,
      body: message.body,
      vehicle_id: message.vehicleId ?? null,
      story_id: null,
      story_video_url: null,
      story_caption: null,
      interaction_type: null,
      read_at: message.readAt ?? null,
      created_at: message.createdAt,
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function useUnifiedInbox() {
  const auth = useAuth();
  const user = auth?.user;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["unified-inbox", user?.id],
    queryFn: () => fetchUnifiedInbox(user!.id),
    enabled: !!user?.id,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!user?.id) return;

    const messagesRef = ref(realtimeDb, "messages");
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ["unified-inbox", user.id] });
    };
    onValue(messagesRef, handler);

    return () => off(messagesRef, "value", handler);
  }, [user?.id, queryClient]);

  return query;
}
