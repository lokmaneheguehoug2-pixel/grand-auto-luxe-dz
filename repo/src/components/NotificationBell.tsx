import { useEffect, useState, useCallback } from "react";
import { realtimeDb } from "@/lib/firebase";
import { ref, onValue, off, get, update } from "firebase/database";
import { useAuth } from "@/hooks/use-auth";
import { Bell, Megaphone } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Notif = {
  id: string;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
  kind: "personal" | "broadcast";
};

export function NotificationBell() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(() => {
    if (!user || !realtimeDb) return;

    const userNotifRef = ref(realtimeDb, `users/${user.phone}/notifications`);
    const broadcastRef = ref(realtimeDb, "broadcasts");

    const userUnsub = onValue(userNotifRef, (snap) => {
      const personal: Notif[] = [];
      if (snap.exists()) {
        const data = snap.val() as Record<string, any>;
        for (const [id, n] of Object.entries(data)) {
          personal.push({
            id,
            title: n.title || "Notification",
            body: n.body || null,
            read: n.read ?? false,
            created_at: n.created_at || new Date().toISOString(),
            kind: "personal",
          });
        }
      }

      get(broadcastRef).then((bSnap) => {
        const broadcasts: Notif[] = [];
        if (bSnap.exists()) {
          const bData = bSnap.val() as Record<string, any>;
          for (const [id, b] of Object.entries(bData)) {
            broadcasts.push({
              id: `b-${id}`,
              title: b.title || "Broadcast",
              body: b.body || null,
              read: false,
              created_at: b.created_at || new Date().toISOString(),
              kind: "broadcast",
            });
          }
        }
        const merged = [...personal, ...broadcasts].sort(
          (a, z) => +new Date(z.created_at) - +new Date(a.created_at)
        );
        setItems(merged);
      }).catch(() => {
        const merged = personal.sort(
          (a, z) => +new Date(z.created_at) - +new Date(a.created_at)
        );
        setItems(merged);
      });
    });

    return () => off(userNotifRef);
  }, [user]);

  useEffect(() => {
    const unsub = load();
    return () => { if (unsub) unsub(); };
  }, [load]);

  const unread = items.filter((n) => !n.read && n.kind === "personal").length;

  const markAllRead = async () => {
    if (!user || !realtimeDb) return;
    try {
      const userNotifRef = ref(realtimeDb, `users/${user.phone}/notifications`);
      const snap = await get(userNotifRef);
      if (snap.exists()) {
        const data = snap.val() as Record<string, any>;
        for (const [id, n] of Object.entries(data)) {
          if (!n.read) {
            await update(ref(realtimeDb, `users/${user.phone}/notifications/${id}`), { read: true });
          }
        }
      }
      setItems(items.map((n) => (n.kind === "personal" ? { ...n, read: true } : n)));
    } catch (e) {
      console.error("Error marking notifications as read:", e);
    }
  };

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative h-9 w-9 grid place-items-center rounded-md hover:bg-gold-soft/40 transition" aria-label="Notifications">
          <Bell className="h-4 w-4 text-gold" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full gold-gradient text-gold-foreground text-[10px] font-bold grid place-items-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 bg-charcoal border-gold/40 p-0 max-h-[70vh] overflow-y-auto">
        <div className="flex items-center justify-between p-3 border-b border-border sticky top-0 bg-charcoal z-10">
          <div className="text-sm font-semibold gold-text">Notifications</div>
          {unread > 0 && <button onClick={markAllRead} className="text-[11px] text-gold/80 hover:text-gold">Mark all read</button>}
        </div>
        {items.length === 0 && <div className="p-8 text-center text-xs text-muted-foreground">No notifications</div>}
        <div className="divide-y divide-border/60">
          {items.map((n) => (
            <div key={n.id} className={`p-3 ${n.read ? "opacity-70" : "bg-gold-soft/20"}`}>
              <div className="text-sm font-semibold flex items-center gap-1">
                {n.kind === "broadcast" && <Megaphone className="h-3 w-3 text-gold inline" />}
                {n.title}
              </div>
              {n.body && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-3">{n.body}</div>}
              <div className="text-[10px] text-gold/60 mt-1 uppercase tracking-widest">{new Date(n.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
