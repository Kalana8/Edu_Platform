import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-950">
      <div>{children}</div>
    </div>
  );
}
