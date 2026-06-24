"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import AdminTopbar from "@/components/AdminTopbar";

export default function AdminShell({
  children,
  role = "admin",
}: {
  children: React.ReactNode;
  role?: "admin" | "moderator";
}) {
  const pathname = usePathname();

  // Do not render the admin chrome for the login page.
  const isLogin = pathname?.startsWith("/admin/login") || pathname?.startsWith("/moderator/login") || false;

  if (isLogin) return <>{children}</>;

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar role={role} />
      <div className="flex-1">
        <AdminTopbar
          name={role === "moderator" ? "Moderator User" : "Admin User"}
          role={role === "moderator" ? "Moderator" : "Admin"}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
