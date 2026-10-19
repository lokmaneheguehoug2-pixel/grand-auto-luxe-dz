import { Bot } from "lucide-react";

export function AnalyzeWithGrandouButton({ listing, className = "" }: { listing: string; className?: string }) {
  const analyze = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    window.dispatchEvent(new CustomEvent("grandou:analyze-listing", { detail: { prompt: `حلّل هذا المنشور والسيارة في الجزائر واذكر السعر التقريبي ونقاط الفحص:\n${listing}` } }));
  };

  return <button type="button" onClick={analyze} aria-label="حلّل المنشور مع Grandou" className={`inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg border border-gold/50 bg-gold/5 px-2.5 text-xs font-medium text-gold transition-colors hover:bg-gold/15 active:scale-95 ${className}`}><Bot className="h-3.5 w-3.5 shrink-0" /><span>تحليل Grandou</span></button>;
}
