import { notFound } from "next/navigation";
import AdminShell from "@/components/AdminShell";

export default async function RoleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;

  if (role !== "admin" && role !== "moderator") {
    notFound();
  }

  return <AdminShell role={role}>{children}</AdminShell>;
}
