"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser, clearUser } from "@/lib/session";

export default function AdminSidebar({ role = "admin", isOpen = false, onClose, name: nameProp }: { role?: "admin" | "moderator"; isOpen?: boolean; onClose?: () => void; name?: string }) {
  const router = useRouter();
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
    { href: `${prefix}/dashboard`, label: "Dashboard", icon: "📊" },
    { href: `${prefix}/category`, label: "Category", icon: "📚" },
    { href: `${prefix}/schools`, label: "Schools", icon: "🏫" },
    { href: `${prefix}/students`, label: "Students", icon: "👥" },
  ];

  const adminOnly = [
    { href: "/admin/moderators", label: "Moderator Management", icon: "🛡️" },
    { href: "/admin/approvals", label: "Approvals", icon: "✅" },
  ];

  const moderatorOnly = [
    { href: "/moderator/content", label: "Content Management", icon: "✍️" },
    // { href: "/moderator/support", label: "Dispute & Support", icon: "💬" },
  ];

  const navContent = (
    <>
      <div className="p-6">
        <div className="mb-8">
          <div className="rounded-full bg-slate-800 p-3 inline-block">🔷</div>
          <div className="mt-3">
            <p className="text-sm font-semibold">Admin Portal</p>
            <p className="text-xs text-slate-400">{role === "admin" ? "Admin Account" : "Moderator Account"}</p>
          </div>
        </div>

        <nav className="space-y-2">
          {common.map((item) => (
            <Link key={item.href} href={item.href} onClick={onClose} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-slate-800 hover:text-white text-slate-300">
              <span className="w-5 text-center text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}

          {role === "admin" && adminOnly.map((item) => (
            <Link key={item.href} href={item.href} onClick={onClose} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-slate-800 hover:text-white text-slate-300">
              <span className="w-5 text-center text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}

          {role === "moderator" && moderatorOnly.map((item) => (
            <Link key={item.href} href={item.href} onClick={onClose} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-slate-800 hover:text-white text-slate-300">
              <span className="w-5 text-center text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6">
        <div className="text-sm text-slate-400 font-medium">{name}</div>
        <div className="mt-2">
          <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300 transition font-medium">
            Logout
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:block lg:w-64 lg:shrink-0 bg-slate-900 text-white lg:relative lg:z-auto lg:translate-x-0">
        {navContent}
      </aside>

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navContent}
      </aside>
    </>
  );
}
