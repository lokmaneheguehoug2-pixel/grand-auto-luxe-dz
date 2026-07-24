import { useState, useEffect, useRef, useCallback, forwardRef } from "react";
import { ref, get } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crown, Download, Search, Car, X, ImageIcon, Film, Video, Play } from "lucide-react";
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

type TemplateMode = "single" | "comparison" | "reels" | "reelsComparison";

// Preview is rendered at half the export resolution.
const SINGLE_W = 540;
const SINGLE_H = 675;
const COMPARE_W = 540;
const COMPARE_H = 960;
const REEL_W = 270;
const REEL_H = 480;

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

// Robustly convert a remote image URL to a base64 Data URL.
const getSecureBase64Image = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url, { mode: "cors" });
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.referrerPolicy = "no-referrer";
      img.src = `${url}${url.includes("?") ? "&" : "?"}t=${new Date().getTime()}`;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          try { resolve(canvas.toDataURL("image/png")); } catch { reject(new Error("Canvas tainted")); }
        } else { reject(new Error("Canvas context failed")); }
      };
      img.onerror = () => reject(new Error("Failed to load image"));
    });
  }
};

const nextPaint = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

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
  const [recording, setRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [singleCoverOverride, setSingleCoverOverride] = useState<string | null>(null);
  const [coverAOverride, setCoverAOverride] = useState<string | null>(null);
  const [coverBOverride, setCoverBOverride] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const isReelMode = mode === "reels" || mode === "reelsComparison";

  useEffect(() => {
    async function load() {
      const snap = await get(ref(realtimeDb, "vehicles"));
      if (snap.exists()) {
        const all = snap.val() as Record<string, unknown>;
        const list: Vehicle[] = Object.entries(all)
          .filter(([, v]) => (v as Vehicle).status === "active")
          .map(([id, v]) => ({ ...(v as Vehicle), id }))
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

  // === PNG export for single/comparison modes ===
  const handlePngExport = useCallback(async () => {
    if (!canvasRef.current) return;
    if (mode === "single" && !singleSelected) { toast.error("Select a listing first"); return; }
    if (mode === "comparison" && (!selectedA || !selectedB)) { toast.error("Select both cars first"); return; }

    setExporting(true);
    try {
      const urlsToConvert: string[] = [];
      if (mode === "single") {
        if (singleSelected?.images?.[0]) urlsToConvert.push(singleSelected.images[0]);
      } else {
        if (selectedA?.images?.[0]) urlsToConvert.push(selectedA.images[0]);
        if (selectedB?.images?.[0]) urlsToConvert.push(selectedB.images[0]);
      }

      const dataUrls = await Promise.all(
        urlsToConvert.map((url) => getSecureBase64Image(url).catch(() => null))
      );

      if (mode === "single") {
        setSingleCoverOverride(dataUrls[0] ?? null);
      } else {
        setCoverAOverride(dataUrls[0] ?? null);
        setCoverBOverride(dataUrls[1] ?? null);
      }

      await nextPaint();

      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(canvasRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#0b0b0b",
        skipFonts: true,
      });
      const link = document.createElement("a");
      const filename = mode === "single"
        ? `single-${singleSelected?.brand}-${singleSelected?.model}-${singleSelected?.year}.png`
        : `vs-${selectedA?.brand}-vs-${selectedB?.brand}.png`;
      link.download = filename;
      link.href = dataUrl;
      link.click();
      toast.success("Image exported successfully");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export image");
    } finally {
      setSingleCoverOverride(null);
      setCoverAOverride(null);
      setCoverBOverride(null);
      setExporting(false);
    }
  }, [mode, singleSelected, selectedA, selectedB]);

  // === Video export for Reels modes using MediaRecorder ===
  const handleVideoExport = useCallback(async () => {
    if (!canvasRef.current) return;
    if (mode === "reels" && !singleSelected) { toast.error("Select a listing first"); return; }
    if (mode === "reelsComparison" && (!selectedA || !selectedB)) { toast.error("Select both cars first"); return; }

    setRecording(true);
    setExporting(true);
    setIsPlaying(true);

    try {
      // Convert images to base64 first for clean canvas capture
      const urlsToConvert: string[] = [];
      if (mode === "reels") {
        if (singleSelected?.images?.[0]) urlsToConvert.push(singleSelected.images[0]);
      } else {
        if (selectedA?.images?.[0]) urlsToConvert.push(selectedA.images[0]);
        if (selectedB?.images?.[0]) urlsToConvert.push(selectedB.images[0]);
      }

      const dataUrls = await Promise.all(
        urlsToConvert.map((url) => getSecureBase64Image(url).catch(() => null))
      );

      if (mode === "reels") {
        setSingleCoverOverride(dataUrls[0] ?? null);
      } else {
        setCoverAOverride(dataUrls[0] ?? null);
        setCoverBOverride(dataUrls[1] ?? null);
      }

      await nextPaint();

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const exportScale = 2;
      const canvasEl = document.createElement("canvas");
      canvasEl.width = Math.round(rect.width * exportScale);
      canvasEl.height = Math.round(rect.height * exportScale);
      const ctx = canvasEl.getContext("2d");
      if (!ctx) { toast.error("Canvas not supported"); return; }

      const { toCanvas } = await import("html-to-image");
      const duration = 8000;
      const fps = 30;
      const totalFrames = Math.round(duration / 1000 * fps);
      const chunks: BlobPart[] = [];

      // Use MediaRecorder on a canvas stream
      const stream = canvasEl.captureStream(fps);
      const mimeTypes = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
      const mimeType = mimeTypes.find(t => MediaRecorder.isTypeSupported(t)) || "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const done = new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
      });

      recorder.start();

      // Render frames by re-capturing the animated DOM at intervals
      for (let i = 0; i < totalFrames; i++) {
        const progress = i / totalFrames;
        // Re-capture the live animated DOM
        try {
          const frameCanvas = await toCanvas(canvas, {
            pixelRatio: exportScale,
            cacheBust: true,
            backgroundColor: "#0b0b0b",
            skipFonts: true,
          });
          ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
          ctx.drawImage(frameCanvas, 0, 0);
        } catch {
          // skip frame on error
        }
        await new Promise(r => setTimeout(r, 1000 / fps));
        if (progress > 0.98) break;
      }

      recorder.stop();
      await done;

      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = mode === "reels"
        ? `reel-${singleSelected?.brand}-${singleSelected?.model}-${singleSelected?.year}.webm`
        : `reel-vs-${selectedA?.brand}-vs-${selectedB?.brand}.webm`;
      link.download = filename;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Video reel exported successfully");
    } catch (err) {
      console.error("Video export error:", err);
      toast.error("Failed to export video reel");
    } finally {
      setSingleCoverOverride(null);
      setCoverAOverride(null);
      setCoverBOverride(null);
      setRecording(false);
      setExporting(false);
      mediaRecorderRef.current = null;
    }
  }, [mode, singleSelected, selectedA, selectedB]);

  const handleExport = isReelMode ? handleVideoExport : handlePngExport;

  const showPreview = mode === "single" || mode === "reels"
    ? !!singleSelected
    : !!selectedA && !!selectedB;

  const modeButtons: { id: TemplateMode; label: string; icon: typeof Car }[] = [
    { id: "single", label: "Single Post", icon: Car },
    { id: "comparison", label: "Comparison Post", icon: Crown },
    { id: "reels", label: "Reels (9:16)", icon: Film },
    { id: "reelsComparison", label: "Comparison Reels", icon: Video },
  ];

  return (
    <div className="space-y-6">
      <div className="premium-card rounded-xl p-5 border border-gold/20">
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon className="h-5 w-5 text-gold" />
          <h2 className="font-display text-lg gold-text">Social Media Generator</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          {modeButtons.map(btn => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.id}
                onClick={() => setMode(btn.id)}
                className={`rounded-lg border px-3 py-3 text-xs sm:text-sm font-medium transition ${
                  mode === btn.id
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-border bg-charcoal text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 inline mr-1.5" /> {btn.label}
              </button>
            );
          })}
        </div>

        {(mode === "single" || mode === "reels") && (
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
                      <img src={v.images[0]} className="h-10 w-14 rounded object-cover" alt="" crossOrigin="anonymous" />
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
                  <img src={singleSelected.images[0]} className="h-12 w-16 rounded object-cover" alt="" crossOrigin="anonymous" />
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

        {(mode === "comparison" || mode === "reelsComparison") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CarSelector label="Car A" search={searchA} setSearch={setSearchA} selected={selectedA} onSelect={setSelectedA} filterVehicles={filterVehicles} />
            <CarSelector label="Car B" search={searchB} setSearch={setSearchB} selected={selectedB} onSelect={setSelectedB} filterVehicles={filterVehicles} />
          </div>
        )}

        {isReelMode && showPreview && (
          <div className="mt-4 flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setIsPlaying(p => !p)}>
              <Play className="h-4 w-4 mr-1.5" /> {isPlaying ? "Pause" : "Play"} Animation
            </Button>
            <span className="text-xs text-muted-foreground">Ken Burns effect + animated overlays</span>
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="gold" onClick={handleExport} disabled={exporting || !showPreview}>
            {exporting ? (
              <><span className="h-4 w-4 border-2 border-gold-foreground/30 border-t-gold-foreground rounded-full animate-spin inline-block mr-2" /> {isReelMode ? "Recording..." : "Exporting..."}</>
            ) : (
              <><Download className="h-4 w-4 mr-2" /> {isReelMode ? "Download Video" : "Download PNG"}</>
            )}
          </Button>
        </div>
      </div>

      <div className="flex justify-center">
        {mode === "single" && (singleSelected ? (
          <SinglePostTemplate ref={canvasRef} vehicle={singleSelected} coverOverride={singleCoverOverride} />
        ) : <EmptyPreview width={SINGLE_W} height={SINGLE_H} />)}

        {mode === "comparison" && (selectedA && selectedB ? (
          <ComparisonPostTemplate ref={canvasRef} carA={selectedA} carB={selectedB} coverAOverride={coverAOverride} coverBOverride={coverBOverride} />
        ) : <EmptyPreview width={COMPARE_W} height={COMPARE_H} />)}

        {mode === "reels" && (singleSelected ? (
          <ReelsSingleTemplate ref={canvasRef} vehicle={singleSelected} coverOverride={singleCoverOverride} playing={isPlaying} recording={recording} />
        ) : <EmptyPreview width={REEL_W * 2} height={REEL_H * 2} />)}

        {mode === "reelsComparison" && (selectedA && selectedB ? (
          <ReelsComparisonTemplate ref={canvasRef} carA={selectedA} carB={selectedB} coverAOverride={coverAOverride} coverBOverride={coverBOverride} playing={isPlaying} recording={recording} />
        ) : <EmptyPreview width={REEL_W * 2} height={REEL_H * 2} />)}
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
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${label}...`} className="bg-charcoal pr-10" />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
      {!selected && search && (
        <div className="space-y-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-charcoal">
          {filterVehicles(search).map(v => (
            <button key={v.id} onClick={() => { onSelect(v); setSearch(""); }} className="w-full text-left px-3 py-2 hover:bg-gold/10 transition flex items-center gap-3">
              {v.images?.[0] ? (
                <img src={v.images[0]} className="h-10 w-14 rounded object-cover" alt="" crossOrigin="anonymous" />
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
            <img src={selected.images[0]} className="h-12 w-16 rounded object-cover" alt="" crossOrigin="anonymous" />
          ) : (
            <div className="h-12 w-16 rounded bg-border grid place-items-center"><Car className="h-5 w-5 text-muted-foreground" /></div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{selected.brand} {selected.model}</div>
            <div className="text-xs text-muted-foreground">{selected.year}</div>
          </div>
          <button onClick={() => onSelect(null)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  );
}

function EmptyPreview({ width, height }: { width: number; height: number }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-charcoal/50 grid place-items-center" style={{ width: width / 2, height: height / 2 }}>
      <div className="text-center">
        <ImageIcon className="h-12 w-12 text-muted-foreground/20 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Select a listing to preview</p>
      </div>
    </div>
  );
}

// ===== SINGLE POST TEMPLATE (1080x1350, preview at 540x675) =====
const SinglePostTemplate = forwardRef<HTMLDivElement, { vehicle: Vehicle; coverOverride?: string | null }>(({ vehicle, coverOverride }, ref) => {
  const price = getVehiclePrice(vehicle);
  const cover = coverOverride ?? vehicle.images?.[0];
  return (
    <div ref={ref} className="relative overflow-hidden rounded-2xl flex flex-col" style={{ width: SINGLE_W, height: SINGLE_H, background: "#0b0b0b", fontFamily: "'Playfair Display', serif", border: "2px solid #d4af37", boxShadow: "0 0 40px rgba(212, 175, 55, 0.15)" }}>
      <div className="shrink-0 pt-8 pb-4 text-center px-6">
        <div className="font-display text-3xl tracking-wide"><span className="gold-shine font-bold">GRAND</span><span className="gold-text"> Auto Luxe</span></div>
        <div className="text-[10px] uppercase tracking-[0.35em] text-gold/60 mt-1">Algeria · Premium</div>
        <div className="mx-auto mt-3 h-px w-3/4 gold-gradient opacity-60" />
      </div>
      <div className="px-6 shrink-0">
        <div className="relative rounded-xl overflow-hidden" style={{ height: 320 }}>
          {cover ? (
            <><img src={cover} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" /><div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" /></>
          ) : (
            <div className="w-full h-full bg-[#1a1a1a] grid place-items-center"><Car className="h-16 w-16 text-gold/20" /></div>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col px-6 mt-4">
        <div className="text-center">
          <h2 className="font-display text-2xl text-white leading-tight">{vehicle.brand} {vehicle.model}</h2>
          <div className="text-sm text-gold/70 mt-1">{vehicle.year} · {vehicle.wilaya}</div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <SpecRow label="Engine" value={vehicle.engine_type || "—"} />
          <SpecRow label="Fuel" value={vehicle.fuel_type || "—"} />
          <SpecRow label="Gearbox" value={vehicle.transmission || "—"} />
          <SpecRow label="Mileage" value={`${(vehicle.mileage || 0).toLocaleString()} km`} />
        </div>
        <div className="mt-auto pb-6 text-center">
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold/50 mb-1">Price</div>
          <div className="font-display text-3xl gold-text">{formatMilliard(price)}</div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 gold-gradient" />
    </div>
  );
});
SinglePostTemplate.displayName = "SinglePostTemplate";

// ===== COMPARISON POST TEMPLATE (1080x1920, preview at 540x960) =====
const ComparisonPostTemplate = forwardRef<HTMLDivElement, {
  carA: Vehicle; carB: Vehicle; coverAOverride?: string | null; coverBOverride?: string | null;
}>(({ carA, carB, coverAOverride, coverBOverride }, ref) => {
  const priceA = getVehiclePrice(carA);
  const priceB = getVehiclePrice(carB);
  const coverA = coverAOverride ?? carA.images?.[0];
  const coverB = coverBOverride ?? carB.images?.[0];
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
    <div ref={ref} className="relative overflow-hidden rounded-2xl flex flex-col" style={{ width: COMPARE_W, height: COMPARE_H, background: "#0b0b0b", fontFamily: "'Playfair Display', serif", border: "2px solid #d4af37", boxShadow: "0 0 40px rgba(212, 175, 55, 0.15)" }}>
      <div className="shrink-0 pt-6 pb-3 text-center px-6">
        <div className="font-display text-2xl tracking-wide"><span className="gold-shine font-bold">GRAND</span><span className="gold-text"> Auto Luxe</span></div>
        <div className="text-[9px] uppercase tracking-[0.35em] text-gold/60 mt-1">Algeria · Premium</div>
        <div className="mx-auto mt-2 h-px w-3/4 gold-gradient opacity-60" />
      </div>
      <div className="px-4 mt-2 relative shrink-0">
        <div className="grid grid-cols-2 gap-3">
          <div className="relative rounded-xl overflow-hidden" style={{ height: 240 }}>
            {coverA ? (<><img src={coverA} alt={carA.brand} className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" /></>) : (<div className="w-full h-full bg-[#1a1a1a] grid place-items-center"><Car className="h-12 w-12 text-gold/20" /></div>)}
            <div className="absolute bottom-2 left-2 right-2"><div className="text-sm font-bold text-white truncate">{carA.brand} {carA.model}</div><div className="text-[10px] text-gold/80">{carA.year}</div></div>
          </div>
          <div className="relative rounded-xl overflow-hidden" style={{ height: 240 }}>
            {coverB ? (<><img src={coverB} alt={carB.brand} className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" /></>) : (<div className="w-full h-full bg-[#1a1a1a] grid place-items-center"><Car className="h-12 w-12 text-gold/20" /></div>)}
            <div className="absolute bottom-2 left-2 right-2"><div className="text-sm font-bold text-white truncate">{carB.brand} {carB.model}</div><div className="text-[10px] text-gold/80">{carB.year}</div></div>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="rounded-full gold-gradient grid place-items-center border-4 border-[#0b0b0b]" style={{ width: 64, height: 64, boxShadow: "0 0 30px rgba(212, 175, 55, 0.6)" }}><span className="font-display text-xl font-bold text-[#0b0b0b]">VS</span></div>
        </div>
      </div>
      <div className="flex-1 flex flex-col px-4 mt-4">
        <div className="text-center mb-3"><div className="text-[10px] uppercase tracking-[0.3em] text-gold/50">Specifications</div></div>
        <div className="rounded-xl overflow-hidden border border-gold/20">
          {rows.map((row, i) => (
            <div key={row.label} className="flex items-stretch" style={{ background: i % 2 === 0 ? "#111111" : "#161616", borderBottom: i < rows.length - 1 ? "1px solid rgba(212, 175, 55, 0.1)" : "none" }}>
              <div className="shrink-0 px-3 py-2.5 text-[10px] uppercase tracking-wider text-gold/50 font-semibold flex items-center" style={{ width: 90 }}>{row.label}</div>
              <div className="flex-1 px-2 py-2.5 text-[11px] text-white text-center truncate flex items-center justify-center">{row.a}</div>
              <div className="w-px bg-gold/15" />
              <div className="flex-1 px-2 py-2.5 text-[11px] text-white text-center truncate flex items-center justify-center">{row.b}</div>
            </div>
          ))}
        </div>
        <div className="mt-auto pb-5 text-center pt-4"><div className="text-[9px] uppercase tracking-[0.3em] text-gold/40">Grand Auto Luxe · Algeria</div></div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 gold-gradient" />
    </div>
  );
});
ComparisonPostTemplate.displayName = "ComparisonPostTemplate";

// ===== REELS SINGLE TEMPLATE (9:16, preview at 270x480) =====
const ReelsSingleTemplate = forwardRef<HTMLDivElement, {
  vehicle: Vehicle; coverOverride?: string | null; playing: boolean; recording: boolean;
}>(({ vehicle, coverOverride, playing, recording }, ref) => {
  const price = getVehiclePrice(vehicle);
  const cover = coverOverride ?? vehicle.images?.[0];
  const animClass = playing && !recording ? "kenburns-single" : "";

  return (
    <div ref={ref} className={`relative overflow-hidden rounded-2xl flex flex-col ${recording ? "recording" : ""}`} style={{ width: REEL_W, height: REEL_H, background: "#0b0b0b", fontFamily: "'Playfair Display', serif", border: "2px solid #d4af37", boxShadow: "0 0 40px rgba(212, 175, 55, 0.15)" }}>
      {/* Full-bleed vehicle image with Ken Burns */}
      <div className="absolute inset-0 overflow-hidden">
        {cover ? (
          <img src={cover} alt={`${vehicle.brand} ${vehicle.model}`} className={`w-full h-full object-cover ${animClass}`} crossOrigin="anonymous" referrerPolicy="no-referrer" style={{ willChange: "transform" }} />
        ) : (
          <div className="w-full h-full bg-[#1a1a1a] grid place-items-center"><Car className="h-16 w-16 text-gold/20" /></div>
        )}
        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85" />
      </div>

      {/* Top: Logo */}
      <div className="relative z-10 shrink-0 pt-5 text-center px-4">
        <div className="font-display text-lg tracking-wide reel-slide-down"><span className="gold-shine font-bold">GRAND</span><span className="gold-text"> Auto Luxe</span></div>
        <div className="text-[7px] uppercase tracking-[0.3em] text-gold/60 mt-0.5 reel-fade-in">Algeria · Premium</div>
      </div>

      {/* Bottom: Vehicle info with animated overlays */}
      <div className="relative z-10 mt-auto px-4 pb-5 space-y-2">
        <div className="reel-slide-up">
          <h2 className="font-display text-xl text-white leading-tight drop-shadow-lg">{vehicle.brand} {vehicle.model}</h2>
          <div className="text-[10px] text-gold/80 mt-0.5">{vehicle.year} · {vehicle.wilaya}</div>
        </div>

        <div className="flex flex-wrap gap-1.5 reel-fade-in" style={{ animationDelay: "0.3s" }}>
          <SpecPill label="Engine" value={vehicle.engine_type || "—"} />
          <SpecPill label="Fuel" value={vehicle.fuel_type || "—"} />
          <SpecPill label="Gearbox" value={vehicle.transmission || "—"} />
          <SpecPill label="Mileage" value={`${(vehicle.mileage || 0).toLocaleString()} km`} />
        </div>

        <div className="reel-scale-in" style={{ animationDelay: "0.5s" }}>
          <div className="text-[8px] uppercase tracking-[0.3em] text-gold/50 mb-0.5">Price</div>
          <div className="font-display text-2xl gold-text drop-shadow-lg">{formatMilliard(price)}</div>
        </div>

        <div className="reel-fade-in pt-2" style={{ animationDelay: "0.8s" }}>
          <div className="rounded-lg bg-gold/15 border border-gold/30 px-3 py-1.5 text-center">
            <span className="text-[9px] uppercase tracking-widest text-gold font-semibold">View price on site</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 gold-gradient z-20" />
    </div>
  );
});
ReelsSingleTemplate.displayName = "ReelsSingleTemplate";

// ===== REELS COMPARISON TEMPLATE (9:16 split-screen, preview at 270x480) =====
const ReelsComparisonTemplate = forwardRef<HTMLDivElement, {
  carA: Vehicle; carB: Vehicle; coverAOverride?: string | null; coverBOverride?: string | null; playing: boolean; recording: boolean;
}>(({ carA, carB, coverAOverride, coverBOverride, playing, recording }, ref) => {
  const priceA = getVehiclePrice(carA);
  const priceB = getVehiclePrice(carB);
  const coverA = coverAOverride ?? carA.images?.[0];
  const coverB = coverBOverride ?? carB.images?.[0];
  const animTop = playing && !recording ? "kenburns-top" : "";
  const animBottom = playing && !recording ? "kenburns-bottom" : "";

  return (
    <div ref={ref} className={`relative overflow-hidden rounded-2xl flex flex-col ${recording ? "recording" : ""}`} style={{ width: REEL_W, height: REEL_H, background: "#0b0b0b", fontFamily: "'Playfair Display', serif", border: "2px solid #d4af37", boxShadow: "0 0 40px rgba(212, 175, 55, 0.15)" }}>
      {/* Top half: Vehicle A */}
      <div className="relative overflow-hidden" style={{ height: "50%" }}>
        {coverA ? (
          <img src={coverA} alt={carA.brand} className={`w-full h-full object-cover ${animTop}`} crossOrigin="anonymous" referrerPolicy="no-referrer" style={{ willChange: "transform" }} />
        ) : (
          <div className="w-full h-full bg-[#1a1a1a] grid place-items-center"><Car className="h-12 w-12 text-gold/20" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
        {/* Vehicle A name */}
        <div className="absolute bottom-2 left-3 right-3 reel-slide-down">
          <div className="font-display text-base text-white font-bold drop-shadow-lg truncate">{carA.brand} {carA.model}</div>
          <div className="text-[9px] text-gold/80">{carA.year} · {formatMilliard(priceA)}</div>
        </div>
      </div>

      {/* Center VS badge */}
      <div className="absolute top-1/2 left-1/2 z-20" style={{ transform: "translate(-50%, -50%)" }}>
        <div className={`rounded-full gold-gradient grid place-items-center border-4 border-[#0b0b0b] ${playing && !recording ? "vs-pulse" : ""}`} style={{ width: 52, height: 52 }}>
          <span className="font-display text-base font-bold text-[#0b0b0b]">VS</span>
        </div>
      </div>

      {/* Bottom half: Vehicle B */}
      <div className="relative overflow-hidden" style={{ height: "50%" }}>
        {coverB ? (
          <img src={coverB} alt={carB.brand} className={`w-full h-full object-cover ${animBottom}`} crossOrigin="anonymous" referrerPolicy="no-referrer" style={{ willChange: "transform" }} />
        ) : (
          <div className="w-full h-full bg-[#1a1a1a] grid place-items-center"><Car className="h-12 w-12 text-gold/20" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/50" />
        {/* Vehicle B name */}
        <div className="absolute top-2 left-3 right-3 reel-slide-up">
          <div className="font-display text-base text-white font-bold drop-shadow-lg truncate">{carB.brand} {carB.model}</div>
          <div className="text-[9px] text-gold/80">{carB.year} · {formatMilliard(priceB)}</div>
        </div>
      </div>

      {/* Branding header */}
      <div className="absolute top-0 left-0 right-0 z-10 pt-3 text-center">
        <div className="font-display text-xs tracking-wide reel-fade-in"><span className="gold-shine font-bold">GRAND</span><span className="gold-text"> Auto Luxe</span></div>
      </div>

      {/* CTA footer */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pb-2 text-center">
        <div className="reel-fade-in inline-block rounded-lg bg-gold/15 border border-gold/30 px-3 py-1" style={{ animationDelay: "0.6s" }}>
          <span className="text-[8px] uppercase tracking-widest text-gold font-semibold">View price on site</span>
        </div>
      </div>
    </div>
  );
});
ReelsComparisonTemplate.displayName = "ReelsComparisonTemplate";

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#111] border border-gold/10 px-3 py-2">
      <div className="text-[9px] uppercase tracking-wider text-gold/50">{label}</div>
      <div className="text-[11px] text-white font-medium truncate">{value}</div>
    </div>
  );
}

function SpecPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full bg-black/50 border border-gold/20 px-2 py-0.5">
      <span className="text-[7px] uppercase tracking-wider text-gold/50 mr-1">{label}</span>
      <span className="text-[9px] text-white font-medium">{value}</span>
    </div>
  );
}
