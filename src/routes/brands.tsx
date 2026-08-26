import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { WILAYAS } from "@/lib/wilayas";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MapPin, Sparkles, Star } from "lucide-react";

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "Explore Brands — GRAND Auto Luxe" },
      { name: "description", content: "Browse popular European, Chinese and Asian car brands and models available in Algeria with realistic Algerian Dinar pricing." },
      { property: "og:title", content: "Explore Brands — GRAND Auto Luxe" },
      { property: "og:description", content: "Premium catalogue of vehicles popular in the Algerian market." },
    ],
  }),
  component: BrandsPage,
});

type Model = { name: string; trim?: string; priceDA: number; tag?: string };
type Brand = { name: string; origin: string; tagline: string; models: Model[] };

const CATALOG: { group: string; brands: Brand[] }[] = [
  {
    group: "European & Luxury",
    brands: [
      { name: "Mercedes-Benz", origin: "Germany", tagline: "The best or nothing", models: [
        { name: "G-Class", trim: "G63 AMG", priceDA: 95_000_000, tag: "Icon" },
        { name: "C-Class", trim: "C200 AMG Line", priceDA: 18_500_000 },
        { name: "E-Class", trim: "E300 Avantgarde", priceDA: 27_000_000 },
      ]},
      { name: "Volkswagen", origin: "Germany", tagline: "Das Auto", models: [
        { name: "Golf 8", trim: "R-Line", priceDA: 9_800_000, tag: "Hot" },
        { name: "Golf 7.5", trim: "Facelift", priceDA: 6_500_000 },
        { name: "Polo", trim: "Beats", priceDA: 5_200_000 },
      ]},
      { name: "BMW", origin: "Germany", tagline: "Sheer driving pleasure", models: [
        { name: "M4", trim: "Competition", priceDA: 42_000_000, tag: "Performance" },
        { name: "Series 1", trim: "M Sport", priceDA: 12_500_000 },
        { name: "X6", trim: "M Package", priceDA: 38_000_000 },
      ]},
      { name: "Audi", origin: "Germany", tagline: "Vorsprung durch Technik", models: [
        { name: "A3", trim: "Sportback", priceDA: 11_200_000 },
        { name: "Q3", trim: "Sportback", priceDA: 16_800_000 },
        { name: "RS6", trim: "Avant", priceDA: 55_000_000, tag: "Beast" },
      ]},
      { name: "Porsche", origin: "Germany", tagline: "There is no substitute", models: [
        { name: "Macan", trim: "Turbo", priceDA: 48_000_000 },
        { name: "Cayenne", trim: "Coupé", priceDA: 62_000_000 },
        { name: "911", trim: "Carrera", priceDA: 78_000_000, tag: "Legend" },
      ]},
      { name: "Seat", origin: "Spain", tagline: "Created in Barcelona", models: [
        { name: "Ibiza", trim: "Highline", priceDA: 4_900_000 },
        { name: "Leon", trim: "Cupra", priceDA: 8_900_000 },
        { name: "Arona", trim: "Xperience", priceDA: 6_400_000 },
      ]},
    ],
  },
  {
    group: "Chinese — Highly Popular in DZ",
    brands: [
      { name: "Geely", origin: "China", tagline: "Refined Chinese engineering", models: [
        { name: "Coolray", trim: "Sport", priceDA: 4_350_000, tag: "Best Seller" },
        { name: "Emgrand", trim: "Comfort", priceDA: 3_200_000 },
        { name: "GX3 Pro", trim: "Premium", priceDA: 3_650_000 },
      ]},
      { name: "Chery", origin: "China", tagline: "Drive the change", models: [
        { name: "Tiggo 2", trim: "Pro Luxury", priceDA: 2_750_000 },
        { name: "Tiggo 4", trim: "Pro Elite", priceDA: 3_950_000, tag: "Value" },
        { name: "Arrizo 5", trim: "Pro", priceDA: 3_100_000 },
      ]},
      { name: "Jetour", origin: "China", tagline: "Travel Plus", models: [
        { name: "X70", trim: "Plus 7-seats", priceDA: 4_200_000 },
        { name: "Dashing", trim: "AWD", priceDA: 4_800_000 },
        { name: "X90", trim: "Plus", priceDA: 5_300_000 },
      ]},
      { name: "Changan", origin: "China", tagline: "Smart mobility", models: [
        { name: "Alsvin", trim: "Lumiere", priceDA: 2_390_000 },
        { name: "CS35", trim: "Plus", priceDA: 3_700_000 },
        { name: "Uni-T", trim: "Sport", priceDA: 4_550_000, tag: "New" },
      ]},
    ],
  },
  {
    group: "Asian Giants",
    brands: [
      { name: "Hyundai", origin: "South Korea", tagline: "New thinking. New possibilities.", models: [
        { name: "Tucson", trim: "N-Line", priceDA: 7_900_000, tag: "Trending" },
        { name: "Accent", trim: "Hatchback / Sedan", priceDA: 3_850_000 },
        { name: "i10", trim: "GLS", priceDA: 2_650_000 },
      ]},
      { name: "Kia", origin: "South Korea", tagline: "Movement that inspires", models: [
        { name: "Sportage", trim: "GT-Line", priceDA: 8_400_000 },
        { name: "Seltos", trim: "EX+", priceDA: 6_200_000 },
        { name: "Picanto", trim: "GT-Line", priceDA: 2_800_000 },
      ]},
      { name: "Toyota", origin: "Japan", tagline: "Let's go places", models: [
        { name: "Hilux", trim: "Adventure", priceDA: 11_500_000, tag: "King" },
        { name: "Land Cruiser", trim: "LC300", priceDA: 65_000_000, tag: "Flagship" },
        { name: "Yaris", trim: "Premium", priceDA: 3_400_000 },
      ]},
    ],
  },
];

function formatPrice(da: number) {
  const da_str = da.toLocaleString("fr-FR");
  const centimes_m = Math.round(da / 10_000); // 1 DA = 100 centimes, expressed in millions
  return { da: `${da_str} DA`, centimes: `${centimes_m.toLocaleString("fr-FR")} Millions de Centimes` };
}

function BrandsPage() {
  const [wilaya, setWilaya] = useState<string>("Alger");
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  const groupedBrands = useMemo(() => CATALOG, []);

  return (
    <div className="relative">
      {/* Glow background */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_-10%,rgba(212,175,55,0.18),transparent_55%),radial-gradient(circle_at_90%_30%,rgba(212,175,55,0.08),transparent_55%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Hero */}
        <div className="mb-8 sm:mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold mb-3">
              <Sparkles className="h-3.5 w-3.5" /> Catalogue · Algeria
            </div>
            <h1 className="font-display text-4xl sm:text-5xl leading-[1.05]">
              Explore <span className="gold-text">premium brands</span> trusted across Algeria.
            </h1>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base">
              Curated European, Chinese and Asian line-ups with authentic Algerian market pricing.
            </p>
          </div>

          {/* Wilaya selector */}
          <div className="w-full md:w-80">
            <label className="text-[11px] uppercase tracking-[0.25em] text-gold mb-2 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Select Wilaya</label>
            <Select value={wilaya} onValueChange={setWilaya}>
              <SelectTrigger className="h-12 bg-charcoal border-gold/30 hover:border-gold/60 transition-colors gold-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-80 bg-charcoal border-gold/30">
                {WILAYAS.map((w, i) => (
                  <SelectItem key={w} value={w} className="focus:bg-gold-soft focus:text-foreground">
                    <span className="text-gold/70 mr-2 text-xs tabular-nums">{String(i+1).padStart(2,"0")}</span>{w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Brand grid OR Model detail */}
        {!selectedBrand ? (
          <div className="space-y-12 animate-fade-in">
            {groupedBrands.map((group) => (
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
          <div className="animate-fade-in">
            <Button variant="gold-outline" size="sm" onClick={() => setSelectedBrand(null)} className="mb-6">
              <ChevronLeft className="h-4 w-4" /> All brands
            </Button>

            <div className="premium-card rounded-2xl p-6 sm:p-8 mb-8 gold-border">
              <div className="text-[11px] uppercase tracking-[0.3em] text-gold mb-2">{selectedBrand.origin} · Available in {wilaya}</div>
              <h2 className="font-display text-4xl sm:text-5xl gold-text">{selectedBrand.name}</h2>
              <p className="text-muted-foreground mt-2 italic">"{selectedBrand.tagline}"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {selectedBrand.models.map((m) => {
                const p = formatPrice(m.priceDA);
                return (
                  <div key={m.name} className="premium-card rounded-xl p-6 hover:gold-border transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-display text-2xl">{m.name}</div>
                        {m.trim && <div className="text-sm text-muted-foreground mt-0.5">{m.trim}</div>}
                      </div>
                      {m.tag && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-gold text-gold-foreground font-bold">
                          <Star className="h-3 w-3" />{m.tag}
                        </span>
                      )}
                    </div>
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
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
