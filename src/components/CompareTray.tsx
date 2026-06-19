import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { compareStore, useCompare } from "@/lib/compare";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSignedUrl } from "@/hooks/use-signed-url";
import { formatDZD, formatCentimes } from "@/lib/format";
import { Scale, X, Trash2 } from "lucide-react";
import { useState } from "react";

export function CompareTray() {
  const ids = useCompare();
  const [open, setOpen] = useState(false);
  if (ids.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 premium-card gold-border rounded-2xl px-4 py-3 flex items-center gap-3 shadow-[0_10px_40px_-10px_rgba(212,175,55,0.6)] backdrop-blur-xl bg-background/85">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold">
          <Scale className="h-4 w-4" /> Compare · {ids.length}/2
        </div>
        <Button variant="gold" size="sm" disabled={ids.length < 2} onClick={() => setOpen(true)}>Open</Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => compareStore.clear()}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl bg-background border-gold/40">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl gold-text flex items-center gap-2">
              <Scale className="h-5 w-5 text-gold" /> Luxury Compare
            </DialogTitle>
          </DialogHeader>
          <CompareGrid ids={ids} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function CompareGrid({ ids }: { ids: string[] }) {
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["compare", ids],
    queryFn: async () => {
      const { data } = await supabase.from("vehicles").select("*").in("id", ids);
      return data ?? [];
    },
  });
  if (isLoading) return <div className="py-10 text-center text-muted-foreground text-sm">Loading…</div>;
  return (
    <div className="grid grid-cols-2 gap-4">
      {vehicles.map((v: any) => <CompareCol key={v.id} v={v} />)}
    </div>
  );
}

const ROWS: Array<{ label: string; get: (v: any) => string }> = [
  { label: "Year", get: (v) => String(v.year) },
  { label: "Mileage", get: (v) => `${v.mileage.toLocaleString()} km` },
  { label: "Fuel", get: (v) => v.fuel_type },
  { label: "Transmission", get: (v) => v.transmission },
  { label: "Engine", get: (v) => v.engine_type || "—" },
  { label: "Wilaya", get: (v) => v.wilaya },
  { label: "Paint", get: (v) => v.paint_condition || "—" },
  { label: "Documents", get: (v) => v.documents_status || "—" },
];

function CompareCol({ v }: { v: any }) {
  const cover = useSignedUrl("vehicle-media", v.photos?.[0]);
  const price = v.price_type === "fixed" ? v.fixed_price : (v.current_highest_bid ?? v.starting_price);
  return (
    <div className="premium-card rounded-xl overflow-hidden border border-gold/30">
      <div className="relative aspect-[4/3] bg-charcoal">
        {cover && <img src={cover} className="h-full w-full object-cover" alt="" />}
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 bg-black/70 hover:bg-black"
          onClick={() => compareStore.remove(v.id)}>
          <X className="h-3.5 w-3.5 text-gold" />
        </Button>
      </div>
      <div className="p-4">
        <div className="font-display text-lg">{v.brand} {v.model}</div>
        <div className="gold-text font-display text-xl mt-1">{formatDZD(price)}</div>
        <div className="text-[10px] text-gold/60">{formatCentimes(price)}</div>
        <div className="mt-4 space-y-1.5 text-sm">
          {ROWS.map((r) => (
            <div key={r.label} className="flex justify-between border-b border-border/40 pb-1">
              <span className="text-muted-foreground text-xs uppercase tracking-widest">{r.label}</span>
              <span className="font-medium">{r.get(v)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
