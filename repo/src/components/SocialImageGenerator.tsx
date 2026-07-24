import { useState, useEffect, useRef, useCallback, forwardRef } from "react";
import { ref, get } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crown, Download, Search, Car, X, ImageIcon, Film, Play, Pause, Video } from "lucide-react";
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

type TemplateMode = "single" | "comparison" | "reels";

// Preview is rendered at half the export resolution.
// Single Post: 1080x1350 (Instagram Portrait, 4:5) -> preview 540x675
// Comparison Post: 1080x1920 (Story, 9:16) -> preview 540x960
// Reels: 1080x1920 (9:16) -> preview 540x960
const SINGLE_W = 540;
const SINGLE_H = 675;
const COMPARE_W = 540;
const COMPARE_H = 960;
const REEL_W = 540;
const REEL_H = 960;
const REEL_EXPORT_W = 1080;
const REEL_EXPORT_H = 1920;
const REEL_VIDEO_DURATION_MS = 8000;

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
          try { resolve(canvas.toDataURL("image/png")); }
          catch { reject(new Error("Canvas tainted after drawImage")); }
        } else { reject(new Error("Canvas context failed")); }
      };
      img.onerror = () => reject(new Error("Failed to load image via fallback"));
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
  const [exportingVideo, setExportingVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [singleCoverOverride, setSingleCoverOverride] = useState<string | null>(null);
  const [coverAOverride, setCoverAOverride] = useState<string | null>(null);
  const [coverBOverride, setCoverBOverride] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const reelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const snap = await get(ref(realtimeDb, "vehicles"));
      if (snap.exists()) {
        const all = snap.val() as Record<string, Record<string, unknown>>;
        const list: Vehicle[] = Object.entries(all)
          .filter(([, v]) => v.status === "active")
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

  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return;
    if (mode === "single" && !singleSelected) { toast.error("Select a listing first"); return; }
    if (mode === "comparison" && (!selectedA || !selectedB)) { toast.error("Select both cars first"); return; }
    if (mode === "reels" && !singleSelected && (!selectedA || !selectedB)) { toast.error("Select a listing or two cars first"); return; }

    setExporting(true);
    try {
      const urlsToConvert: string[] = [];
      if (mode === "single" || (mode === "reels" && singleSelected && !selectedA)) {
        if (singleSelected?.images?.[0]) urlsToConvert.push(singleSelected.images[0]);
      } else if (mode === "comparison" || mode === "reels") {
        if (selectedA?.images?.[0]) urlsToConvert.push(selectedA.images[0]);
        if (selectedB?.images?.[0]) urlsToConvert.push(selectedB.images[0]);
      }

      const dataUrls = await Promise.all(
        urlsToConvert.map((url) =>
          getSecureBase64Image(url).catch(() => null)
        )
      );

      if (mode === "single" || (mode === "reels" && singleSelected && !selectedA)) {
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
      let filename: string;
      if (mode === "single") {
        filename = `single-${singleSelected?.brand}-${singleSelected?.model}-${singleSelected?.year}.png`;
      } else if (mode === "reels" && singleSelected && !selectedA) {
        filename = `reel-${singleSelected?.brand}-${singleSelected?.model}-${singleSelected?.year}.png`;
      } else {
        filename = `vs-${selectedA?.brand}-vs-${selectedB?.brand}.png`;
      }
      link.download = filename;
      link.href = dataUrl;
      link.click();
      toast.success("Image exported successfully");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export image. Check console for details.");
    } finally {
      setSingleCoverOverride(null);
      setCoverAOverride(null);
      setCoverBOverride(null);
      setExporting(false);
    }
  }, [mode, singleSelected, selectedA, selectedB]);

  const handleVideoExport = useCallback(async () => {
    if (!reelRef.current) return;
    const isReelComparison = mode === "reels" && selectedA && selectedB;
    if (mode === "reels" && !isReelComparison && !singleSelected) { toast.error("Select a listing first"); return; }
    if (isReelComparison && (!selectedA || !selectedB)) { toast.error("Select both cars first"); return; }

    setExportingVideo(true);
    setIsPlaying(true);
    try {
      const urlsToConvert: string[] = [];
      if (isReelComparison) {
        if (selectedA?.images?.[0]) urlsToConvert.push(selectedA.images[0]);
        if (selectedB?.images?.[0]) urlsToConvert.push(selectedB.images[0]);
      } else {
        if (singleSelected?.images?.[0]) urlsToConvert.push(singleSelected.images[0]);
      }

      const dataUrls = await Promise.all(
        urlsToConvert.map((url) => getSecureBase64Image(url).catch(() => null))
      );

      if (isReelComparison) {
        setCoverAOverride(dataUrls[0] ?? null);
        setCoverBOverride(dataUrls[1] ?? null);
      } else {
        setSingleCoverOverride(dataUrls[0] ?? null);
      }

      await nextPaint();
      await nextPaint();

      const reelNode = reelRef.current;
      const { toPng } = await import("html-to-image");

      // Create a canvas at full export resolution
      const canvas = document.createElement("canvas");
      canvas.width = REEL_EXPORT_W;
      canvas.height = REEL_EXPORT_H;
      const ctx = canvas.getContext("2d");
      if (!ctx) { toast.error("Canvas not supported"); return; }
      ctx.fillStyle = "#0b0b0b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Determine MIME type support
      const mimeOptions = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"];
      let mimeType = "video/webm";
      for (const m of mimeOptions) {
        if (MediaRecorder.isTypeSupported(m)) { mimeType = m; break; }
      }

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5_000_000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      const exportDone = new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
      });

      recorder.start();

      // Render frames by capturing the animated DOM at intervals
      const totalFrames = Math.floor((REEL_VIDEO_DURATION_MS / 1000) * 30);
      const frameInterval = REEL_VIDEO_DURATION_MS / totalFrames;

      for (let i = 0; i < totalFrames; i++) {
        const dataUrl = await toPng(reelNode, {
          pixelRatio: REEL_EXPORT_W / reelNode.offsetWidth,
          cacheBust: true,
          backgroundColor: "#0b0b0b",
          skipFonts: true,
        });
        const img = new Image();
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = dataUrl;
        });
        ctx.fillStyle = "#0b0b0b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Wait for next animation frame
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
        // Small delay to let CSS animations progress
        await new Promise<void>((r) => setTimeout(r, frameInterval));
      }

      recorder.stop();
      await exportDone;

      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const ext = mimeType.includes("mp4") ? "mp4" : "webm";
      let filename: string;
      if (isReelComparison) {
        filename = `reel-vs-${selectedA?.brand}-vs-${selectedB?.brand}.${ext}`;
      } else {
        filename = `reel-${singleSelected?.brand}-${singleSelected?.model}-${singleSelected?.year}.${ext}`;
      }
      link.download = filename;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`Video exported as ${ext.toUpperCase()}`);
    } catch (err) {
      console.error("Video export error:", err);
      toast.error("Failed to export video. Your browser may not support video recording.");
    } finally {
      setSingleCoverOverride(null);
      setCoverAOverride(null);
      setCoverBOverride(null);
      setExportingVideo(false);
    }
  }, [mode, singleSelected, selectedA, selectedB]);

  const showPreview = mode === "single" ? !!singleSelected
    : mode === "comparison" ? !!selectedA && !!selectedB
    : !!singleSelected || (!!selectedA && !!selectedB);

  const isReelComparison = mode === "reels" && !!selectedA && !!selectedB;

  return (
    <div className="space-y-6">
      <div className="premium-card rounded-xl p-5 border border-gold/20">
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon className="h-5 w-5 text-gold" />
          <h2 className="font-display text-lg gold-text">Social Media Image Generator</h2>
        </div>

        <div className="flex gap-2 mb-5 flex-wrap">
          <button
            onClick={() => setMode("single")}
            className={`flex-1 min-w-[120px] rounded-lg border px-4 py-3 text-sm font-medium transition ${
              mode === "single"
                ? "border-gold bg-gold/10 text-gold"
                : "border-border bg-charcoal text-muted-foreground hover:text-foreground"
            }`}
          >
            <Car className="h-4 w-4 inline mr-2" /> Single Post
          </button>
          <button
            onClick={() => setMode("comparison")}
            className={`flex-1 min-w-[120px] rounded-lg border px-4 py-3 text-sm font-medium transition ${
              mode === "comparison"
                ? "border-gold bg-gold/10 text-gold"
                : "border-border bg-charcoal text-muted-foreground hover:text-foreground"
            }`}
          >
            <Crown className="h-4 w-4 inline mr-2" /> Comparison Post
          </button>
          <button
            onClick={() => setMode("reels")}
            className={`flex-1 min-w-[120px] rounded-lg border px-4 py-3 text-sm font-medium transition ${
              mode === "reels"
                ? "border-gold bg-gold/10 text-gold"
                : "border-border bg-charcoal text-muted-foreground hover:text-foreground"
            }`}
          >
            <Film className="h-4 w-4 inline mr-2" /> Reels / Video
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

        {(mode === "comparison" || (mode === "reels" && !singleSelected)) && (
          <div className="space-y-4">
            {mode === "reels" && (
              <p className="text-xs text-muted-foreground bg-gold/5 border border-gold/20 rounded-lg p-3">
                Select two vehicles for a VS comparison reel, or switch to Single Post mode for a solo reel.
              </p>
            )}
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
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2 flex-wrap">
          {mode === "reels" && (
            <Button
              variant="outline"
              onClick={() => setIsPlaying(p => !p)}
              disabled={!showPreview || exportingVideo}
            >
              {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isPlaying ? "Pause" : "Play"}
            </Button>
          )}
          <Button variant="gold" onClick={handleExport} disabled={exporting || exportingVideo || !showPreview}>
            {exporting ? (
              <><span className="h-4 w-4 border-2 border-gold-foreground/30 border-t-gold-foreground rounded-full animate-spin inline-block mr-2" /> Exporting...</>
            ) : (
              <><Download className="h-4 w-4 mr-2" /> Download PNG</>
            )}
          </Button>
          {mode === "reels" && (
            <Button
              variant="gold"
              onClick={handleVideoExport}
              disabled={exporting || exportingVideo || !showPreview}
            >
              {exportingVideo ? (
                <><span className="h-4 w-4 border-2 border-gold-foreground/30 border-t-gold-foreground rounded-full animate-spin inline-block mr-2" /> Recording...</>
              ) : (
                <><Video className="h-4 w-4 mr-2" /> Export Video</>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        {mode === "single" ? (
          singleSelected ? (
            <SinglePostTemplate ref={canvasRef} vehicle={singleSelected} coverOverride={singleCoverOverride} />
          ) : (
            <EmptyPreview width={SINGLE_W} height={SINGLE_H} />
          )
        ) : mode === "comparison" ? (
          selectedA && selectedB ? (
            <ComparisonPostTemplate
              ref={canvasRef}
              carA={selectedA}
              carB={selectedB}
              coverAOverride={coverAOverride}
              coverBOverride={coverBOverride}
            />
          ) : (
            <EmptyPreview width={COMPARE_W} height={COMPARE_H} />
          )
        ) : isReelComparison ? (
          <ReelComparisonTemplate
            ref={reelRef}
            carA={selectedA}
            carB={selectedB}
            coverAOverride={coverAOverride}
            coverBOverride={coverBOverride}
            playing={isPlaying}
          />
        ) : singleSelected ? (
          <ReelSingleTemplate
            ref={reelRef}
            vehicle={singleSelected}
            coverOverride={singleCoverOverride}
            playing={isPlaying}
          />
        ) : (
          <EmptyPreview width={REEL_W} height={REEL_H} />
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
          <button onClick={() => onSelect(null)} className="text-muted-foreground hover:text-destructive">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyPreview({ width, height }: { width: number; height: number }) {
  return (
    <div
      className="rounded-2xl border border-dashed border-border bg-charcoal/50 grid place-items-center"
      style={{ width: width / 2, height: height / 2 }}
    >
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
    <div
      ref={ref}
      className="relative overflow-hidden rounded-2xl flex flex-col"
      style={{
        width: SINGLE_W,
        height: SINGLE_H,
        background: "#0b0b0b",
        fontFamily: "'Playfair Display', serif",
        border: "2px solid #d4af37",
        boxShadow: "0 0 40px rgba(212, 175, 55, 0.15)",
      }}
    >
      <div className="shrink-0 pt-8 pb-4 text-center px-6">
        <div className="font-display text-3xl tracking-wide">
          <span className="gold-shine font-bold">GRAND</span>
          <span className="gold-text"> Auto Luxe</span>
        </div>
        <div className="text-[10px] uppercase tracking-[0.35em] text-gold/60 mt-1">Algeria · Premium</div>
        <div className="mx-auto mt-3 h-px w-3/4 gold-gradient opacity-60" />
      </div>

      <div className="px-6 shrink-0">
        <div className="relative rounded-xl overflow-hidden" style={{ height: 320 }}>
          {cover ? (
            <>
              <img src={cover} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </>
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
  carA: Vehicle;
  carB: Vehicle;
  coverAOverride?: string | null;
  coverBOverride?: string | null;
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
    <div
      ref={ref}
      className="relative overflow-hidden rounded-2xl flex flex-col"
      style={{
        width: COMPARE_W,
        height: COMPARE_H,
        background: "#0b0b0b",
        fontFamily: "'Playfair Display', serif",
        border: "2px solid #d4af37",
        boxShadow: "0 0 40px rgba(212, 175, 55, 0.15)",
      }}
    >
      <div className="shrink-0 pt-6 pb-3 text-center px-6">
        <div className="font-display text-2xl tracking-wide">
          <span className="gold-shine font-bold">GRAND</span>
          <span className="gold-text"> Auto Luxe</span>
        </div>
        <div className="text-[9px] uppercase tracking-[0.35em] text-gold/60 mt-1">Algeria · Premium</div>
        <div className="mx-auto mt-2 h-px w-3/4 gold-gradient opacity-60" />
      </div>

      <div className="px-4 mt-2 relative shrink-0">
        <div className="grid grid-cols-2 gap-3">
          <div className="relative rounded-xl overflow-hidden" style={{ height: 240 }}>
            {coverA ? (
              <>
                <img src={coverA} alt={carA.brand} className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </>
            ) : (
              <div className="w-full h-full bg-[#1a1a1a] grid place-items-center"><Car className="h-12 w-12 text-gold/20" /></div>
            )}
            <div className="absolute bottom-2 left-2 right-2">
              <div className="text-sm font-bold text-white truncate">{carA.brand} {carA.model}</div>
              <div className="text-[10px] text-gold/80">{carA.year}</div>
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden" style={{ height: 240 }}>
            {coverB ? (
              <>
                <img src={coverB} alt={carB.brand} className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </>
            ) : (
              <div className="w-full h-full bg-[#1a1a1a] grid place-items-center"><Car className="h-12 w-12 text-gold/20" /></div>
            )}
            <div className="absolute bottom-2 left-2 right-2">
              <div className="text-sm font-bold text-white truncate">{carB.brand} {carB.model}</div>
              <div className="text-[10px] text-gold/80">{carB.year}</div>
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="rounded-full gold-gradient grid place-items-center border-4 border-[#0b0b0b]" style={{ width: 64, height: 64, boxShadow: "0 0 30px rgba(212, 175, 55, 0.6)" }}>
            <span className="font-display text-xl font-bold text-[#0b0b0b]">VS</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-4 mt-4">
        <div className="text-center mb-3">
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold/50">Specifications</div>
        </div>
        <div className="rounded-xl overflow-hidden border border-gold/20">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className="flex items-stretch"
              style={{
                background: i % 2 === 0 ? "#111111" : "#161616",
                borderBottom: i < rows.length - 1 ? "1px solid rgba(212, 175, 55, 0.1)" : "none",
              }}
            >
              <div className="shrink-0 px-3 py-2.5 text-[10px] uppercase tracking-wider text-gold/50 font-semibold flex items-center" style={{ width: 90 }}>
                {row.label}
              </div>
              <div className="flex-1 px-2 py-2.5 text-[11px] text-white text-center truncate flex items-center justify-center">
                {row.a}
              </div>
              <div className="w-px bg-gold/15" />
              <div className="flex-1 px-2 py-2.5 text-[11px] text-white text-center truncate flex items-center justify-center">
                {row.b}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-auto pb-5 text-center pt-4">
          <div className="text-[9px] uppercase tracking-[0.3em] text-gold/40">Grand Auto Luxe · Algeria</div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 gold-gradient" />
    </div>
  );
});
ComparisonPostTemplate.displayName = "ComparisonPostTemplate";

// ===== REEL SINGLE TEMPLATE (9:16, animated Ken Burns) =====
const ReelSingleTemplate = forwardRef<HTMLDivElement, {
  vehicle: Vehicle;
  coverOverride?: string | null;
  playing: boolean;
}>(({ vehicle, coverOverride, playing }, ref) => {
  const price = getVehiclePrice(vehicle);
  const cover = coverOverride ?? vehicle.images?.[0];

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-2xl ${playing ? "" : "reel-paused"}`}
      style={{
        width: REEL_W,
        height: REEL_H,
        background: "#0b0b0b",
        fontFamily: "'Playfair Display', serif",
        border: "2px solid #d4af37",
        boxShadow: "0 0 40px rgba(212, 175, 55, 0.15)",
      }}
    >
      {/* Full-bleed image with Ken Burns */}
      <div className="absolute inset-0 overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover kenburns-top"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-[#1a1a1a] grid place-items-center"><Car className="h-20 w-20 text-gold/20" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />
      </div>

      {/* Logo header */}
      <div className="absolute top-0 left-0 right-0 pt-6 text-center z-10">
        <div className="font-display text-2xl tracking-wide reel-fade-in">
          <span className="gold-shine font-bold">GRAND</span>
          <span className="gold-text"> Auto Luxe</span>
        </div>
        <div className="text-[9px] uppercase tracking-[0.35em] text-gold/60 mt-1 reel-fade-in reel-delay-1">Algeria · Premium</div>
      </div>

      {/* Vehicle name */}
      <div className="absolute top-[22%] left-0 right-0 text-center z-10 px-6">
        <h2 className="font-display text-3xl text-white leading-tight reel-slide-left">{vehicle.brand} {vehicle.model}</h2>
        <div className="text-base text-gold/80 mt-1 reel-slide-right reel-delay-1">{vehicle.year} · {vehicle.wilaya}</div>
      </div>

      {/* Specs */}
      <div className="absolute bottom-[22%] left-0 right-0 px-8 z-10 space-y-2">
        <div className="flex justify-between reel-fade-in reel-delay-2">
          <span className="text-[10px] uppercase tracking-wider text-gold/60">Engine</span>
          <span className="text-[11px] text-white font-medium">{vehicle.engine_type || "—"}</span>
        </div>
        <div className="flex justify-between reel-fade-in reel-delay-3">
          <span className="text-[10px] uppercase tracking-wider text-gold/60">Fuel</span>
          <span className="text-[11px] text-white font-medium">{vehicle.fuel_type || "—"}</span>
        </div>
        <div className="flex justify-between reel-fade-in reel-delay-4">
          <span className="text-[10px] uppercase tracking-wider text-gold/60">Gearbox</span>
          <span className="text-[11px] text-white font-medium">{vehicle.transmission || "—"}</span>
        </div>
        <div className="flex justify-between reel-fade-in reel-delay-5">
          <span className="text-[10px] uppercase tracking-wider text-gold/60">Mileage</span>
          <span className="text-[11px] text-white font-medium">{(vehicle.mileage || 0).toLocaleString()} km</span>
        </div>
      </div>

      {/* Price */}
      <div className="absolute bottom-[8%] left-0 right-0 text-center z-10 reel-scale-in reel-delay-3">
        <div className="text-[10px] uppercase tracking-[0.3em] text-gold/50 mb-1">Price</div>
        <div className="font-display text-4xl gold-text">{formatMilliard(price)}</div>
      </div>

      {/* CTA */}
      <div className="absolute bottom-0 left-0 right-0 pb-4 text-center z-10 reel-fade-in reel-delay-5">
        <div className="text-[9px] uppercase tracking-[0.3em] text-gold/40">View price on site · Grand Auto Luxe</div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 gold-gradient" />
    </div>
  );
});
ReelSingleTemplate.displayName = "ReelSingleTemplate";

// ===== REEL COMPARISON TEMPLATE (9:16, split-screen animated VS) =====
const ReelComparisonTemplate = forwardRef<HTMLDivElement, {
  carA: Vehicle;
  carB: Vehicle;
  coverAOverride?: string | null;
  coverBOverride?: string | null;
  playing: boolean;
}>(({ carA, carB, coverAOverride, coverBOverride, playing }, ref) => {
  const priceA = getVehiclePrice(carA);
  const priceB = getVehiclePrice(carB);
  const coverA = coverAOverride ?? carA.images?.[0];
  const coverB = coverBOverride ?? carB.images?.[0];

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-2xl ${playing ? "" : "reel-paused"}`}
      style={{
        width: REEL_W,
        height: REEL_H,
        background: "#0b0b0b",
        fontFamily: "'Playfair Display', serif",
        border: "2px solid #d4af37",
        boxShadow: "0 0 40px rgba(212, 175, 55, 0.15)",
      }}
    >
      {/* TOP HALF - Vehicle A */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden" style={{ height: "50%" }}>
        {coverA ? (
          <img
            src={coverA}
            alt={carA.brand}
            className="w-full h-full object-cover kenburns-top"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-[#1a1a1a] grid place-items-center"><Car className="h-16 w-16 text-gold/20" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />

        {/* Vehicle A name */}
        <div className="absolute bottom-3 left-0 right-0 text-center px-4">
          <h3 className="font-display text-2xl text-white leading-tight reel-slide-left">{carA.brand} {carA.model}</h3>
          <div className="text-xs text-gold/80 mt-0.5 reel-fade-in reel-delay-1">{carA.year} · {carA.wilaya}</div>
        </div>
      </div>

      {/* BOTTOM HALF - Vehicle B */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: "50%" }}>
        {coverB ? (
          <img
            src={coverB}
            alt={carB.brand}
            className="w-full h-full object-cover kenburns-bottom"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-[#1a1a1a] grid place-items-center"><Car className="h-16 w-16 text-gold/20" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/60" />

        {/* Vehicle B name */}
        <div className="absolute top-3 left-0 right-0 text-center px-4">
          <h3 className="font-display text-2xl text-white leading-tight reel-slide-right">{carB.brand} {carB.model}</h3>
          <div className="text-xs text-gold/80 mt-0.5 reel-fade-in reel-delay-1">{carB.year} · {carB.wilaya}</div>
        </div>
      </div>

      {/* Center VS badge */}
      <div className="absolute top-1/2 left-1/2 z-20 reel-vs-pulse" style={{ transform: "translate(-50%, -50%)" }}>
        <div
          className="rounded-full gold-gradient grid place-items-center border-4 border-[#0b0b0b]"
          style={{ width: 72, height: 72 }}
        >
          <span className="font-display text-2xl font-bold text-[#0b0b0b]">VS</span>
        </div>
      </div>

      {/* Logo at top */}
      <div className="absolute top-0 left-0 right-0 pt-3 text-center z-10">
        <div className="font-display text-lg tracking-wide reel-fade-in">
          <span className="gold-shine font-bold">GRAND</span>
          <span className="gold-text"> Auto Luxe</span>
        </div>
      </div>

      {/* Price overlays */}
      <div className="absolute top-[44%] left-2 z-10 reel-slide-left reel-delay-2">
        <div className="bg-black/70 rounded-lg px-3 py-1.5 border border-gold/30">
          <div className="text-[8px] uppercase tracking-wider text-gold/60">Price A</div>
          <div className="text-sm gold-text font-display">{formatMilliard(priceA)}</div>
        </div>
      </div>
      <div className="absolute top-[52%] right-2 z-10 reel-slide-right reel-delay-3">
        <div className="bg-black/70 rounded-lg px-3 py-1.5 border border-gold/30">
          <div className="text-[8px] uppercase tracking-wider text-gold/60">Price B</div>
          <div className="text-sm gold-text font-display">{formatMilliard(priceB)}</div>
        </div>
      </div>

      {/* CTA at bottom */}
      <div className="absolute bottom-0 left-0 right-0 pb-3 text-center z-10 reel-fade-in reel-delay-4">
        <div className="bg-black/60 inline-block rounded-full px-4 py-1">
          <div className="text-[9px] uppercase tracking-[0.3em] text-gold/50">View prices on site · Grand Auto Luxe</div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 gold-gradient" />
    </div>
  );
});
ReelComparisonTemplate.displayName = "ReelComparisonTemplate";

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#111] border border-gold/10 px-3 py-2">
      <div className="text-[9px] uppercase tracking-wider text-gold/50">{label}</div>
      <div className="text-[11px] text-white font-medium truncate">{value}</div>
    </div>
  );
}
