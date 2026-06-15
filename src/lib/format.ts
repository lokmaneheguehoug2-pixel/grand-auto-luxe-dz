export const formatDZD = (n?: number | null) => {
  if (n == null) return "—";
  return new Intl.NumberFormat("fr-DZ").format(n) + " DZD";
};

export const normalizePhone = (raw: string) => raw.replace(/\s|-/g, "");

export const phoneToEmail = (phone: string) => `${normalizePhone(phone).replace(/[^0-9+]/g, "")}@grandauto.local`;
