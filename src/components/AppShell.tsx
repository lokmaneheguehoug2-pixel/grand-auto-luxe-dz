import { Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Plus, Shield, LogOut, User2 } from "lucide-react";
import logoAsset from "@/assets/granda-logo.png.asset.json";
import { PaywallGate } from "@/components/PaywallGate";
import { CompareTray } from "@/components/CompareTray";

export function AppShell() {
  const { user, profile, isAdmin, signOut, access, hoursLeft } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAuthPage = pathname === "/auth";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isAuthPage && (
        <header className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-xl bg-background/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-lg gold-gradient blur-md opacity-70" />
                <img src={logoAsset.url} alt="GRAND Auto Luxe" className="relative h-11 w-11 rounded-lg object-cover ring-2 ring-gold/70 gold-glow" />
              </div>
              <div className="min-w-0">
                <div className="font-display text-lg leading-none tracking-wide truncate">
                  <span className="gold-shine font-bold">GRAND</span> <span className="gold-text">Auto Luxe</span>
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-gold/70">Algeria · Premium</div>
              </div>
            </Link>
            <nav className="flex items-center gap-1 sm:gap-2">
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/brands">Brands</Link>
              </Button>
              {user && (
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link to="/my-listings">My Listings</Link>
                </Button>
              )}
              {user && access !== "locked" && (
                <Button asChild variant="gold-outline" size="sm" className="hidden sm:inline-flex">
                  <Link to="/post"><Plus className="h-4 w-4" /> List a Vehicle</Link>
                </Button>
              )}
              {user && access === "trial" && (
                <span className="hidden md:inline-flex items-center text-xs text-gold font-semibold px-3 py-1 rounded-full border border-gold/40 bg-gold-soft">
                  Trial · {hoursLeft}h left
                </span>
              )}
              {isAdmin && (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin"><Shield className="h-4 w-4" /> Admin</Link>
                </Button>
              )}
              {user ? (
                <>
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

      {!isAuthPage && (
        <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} <span className="gold-text font-semibold">GRAND Auto Luxe</span> · Strictly vehicles only · Made in Algeria
        </footer>
      )}

      {user && access === "locked" && !isAdmin && !isAuthPage && pathname !== "/paywall" && pathname !== "/checkout" && <PaywallGate />}
      {!isAuthPage && <CompareTray />}
      <Toaster theme="dark" />
    </div>
  );
}
