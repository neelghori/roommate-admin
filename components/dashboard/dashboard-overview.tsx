"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAnimatedNumber } from "@/hooks/use-animated-number";
import { StatCard } from "./stat-card";
import { fetchAdminDashboardOverview } from "@/lib/api/admin-dashboard";
import { getAdminAccessToken } from "@/lib/auth/admin-token";

export function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totals, setTotals] = useState({
    totalProperties: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalFaqs: 0,
    totalAmenities: 0,
  });
  const [monthly, setMonthly] = useState<
    { monthKey: string; label: string; count: number }[]
  >([]);

  const load = useCallback(async () => {
    const token = getAdminAccessToken();
    if (!token) {
      setError("Not signed in.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetchAdminDashboardOverview(token);
    if (!res.ok) {
      setError(res.message);
      setLoading(false);
      return;
    }
    const { overview } = res;
    setTotals({
      totalProperties: overview.totalProperties,
      totalUsers: overview.totalUsers,
      totalBookings: overview.totalBookings,
      totalFaqs: overview.totalFaqs,
      totalAmenities: overview.totalAmenities,
    });
    setMonthly(overview.propertiesAddedMonthly);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const aProps = useAnimatedNumber(totals.totalProperties);
  const aUsers = useAnimatedNumber(totals.totalUsers);
  const aBookings = useAnimatedNumber(totals.totalBookings);
  const aFaqs = useAnimatedNumber(totals.totalFaqs);
  const aAmenities = useAnimatedNumber(totals.totalAmenities);

  const maxBar = useMemo(
    () => Math.max(...monthly.map((m) => m.count), 1),
    [monthly],
  );

  return (
    <div className="space-y-8 lg:space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-roommat-teal/90">
          Overview
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 max-w-xl text-sm text-roommat-muted sm:text-base">
          Live totals from your Roommat database.
        </p>
      </div>

      {error ? (
        <div
          className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}{" "}
          <button
            type="button"
            onClick={() => void load()}
            className="font-semibold text-roommat-teal underline-offset-2 hover:underline"
          >
            Retry
          </button>
        </div>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-base font-bold text-neutral-900">Key counts</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard
            label="Total properties"
            value={aProps}
            hint="All property listings"
            accent="teal"
          />
          <StatCard
            label="Total users"
            value={aUsers}
            hint="Registered accounts"
            accent="orange"
          />
          <StatCard
            label="Total bookings"
            value={aBookings}
            hint="Visit / inquiry bookings"
            accent="teal"
          />
          <StatCard
            label="Total FAQ"
            value={aFaqs}
            hint="FAQ entries"
            accent="slate"
          />
          <StatCard
            label="Total amenities"
            value={aAmenities}
            hint="Amenity catalog items"
            accent="orange"
          />
        </div>
        {loading ? (
          <p className="text-sm text-roommat-muted">Loading stats…</p>
        ) : null}
      </section>

      <section>
        <h2 className="mb-4 text-base font-bold text-neutral-900">
          Properties added (monthly)
        </h2>
        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          {loading && monthly.length === 0 ? (
            <p className="text-sm text-roommat-muted">Loading chart…</p>
          ) : monthly.length === 0 ? (
            <p className="text-sm text-roommat-muted">No monthly data yet.</p>
          ) : (
            <div className="flex h-52 gap-1.5 overflow-x-auto pb-2 sm:h-56 sm:gap-2">
              {monthly.map((m) => (
                <div
                  key={m.monthKey}
                  className="flex h-full min-w-[2.25rem] flex-1 flex-col items-center justify-end gap-2 sm:min-w-10"
                >
                  <span
                    className="text-[0.65rem] font-medium tabular-nums text-neutral-600 sm:text-xs"
                    title={`${m.count} properties`}
                  >
                    {m.count}
                  </span>
                  <div
                    className="w-full max-w-14 rounded-t-lg bg-gradient-to-t from-roommat-teal to-[#1a9e94] transition-all duration-500 ease-out"
                    style={{
                      height:
                        m.count === 0
                          ? "4px"
                          : `${Math.max(12, (m.count / maxBar) * 100)}%`,
                    }}
                  />
                  <span className="max-w-full truncate text-center text-[0.6rem] font-medium text-roommat-muted sm:text-xs">
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
