import type { Metadata } from "next";
import { cookies } from "next/headers";
import { UsersModule } from "@/components/dashboard/users-module";
import { fetchAdminUsers } from "@/lib/api/admin-users";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";

export const metadata: Metadata = {
  title: "Admin users",
  description: "Manage admin panel staff — roles and active access.",
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

export default async function UsersPage() {
  const cookieStore = await cookies();
  const token = tokenFromCookie(
    cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value,
  );

  if (!token) {
    return (
      <UsersModule
        initialUsers={[]}
        initialError="You are not signed in."
      />
    );
  }

  const result = await fetchAdminUsers(token);

  if (!result.ok) {
    return (
      <UsersModule initialUsers={[]} initialError={result.message} />
    );
  }

  return <UsersModule initialUsers={result.users} />;
}
