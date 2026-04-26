/**
 * Google Maps iframe URLs (no Maps JavaScript API key).
 * Same behaviour as the main website listing map.
 */

export function hasMapCoordinates(lat: unknown, lng: unknown): lat is number {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

export function googleMapsIframeEmbedUrl(lat: number, lng: number, zoom = 15): string {
  const q = `${lat},${lng}`;
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=${zoom}&output=embed&hl=en`;
}

export function googleMapsOpenUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
