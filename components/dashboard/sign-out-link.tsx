"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { clearAdminAccessToken } from "@/lib/auth/admin-token";

export function SignOutLink({
  className,
  onClick,
  children = "Sign out",
  ...rest
}: Omit<ComponentProps<typeof Link>, "href">) {
  return (
    <Link
      href="/login"
      className={className}
      {...rest}
      onClick={(e) => {
        clearAdminAccessToken();
        onClick?.(e);
      }}
    >
      {children}
    </Link>
  );
}
