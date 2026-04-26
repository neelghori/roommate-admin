"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  fetchAdminProperties,
  moderateAdminProperty,
  type AdminPropertyRow,
  type AdminPropertyStatusTab,
} from "@/lib/api/admin-properties";
import { getAdminAccessToken } from "@/lib/auth/admin-token";

export type { AdminPropertyRow };

type PropertiesModuleProps = {
  initialItems: AdminPropertyRow[];
  initialError?: string | null;
  initialTab?: AdminPropertyStatusTab;
};

const TABS: { id: AdminPropertyStatusTab; label: string }[] = [
  { id: "queue", label: "Inbox" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
];

function statusPill(status: string) {
  const s = status.toUpperCase();
  if (s === "APPROVED")
    return "bg-emerald-50 text-emerald-900 ring-emerald-600/20";
  if (s === "REJECTED")
    return "bg-red-50 text-red-900 ring-red-600/20";
  if (s === "UNDER_REVIEW")
    return "bg-sky-50 text-sky-900 ring-sky-600/20";
  return "bg-amber-50 text-amber-900 ring-amber-600/20";
}

function formatPrice(n: number): string {
  if (!n || Number.isNaN(n)) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  return new Date(t).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function canModerate(row: AdminPropertyRow): boolean {
  const m = (row.moderationStatus ?? "").toLowerCase();
  return m === "pending" || m === "under_review";
}

export function PropertiesModule({
  initialItems,
  initialError = null,
  initialTab = "queue",
}: PropertiesModuleProps) {
  const [items, setItems] = useState<AdminPropertyRow[]>(initialItems);
  const [tab, setTab] = useState<AdminPropertyStatusTab>(initialTab);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error">(
    initialError ? "error" : "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    initialError,
  );
  const [actingId, setActingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminPropertyRow | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  const load = useCallback(async (nextTab: AdminPropertyStatusTab) => {
    const token = getAdminAccessToken();
    if (!token) {
      setLoadState("error");
      setErrorMessage("You are not signed in.");
      return;
    }
    setLoadState("loading");
    setErrorMessage(null);
    const result = await fetchAdminProperties(token, {
      status: nextTab,
    });
    if (!result.ok) {
      setLoadState("error");
      setErrorMessage(result.message);
      toast.error(result.message);
      return;
    }
    setItems(result.items);
    setLoadState("idle");
  }, []);

  const onTabChange = useCallback(
    (next: AdminPropertyStatusTab) => {
      setTab(next);
      void load(next);
    },
    [load],
  );

  const handleApprove = useCallback(
    async (row: AdminPropertyRow) => {
      const token = getAdminAccessToken();
      if (!token) {
        toast.error("You are not signed in.");
        return;
      }
      setActingId(row.id);
      const res = await moderateAdminProperty(token, row.id, {
        action: "approve",
      });
      setActingId(null);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success(`Listing approved: ${row.title}`);
      await load(tab);
    },
    [load, tab],
  );

  const openReject = useCallback((row: AdminPropertyRow) => {
    setRejectTarget(row);
    setRejectReason("");
  }, []);

  const closeReject = useCallback(() => {
    if (rejectSubmitting) return;
    setRejectTarget(null);
    setRejectReason("");
  }, [rejectSubmitting]);

  const submitReject = useCallback(async () => {
    if (!rejectTarget) return;
    const trimmed = rejectReason.trim();
    if (trimmed.length < 3) {
      toast.error("Please enter a rejection reason (at least 3 characters).");
      return;
    }
    const token = getAdminAccessToken();
    if (!token) {
      toast.error("You are not signed in.");
      return;
    }
    setRejectSubmitting(true);
    const res = await moderateAdminProperty(token, rejectTarget.id, {
      action: "reject",
      reason: trimmed,
    });
    setRejectSubmitting(false);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    toast.success(`Listing rejected: ${rejectTarget.title}`);
    setRejectTarget(null);
    setRejectReason("");
    await load(tab);
  }, [rejectTarget, rejectReason, load, tab]);

  const emptyHint = useMemo(() => {
    if (tab === "queue")
      return "No listings waiting for review. New owner submissions appear here.";
    if (tab === "approved") return "No approved listings match this view.";
    if (tab === "rejected") return "No rejected listings yet.";
    return "No properties found.";
  }, [tab]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-roommat-teal/90">
            Module
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Properties
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-roommat-muted sm:text-base">
            Review listings submitted by users. Approve to publish, or reject
            with a reason — owners see the reason on their dashboard.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTabChange(t.id)}
            className={[
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              tab === t.id
                ? "bg-roommat-teal text-white shadow-sm"
                : "bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loadState === "error" && errorMessage && (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </p>
      )}

      {loadState === "loading" && (
        <p className="text-sm text-roommat-muted py-6">Loading properties…</p>
      )}

      {loadState === "idle" && items.length === 0 && (
        <p className="text-sm text-roommat-muted py-6">{emptyHint}</p>
      )}

      {loadState === "idle" && items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => (
            <article
              key={p.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-all hover:border-roommat-teal/30 hover:shadow-lg"
            >
              <div className="relative h-24 bg-gradient-to-br from-roommat-teal/90 via-[#127a72] to-[#0c524c] px-4 py-3">
                <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
                  {p.type}
                </span>
                <span className="absolute bottom-3 right-4 text-base font-bold text-white">
                  {formatPrice(p.price)}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h2 className="font-semibold text-neutral-900 group-hover:text-roommat-teal line-clamp-2">
                  {p.title}
                </h2>
                <p className="mt-1 text-xs text-roommat-muted">
                  {p.city} · {formatDate(p.createdAt)}
                </p>
                <p className="mt-2 text-xs text-neutral-600">
                  <span className="font-medium text-neutral-800">Owner:</span>{" "}
                  {p.ownerName}
                </p>
                <p className="mt-0.5 truncate text-xs text-neutral-500">
                  {p.ownerEmail}
                </p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusPill(p.status)}`}
                  >
                    {p.status.replace(/_/g, " ")}
                  </span>
                </div>
                {p.rejectionReason && p.status === "REJECTED" && (
                  <p className="mt-2 line-clamp-3 rounded-lg bg-red-50/80 px-2 py-1.5 text-[11px] text-red-900">
                    <span className="font-semibold">Reason:</span>{" "}
                    {p.rejectionReason}
                  </p>
                )}
                <Link
                  href={`/dashboard/properties/${p.id}`}
                  className="mt-4 block w-full rounded-xl border border-roommat-teal/30 bg-roommat-mint-bg py-2 text-center text-xs font-semibold text-roommat-teal transition hover:bg-roommat-teal/10"
                >
                  View full details
                </Link>
                {canModerate(p) && (
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      disabled={actingId === p.id}
                      onClick={() => void handleApprove(p)}
                      className="flex-1 rounded-xl bg-roommat-teal py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
                    >
                      {actingId === p.id ? "Working…" : "Approve"}
                    </button>
                    <button
                      type="button"
                      disabled={actingId === p.id}
                      onClick={() => openReject(p)}
                      className="flex-1 rounded-xl border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {rejectTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-dialog-title"
          onClick={closeReject}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-neutral-100 bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="reject-dialog-title"
              className="text-lg font-bold text-neutral-900"
            >
              Reject listing
            </h2>
            <p className="mt-1 text-sm text-roommat-muted line-clamp-2">
              {rejectTarget.title}
            </p>
            <label className="mt-4 block text-sm font-medium text-neutral-800">
              Reason for rejection *
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-roommat-teal focus:outline-none focus:ring-2 focus:ring-roommat-teal/20"
              placeholder="Explain clearly so the owner can fix and resubmit…"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Minimum 3 characters. This message is shown to the owner on the
              website.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={closeReject}
                disabled={rejectSubmitting}
                className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void submitReject()}
                disabled={rejectSubmitting}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {rejectSubmitting ? "Rejecting…" : "Confirm reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
