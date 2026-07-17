import { useState, useEffect, useRef, useCallback, forwardRef } from "react";
import { ref, get } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crown, Download, Search, Car, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { formatDZD } from "@/lib/format";

type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage?: number;
  fuel_type?: string;
  transmission?: string;
  engine_type?: string;
  status: "pending" | "active" | "sold" | "rejected";
  price_type: "fixed" | "auction";
  fixed_price: number | null;
  starting_price: number | null;
  current_highest_bid?: number | null;
  wilaya: string;
  images?: string[];
  sellerPhone?: string;
  sellerId?: string;
  created_at: string;
};

type TemplateMode = "single" | "comparison";

function getVehiclePrice(v: Vehicle): number | null {
  if (v.price_type === "fixed") return v.fixed_price;
  return v.current_highest_bid ?? v.starting_price;
}

function formatMilliard(n: number | null): string {
  if (n == null) return "—";
  const milliard = n / 1_000_000_000;
  if (milliard >= 0.01) return `${milliard.toFixed(2)} Milliard`;
  const million = n / 1_000_000;
  if (million >= 1) return `${million.toFixed(0)} Million`;
  return formatDZD(n);
}

export function SocialImageGenerator() {
  const [mode, setMode] = useState<TemplateMode>("single");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchA, setSearchA] = useState("");
  const [searchB, setSearchB] = useState("");
  const [selectedA, setSelectedA] = useState<Vehicle | null>(null);
  const [selectedB, setSelectedB] = useState<Vehicle | null>(null);
  const [singleSearch, setSingleSearch] = useState("");
  const [singleSelected, setSingleSelected] = useState<Vehicle | null>(null);
  const [exporting, setExporting] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const snap = await get(ref(realtimeDb, "vehicles"));
      if (snap.exists()) {
        const all = snap.val() as Record<string, any>;
        const list: Vehicle[] = Object.entries(all)
          .filter(([, v]) => v.status === "active")
          .map(([id, v]) => ({ ...v, id }))
          .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        setVehicles(list);
      }
    }
    load();
  }, []);

  const filterVehicles = useCallback((q: string) => {
    if (!q.trim()) return vehicles.slice(0, 8);
    const lower = q.toLowerCase();
    return vehicles.filter(v =>
      `${v.brand} ${v.model} ${v.year}`.toLowerCase().includes(lower) ||
      v.wilaya?.toLowerCase().includes(lower)
    ).slice(0, 8);
  }, [vehicles]);

  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return;
    if (mode === "single" && !singleSelected) { toast.error("Select a listing first"); return; }
    if (mode === "comparison" && (!selectedA || !selectedB)) { toast.error("Select both cars first"); return; }

    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0b0b0b",
        logging: false,
      });
      const link = document.createElement("a");
      const filename = mode === "single"
        ? `single-${singleSelected?.brand}-${singleSelected?.model}-${singleSelected?.year}.png`
        : `vs-${selectedA?.brand}-vs-${selectedB?.brand}.png`;
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Image exported successfully");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export image");
    } finally {
      setExporting(false);
    }
  }, [mode, singleSelected, selectedA, selectedB]);

  const showPreview = mode === "single" ? !!singleSelected : !!selectedA && !!selectedB;

  return (
    <div className="space-y-6">
      <div className="premium-card rounded-xl p-5 border border-gold/20">
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon className="h-5 w-5 text-gold" />
          <h2 className="font-display text-lg gold-text">Social Media Image Generator</h2>
        </div>

        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setMode("single")}
            className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition ${
              mode === "single"
                ? "border-gold bg-gold/10 text-gold"
                : "border-border bg-charcoal text-muted-foreground hover:text-foreground"
            }`}
          >
            <Car className="h-4 w-4 inline mr-2" /> Single Post
          </button>
          <button
            onClick={() => setMode("comparison")}
            className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition ${
              mode === "comparison"
                ? "border-gold bg-gold/10 text-gold"
                : "border-border bg-charcoal text-muted-foreground hover:text-foreground"
            }`}
          >
            <Crown className="h-4 w-4 inline mr-2" /> Comparison Post
          </button>
        </div>

        {mode === "single" && (
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Select Listing</label>
            <div className="relative">
              <Input
                value={singleSearch}
                onChange={(e) => setSingleSearch(e.target.value)}
                placeholder="Search by brand, model, or wilaya..."
                className="bg-charcoal pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {!singleSelected && singleSearch && (
              <div className="space-y-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-charcoal">
                {filterVehicles(singleSearch).map(v => (
                  <button
                    key={v.id}
                    onClick={() => { setSingleSelected(v); setSingleSearch(""); }}
                    className="w-full text-left px-3 py-2 hover:bg-gold/10 transition flex items-center gap-3"
                  >
                    {v.images?.[0] ? (
                      <img src={v.images[0]} className="h-10 w-14 rounded object-cover" alt="" />
                    ) : (
                      <div className="h-10 w-14 rounded bg-border grid place-items-center"><Car className="h-4 w-4 text-muted-foreground" /></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{v.brand} {v.model} {v.year}</div>
                      <div className="text-xs text-muted-foreground">{v.wilaya} · {formatDZD(getVehiclePrice(v))}</div>
                    </div>
                  </button>
                ))}
                {filterVehicles(singleSearch).length === 0 && (
                  <div className="px-3 py-4 text-sm text-muted-foreground text-center">No active listings found</div>
                )}
              </div>
            )}
            {singleSelected && (
              <div className="flex items-center gap-3 rounded-lg border border-gold/30 bg-gold-soft/10 p-3">
                {singleSelected.images?.[0] ? (
                  <img src={singleSelected.images[0]} className="h-12 w-16 rounded object-cover" alt="" />
                ) : (
                  <div className="h-12 w-16 rounded bg-border grid place-items-center"><Car className="h-5 w-5 text-muted-foreground" /></div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{singleSelected.brand} {singleSelected.model} {singleSelected.year}</div>
                  <div className="text-xs text-muted-foreground">{singleSelected.wilaya} · {formatDZD(getVehiclePrice(singleSelected))}</div>
                </div>
                <button onClick={() => setSingleSelected(null)} className="text-muted-foreground hover:text-destructive">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {mode === "comparison" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CarSelector
              label="Car A"
              search={searchA}
              setSearch={setSearchA}
              selected={selectedA}
              onSelect={setSelectedA}
              filterVehicles={filterVehicles}
            />
            <CarSelector
              label="Car B"
              search={searchB}
              setSearch={setSearchB}
              selected={selectedB}
              onSelect={setSelectedB}
              filterVehicles={filterVehicles}
            />
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <Button variant="gold" onClick={handleExport} disabled={exporting || !showPreview}>
            {exporting ? (
              <><span className="h-4 w-4 border-2 border-gold-foreground/30 border-t-gold-foreground rounded-full animate-spin inline-block mr-2" /> Exporting...</>
            ) : (
              <><Download className="h-4 w-4 mr-2" /> Download PNG</>
            )}
          </Button>
        </div>
      </div>

      <div className="flex justify-center">
        {mode === "single" ? (
          singleSelected ? (
            <SinglePostTemplate ref={canvasRef} vehicle={singleSelected} />
          ) : (
            <EmptyPreview />
          )
        ) : (
          selectedA && selectedB ? (
            <ComparisonPostTemplate ref={canvasRef} carA={selectedA} carB={selectedB} />
          ) : (
            <EmptyPreview />
          )
        )}
      </div>
    </div>
  );
}

function CarSelector({ label, search, setSearch, selected, onSelect, filterVehicles }: {
  label: string;
  search: string;
  setSearch: (v: string) => void;
  selected: Vehicle | null;
  onSelect: (v: Vehicle | null) => void;
  filterVehicles: (q: string) => Vehicle[];
}) {
  return (
    <div className="space-y-3">
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <div className="relative">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${label}...`}
          className="bg-charcoal pr-10"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
      {!selected && search && (
        <div className="space-y-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-charcoal">
          {filterVehicles(search).map(v => (
            <button
              key={v.id}
              onClick={() => { onSelect(v); setSearch(""); }}
              className="w-full text-left px-3 py-2 hover:bg-gold/10 transition flex items-center gap-3"
            >
              {v.images?.[0] ? (
                <img src={v.images[0]} className="h-10 w-14 rounded object-cover" alt="" />
              ) : (
                <div className="h-10 w-14 rounded bg-border grid place-items-center"><Car className="h-4 w-4 text-muted-foreground" /></div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{v.brand} {v.model} {v.year}</div>
                <div className="text-xs text-muted-foreground">{formatDZD(getVehiclePrice(v))}</div>
              </div>
            </button>
          ))}
        </div>
      )}
      {selected && (
        <div className="flex items-center gap-3 rounded-lg border border-gold/30 bg-gold-soft/10 p-3">
          {selected.images?.[0] ? (
            <img src={selected.images[0]} className="h-12 w-16 rounded object-cover" alt="" />
          ) : (
            <div className="h-12 w-16 rounded bg-border grid place-items-center"><Car className="h-5 w-5 text-muted-foreground" /></div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{selected.brand} {selected.model}</div>
            <div className="text-xs text-muted-foreground">{selected.year}</div>
          </div>
          <button onClick={() => onSelect(null)} className="text-muted-foreground hover:text-destructive">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyPreview() {
  return (
    <div className="w-[270px] h-[480px] rounded-2xl border border-dashed border-border bg-charcoal/50 grid place-items-center">
      <div className="text-center">
        <ImageIcon className="h-12 w-12 text-muted-foreground/20 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Select a listing to preview</p>
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#111] border border-gold/10 px-2 py-1.5">
      <div className="text-[7px] uppercase tracking-wider text-gold/50">{label}</div>
      <div className="text-[9px] text-white font-medium truncate">{value}</div>
    </div>
  );
}

const SinglePostTemplate = forwardRef<HTMLDivElement, { vehicle: Vehicle }>(({ vehicle }, ref) => {
  const price = getVehiclePrice(vehicle);
  const cover = vehicle.images?.[0];

  return (
    <div
      ref={ref}
      className="relative w-[270px] h-[480px] overflow-hidden rounded-2xl"
      style={{ background: "#0b0b0b", fontFamily: "'Playfair Display', serif" }}
    >
      <div className="absolute top-0 left-0 right-0 h-1 gold-gradient" />
      <div className="pt-5 pb-3 text-center">
        <div className="font-display text-lg">
          <span className="gold-shine font-bold">GRAND</span>
          <span className="gold-text">A</span>
          <span className="gold-text"> Auto Luxe</span>
        </div>
        <div className="text-[8px] uppercase tracking-[0.25em] text-gold/60 mt-0.5">Algeria · Premium</div>
      </div>
      <div className="px-4">
        {cover ? (
          <div className="relative rounded-xl overflow-hidden h-[200px]">
            <img src={cover} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" crossOrigin="anonymous" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        ) : (
          <div className="h-[200px] rounded-xl bg-[#1a1a1a] grid place-items-center">
            <Car className="h-12 w-12 text-gold/20" />
          </div>
        )}
      </div>
      <div className="px-5 mt-3 text-center">
        <h2 className="font-display text-xl text-white">{vehicle.brand} {vehicle.model}</h2>
        <div className="text-xs text-gold/70 mt-0.5">{vehicle.year} · {vehicle.wilaya}</div>
      </div>
      <div className="px-5 mt-3 grid grid-cols-2 gap-2">
        <SpecRow label="Engine" value={vehicle.engine_type || "—"} />
        <SpecRow label="Fuel" value={vehicle.fuel_type || "—"} />
        <SpecRow label="Gearbox" value={vehicle.transmission || "—"} />
        <SpecRow label="Mileage" value={`${(vehicle.mileage || 0).toLocaleString()} km`} />
      </div>
      <div className="absolute bottom-5 left-0 right-0 text-center">
        <div className="text-[9px] uppercase tracking-widest text-gold/50">Price</div>
        <div className="font-display text-2xl gold-text">{formatMilliard(price)}</div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 gold-gradient" />
    </div>
  );
});
SinglePostTemplate.displayName = "SinglePostTemplate";

const ComparisonPostTemplate = forwardRef<HTMLDivElement, { carA: Vehicle; carB: Vehicle }>(({ carA, carB }, ref) => {
  const priceA = getVehiclePrice(carA);
  const priceB = getVehiclePrice(carB);
  const coverA = carA.images?.[0];
  const coverB = carB.images?.[0];

  const rows = [
    { label: "Model", a: `${carA.brand} ${carA.model}`, b: `${carB.brand} ${carB.model}` },
    { label: "Year", a: String(carA.year), b: String(carB.year) },
    { label: "Engine", a: carA.engine_type || "—", b: carB.engine_type || "—" },
    { label: "Gearbox", a: carA.transmission || "—", b: carB.transmission || "—" },
    { label: "Fuel", a: carA.fuel_type || "—", b: carB.fuel_type || "—" },
    { label: "Mileage", a: `${(carA.mileage || 0).toLocaleString()} km`, b: `${(carB.mileage || 0).toLocaleString()} km` },
    { label: "Price", a: formatMilliard(priceA), b: formatMilliard(priceB) },
  ];

  return (
    <div
      ref={ref}
      className="relative w-[270px] h-[570px] overflow-hidden rounded-2xl"
      style={{ background: "#0b0b0b", fontFamily: "'Playfair Display', serif" }}
    >
      <div className="absolute top-0 left-0 right-0 h-1 gold-gradient" />
      <div className="pt-4 pb-2 text-center">
        <div className="font-display text-base">
          <span className="gold-shine font-bold">GRAND</span>
          <span className="gold-text">A</span>
          <span className="gold-text"> Auto Luxe</span>
        </div>
        <div className="text-[7px] uppercase tracking-[0.25em] text-gold/60 mt-0.5">Algeria · Premium</div>
      </div>

      <div className="px-3 mt-1 relative">
        <div className="grid grid-cols-2 gap-2">
          <div className="relative rounded-lg overflow-hidden h-[140px]">
            {coverA ? (
              <img src={coverA} alt={carA.brand} className="w-full h-full object-cover" crossOrigin="anonymous" />
            ) : (
              <div className="w-full h-full bg-[#1a1a1a] grid place-items-center"><Car className="h-8 w-8 text-gold/20" /></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-1 left-1 right-1">
              <div className="text-[9px] font-bold text-white truncate">{carA.brand} {carA.model}</div>
              <div className="text-[7px] text-gold/80">{carA.year}</div>
            </div>
          </div>

          <div className="relative rounded-lg overflow-hidden h-[140px]">
            {coverB ? (
              <img src={coverB} alt={carB.brand} className="w-full h-full object-cover" crossOrigin="anonymous" />
            ) : (
              <div className="w-full h-full bg-[#1a1a1a] grid place-items-center"><Car className="h-8 w-8 text-gold/20" /></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-1 left-1 right-1">
              <div className="text-[9px] font-bold text-white truncate">{carB.brand} {carB.model}</div>
              <div className="text-[7px] text-gold/80">{carB.year}</div>
            </div>
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="h-10 w-10 rounded-full gold-gradient grid place-items-center shadow-[0_0_20px_rgba(212,175,55,0.5)] border-2 border-[#0b0b0b]">
            <span className="font-display text-sm font-bold text-[#0b0b0b]">VS</span>
          </div>
        </div>
      </div>

      <div className="px-3 mt-3">
        <div className="rounded-lg overflow-hidden border border-gold/15">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`flex items-center ${i % 2 === 0 ? "bg-[#111]" : "bg-[#161616]"} ${i < rows.length - 1 ? "border-b border-gold/8" : ""}`}
            >
              <div className="w-[55px] shrink-0 px-2 py-1.5 text-[7px] uppercase tracking-wider text-gold/50 font-semibold">
                {row.label}
              </div>
              <div className="flex-1 px-1.5 py-1.5 text-[8px] text-white text-center truncate">
                {row.a}
              </div>
              <div className="w-px h-full bg-gold/15" />
              <div className="flex-1 px-1.5 py-1.5 text-[8px] text-white text-center truncate">
                {row.b}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 gold-gradient" />
    </div>
  );
});
ComparisonPostTemplate.displayName = "ComparisonPostTemplate";
