"use client";

type StatCardProps = {
  label: string;
  value: number;
  suffix?: string;
  hint: string;
  accent: "teal" | "orange" | "slate";
};

const borderAccent = {
  teal: "border-roommat-teal/20",
  orange: "border-roommat-orange/25",
  slate: "border-slate-200",
} as const;

export function StatCard({ label, value, suffix, hint, accent }: StatCardProps) {
  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm ${borderAccent[accent]}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-roommat-muted">
        {label}
      </p>
      <p className="mt-2 font-mono text-3xl font-bold tabular-nums tracking-tight text-neutral-900">
        {value.toLocaleString()}
        {suffix ? (
          <span className="text-lg font-semibold text-roommat-muted">
            {suffix}
          </span>
        ) : null}
      </p>
      <p className="mt-2 text-sm text-roommat-muted">{hint}</p>
    </div>
  );
}
