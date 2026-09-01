// Algerian market price formatting utilities.
// In Algeria, prices are commonly spoken in "Centimes" (1 DZD = 100 centimes),
// and large prices in "Millions" (of centimes).
// Example: 7,000,000 DZD = 700 Millions DZD (centimes).

const fmt = new Intl.NumberFormat("fr-DZ");

// Primary money display — uses Millions/Milliard for large amounts so prices stay readable.
// e.g. 7_000_000 DZD => "700 Millions DZD"; 10_000_000_000 DZD => "1 Milliard DZD"
export const formatDZD = (n?: number | null) => {
  if (n == null) return "—";
  if (n >= 10_000) {
    const centimes = n * 100; // convert DZD to centimes
    const millions = centimes / 1_000_000; // millions of centimes
    if (millions >= 1000) {
      const milliards = millions / 1000;
      const rounded = Number.isInteger(milliards) ? milliards : Number(milliards.toFixed(2));
      return `${fmt.format(rounded)} Milliard DZD`;
    }
    const rounded = Number.isInteger(millions) ? millions : Number(millions.toFixed(1));
    return `${fmt.format(rounded)} Millions DZD`;
  }
  return `${fmt.format(n)} DZD`;
};

// Arabic display with مليون / مليار
export const formatDZDArabic = (n?: number | null) => {
  if (n == null) return "—";
  if (n >= 10_000) {
    const millions = (n * 100) / 1_000_000;
    if (millions >= 1000) {
      const milliards = millions / 1000;
      const rounded = Number.isInteger(milliards) ? milliards : Number(milliards.toFixed(2));
      return `${fmt.format(rounded)} مليار`;
    }
    const rounded = Number.isInteger(millions) ? millions : Number(millions.toFixed(1));
    return `${fmt.format(rounded)} مليون`;
  }
  return `${fmt.format(n)} دج`;
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

// Parse user input that might be in millions, milliards, or raw DZD.
// "100" or "100 Million" => 100_000_000 (100M centimes = 1M DZD... wait)
// Actually: 100 Million centimes = 1,000,000 DZD. So "100" means 100 million centimes = 1,000,000 DZD.
// "1000" => 1000 million centimes = 10,000,000 DZD = 1 milliard centimes
// "1000000" => 1,000,000 DZD directly
// "1,000,000 DZD" => 1,000,000 DZD
export const parseAlgerianInput = (input: string): number => {
  const cleaned = input.trim().replace(/[,\s]/g, "").replace(/DZD|دج|DA/gi, "").replace(/centimes?/gi, "");
  const num = Number(cleaned);
  if (isNaN(num)) return 0;

  const lower = input.toLowerCase();
  const hasMillion = /million|مليون/.test(lower);
  const hasMilliard = /milliard|مليار|billion/.test(lower);

  if (hasMilliard) {
    // N milliard centimes = N * 1000 million centimes = N * 10,000,000 DZD
    return num * 10_000_000;
  }
  if (hasMillion) {
    // N million centimes = N * 10,000 DZD
    return num * 10_000;
  }
  // Raw number: if small (under 100000), treat as million centimes
  // If large (>= 100000), treat as raw DZD
  if (num < 100_000) {
    return num * 10_000; // treat as million centimes
  }
  return num; // raw DZD
};

// Convert DZD to million centimes for slider display
export const dzdToMillionCentimes = (dzd: number): number => {
  return Math.round((dzd * 100) / 1_000_000);
};

// Convert million centimes back to DZD
export const millionCentimesToDZD = (m: number): number => {
  return Math.round((m * 1_000_000) / 100);
};
