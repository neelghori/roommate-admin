import type { Metadata } from "next";
import { cookies } from "next/headers";
import { PropertiesModule } from "@/components/dashboard/properties-module";
import { fetchAdminProperties } from "@/lib/api/admin-properties";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";

export const metadata: Metadata = {
  title: "Properties",
  description: "Review and moderate user-submitted listings.",
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

export default async function PropertiesPage() {
  const cookieStore = await cookies();
  const token = tokenFromCookie(
    cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value,
  );

  if (!token) {
    return (
      <PropertiesModule
        initialItems={[]}
        initialError="You are not signed in."
        initialTab="queue"
      />
    );
  }

  const result = await fetchAdminProperties(token, { status: "queue" });

  if (!result.ok) {
    return (
      <PropertiesModule
        initialItems={[]}
        initialError={result.message}
        initialTab="queue"
      />
    );
  }

  return (
    <PropertiesModule initialItems={result.items} initialTab="queue" />
  );
}
