"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SignOutLink } from "./sign-out-link";

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointerDown(e: MouseEvent | PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="profile-menu-dropdown"
        id="profile-menu-trigger"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-roommat-teal to-[#0d6560] text-white shadow-md ring-2 ring-white/80 transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-roommat-teal focus-visible:ring-offset-2"
        title="Account"
      >
        <span className="sr-only">Account menu</span>
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.75}
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      </button>
      {open ? (
        <div
          id="profile-menu-dropdown"
          role="menu"
          aria-labelledby="profile-menu-trigger"
          className="absolute right-0 z-[100] mt-2 min-w-[13.5rem] overflow-hidden rounded-xl border border-neutral-100 bg-white py-1 shadow-lg ring-1 ring-black/5"
        >
          <Link
            role="menuitem"
            href="/dashboard/profile/edit"
            className="block px-4 py-2.5 text-sm font-semibold text-neutral-800 transition-colors hover:bg-roommat-mint-bg/60"
            onClick={() => setOpen(false)}
          >
            Edit profile
          </Link>
          <Link
            role="menuitem"
            href="/dashboard/change-password"
            className="block px-4 py-2.5 text-sm font-semibold text-neutral-800 transition-colors hover:bg-roommat-mint-bg/60"
            onClick={() => setOpen(false)}
          >
            Change password
          </Link>
          <SignOutLink
            role="menuitem"
            className="block px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
            onClick={() => setOpen(false)}
          />
        </div>
      ) : null}
    </div>
  );
}
