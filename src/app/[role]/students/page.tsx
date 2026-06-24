import StudentsPage from "@/components/StudentsPage";

export default async function RoleStudentsPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  const roleLabel = role === "moderator" ? "Moderator" : "Admin";

  return <StudentsPage role={roleLabel} basePath={`/${role}`} />;
}
