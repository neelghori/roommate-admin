"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import { toast } from "sonner";
import { postCreateAdminUser } from "@/lib/api/admin-users";
import { getAdminAccessToken } from "@/lib/auth/admin-token";
import { useFormikForm } from "@/hooks/use-formik-form";

const schema = Yup.object({
  fullName: Yup.string().trim().required("Name is required"),
  email: Yup.string().trim().email("Enter a valid email").required("Email is required"),
  password: Yup.string()
    .min(8, "Use at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});

type Values = Yup.InferType<typeof schema>;

export function AddAdminUserForm() {
  const router = useRouter();

  const formik = useFormikForm<Values>({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      const token = getAdminAccessToken();
      if (!token) {
        toast.error("Your session expired. Sign in again.");
        setSubmitting(false);
        router.push("/login?next=/dashboard/users/new");
        return;
      }

      const loadingId = toast.loading("Creating admin user…");

      const result = await postCreateAdminUser(token, {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      });

      toast.dismiss(loadingId);

      if (!result.ok) {
        toast.error(result.message);
        setSubmitting(false);
        return;
      }

      toast.success("Admin user created.");
      setSubmitting(false);
      router.push("/dashboard/users");
      router.refresh();
    },
  });

  const fieldClass = (invalid: boolean) =>
    `h-11 rounded-xl border px-3 text-sm text-neutral-900 outline-none transition-[box-shadow,border-color] placeholder:text-neutral-400 focus:ring-2 sm:h-12 sm:px-4 ${
      invalid
        ? "border-red-400 bg-red-50/80 focus:border-red-500 focus:ring-red-200/60"
        : "border-neutral-200/90 bg-roommat-mint-bg/40 focus:border-roommat-teal focus:ring-roommat-teal/25"
    }`;

  const fullNameInvalid =
    Boolean(formik.touched.fullName && formik.errors.fullName);
  const emailInvalid = Boolean(formik.touched.email && formik.errors.email);
  const passwordInvalid =
    Boolean(formik.touched.password && formik.errors.password);
  const confirmInvalid =
    Boolean(formik.touched.confirmPassword && formik.errors.confirmPassword);

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
          placeholder="Their full name"
          {...formik.getFieldProps("fullName")}
          className={fieldClass(fullNameInvalid)}
        />
        {fullNameInvalid ? (
          <p className="text-sm text-red-600">{formik.errors.fullName}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-neutral-800">
          Work email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="colleague@example.com"
          {...formik.getFieldProps("email")}
          className={fieldClass(emailInvalid)}
        />
        {emailInvalid ? (
          <p className="text-sm text-red-600">{formik.errors.email}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-neutral-800">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          {...formik.getFieldProps("password")}
          className={fieldClass(passwordInvalid)}
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
          placeholder="Repeat password"
          {...formik.getFieldProps("confirmPassword")}
          className={fieldClass(confirmInvalid)}
        />
        {confirmInvalid ? (
          <p className="text-sm text-red-600">
            {formik.errors.confirmPassword}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/users"
          className="order-2 text-center text-sm font-semibold text-roommat-muted hover:text-roommat-teal sm:order-1 sm:text-left"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="order-1 flex h-11 w-full items-center justify-center rounded-xl bg-roommat-teal text-sm font-semibold text-white shadow-sm transition-colors hover:bg-roommat-teal-hover disabled:cursor-not-allowed disabled:opacity-70 sm:order-2 sm:w-auto sm:min-w-[11rem]"
        >
          {formik.isSubmitting ? "Creating…" : "Create admin user"}
        </button>
      </div>
    </form>
  );
}
