import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, MessageCircle, Phone, X, Tag } from "lucide-react";

const TEN_MINUTES_MS = 10 * 60 * 1000;
const STORAGE_KEY = "gal:reminder:lastShown";

function getLastShown(): number {
  if (typeof window === "undefined") return Date.now();
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? Number(stored) : 0;
  } catch {
    return 0;
  }
}

function setLastShown(ts: number): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, String(ts));
  } catch {
    /* ignore */
  }
}

type Props = {
  shouldShow: boolean;
};

export function SubscriptionReminderModal({ shouldShow }: Props) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!shouldShow) {
      setOpen(false);
      return;
    }

    const check = () => {
      const elapsed = Date.now() - getLastShown();
      if (elapsed >= TEN_MINUTES_MS) {
        setOpen(true);
      }
    };

    check();
    const interval = setInterval(check, 30_000);

    return () => clearInterval(interval);
  }, [shouldShow]);

  const handleClose = useCallback(() => {
    const now = Date.now();
    setLastShown(now);
    setOpen(false);
  }, []);

  const handleSubscribe = useCallback(() => {
    setLastShown(Date.now());
    setOpen(false);
    navigate({ to: "/plans" });
  }, [navigate]);

  if (!shouldShow) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-md bg-background border-gold/40 overflow-hidden p-0">
        <div className="relative">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-background/60 hover:bg-background/90 grid place-items-center text-muted-foreground hover:text-foreground transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="gold-gradient h-1.5 w-full" />

          <div className="p-6 text-center">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gold/10 grid place-items-center shadow-[0_0_30px_rgba(212,175,55,0.2)]">
              <Crown className="h-8 w-8 text-gold" />
            </div>

            <h2 className="font-display text-2xl gold-text mb-2">
              Upgrade to Premium!
            </h2>

            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Unlock unlimited direct chats, reveal seller phone numbers instantly, and get exclusive access to premium listings.
            </p>

            <div className="flex items-center justify-center gap-2 mb-5">
              <span className="inline-flex items-center gap-1.5 text-xs text-gold border border-gold/30 rounded-full px-3 py-1.5 bg-gold-soft/20">
                <Tag className="h-3 w-3" /> Use code <strong className="font-bold">START30</strong> for 30 days free!
              </span>
            </div>

            <div className="space-y-2 mb-5 text-left">
              <div className="flex items-center gap-2 text-sm text-foreground/80">
                <MessageCircle className="h-4 w-4 text-gold shrink-0" /> Unlimited direct chats with sellers
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground/80">
                <Phone className="h-4 w-4 text-gold shrink-0" /> Instant phone number reveal
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground/80">
                <Sparkles className="h-4 w-4 text-gold shrink-0" /> Exclusive premium listings access
              </div>
            </div>

            <Button variant="gold" className="w-full mb-2" onClick={handleSubscribe}>
              <Crown className="h-4 w-4 mr-2" /> Subscribe Now
            </Button>

            <button
              onClick={handleClose}
              className="text-xs text-muted-foreground hover:text-foreground transition"
            >
              Maybe later
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
