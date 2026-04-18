import type { Metadata } from "next";
import { PropertiesModule } from "@/components/dashboard/properties-module";

export const metadata: Metadata = {
  title: "Properties",
  description: "Rooms and PG listings admin.",
};

export default function PropertiesPage() {
  return <PropertiesModule />;
}
