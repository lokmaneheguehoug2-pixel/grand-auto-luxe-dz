import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ref, onValue, off, get } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { ChatDialog } from "@/components/ChatDialog";
import { PremiumPaywallModal } from "@/components/PremiumPaywallModal";
import { Button } from "@/components/ui/button";
import { MessageCircle, Inbox, Lock } from "lucide-react";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages · GRAND Auto Luxe" }] }),
  component: MessagesPage,
});

type Message = {
  id: string;
  vehicleId: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

type Thread = {
  vehicleId: string;
  otherId: string;
  lastBody: string;
  lastAt: string;
  unread: number;
  vehicleTitle?: string;
  otherName?: string;
};

function MessagesPage() {
  const auth = useAuth();
  const user = auth?.user;
  const loading = auth?.loading ?? true;
  const access = auth?.access ?? "locked";

  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<{ vehicleId: string; sellerId: string; title: string } | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (!user) return;

    const messagesRef = ref(realtimeDb, "messages");

    const handleMessages = async (snapshot: { val: () => Record<string, Message> | null }) => {
      const data = snapshot.val();
      if (!data) {
        setThreads([]);
        return;
      }

      const allMessages = Object.values(data) as Message[];

      // Filter messages involving current user
      const myMessages = allMessages.filter(
        (m) => m.senderId === user.id || m.recipientId === user.id
      );

      // Group by (vehicleId, otherId)
      const map = new Map<string, Thread>();

      for (const m of myMessages) {
        const otherId = m.senderId === user.id ? m.recipientId : m.senderId;
        const key = `${m.vehicleId}|${otherId}`;
        const isUnread = !m.readAt && m.recipientId === user.id;

        const existing = map.get(key);
        if (!existing) {
          map.set(key, {
            vehicleId: m.vehicleId,
            otherId,
            lastBody: m.body,
            lastAt: m.createdAt,
            unread: isUnread ? 1 : 0,
          });
        } else {
          if (new Date(m.createdAt) > new Date(existing.lastAt)) {
            existing.lastBody = m.body;
            existing.lastAt = m.createdAt;
          }
          if (isUnread) {
            existing.unread += 1;
          }
        }
      }

      const arr = Array.from(map.values());

      // Fetch vehicle titles and user names
      const enriched = await Promise.all(
        arr.map(async (t) => {
          let vehicleTitle = "Vehicle";
          let otherName = "User";

          try {
            const vehicleSnap = await get(ref(realtimeDb, `vehicles/${t.vehicleId}`));
            if (vehicleSnap.exists()) {
              const v = vehicleSnap.val();
              vehicleTitle = `${v.brand} ${v.model} · ${v.year}`;
            }
          } catch {}

          try {
            const userSnap = await get(ref(realtimeDb, `users/${t.otherId}`));
            if (userSnap.exists()) {
              const u = userSnap.val();
              otherName = `${u.first_name || ""} ${u.last_name || ""}`.trim() || t.otherId;
            }
          } catch {}

          return { ...t, vehicleTitle, otherName };
        })
      );

      // Sort by last message time
      enriched.sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
      setThreads(enriched);
    };

    onValue(messagesRef, handleMessages);
    return () => off(messagesRef);
  }, [user]);

  if (loading) return <div className="py-20 text-center text-muted-foreground">Loading…</div>;
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <Inbox className="h-10 w-10 mx-auto mb-3 text-gold" />
        <h1 className="font-display text-2xl mb-2">Sign in to view messages</h1>
        <Link to="/auth" className="text-gold underline">Sign in</Link>
      </div>
    );
  }

  if (access === "locked") {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <Lock className="h-10 w-10 mx-auto mb-3 text-gold" />
        <h1 className="font-display text-2xl mb-2 gold-text">Premium Required</h1>
        <p className="text-sm text-muted-foreground mb-4">يجب تفعيل اشتراكك لاستخدام المحادثة الداخلية والتواصل مع البائعين.</p>
        <Button variant="gold" onClick={() => setShowPaywall(true)}>
          Activate Subscription
        </Button>
        <PremiumPaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg gold-gradient grid place-items-center">
          <Inbox className="h-5 w-5 text-gold-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl gold-text">صندوق الرسائل</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">All conversations · live</p>
        </div>
      </div>

      {threads.length === 0 ? (
        <div className="text-center py-20 premium-card gold-border rounded-2xl">
          <MessageCircle className="h-10 w-10 mx-auto mb-3 text-gold/60" />
          <p className="text-muted-foreground text-sm">
            لا توجد محادثات بعد. ابدأ من صفحة أي سيارة.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map((t) => (
            <button
              key={`${t.vehicleId}-${t.otherId}`}
              onClick={() => setActive({
                vehicleId: t.vehicleId,
                sellerId: t.otherId,
                title: t.vehicleTitle ?? "Conversation"
              })}
              className="w-full text-left premium-card rounded-xl p-4 hover:gold-border transition flex items-center gap-3"
            >
              <div className="h-11 w-11 rounded-full gold-gradient grid place-items-center text-gold-foreground font-bold shrink-0">
                {(t.otherName ?? "?").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold truncate">{t.otherName ?? "User"}</div>
                  <div className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(t.lastAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-xs text-gold/80 truncate">{t.vehicleTitle}</div>
                <div className="text-sm text-muted-foreground truncate mt-0.5">{t.lastBody}</div>
              </div>
              {t.unread > 0 && (
                <div className="shrink-0 min-w-[22px] h-[22px] px-1.5 rounded-full bg-gold text-black text-[11px] font-bold grid place-items-center">
                  {t.unread > 9 ? "9+" : t.unread}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {active && (
        <ChatDialog
          vehicleId={active.vehicleId}
          sellerId={active.sellerId}
          vehicleTitle={active.title}
          autoOpen
          onClose={() => setActive(null)}
        />
      )}
    </div>
  );
}
