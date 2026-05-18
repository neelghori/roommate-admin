/** App roles that admins may assign (tenant ↔ owner ↔ roommate). */
export const APP_USER_ROLES = ["tenant", "owner", "roommate"] as const;

export type AppUserRole = (typeof APP_USER_ROLES)[number];

export function isAppUserRole(role: string): role is AppUserRole {
  return APP_USER_ROLES.includes(role.trim().toLowerCase() as AppUserRole);
}

/**
 * Turns API role slugs into readable labels, e.g. `sub_admin` → `Sub Admin`.
 */
export function formatAdminRoleLabel(role: string): string {
  const t = role.trim();
  if (!t) return "—";
  if (!t.includes("_")) return t;
  return t
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
