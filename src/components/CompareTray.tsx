import { compareStore, useCompare } from "@/lib/compare";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDZD, formatCentimes } from "@/lib/format";
import { Scale, X, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useState, useEffect } from "react";
import { realtimeDb } from "@/lib/firebase";
import { ref, get } from "firebase/database";

type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  engine_type?: string;
  wilaya: string;
  paint_condition?: string;
  documents_status?: string;
  photos?: string[];
  price_type: "fixed" | "auction";
  fixed_price?: number;
  current_highest_bid?: number;
  starting_price?: number;
};

export function CompareTray() {
  const ids = useCompare();
  const [open, setOpen] = useState(false);
  if (ids.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 premium-card gold-border rounded-2xl px-4 py-3 flex items-center gap-3 shadow-[0_10px_40px_-10px_rgba(212,175,55,0.6)] backdrop-blur-xl bg-background/85">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold">
          <Scale className="h-4 w-4" /> Compare · {ids.length}/4
        </div>
        <Button variant="gold" size="sm" disabled={ids.length < 2} onClick={() => setOpen(true)}>Compare Now</Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => compareStore.clear()}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl bg-background border-gold/40">
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

const ROWS: Array<{ label: string; key: keyof Vehicle; format?: (v: unknown) => string }> = [
  { label: "Price", key: "fixed_price", format: (v) => v ? formatDZD(v as number) : "—" },
  { label: "Year", key: "year", format: (v) => v ? String(v) : "—" },
  { label: "Mileage", key: "mileage", format: (v) => v ? `${Number(v).toLocaleString()} km` : "—" },
  { label: "Fuel", key: "fuel_type" },
  { label: "Transmission", key: "transmission" },
  { label: "Engine", key: "engine_type" },
  { label: "Wilaya", key: "wilaya" },
  { label: "Condition", key: "paint_condition" },
];

function CompareGrid({ ids }: { ids: string[] }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const loaded: Vehicle[] = [];

      try {
        for (const id of ids) {
          const snap = await get(ref(realtimeDb, `vehicles/${id}`));
          if (snap.exists()) {
            const data = snap.val();
            loaded.push({
              id,
              brand: data.brand || "",
              model: data.model || "",
              year: data.year || 0,
              mileage: data.mileage || 0,
              fuel_type: data.fuel_type || "",
              transmission: data.transmission || "",
              engine_type: data.engine_type,
              wilaya: data.wilaya || "",
              paint_condition: data.paint_condition,
              documents_status: data.documents_status,
              photos: data.photos || [],
              price_type: data.price_type || "fixed",
              fixed_price: data.fixed_price,
              current_highest_bid: data.current_highest_bid,
              starting_price: data.starting_price,
            });
          }
        }
        setVehicles(loaded);
      } catch (err) {
        console.error("Error loading vehicles for comparison:", err);
        setError("Failed to load vehicles");
      }
      setLoading(false);
    }
    load();
  }, [ids]);

  if (loading) return <div className="py-10 text-center text-muted-foreground text-sm">Loading…</div>;
  if (error) return <div className="py-10 text-center text-destructive text-sm">{error}</div>;
  if (vehicles.length === 0) return <div className="py-10 text-center text-muted-foreground text-sm">No vehicles found.</div>;

  // Find which rows differ
  const differingRows = highlight ? ROWS.filter((row) => {
    const values = vehicles.map((v) => {
      let val = v[row.key];
      if (row.key === "fixed_price") {
        val = v.price_type === "fixed" ? v.fixed_price : (v.current_highest_bid ?? v.starting_price);
      }
      return row.format ? row.format(val) : String(val ?? "—");
    });
    return new Set(values).size > 1;
  }) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <span className="text-xs text-muted-foreground">Highlight Differences</span>
        <button onClick={() => setHighlight(!highlight)} className="text-gold">
          {highlight ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
        </button>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(vehicles.length, 4)}, 1fr)` }}>
        {vehicles.map((v) => <CompareCol key={v.id} v={v} differingRows={differingRows} />)}
      </div>
    </div>
  );
}

function CompareCol({ v, differingRows }: { v: Vehicle; differingRows: typeof ROWS }) {
  const cover = v.photos?.[0];
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
        <div className="gold-text font-display text-xl mt-1">{formatDZD(price ?? 0)}</div>
        <div className="text-[10px] text-gold/60">{formatCentimes(price ?? 0)}</div>
        <div className="mt-4 space-y-1.5 text-sm">
          {ROWS.map((r) => {
            let val = v[r.key];
            if (r.key === "fixed_price") {
              val = v.price_type === "fixed" ? v.fixed_price : (v.current_highest_bid ?? v.starting_price);
            }
            const formatted = r.format ? r.format(val) : String(val ?? "—");
            const isDiff = differingRows.some((d) => d.label === r.label);
            return (
              <div key={r.label} className={`flex justify-between border-b pb-1 ${isDiff ? "border-gold bg-gold/10 px-2 py-0.5 -mx-2 rounded" : "border-border/40"}`}>
                <span className="text-muted-foreground text-xs uppercase tracking-widest">{r.label}</span>
                <span className="font-medium">{formatted}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
