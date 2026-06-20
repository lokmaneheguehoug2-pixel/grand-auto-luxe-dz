import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Crown, ArrowRight, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: string;
};

const PAYMENT_INFO = [
  { label: "Baridimob / CCP", value: "0079999001234567890" },
  { label: "Account holder", value: "HEGUEHOUG LOKMANE CHAOUKI" },
];

export function PremiumPaywallModal({ open, onOpenChange, reason }: Props) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const copy = (text: string, i: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(i);
    toast.success("Copié");
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black border-gold/60 max-w-md p-0 overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(212,175,55,0.25),transparent_60%),radial-gradient(circle_at_80%_100%,rgba(212,175,55,0.18),transparent_55%)]" />
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl gold-gradient grid place-items-center shrink-0 gold-glow">
                <Crown className="h-6 w-6 text-gold-foreground" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-gold">Premium Required</div>
                <h2 className="font-display text-2xl gold-shine">Activate to Publish</h2>
              </div>
            </div>

            <p className="text-sm text-white/80 leading-relaxed">
              {reason ?? "للنشر على GRAND Auto Luxe (إعلان أو ريلز) يجب تفعيل اشتراكك الفاخر."}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gold/30 bg-black/60 p-4 text-center">
                <div className="text-[10px] uppercase tracking-widest text-gold/70">Monthly</div>
                <div className="gold-text font-display text-2xl mt-1">1,000 DZD</div>
              </div>
              <div className="rounded-xl border-2 border-gold bg-gold-soft/30 p-4 text-center relative overflow-hidden">
                <div className="text-[10px] uppercase tracking-widest text-gold">Yearly · Best</div>
                <div className="gold-text font-display text-2xl mt-1">10,000 DZD</div>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-gold/30 bg-black/50 p-4 space-y-2">
              <div className="text-[10px] uppercase tracking-widest text-gold/80 mb-1">طرق الدفع · Baridimob</div>
              {PAYMENT_INFO.map((p, i) => (
                <button
                  key={p.label}
                  onClick={() => copy(p.value, i)}
                  className="w-full flex items-center justify-between text-left rounded-lg px-2 py-1.5 hover:bg-gold-soft/20 transition"
                >
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/50">{p.label}</div>
                    <div className="font-mono text-sm text-white">{p.value}</div>
                  </div>
                  {copiedIdx === i ? <Check className="h-4 w-4 text-gold" /> : <Copy className="h-4 w-4 text-gold/60" />}
                </button>
              ))}
            </div>

            <Button asChild variant="gold" className="w-full mt-5 h-12">
              <Link to="/checkout" onClick={() => onOpenChange(false)}>
                رفع وصل الدفع · Continue <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-[10px] text-white/40 text-center mt-3">
              بعد التحويل، أرفع صورة الوصل وسيقوم المسؤول بتفعيل حسابك خلال دقائق.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
