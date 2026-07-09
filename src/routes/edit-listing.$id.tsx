import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { realtimeDb } from "@/lib/firebase";
import { ref, get, update, remove } from "firebase/database";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WILAYAS } from "@/lib/wilayas";
import { Loader as Loader2, Save, ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/edit-listing/$id")({
  head: () => ({ meta: [{ title: "Edit Listing · GRAND Auto Luxe" }] }),
  component: EditListing,
});

function EditListing() {
  const { id } = Route.useParams();
  const auth = useAuth();
  const user = auth?.user;
  const isAdmin = auth?.isAdmin ?? false;
  const loading = auth?.loading ?? true;
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [f, setF] = useState({
    model: "",
    description: "",
    phone: "",
    wilaya: "Alger",
    fixed_price: 0,
    starting_price: 0,
    paint_condition: "",
    documents_status: "",
  });

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        const snap = await get(ref(realtimeDb, `vehicles/${id}`));
        if (snap.exists()) {
          const data = snap.val();
          setVehicle(data);
          setF({
            model: data.model ?? "",
            description: data.description ?? "",
            phone: data.phone ?? "",
            wilaya: data.wilaya ?? "Alger",
            fixed_price: data.fixed_price ?? 0,
            starting_price: data.starting_price ?? 0,
            paint_condition: data.paint_condition ?? "",
            documents_status: data.documents_status ?? "",
          });
        }
      } catch (e) {
        console.error("Error loading vehicle:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadVehicle();
  }, [id]);

  if (loading || isLoading) return <div className="py-24 text-center text-muted-foreground">Loading…</div>;
  if (!user) return <div className="py-24 text-center text-muted-foreground">Sign in required.</div>;
  if (!vehicle) return <div className="py-24 text-center text-muted-foreground">Not found.</div>;

  const isOwner = vehicle.sellerId === user.id || vehicle.seller_id === user.id || vehicle.sellerPhone === user.phone;
  if (!isOwner && !isAdmin) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        You can only edit your own listings.
      </div>
    );
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const patch: Record<string, any> = {
        model: f.model,
        description: f.description,
        phone: f.phone,
        wilaya: f.wilaya,
        paint_condition: f.paint_condition || null,
        documents_status: f.documents_status || null,
      };
      if (vehicle.price_type === "fixed") patch.fixed_price = f.fixed_price;
      else patch.starting_price = f.starting_price;

      await update(ref(realtimeDb, `vehicles/${id}`), patch);
      toast.success("Listing updated");
      navigate({ to: "/vehicle/$id", params: { id } });
    } catch (err: any) {
      toast.error(err.message || "Failed to update listing");
    } finally {
      setSaving(false);
    }
  };

  const deleteListing = async () => {
    if (!confirm("Delete this listing permanently? This cannot be undone.")) return;
    try {
      await remove(ref(realtimeDb, `vehicles/${id}`));
      toast.success("Listing deleted");
      navigate({ to: "/my-listings" });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete listing");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/my-listings" className="inline-flex items-center text-xs text-muted-foreground hover:text-gold mb-4">
        <ArrowLeft className="h-3 w-3 mr-1" /> My Listings
      </Link>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-1">Edit Listing</div>
          <h1 className="font-display text-3xl">
            {vehicle.brand} {f.model}
          </h1>
        </div>
        <Button variant="destructive" size="sm" onClick={deleteListing}>
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </div>

      <form onSubmit={save} className="premium-card rounded-2xl p-6 space-y-5">
        <Field label="Model">
          <Input className="bg-charcoal" value={f.model} onChange={(e) => setF({ ...f, model: e.target.value })} />
        </Field>
        {vehicle.price_type === "fixed" ? (
          <Field label="Price (DZD)">
            <Input
              type="number"
              className="bg-charcoal"
              value={f.fixed_price}
              onChange={(e) => setF({ ...f, fixed_price: Number(e.target.value) })}
            />
          </Field>
        ) : (
          <Field label="Starting Price (DZD)">
            <Input
              type="number"
              className="bg-charcoal"
              value={f.starting_price}
              onChange={(e) => setF({ ...f, starting_price: Number(e.target.value) })}
            />
          </Field>
        )}
        <Field label="Phone Number">
          <Input className="bg-charcoal" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        </Field>
        <Field label="Wilaya">
          <Select value={f.wilaya} onValueChange={(x) => setF({ ...f, wilaya: x })}>
            <SelectTrigger className="bg-charcoal">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {WILAYAS.map((w) => (
                <SelectItem key={w} value={w}>
                  {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Paint / Body Condition">
          <Select value={f.paint_condition || "none"} onValueChange={(x) => setF({ ...f, paint_condition: x === "none" ? "" : x })}>
            <SelectTrigger className="bg-charcoal">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— Unspecified —</SelectItem>
              <SelectItem value="original">Peinture d'origine</SelectItem>
              <SelectItem value="touched">Choc / Peinture</SelectItem>
              <SelectItem value="voile">Voile / Raccord</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Documents Status">
          <Select value={f.documents_status || "none"} onValueChange={(x) => setF({ ...f, documents_status: x === "none" ? "" : x })}>
            <SelectTrigger className="bg-charcoal">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— Unspecified —</SelectItem>
              <SelectItem value="clean">Carte Grise صافية</SelectItem>
              <SelectItem value="mujahidine">Licence Mujahidine</SelectItem>
              <SelectItem value="other">Autre</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Description">
          <Textarea
            className="bg-charcoal"
            rows={5}
            value={f.description}
            onChange={(e) => setF({ ...f, description: e.target.value })}
          />
        </Field>

        <Button variant="gold" type="submit" disabled={saving} className="w-full h-12">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
        </Button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
