"use client";

const items = [
  { title: "Sunrise PG — Indiranagar", loc: "Bengaluru", type: "PG", price: "₹12,500/bed", beds: 4, status: "Live" },
  { title: "2BHK Roommate flat", loc: "Koramangala", type: "Room", price: "₹18,000/mo", beds: 2, status: "Verification" },
  { title: "Cottage PG Whitefield", loc: "Bengaluru", type: "PG", price: "₹9,900/bed", beds: 6, status: "Live" },
  { title: "Single room near Metro", loc: "Hyderabad", type: "Room", price: "₹11,200/mo", beds: 1, status: "Draft" },
  { title: "HSR Layout shared 3BHK", loc: "Bengaluru", type: "Room", price: "₹22,000 flat", beds: 3, status: "Live" },
  { title: "Airport road premium PG", loc: "Bengaluru", type: "PG", price: "₹15,000/bed", beds: 5, status: "Paused" },
] as const;

const pill = {
  Live: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  Verification: "bg-amber-50 text-amber-900 ring-amber-600/20",
  Draft: "bg-slate-100 text-slate-700 ring-slate-500/15",
  Paused: "bg-neutral-100 text-neutral-600 ring-neutral-500/15",
} as const;

export function PropertiesModule() {
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
            Rooms and PG inventory — publish, pause, and verify from one grid.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-full border border-roommat-teal/20 bg-white px-4 py-2 text-sm font-semibold text-roommat-teal shadow-sm hover:bg-roommat-mint-bg"
          >
            Filters
          </button>
          <button
            type="button"
            className="rounded-full bg-roommat-orange px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-roommat-orange-hover"
          >
            New listing
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((p) => (
          <article
            key={p.title}
            className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-all hover:border-roommat-teal/30 hover:shadow-lg"
          >
            <div className="relative h-28 bg-gradient-to-br from-roommat-teal/90 via-[#127a72] to-[#0c524c]">
              <span className="absolute left-4 top-4 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
                {p.type}
              </span>
              <span className="absolute bottom-3 right-4 text-lg font-bold text-white">
                {p.price}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h2 className="font-semibold text-neutral-900 group-hover:text-roommat-teal">
                {p.title}
              </h2>
              <p className="mt-0.5 text-sm text-roommat-muted">{p.loc}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-xs text-roommat-muted">{p.beds} spots</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${pill[p.status as keyof typeof pill]}`}
                >
                  {p.status}
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-xl bg-roommat-mint-bg py-2 text-xs font-semibold text-roommat-teal hover:bg-roommat-teal/15"
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-neutral-200 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
                >
                  Preview
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
