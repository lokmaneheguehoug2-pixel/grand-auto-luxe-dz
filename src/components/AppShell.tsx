import { Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Plus, Shield, LogOut, User as User2, Film, MessageSquare, Sparkles, Calendar } from "lucide-react";
import { PaywallGate } from "@/components/PaywallGate";
import { CompareTray } from "@/components/CompareTray";
import { NotificationBell } from "@/components/NotificationBell";
import { PremiumPaywallModal } from "@/components/PremiumPaywallModal";
import { CustomerServiceFooter } from "@/components/CustomerServiceFooter";
import { useEffect, useState, useMemo } from "react";
import { ref, onValue, off } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

function checkAdminSync(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem("gal:admin:bypass");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.isAdmin === true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

export function AppShell() {
  const auth = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isAdminStable = useMemo(() => {
    if (auth?.isAdmin) return true;
    return checkAdminSync();
  }, [auth?.isAdmin]);

  const user = auth?.user ?? null;
  const profile = auth?.profile ?? null;
  const signOut = auth?.signOut ?? (async () => {});
  const access = auth?.access ?? "locked";
  const hoursLeft = auth?.hoursLeft ?? 0;

  const isAuthPage = pathname === "/auth";
  const unreadMsgs = useUnreadMessages(user?.uid);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isAuthPage && (
        <header className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-xl bg-background/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-2.5 min-w-0">
              <img
                src="/my-logo.png.PNG"
                alt="GRANDA Auto Luxe"
                className="h-11 w-11 shrink-0 rounded-lg object-contain"
              />
              <div className="min-w-0">
                <div className="font-display text-lg leading-none tracking-wide truncate">
                  <span className="gold-shine font-bold">GRAND</span><span className="gold-text">A</span> <span className="gold-text">Auto Luxe</span>
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-gold/70">Algeria · Premium</div>
              </div>
            </Link>
            <nav className="flex items-center gap-1 sm:gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/reels"><Film className="h-4 w-4" /> <span className="hidden sm:inline">Reels</span></Link>
              </Button>
              {user && (
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link to="/my-listings">My Listings</Link>
                </Button>
              )}
              {user && (
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link to="/my-appointments"><Calendar className="h-4 w-4" /> <span className="hidden md:inline">Appointments</span></Link>
                </Button>
              )}
              {user && (
                <Button asChild variant="gold-outline" size="sm" className="hidden sm:inline-flex">
                  <Link to="/post"><Plus className="h-4 w-4" /> List a Vehicle</Link>
                </Button>
              )}
              {user && access === "trial" && (
                <span className="hidden md:inline-flex items-center text-xs text-gold font-semibold px-3 py-1 rounded-full border border-gold/40 bg-gold-soft">
                  Trial · {hoursLeft}h left
                </span>
              )}
              {isAdminStable && (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin"><Shield className="h-4 w-4" /> Dashboard</Link>
                </Button>
              )}
              {user ? (
                <>
                  <Button asChild variant="ghost" size="icon" className="relative">
                    <Link to="/messages" aria-label="Messages">
                      <MessageSquare className="h-4 w-4 text-gold" />
                      {unreadMsgs > 0 && (
                        <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold grid place-items-center">
                          {unreadMsgs > 9 ? "9+" : unreadMsgs}
                        </span>
                      )}
                    </Link>
                  </Button>
                  <NotificationBell />
                  <span className="hidden sm:inline text-sm text-muted-foreground truncate max-w-[120px]">
                    {profile?.first_name ?? <User2 className="h-4 w-4 inline" />}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => { signOut(); navigate({ to: "/auth" }); }}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button asChild variant="gold" size="sm">
                  <Link to="/auth">Sign in</Link>
                </Button>
              )}
            </nav>
          </div>
        </header>
      )}

      <main className="flex-1">
        <Outlet />
      </main>

      {!isAuthPage && <CustomerServiceFooter />}

      {user && access === "locked" && !isAdminStable && !isAuthPage && !["/paywall", "/checkout", "/post", "/post-reel"].includes(pathname) && <PaywallGate />}
      {!isAuthPage && <CompareTray />}
      {user && !isAuthPage && !isAdminStable && <FloatingPostButton />}
      <Toaster theme="dark" />
    </div>
  );
}

function FloatingPostButton() {
  const auth = useAuth();
  const access = auth?.access ?? "locked";
  const profile = auth?.profile ?? null;
  const [showPaywall, setShowPaywall] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (access === "locked") {
      setShowPaywall(true);
      return;
    }
    navigate({ to: "/post" });
  };

  if (!profile) return null;

  return (
    <>
      <button
        onClick={handleClick}
        className="fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full gold-gradient shadow-[0_0_30px_rgba(212,175,55,0.5)] grid place-items-center hover:scale-105 transition-transform active:scale-95 gold-glow"
        aria-label="Create post"
      >
        <Sparkles className="h-6 w-6 text-gold-foreground" />
      </button>
      <PremiumPaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
    </>
  );
}

function useUnreadMessages(userId?: string) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId || !realtimeDb) {
      setCount(0);
      return;
    }

    const messagesRef = ref(realtimeDb, "messages");

    const handleSnapshot = (snapshot: { val: () => Record<string, { recipientId: string; readAt: string | null }> | null }) => {
      const data = snapshot.val();
      if (!data) {
        setCount(0);
        return;
      }

      const messages = Object.values(data);
      const unread = messages.filter(
        (m) => m.recipientId === userId && m.readAt === null
      );
      setCount(unread.length);
    };

    onValue(messagesRef, handleSnapshot);

    return () => off(messagesRef);
  }, [userId]);

  return count;
}
