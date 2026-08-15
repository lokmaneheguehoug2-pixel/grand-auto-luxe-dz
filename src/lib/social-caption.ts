export type CaptionLanguage = "darija" | "french" | "arabic";

export type VehicleInfo = {
  brand: string;
  model: string;
  year: number;
  wilaya: string;
  price_type: "fixed" | "auction";
  fixed_price: number | null;
  starting_price: number | null;
  fuel_type?: string;
  transmission?: string;
  mileage?: number;
};

export type GeneratedCaption = {
  caption: string;
  hashtags: string[];
};

const PROMO_CODE = "START30";
const BASE_URL = "https://grand-auto-luxe-dz.vercel.app";

function formatPrice(v: VehicleInfo): string {
  if (v.price_type === "auction") {
    return `${v.starting_price?.toLocaleString("fr-DZ") ?? "—"} DZD (Enchère)`;
  }
  return `${v.fixed_price?.toLocaleString("fr-DZ") ?? "—"} DZD`;
}

function buildHashtags(v: VehicleInfo): string[] {
  const tags = new Set<string>([
    "#GrandAutoLuxe",
    "#VoitureAlgerie",
    `#${v.brand.replace(/\s+/g, "")}`,
    `#${v.model.replace(/\s+/g, "")}`,
    `#${v.year}`,
    `#${v.wilaya.replace(/\s+/g, "")}`,
    "#AlgerieAuto",
    "#AutoDZ",
    "#OccasionAlgerie",
    "#VenteVoiture",
  ]);
  if (v.fuel_type) {
    const fuel = v.fuel_type.toLowerCase();
    if (fuel.includes("diesel")) tags.add("#Diesel");
    if (fuel.includes("essence")) tags.add("#Essence");
    if (fuel.includes("gpl")) tags.add("#GPL");
    if (fuel.includes("hybrid")) tags.add("#Hybride");
    if (fuel.includes("electr")) tags.add("#Electrique");
  }
  if (v.transmission) {
    tags.add(v.transmission.toLowerCase().includes("auto") ? "#Automatique" : "#Manuelle");
  }
  if (v.price_type === "auction") tags.add("#Enchere");
  return Array.from(tags);
}

function buildDarija(v: VehicleInfo, carLink: string): string {
  const price = formatPrice(v);
  return [
    `🚗 ${v.brand} ${v.model} - ${v.year}`,
    `📍 ${v.wilaya}`,
    `💰 ${price}`,
    v.fuel_type ? `⛽ ${v.fuel_type}` : null,
    v.transmission ? `⚙️ ${v.transmission}` : null,
    v.mileage != null ? `📏 ${v.mileage.toLocaleString("fr-DZ")} km` : null,
    "",
    "🔥 فرصة مميزة في Grand Auto Luxe!",
    `🎁 استعمل الكود ${PROMO_CODE} باش تربح تخفيض`,
    `🔗 ${carLink}`,
  ].filter(Boolean).join("\n");
}

function buildFrench(v: VehicleInfo, carLink: string): string {
  const price = formatPrice(v);
  return [
    `🚗 ${v.brand} ${v.model} - ${v.year}`,
    `📍 ${v.wilaya}`,
    `💰 ${price}`,
    v.fuel_type ? `⛽ ${v.fuel_type}` : null,
    v.transmission ? `⚙️ ${v.transmission}` : null,
    v.mileage != null ? `📏 ${v.mileage.toLocaleString("fr-DZ")} km` : null,
    "",
    "🔥 Occasion premium chez Grand Auto Luxe!",
    `🎁 Utilisez le code ${PROMO_CODE} pour un tarif special`,
    `🔗 ${carLink}`,
  ].filter(Boolean).join("\n");
}

function buildArabic(v: VehicleInfo, carLink: string): string {
  const price = formatPrice(v);
  return [
    `🚗 ${v.brand} ${v.model} - ${v.year}`,
    `📍 ${v.wilaya}`,
    `💰 ${price}`,
    v.fuel_type ? `⛽ ${v.fuel_type}` : null,
    v.transmission ? `⚙️ ${v.transmission}` : null,
    v.mileage != null ? `📏 ${v.mileage.toLocaleString("fr-DZ")} كم` : null,
    "",
    "🔥 فرصة مميزة في Grand Auto Luxe!",
    `🎁 استخدم الكود ${PROMO_CODE} للحصول على عرض خاص`,
    `🔗 ${carLink}`,
  ].filter(Boolean).join("\n");
}

export function carLinkFor(vehicleId: string): string {
  return `${BASE_URL}/car/${vehicleId}`;
}

export function generateCaption(
  v: VehicleInfo,
  vehicleId: string,
  language: CaptionLanguage = "darija",
): GeneratedCaption {
  const carLink = carLinkFor(vehicleId);
  let caption: string;
  switch (language) {
    case "french":
      caption = buildFrench(v, carLink);
      break;
    case "arabic":
      caption = buildArabic(v, carLink);
      break;
    case "darija":
    default:
      caption = buildDarija(v, carLink);
      break;
  }
  const hashtags = buildHashtags(v);
  return { caption, hashtags };
}

export function captionWithHashtags(caption: string, hashtags: string[]): string {
  return `${caption}\n\n${hashtags.join(" ")}`;
}
