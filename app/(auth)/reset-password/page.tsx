import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
};

function ResetFormFallback() {
  return (
    <div
      className="h-24 animate-pulse rounded-xl bg-roommat-mint-bg/80"
      aria-hidden
    />
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthSplitLayout
      title="Reset password"
      description="Choose a strong password you haven’t used before on Roommat admin."
      brandBadge="Security"
      brandHeadline="Protect access to your admin workspace."
      brandDescription="A unique password helps keep tenant data, payouts info, and listing edits safe — especially when your whole team uses the same tools."
    >
      <Suspense fallback={<ResetFormFallback />}>
        <ResetPasswordForm />
      </Suspense>
      <p className="mt-4 text-center text-xs sm:text-sm">
        <Link
          href="/login"
          className="font-semibold text-roommat-orange transition-colors hover:text-roommat-orange-hover"
        >
          Back to login
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
