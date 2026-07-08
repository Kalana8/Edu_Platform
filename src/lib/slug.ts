export function slugToLabel(slug: string | null | undefined): string {
  if (!slug) return "";
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
