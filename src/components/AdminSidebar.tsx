"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser, clearUser } from "@/lib/session";

export default function AdminSidebar({ role = "admin", isOpen = false, onClose, name: nameProp }: { role?: "admin" | "moderator"; isOpen?: boolean; onClose?: () => void; name?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [name, setName] = useState(nameProp ?? (role === "moderator" ? "Moderator User" : "Admin User"));

  useEffect(() => {
    if (nameProp) return;
    const session = getUser();
    if (session?.name) {
      setName(session.name);
    }
  }, [nameProp]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore network errors; cookie will still be cleared client-side
    } finally {
      clearUser();
      router.push("/admin/login");
      router.refresh();
    }
  };

  const prefix = role === "moderator" ? "/moderator" : "/admin";

  const common = [
    { href: `${prefix}/dashboard`, label: "Dashboard" },
    { href: `${prefix}/category`, label: "Category" },
    { href: `${prefix}/schools`, label: "Schools" },
    { href: `${prefix}/students`, label: "Students" },
    { href: `${prefix}/explore`, label: "Explore" },
  ];

  const adminOnly = [
    { href: "/admin/moderators", label: "Moderator Management" },
    { href: "/admin/approvals", label: "Approvals" },
  ];

  const moderatorOnly = [
    { href: "/moderator/content", label: "Content Management" },
    // { href: "/moderator/support", label: "Dispute & Support" },
  ];

  const items = [
    ...common,
    ...(role === "admin" ? adminOnly : []),
    ...(role === "moderator" ? moderatorOnly : []),
  ];

  const navContent = (
    <div className="flex h-full flex-col">
      <div className="p-6">
        <div className="mb-8">
          <p className="text-lg font-semibold tracking-tight">Admin Portal</p>
          <p className="text-xs text-blue-100/80">{role === "admin" ? "Admin Account" : "Moderator Account"}</p>
        </div>

        <nav className="space-y-1">
          {items.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-white text-brand shadow-sm"
                    : "text-blue-50/85 hover:bg-white/15 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-white/15 p-6">
        <div className="text-sm font-medium text-white">{name}</div>
        <button
          onClick={handleLogout}
          className="mt-3 w-full rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
        >
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block lg:w-64 lg:shrink-0 bg-linear-to-b from-brand to-blue-800 text-white lg:relative lg:z-auto lg:translate-x-0">
        {navContent}
      </aside>

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 bg-linear-to-b from-brand to-blue-800 text-white transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navContent}
      </aside>
    </>
  );
}
