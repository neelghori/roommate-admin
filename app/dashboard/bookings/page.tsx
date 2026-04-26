import type { Metadata } from "next";
import { BookingsModule } from "@/components/dashboard/bookings-module";

export const metadata: Metadata = {
  title: "Visit bookings",
  description: "Property visit requests across Roommat listings.",
};

export default function BookingsPage() {
  return <BookingsModule />;
}
