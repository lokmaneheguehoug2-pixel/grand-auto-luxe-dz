import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { realtimeDb } from "@/lib/firebase";
import { ref, push, set, onValue, off, get } from "firebase/database";
import { useAuth } from "@/hooks/use-auth";
import { MessageCircle, Send, Loader as Loader2 } from "lucide-react";
import { toast } from "sonner";

const QUICK_TEMPLATES = [
  "السلام عليكم، هل السيارة متوفرة؟",
  "ما هو آخر سعر؟",
  "هل يمكن المعاينة؟",
  "أرسل لي مزيد من الصور من فضلك.",
];

type Msg = {
  id: string;
  body: string;
  senderId: string;
  recipientId: string;
  vehicleId: string;
  createdAt: string;
  readAt: string | null;
};

export function ChatDialog({
  vehicleId,
  sellerId,
  recipientId,
  sellerPhone,
  recipientPhone,
  vehicleTitle,
  autoOpen = false,
  onClose,
}: {
  vehicleId: string;
  sellerId?: string;
  recipientId?: string;
  sellerPhone?: string;
  recipientPhone?: string;
  vehicleTitle: string;
  autoOpen?: boolean;
  onClose?: () => void;
}) {
  const auth = useAuth();
  const user = auth?.user;
  const [open, setOpen] = useState(autoOpen);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (autoOpen) setOpen(true); }, [autoOpen]);

  const otherId = recipientId || sellerId;

  useEffect(() => {
    if (!open || !user || !otherId) return;

    const messagesRef = ref(realtimeDb, "messages");

    const handleMessages = (snapshot: { val: () => Record<string, Msg> | null }) => {
      const data = snapshot.val();
      if (!data) {
        setMessages([]);
        return;
      }

      const allMessages = Object.values(data) as Msg[];
      const chatMessages = allMessages
        .filter((m) => m.vehicleId === vehicleId)
        .filter((m) =>
          (m.senderId === user.id && m.recipientId === otherId) ||
          (m.senderId === otherId && m.recipientId === user.id)
        )
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      setMessages(chatMessages);

      chatMessages.forEach(async (m) => {
        if (m.recipientId === user.id && !m.readAt) {
          await set(ref(realtimeDb, `messages/${m.id}/readAt`), new Date().toISOString());
        }
      });
    };

    onValue(messagesRef, handleMessages);

    return () => off(messagesRef);
  }, [open, user, vehicleId, otherId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const send = async (text?: string) => {
    const value = (text ?? body).trim();
    if (!value || !user || !otherId) return;
    setSending(true);
    try {
      const msgRef = push(ref(realtimeDb, "messages"));
      const msgId = msgRef.key!;

      await set(msgRef, {
        id: msgId,
        vehicleId,
        senderId: user.id,
        recipientId: otherId,
        body: value,
        createdAt: new Date().toISOString(),
        readAt: null,
      });

      const notifRef = push(ref(realtimeDb, `users/${otherId}/notifications`));
      await set(notifRef, {
        id: notifRef.key,
        title: "رسالة جديدة",
        body: value.slice(0, 140),
        vehicleId,
        createdAt: new Date().toISOString(),
        read: false,
      });

      setBody("");
    } catch (e: any) {
      toast.error(e.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) onClose?.();
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!autoOpen && (
        <DialogTrigger asChild>
          <Button variant="outline" className="h-12 w-full border-gold/50 text-gold hover:bg-gold/10">
            <MessageCircle className="h-4 w-4 mr-2" /> In-app Chat
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="bg-background border-gold/40 max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle className="font-display text-lg">
            <span className="text-gold">Chat ·</span> {vehicleTitle}
          </DialogTitle>
        </DialogHeader>

        <div ref={scrollRef} className="px-5 py-4 h-80 overflow-y-auto space-y-2 bg-charcoal/30">
          {messages.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-8">
              Start the conversation with the seller.
            </div>
          )}
          {messages.map((m) => {
            const mine = m.senderId === user.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${
                  mine ? "gold-gradient text-gold-foreground" : "bg-card border border-border"
                }`}>
                  {m.body}
                  <div className={`text-[9px] mt-1 ${mine ? "text-gold-foreground/70" : "text-muted-foreground"}`}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 pb-4 space-y-3 border-t border-border pt-3">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TEMPLATES.map((t) => (
              <button
                key={t}
                onClick={() => send(t)}
                disabled={sending}
                className="text-[11px] px-2 py-1 rounded-full border border-gold/30 text-gold/90 hover:bg-gold-soft transition-colors"
                dir="rtl"
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message…"
              className="bg-charcoal border-gold/30"
            />
            <Button
              variant="gold"
              size="icon"
              disabled={sending || !body.trim()}
              onClick={() => send()}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
