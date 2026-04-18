/** Decorative graphic for the auth hero panel — room / PG theme, not copied from any external asset. */
export function AuthBrandingIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={`relative mx-auto w-full ${className}`} aria-hidden>
      <svg
        viewBox="0 0 320 280"
        className="mx-auto h-full max-h-full w-auto max-w-full [aspect-ratio:320/280] drop-shadow-lg"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="160"
          cy="130"
          r="118"
          stroke="white"
          strokeOpacity="0.22"
          strokeWidth="1.5"
          strokeDasharray="6 8"
        />
        <circle
          cx="160"
          cy="130"
          r="82"
          stroke="white"
          strokeOpacity="0.18"
          strokeWidth="1.25"
          strokeDasharray="4 10"
        />
        {/* House — center */}
        <g transform="translate(122, 88)">
          <rect
            x="8"
            y="36"
            width="60"
            height="48"
            rx="8"
            fill="white"
            fillOpacity="0.95"
          />
          <path d="M4 40 L38 12 L72 40" stroke="#158078" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="white" fillOpacity="0.95" />
          <rect x="30" y="56" width="16" height="28" rx="3" fill="#158078" fillOpacity="0.35" />
          <circle cx="24" cy="52" r="5" fill="#158078" fillOpacity="0.2" />
          <circle cx="52" cy="52" r="5" fill="#158078" fillOpacity="0.2" />
        </g>
        {/* Key — top right orbit */}
        <g transform="translate(214, 52)">
          <circle cx="22" cy="22" r="26" fill="white" fillOpacity="0.18" />
          <path
            d="M14 30c0-6 4-10 10-10s10 4 10 10v4h6v20h-8v-8h-6v8h-8V34h-4v-4z"
            fill="white"
            fillOpacity="0.92"
          />
          <circle cx="24" cy="22" r="5" fill="#F27420" fillOpacity="0.9" />
        </g>
        {/* Bed / shared room hint — bottom left */}
        <g transform="translate(38, 118)">
          <circle cx="24" cy="24" r="26" fill="white" fillOpacity="0.15" />
          <rect x="10" y="22" width="48" height="22" rx="6" fill="white" fillOpacity="0.9" />
          <path d="M10 28h48" stroke="#158078" strokeOpacity="0.35" strokeWidth="2" />
          <rect x="14" y="30" width="14" height="10" rx="2" fill="#158078" fillOpacity="0.25" />
        </g>
        {/* Location pin — bottom right */}
        <g transform="translate(238, 148)">
          <circle cx="22" cy="22" r="26" fill="white" fillOpacity="0.15" />
          <path
            d="M22 10c-6 0-11 5-11 11 0 8 11 19 11 19s11-11 11-19c0-6-5-11-11-11z"
            fill="white"
            fillOpacity="0.92"
          />
          <circle cx="22" cy="21" r="4" fill="#F27420" fillOpacity="0.85" />
        </g>
      </svg>
    </div>
  );
}
