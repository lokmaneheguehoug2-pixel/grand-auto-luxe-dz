import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ChatDialog } from "@/components/ChatDialog";
import { MessageCircle, Inbox } from "lucide-react";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages · GRAND Auto Luxe" }] }),
  component: MessagesPage,
});

type Thread = {
  vehicle_id: string;
  other_id: string;
  last_body: string;
  last_at: string;
  unread: number;
  vehicle_title?: string;
  other_name?: string;
};

function MessagesPage() {
  const { user, loading } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<{ vehicleId: string; sellerId: string; title: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const load = async () => {
      const { data: rows } = await supabase
        .from("messages")
        .select("vehicle_id,sender_id,recipient_id,body,created_at,read_at")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(500);
      // Group by (vehicle_id, other_id)
      const map = new Map<string, Thread>();
      for (const m of rows ?? []) {
        const other = m.sender_id === user.id ? m.recipient_id : m.sender_id;
        const key = `${m.vehicle_id}|${other}`;
        const isUnread = !m.read_at && m.recipient_id === user.id;
        const existing = map.get(key);
        if (!existing) {
          map.set(key, {
            vehicle_id: m.vehicle_id,
            other_id: other,
            last_body: m.body,
            last_at: m.created_at,
            unread: isUnread ? 1 : 0,
          });
        } else if (isUnread) {
          existing.unread += 1;
        }
      }
      const arr = Array.from(map.values());
      const vIds = Array.from(new Set(arr.map((t) => t.vehicle_id)));
      const uIds = Array.from(new Set(arr.map((t) => t.other_id)));
      const [{ data: vs }, { data: ps }] = await Promise.all([
        vIds.length ? supabase.from("vehicles").select("id,brand,model,year").in("id", vIds) : Promise.resolve({ data: [] as any[] }),
        uIds.length ? supabase.from("profiles").select("id,first_name,last_name,showroom_name,is_showroom").in("id", uIds) : Promise.resolve({ data: [] as any[] }),
      ]);
      const vMap = new Map((vs ?? []).map((v: any) => [v.id, `${v.brand} ${v.model} · ${v.year}`]));
      const pMap = new Map((ps ?? []).map((p: any) => [p.id, p.is_showroom && p.showroom_name ? p.showroom_name : `${p.first_name} ${p.last_name}`.trim()]));
      const enriched = arr.map((t) => ({ ...t, vehicle_title: vMap.get(t.vehicle_id), other_name: pMap.get(t.other_id) }));
      if (mounted) setThreads(enriched);
    };
    load();
    const ch = supabase
      .channel(`inbox-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => load())
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(ch); };
  }, [user]);

  if (loading) return <div className="py-20 text-center text-muted-foreground">…</div>;
  if (!user) return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      <Inbox className="h-10 w-10 mx-auto mb-3 text-gold" />
      <h1 className="font-display text-2xl mb-2">Sign in to view messages</h1>
      <Link to="/auth" className="text-gold underline">Sign in</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg gold-gradient grid place-items-center"><Inbox className="h-5 w-5 text-gold-foreground" /></div>
        <div>
          <h1 className="font-display text-3xl gold-text">صندوق الرسائل</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">All conversations · live</p>
        </div>
      </div>

      {threads.length === 0 ? (
        <div className="text-center py-20 premium-card gold-border rounded-2xl">
          <MessageCircle className="h-10 w-10 mx-auto mb-3 text-gold/60" />
          <p className="text-muted-foreground text-sm">لا توجد محادثات بعد. ابدأ من صفحة أي سيارة.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map((t) => (
            <button
              key={`${t.vehicle_id}-${t.other_id}`}
              onClick={() => setActive({ vehicleId: t.vehicle_id, sellerId: t.other_id, title: t.vehicle_title ?? "Conversation" })}
              className="w-full text-left premium-card rounded-xl p-4 hover:gold-border transition flex items-center gap-3"
            >
              <div className="h-11 w-11 rounded-full gold-gradient grid place-items-center text-gold-foreground font-bold shrink-0">
                {(t.other_name ?? "?").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold truncate">{t.other_name ?? "User"}</div>
                  <div className="text-[10px] text-muted-foreground shrink-0">{new Date(t.last_at).toLocaleString()}</div>
                </div>
                <div className="text-xs text-gold/80 truncate">{t.vehicle_title}</div>
                <div className="text-sm text-muted-foreground truncate mt-0.5">{t.last_body}</div>
              </div>
              {t.unread > 0 && (
                <div className="shrink-0 min-w-[22px] h-[22px] px-1.5 rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold grid place-items-center">
                  {t.unread > 9 ? "9+" : t.unread}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {active && (
        <ChatDialogAutoOpen
          key={`${active.vehicleId}-${active.sellerId}`}
          vehicleId={active.vehicleId}
          sellerId={active.sellerId}
          title={active.title}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  );
}

function ChatDialogAutoOpen({ vehicleId, sellerId, title, onClose }: { vehicleId: string; sellerId: string; title: string; onClose: () => void }) {
  // Wrap ChatDialog by mounting and dispatching click on its trigger via internal state.
  // Simpler: provide an inline dialog by reusing ChatDialog (trigger hidden, autoOpen).
  return <ChatDialog vehicleId={vehicleId} sellerId={sellerId} vehicleTitle={title} autoOpen onClose={onClose} />;
}
