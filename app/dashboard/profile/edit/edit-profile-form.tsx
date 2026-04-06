"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { toast } from "sonner";
import { patchAdminProfile } from "@/lib/api/admin-profile";
import {
  getAdminSessionProfile,
  setAdminSessionProfile,
} from "@/lib/auth/admin-session-profile";
import { getAdminAccessToken } from "@/lib/auth/admin-token";
import { useFormikForm } from "@/hooks/use-formik-form";

const schema = Yup.object({
  fullName: Yup.string().trim().required("Name is required"),
});

type Values = {
  fullName: string;
  email: string;
};

export function EditProfileForm() {
  const router = useRouter();
  const [initial, setInitial] = useState<Values>({
    fullName: "",
    email: "",
  });

  useEffect(() => {
    const p = getAdminSessionProfile();
    if (p) {
      setInitial({ fullName: p.fullName, email: p.email });
    }
  }, []);

  const formik = useFormikForm<Values>({
    initialValues: initial,
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      const token = getAdminAccessToken();
      if (!token) {
        toast.error("Your session expired. Sign in again.");
        setSubmitting(false);
        router.push("/login?next=/dashboard/profile/edit");
        return;
      }

      const loadingId = toast.loading("Saving profile…");

      const result = await patchAdminProfile(token, {
        fullName: values.fullName,
      });

      toast.dismiss(loadingId);

      if (!result.ok) {
        toast.error(result.message);
        setSubmitting(false);
        return;
      }

      setAdminSessionProfile({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
      });
      toast.success("Profile updated.");
      setSubmitting(false);
      router.push("/dashboard");
    },
  });

  const nameInvalid =
    Boolean(formik.touched.fullName && formik.errors.fullName);

  return (
    <form
      className="mx-auto max-w-lg space-y-4 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm sm:p-8"
      onSubmit={formik.handleSubmit}
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fullName" className="text-sm font-medium text-neutral-800">
          Full name
        </label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          {...formik.getFieldProps("fullName")}
          className={`h-11 rounded-xl border px-3 text-sm text-neutral-900 outline-none transition-[box-shadow,border-color] placeholder:text-neutral-400 focus:ring-2 sm:h-12 sm:px-4 ${
            nameInvalid
              ? "border-red-400 bg-red-50/80 focus:border-red-500 focus:ring-red-200/60"
              : "border-neutral-200/90 bg-roommat-mint-bg/40 focus:border-roommat-teal focus:ring-roommat-teal/25"
          }`}
        />
        {nameInvalid ? (
          <p className="text-sm text-red-600">{formik.errors.fullName}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-neutral-800">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          readOnly
          tabIndex={-1}
          aria-readonly="true"
          {...formik.getFieldProps("email")}
          className="h-11 cursor-not-allowed rounded-xl border border-neutral-200/90 bg-neutral-100/80 px-3 text-sm text-neutral-600 outline-none sm:h-12 sm:px-4"
        />
        <p className="text-xs text-roommat-muted">
          Email is tied to your account and cannot be changed here.
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard"
          className="order-2 text-center text-sm font-semibold text-roommat-muted hover:text-roommat-teal sm:order-1 sm:text-left"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="order-1 flex h-11 w-full items-center justify-center rounded-xl bg-roommat-teal text-sm font-semibold text-white shadow-sm transition-colors hover:bg-roommat-teal-hover disabled:cursor-not-allowed disabled:opacity-70 sm:order-2 sm:w-auto sm:min-w-[11rem]"
        >
          {formik.isSubmitting ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
