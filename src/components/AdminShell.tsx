"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import AdminTopbar from "@/components/AdminTopbar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Do not render the admin chrome for the login page.
  const isLogin = pathname?.startsWith("/admin/login") || false;

  if (isLogin) return <>{children}</>;

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar role="admin" />
      <div className="flex-1">
        <AdminTopbar name="Admin User" role="Admin" />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
