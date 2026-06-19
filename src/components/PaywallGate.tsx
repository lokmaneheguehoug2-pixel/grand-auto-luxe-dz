import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Crown, ArrowRight } from "lucide-react";

export function PaywallGate() {
  return (
    <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg my-8">
        <div className="premium-card gold-border rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-12 w-12 rounded-xl gold-gradient grid place-items-center shrink-0">
              <Crown className="h-6 w-6 text-gold-foreground" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-gold">Access Locked</div>
              <h2 className="font-display text-2xl">Activate Premium</h2>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your 3-day free trial has expired. Activate your subscription to keep listing vehicles and reach the premium Algerian automotive market.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-gold/30 bg-charcoal p-4 text-center">
              <div className="text-[10px] uppercase tracking-widest text-gold/70">Monthly</div>
              <div className="gold-text font-display text-2xl mt-1">1,000 DZD</div>
            </div>
            <div className="rounded-xl border border-gold/50 bg-gold-soft p-4 text-center relative overflow-hidden">
              <div className="text-[10px] uppercase tracking-widest text-gold">Yearly · Best</div>
              <div className="gold-text font-display text-2xl mt-1">10,000 DZD</div>
            </div>
          </div>
          <Button asChild variant="gold" className="w-full mt-6">
            <Link to="/checkout">Continue to checkout <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
