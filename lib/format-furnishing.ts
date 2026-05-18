const LABELS: Record<string, string> = {
  unfurnished: "Unfurnished",
  semi_furnished: "Semi Furnished",
  fully_furnished: "Fully Furnished",
};

export function formatFurnishingLabel(raw: string | undefined | null): string {
  if (!raw?.trim()) return "—";
  const key = raw.trim().toLowerCase();
  if (LABELS[key]) return LABELS[key];
  return raw
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
