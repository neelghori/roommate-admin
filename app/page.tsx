import Link from "next/link";
import { RoommatLogo } from "@/components/auth/roommat-logo";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-roommat-mint-bg/50 px-6 py-16">
      <main className="flex w-full max-w-lg flex-col items-center gap-10 text-center">
        <Link href="/login" className="transition-opacity hover:opacity-90">
          <RoommatLogo variant="stack" className="sm:scale-105" />
        </Link>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Roommat admin
          </h1>
          <p className="text-base leading-relaxed text-roommat-muted">
            Sign in to manage listings, bookings, and admin users.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            className="flex h-12 items-center justify-center rounded-xl bg-roommat-teal px-8 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-roommat-teal-hover"
            href="/login"
          >
            Admin login
          </Link>
          <Link
            className="flex h-12 items-center justify-center rounded-xl border border-neutral-200 bg-white px-8 text-sm font-semibold text-neutral-800 shadow-sm transition-colors hover:bg-neutral-50"
            href="/dashboard"
          >
            Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
