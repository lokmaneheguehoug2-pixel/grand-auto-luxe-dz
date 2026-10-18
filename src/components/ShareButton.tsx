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
  return <button type="button" onClick={share} aria-label={`مشاركة ${title}`} className={`inline-flex items-center gap-1 text-muted-foreground hover:text-gold ${className}`}><Share2 className="h-4 w-4" /><span className="text-[10px]">مشاركة</span></button>;
}
