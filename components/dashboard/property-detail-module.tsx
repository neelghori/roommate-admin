"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { AdminPropertyRow } from "@/lib/api/admin-properties";

function formatPrice(n: number): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return String(iso);
  return new Date(t).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function pickString(v: unknown): string {
  return typeof v === "string" ? v : v != null ? String(v) : "";
}

const LISTING_TYPE_LABEL: Record<string, string> = {
  pg: "PG",
  flat: "Flat / Apartment",
  room: "Room / Rent",
  roommate_seeker: "Roommate",
};

type PropertyDetailModuleProps = {
  property: Record<string, unknown>;
  summary: AdminPropertyRow;
};

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-wide text-roommat-teal/90">
      {children}
    </h2>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-neutral-100 py-2.5 sm:grid-cols-[160px_1fr] sm:items-start">
      <dt className="text-xs font-semibold text-neutral-500">{label}</dt>
      <dd className="text-sm text-neutral-900 break-words">{value ?? "—"}</dd>
    </div>
  );
}

export function PropertyDetailModule({
  property,
  summary,
}: PropertyDetailModuleProps) {
  const owner = property.owner as Record<string, unknown> | undefined;
  const address = property.address as Record<string, unknown> | undefined;
  const rent = property.rentRange as Record<string, unknown> | undefined;
  const location = property.location as Record<string, unknown> | undefined;
  const social = property.socialLinks as Record<string, unknown> | undefined;
  const listerSnaps = property.listerSnapshots as unknown[] | undefined;
  const listerLegacy = property.listerSnapshot as Record<string, unknown> | undefined;

  const minRent = typeof rent?.min === "number" ? rent.min : null;
  const maxRent = typeof rent?.max === "number" ? rent.max : null;
  const coords = Array.isArray(location?.coordinates)
    ? (location!.coordinates as unknown[])
    : null;
  const lng = coords && typeof coords[0] === "number" ? coords[0] : null;
  const lat = coords && typeof coords[1] === "number" ? coords[1] : null;

  const amenityDocs = Array.isArray(property.amenityIds)
    ? (property.amenityIds as Record<string, unknown>[])
    : [];
  const amenityNames = amenityDocs
    .map((a) => pickString(a.name).trim())
    .filter(Boolean);

  const imageUrls: string[] = [];
  const cover = pickString(property.coverImageUrl);
  if (cover) imageUrls.push(cover);
  const imgs = property.imageUrls;
  if (Array.isArray(imgs)) {
    for (const u of imgs) {
      if (typeof u === "string" && u && !imageUrls.includes(u)) imageUrls.push(u);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/properties"
          className="text-sm font-medium text-roommat-teal hover:underline"
        >
          ← Back to properties
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          {pickString(property.title) || summary.title}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {imageUrls.length > 0 && (
            <section className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
              <SectionTitle>Photos</SectionTitle>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {imageUrls.map((url, i) => (
                  <a
                    key={`${url}-${i}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-video overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-neutral-100"
                  >
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full object-cover transition hover:opacity-90"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
            <SectionTitle>Listing</SectionTitle>
            <dl className="mt-2">
              <DetailRow
                label="Listing type"
                value={
                  LISTING_TYPE_LABEL[pickString(property.listingType)] ??
                  pickString(property.listingType)
                }
              />
              <DetailRow
                label="Rent"
                value={
                  minRent != null
                    ? maxRent != null && maxRent !== minRent
                      ? `${formatPrice(minRent)} – ${formatPrice(maxRent)}`
                      : formatPrice(minRent)
                    : "—"
                }
              />
              <DetailRow
                label="Currency"
                value={pickString(property.currency) || "INR"}
              />
              <DetailRow
                label="Available spots"
                value={pickString(property.availableSpots)}
              />
              <DetailRow
                label="Gender preference"
                value={pickString(property.genderPreference)}
              />
              <DetailRow
                label="Contact phone"
                value={pickString(property.contactPhone) || "—"}
              />
              <DetailRow
                label="Published"
                value={property.isPublished ? "Yes" : "No"}
              />
              {pickString(property.rejectionReason) && (
                <DetailRow
                  label="Rejection reason"
                  value={pickString(property.rejectionReason)}
                />
              )}
            </dl>
          </section>

          <section className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
            <SectionTitle>Address</SectionTitle>
            <dl className="mt-2">
              <DetailRow label="Line 1" value={pickString(address?.line1)} />
              <DetailRow label="Line 2" value={pickString(address?.line2)} />
              <DetailRow label="City" value={pickString(address?.city)} />
              <DetailRow label="State" value={pickString(address?.state)} />
              <DetailRow
                label="Postal code"
                value={pickString(address?.postalCode)}
              />
              <DetailRow label="Country" value={pickString(address?.country)} />
            </dl>
          </section>

          <section className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
            <SectionTitle>Map / coordinates</SectionTitle>
            <dl className="mt-2">
              <DetailRow
                label="Latitude"
                value={lat != null ? String(lat) : "—"}
              />
              <DetailRow
                label="Longitude"
                value={lng != null ? String(lng) : "—"}
              />
            </dl>
          </section>

          <section className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
            <SectionTitle>Description</SectionTitle>
            <p className="mt-3 whitespace-pre-wrap text-sm text-neutral-800">
              {pickString(property.description) || "—"}
            </p>
          </section>

          {amenityNames.length > 0 && (
            <section className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
              <SectionTitle>Amenities</SectionTitle>
              <ul className="mt-3 flex flex-wrap gap-2">
                {amenityNames.map((name) => (
                  <li
                    key={name}
                    className="rounded-full bg-roommat-mint-bg px-3 py-1 text-xs font-medium text-roommat-teal ring-1 ring-roommat-teal/15"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {social && Object.keys(social).length > 0 ? (
            <section className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
              <SectionTitle>Social & links</SectionTitle>
              <dl className="mt-2">
                <DetailRow
                  label="Instagram"
                  value={pickString(social?.instagram)}
                />
                <DetailRow
                  label="Facebook"
                  value={pickString(social?.facebook)}
                />
                <DetailRow
                  label="WhatsApp"
                  value={pickString(social?.whatsapp)}
                />
              </dl>
            </section>
          ) : null}

          {Array.isArray(listerSnaps) && listerSnaps.length > 0 ? (
            <section className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
              <SectionTitle>Residents ({listerSnaps.length})</SectionTitle>
              <ul className="mt-3 space-y-4">
                {listerSnaps.map((entry, i) => {
                  const lister = entry as Record<string, unknown>;
                  if (!lister || typeof lister !== "object") return null;
                  return (
                    <li
                      key={`lister-${i}`}
                      className="rounded-xl border border-neutral-100 bg-neutral-50/80 p-3"
                    >
                      <p className="text-xs font-semibold text-neutral-600 mb-2">#{i + 1}</p>
                      <dl>
                        {Object.entries(lister).map(([k, v]) => (
                          <DetailRow
                            key={k}
                            label={k}
                            value={
                              v != null && typeof v === "object"
                                ? JSON.stringify(v)
                                : pickString(v)
                            }
                          />
                        ))}
                      </dl>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : listerLegacy && Object.keys(listerLegacy).length > 0 ? (
            <section className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
              <SectionTitle>Lister snapshot (legacy)</SectionTitle>
              <dl className="mt-2">
                {Object.entries(listerLegacy).map(([k, v]) => (
                  <DetailRow
                    key={k}
                    label={k}
                    value={
                      v != null && typeof v === "object"
                        ? JSON.stringify(v)
                        : pickString(v)
                    }
                  />
                ))}
              </dl>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
            <SectionTitle>Owner</SectionTitle>
            <dl className="mt-3 space-y-2 text-sm">
              <DetailRow label="Name" value={pickString(owner?.fullName)} />
              <DetailRow label="Email" value={pickString(owner?.email)} />
              <DetailRow label="Mobile" value={pickString(owner?.mobile)} />
              <DetailRow label="Role" value={pickString(owner?.role)} />
            </dl>
          </div>
          <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
            <SectionTitle>Record</SectionTitle>
            <dl className="mt-3">
              <DetailRow
                label="Created"
                value={formatDate(pickString(property.createdAt))}
              />
              <DetailRow
                label="Updated"
                value={formatDate(pickString(property.updatedAt))}
              />
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
