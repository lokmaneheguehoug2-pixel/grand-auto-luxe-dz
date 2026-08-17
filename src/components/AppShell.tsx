import { Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Hop as Home, Search, Plus, Film, User as User2, Shield, MessageSquare, LogOut } from "lucide-react";
import { PaywallGate } from "@/components/PaywallGate";
import { CompareTray } from "@/components/CompareTray";
import { NotificationBell } from "@/components/NotificationBell";
import { SubscriptionReminderModal } from "@/components/SubscriptionReminderModal";
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

  const showReminder = !!user && access !== "active" && !isAdminStable && !isAuthPage && !["/paywall", "/checkout", "/plans", "/post", "/post-reel"].includes(pathname);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Logo-only header */}
      {!isAuthPage && (
        <header className="sticky top-0 z-40 border-b border-border/40 backdrop-blur-xl bg-background/80">
          <div className="h-14 flex items-center px-4">
            <Link to="/" className="flex items-center gap-2.5 min-w-0">
              <img
                src="/my-logo.png.PNG"
                alt="GRANDA Auto Luxe"
                className="h-9 w-9 shrink-0 rounded-lg object-contain"
              />
              <div className="font-display text-base leading-none tracking-wide">
                <span className="gold-shine font-bold">GRAND</span><span className="gold-text">A</span> <span className="gold-text">Auto Luxe</span>
              </div>
            </Link>
          </div>
        </header>
      )}

      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Bottom navigation bar (mobile only) */}
      {!isAuthPage && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/60 backdrop-blur-xl bg-background/95">
          <div className="flex items-center justify-around h-14 px-2 safe-bottom">
            <NavButton icon={Home} label="Home" to="/" active={isActive("/")} />
            <NavButton icon={Search} label="Search" to="/brands" active={isActive("/brands")} />
            <NavButton icon={Plus} label="Add" to="/post" active={isActive("/post")} accent />
            <NavButton icon={Film} label="Reels" to="/reels" active={isActive("/reels")} />
            {user ? (
              <NavButton icon={User2} label="Profile" to="/seller/$id" params={{ id: user.phone }} active={isActive("/seller")} />
            ) : (
              <NavButton icon={User2} label="Sign in" to="/auth" active={isActive("/auth")} />
            )}
          </div>
        </nav>
      )}

      {/* Desktop nav (hidden on mobile) */}
      {!isAuthPage && (
        <nav className="hidden md:flex fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 backdrop-blur-xl bg-background/95 items-center justify-center gap-4 h-14">
          <Button asChild variant="ghost" size="sm"><Link to="/"><Home className="h-4 w-4" /> Home</Link></Button>
          <Button asChild variant="ghost" size="sm"><Link to="/brands"><Search className="h-4 w-4" /> Discover</Link></Button>
          <Button asChild variant="gold-outline" size="sm"><Link to="/post"><Plus className="h-4 w-4" /> List Vehicle</Link></Button>
          <Button asChild variant="ghost" size="sm"><Link to="/reels"><Film className="h-4 w-4" /> Reels</Link></Button>
          {user && <Button asChild variant="ghost" size="sm"><Link to="/seller/$id" params={{ id: user.phone }}><User2 className="h-4 w-4" /> Profile</Link></Button>}
          {user && (
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
          )}
          {user && <NotificationBell />}
          {isAdminStable && <Button asChild variant="ghost" size="sm"><Link to="/admin"><Shield className="h-4 w-4" /> Dashboard</Link></Button>}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground truncate max-w-[120px]">{profile?.first_name}</span>
              <Button variant="ghost" size="icon" onClick={() => { signOut(); navigate({ to: "/auth" }); }}><LogOut className="h-4 w-4" /></Button>
            </div>
          ) : (
            <Button asChild variant="gold" size="sm"><Link to="/auth">Sign in</Link></Button>
          )}
          {user && access === "trial" && (
            <span className="text-xs text-gold font-semibold px-3 py-1 rounded-full border border-gold/40 bg-gold-soft">Trial · {hoursLeft}h left</span>
          )}
        </nav>
      )}

      {!isAuthPage && <CustomerServiceFooter />}

      {user && access === "locked" && !isAdminStable && !isAuthPage && !["/paywall", "/checkout", "/post", "/post-reel"].includes(pathname) && <PaywallGate />}
      {!isAuthPage && <CompareTray />}
      <SubscriptionReminderModal shouldShow={showReminder} />
      <Toaster theme="dark" />
    </div>
  );
}

function NavButton({ icon: Icon, label, to, params, active, accent }: {
  icon: React.ElementType;
  label: string;
  to: string;
  params?: Record<string, string>;
  active: boolean;
  accent?: boolean;
}) {
  return (
    <Link to={to as any} params={params as any} className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full">
      <div className={`grid place-items-center transition-transform ${accent ? "h-8 w-8 rounded-full gold-gradient" : ""} ${active && !accent ? "scale-110" : ""}`}>
        <Icon className={`h-5 w-5 ${accent ? "text-gold-foreground" : active ? "text-gold" : "text-muted-foreground"}`} />
      </div>
      <span className={`text-[9px] leading-none ${active ? "text-gold font-medium" : "text-muted-foreground"}`}>{label}</span>
    </Link>
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
