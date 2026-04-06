"use client";

import { useState } from "react";
import * as Yup from "yup";
import { toast } from "sonner";
import { postAdminForgotPassword } from "@/lib/api/admin-auth";
import { useFormikForm } from "@/hooks/use-formik-form";

const forgotPasswordSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
});

type ForgotPasswordFormValues = Yup.InferType<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  const formik = useFormikForm<ForgotPasswordFormValues>({
    initialValues: {
      email: "",
    },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const loadingId = toast.loading("Sending reset link…");

      const result = await postAdminForgotPassword({
        email: values.email.trim(),
      });

      toast.dismiss(loadingId);

      if (!result.ok) {
        toast.error(result.message);
        setSubmitting(false);
        return;
      }

      toast.success("If that email is registered, you’ll get reset instructions.");
      setSent(true);
      setSubmitting(false);
    },
  });

  const emailInvalid =
    Boolean(formik.touched.email && formik.errors.email);

  if (sent) {
    return (
      <div
        className="rounded-xl border border-roommat-teal/20 bg-roommat-mint-bg/80 px-4 py-4 text-center text-sm text-roommat-muted"
        role="status"
      >
        If an account exists for that email, you’ll receive reset instructions
        shortly. Check your inbox and spam folder.
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={formik.handleSubmit}
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-neutral-800">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...formik.getFieldProps("email")}
          className={`h-11 rounded-xl border px-3 text-sm text-neutral-900 outline-none transition-[box-shadow,border-color] placeholder:text-neutral-400 focus:ring-2 sm:h-12 sm:px-4 sm:text-base ${
            emailInvalid
              ? "border-red-400 bg-red-50/80 focus:border-red-500 focus:ring-red-200/60"
              : "border-neutral-200/90 bg-roommat-mint-bg/55 focus:border-roommat-teal focus:ring-roommat-teal/25"
          }`}
        />
        {emailInvalid ? (
          <p className="text-sm text-red-600">{formik.errors.email}</p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={formik.isSubmitting}
        className="mt-1 flex h-11 w-full items-center justify-center rounded-xl bg-roommat-teal text-sm font-semibold text-white shadow-sm transition-colors hover:bg-roommat-teal-hover disabled:cursor-not-allowed disabled:opacity-70 sm:h-12"
      >
        {formik.isSubmitting ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
