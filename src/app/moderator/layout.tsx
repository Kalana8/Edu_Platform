"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminTopbar from "@/components/AdminTopbar";
import { getUser } from "@/lib/session";

export default function ModeratorLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [displayName, setDisplayName] = useState("Moderator User");

  useEffect(() => {
    const session = getUser();
    if (session?.name) {
      setDisplayName(session.name);
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar role="moderator" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} name={displayName} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col">
        <AdminTopbar
          name={displayName}
          role="Moderator"
          onMenuClick={() => setSidebarOpen((prev) => !prev)}
          pageTitle="Moderator"
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
