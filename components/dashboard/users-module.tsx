"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Eye, X } from "lucide-react";
import {
  fetchAdminUser,
  fetchAdminUsers,
  patchAdminUser,
  patchAdminUserActive,
  postAdminIdentityReview,
  type AdminAccountStatus,
  type AdminUserDetail,
  type AdminUserRow,
  type IdentityVerificationStatus,
  type PatchAdminUserBody,
} from "@/lib/api/admin-users";
import { formatAdminRoleLabel } from "@/lib/format-admin-role";
import { getAdminAccessToken } from "@/lib/auth/admin-token";

export type { AdminAccountStatus, AdminUserRow };

type UsersModuleProps = {
  initialUsers: AdminUserRow[];
  initialError?: string | null;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type StatusFilter = "all" | AdminAccountStatus;

function StatusSwitch({
  active,
  disabled,
  onToggle,
}: {
  active: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      disabled={disabled}
      onClick={onToggle}
      className={`relative inline-flex h-7 w-12 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-roommat-teal focus-visible:ring-offset-2 disabled:opacity-50 ${
        active ? "bg-roommat-teal" : "bg-neutral-300"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-6 w-6 translate-x-0 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          active ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function pickFromDetail(d: AdminUserDetail, keys: string[]): string | null {
  for (const k of keys) {
    const v = d[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function identityBadgeClasses(status: IdentityVerificationStatus): string {
  switch (status) {
    case "verified":
      return "bg-emerald-50 text-emerald-800 ring-emerald-600/20";
    case "pending":
      return "bg-amber-50 text-amber-900 ring-amber-600/25";
    case "rejected":
      return "bg-red-50 text-red-800 ring-red-600/20";
    default:
      return "bg-neutral-100 text-neutral-600 ring-neutral-400/25";
  }
}

function identityLabel(status: IdentityVerificationStatus): string {
  switch (status) {
    case "verified":
      return "Verified";
    case "pending":
      return "Pending";
    case "rejected":
      return "Rejected";
    default:
      return "—";
  }
}

function formatDetailDate(iso: string | null): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  return new Date(t).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function UserViewModal({
  open,
  detail,
  loading,
  rejectReason,
  onRejectReason,
  reviewBusy,
  patchBusy,
  onClose,
  onApprove,
  onReject,
  onPatchUser,
}: {
  open: boolean;
  detail: AdminUserDetail | null;
  loading: boolean;
  rejectReason: string;
  onRejectReason: (v: string) => void;
  reviewBusy: boolean;
  patchBusy: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onPatchUser: (patch: PatchAdminUserBody) => void;
}) {
  if (!open) return null;

  const name =
    pickFromDetail(detail ?? {}, ["fullName", "name"]) ?? "—";
  const email = pickFromDetail(detail ?? {}, ["email"]) ?? "—";
  const mobile = pickFromDetail(detail ?? {}, ["mobile", "phone"]) ?? "—";
  const role = pickFromDetail(detail ?? {}, ["role"]) ?? "—";
  const active =
    typeof detail?.isActive === "boolean" ? detail.isActive : true;
  const idStatus = ((): IdentityVerificationStatus => {
    const s = pickFromDetail(detail ?? {}, ["identityVerificationStatus"])?.toLowerCase();
    if (s === "pending" || s === "verified" || s === "rejected" || s === "none") return s;
    return "none";
  })();
  const docUrl = pickFromDetail(detail ?? {}, ["identityDocumentUrl"]);
  const submitted = pickFromDetail(detail ?? {}, ["identitySubmittedAt"]);
  const rejection = pickFromDetail(detail ?? {}, ["identityRejectionReason"]);
  const emailVerified =
    typeof detail?.emailVerified === "boolean" ? detail.emailVerified : false;
  const mobileVerifiedByAdmin =
    typeof detail?.mobileVerifiedByAdmin === "boolean"
      ? detail.mobileVerifiedByAdmin
      : false;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-view-title"
        className="max-h-[min(90vh,720px)] w-full max-w-lg overflow-y-auto rounded-2xl border border-neutral-100 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2
            id="user-view-title"
            className="text-lg font-bold tracking-tight text-neutral-900"
          >
            User details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-roommat-muted">Loading…</p>
        ) : !detail ? (
          <p className="mt-6 text-sm text-red-600">Could not load this user.</p>
        ) : (
          <dl className="mt-4 space-y-3 text-sm">
            <div className="grid gap-1 border-b border-neutral-100 py-2 sm:grid-cols-[120px_1fr]">
              <dt className="text-xs font-semibold uppercase text-roommat-muted">Name</dt>
              <dd className="font-medium text-neutral-900">{name}</dd>
            </div>
            <div className="grid gap-1 border-b border-neutral-100 py-2 sm:grid-cols-[120px_1fr]">
              <dt className="text-xs font-semibold uppercase text-roommat-muted">Email</dt>
              <dd className="break-all text-neutral-900">{email}</dd>
            </div>
            <div className="grid gap-1 border-b border-neutral-100 py-2 sm:grid-cols-[120px_1fr]">
              <dt className="text-xs font-semibold uppercase text-roommat-muted">Mobile</dt>
              <dd className="text-neutral-900">{mobile}</dd>
            </div>
            <div className="grid gap-1 border-b border-neutral-100 py-2 sm:grid-cols-[120px_1fr]">
              <dt className="text-xs font-semibold uppercase text-roommat-muted">Role</dt>
              <dd className="text-neutral-900">{formatAdminRoleLabel(role)}</dd>
            </div>
            <div className="grid gap-1 border-b border-neutral-100 py-2 sm:grid-cols-[120px_1fr]">
              <dt className="text-xs font-semibold uppercase text-roommat-muted">Account</dt>
              <dd className="text-neutral-900">{active ? "Active" : "Inactive"}</dd>
            </div>
            <div className="grid gap-1 border-b border-neutral-100 py-2 sm:grid-cols-[120px_1fr]">
              <dt className="text-xs font-semibold uppercase text-roommat-muted">ID verification</dt>
              <dd>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${identityBadgeClasses(idStatus)}`}
                >
                  {identityLabel(idStatus)}
                </span>
              </dd>
            </div>
            <div className="grid gap-1 border-b border-neutral-100 py-2 sm:grid-cols-[120px_1fr]">
              <dt className="text-xs font-semibold uppercase text-roommat-muted">Email verified</dt>
              <dd className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                    emailVerified
                      ? "bg-emerald-50 text-emerald-800 ring-emerald-600/20"
                      : "bg-neutral-100 text-neutral-600 ring-neutral-400/25"
                  }`}
                >
                  {emailVerified ? "Yes" : "No"}
                </span>
                <button
                  type="button"
                  disabled={patchBusy}
                  onClick={() => onPatchUser({ emailVerified: !emailVerified })}
                  className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-semibold text-roommat-teal hover:bg-roommat-mint-bg/40 disabled:opacity-50"
                >
                  {emailVerified ? "Unmark" : "Mark verified"}
                </button>
              </dd>
            </div>
            <div className="grid gap-1 border-b border-neutral-100 py-2 sm:grid-cols-[120px_1fr]">
              <dt className="text-xs font-semibold uppercase text-roommat-muted">Mobile (admin)</dt>
              <dd className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                    mobileVerifiedByAdmin
                      ? "bg-sky-50 text-sky-900 ring-sky-600/20"
                      : "bg-neutral-100 text-neutral-600 ring-neutral-400/25"
                  }`}
                >
                  {mobileVerifiedByAdmin ? "Verified" : "Pending"}
                </span>
                <button
                  type="button"
                  disabled={patchBusy}
                  onClick={() =>
                    onPatchUser({ mobileVerifiedByAdmin: !mobileVerifiedByAdmin })
                  }
                  className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-semibold text-roommat-teal hover:bg-roommat-mint-bg/40 disabled:opacity-50"
                >
                  {mobileVerifiedByAdmin ? "Unmark" : "Mark verified"}
                </button>
              </dd>
            </div>
            {submitted ? (
              <div className="grid gap-1 border-b border-neutral-100 py-2 sm:grid-cols-[120px_1fr]">
                <dt className="text-xs font-semibold uppercase text-roommat-muted">Submitted</dt>
                <dd className="text-neutral-900">{formatDetailDate(submitted)}</dd>
              </div>
            ) : null}
            {docUrl ? (
              <div className="grid gap-1 border-b border-neutral-100 py-2 sm:grid-cols-[120px_1fr]">
                <dt className="text-xs font-semibold uppercase text-roommat-muted">Document</dt>
                <dd>
                  <a
                    href={docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-roommat-teal underline hover:text-roommat-teal-hover"
                  >
                    Open submitted file
                  </a>
                </dd>
              </div>
            ) : null}
            {rejection ? (
              <div className="rounded-xl border border-red-100 bg-red-50/80 px-3 py-2 text-red-900">
                <p className="text-xs font-semibold uppercase text-red-800/90">Rejection note</p>
                <p className="mt-1 text-sm">{rejection}</p>
              </div>
            ) : null}

            {idStatus === "pending" ? (
              <div className="space-y-3 border-t border-neutral-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-roommat-teal/90">
                  Super admin review
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={reviewBusy}
                    onClick={onApprove}
                    className="rounded-xl bg-roommat-teal px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-roommat-teal-hover disabled:opacity-50"
                  >
                    Approve ID
                  </button>
                </div>
                <label className="block text-xs font-semibold text-neutral-600" htmlFor="reject-reason">
                  Reject (optional note to user)
                </label>
                <textarea
                  id="reject-reason"
                  rows={2}
                  value={rejectReason}
                  onChange={(e) => onRejectReason(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-roommat-teal focus:ring-2 focus:ring-roommat-teal/20"
                  placeholder="Reason shown to the user if you reject…"
                />
                <button
                  type="button"
                  disabled={reviewBusy}
                  onClick={onReject}
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                >
                  Reject ID
                </button>
              </div>
            ) : null}
          </dl>
        )}
      </div>
    </div>
  );
}

export function UsersModule({
  initialUsers,
  initialError = null,
}: UsersModuleProps) {
  const [admins, setAdmins] = useState<AdminUserRow[]>(initialUsers);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error">(
    initialError ? "error" : "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    initialError,
  );
  const [viewOpen, setViewOpen] = useState(false);
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  const [viewDetail, setViewDetail] = useState<AdminUserDetail | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);
  const [accessBusyId, setAccessBusyId] = useState<string | null>(null);
  const [userPatchBusy, setUserPatchBusy] = useState(false);

  const loadUsers = useCallback(async () => {
    const token = getAdminAccessToken();
    if (!token) {
      setLoadState("error");
      setErrorMessage("You are not signed in.");
      return;
    }

    setLoadState("loading");
    setErrorMessage(null);

    const result = await fetchAdminUsers(token);

    if (!result.ok) {
      setLoadState("error");
      setErrorMessage(result.message);
      toast.error(result.message);
      return;
    }

    setAdmins(result.users);
    setLoadState("idle");
  }, []);

  const mergeRowFromApiUser = useCallback((u: AdminUserDetail) => {
    const rawId = u.id ?? u._id;
    const id =
      typeof rawId === "string" && rawId.trim()
        ? rawId.trim()
        : rawId != null
          ? String(rawId)
          : null;
    if (!id) return;

    const formatRelative = (lastLoginRaw: string) => {
      const t = Date.parse(lastLoginRaw);
      if (Number.isNaN(t)) return lastLoginRaw;
      const diffSec = Math.round((t - Date.now()) / 1000);
      const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
      const abs = Math.abs(diffSec);
      if (abs < 60) return rtf.format(Math.round(diffSec), "second");
      if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
      if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
      if (abs < 604800) return rtf.format(Math.round(diffSec / 86400), "day");
      if (abs < 2592000) return rtf.format(Math.round(diffSec / 604800), "week");
      return new Date(t).toLocaleDateString();
    };

    setAdmins((prev) => {
      const row = prev.find((x) => x.id === id);
      if (!row) return prev;

      const name = pickFromDetail(u, ["fullName", "name"]) ?? row.name;
      const email = pickFromDetail(u, ["email"]) ?? row.email;
      const adminRole = pickFromDetail(u, ["role", "adminRole"]) ?? row.adminRole;
      const isActive =
        typeof u.isActive === "boolean" ? u.isActive : row.accountStatus === "active";
      const lastLoginRaw = pickFromDetail(u, [
        "lastLoginAt",
        "lastLogin",
        "updatedAt",
      ]);
      const idStatus = ((): IdentityVerificationStatus => {
        const s = pickFromDetail(u, ["identityVerificationStatus"])?.toLowerCase();
        if (s === "pending" || s === "verified" || s === "rejected" || s === "none") return s;
        return row.identityVerificationStatus;
      })();
      const emailVerified =
        typeof u.emailVerified === "boolean" ? u.emailVerified : row.emailVerified;
      const mobileVerifiedByAdmin =
        typeof u.mobileVerifiedByAdmin === "boolean"
          ? u.mobileVerifiedByAdmin
          : row.mobileVerifiedByAdmin;

      return prev.map((r) =>
        r.id === id
          ? {
              ...r,
              name,
              email,
              adminRole,
              accountStatus: isActive ? "active" : "inactive",
              lastLogin: lastLoginRaw ? formatRelative(lastLoginRaw) : r.lastLogin,
              identityVerificationStatus: idStatus,
              emailVerified,
              mobileVerifiedByAdmin,
            }
          : r,
      );
    });
  }, []);

  const openUserView = useCallback(async (userId: string) => {
    const token = getAdminAccessToken();
    if (!token) {
      toast.error("You are not signed in.");
      return;
    }
    setViewUserId(userId);
    setViewOpen(true);
    setViewDetail(null);
    setRejectReason("");
    setViewLoading(true);
    const res = await fetchAdminUser(token, userId);
    setViewLoading(false);
    if (!res.ok) {
      toast.error(res.message);
      setViewDetail(null);
      return;
    }
    setViewDetail(res.user);
  }, []);

  const closeUserView = useCallback(() => {
    setViewOpen(false);
    setViewUserId(null);
    setViewDetail(null);
    setRejectReason("");
  }, []);

  const runIdentityReview = useCallback(
    async (action: "verify" | "reject") => {
      if (!viewUserId) return;
      const token = getAdminAccessToken();
      if (!token) return;
      setReviewBusy(true);
      const res = await postAdminIdentityReview(token, viewUserId, {
        action,
        reason: action === "reject" ? rejectReason : undefined,
      });
      setReviewBusy(false);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success(action === "verify" ? "Identity verified." : "Identity rejected.");
      setViewDetail(res.user);
      mergeRowFromApiUser(res.user);
    },
    [viewUserId, rejectReason, mergeRowFromApiUser],
  );

  const runUserDetailPatch = useCallback(
    async (patch: PatchAdminUserBody) => {
      if (!viewUserId) return;
      const token = getAdminAccessToken();
      if (!token) {
        toast.error("You are not signed in.");
        return;
      }
      setUserPatchBusy(true);
      const res = await patchAdminUser(token, viewUserId, patch);
      setUserPatchBusy(false);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success("User updated.");
      setViewDetail(res.user);
      mergeRowFromApiUser(res.user);
    },
    [viewUserId, mergeRowFromApiUser],
  );

  const toggleAccountAccess = useCallback(
    async (row: AdminUserRow) => {
      const token = getAdminAccessToken();
      if (!token) {
        toast.error("You are not signed in.");
        return;
      }
      const nextActive = row.accountStatus !== "active";
      setAccessBusyId(row.id);
      const res = await patchAdminUserActive(token, row.id, nextActive);
      setAccessBusyId(null);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success(
        nextActive ? "User access is now on." : "User access is now off.",
      );
      mergeRowFromApiUser(res.user);
    },
    [mergeRowFromApiUser],
  );

  const counts = useMemo(() => {
    const active = admins.filter((a) => a.accountStatus === "active").length;
    return {
      total: admins.length,
      active,
      inactive: admins.length - active,
    };
  }, [admins]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return admins.filter((a) => {
      if (statusFilter === "active" && a.accountStatus !== "active") return false;
      if (statusFilter === "inactive" && a.accountStatus !== "inactive")
        return false;
      if (!q) return true;
      const idLabel = identityLabel(a.identityVerificationStatus).toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.adminRole.toLowerCase().includes(q) ||
        idLabel.includes(q)
      );
    });
  }, [admins, statusFilter, search]);

  const isLoading = loadState === "loading";
  const isError = loadState === "error";

  return (
    <div className="space-y-8">
      <UserViewModal
        open={viewOpen}
        detail={viewDetail}
        loading={viewLoading}
        rejectReason={rejectReason}
        onRejectReason={setRejectReason}
        reviewBusy={reviewBusy}
        patchBusy={userPatchBusy}
        onClose={closeUserView}
        onApprove={() => void runIdentityReview("verify")}
        onReject={() => void runIdentityReview("reject")}
        onPatchUser={(patch) => void runUserDetailPatch(patch)}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-roommat-teal/90">
            Module
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Admin users
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-roommat-muted sm:text-base">
            Platform accounts from the API. Open a user to review identity documents; only a
            super administrator can approve or reject ID verification and change access.
          </p>
        </div>
        <Link
          href="/dashboard/users/new"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-roommat-teal px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-roommat-teal-hover"
        >
          Add admin user
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-roommat-muted">
            Total admins
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-neutral-900">
            {isLoading ? "—" : counts.total}
          </p>
          <p className="mt-1 text-sm text-roommat-muted">Panel accounts</p>
        </div>
        <div className="rounded-2xl border border-roommat-teal/20 bg-roommat-mint-bg/40 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-roommat-teal">
            Active
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-roommat-teal">
            {isLoading ? "—" : counts.active}
          </p>
          <p className="mt-1 text-sm text-roommat-muted">Can sign in</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-roommat-muted">
            Inactive
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-neutral-700">
            {isLoading ? "—" : counts.inactive}
          </p>
          <p className="mt-1 text-sm text-roommat-muted">Access blocked</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-neutral-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
            {(
              [
                { key: "all" as const, label: "All" },
                { key: "active" as const, label: "Active" },
                { key: "inactive" as const, label: "Inactive" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                disabled={isLoading}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors sm:text-sm disabled:opacity-50 ${
                  statusFilter === key
                    ? "bg-roommat-teal text-white shadow-sm"
                    : "bg-roommat-mint-bg/80 text-neutral-600 hover:bg-roommat-mint-bg"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, role, or ID status…"
            disabled={isLoading}
            className="w-full rounded-xl border border-neutral-200 bg-roommat-mint-bg/40 px-3 py-2 text-sm outline-none focus:border-roommat-teal focus:ring-2 focus:ring-roommat-teal/20 disabled:opacity-50 sm:max-w-xs"
          />
        </div>

        {isError ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <p className="text-sm text-red-600">{errorMessage}</p>
            <button
              type="button"
              onClick={() => void loadUsers()}
              className="rounded-full bg-roommat-teal px-4 py-2 text-sm font-semibold text-white hover:bg-roommat-teal-hover"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-neutral-100 bg-roommat-mint-bg/30 text-xs font-semibold uppercase tracking-wide text-roommat-muted">
                <tr>
                  <th className="px-4 py-3 sm:px-6">Admin user</th>
                  <th className="px-4 py-3 sm:px-6">Role</th>
                  <th className="px-4 py-3 sm:px-6">Account</th>
                  <th className="px-4 py-3 sm:px-6">ID check</th>
                  <th className="px-4 py-3 sm:px-6">Last login</th>
                  <th className="px-4 py-3 text-right sm:px-6">Access</th>
                  <th className="w-14 px-2 py-3 text-center sm:px-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-12 text-center text-roommat-muted"
                    >
                      Loading admin users…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-12 text-center text-roommat-muted"
                    >
                      {admins.length === 0
                        ? "No admin users were returned."
                        : "No admin users match this filter."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => {
                    const isActive = r.accountStatus === "active";
                    return (
                      <tr
                        key={r.id}
                        className={`transition-colors hover:bg-roommat-mint-bg/20 ${!isActive ? "opacity-90" : ""}`}
                      >
                        <td className="px-4 py-3 sm:px-6">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-roommat-teal/12 text-xs font-bold text-roommat-teal">
                              {initials(r.name)}
                            </span>
                            <div>
                              <p className="font-medium text-neutral-900">
                                {r.name}
                              </p>
                              <p className="text-xs text-roommat-muted">{r.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-neutral-700 sm:px-6">
                          {formatAdminRoleLabel(r.adminRole)}
                        </td>
                        <td className="px-4 py-3 sm:px-6">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                              isActive
                                ? "bg-emerald-50 text-emerald-800 ring-emerald-600/20"
                                : "bg-neutral-100 text-neutral-600 ring-neutral-400/25"
                            }`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3 sm:px-6">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${identityBadgeClasses(r.identityVerificationStatus)}`}
                          >
                            {identityLabel(r.identityVerificationStatus)}
                          </span>
                        </td>
                        <td className="px-4 py-3 sm:px-6">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${
                              r.emailVerified
                                ? "bg-emerald-50 text-emerald-800 ring-emerald-600/20"
                                : "bg-neutral-100 text-neutral-600 ring-neutral-400/25"
                            }`}
                          >
                            {r.emailVerified ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-4 py-3 sm:px-6">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${
                              r.mobileVerifiedByAdmin
                                ? "bg-sky-50 text-sky-900 ring-sky-600/20"
                                : "bg-neutral-100 text-neutral-600 ring-neutral-400/25"
                            }`}
                          >
                            {r.mobileVerifiedByAdmin ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-roommat-muted sm:px-6">
                          {r.lastLogin}
                        </td>
                        <td className="px-4 py-3 sm:px-6">
                          <div className="flex items-center justify-end gap-3">
                            <span className="hidden text-xs text-roommat-muted sm:inline">
                              {isActive ? "On" : "Off"}
                            </span>
                            <StatusSwitch
                              active={isActive}
                              disabled={accessBusyId === r.id}
                              onToggle={() => void toggleAccountAccess(r)}
                            />
                          </div>
                        </td>
                        <td className="px-2 py-3 text-center sm:px-3">
                          <button
                            type="button"
                            aria-label={`View ${r.name}`}
                            onClick={() => void openUserView(r.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-roommat-teal shadow-sm transition-colors hover:border-roommat-teal/40 hover:bg-roommat-mint-bg/40"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
