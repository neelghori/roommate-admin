import type { Metadata } from "next";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Admin overview: property, user, booking, FAQ, and amenity totals plus monthly new listings.",
};

export default function DashboardPage() {
  return <DashboardOverview />;
}
