"use client";

import type { ReactNode } from "react";
import {
  User,
  MapPin,
  IndianRupee,
  Calendar,
  Cigarette,
  Utensils,
  Images,
} from "lucide-react";

export const ADMIN_RESIDENT_PRO_LABELS: Record<string, string> = {
  student: "Student",
  work_professional: "Working professional",
  freelancer: "Freelancer",
  business: "Business",
  other: "Other",
};

const GENDER_LABELS: Record<string, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
};

const DIET_LABELS: Record<string, string> = {
  vegetarian: "Vegetarian",
  non_vegetarian: "Non-vegetarian",
  eggetarian: "Eggetarian",
  vegan: "Vegan",
};

const SMOKING_LABELS: Record<string, string> = {
  non_smoker: "Non-smoker",
  smoker: "Smoker",
};

export type AdminResidentView = {
  fullName?: string;
  age?: number;
  profileImageUrl?: string;
  phone?: string;
  gender?: string;
  professionalType?: string;
  collegeOrCompanyName?: string;
  propertyOrPgName?: string;
  monthlyRent?: number;
  securityDeposit?: number;
  moveInDate?: string;
  moveOutDate?: string;
  roomPhotoUrls?: string[];
  description?: string;
  lifestyle?: { diet?: string; smoking?: string };
};

function pickStr(v: unknown): string {
  return typeof v === "string" ? v : v != null ? String(v) : "";
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return phone;
  return `+91 ${digits.slice(0, 2)}xxxxx${digits.slice(-3)}`;
}

function formatDateLabel(iso?: string): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  return new Date(t).toLocaleDateString(undefined, { dateStyle: "medium" });
}

function formatRupees(n: number): string {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

type RowProps = { label: string; value: ReactNode };

function Row({ label, value }: RowProps) {
  return (
    <div className="grid gap-0.5 border-b border-neutral-100 py-2.5 sm:grid-cols-[140px_1fr] sm:items-start last:border-0">
      <div className="text-xs font-semibold text-roommat-muted">{label}</div>
      <div className="break-words text-sm text-neutral-900">{value ?? "—"}</div>
    </div>
  );
}

/** Map API `listerSnapshots[]` / legacy `listerSnapshot` subdocument to a view model (no internal ids exposed). */
export function mapRawListerToAdminView(raw: unknown): AdminResidentView | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const lifestyleRaw = o.lifestyle;
  let lifestyle: AdminResidentView["lifestyle"];
  if (lifestyleRaw && typeof lifestyleRaw === "object") {
    const L = lifestyleRaw as Record<string, unknown>;
    lifestyle = {
      diet: pickStr(L.diet).trim() || undefined,
      smoking: pickStr(L.smoking).trim() || undefined,
    };
  }
  const roomPhotos: string[] = [];
  const rp = o.roomPhotoUrls;
  if (Array.isArray(rp)) {
    for (const u of rp) {
      if (typeof u === "string" && u.trim()) roomPhotos.push(u.trim());
    }
  }
  const name = pickStr(o.fullName).trim();
  const age = typeof o.age === "number" && !Number.isNaN(o.age) ? o.age : undefined;
  const monthlyRent =
    typeof o.monthlyRent === "number" && !Number.isNaN(o.monthlyRent)
      ? o.monthlyRent
      : undefined;
  const securityDeposit =
    typeof o.securityDeposit === "number" && !Number.isNaN(o.securityDeposit)
      ? o.securityDeposit
      : undefined;
  const moveIn =
    o.moveInDate instanceof Date
      ? o.moveInDate.toISOString()
      : pickStr(o.moveInDate).trim() || undefined;
  const moveOut =
    o.moveOutDate instanceof Date
      ? o.moveOutDate.toISOString()
      : pickStr(o.moveOutDate).trim() || undefined;

  if (
    !name &&
    age == null &&
    !pickStr(o.profileImageUrl) &&
    !pickStr(o.phone) &&
    !pickStr(o.gender) &&
    !pickStr(o.professionalType) &&
    !pickStr(o.collegeOrCompanyName) &&
    monthlyRent == null &&
    securityDeposit == null &&
    !moveIn &&
    !moveOut &&
    roomPhotos.length === 0 &&
    !pickStr(o.description)
  ) {
    return null;
  }

  return {
    fullName: name || undefined,
    age,
    profileImageUrl: pickStr(o.profileImageUrl).trim() || undefined,
    phone: pickStr(o.phone).trim() || undefined,
    gender: pickStr(o.gender).trim() || undefined,
    professionalType: pickStr(o.professionalType).trim() || undefined,
    collegeOrCompanyName: pickStr(o.collegeOrCompanyName).trim() || undefined,
    propertyOrPgName: pickStr(o.propertyOrPgName).trim() || undefined,
    monthlyRent,
    securityDeposit,
    moveInDate: moveIn,
    moveOutDate: moveOut,
    roomPhotoUrls: roomPhotos.length ? roomPhotos : undefined,
    description: pickStr(o.description).trim() || undefined,
    lifestyle,
  };
}

/** One-line summary for list rows (professional · college). */
export function formatResidentListSubtitle(r: AdminResidentView): string {
  const pro = r.professionalType
    ? ADMIN_RESIDENT_PRO_LABELS[r.professionalType] ?? r.professionalType
    : "—";
  const col = r.collegeOrCompanyName?.trim()
    ? ` · ${r.collegeOrCompanyName.trim()}`
    : "";
  return `${pro}${col}`;
}

type AdminResidentDetailsProps = {
  resident: AdminResidentView;
  /** `modal`: same fields, tuned for inside a dialog (lighter outer chrome). */
  layout?: "card" | "modal";
};

/** “Who lives here” — same information layout as the main website `ListingResidentDetails`. */
export function AdminResidentDetails({
  resident,
  layout = "card",
}: AdminResidentDetailsProps) {
  if (!resident || Object.keys(resident).length === 0) return null;

  const diet = resident.lifestyle?.diet;
  const smoking = resident.lifestyle?.smoking;

  const shell =
    layout === "modal"
      ? "rounded-xl border border-neutral-100 bg-white p-4 sm:p-5"
      : "rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm";

  return (
    <section className={shell}>
      <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-neutral-900">
        <User className="h-4 w-4 text-roommat-teal" aria-hidden />
        Who lives here
      </h2>
      <p className="mb-3 text-xs text-roommat-muted">
        Current resident / roommate on this listing
      </p>
      <div>
        {resident.fullName && <Row label="Full name" value={resident.fullName} />}
        {resident.age != null && <Row label="Age" value={String(resident.age)} />}
        {resident.profileImageUrl && (
          <div className="mb-3 border-b border-neutral-100 pb-3">
            <p className="mb-1.5 text-xs font-semibold text-roommat-muted">Profile</p>
            {/* eslint-disable-next-line @next/next/no-img-element -- CDN / S3 URLs from API */}
            <img
              src={resident.profileImageUrl}
              alt=""
              className="h-24 w-24 rounded-full border border-neutral-200 object-cover"
            />
          </div>
        )}
        {resident.phone && <Row label="Phone" value={maskPhone(resident.phone)} />}
        {resident.gender && (
          <Row label="Gender" value={GENDER_LABELS[resident.gender] ?? resident.gender} />
        )}
        {resident.professionalType && (
          <Row
            label="Professional"
            value={
              ADMIN_RESIDENT_PRO_LABELS[resident.professionalType] ??
              resident.professionalType
            }
          />
        )}
        {resident.collegeOrCompanyName && (
          <Row label="College / company" value={resident.collegeOrCompanyName} />
        )}
        {resident.propertyOrPgName && (
          <Row
            label="Property / PG name"
            value={
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0 text-roommat-muted" aria-hidden />
                {resident.propertyOrPgName}
              </span>
            }
          />
        )}
        {resident.monthlyRent != null && (
          <Row
            label="Monthly rent (their share)"
            value={
              <span className="inline-flex items-center gap-1 font-semibold text-roommat-teal">
                <IndianRupee className="h-3.5 w-3.5" aria-hidden />
                {formatRupees(resident.monthlyRent)}
              </span>
            }
          />
        )}
        {resident.securityDeposit != null && (
          <Row
            label="Security deposit"
            value={
              <span className="inline-flex items-center gap-1">
                <IndianRupee className="h-3.5 w-3.5" aria-hidden />
                {formatRupees(resident.securityDeposit)}
              </span>
            }
          />
        )}
        {(resident.moveInDate || resident.moveOutDate) && (
          <Row
            label="Move-in / move-out"
            value={
              <span className="inline-flex flex-wrap items-center gap-1">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-roommat-muted" aria-hidden />
                {formatDateLabel(resident.moveInDate)}
                {resident.moveOutDate ? ` → ${formatDateLabel(resident.moveOutDate)}` : ""}
              </span>
            }
          />
        )}
        {(diet || smoking) && (
          <Row
            label="Lifestyle"
            value={
              <span className="flex flex-wrap items-center gap-2">
                {diet && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-roommat-mint-bg px-2 py-0.5 text-xs font-medium text-roommat-teal ring-1 ring-roommat-teal/15">
                    <Utensils className="h-3 w-3" aria-hidden />
                    {DIET_LABELS[diet] ?? diet}
                  </span>
                )}
                {smoking && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                    <Cigarette className="h-3 w-3" aria-hidden />
                    {SMOKING_LABELS[smoking] ?? smoking}
                  </span>
                )}
              </span>
            }
          />
        )}
        {resident.roomPhotoUrls && resident.roomPhotoUrls.length > 0 && (
          <div className="mt-3 border-t border-neutral-100 pt-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-roommat-muted">
              <Images className="h-3.5 w-3.5" aria-hidden />
              Room photos
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {resident.roomPhotoUrls.map((url, i) => (
                <a
                  key={`room-${i}-${url.slice(-12)}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-video overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50 ring-1 ring-neutral-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover transition hover:opacity-90" />
                </a>
              ))}
            </div>
          </div>
        )}
        {resident.description && (
          <div className="mt-2 border-t border-neutral-100 pt-3">
            <p className="mb-1 text-xs font-semibold text-roommat-muted">About this resident</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
              {resident.description}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
