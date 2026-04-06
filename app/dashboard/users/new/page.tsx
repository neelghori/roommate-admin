import type { Metadata } from "next";
import { AddAdminUserForm } from "./add-admin-user-form";

export const metadata: Metadata = {
  title: "Add admin user",
  description: "Invite a colleague to the Roommat admin panel.",
};

export default function AddAdminUserPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-roommat-teal/90">
          Admin users
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Add admin user
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-roommat-muted sm:text-base">
          Create an account they can use to sign in to this panel. Share the
          password with them securely.
        </p>
      </div>

      <AddAdminUserForm />
    </div>
  );
}
