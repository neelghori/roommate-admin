import type { Metadata } from "next";
import { FaqModule } from "@/components/dashboard/faq-module";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions for Roommat admin.",
};

export default function FaqPage() {
  return <FaqModule />;
}
