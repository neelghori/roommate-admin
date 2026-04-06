import Link from "next/link";
import type { ReactNode } from "react";
import { AuthBrandingIllustration } from "./auth-branding-illustration";
import { RoommatLogo } from "./roommat-logo";

export type AuthSplitLayoutProps = {
  title: string;
  description?: string;
  brandBadge: string;
  brandHeadline: string;
  brandDescription: string;
  children: ReactNode;
};

/**
 * 50% form column | 50% branding column. Locked to viewport height (no page scroll).
 */
export function AuthSplitLayout({
  title,
  description,
  brandBadge,
  brandHeadline,
  brandDescription,
  children,
}: AuthSplitLayoutProps) {
  const year = new Date().getFullYear();

  return (
    <div className="flex h-dvh max-h-dvh w-full min-h-0 flex-col overflow-hidden overscroll-none lg:min-h-0 lg:flex-row">
      {/* Form — 50% */}
      <div className="flex h-1/2 min-h-0 w-full flex-col overflow-hidden bg-white lg:h-full lg:w-1/2 lg:max-w-[50%] lg:shrink-0 lg:overflow-hidden">
        <header className="flex shrink-0 items-center px-5 py-2.5 sm:px-8 sm:py-3">
          <Link href="/" className="transition-opacity hover:opacity-85">
            <RoommatLogo variant="inline" />
          </Link>
        </header>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-4 py-2 sm:px-8 sm:py-3">
          <div className="w-full max-w-md shrink-0 overflow-hidden rounded-2xl border border-neutral-100 bg-white px-5 py-5 shadow-[0_16px_40px_-18px_rgba(21,128,120,0.2)] sm:px-7 sm:py-6">
            <h1 className="text-xl font-bold tracking-tight text-roommat-teal sm:text-2xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-1.5 text-xs leading-snug text-roommat-muted sm:mt-2 sm:text-sm sm:leading-relaxed">
                {description}
              </p>
            ) : null}
            <div className="mt-5 sm:mt-6">{children}</div>
          </div>
        </div>

        <footer className="shrink-0 px-4 py-2 text-center text-[0.65rem] text-roommat-muted sm:px-8 sm:py-2.5 sm:text-xs">
          © {year} Roommat. All rights reserved.
        </footer>
      </div>

      {/* Branding / illustration — 50%, content centered in panel */}
      <aside
        className="relative flex h-1/2 min-h-0 w-full flex-col overflow-hidden bg-gradient-to-br from-roommat-teal via-[#127a72] to-[#0c524c] text-white lg:h-full lg:w-1/2 lg:max-w-[50%] lg:shrink-0 lg:overflow-hidden"
        aria-label="Roommat admin overview"
      >
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-white/5 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-roommat-orange/10 blur-3xl"
          aria-hidden
        />

        <div className="relative z-[1] flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center px-5 py-5 sm:px-8 sm:py-6 lg:px-10 lg:py-8 xl:px-14">
          <div className="flex w-full max-w-md flex-col items-center text-center sm:max-w-lg xl:max-w-xl">
            <p className="mb-3 inline-flex max-w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[0.65rem] font-semibold tracking-wide backdrop-blur-sm sm:mb-4 sm:px-4 sm:text-xs">
              <span
                className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-roommat-orange"
                aria-hidden
              />
              {brandBadge}
            </p>

            <h2 className="max-w-[22rem] text-lg font-bold leading-snug tracking-tight text-balance sm:max-w-xl sm:text-xl lg:text-2xl xl:text-[1.65rem] xl:leading-tight">
              {brandHeadline}
            </h2>
            <p className="mt-2 max-w-md text-pretty text-[0.8rem] leading-relaxed text-white/90 sm:mt-3 sm:text-sm lg:text-base">
              {brandDescription}
            </p>

            <div className="mt-4 flex w-full max-h-[min(30vh,10rem)] min-h-0 items-center justify-center sm:mt-5 sm:max-h-[min(34vh,12rem)] lg:mt-8 lg:max-h-[min(40vh,14rem)] xl:max-h-[min(44vh,16rem)]">
              <AuthBrandingIllustration className="h-full max-h-full w-auto max-w-[min(100%,240px)] sm:max-w-[min(100%,280px)] lg:max-w-[min(100%,300px)]" />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
