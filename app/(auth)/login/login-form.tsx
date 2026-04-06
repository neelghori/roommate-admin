"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as Yup from "yup";
import { toast } from "sonner";
import { postAdminLogin } from "@/lib/api/admin-auth";
import { getSafeInternalPath } from "@/lib/auth/safe-redirect";
import {
  profileFromLoginRaw,
  setAdminSessionProfile,
} from "@/lib/auth/admin-session-profile";
import { setAdminAccessToken } from "@/lib/auth/admin-token";
import { useFormikForm } from "@/hooks/use-formik-form";

const loginSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

type LoginFormValues = Yup.InferType<typeof loginSchema>;

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(
    () => getSafeInternalPath(searchParams.get("next")) ?? "/dashboard",
    [searchParams],
  );

  const formik = useFormikForm<LoginFormValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const loadingId = toast.loading("Signing in…");

      const result = await postAdminLogin({
        email: values.email.trim(),
        password: values.password,
      });

      toast.dismiss(loadingId);

      if (!result.ok) {
        toast.error(result.message || "Login failed");
        setSubmitting(false);
        return;
      }

      if (!result.token) {
        toast.error("Login succeeded but no token was returned.");
        setSubmitting(false);
        return;
      }

      setAdminAccessToken(result.token);
      setAdminSessionProfile(
        profileFromLoginRaw(result.raw, values.email.trim()),
      );

      toast.success("Signed in successfully");
      setSubmitting(false);
      router.push(nextPath);
      router.refresh();
    },
  });

  const emailInvalid =
    Boolean(formik.touched.email && formik.errors.email);
  const passwordInvalid =
    Boolean(formik.touched.password && formik.errors.password);

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
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium text-neutral-800"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
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
      <button
        type="submit"
        disabled={formik.isSubmitting}
        className="mt-1 flex h-11 w-full items-center justify-center rounded-xl bg-roommat-teal text-sm font-semibold text-white shadow-sm transition-colors hover:bg-roommat-teal-hover disabled:cursor-not-allowed disabled:opacity-70 sm:h-12"
      >
        {formik.isSubmitting ? "Signing in…" : "Login"}
      </button>
    </form>
  );
}

function LoginFormFallback() {
  return (
    <div
      className="h-[17.5rem] animate-pulse rounded-xl bg-roommat-mint-bg/50"
      aria-hidden
    />
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginFormInner />
    </Suspense>
  );
}
