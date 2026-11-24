import ExploreAdminPage from "@/components/admin-explore/ExploreAdminPage";

export default async function RoleExplorePage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  return <ExploreAdminPage role={role === "moderator" ? "moderator" : "admin"} />;
}
