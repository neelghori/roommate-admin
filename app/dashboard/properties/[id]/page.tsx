import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { PropertyDetailModule } from "@/components/dashboard/property-detail-module";
import { fetchAdminPropertyById } from "@/lib/api/admin-properties";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";

function tokenFromCookie(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    return decoded.length > 0 ? decoded : null;
  } catch {
    return raw.length > 0 ? raw : null;
  }
}

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Property details",
    description: "Review full listing details.",
  };
}

export default async function AdminPropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!id) notFound();

  const cookieStore = await cookies();
  const token = tokenFromCookie(
    cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value,
  );

  if (!token) {
    return (
      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-6 text-sm text-amber-900">
        <p className="font-semibold">You are not signed in.</p>
        <Link href="/login" className="mt-2 inline-block text-roommat-teal underline">
          Sign in
        </Link>
      </div>
    );
  }

  const result = await fetchAdminPropertyById(token, id);

  if (!result.ok) {
    if (result.status === 404) notFound();
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-6 text-sm text-red-900">
        <p className="font-semibold">Could not load property</p>
        <p className="mt-1">{result.message}</p>
        <Link
          href="/dashboard/properties"
          className="mt-3 inline-block text-sm font-medium text-roommat-teal underline"
        >
          ← Back to properties
        </Link>
      </div>
    );
  }

  return (
    <PropertyDetailModule
      property={result.property}
      summary={result.summary}
    />
  );
}
