import CategoryPage from "@/components/CategoryPage";

export default async function RoleCategoryPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  const roleLabel = role === "moderator" ? "Moderator" : "Admin";

  return <CategoryPage role={roleLabel} basePath={`/${role}`} />;
}
