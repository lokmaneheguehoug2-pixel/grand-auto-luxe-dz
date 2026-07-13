import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { realtimeDb } from "@/lib/firebase";
import { ref, onValue, off } from "firebase/database";
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

async function fetchUnifiedInbox(userId: string): Promise<UnifiedInboxItem[]> {
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client.rpc("get_unified_inbox", {
    p_user_id: userId,
  });

  if (error) {
    console.error("[unified-inbox] Failed to fetch:", error);
    throw error;
  }

  return (data ?? []) as UnifiedInboxItem[];
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
    if (!user?.id || !realtimeDb) return;

    const messagesRef = ref(realtimeDb, "messages");
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ["unified-inbox", user.id] });
    };
    onValue(messagesRef, handler);

    return () => off(messagesRef);
  }, [user?.id, queryClient]);

  useEffect(() => {
    const client = getSupabase();
    if (!client || !user?.id) return;

    const channel = client
      .channel("story-interactions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "story_interactions",
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["unified-inbox", user.id],
          });
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return query;
}
