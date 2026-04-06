"use client";

import Link from "next/link";
import { clearAdminAccessToken } from "@/lib/auth/admin-token";

export function SignOutLink({ className }: { className?: string }) {
  return (
    <Link
      href="/login"
      className={className}
      onClick={() => clearAdminAccessToken()}
    >
      Sign out
    </Link>
  );
}
