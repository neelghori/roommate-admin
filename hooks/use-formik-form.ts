import { useFormik, type FormikConfig } from "formik";

type UseFormikFormOptions<T extends Record<string, unknown>> = Pick<
  FormikConfig<T>,
  "initialValues" | "onSubmit"
> &
  Partial<
    Pick<
      FormikConfig<T>,
      | "validationSchema"
      | "validateOnBlur"
      | "validateOnChange"
      | "enableReinitialize"
    >
  >;

/**
 * Thin wrapper around `useFormik` with project defaults (validate on blur/change).
 */
export function useFormikForm<T extends Record<string, unknown>>(
  options: UseFormikFormOptions<T>,
) {
  const {
    validateOnBlur = true,
    validateOnChange = true,
    enableReinitialize,
    ...rest
  } = options;

  return useFormik<T>({
    validateOnBlur,
    validateOnChange,
    enableReinitialize,
    ...rest,
  });
}
