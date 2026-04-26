"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  fetchAdminVisitBookings,
  type AdminVisitBookingRow,
} from "@/lib/api/admin-bookings";
import { getAdminAccessToken } from "@/lib/auth/admin-token";

export type { AdminVisitBookingRow };

function formatWhen(iso: string): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  return new Date(t).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatVisitDate(iso: string): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  return new Date(t).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatRent(n: number | null): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

function visitStatusPill(status: string): string {
  const s = status.toLowerCase();
  if (s === "confirmed")
    return "bg-emerald-50 text-emerald-900 ring-emerald-600/20";
  if (s === "cancelled")
    return "bg-neutral-100 text-neutral-700 ring-neutral-500/20";
  if (s === "completed")
    return "bg-sky-50 text-sky-900 ring-sky-600/20";
  return "bg-amber-50 text-amber-900 ring-amber-600/20";
}

function listingTypeLabel(code: string): string {
  const c = code.toLowerCase();
  const map: Record<string, string> = {
    pg: "PG",
    flat: "Flat",
    room: "Room / rent",
    roommate_seeker: "Roommate",
  };
  return map[c] ?? (code || "—");
}

export function BookingsModule() {
  const [items, setItems] = useState<AdminVisitBookingRow[]>([]);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const load = useCallback(async () => {
    const token = getAdminAccessToken();
    if (!token) {
      setLoadState("error");
      setErrorMessage("You are not signed in.");
      return;
    }
    setLoadState("loading");
    setErrorMessage(null);
    const result = await fetchAdminVisitBookings(token);
    if (!result.ok) {
      setLoadState("error");
      setErrorMessage(result.message);
      toast.error(result.message);
      return;
    }
    setItems(result.items);
    setLoadState("idle");
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const c = { all: items.length, pending: 0, confirmed: 0, cancelled: 0, completed: 0 };
    for (const row of items) {
      const s = row.status.toLowerCase();
      if (s === "pending") c.pending += 1;
      else if (s === "confirmed") c.confirmed += 1;
      else if (s === "cancelled") c.cancelled += 1;
      else if (s === "completed") c.completed += 1;
    }
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return items;
    return items.filter((r) => r.status.toLowerCase() === statusFilter);
  }, [items, statusFilter]);

  const STATUS_CARDS: { id: string; label: string; count: number }[] = [
    { id: "all", label: "All visits", count: counts.all },
    { id: "pending", label: "Pending", count: counts.pending },
    { id: "confirmed", label: "Confirmed", count: counts.confirmed },
    { id: "completed", label: "Completed", count: counts.completed },
    { id: "cancelled", label: "Cancelled", count: counts.cancelled },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-roommat-teal/90">
            Module
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Visit bookings
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-roommat-muted sm:text-base">
            Property visit requests from users: preferred slot, contact on the
            request, linked listing, and listing owner.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loadState === "loading"}
          className="inline-flex shrink-0 items-center justify-center rounded-xl border border-roommat-teal/20 bg-white px-4 py-2.5 text-sm font-semibold text-roommat-teal shadow-sm transition-colors hover:bg-roommat-mint-bg disabled:opacity-50"
        >
          {loadState === "loading" ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {loadState === "error" && errorMessage && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-900">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {STATUS_CARDS.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => setStatusFilter(k.id)}
            className={`rounded-2xl border p-4 text-left shadow-sm transition-colors ${
              statusFilter === k.id
                ? "border-roommat-teal bg-white ring-2 ring-roommat-teal/25"
                : "border-neutral-100 bg-white hover:border-roommat-teal/20"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-roommat-muted">
              {k.label}
            </p>
            <p className="mt-1.5 text-2xl font-bold text-neutral-900">{k.count}</p>
          </button>
        ))}
      </div>

      {loadState === "loading" && items.length === 0 && (
        <p className="py-12 text-center text-sm text-roommat-muted">
          Loading bookings…
        </p>
      )}

      {loadState === "idle" && filtered.length === 0 && (
        <div className="rounded-2xl border border-neutral-100 bg-white px-6 py-12 text-center text-sm text-roommat-muted shadow-sm">
          No bookings match this filter.
        </div>
      )}

      <ul className="space-y-4">
        {filtered.map((b) => (
          <li
            key={b.id}
            className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-colors hover:border-roommat-teal/20"
          >
            <div className="flex flex-col gap-4 p-4 lg:flex-row lg:gap-6 lg:p-5">
              <div className="flex gap-4 lg:w-[min(100%,280px)] lg:shrink-0">
                <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                  {b.property?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- remote S3 / CDN URLs from API
                    <img
                      src={b.property.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-neutral-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold capitalize ring-1 ring-inset ${visitStatusPill(b.status)}`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <p className="font-semibold text-neutral-900">
                    {b.property?.title ?? "Listing removed"}
                  </p>
                  <p className="text-xs text-roommat-muted">
                    {b.property
                      ? `${listingTypeLabel(b.property.listingType)} · ${formatRent(b.property.rentMin)}`
                      : "—"}
                  </p>
                  {b.property?.locationLabel ? (
                    <p className="line-clamp-2 text-xs text-neutral-600">
                      {b.property.locationLabel}
                    </p>
                  ) : null}
                  {b.property ? (
                    <Link
                      href={`/dashboard/properties/${encodeURIComponent(b.property.id)}`}
                      className="inline-block text-xs font-semibold text-roommat-orange hover:underline"
                    >
                      Open property in admin
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-4 border-t border-neutral-100 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wide text-roommat-muted">
                    Visit slot
                  </h3>
                  <p className="mt-1 text-sm text-neutral-900">
                    {formatVisitDate(b.preferredDate)}
                    {b.preferredTimeStart ? (
                      <span className="text-roommat-muted">
                        {" "}
                        · {b.preferredTimeStart}
                        {b.preferredTimeEnd ? ` – ${b.preferredTimeEnd}` : ""}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-xs text-roommat-muted">
                    Submitted {formatWhen(b.createdAt)}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-wide text-roommat-muted">
                      Contact on booking
                    </h3>
                    <p className="mt-1 text-sm font-medium text-neutral-900">
                      {b.contactName}
                    </p>
                    <p className="text-xs text-neutral-600">{b.contactPhone}</p>
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-wide text-roommat-muted">
                      Requester (account)
                    </h3>
                    {b.requester ? (
                      <>
                        <p className="mt-1 text-sm font-medium text-neutral-900">
                          {b.requester.fullName}
                        </p>
                        <p className="truncate text-xs text-neutral-600">
                          {b.requester.email}
                        </p>
                        {b.requester.mobile ? (
                          <p className="text-xs text-neutral-600">
                            {b.requester.mobile}
                          </p>
                        ) : null}
                        <p className="text-[11px] capitalize text-roommat-muted">
                          Role: {b.requester.role || "—"}
                        </p>
                      </>
                    ) : (
                      <p className="mt-1 text-sm text-roommat-muted">—</p>
                    )}
                  </div>
                </div>

                {b.property?.owner ? (
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-wide text-roommat-muted">
                      Property owner
                    </h3>
                    <p className="mt-1 text-sm font-medium text-neutral-900">
                      {b.property.owner.fullName}
                    </p>
                    <p className="truncate text-xs text-neutral-600">
                      {b.property.owner.email}
                    </p>
                    {b.property.owner.mobile ? (
                      <p className="text-xs text-neutral-600">
                        {b.property.owner.mobile}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {b.notes ? (
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-wide text-roommat-muted">
                      Notes
                    </h3>
                    <p className="mt-1 text-sm text-neutral-700">{b.notes}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
