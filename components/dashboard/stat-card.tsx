"use client";

type StatCardProps = {
  label: string;
  value: number;
  suffix?: string;
  hint: string;
  selected: boolean;
  onSelect: () => void;
  accent: "teal" | "orange" | "slate";
};

const ringClass = {
  teal: "ring-roommat-teal",
  orange: "ring-roommat-orange",
  slate: "ring-slate-400",
} as const;

export function StatCard({
  label,
  value,
  suffix,
  hint,
  selected,
  onSelect,
  accent,
}: StatCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative w-full rounded-2xl border border-neutral-100 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-roommat-teal focus-visible:ring-offset-2 ${
        selected
          ? `ring-2 ring-offset-2 ${ringClass[accent]} shadow-md`
          : ""
      }`}
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
      <p className="mt-2 text-sm text-roommat-muted transition-colors group-hover:text-neutral-600">
        {hint}
      </p>
    </button>
  );
}
