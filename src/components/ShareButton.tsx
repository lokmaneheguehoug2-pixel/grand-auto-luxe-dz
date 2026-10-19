import { Share2 } from "lucide-react";
import { toast } from "sonner";

export function ShareButton({ title, text, path, className = "" }: { title: string; text?: string; path: string; className?: string }) {
  const share = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const url = new URL(path, window.location.origin).toString();
    try {
      if (navigator.share) await navigator.share({ title, text: text ?? title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("تم نسخ رابط المشاركة");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("تعذرت المشاركة، حاول مرة أخرى");
    }
  };
  return <button type="button" onClick={share} aria-label={`مشاركة ${title}`} className={`inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg border border-border/70 bg-card/60 px-2.5 text-xs text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold active:scale-95 ${className}`}><Share2 className="h-3.5 w-3.5 shrink-0" /><span>مشاركة</span></button>;
}
