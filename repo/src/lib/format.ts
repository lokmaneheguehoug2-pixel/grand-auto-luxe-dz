// Algerian market price formatting utilities.
// In Algeria, prices are commonly spoken in "Centimes" (1 DZD = 100 centimes),
// and large prices in "Millions" (of centimes).
// Example: 7,000,000 DZD = 700 Millions DZD (centimes).

const fmt = new Intl.NumberFormat("fr-DZ");

// Primary money display — uses Millions for large amounts so prices stay readable.
// e.g. 7_000_000 DZD => "700 Millions DZD"; 70_000 DZD => "7 Millions DZD"; 800 DZD => "800 DZD"
export const formatDZD = (n?: number | null) => {
  if (n == null) return "—";
  if (n >= 10_000) {
    const m = (n * 100) / 1_000_000; // millions of centimes
    const rounded = Number.isInteger(m) ? m : Number(m.toFixed(1));
    return `${fmt.format(rounded)} Millions DZD`;
  }
  return `${fmt.format(n)} DZD`;
};

// Secondary subtitle: raw DZD figure for the receipt-style breakdown.
export const formatCentimes = (dzd?: number | null) => {
  if (dzd == null) return "—";
  return `${fmt.format(dzd)} DZD`;
};

export const formatAlgerianPrice = (dzd?: number | null) => {
  if (dzd == null) return "—";
  return `${formatDZD(dzd)} · ${formatCentimes(dzd)}`;
};


