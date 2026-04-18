"use client";

import { useMemo, useState } from "react";
import { useAnimatedNumber } from "@/hooks/use-animated-number";
import { StatCard } from "./stat-card";

type RangeKey = "7d" | "30d" | "90d";

const RANGE_LABEL: Record<RangeKey, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

const DATA: Record<
  RangeKey,
  {
    listings: number;
    pg: number;
    rooms: number;
    pendingVerifications: number;
    newLeads: number;
    activeChats: number;
    chart: number[];
  }
> = {
  "7d": {
    listings: 128,
    pg: 45,
    rooms: 83,
    pendingVerifications: 12,
    newLeads: 34,
    activeChats: 156,
    chart: [42, 55, 38, 62, 48, 71],
  },
  "30d": {
    listings: 142,
    pg: 52,
    rooms: 90,
    pendingVerifications: 18,
    newLeads: 112,
    activeChats: 428,
    chart: [48, 61, 55, 70, 58, 76],
  },
  "90d": {
    listings: 168,
    pg: 61,
    rooms: 107,
    pendingVerifications: 24,
    newLeads: 298,
    activeChats: 902,
    chart: [52, 68, 63, 74, 66, 82],
  },
};

const RECENT = [
  {
    title: "New PG listing — Indiranagar",
    meta: "Submitted · Awaiting verification",
    time: "12 min ago",
  },
  {
    title: "Lead: 2BHK near Metro",
    meta: "Room hunt · Budget ₹18k",
    time: "1 hr ago",
  },
  {
    title: "Listing updated — Koramangala PG",
    meta: "Photos & pricing changed",
    time: "3 hr ago",
  },
  {
    title: "Chat escalation — Payment query",
    meta: "Support · High priority",
    time: "Yesterday",
  },
] as const;

export function DashboardOverview() {
  const [range, setRange] = useState<RangeKey>("30d");
  const [selectedStat, setSelectedStat] = useState<string | null>("listings");

  const metrics = DATA[range];

  const aListings = useAnimatedNumber(metrics.listings);
  const aPg = useAnimatedNumber(metrics.pg);
  const aRooms = useAnimatedNumber(metrics.rooms);
  const aPending = useAnimatedNumber(metrics.pendingVerifications);
  const aLeads = useAnimatedNumber(metrics.newLeads);
  const aChats = useAnimatedNumber(metrics.activeChats);

  const maxBar = useMemo(
    () => Math.max(...metrics.chart, 1),
    [metrics.chart],
  );

  const insight = useMemo(() => {
    switch (selectedStat) {
      case "pg":
        return `PG properties grew ${range === "7d" ? "steadily" : "across the period"} — highlight amenities photos to improve conversion.`;
      case "rooms":
        return "Room listings are strongest in shared accommodation; consider promoting single-room inventory.";
      case "pending":
        return "Verification queue is within SLA. Batch-approve trusted owners to reduce wait time.";
      case "leads":
        return "Leads spike mid-week. Schedule auto-replies for faster first contact.";
      case "chats":
        return "Chat volume is healthy; enable saved replies for common PG questions.";
      default:
        return "Total inventory is trending up. Cross-link rooms and PG in search to lift sessions.";
    }
  }, [selectedStat, range]);

  return (
    <div className="space-y-8 lg:space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-roommat-teal/90">
            Overview
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 max-w-xl text-sm text-roommat-muted sm:text-base">
            Rooms, PG, and tenant activity at a glance — switch modules from the
            top bar anytime.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(["7d", "30d", "90d"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setRange(key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                range === key
                  ? "bg-roommat-teal text-white shadow-md shadow-roommat-teal/20"
                  : "border border-roommat-teal/15 bg-white/90 text-neutral-700 shadow-sm hover:border-roommat-teal/30"
              }`}
            >
              {RANGE_LABEL[key]}
            </button>
          ))}
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-base font-bold text-neutral-900">Key counts</h2>
          <p className="text-sm text-roommat-muted">
            Tap a card for insight · {RANGE_LABEL[range]}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Total listings"
            value={aListings}
            hint="Rooms + PG on platform"
            accent="teal"
            selected={selectedStat === "listings"}
            onSelect={() => setSelectedStat("listings")}
          />
          <StatCard
            label="PG properties"
            value={aPg}
            hint="Active paying guest stays"
            accent="orange"
            selected={selectedStat === "pg"}
            onSelect={() => setSelectedStat("pg")}
          />
          <StatCard
            label="Room posts"
            value={aRooms}
            hint="Flat / room share listings"
            accent="teal"
            selected={selectedStat === "rooms"}
            onSelect={() => setSelectedStat("rooms")}
          />
          <StatCard
            label="Pending verification"
            value={aPending}
            hint="Awaiting admin review"
            accent="slate"
            selected={selectedStat === "pending"}
            onSelect={() => setSelectedStat("pending")}
          />
          <StatCard
            label="New leads"
            value={aLeads}
            hint="Inquiries in selected period"
            accent="orange"
            selected={selectedStat === "leads"}
            onSelect={() => setSelectedStat("leads")}
          />
          <StatCard
            label="Active chats"
            value={aChats}
            hint="Ongoing conversations"
            accent="teal"
            selected={selectedStat === "chats"}
            onSelect={() => setSelectedStat("chats")}
          />
        </div>

        <div className="rounded-2xl border border-roommat-teal/10 bg-white/90 p-5 shadow-sm backdrop-blur-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-roommat-teal">
            Selected metric
          </p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-700 sm:text-base">
            {insight}
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-base font-bold text-neutral-900">
            Lead interest (indexed)
          </h2>
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
            <div className="flex h-48 gap-2 sm:h-52 sm:gap-3">
              {metrics.chart.map((v, i) => (
                <div
                  key={i}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                >
                  <div
                    className="w-full max-w-13 rounded-t-lg bg-gradient-to-t from-roommat-teal to-[#1a9e94] transition-all duration-500 ease-out hover:opacity-95"
                    style={{
                      height: `${Math.max(18, (v / maxBar) * 100)}%`,
                    }}
                    title={`${Math.round((v / maxBar) * 100)}% of peak week`}
                  />
                  <span className="text-xs font-medium text-roommat-muted">
                    W{i + 1}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-roommat-muted">
              Bars react to your date range. Hover for relative volume.
            </p>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-base font-bold text-neutral-900">
            Quick actions
          </h2>
          <div className="grid gap-3">
            {[
              { t: "Verify queue", d: "Pending listings", bar: "bg-roommat-teal" },
              { t: "Broadcast", d: "Message hosts", bar: "bg-roommat-orange" },
              { t: "Export CSV", d: "Listings & leads", bar: "bg-slate-500" },
              { t: "Moderation", d: "Flagged reports", bar: "bg-red-500" },
            ].map((a) => (
              <button
                key={a.t}
                type="button"
                className="group flex gap-4 rounded-2xl border border-neutral-100 bg-white p-4 text-left shadow-sm transition-all hover:border-roommat-teal/25 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-roommat-teal"
              >
                <span
                  className={`mt-0.5 h-10 w-1 shrink-0 rounded-full ${a.bar} opacity-90`}
                  aria-hidden
                />
                <span>
                  <span className="font-semibold text-neutral-900 group-hover:text-roommat-teal">
                    {a.t}
                  </span>
                  <span className="mt-0.5 block text-sm text-roommat-muted">
                    {a.d}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-base font-bold text-neutral-900">
          Recent activity
        </h2>
        <ul className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
          {RECENT.map((row) => (
            <li key={row.title}>
              <button
                type="button"
                className="flex w-full flex-col gap-0.5 px-5 py-4 text-left transition-colors hover:bg-roommat-mint-bg/50 focus:outline-none focus-visible:bg-roommat-mint-bg/70"
              >
                <span className="font-medium text-neutral-900">{row.title}</span>
                <span className="text-sm text-roommat-muted">{row.meta}</span>
                <span className="text-xs font-medium text-roommat-teal">
                  {row.time}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
