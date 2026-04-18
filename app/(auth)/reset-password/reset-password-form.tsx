"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import * as Yup from "yup";
import { toast } from "sonner";
import { postAdminResetPassword } from "@/lib/api/admin-auth";
import { useFormikForm } from "@/hooks/use-formik-form";

const resetPasswordSchema = Yup.object({
  password: Yup.string()
    .min(8, "Use at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});

type ResetPasswordFormValues = Yup.InferType<typeof resetPasswordSchema> & {
  token: string;
};

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [done, setDone] = useState(false);

  const formik = useFormikForm<ResetPasswordFormValues>({
    initialValues: {
      token,
      password: "",
      confirmPassword: "",
    },
    enableReinitialize: true,
    validationSchema: resetPasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const loadingId = toast.loading("Updating password…");

      const result = await postAdminResetPassword({
        token: values.token,
        password: values.password,
      });

      toast.dismiss(loadingId);

      if (!result.ok) {
        toast.error(result.message);
        setSubmitting(false);
        return;
      }

      toast.success("Password updated. You can sign in with your new password.");
      setDone(true);
      setSubmitting(false);
    },
  });

  const passwordInvalid =
    Boolean(formik.touched.password && formik.errors.password);
  const confirmInvalid =
    Boolean(formik.touched.confirmPassword && formik.errors.confirmPassword);

  if (!token) {
    return (
      <div
        className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-center text-xs text-amber-900 sm:px-4 sm:py-4 sm:text-sm"
        role="alert"
      >
        This reset link is missing a token. Open the link from your email or
        request a new reset from{" "}
        <Link
          href="/forgot-password"
          className="font-semibold underline hover:text-roommat-orange-hover"
        >
          forgot password
        </Link>
        .
      </div>
    );
  }

  if (done) {
    return (
      <div
        className="rounded-xl border border-roommat-teal/20 bg-roommat-mint-bg/80 px-3 py-3 text-center text-xs text-roommat-muted sm:px-4 sm:py-4 sm:text-sm"
        role="status"
      >
        <p>Your password has been updated.</p>
        <Link
          href="/login"
          className="mt-3 inline-block font-semibold text-roommat-orange hover:text-roommat-orange-hover"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={formik.handleSubmit}
      noValidate
    >
      <input type="hidden" name="token" value={formik.values.token} readOnly />
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium text-neutral-800"
        >
          New password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          {...formik.getFieldProps("password")}
          className={`h-11 rounded-xl border px-3 text-sm text-neutral-900 outline-none transition-[box-shadow,border-color] placeholder:text-neutral-400 focus:ring-2 sm:h-12 sm:px-4 sm:text-base ${
            passwordInvalid
              ? "border-red-400 bg-red-50/80 focus:border-red-500 focus:ring-red-200/60"
              : "border-neutral-200/90 bg-roommat-mint-bg/55 focus:border-roommat-teal focus:ring-roommat-teal/25"
          }`}
        />
        {passwordInvalid ? (
          <p className="text-sm text-red-600">{formik.errors.password}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-neutral-800"
        >
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat new password"
          {...formik.getFieldProps("confirmPassword")}
          className={`h-11 rounded-xl border px-3 text-sm text-neutral-900 outline-none transition-[box-shadow,border-color] placeholder:text-neutral-400 focus:ring-2 sm:h-12 sm:px-4 sm:text-base ${
            confirmInvalid
              ? "border-red-400 bg-red-50/80 focus:border-red-500 focus:ring-red-200/60"
              : "border-neutral-200/90 bg-roommat-mint-bg/55 focus:border-roommat-teal focus:ring-roommat-teal/25"
          }`}
        />
        {confirmInvalid ? (
          <p className="text-sm text-red-600">
            {formik.errors.confirmPassword}
          </p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={formik.isSubmitting}
        className="mt-1 flex h-11 w-full items-center justify-center rounded-xl bg-roommat-teal text-sm font-semibold text-white shadow-sm transition-colors hover:bg-roommat-teal-hover disabled:cursor-not-allowed disabled:opacity-70 sm:h-12"
      >
        {formik.isSubmitting ? "Updating…" : "Reset password"}
      </button>
    </form>
  );
}
