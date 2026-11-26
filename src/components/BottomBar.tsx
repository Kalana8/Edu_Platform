"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  match?: (path: string) => boolean;
  icon: React.ReactNode;
};

const iconProps = {
  className: "h-6 w-6",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const sideItems: { left: NavItem[]; right: NavItem[] } = {
  left: [
    {
      label: "Category",
      href: "/choose-category",
      match: (path) => path === "/choose-category" || path.startsWith("/category") || path.startsWith("/explore"),
      icon: (
        <>
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" />
        </>
      ),
    },
    {
      label: "My Learning",
      href: "/my-learning",
      match: (path) => path === "/my-learning" || path.startsWith("/read") || path.startsWith("/quiz"),
      icon: (
        <>
          <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
          <path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
        </>
      ),
    },
  ],
  right: [
    {
      label: "Certificates",
      href: "/certificates",
      icon: (
        <>
          <circle cx="12" cy="9" r="6" />
          <path d="m8.5 13.9-1.5 7.1 5-3 5 3-1.5-7.1" />
        </>
      ),
    },
    {
      label: "Profile",
      href: "/profile",
      // Wallet and Leaderboard are opened from the profile.
      match: (path) => path === "/profile" || path === "/wallet" || path === "/ranks",
      icon: (
        <>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </>
      ),
    },
  ],
};

function isActive(path: string, item: NavItem) {
  return item.match ? item.match(path) : path === item.href;
}

function SideLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 transition-all duration-200 ${
        active ? "text-brand" : "text-slate-400 hover:text-slate-600 active:scale-95"
      }`}
    >
      <svg {...iconProps} strokeWidth={active ? 2.5 : 2}>
        {item.icon}
      </svg>
      <span className="whitespace-nowrap text-[10px] font-semibold leading-none">{item.label}</span>
    </Link>
  );
}

export default function BottomBar() {
  const pathname = usePathname();
  const homeActive = pathname === "/home";

  return (
    <footer className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-[390px]">
        <nav className="mx-3 mb-4 flex items-center rounded-[1.75rem] border border-slate-200/80 bg-white/90 px-1 py-2 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.25)] backdrop-blur-xl">
          {sideItems.left.map((item) => (
            <SideLink key={item.href} item={item} active={isActive(pathname, item)} />
          ))}

          {/* Home: raised centre button */}
          <div className="flex flex-1 justify-center">
            <Link
              href="/home"
              aria-label="Home"
              aria-current={homeActive ? "page" : undefined}
              className={`-mt-8 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg ring-4 ring-white transition active:scale-95 ${
                homeActive ? "bg-brand shadow-brand/40" : "bg-brand/85 shadow-brand/25 hover:bg-brand"
              }`}
            >
              <svg {...iconProps} strokeWidth={homeActive ? 2.5 : 2}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </Link>
          </div>

          {sideItems.right.map((item) => (
            <SideLink key={item.href} item={item} active={isActive(pathname, item)} />
          ))}
        </nav>
      </div>
    </footer>
  );
}
