/**
 * Build ordered gallery URLs from a property payload (same rules as the main site).
 * Prefers HTTPS URLs and avoids legacy local JPG placeholder when S3 URLs exist.
 */

const LEGACY_LISTING_PLACEHOLDER_JPG = "/images/listings/placeholder.jpg";
const LISTING_IMAGE_PLACEHOLDER = "/images/listings/placeholder.svg";

function isHttpImageUrl(s: string): boolean {
  const t = s.trim();
  return /^https?:\/\//i.test(t) || t.startsWith("//");
}

export function collectListingGalleryUrls(p: Record<string, unknown>): string[] {
  const raw: string[] = [];
  const cover = typeof p.coverImageUrl === "string" ? p.coverImageUrl.trim() : "";
  if (cover) raw.push(cover);
  const arr = p.imageUrls;
  if (Array.isArray(arr)) {
    for (const u of arr) {
      if (typeof u === "string" && u.trim()) raw.push(u.trim());
    }
  }
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const u of raw) {
    if (seen.has(u)) continue;
    seen.add(u);
    ordered.push(u);
  }
  const hasHttp = ordered.some(isHttpImageUrl);
  const withoutLegacyPlaceholder = hasHttp
    ? ordered.filter((u) => u !== LEGACY_LISTING_PLACEHOLDER_JPG)
    : ordered;
  const http = withoutLegacyPlaceholder.filter(isHttpImageUrl);
  const rest = withoutLegacyPlaceholder.filter((u) => !isHttpImageUrl(u));
  const merged = [...http, ...rest].map((u) =>
    u === LEGACY_LISTING_PLACEHOLDER_JPG ? LISTING_IMAGE_PLACEHOLDER : u,
  );
  if (!merged.length) return [];
  return merged;
}
