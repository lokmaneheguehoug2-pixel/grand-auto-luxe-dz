import { useState } from "react";
import { Bot, CarFront, Loader2, Send, Sparkles, X } from "lucide-react";
import { askGrandou } from "@/lib/grandou.server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatMessage = { role: "user" | "model"; text: string };

const SUGGESTIONS = ["ساعدني أختار سيارة", "كيف أنشر إعلان؟", "ما هي نصائح شراء سيارة؟"];

export function GrandouAssistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);

  const send = async (preset?: string) => {
    const text = (preset ?? message).trim();
    if (!text || pending) return;
    const nextMessages = [...messages, { role: "user" as const, text }];
    setMessages(nextMessages);
    setMessage("");
    setPending(true);
    try {
      const result = await askGrandou({ data: { message: text, history: messages.slice(-10) } });
      setMessages([...nextMessages, { role: "model", text: result.text }]);
    } catch {
      setMessages([...nextMessages, { role: "model", text: "عذرًا، Grandou غير متاح مؤقتًا. حاول مرة أخرى بعد قليل." }]);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="افتح مساعد Grandou"
          className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full border border-gold/60 bg-charcoal px-4 py-3 text-sm font-semibold text-gold shadow-[0_8px_32px_rgba(212,175,55,0.22)] transition-transform hover:scale-105 md:bottom-20"
        >
          <Sparkles className="h-4 w-4" /> Grandou
        </button>
      )}

      {open && (
        <section dir="rtl" aria-label="مساعد Grandou" className="fixed inset-x-3 bottom-20 z-50 flex max-h-[min(680px,calc(100vh-6rem))] flex-col overflow-hidden rounded-2xl border border-gold/35 bg-background shadow-2xl sm:inset-x-auto sm:right-5 sm:w-[390px]">
          <header className="flex items-center justify-between border-b border-border/70 bg-charcoal/80 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl gold-gradient text-gold-foreground"><Bot className="h-5 w-5" /></div>
              <div><h2 className="font-display text-base text-gold">Grandou</h2><p className="text-[11px] text-muted-foreground">مساعدك الذكي للسيارات</p></div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="إغلاق Grandou"><X className="h-4 w-4" /></Button>
          </header>

          <div className="min-h-64 flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="space-y-4 py-5 text-center">
                <CarFront className="mx-auto h-9 w-9 text-gold" />
                <div><h3 className="font-display text-lg">مرحبًا، أنا Grandou</h3><p className="mt-1 text-sm text-muted-foreground">كيف أساعدك في رحلتك لشراء أو بيع سيارة؟</p></div>
                <div className="flex flex-wrap justify-center gap-2">{SUGGESTIONS.map((item) => <button type="button" key={item} onClick={() => send(item)} className="rounded-full border border-gold/30 px-3 py-2 text-xs text-gold transition-colors hover:bg-gold/10">{item}</button>)}</div>
              </div>
            )}
            {messages.map((item, index) => <div key={`${item.role}-${index}`} className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-6 ${item.role === "user" ? "mr-auto bg-gold text-gold-foreground" : "ml-auto border border-border bg-card"}`}>{item.text}</div>)}
            {pending && <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin text-gold" /> Grandou يفكر...</div>}
          </div>

          <form onSubmit={(event) => { event.preventDefault(); if (!event.nativeEvent.isComposing) void send(); }} className="flex gap-2 border-t border-border/70 p-3">
            <Input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="اكتب سؤالك..." aria-label="رسالتك إلى Grandou" className="bg-charcoal text-right" disabled={pending} />
            <Button type="submit" size="icon" variant="gold" disabled={pending || !message.trim()} aria-label="إرسال"><Send className="h-4 w-4" /></Button>
          </form>
        </section>
      )}
    </>
  );
}
