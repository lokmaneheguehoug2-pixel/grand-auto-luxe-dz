import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Calendar, Phone, Mail, Clock, Check, X, Eye } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/my-appointments")({
  head: () => ({ meta: [{ title: "My Appointments · GRAND Auto Luxe" }] }),
  component: MyAppointmentsPage,
});

function MyAppointmentsPage() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();

  const { data = [] } = useQuery({
    queryKey: ["my-appointments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("appointments")
        .select(`
          *,
          vehicle:vehicles ( id, brand, model, year, photos )
        `)
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  if (loading) {
    return <div className="max-w-5xl mx-auto px-6 py-20 text-center text-muted-foreground">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <Calendar className="h-10 w-10 text-gold mx-auto mb-3" />
        <h1 className="font-display text-2xl mb-2">Sign in Required</h1>
        <p className="text-muted-foreground text-sm mb-4">Please sign in to view your appointments.</p>
        <Button asChild variant="gold">
          <Link to="/auth">Sign in</Link>
        </Button>
      </div>
    );
  }

  const pending = data.filter((a: any) => a.status === "pending");
  const confirmed = data.filter((a: any) => a.status === "confirmed");
  const completed = data.filter((a: any) => a.status === "completed");
  const cancelled = data.filter((a: any) => a.status === "cancelled");

  const updateStatus = async (apt: any, status: string) => {
    await supabase.from("appointments").update({ status }).eq("id", apt.id);
    toast.success("Status updated");
    qc.invalidateQueries({ queryKey: ["my-appointments", user.id] });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg gold-gradient grid place-items-center">
          <Calendar className="h-5 w-5 text-gold-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl">My Appointments</h1>
          <p className="text-sm text-muted-foreground">Manage viewing requests from interested buyers</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Pending" value={pending.length} className="bg-gold-soft text-gold" />
        <StatCard label="Confirmed" value={confirmed.length} className="bg-emerald-500/15 text-emerald-400" />
        <StatCard label="Completed" value={completed.length} className="bg-blue-500/15 text-blue-400" />
        <StatCard label="Cancelled" value={cancelled.length} className="bg-destructive/15 text-destructive" />
      </div>

      {data.length === 0 ? (
        <div className="premium-card rounded-xl p-12 text-center">
          <Calendar className="h-12 w-12 text-gold/40 mx-auto mb-4" />
          <h3 className="font-display text-xl mb-2">No Appointments Yet</h3>
          <p className="text-muted-foreground text-sm">
            When buyers request to view your vehicles, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((apt: any) => (
            <div key={apt.id} className="premium-card rounded-xl p-4 grid sm:grid-cols-[auto_1fr_auto] gap-4 items-center">
              <div className="w-20 h-16 rounded-lg bg-charcoal overflow-hidden shrink-0">
                {apt.vehicle?.photos?.[0] ? (
                  <img
                    src={apt.vehicle.photos[0]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-gold/40">
                    <Calendar className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    to="/vehicle/$id"
                    params={{ id: apt.vehicle_id }}
                    className="font-semibold hover:text-gold transition-colors"
                  >
                    {apt.vehicle?.brand} {apt.vehicle?.model} ({apt.vehicle?.year})
                  </Link>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    apt.status === 'pending' ? 'bg-gold-soft text-gold' :
                    apt.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-400' :
                    apt.status === 'completed' ? 'bg-blue-500/15 text-blue-400' :
                    'bg-destructive/15 text-destructive'
                  }`}>
                    {apt.status}
                  </span>
                </div>
                <div className="text-sm mt-1">
                  <span className="font-medium">{apt.client_name}</span>
                  <span className="text-muted-foreground mx-2">·</span>
                  <a href={`tel:${apt.client_phone}`} className="text-gold hover:underline">
                    {apt.client_phone}
                  </a>
                </div>
                {apt.preferred_date && (
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(apt.preferred_date).toLocaleDateString()}
                    {apt.preferred_time && ` at ${apt.preferred_time}`}
                  </div>
                )}
                {apt.message && (
                  <div className="text-xs text-muted-foreground mt-1 italic">"{apt.message}"</div>
                )}
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                {apt.status === "pending" && (
                  <>
                    <Button variant="gold" size="sm" onClick={() => updateStatus(apt, "confirmed")}>
                      <Check className="h-4 w-4" /> Confirm
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => updateStatus(apt, "cancelled")}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {apt.status === "confirmed" && (
                  <>
                    <Button asChild variant="gold-outline" size="sm">
                      <a href={`tel:${apt.client_phone}`}>
                        <Phone className="h-4 w-4" /> Call
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => updateStatus(apt, "completed")}>
                      <Check className="h-4 w-4" /> Mark Done
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className={`premium-card rounded-lg p-4 text-center ${className}`}>
      <div className="text-2xl font-display font-bold">{value}</div>
      <div className="text-xs uppercase tracking-widest opacity-70">{label}</div>
    </div>
  );
}
