"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminTopbar from "@/components/AdminTopbar";
import { getUser } from "@/lib/session";

export default function AdminShell({
  children,
  role = "admin",
}: {
  children: React.ReactNode;
  role?: "admin" | "moderator";
}) {
  const pathname = usePathname();
  const [displayName, setDisplayName] = useState(role === "moderator" ? "Moderator User" : "Admin User");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const session = getUser();
    if (session?.name) {
      setDisplayName(session.name);
    }
  }, [role]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const pageTitle =
    pathname?.split("/").filter(Boolean).pop()?.replace(/-/g, " ") ?? "";

  const capitalizedTitle = pageTitle
    ? pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1)
    : "Dashboard";

  const isLogin = pathname?.startsWith("/admin/login") || pathname?.startsWith("/moderator/login") || false;

  if (isLogin) return <>{children}</>;

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} name={displayName} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col">
        <AdminTopbar
          name={displayName}
          role={role === "moderator" ? "Moderator" : "Admin"}
          onMenuClick={() => setSidebarOpen((prev) => !prev)}
          pageTitle={capitalizedTitle}
        />
        <main className="flex-1 p-2 sm:p-3 lg:p-4">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
