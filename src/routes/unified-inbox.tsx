import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useUnifiedInbox } from "@/hooks/use-unified-inbox";
import { UnifiedMessageItem } from "@/components/UnifiedMessageItem";
import { Inbox, Lock, Loader2, Film, MessageCircle } from "lucide-react";
import { PremiumPaywallModal } from "@/components/PremiumPaywallModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/unified-inbox")({
  head: () => ({ meta: [{ title: "Unified Inbox · GRAND Auto Luxe" }] }),
  component: UnifiedInboxPage,
});

function UnifiedInboxPage() {
  const auth = useAuth();
  const user = auth?.user;
  const loading = auth?.loading ?? true;
  const access = auth?.access ?? "locked";
  const [showPaywall, setShowPaywall] = useState(false);

  const { data: items, isLoading, error } = useUnifiedInbox();

  if (loading) {
    return (
      <div className="py-20 text-center text-muted-foreground">Loading…</div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <Inbox className="h-10 w-10 mx-auto mb-3 text-gold" />
        <h1 className="font-display text-2xl mb-2">Sign in to view your inbox</h1>
        <Link to="/auth" className="text-gold underline">
          Sign in
        </Link>
      </div>
    );
  }

  if (access === "locked") {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <Lock className="h-10 w-10 mx-auto mb-3 text-gold" />
        <h1 className="font-display text-2xl mb-2 gold-text">
          Premium Required
        </h1>
        <p className="text-sm text-muted-foreground mb-4">
          فعّل اشتراكك للوصول إلى صندوق الموحد للرسائل وتفاعلات القصص.
        </p>
        <Button variant="gold" onClick={() => setShowPaywall(true)}>
          Activate Subscription
        </Button>
        <PremiumPaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
      </div>
    );
  }

  const storyCount = items?.filter(
    (i) => i.feed_type === "story_interaction",
  ).length ?? 0;
  const messageCount = items?.filter((i) => i.feed_type === "message").length ?? 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg gold-gradient grid place-items-center">
          <Inbox className="h-5 w-5 text-gold-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl gold-text">صندوق موحد</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            Messages & Story interactions · live
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-6 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MessageCircle className="h-3.5 w-3.5 text-gold/70" />
          {messageCount} messages
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Film className="h-3.5 w-3.5 text-gold/70" />
          {storyCount} story interactions
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      ) : error ? (
        <div className="text-center py-20 premium-card gold-border rounded-2xl">
          <p className="text-sm text-red-400">
            Failed to load inbox. Please try again.
          </p>
        </div>
      ) : !items || items.length === 0 ? (
        <div className="text-center py-20 premium-card gold-border rounded-2xl">
          <Inbox className="h-10 w-10 mx-auto mb-3 text-gold/60" />
          <p className="text-muted-foreground text-sm">
            لا توجد رسائل أو تفاعلات بعد.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <UnifiedMessageItem
              key={`${item.feed_type}-${item.item_id}`}
              item={item}
            />
          ))}
        </div>
      )}
    </div>
  );
}
