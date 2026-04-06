"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { RoommatLogo } from "@/components/auth/roommat-logo";
import { ProfileMenu } from "./profile-menu";
import { SignOutLink } from "./sign-out-link";

const nav = [
  {
    href: "/dashboard",
    label: "Overview",
    match: (p: string) => p === "/dashboard" || p === "/dashboard/",
    icon: (
      <svg className="h-[1.125rem] w-[1.125rem]" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75A2.25 2.25 0 0115.75 18h2.25a2.25 2.25 0 002.25-2.25V13.5a2.25 2.25 0 00-2.25-2.25h-2.25a2.25 2.25 0 00-2.25 2.25v2.25zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/users",
    label: "Admin users",
    match: (p: string) => p.startsWith("/dashboard/users"),
    icon: (
      <svg className="h-[1.125rem] w-[1.125rem]" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/properties",
    label: "Properties",
    match: (p: string) => p.startsWith("/dashboard/properties"),
    icon: (
      <svg className="h-[1.125rem] w-[1.125rem]" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    href: "/dashboard/bookings",
    label: "Bookings",
    match: (p: string) => p.startsWith("/dashboard/bookings"),
    icon: (
      <svg className="h-[1.125rem] w-[1.125rem]" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
      </svg>
    ),
  },
  {
    href: "/dashboard/faq",
    label: "FAQ",
    match: (p: string) => p.startsWith("/dashboard/faq"),
    icon: (
      <svg className="h-[1.125rem] w-[1.125rem]" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.771-1.025 4.942 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
  },
] as const;

function NavLink({ href, label, icon, active }: { href: string; label: string; icon: ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 sm:px-4 ${
        active
          ? "bg-roommat-teal text-white shadow-md shadow-roommat-teal/25"
          : "text-neutral-600 hover:bg-white/90 hover:text-neutral-900"
      }`}
    >
      <span className={active ? "[&_svg]:text-white" : "[&_svg]:text-roommat-teal"}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "";

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-roommat-mint-bg to-roommat-mint-bg/80">
      <header className="sticky top-0 z-50 border-b border-roommat-teal/10 bg-white/75 shadow-[0_8px_30px_-12px_rgba(21,128,120,0.12)] backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 lg:h-[4.25rem] lg:px-8">
          <div className="flex min-w-0 items-center gap-6 lg:gap-10">
            <Link href="/dashboard" className="shrink-0 scale-95 transition-opacity hover:opacity-90 lg:scale-100">
              <RoommatLogo variant="inline" />
            </Link>

            <nav
              className="hidden items-center gap-0.5 rounded-2xl border border-roommat-teal/10 bg-roommat-mint-bg/40 p-1 md:flex"
              aria-label="Main modules"
            >
              {nav.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={item.match(pathname)}
                />
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              className="hidden rounded-xl border border-neutral-200/80 bg-white/90 px-3 py-2 text-sm font-medium text-neutral-600 shadow-sm transition-colors hover:border-roommat-teal/25 hover:text-roommat-teal lg:inline-flex lg:items-center lg:gap-2"
              aria-label="Search"
            >
              <svg className="h-4 w-4 text-roommat-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <span className="text-roommat-muted">Search…</span>
            </button>
            <button
              type="button"
              className="relative rounded-xl border border-neutral-200/80 bg-white p-2 text-neutral-600 shadow-sm transition-colors hover:border-roommat-teal/25 hover:text-roommat-teal"
              aria-label="Notifications"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.113V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-roommat-orange ring-2 ring-white" />
            </button>
            <ProfileMenu />
            <button
              type="button"
              className="rounded-full bg-roommat-orange px-4 py-2 text-sm font-semibold text-white shadow-md shadow-roommat-orange/20 transition-all hover:bg-roommat-orange-hover hover:shadow-lg hover:shadow-roommat-orange/25"
            >
              Add listing
            </button>
            <SignOutLink className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-roommat-muted transition-colors hover:text-roommat-teal sm:inline" />
          </div>
        </div>

        <nav
          className="flex gap-1 overflow-x-auto border-t border-roommat-teal/5 bg-roommat-mint-bg/30 px-4 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
          aria-label="Main modules"
        >
          {nav.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={item.match(pathname)}
            />
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
