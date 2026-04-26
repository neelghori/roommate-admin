"use client";

import { MapPin } from "lucide-react";
import {
  googleMapsIframeEmbedUrl,
  googleMapsOpenUrl,
  hasMapCoordinates,
} from "@/lib/googleMapsEmbed";

type AdminListingLocationMapProps = {
  latitude?: number | null;
  longitude?: number | null;
  locationLabel: string;
};

/**
 * Google Map embed from lat/lng — mirrors the website listing map (iframe, no API key).
 */
export function AdminListingLocationMap({
  latitude,
  longitude,
  locationLabel,
}: AdminListingLocationMapProps) {
  const lat = latitude ?? undefined;
  const lng = longitude ?? undefined;

  if (
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    !hasMapCoordinates(lat, lng)
  ) {
    return (
      <div
        className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-roommat-teal/25 bg-roommat-mint-bg/50 py-14"
        role="img"
        aria-label="Map unavailable"
      >
        <MapPin className="h-8 w-8 text-roommat-teal" aria-hidden />
        <p className="text-sm font-semibold text-roommat-teal">
          {locationLabel.trim() || "Location"}
        </p>
        <p className="max-w-sm px-4 text-center text-xs text-roommat-muted">
          No map pin on file. Coordinates appear once the listing form saves a place with lat/lng.
        </p>
      </div>
    );
  }

  const embedSrc = googleMapsIframeEmbedUrl(lat, lng);
  const openHref = googleMapsOpenUrl(lat, lng);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-sm">
      <iframe
        title={`Map: ${locationLabel || "Property location"}`}
        src={embedSrc}
        className="block h-[220px] w-full border-0 sm:h-[260px] lg:h-[300px]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 bg-white px-3 py-2 text-xs text-neutral-600">
        <span className="truncate">{locationLabel}</span>
        <a
          href={openHref}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 font-semibold text-roommat-teal underline-offset-2 hover:underline"
        >
          Open in Google Maps
        </a>
      </div>
    </div>
  );
}
