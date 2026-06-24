import AdminSidebar from "@/components/AdminSidebar";
import AdminTopbar from "@/components/AdminTopbar";

export default function ModeratorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar role="moderator" />
      <div className="flex-1">
        <AdminTopbar name="Moderator User" role="Moderator" />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
