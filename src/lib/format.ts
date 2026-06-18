// Algerian market price formatting utilities.
// In Algeria, prices are commonly spoken in "Centimes" (1 DZD = 100 centimes),
// and large prices in "Millions" (of centimes).

export const formatDZD = (n?: number | null) => {
  if (n == null) return "—";
  return new Intl.NumberFormat("fr-DZ").format(n) + " DZD";
};

// e.g. 5_400_000 DZD => "540 Millions (Centimes)"
export const formatCentimes = (dzd?: number | null) => {
  if (dzd == null) return "—";
  const centimesMillions = (dzd * 100) / 1_000_000;
  if (centimesMillions >= 1) {
    const rounded = Number.isInteger(centimesMillions)
      ? centimesMillions
      : Number(centimesMillions.toFixed(2));
    return `${new Intl.NumberFormat("fr-DZ").format(rounded)} Millions`;
  }
  return new Intl.NumberFormat("fr-DZ").format(dzd * 100) + " Centimes";
};

// Full Algerian-style price line: "5 400 000 DZD · 540 Millions"
export const formatAlgerianPrice = (dzd?: number | null) => {
  if (dzd == null) return "—";
  return `${formatDZD(dzd)} · ${formatCentimes(dzd)}`;
};

export const normalizePhone = (raw: string) => raw.replace(/\s|-/g, "");

export const phoneToEmail = (phone: string) =>
  `${normalizePhone(phone).replace(/[^0-9+]/g, "")}@grandauto.local`;
