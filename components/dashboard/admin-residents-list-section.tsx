"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, X } from "lucide-react";
import type { AdminResidentView } from "@/components/dashboard/admin-resident-details";
import {
  AdminResidentDetails,
  formatResidentListSubtitle,
} from "@/components/dashboard/admin-resident-details";

type AdminResidentsListSectionProps = {
  residentViews: AdminResidentView[];
  legacyView: AdminResidentView | null;
};

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-wide text-roommat-teal/90">
      {children}
    </h2>
  );
}

export function AdminResidentsListSection({
  residentViews,
  legacyView,
}: AdminResidentsListSectionProps) {
  const rows =
    residentViews.length > 0
      ? residentViews
      : legacyView
        ? [legacyView]
        : [];

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<AdminResidentView | null>(null);

  const openFor = useCallback((r: AdminResidentView) => {
    setSelected(r);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setSelected(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (rows.length === 0) return null;

  const isLegacyOnly = residentViews.length === 0 && legacyView != null;

  return (
    <div className="space-y-3">
      <SectionTitle>Who lives here</SectionTitle>
      <p className="text-xs text-roommat-muted">
        {rows.length} {rows.length === 1 ? "person" : "people"} on this listing
        {isLegacyOnly ? " (legacy snapshot)" : ""}
      </p>

      <ul className="divide-y divide-roommat-teal/15 overflow-hidden rounded-xl border border-roommat-teal/20 bg-white shadow-sm">
        {rows.map((r, i) => {
          const name = r.fullName?.trim() || "Unnamed resident";
          const initial = name.charAt(0).toUpperCase() || "?";
          return (
            <li
              key={`resident-row-${i}-${r.profileImageUrl ?? ""}-${name}`}
              className="flex flex-wrap items-center gap-3 px-3 py-3 text-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 text-xs font-semibold text-neutral-500">
                {r.profileImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.profileImageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initial
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-neutral-900">{name}</p>
                <p className="truncate text-xs text-roommat-muted">
                  {formatResidentListSubtitle(r)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openFor(r)}
                className="inline-flex shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white p-2 text-roommat-teal shadow-sm transition-colors hover:border-roommat-teal/30 hover:bg-roommat-mint-bg/50"
                aria-label={`View details for ${name}`}
              >
                <Eye className="h-4 w-4" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>

      {open && selected && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="resident-detail-dialog-title"
          onClick={close}
        >
          <div
            className="max-h-[min(90vh,760px)] w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-neutral-100 px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <h2
                  id="resident-detail-dialog-title"
                  className="text-lg font-bold tracking-tight text-neutral-900"
                >
                  Resident details
                </h2>
                <p className="truncate text-sm text-roommat-muted">
                  {selected.fullName?.trim() || "Resident"}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                aria-label="Close"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="max-h-[min(70vh,620px)] overflow-y-auto p-4 sm:p-5">
              <AdminResidentDetails resident={selected} layout="modal" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
