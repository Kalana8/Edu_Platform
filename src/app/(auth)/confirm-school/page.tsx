import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { SecondaryLink } from "@/components/ui/form";

type SearchParams =
  | Record<string, string | string[] | undefined>
  | Promise<Record<string, string | string[] | undefined>>;

function pickValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function ConfirmSchool({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = await Promise.resolve(searchParams ?? {});
  const schoolCode = pickValue(params.code);
  const schoolName = pickValue(params.name) || "Loading...";
  const tier = pickValue(params.tier) || "Loading...";

  return (
    <div className="min-h-screen bg-brand text-white">
      <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-6 pt-16 pb-32">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Confirm Your School</h1>
          <p className="text-white/75">Make sure these details are correct</p>
        </div>

        {/* School card: illustration breaks out of the top edge, CTA sits in a notch cut from the bottom-right corner */}
        <div className="relative mt-20 rounded-[2rem] bg-blue-50 px-6 pb-28 pt-20 text-slate-900 shadow-[0_24px_48px_-20px_rgba(4,43,68,0.55)]">
          <BooksIllustration className="absolute -top-14 left-4 h-32 w-36 drop-shadow-[0_10px_12px_rgba(4,43,68,0.25)]" />

          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Your school</p>
          <h2 className="mt-1 text-3xl font-bold leading-tight tracking-tight [overflow-wrap:anywhere]">{schoolName}</h2>

          <div className="mt-5 flex flex-wrap gap-2">
            <Chip>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m12 3 9 5-9 5-9-5z" />
                <path d="m3 13 9 5 9-5" />
              </svg>
              {tier} tier
            </Chip>
            {schoolCode && (
              <Chip>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />
                </svg>
                {schoolCode}
              </Chip>
            )}
          </div>

          {/* Notch: page-coloured block with concave corners, holding the join button */}
          <div className="absolute bottom-0 right-0 rounded-tl-[1.75rem] bg-brand pl-3 pt-3">
            <span aria-hidden className="absolute -top-7 right-0 h-7 w-7" style={notchCorner} />
            <span aria-hidden className="absolute -left-7 bottom-0 h-7 w-7" style={notchCorner} />
            <Link
              href={`/create-student-id?code=${encodeURIComponent(schoolCode)}`}
              className="group flex h-16 w-36 items-center justify-center gap-2 rounded-[1.5rem] bg-slate-900 text-base font-semibold text-white shadow-lg transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 active:scale-[0.98]"
            >
              Join
              <svg className="h-6 w-6 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 12h16" />
                <path d="m14 6 6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <SecondaryLink href="/join-school">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back
          </SecondaryLink>
        </div>
      </main>
    </div>
  );
}

// Concave corner: transparent quarter-circle (shows the card) with page colour outside it.
const notchCorner: CSSProperties = {
  background: "radial-gradient(circle at 0 0, transparent 1.75rem, var(--brand) calc(1.75rem + 0.5px))",
};

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium text-slate-800 ring-1 ring-inset ring-slate-900/70">
      {children}
    </span>
  );
}

function BooksIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 144 128" aria-hidden>
      {/* bottom book */}
      <rect x="10" y="88" width="120" height="26" rx="9" fill="#035483" />
      <rect x="18" y="92" width="104" height="18" rx="5" fill="#f8f8f6" />
      <rect x="10" y="88" width="16" height="26" rx="6" fill="#06446a" />
      <path d="M100 110v14l6-4 6 4v-14z" fill="#f2a1b3" />
      {/* middle book */}
      <rect x="20" y="60" width="110" height="26" rx="9" fill="#a0c3e2" />
      <rect x="28" y="64" width="94" height="18" rx="5" fill="#ffffff" />
      <rect x="20" y="60" width="16" height="26" rx="6" fill="#74a9d8" />
      {/* top book */}
      <rect x="14" y="32" width="112" height="26" rx="9" fill="#027dc5" />
      <rect x="22" y="36" width="96" height="18" rx="5" fill="#d7e0eb" />
      <rect x="14" y="32" width="16" height="26" rx="6" fill="#0267a3" />
      <rect x="44" y="43" width="40" height="4" rx="2" fill="#a0c3e2" />
      {/* bookmark ribbon */}
      <path d="M96 4h14v30l-7-5-7 5z" fill="#ffd66b" />
    </svg>
  );
}
