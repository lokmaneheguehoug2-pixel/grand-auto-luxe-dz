import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WILAYAS } from "@/lib/wilayas";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/edit-listing/$id")({
  head: () => ({ meta: [{ title: "Edit Listing · GRAND Auto Luxe" }] }),
  component: EditListing,
});

function EditListing() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const { data: v, isLoading } = useQuery({
    queryKey: ["vehicle-edit", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicles").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (v) {
      setF({
        model: v.model ?? "",
        description: v.description ?? "",
        phone: v.phone ?? "",
        wilaya: v.wilaya ?? "Alger",
        fixed_price: v.fixed_price ?? 0,
        starting_price: v.starting_price ?? 0,
        paint_condition: v.paint_condition ?? "",
        documents_status: v.documents_status ?? "",
      });
    }
  }, [v]);

  if (loading || isLoading) return <div className="py-24 text-center text-muted-foreground">Loading…</div>;
  if (!user || !v) return <div className="py-24 text-center text-muted-foreground">Not found.</div>;
  if (v.seller_id !== user.id)
    return (
      <div className="py-24 text-center text-muted-foreground">
        You can only edit your own listings.
      </div>
    );

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const patch: any = {
      model: f.model,
      description: f.description,
      phone: f.phone,
      wilaya: f.wilaya,
      paint_condition: f.paint_condition || null,
      documents_status: f.documents_status || null,
    };
    if (v.price_type === "fixed") patch.fixed_price = f.fixed_price;
    else patch.starting_price = f.starting_price;
    const { error } = await supabase.from("vehicles").update(patch).eq("id", id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Listing updated");
    navigate({ to: "/vehicle/$id", params: { id } });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/my-listings" className="inline-flex items-center text-xs text-muted-foreground hover:text-gold mb-4">
        <ArrowLeft className="h-3 w-3 mr-1" /> My Listings
      </Link>
      <div className="mb-6">
        <div className="text-xs uppercase tracking-[0.3em] text-gold mb-1">Edit Listing</div>
        <h1 className="font-display text-3xl">
          {v.brand} {v.model}
        </h1>
      </div>

      <form onSubmit={save} className="premium-card rounded-2xl p-6 space-y-5">
        <Field label="Model">
          <Input className="bg-charcoal" value={f.model} onChange={(e) => setF({ ...f, model: e.target.value })} />
        </Field>
        {v.price_type === "fixed" ? (
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
