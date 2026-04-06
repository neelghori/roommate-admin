import { Poppins } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    template: "%s · Roommat Admin",
    default: "Roommat Admin",
  },
  description: "Admin panel for Roommat — rooms and PG listings.",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${poppins.variable} h-dvh max-h-dvh overflow-hidden bg-neutral-50 font-sans text-neutral-900 antialiased`}
      style={{
        fontFamily:
          "var(--font-poppins), var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      {children}
    </div>
  );
}
