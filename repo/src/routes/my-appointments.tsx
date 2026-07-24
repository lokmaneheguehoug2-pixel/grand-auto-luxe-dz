import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Calendar, Phone, Clock, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ref, onValue, off, set, get } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

export const Route = createFileRoute("/my-appointments")({
  head: () => ({ meta: [{ title: "My Appointments · GRAND Auto Luxe" }] }),
  component: MyAppointmentsPage,
});

type Appointment = {
  id: string;
  vehicle_id: string;
  seller_id: string;
  seller_phone: string | null;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  preferred_date: string;
  preferred_time: string;
  message: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  created_at: string;
};

type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  photos: string[];
};

function MyAppointmentsPage() {
  const { user, loading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>({});
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setDataLoading(false);
      return;
    }

    const apptsRef = ref(realtimeDb, "appointments");

    const handleSnapshot = (snapshot: { val: () => Record<string, Appointment> | null }) => {
      const data = snapshot.val();
      if (data) {
        const allAppts = Object.values(data);
        // Filter to seller's appointments
        const sellerAppts = allAppts.filter((a) => a.seller_id === user.id || a.seller_phone === user.phone);
        // Sort by date descending
        const sorted = sellerAppts.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setAppointments(sorted);

        // Load vehicle data for each appointment
        sorted.forEach(async (apt) => {
          if (!vehicles[apt.vehicle_id]) {
            const vSnap = await get(ref(realtimeDb, `vehicles/${apt.vehicle_id}`));
            if (vSnap.exists()) {
              setVehicles((prev) => ({
                ...prev,
                [apt.vehicle_id]: vSnap.val(),
              }));
            }
          }
        });
      } else {
        setAppointments([]);
      }
      setDataLoading(false);
    };

    onValue(apptsRef, handleSnapshot);
    return () => off(apptsRef);
  }, [user]);

  const updateStatus = async (apt: Appointment, status: string) => {
    try {
      await set(ref(realtimeDb, `appointments/${apt.id}/status`), status);
      setAppointments(appointments.map((a) => a.id === apt.id ? { ...a, status: status as any } : a));
      toast.success("Status updated");
    } catch (e) {
      console.error("Error updating status:", e);
      toast.error("Failed to update status");
    }
  };

  if (loading || dataLoading) {
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

  const pending = appointments.filter((a) => a.status === "pending");
  const confirmed = appointments.filter((a) => a.status === "confirmed");
  const completed = appointments.filter((a) => a.status === "completed");
  const cancelled = appointments.filter((a) => a.status === "cancelled");

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

      {appointments.length === 0 ? (
        <div className="premium-card rounded-xl p-12 text-center">
          <Calendar className="h-12 w-12 text-gold/40 mx-auto mb-4" />
          <h3 className="font-display text-xl mb-2">No Appointments Yet</h3>
          <p className="text-muted-foreground text-sm">
            When buyers request to view your vehicles, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => {
            const vehicle = vehicles[apt.vehicle_id];
            return (
              <div key={apt.id} className="premium-card rounded-xl p-4 grid sm:grid-cols-[auto_1fr_auto] gap-4 items-center">
                <div className="w-20 h-16 rounded-lg bg-charcoal overflow-hidden shrink-0">
                  {vehicle?.photos?.[0] ? (
                    <img
                      src={vehicle.photos[0]}
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
                      {vehicle?.brand} {vehicle?.model} ({vehicle?.year})
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
            );
          })}
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
