// Smart market valuation logic for vehicle pricing.

export type DealRating = "great" | "fair" | "above";

export type DealInfo = {
  rating: DealRating;
  label: string;
  labelAr: string;
  badgeClass: string;
  diffPercent: number;
  averagePrice: number;
  similarCount: number;
  tooltip: string;
};

const MIN_SAMPLE = 3;

type ComparableVehicle = {
  brand: string;
  model: string;
  year: number;
  fixed_price: number | null;
  price_type: string;
  current_highest_bid: number | null;
  starting_price: number | null;
  status: string;
};

export type GrandScore = {
  score: number;
  label: "Excellent" | "Good" | "Needs details";
  labelAr: string;
  factors: string[];
};

export function calculateGrandScore(vehicle: {
  images?: string[];
  description?: string | null;
  mileage?: number | null;
  documents_status?: string | null;
  year?: number | null;
  phone?: string | null;
}): GrandScore {
  let score = 35;
  const factors: string[] = [];
  if ((vehicle.images?.length ?? 0) >= 5) { score += 15; factors.push("5+ photos"); }
  else if ((vehicle.images?.length ?? 0) >= 1) { score += 8; factors.push("Photos added"); }
  if ((vehicle.description?.trim().length ?? 0) >= 80) { score += 15; factors.push("Detailed description"); }
  else if ((vehicle.description?.trim().length ?? 0) >= 20) { score += 8; factors.push("Description added"); }
  if (vehicle.mileage !== null && vehicle.mileage !== undefined) { score += 8; factors.push("Mileage provided"); }
  if (vehicle.documents_status && vehicle.documents_status !== "Unknown") { score += 12; factors.push("Documents status"); }
  if (vehicle.year && vehicle.year >= 2000) { score += 7; factors.push("Year provided"); }
  if (vehicle.phone) { score += 8; factors.push("Contact available"); }
  const bounded = Math.min(100, score);
  return {
    score: bounded,
    label: bounded >= 80 ? "Excellent" : bounded >= 60 ? "Good" : "Needs details",
    labelAr: bounded >= 80 ? "ممتاز" : bounded >= 60 ? "جيد" : "يحتاج تفاصيل",
    factors,
  };
}

export function calculateDeal(
  price: number,
  brand: string,
  model: string,
  year: number,
  allVehicles: ComparableVehicle[]
): DealInfo | null {
  if (!price || price <= 0) return null;

  const priceOf = (v: ComparableVehicle) =>
    v.price_type === "fixed" ? (v.fixed_price ?? 0) : (v.current_highest_bid ?? v.starting_price ?? 0);

  const similar = allVehicles.filter(
    (v) =>
      v.brand === brand &&
      v.model === model &&
      v.year === year &&
      (v.status === "active" || v.status === "sold") &&
      priceOf(v) > 0
  );

  // Never present a market verdict from an insufficient sample. Callers can
  // show the explicit "not enough data" state instead of inventing an average.
  if (similar.length < MIN_SAMPLE) return null;

  const avg = similar.reduce((sum, v) => sum + priceOf(v), 0) / similar.length;
  const diff = ((price - avg) / avg) * 100;

  if (diff <= -5) {
    return {
      rating: "great",
      label: "Great Price",
      labelAr: "سعر ممتاز",
      badgeClass: "bg-green-500/20 text-green-400 border-green-500/40",
      diffPercent: Math.abs(diff),
      averagePrice: avg,
      similarCount: similar.length,
      tooltip: `This price is ${Math.abs(diff).toFixed(0)}% below average for ${brand} ${model} ${year} (${similar.length} listings compared).`,
    };
  } else if (diff > 5) {
    return {
      rating: "above",
      label: "Above Market",
      labelAr: "أعلى من السوق",
      badgeClass: "bg-zinc-500/20 text-zinc-300 border-zinc-500/40",
      diffPercent: diff,
      averagePrice: avg,
      similarCount: similar.length,
      tooltip: `This price is ${diff.toFixed(0)}% above average for ${brand} ${model} ${year} (${similar.length} listings compared).`,
    };
  }

  return {
    rating: "fair",
    label: "Fair Price",
    labelAr: "سعر عادل",
    badgeClass: "bg-gold/20 text-gold border-gold/40",
    diffPercent: diff,
    averagePrice: avg,
    similarCount: similar.length,
    tooltip: `This price is within ±5% of the average for ${brand} ${model} ${year} (${similar.length} listings compared).`,
  };
}
