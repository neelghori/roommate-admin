"use client";

const bookings = [
  { id: "BK-10492", guest: "Arjun Nair", property: "Sunrise PG — Indiranagar", from: "Apr 8", to: "Jul 8", amount: "₹37,500", status: "Confirmed" },
  { id: "BK-10488", guest: "Diya Sharma", property: "2BHK Roommate flat", from: "Apr 12", to: "Jun 12", amount: "₹54,000", status: "Pending pay" },
  { id: "BK-10471", guest: "Kiran Rao", property: "Cottage PG Whitefield", from: "Mar 1", to: "Aug 31", amount: "₹59,400", status: "Active" },
  { id: "BK-10465", guest: "Priya Menon", property: "Single room near Metro", from: "Apr 2", to: "May 2", amount: "₹11,200", status: "Cancelled" },
] as const;

const s = {
  Confirmed: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  "Pending pay": "bg-amber-50 text-amber-900 ring-amber-600/20",
  Active: "bg-sky-50 text-sky-900 ring-sky-600/20",
  Cancelled: "bg-neutral-100 text-neutral-600 ring-neutral-500/15",
} as const;

export function BookingsModule() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-roommat-teal/90">
          Module
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Bookings
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-roommat-muted sm:text-base">
          Stays, deposits, and renewals — a glance at pipeline health across PG and
          rooms.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active stays", value: "186", hint: "Checked in" },
          { label: "Pipeline", value: "41", hint: "Awaiting payment" },
          { label: "This month GMV", value: "₹24.8L", hint: "Gross booking value" },
          { label: "Churn risk", value: "12", hint: "Ending in 14 days" },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-roommat-muted">
              {k.label}
            </p>
            <p className="mt-1.5 text-2xl font-bold text-neutral-900">{k.value}</p>
            <p className="mt-1 text-xs text-roommat-teal">{k.hint}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-bold text-neutral-900">Recent bookings</h2>
        <ul className="space-y-3">
          {bookings.map((b) => (
            <li
              key={b.id}
              className="flex flex-col gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm transition-colors hover:border-roommat-teal/20 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-roommat-teal">
                    {b.id}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ring-1 ring-inset ${s[b.status as keyof typeof s]}`}
                  >
                    {b.status}
                  </span>
                </div>
                <p className="mt-1 font-medium text-neutral-900">{b.guest}</p>
                <p className="text-sm text-roommat-muted">{b.property}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-1 text-right sm:items-end">
                <p className="text-sm font-semibold text-neutral-900">{b.amount}</p>
                <p className="text-xs text-roommat-muted">
                  {b.from} → {b.to}
                </p>
                <button
                  type="button"
                  className="mt-1 text-xs font-semibold text-roommat-orange hover:underline"
                >
                  Open detail
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
