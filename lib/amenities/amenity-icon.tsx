import type { ReactNode, SVGProps } from "react";

export const AMENITY_ICON_KEYS = [
  "wifi",
  "ac",
  "parking",
  "tv",
  "washing",
  "kitchen",
  "gym",
  "pool",
  "elevator",
  "security",
  "pet",
  "furniture",
  "power",
  "water",
  "balcony",
  "cctv",
] as const;

export type AmenityIconKey = (typeof AMENITY_ICON_KEYS)[number];

export const AMENITY_ICON_LABELS: Record<AmenityIconKey, string> = {
  wifi: "Wi‑Fi",
  ac: "Air conditioning",
  parking: "Parking",
  tv: "TV",
  washing: "Washing machine",
  kitchen: "Kitchen",
  gym: "Gym",
  pool: "Pool",
  elevator: "Elevator",
  security: "Security",
  pet: "Pet friendly",
  furniture: "Furnished",
  power: "Power backup",
  water: "Water supply",
  balcony: "Balcony",
  cctv: "CCTV",
};

type IconProps = SVGProps<SVGSVGElement>;

function IconFrame({ children, className, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export function AmenityIcon({
  name,
  className = "h-8 w-8",
}: {
  name: AmenityIconKey;
  className?: string;
}) {
  switch (name) {
    case "wifi":
      return (
        <IconFrame className={className}>
          <path d="M8.288 15.036a5.25 5.25 0 017.424 0M5.106 11.893c3.808-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.012 18.012h.008v.008h-.008v-.008z" />
        </IconFrame>
      );
    case "ac":
      return (
        <IconFrame className={className}>
          <path d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </IconFrame>
      );
    case "parking":
      return (
        <IconFrame className={className}>
          <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </IconFrame>
      );
    case "tv":
      return (
        <IconFrame className={className}>
          <path d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" />
        </IconFrame>
      );
    case "washing":
      return (
        <IconFrame className={className}>
          <path d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </IconFrame>
      );
    case "kitchen":
      return (
        <IconFrame className={className}>
          <path d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        </IconFrame>
      );
    case "gym":
      return (
        <IconFrame className={className}>
          <path d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </IconFrame>
      );
    case "pool":
      return (
        <IconFrame className={className}>
          <path d="M2.25 21h19.5M4.5 3h15M6 3v12a3 3 0 003 3h6a3 3 0 003-3V3M9 3v12m6-12v12" />
        </IconFrame>
      );
    case "elevator":
      return (
        <IconFrame className={className}>
          <path d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h3a2.25 2.25 0 012.25 2.25V9m-9 0V18.75A2.25 2.25 0 0010.5 21h3a2.25 2.25 0 002.25-2.25V9m-9 0h9M12 12h.008v.008H12V12zm0 3h.008v.008H12V15zm0 3h.008v.008H12V18z" />
        </IconFrame>
      );
    case "security":
      return (
        <IconFrame className={className}>
          <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </IconFrame>
      );
    case "pet":
      return (
        <IconFrame className={className}>
          <path d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
        </IconFrame>
      );
    case "furniture":
      return (
        <IconFrame className={className}>
          <path d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </IconFrame>
      );
    case "power":
      return (
        <IconFrame className={className}>
          <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </IconFrame>
      );
    case "water":
      return (
        <IconFrame className={className}>
          <path d="M12 3c2.755 3.875 4.5 7.32 4.5 10.125a4.5 4.5 0 11-9 0C7.5 10.32 9.245 6.875 12 3z" />
        </IconFrame>
      );
    case "balcony":
      return (
        <IconFrame className={className}>
          <path d="M3.75 21h16.5M4.5 3h15M5.25 3v11.25a3 3 0 003 3h7.5a3 3 0 003-3V3" />
        </IconFrame>
      );
    case "cctv":
      return (
        <IconFrame className={className}>
          <path d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </IconFrame>
      );
    default:
      return (
        <IconFrame className={className}>
          <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </IconFrame>
      );
  }
}

export function isAmenityIconKey(s: string): s is AmenityIconKey {
  return (AMENITY_ICON_KEYS as readonly string[]).includes(s);
}
