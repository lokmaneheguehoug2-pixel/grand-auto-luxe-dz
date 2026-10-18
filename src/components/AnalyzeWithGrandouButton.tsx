import { Bot } from "lucide-react";

export function AnalyzeWithGrandouButton({ listing, className = "" }: { listing: string; className?: string }) {
  const analyze = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    window.dispatchEvent(new CustomEvent("grandou:analyze-listing", { detail: { prompt: `حلّل هذا المنشور والسيارة في الجزائر واذكر السعر التقريبي ونقاط الفحص:\n${listing}` } }));
  };

  return <button type="button" onClick={analyze} aria-label="حلّل المنشور مع Grandou" className={`inline-flex items-center gap-1 rounded-full border border-gold/40 px-2.5 py-1.5 text-xs text-gold transition-colors hover:bg-gold/10 ${className}`}><Bot className="h-3.5 w-3.5" /><span>تحليل Grandou</span></button>;
}
