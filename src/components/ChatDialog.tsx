import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { MessageCircle, Send, Loader2 } from "lucide-react";
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
  sender_id: string;
  recipient_id: string;
  created_at: string;
};

export function ChatDialog({
  vehicleId,
  sellerId,
  vehicleTitle,
  autoOpen = false,
  onClose,
}: {
  vehicleId: string;
  sellerId: string;
  vehicleTitle: string;
  autoOpen?: boolean;
  onClose?: () => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(autoOpen);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (autoOpen) setOpen(true); }, [autoOpen]);

  const otherId = sellerId;

  useEffect(() => {
    if (!open || !user) return;
    let mounted = true;
    const orFilter = `and(sender_id.eq.${user.id},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${user.id})`;
    const load = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .or(orFilter)
        .order("created_at", { ascending: true });
      if (!mounted) return;
      setMessages((data ?? []) as Msg[]);
      // Mark incoming as read
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("vehicle_id", vehicleId)
        .eq("recipient_id", user.id)
        .eq("sender_id", otherId)
        .is("read_at", null);
    };
    load();
    const ch = supabase
      .channel(`thread-${vehicleId}-${user.id}-${otherId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `vehicle_id=eq.${vehicleId}` }, (payload) => {
        const m = payload.new as Msg;
        const involved = (m.sender_id === user.id && m.recipient_id === otherId) || (m.sender_id === otherId && m.recipient_id === user.id);
        if (involved) load();
      })
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(ch); };
  }, [open, user, vehicleId, otherId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const send = async (text?: string) => {
    const value = (text ?? body).trim();
    if (!value || !user) return;
    setSending(true);
    const { error, data } = await supabase
      .from("messages")
      .insert({ vehicle_id: vehicleId, sender_id: user.id, recipient_id: otherId, body: value })
      .select()
      .single();
    if (!error) {
      // Fire notification for recipient
      await supabase.from("notifications").insert({
        user_id: otherId,
        title: "💬 رسالة جديدة",
        body: value.slice(0, 140),
        link: `/messages`,
        kind: "message",
      });
    }
    setSending(false);
    if (error) { toast.error(error.message); return; }
    setBody("");
    if (data) setMessages((m) => [...m, data as Msg]);
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
          <Button variant="gold-outline" className="h-12 w-full"><MessageCircle className="h-4 w-4" /> In-app Chat</Button>
        </DialogTrigger>
      )}
      <DialogContent className="bg-background border-gold/40 max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle className="font-display text-lg">
            <span className="text-gold">Chat ·</span> {vehicleTitle}
          </DialogTitle>
        </DialogHeader>
        <DialogHeader className="px-5 pt-5">
          <DialogTitle className="font-display text-lg">
            <span className="text-gold">Chat ·</span> {vehicleTitle}
          </DialogTitle>
        </DialogHeader>

        <div ref={scrollRef} className="px-5 py-4 h-80 overflow-y-auto space-y-2 bg-charcoal/30">
          {messages.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-8">Start the conversation with the seller.</div>
          )}
          {messages.map((m) => {
            const mine = m.sender_id === user.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${mine ? "gold-gradient text-gold-foreground" : "bg-card border border-border"}`}>
                  {m.body}
                  <div className={`text-[9px] mt-1 ${mine ? "text-gold-foreground/70" : "text-muted-foreground"}`}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
            <Button variant="gold" size="icon" disabled={sending || !body.trim()} onClick={() => send()}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
