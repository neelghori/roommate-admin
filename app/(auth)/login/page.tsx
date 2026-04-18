import type { Metadata } from "next";
import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <AuthSplitLayout
      title="Welcome back"
      description="Enter your credentials to access the Roommat admin panel — rooms, PG stays, and verifications."
      brandBadge="Listings & tenant operations"
      brandHeadline="Run your room and PG business from one place."
      brandDescription="Publish listings, verify hosts, answer leads, and keep shortlists organized — built for roommate and paying-guest marketplaces."
    >
      <LoginForm />
      <p className="mt-4 text-center text-xs text-roommat-muted sm:mt-5 sm:text-sm">
        <Link
          href="/forgot-password"
          className="font-semibold text-roommat-orange transition-colors hover:text-roommat-orange-hover"
        >
          Forgot password?
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
