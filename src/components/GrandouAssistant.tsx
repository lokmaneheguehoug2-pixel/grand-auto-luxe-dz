import { useEffect, useRef, useState } from "react";
import { Bot, CarFront, ImagePlus, Loader2, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

type ChatMessage = { role: "user" | "model"; text: string; imageUrl?: string };
type ImagePayload = { mimeType: string; data: string; previewUrl: string; cloudinaryUrl?: string };

const SUGGESTIONS = ["ساعدني أختار سيارة", "كيف أنشر إعلان؟", "ما هي نصائح شراء سيارة؟", "ما أفضل سيارة في الجزائر؟"];

export function GrandouAssistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [image, setImage] = useState<ImagePayload | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleListingAnalysis = (event: Event) => {
      const detail = (event as CustomEvent<{ prompt?: string }>).detail;
      if (!detail?.prompt) return;
      setOpen(true);
      setMessage(detail.prompt);
    };
    window.addEventListener("grandou:analyze-listing", handleListingAnalysis);
    return () => window.removeEventListener("grandou:analyze-listing", handleListingAnalysis);
  }, []);

  const send = async (preset?: string) => {
    const text = (preset ?? message).trim();
    if ((!text && !image) || pending) return;
    const sentImage = image;
    const nextMessages = [...messages, { role: "user" as const, text: text || "حلّل هذه الصورة" , imageUrl: sentImage?.previewUrl }];
    setMessages([...nextMessages, { role: "model", text: "" }]);
    setMessage("");
    setImage(null);
    setPending(true);
    try {
      const response = await fetch("/api/grandou", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.map(({ role, text: historyText }) => ({ role, text: historyText })),
          image: sentImage ? { mimeType: sentImage.mimeType, data: sentImage.data, url: sentImage.cloudinaryUrl } : undefined,
        }),
      });
      if (!response.ok || !response.body) {
        const result = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(result?.error || "Grandou request failed");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let streamedText = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        streamedText += decoder.decode(value, { stream: false });
        const cleanText = streamedText.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFD]/g, "");
        setMessages([...nextMessages, { role: "model", text: cleanText }]);
      }
      streamedText += decoder.decode();
      if (!streamedText.trim()) throw new Error("Empty Grandou response");
    } catch (error) {
      console.error("[v0] Grandou chat request failed", error);
      setMessages([...nextMessages, { role: "model", text: "تعذر الاتصال بالمساعد الآن. حاول مرة أخرى بعد قليل." }]);
    } finally {
      setPending(false);
    }
  };

  const handleImage = (file?: File) => {
    if (!file || !file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const result = String(reader.result);
      try {
        const cloudinaryUrl = await uploadImageToCloudinary(file);
        setImage({ mimeType: file.type, data: result.split(",")[1] ?? "", previewUrl: cloudinaryUrl, cloudinaryUrl });
      } catch (error) {
        console.error("[v0] Grandou image upload failed", error);
        setImage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="افتح مساعد Grandou"
          className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-40 flex items-center gap-2 rounded-full border border-gold/60 bg-charcoal px-4 py-2.5 text-sm font-semibold text-gold shadow-[0_8px_32px_rgba(212,175,55,0.22)] transition-transform hover:scale-105 md:bottom-6"
        >
          <Sparkles className="h-4 w-4" /> Grandou
        </button>
      )}

      {open && (
        <section dir="rtl" aria-label="مساعد Grandou" className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-50 flex max-h-[min(680px,calc(100vh-7rem))] flex-col overflow-hidden rounded-2xl border border-gold/35 bg-background shadow-2xl sm:inset-x-auto sm:right-5 sm:w-[390px] md:bottom-6">
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
            {pending && (
              <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground" role="status" aria-live="polite">
                <Loader2 className="h-4 w-4 animate-spin text-gold" />
                <span>Grandou يكتب</span>
                <span className="inline-flex gap-0.5 text-gold" aria-hidden="true">
                  <span className="animate-bounce [animation-delay:-0.2s]">.</span>
                  <span className="animate-bounce [animation-delay:-0.1s]">.</span>
                  <span className="animate-bounce">.</span>
                </span>
              </div>
            )}
          </div>

          <form onSubmit={(event) => { event.preventDefault(); if (!event.nativeEvent.isComposing) void send(); }} className="border-t border-border/70 p-3">
            {image && <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground"><img src={image.previewUrl} alt="الصورة المرفقة" className="h-12 w-12 rounded-lg object-cover" /><button type="button" onClick={() => setImage(null)} className="text-gold">إزالة الصورة</button></div>}
            <div className="flex gap-2">
              <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={(event) => handleImage(event.target.files?.[0])} />
              <Button type="button" size="icon" variant="outline" onClick={() => fileInputRef.current?.click()} aria-label="إرفاق صورة"><ImagePlus className="h-4 w-4" /></Button>
              <Input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="اكتب سؤالك أو أرفق صورة..." aria-label="رسالتك إلى Grandou" className="bg-charcoal text-right" disabled={pending} />
              <Button type="submit" size="icon" variant="gold" disabled={pending || (!message.trim() && !image)} aria-label="إرسال"><Send className="h-4 w-4" /></Button>
            </div>
          </form>
        </section>
      )}
    </>
  );
}
