import { compareStore, useCompare } from "@/lib/compare";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDZD } from "@/lib/format";
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
  images?: string[];
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
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 premium-card gold-border rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 shadow-[0_10px_40px_-10px_rgba(212,175,55,0.6)] backdrop-blur-xl bg-background/85 max-w-[95vw]">
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs uppercase tracking-widest text-gold whitespace-nowrap">
          <Scale className="h-4 w-4 shrink-0" /> <span className="hidden sm:inline">Compare ·</span> {ids.length}/4
        </div>
        <Button variant="gold" size="sm" disabled={ids.length < 2} onClick={() => setOpen(true)} className="text-xs sm:text-sm">Compare</Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" onClick={() => compareStore.clear()}>
          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-5xl max-w-[95vw] bg-background border-gold/40 p-0 overflow-hidden">
          <DialogHeader className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-border/60">
            <DialogTitle className="font-display text-lg sm:text-xl gold-text flex items-center gap-2">
              <Scale className="h-5 w-5 text-gold" /> Luxury Compare
            </DialogTitle>
          </DialogHeader>
          <CompareTable ids={ids} />
        </DialogContent>
      </Dialog>
    </>
  );
}

const ROWS: Array<{ label: string; key: keyof Vehicle; format?: (v: unknown) => string }> = [
  { label: "Year", key: "year", format: (v) => v ? String(v) : "—" },
  { label: "Mileage", key: "mileage", format: (v) => v ? `${Number(v).toLocaleString()} km` : "—" },
  { label: "Fuel", key: "fuel_type", format: (v) => v ? String(v) : "—" },
  { label: "Transmission", key: "transmission", format: (v) => v ? String(v) : "—" },
  { label: "Engine", key: "engine_type", format: (v) => v ? String(v) : "—" },
  { label: "Wilaya", key: "wilaya", format: (v) => v ? String(v) : "—" },
  { label: "Condition", key: "paint_condition", format: (v) => v ? String(v) : "—" },
];

function priceOf(v: Vehicle): number {
  return v.price_type === "fixed"
    ? (v.fixed_price ?? 0)
    : (v.current_highest_bid ?? v.starting_price ?? 0);
}

function CompareTable({ ids }: { ids: string[] }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    async function load() {
      if (!realtimeDb) { setLoading(false); setError("Database unavailable"); return; }
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
              images: data.images || [],
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

  if (loading) return <div className="py-10 text-center text-muted-foreground text-sm">Loading comparison…</div>;
  if (error) return <div className="py-10 text-center text-destructive text-sm">{error}</div>;
  if (vehicles.length === 0) return <div className="py-10 text-center text-muted-foreground text-sm">No vehicles found.</div>;

  const differingLabels = highlight ? new Set(
    ROWS.filter((row) => {
      const values = vehicles.map((v) => {
        const val = v[row.key];
        return row.format ? row.format(val) : String(val ?? "—");
      });
      return new Set(values).size > 1;
    }).map((r) => r.label)
  ) : new Set<string>();

  const priceValues = vehicles.map((v) => priceOf(v));
  const priceDiffers = highlight && new Set(priceValues).size > 1;
  const maxPrice = Math.max(...priceValues);

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-end gap-2 px-4 sm:px-5 py-2 border-b border-border/40">
        <span className="text-xs text-muted-foreground">Highlight differences</span>
        <button onClick={() => setHighlight(!highlight)} className="text-gold">
          {highlight ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
        </button>
      </div>

      {/* Desktop: Table layout */}
      <table className="hidden sm:table w-full text-sm">
        <thead>
          <tr className="border-b border-border/60">
            <th className="w-28 lg:w-32 sticky left-0 bg-background z-10 px-3 py-2 text-left text-xs uppercase tracking-widest text-muted-foreground font-medium">
              Vehicle
            </th>
            {vehicles.map((v) => (
              <th key={v.id} className="px-3 py-2 align-bottom min-w-[140px] lg:min-w-[160px]">
                <div className="relative">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-charcoal mb-2 relative">
                    {(v.photos?.[0] || v.images?.[0]) && (
                      <img src={v.photos?.[0] || v.images?.[0]} className="h-full w-full object-cover" alt={`${v.brand} ${v.model}`} />
                    )}
                    <button
                      onClick={() => compareStore.remove(v.id)}
                      className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/70 hover:bg-black grid place-items-center transition"
                    >
                      <X className="h-3 w-3 text-gold" />
                    </button>
                  </div>
                  <div className="font-display text-sm leading-tight">{v.brand} {v.model}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{v.year}</div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className={`border-b border-border/40 ${priceDiffers ? "bg-gold/10" : ""}`}>
            <td className="px-3 py-2.5 text-xs uppercase tracking-widest text-muted-foreground font-medium sticky left-0 bg-background z-10">
              Price
            </td>
            {vehicles.map((v) => {
              const p = priceOf(v);
              const isBest = highlight && priceDiffers && p === maxPrice && p > 0;
              return (
                <td key={v.id} className={`px-3 py-2.5 ${isBest ? "text-gold font-display font-bold" : "font-medium"}`}>
                  {p ? formatDZD(p) : "—"}
                  {isBest && <span className="text-[10px] text-gold/70 ml-1">★ Best</span>}
                </td>
              );
            })}
          </tr>
          {ROWS.map((r) => {
            const isDiff = differingLabels.has(r.label);
            return (
              <tr key={r.label} className={`border-b border-border/40 ${isDiff ? "bg-gold/10" : ""}`}>
                <td className="px-3 py-2.5 text-xs uppercase tracking-widest text-muted-foreground font-medium sticky left-0 bg-background z-10">
                  {r.label}
                </td>
                {vehicles.map((v) => {
                  const val = v[r.key];
                  const formatted = r.format ? r.format(val) : String(val ?? "—");
                  return (
                    <td key={v.id} className="px-3 py-2.5">
                      {formatted}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile: Card-based layout */}
      <div className="sm:hidden divide-y divide-border/40">
        {/* Vehicle headers */}
        <div className="flex gap-2 p-3 overflow-x-auto no-scrollbar">
          {vehicles.map((v) => (
            <div key={v.id} className="shrink-0 w-32">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-charcoal mb-1.5">
                {(v.photos?.[0] || v.images?.[0]) && (
                  <img src={v.photos?.[0] || v.images?.[0]} className="h-full w-full object-cover" alt={`${v.brand} ${v.model}`} />
                )}
                <button
                  onClick={() => compareStore.remove(v.id)}
                  className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/70 grid place-items-center"
                >
                  <X className="h-3 w-3 text-gold" />
                </button>
              </div>
              <div className="font-display text-xs leading-tight truncate">{v.brand} {v.model}</div>
              <div className="text-[10px] text-muted-foreground">{v.year}</div>
            </div>
          ))}
        </div>

        {/* Price row */}
        <div className={`flex items-center gap-2 px-3 py-2.5 ${priceDiffers ? "bg-gold/10" : ""}`}>
          <div className="w-20 shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Price</div>
          <div className="flex gap-2 flex-1 overflow-x-auto no-scrollbar">
            {vehicles.map((v) => {
              const p = priceOf(v);
              const isBest = highlight && priceDiffers && p === maxPrice && p > 0;
              return (
                <div key={v.id} className={`min-w-[80px] text-xs ${isBest ? "text-gold font-bold" : "font-medium"}`}>
                  {p ? formatDZD(p) : "—"}
                  {isBest && <span className="text-[9px] text-gold/70 ml-0.5">★</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Data rows */}
        {ROWS.map((r) => {
          const isDiff = differingLabels.has(r.label);
          return (
            <div key={r.label} className={`flex items-center gap-2 px-3 py-2.5 ${isDiff ? "bg-gold/10" : ""}`}>
              <div className="w-20 shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{r.label}</div>
              <div className="flex gap-2 flex-1 overflow-x-auto no-scrollbar">
                {vehicles.map((v) => {
                  const val = v[r.key];
                  const formatted = r.format ? r.format(val) : String(val ?? "—");
                  return (
                    <div key={v.id} className="min-w-[80px] text-xs">{formatted}</div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
