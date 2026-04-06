"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      richColors
      closeButton
      expand={false}
      gap={10}
      toastOptions={{
        classNames: {
          toast:
            "rounded-xl border border-neutral-200/80 shadow-lg font-[family-name:var(--font-poppins),var(--font-geist-sans),system-ui,sans-serif]",
          title: "font-semibold",
          description: "text-neutral-600",
        },
      }}
    />
  );
}
