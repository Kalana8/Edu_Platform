import Link from "next/link";

export default function AdminSidebar({ role = "admin" }: { role?: "admin" | "moderator" }) {
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

  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-white">
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
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-slate-800">
              <span className="w-6 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}

          {role === "admin" && adminOnly.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-slate-800">
              <span className="w-6 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}

          {role === "moderator" && moderatorOnly.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-slate-800">
              <span className="w-6 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6">
        <div className="text-sm text-slate-400">Moderator User</div>
        <div className="mt-2">
          <button className="text-red-400">Logout</button>
        </div>
      </div>
    </aside>
  );
}
