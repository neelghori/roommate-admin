import { Poppins } from "next/font/google";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${poppins.variable} min-h-screen flex-1 text-neutral-900 antialiased`}
      style={{
        fontFamily:
          "var(--font-poppins), var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      <DashboardShell>{children}</DashboardShell>
    </div>
  );
}
