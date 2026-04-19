import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AmenitiesModule } from "@/components/dashboard/amenities-module";
import { fetchAmenities } from "@/lib/api/admin-amenities";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";

export const metadata: Metadata = {
  title: "Amenities",
  description: "Manage listing amenities and icons for Roommat.",
};

function tokenFromCookie(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    return decoded.length > 0 ? decoded : null;
  } catch {
    return raw.length > 0 ? raw : null;
  }
}

export default async function AmenitiesPage() {
  const cookieStore = await cookies();
  const token = tokenFromCookie(
    cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value,
  );

  if (!token) {
    return (
      <AmenitiesModule initialItems={[]} initialError="You are not signed in." />
    );
  }

  const result = await fetchAmenities(token);

  if (!result.ok) {
    return (
      <AmenitiesModule initialItems={[]} initialError={result.message} />
    );
  }

  return <AmenitiesModule initialItems={result.items} />;
}
