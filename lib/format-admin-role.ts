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
