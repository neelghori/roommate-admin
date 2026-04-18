import type { Metadata } from "next";
import { BookingsModule } from "@/components/dashboard/bookings-module";

export const metadata: Metadata = {
  title: "Bookings",
  description: "Stays and booking pipeline for Roommat.",
};

export default function BookingsPage() {
  return <BookingsModule />;
}
