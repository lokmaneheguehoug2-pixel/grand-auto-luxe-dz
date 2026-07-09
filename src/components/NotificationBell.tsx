import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, limit, updateDoc, doc } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Notif = { id: string; title: string; body: string | null; link: string | null; kind: string; read_at: string | null; created_at: string };

export function NotificationBell() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notif[]>([]);
  const unread = items.filter((n) => !n.read_at).length;

  const load = async () => {
    if (!user) return;
    try {
      const [nSnap, bSnap] = await Promise.all([
        getDocs(query(collection(db, "notifications"), where("user_id", "==", user.id), orderBy("created_at", "desc"), limit(15))),
        getDocs(query(collection(db, "broadcast_messages"), orderBy("created_at", "desc"), limit(5))),
      ]);
      const n = nSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Notif[];
      const b = bSnap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
      const merged: Notif[] = [
        ...n,
        ...b.map((m) => ({ id: `b-${m.id}`, title: `📢 ${m.title}`, body: m.body, link: null, kind: "broadcast", read_at: null, created_at: m.created_at })),
      ].sort((a, z) => +new Date(z.created_at) - +new Date(a.created_at));
      setItems(merged);
    } catch (e) {
      console.error("Error loading notifications:", e);
    }
  };

  useEffect(() => {
    if (!user) return;
    load();
    const interval = setInterval(load, 15000);
    return () => { clearInterval(interval); };
  }, [user]);

  const markAll = async () => {
    if (!user) return;
    try {
      const unreadSnap = await getDocs(query(collection(db, "notifications"), where("user_id", "==", user.id), where("read_at", "==", null)));
      await Promise.all(
        unreadSnap.docs.map((d) => updateDoc(d.ref, { read_at: new Date().toISOString() }))
      );
      load();
    } catch (e) {
      console.error("Error marking as read:", e);
    }
  };

  if (!user) return null;

  return (
    <Popover>
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
        <div className="flex items-center justify-between p-3 border-b border-border sticky top-0 bg-charcoal">
          <div className="text-sm font-semibold gold-text">التنبيهات</div>
          {unread > 0 && <button onClick={markAll} className="text-[11px] text-gold/80 hover:text-gold">تعليم كمقروءة</button>}
        </div>
        {items.length === 0 && <div className="p-8 text-center text-xs text-muted-foreground">لا توجد تنبيهات</div>}
        <div className="divide-y divide-border/60">
          {items.map((n) => (
            <div key={n.id} className={`p-3 ${n.read_at ? "opacity-70" : "bg-gold-soft/20"}`}>
              <div className="text-sm font-semibold">{n.title}</div>
              {n.body && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-3">{n.body}</div>}
              <div className="text-[10px] text-gold/60 mt-1 uppercase tracking-widest">{new Date(n.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
