import type { Metadata } from "next";
import { EditProfileForm } from "./edit-profile-form";

export const metadata: Metadata = {
  title: "Edit profile",
  description: "Update your Roommat admin profile.",
};

export default function EditProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-roommat-teal/90">
          Account
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Edit profile
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-roommat-muted sm:text-base">
          Update your display name. Sign-in email is shown for reference only.
        </p>
      </div>

      <EditProfileForm />
    </div>
  );
}
