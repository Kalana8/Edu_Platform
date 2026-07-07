import { cookies } from "next/headers";
import AdminSidebar from "@/components/AdminSidebar";
import AdminTopbar from "@/components/AdminTopbar";

export default async function ModeratorLayout({ children }: { children: React.ReactNode }) {
  let name = "Moderator User";
  let role = "Moderator";

  const cookieStore = await cookies();
  const sessionUserStr = cookieStore.get("session_user")?.value;
  if (sessionUserStr) {
    try {
      const user = JSON.parse(sessionUserStr);
      name = user.name ?? name;
      role = user.role ?? role;
    } catch {
      // ignore malformed session
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar role="moderator" />
      <div className="flex-1">
        <AdminTopbar name={name} role={role} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
