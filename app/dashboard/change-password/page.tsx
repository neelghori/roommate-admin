import type { Metadata } from "next";
import { ChangePasswordForm } from "./change-password-form";

export const metadata: Metadata = {
  title: "Change password",
  description: "Update your Roommat admin account password.",
};

export default function ChangePasswordPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-roommat-teal/90">
          Account
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Change password
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-roommat-muted sm:text-base">
          Use a strong password you do not reuse on other sites.
        </p>
      </div>

      <ChangePasswordForm />
    </div>
  );
}
