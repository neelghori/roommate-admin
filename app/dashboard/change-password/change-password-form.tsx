"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import { toast } from "sonner";
import { postAdminChangePassword } from "@/lib/api/admin-auth";
import { getAdminAccessToken } from "@/lib/auth/admin-token";
import { useFormikForm } from "@/hooks/use-formik-form";

const schema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(8, "Use at least 8 characters")
    .required("New password is required")
    .notOneOf(
      [Yup.ref("currentPassword")],
      "New password must differ from your current password",
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm your new password"),
});

type Values = Yup.InferType<typeof schema>;

export function ChangePasswordForm() {
  const router = useRouter();

  const formik = useFormikForm<Values>({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const token = getAdminAccessToken();
      if (!token) {
        toast.error("Your session expired. Sign in again.");
        setSubmitting(false);
        router.push("/login?next=/dashboard/change-password");
        return;
      }

      const loadingId = toast.loading("Updating password…");

      const result = await postAdminChangePassword(token, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      toast.dismiss(loadingId);

      if (!result.ok) {
        toast.error(result.message);
        setSubmitting(false);
        return;
      }

      toast.success("Password updated.");
      resetForm();
      setSubmitting(false);
      router.push("/dashboard");
    },
  });

  const currentInvalid =
    Boolean(formik.touched.currentPassword && formik.errors.currentPassword);
  const newInvalid =
    Boolean(formik.touched.newPassword && formik.errors.newPassword);
  const confirmInvalid =
    Boolean(formik.touched.confirmPassword && formik.errors.confirmPassword);

  return (
    <form
      className="mx-auto max-w-lg space-y-4 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm sm:p-8"
      onSubmit={formik.handleSubmit}
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="currentPassword"
          className="text-sm font-medium text-neutral-800"
        >
          Current password
        </label>
        <input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          placeholder="Your current password"
          {...formik.getFieldProps("currentPassword")}
          className={`h-11 rounded-xl border px-3 text-sm text-neutral-900 outline-none transition-[box-shadow,border-color] placeholder:text-neutral-400 focus:ring-2 sm:h-12 sm:px-4 ${
            currentInvalid
              ? "border-red-400 bg-red-50/80 focus:border-red-500 focus:ring-red-200/60"
              : "border-neutral-200/90 bg-roommat-mint-bg/40 focus:border-roommat-teal focus:ring-roommat-teal/25"
          }`}
        />
        {currentInvalid ? (
          <p className="text-sm text-red-600">{formik.errors.currentPassword}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="newPassword" className="text-sm font-medium text-neutral-800">
          New password
        </label>
        <input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          {...formik.getFieldProps("newPassword")}
          className={`h-11 rounded-xl border px-3 text-sm text-neutral-900 outline-none transition-[box-shadow,border-color] placeholder:text-neutral-400 focus:ring-2 sm:h-12 sm:px-4 ${
            newInvalid
              ? "border-red-400 bg-red-50/80 focus:border-red-500 focus:ring-red-200/60"
              : "border-neutral-200/90 bg-roommat-mint-bg/40 focus:border-roommat-teal focus:ring-roommat-teal/25"
          }`}
        />
        {newInvalid ? (
          <p className="text-sm text-red-600">{formik.errors.newPassword}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-neutral-800"
        >
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat new password"
          {...formik.getFieldProps("confirmPassword")}
          className={`h-11 rounded-xl border px-3 text-sm text-neutral-900 outline-none transition-[box-shadow,border-color] placeholder:text-neutral-400 focus:ring-2 sm:h-12 sm:px-4 ${
            confirmInvalid
              ? "border-red-400 bg-red-50/80 focus:border-red-500 focus:ring-red-200/60"
              : "border-neutral-200/90 bg-roommat-mint-bg/40 focus:border-roommat-teal focus:ring-roommat-teal/25"
          }`}
        />
        {confirmInvalid ? (
          <p className="text-sm text-red-600">{formik.errors.confirmPassword}</p>
        ) : null}
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
          {formik.isSubmitting ? "Updating…" : "Update password"}
        </button>
      </div>
    </form>
  );
}
