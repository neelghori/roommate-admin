import type { Metadata } from "next";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of Roommat admin metrics and activity.",
};

export default function DashboardPage() {
  return <DashboardOverview />;
}
