import Link from "next/link";

const navItems = [
  { label: "Home", href: "/home" },
  { label: "Wallet", href: "/wallet" },
  { label: "Ranks", href: "/ranks" },
  { label: "Boost", href: "/boost" },
  { label: "Profile", href: "/profile" },
];

export default function BottomBar() {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[390px] items-center justify-between px-4 py-3 text-center text-xs font-medium text-slate-500">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex flex-col items-center justify-center gap-1 text-slate-950"
          >
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </footer>
  );
}
