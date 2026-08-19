import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { WILAYAS } from "@/lib/wilayas";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, MapPin, Search, Sparkles, Star, Store, Car, X, BadgeCheck, Phone } from "lucide-react";

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "Search Vehicles & Showrooms — GRAND Auto Luxe" },
      { name: "description", content: "Search premium vehicles by brand, model or category and discover trusted Algerian showrooms by wilaya and specialty." },
      { property: "og:title", content: "Search Vehicles & Showrooms — GRAND Auto Luxe" },
      { property: "og:description", content: "A premium discovery hub for vehicles and showrooms across the 58 Algerian wilayas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BrandsPage,
});

type Model = { name: string; trim?: string; priceDA: number; tag?: string; category: string };
type Brand = { name: string; origin: string; tagline: string; models: Model[] };
type Showroom = { name: string; wilaya: string; specialty: string; brands: string[]; phone: string; verified?: boolean };

const CATALOG: { group: string; brands: Brand[] }[] = [
  {
    group: "European & Luxury",
    brands: [
      { name: "Mercedes-Benz", origin: "Germany", tagline: "The best or nothing", models: [
        { name: "G-Class", trim: "G63 AMG", priceDA: 95_000_000, tag: "Icon", category: "SUV" },
        { name: "C-Class", trim: "C200 AMG Line", priceDA: 18_500_000, category: "Sedan" },
        { name: "E-Class", trim: "E300 Avantgarde", priceDA: 27_000_000, category: "Sedan" },
      ]},
      { name: "Volkswagen", origin: "Germany", tagline: "Das Auto", models: [
        { name: "Golf 8", trim: "R-Line", priceDA: 9_800_000, tag: "Hot", category: "Hatchback" },
        { name: "Golf 7.5", trim: "Facelift", priceDA: 6_500_000, category: "Hatchback" },
        { name: "Polo", trim: "Beats", priceDA: 5_200_000, category: "Citadine" },
      ]},
      { name: "BMW", origin: "Germany", tagline: "Sheer driving pleasure", models: [
        { name: "M4", trim: "Competition", priceDA: 42_000_000, tag: "Performance", category: "Coupé" },
        { name: "Series 1", trim: "M Sport", priceDA: 12_500_000, category: "Hatchback" },
        { name: "X6", trim: "M Package", priceDA: 38_000_000, category: "SUV" },
      ]},
      { name: "Audi", origin: "Germany", tagline: "Vorsprung durch Technik", models: [
        { name: "A3", trim: "Sportback", priceDA: 11_200_000, category: "Hatchback" },
        { name: "Q3", trim: "Sportback", priceDA: 16_800_000, category: "SUV" },
        { name: "RS6", trim: "Avant", priceDA: 55_000_000, tag: "Beast", category: "Break" },
      ]},
      { name: "Porsche", origin: "Germany", tagline: "There is no substitute", models: [
        { name: "Macan", trim: "Turbo", priceDA: 48_000_000, category: "SUV" },
        { name: "Cayenne", trim: "Coupé", priceDA: 62_000_000, category: "SUV" },
        { name: "911", trim: "Carrera", priceDA: 78_000_000, tag: "Legend", category: "Coupé" },
      ]},
      { name: "Seat", origin: "Spain", tagline: "Created in Barcelona", models: [
        { name: "Ibiza", trim: "Highline", priceDA: 4_900_000, category: "Citadine" },
        { name: "Leon", trim: "Cupra", priceDA: 8_900_000, category: "Hatchback" },
        { name: "Arona", trim: "Xperience", priceDA: 6_400_000, category: "SUV" },
      ]},
    ],
  },
  {
    group: "Chinese — Highly Popular in DZ",
    brands: [
      { name: "Geely", origin: "China", tagline: "Refined Chinese engineering", models: [
        { name: "Coolray", trim: "Sport", priceDA: 4_350_000, tag: "Best Seller", category: "SUV" },
        { name: "Emgrand", trim: "Comfort", priceDA: 3_200_000, category: "Sedan" },
        { name: "GX3 Pro", trim: "Premium", priceDA: 3_650_000, category: "SUV" },
      ]},
      { name: "Chery", origin: "China", tagline: "Drive the change", models: [
        { name: "Tiggo 2", trim: "Pro Luxury", priceDA: 2_750_000, category: "SUV" },
        { name: "Tiggo 4", trim: "Pro Elite", priceDA: 3_950_000, tag: "Value", category: "SUV" },
        { name: "Arrizo 5", trim: "Pro", priceDA: 3_100_000, category: "Sedan" },
      ]},
      { name: "Jetour", origin: "China", tagline: "Travel Plus", models: [
        { name: "X70", trim: "Plus 7-seats", priceDA: 4_200_000, category: "SUV" },
        { name: "Dashing", trim: "AWD", priceDA: 4_800_000, category: "SUV" },
        { name: "X90", trim: "Plus", priceDA: 5_300_000, category: "SUV" },
      ]},
      { name: "Changan", origin: "China", tagline: "Smart mobility", models: [
        { name: "Alsvin", trim: "Lumiere", priceDA: 2_390_000, category: "Sedan" },
        { name: "CS35", trim: "Plus", priceDA: 3_700_000, category: "SUV" },
        { name: "Uni-T", trim: "Sport", priceDA: 4_550_000, tag: "New", category: "SUV" },
      ]},
    ],
  },
  {
    group: "Asian Giants",
    brands: [
      { name: "Hyundai", origin: "South Korea", tagline: "New thinking. New possibilities.", models: [
        { name: "Tucson", trim: "N-Line", priceDA: 7_900_000, tag: "Trending", category: "SUV" },
        { name: "Accent", trim: "Hatchback / Sedan", priceDA: 3_850_000, category: "Sedan" },
        { name: "i10", trim: "GLS", priceDA: 2_650_000, category: "Citadine" },
      ]},
      { name: "Kia", origin: "South Korea", tagline: "Movement that inspires", models: [
        { name: "Sportage", trim: "GT-Line", priceDA: 8_400_000, category: "SUV" },
        { name: "Seltos", trim: "EX+", priceDA: 6_200_000, category: "SUV" },
        { name: "Picanto", trim: "GT-Line", priceDA: 2_800_000, category: "Citadine" },
      ]},
      { name: "Toyota", origin: "Japan", tagline: "Let's go places", models: [
        { name: "Hilux", trim: "Adventure", priceDA: 11_500_000, tag: "King", category: "Pick-up" },
        { name: "Land Cruiser", trim: "LC300", priceDA: 65_000_000, tag: "Flagship", category: "SUV" },
        { name: "Yaris", trim: "Premium", priceDA: 3_400_000, category: "Citadine" },
      ]},
    ],
  },
];

const SHOWROOMS: Showroom[] = [
  { name: "Grand Luxe Motors", wilaya: "Alger", specialty: "German luxury imports", brands: ["Mercedes-Benz", "BMW", "Audi"], phone: "+213770000101", verified: true },
  { name: "Atlas Premium Cars", wilaya: "Alger", specialty: "Sports & exotics", brands: ["Porsche", "BMW"], phone: "+213770000102", verified: true },
  { name: "Oran Auto Elite", wilaya: "Oran", specialty: "SUV specialists", brands: ["Hyundai", "Kia", "Jetour"], phone: "+213770000103", verified: true },
  { name: "Sahara Motors", wilaya: "Ouargla", specialty: "Pick-up & 4x4", brands: ["Toyota", "Changan"], phone: "+213770000104" },
  { name: "Constantine Prestige", wilaya: "Constantine", specialty: "Certified pre-owned", brands: ["Volkswagen", "Seat", "Audi"], phone: "+213770000105", verified: true },
  { name: "Setif Auto Center", wilaya: "Sétif", specialty: "Chinese brands & financing", brands: ["Geely", "Chery", "Jetour"], phone: "+213770000106" },
  { name: "Annaba Car Gallery", wilaya: "Annaba", specialty: "City cars & citadines", brands: ["Hyundai", "Kia", "Volkswagen"], phone: "+213770000107" },
  { name: "Blida Motors House", wilaya: "Blida", specialty: "Family SUVs", brands: ["Chery", "Geely", "Kia"], phone: "+213770000108" },
  { name: "Tlemcen Luxury Auto", wilaya: "Tlemcen", specialty: "Executive sedans", brands: ["Mercedes-Benz", "Audi"], phone: "+213770000109" },
  { name: "Bejaia Drive", wilaya: "Béjaïa", specialty: "Hybrid & low consumption", brands: ["Toyota", "Hyundai"], phone: "+213770000110" },
];

function formatPrice(da: number) {
  const da_str = da.toLocaleString("fr-FR");
  const centimes_m = Math.round(da / 10_000); // 1 DA = 100 centimes, expressed in millions
  return { da: `${da_str} DA`, centimes: `${centimes_m.toLocaleString("fr-FR")} Millions de Centimes` };
}

type VehicleResult = Model & { brand: string; origin: string };

function BrandsPage() {
  const [wilaya, setWilaya] = useState<string>("all");
  const [tab, setTab] = useState<"vehicles" | "showrooms">("vehicles");
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  const allVehicles = useMemo<VehicleResult[]>(
    () => CATALOG.flatMap((g) => g.brands.flatMap((b) => b.models.map((m) => ({ ...m, brand: b.name, origin: b.origin })))),
    [],
  );

  const q = query.trim().toLowerCase();

  const vehicleResults = useMemo(() => {
    if (!q) return [];
    return allVehicles.filter((v) =>
      [v.brand, v.name, v.trim ?? "", v.category].some((f) => f.toLowerCase().includes(q)),
    );
  }, [allVehicles, q]);

  const showroomResults = useMemo(() => {
    return SHOWROOMS.filter((s) => {
      if (wilaya !== "all" && s.wilaya !== wilaya) return false;
      if (!q) return true;
      return [s.name, s.wilaya, s.specialty, ...s.brands].some((f) => f.toLowerCase().includes(q));
    });
  }, [q, wilaya]);

  // Live suggestions below the search bar
  const suggestions = useMemo(() => {
    if (!q) return [];
    if (tab === "vehicles") {
      const brands = CATALOG.flatMap((g) => g.brands)
        .filter((b) => b.name.toLowerCase().includes(q))
        .map((b) => ({ kind: "Brand", label: b.name, sub: `${b.models.length} models`, onPick: () => setSelectedBrand(b) }));
      const cats = Array.from(new Set(allVehicles.map((v) => v.category)))
        .filter((c) => c.toLowerCase().includes(q))
        .map((c) => ({ kind: "Category", label: c, sub: "Vehicle category", onPick: () => setQuery(c) }));
      const models = vehicleResults.slice(0, 5).map((v) => ({
        kind: "Model",
        label: `${v.brand} ${v.name}`,
        sub: v.trim ?? v.category,
        onPick: () => setQuery(v.name),
      }));
      return [...brands, ...cats, ...models].slice(0, 7);
    }
    return showroomResults.slice(0, 7).map((s) => ({
      kind: "Showroom",
      label: s.name,
      sub: `${s.wilaya} · ${s.specialty}`,
      onPick: () => setQuery(s.name),
    }));
  }, [q, tab, allVehicles, vehicleResults, showroomResults]);

  const searching = q.length > 0;

  return (
    <div className="relative">
      {/* Glow background */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_-10%,rgba(212,175,55,0.18),transparent_55%),radial-gradient(circle_at_90%_30%,rgba(212,175,55,0.08),transparent_55%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero */}
        <div className="mb-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold mb-3">
            <Sparkles className="h-3.5 w-3.5" /> Discovery · Algeria
          </div>
          <h1 className="font-display text-3xl sm:text-5xl leading-[1.05]">
            Search <span className="gold-text">vehicles & showrooms</span> across Algeria.
          </h1>
        </div>

        {/* Search hub */}
        <div className="mb-8 space-y-3">
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gold" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
                placeholder="Search vehicles, brands, or showrooms..."
                aria-label="Search vehicles, brands, or showrooms"
                className="h-14 pl-11 pr-11 text-base bg-charcoal border-gold/30 hover:border-gold/60 focus-visible:ring-gold/40 rounded-xl"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-full text-muted-foreground hover:text-gold hover:bg-gold-soft transition"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Live suggestions */}
            {focused && suggestions.length > 0 && (
              <div className="absolute z-30 mt-2 w-full premium-card gold-border rounded-xl overflow-hidden animate-fade-in">
                {suggestions.map((s, i) => (
                  <button
                    key={`${s.kind}-${s.label}-${i}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={s.onPick}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gold-soft transition border-b border-border/40 last:border-0"
                  >
                    <span className="text-[9px] uppercase tracking-[0.2em] text-gold w-16 shrink-0">{s.kind}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm truncate">{s.label}</span>
                      <span className="block text-xs text-muted-foreground truncate">{s.sub}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tabs + Wilaya */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Tabs value={tab} onValueChange={(v) => setTab(v as "vehicles" | "showrooms")}>
              <TabsList className="h-11 bg-charcoal border border-gold/20 p-1">
                <TabsTrigger value="vehicles" className="h-9 px-5 data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">
                  <Car className="h-4 w-4 mr-1.5" /> Vehicles
                </TabsTrigger>
                <TabsTrigger value="showrooms" className="h-9 px-5 data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">
                  <Store className="h-4 w-4 mr-1.5" /> Showrooms
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="sm:ml-auto w-full sm:w-64">
              <Select value={wilaya} onValueChange={setWilaya}>
                <SelectTrigger className="h-11 bg-charcoal border-gold/25 hover:border-gold/60 transition-colors">
                  <span className="flex items-center gap-2 min-w-0">
                    <MapPin className="h-4 w-4 text-gold shrink-0" />
                    <SelectValue />
                  </span>
                </SelectTrigger>
                <SelectContent className="max-h-80 bg-charcoal border-gold/30">
                  <SelectItem value="all" className="focus:bg-gold-soft focus:text-foreground">All 58 Wilayas</SelectItem>
                  {WILAYAS.map((w, i) => (
                    <SelectItem key={w} value={w} className="focus:bg-gold-soft focus:text-foreground">
                      <span className="text-gold/70 mr-2 text-xs tabular-nums">{String(i + 1).padStart(2, "0")}</span>{w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* SHOWROOMS TAB */}
        {tab === "showrooms" ? (
          <div className="animate-fade-in">
            <ResultsHeader count={showroomResults.length} label="showroom" wilaya={wilaya} />
            {showroomResults.length === 0 ? (
              <EmptyState text="No showrooms match your search." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {showroomResults.map((s) => (
                  <div key={s.name} className="premium-card rounded-xl p-5 hover:gold-border transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-display text-xl flex items-center gap-1.5">
                          <span className="truncate">{s.name}</span>
                          {s.verified && <BadgeCheck className="h-4 w-4 text-gold shrink-0" />}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-gold" /> {s.wilaya}
                        </div>
                      </div>
                      <span className="h-10 w-10 grid place-items-center rounded-lg bg-gold-soft shrink-0">
                        <Store className="h-5 w-5 text-gold" />
                      </span>
                    </div>
                    <div className="h-px bg-gradient-to-r from-gold/40 via-gold/10 to-transparent my-4" />
                    <div className="text-sm text-gold">{s.specialty}</div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {s.brands.map((b) => (
                        <span key={b} className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border border-gold/25 text-muted-foreground">{b}</span>
                      ))}
                    </div>
                    <Button asChild variant="gold-outline" size="sm" className="mt-4 w-full">
                      <a href={`tel:${s.phone}`}><Phone className="h-4 w-4" /> Contact showroom</a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : searching ? (
          /* VEHICLE SEARCH RESULTS */
          <div className="animate-fade-in">
            <ResultsHeader count={vehicleResults.length} label="vehicle" wilaya={wilaya} />
            {vehicleResults.length === 0 ? (
              <EmptyState text="No vehicles match your search." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {vehicleResults.map((v) => (
                  <ModelCard
                    key={`${v.brand}-${v.name}`}
                    model={v}
                    brand={v.brand}
                    wilaya={wilaya === "all" ? "Algeria" : wilaya}
                  />
                ))}
              </div>
            )}
          </div>
        ) : !selectedBrand ? (
          /* BRAND BROWSE */
          <div className="space-y-12 animate-fade-in">
            {CATALOG.map((group) => (
              <section key={group.group}>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="font-display text-2xl">{group.group}</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-gold/40 via-gold/10 to-transparent" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {group.brands.map((b) => (
                    <button
                      key={b.name}
                      onClick={() => setSelectedBrand(b)}
                      className="group relative text-left premium-card rounded-xl p-5 hover:gold-border transition-all hover-scale overflow-hidden"
                    >
                      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gold/10 blur-2xl group-hover:bg-gold/20 transition" />
                      <div className="relative">
                        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">{b.origin}</div>
                        <div className="font-display text-xl gold-text">{b.name}</div>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">"{b.tagline}"</p>
                        <div className="mt-4 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{b.models.length} models</span>
                          <span className="text-gold font-semibold opacity-0 group-hover:opacity-100 transition">View →</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          /* BRAND DETAIL */
          <div className="animate-fade-in">
            <Button variant="gold-outline" size="sm" onClick={() => setSelectedBrand(null)} className="mb-6">
              <ChevronLeft className="h-4 w-4" /> All brands
            </Button>

            <div className="premium-card rounded-2xl p-6 sm:p-8 mb-8 gold-border">
              <div className="text-[11px] uppercase tracking-[0.3em] text-gold mb-2">
                {selectedBrand.origin} · Available in {wilaya === "all" ? "all wilayas" : wilaya}
              </div>
              <h2 className="font-display text-4xl sm:text-5xl gold-text">{selectedBrand.name}</h2>
              <p className="text-muted-foreground mt-2 italic">"{selectedBrand.tagline}"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {selectedBrand.models.map((m) => (
                <ModelCard key={m.name} model={m} brand={selectedBrand.name} wilaya={wilaya === "all" ? "Algeria" : wilaya} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultsHeader({ count, label, wilaya }: { count: number; label: string; wilaya: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h2 className="font-display text-xl">
        {count} {label}{count === 1 ? "" : "s"}
        {wilaya !== "all" && <span className="text-muted-foreground text-base"> · {wilaya}</span>}
      </h2>
      <div className="flex-1 h-px bg-gradient-to-r from-gold/40 via-gold/10 to-transparent" />
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="premium-card rounded-xl py-16 text-center text-muted-foreground">{text}</div>
  );
}

function ModelCard({ model: m, brand, wilaya }: { model: Model; brand: string; wilaya: string }) {
  const p = formatPrice(m.priceDA);
  return (
    <div className="premium-card rounded-xl p-6 hover:gold-border transition-all">
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">{brand}</div>
          <div className="font-display text-2xl truncate">{m.name}</div>
          {m.trim && <div className="text-sm text-muted-foreground mt-0.5">{m.trim}</div>}
        </div>
        {m.tag && (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-gold text-gold-foreground font-bold shrink-0">
            <Star className="h-3 w-3" />{m.tag}
          </span>
        )}
      </div>
      <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border border-gold/25 text-gold">{m.category}</span>
      <div className="h-px bg-gradient-to-r from-gold/40 via-gold/10 to-transparent my-4" />
      <div className="space-y-1">
        <div className="gold-text font-display text-2xl font-bold tabular-nums">{p.da}</div>
        <div className="text-xs text-muted-foreground tabular-nums">≈ {p.centimes}</div>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3 text-gold" /> Disponible à {wilaya}
      </div>
    </div>
  );
}
