"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  fetchAdminUsers,
  type AdminAccountStatus,
  type AdminUserRow,
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
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={onToggle}
      className={`relative inline-flex h-7 w-12 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-roommat-teal focus-visible:ring-offset-2 ${
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
      return (
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.adminRole.toLowerCase().includes(q)
      );
    });
  }, [admins, statusFilter, search]);

  function setAccountStatus(id: string, next: AdminAccountStatus) {
    setAdmins((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, accountStatus: next } : u,
      ),
    );
    toast.success(
      next === "active"
        ? "Admin user is now active."
        : "Admin user marked inactive.",
    );
  }

  const isLoading = loadState === "loading";
  const isError = loadState === "error";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-roommat-teal/90">
            Module
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Admin users
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-roommat-muted sm:text-base">
            Everyone who can sign in to this admin panel. Inactive users cannot
            log in until reactivated.
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
            placeholder="Search name, email, or role…"
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
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-neutral-100 bg-roommat-mint-bg/30 text-xs font-semibold uppercase tracking-wide text-roommat-muted">
                <tr>
                  <th className="px-4 py-3 sm:px-6">Admin user</th>
                  <th className="px-4 py-3 sm:px-6">Role</th>
                  <th className="px-4 py-3 sm:px-6">Account</th>
                  <th className="px-4 py-3 sm:px-6">Last login</th>
                  <th className="px-4 py-3 text-right sm:px-6">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-roommat-muted"
                    >
                      Loading admin users…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
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
                              onToggle={() =>
                                setAccountStatus(
                                  r.id,
                                  isActive ? "inactive" : "active",
                                )
                              }
                            />
                          </div>
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
