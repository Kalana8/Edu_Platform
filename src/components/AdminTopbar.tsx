"use client";

interface AdminTopbarProps {
  name?: string;
  role?: string;
  onMenuClick?: () => void;
  pageTitle?: string;
}

export default function AdminTopbar({ name = "Admin User", role = "Admin", onMenuClick, pageTitle }: AdminTopbarProps) {
  return (
    <header className="flex items-center justify-between gap-4 bg-white px-4 py-4 shadow-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100 transition lg:hidden"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
        )}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{pageTitle || "Dashboard"}</h2>
          <p className="text-sm text-slate-500">Welcome back, {name}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden text-right sm:block">
          <div className="text-sm font-semibold text-slate-900">{name}</div>
          <div className="text-xs text-slate-400">{role}</div>
        </div>
        <div className="h-9 w-9 rounded-full bg-blue-500 flex items-center justify-center text-sm font-semibold text-white sm:h-10 sm:w-10">
          {name?.[0] ?? "A"}
        </div>
      </div>
    </header>
  );
}
