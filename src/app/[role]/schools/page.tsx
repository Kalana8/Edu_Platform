import SchoolsPage from "@/components/SchoolsPage";

export default async function RoleSchoolsPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  const roleLabel = role === "moderator" ? "Moderator" : "Admin";

  return <SchoolsPage role={roleLabel} basePath={`/${role}`} />;
}
