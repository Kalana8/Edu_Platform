"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Home",
    href: "/home",
    icon: (active: boolean) => (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Category",
    href: "/choose-category",
    match: (path: string) => path === "/choose-category" || path.startsWith("/category"),
    icon: (active: boolean) => (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.5 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </svg>
    ),
  },
  {
    label: "Wallet",
    href: "/wallet",
    icon: (active: boolean) => (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="16" rx="3" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    label: "Ranks",
    href: "/ranks",
    icon: (active: boolean) => (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 7 9 9v10.5a2.5 2.5 0 0 1-5 0v-5" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 15 7 15 9v10.5a2.5 2.5 0 0 0 5 0v-5" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/profile",
    icon: (active: boolean) => (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

function isActive(path: string, item: (typeof navItems)[number]) {
  if (item.match) return item.match(path);
  return path === item.href;
}

export default function BottomBar() {
  const pathname = usePathname();

  return (
    <footer className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-[390px]">
        <nav
          className="mx-4 mb-4 flex items-center justify-around rounded-[1.75rem] border border-slate-200/80 bg-white/90 px-2 py-2 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.25)] backdrop-blur-xl"
        >
          {navItems.map((item) => {
            const active = isActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex flex-col items-center justify-center gap-0.5 rounded-2xl px-3 py-1.5 transition-all duration-200 ${active
                    ? "text-blue-600"
                    : "text-slate-400 hover:text-slate-600 active:scale-95"
                  }`}
              >
                {item.icon(active)}
                <span className={`text-[10px] font-semibold leading-none ${active ? "text-blue-600" : "text-slate-400"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </footer>
  );
}
