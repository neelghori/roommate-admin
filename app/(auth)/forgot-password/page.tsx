import type { Metadata } from "next";
import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthSplitLayout
      title="Forgot password?"
      description="Enter the email tied to your admin account. We’ll send a secure link to reset your password."
      brandBadge="Account recovery"
      brandHeadline="We’ll get you back to managing listings."
      brandDescription="You’ll receive an email with a time-limited link. If you don’t see it, check spam or request another link after a few minutes."
    >
      <ForgotPasswordForm />
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
