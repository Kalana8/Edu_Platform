import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,.35),_transparent_25%),linear-gradient(180deg,#4f46e5_0%,#8b5cf6_45%,#9333ea_100%)] text-white">
      <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-24 text-center space-y-20">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_rgba(255,255,255,.12),_transparent_18%)]" />
        <div className="relative z-10 space-y-4">
          <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            Build Your Skills Daily
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-8 text-white/80 sm:text-xl">
            Read. Compete. Earn.
          </p>
        </div>

        <div className="flex w-full flex-col items-stretch gap-10 justify-center px-6 sm:items-center sm:px-14">
          <Link
            className="inline-flex h-14 w-full max-w-md items-center justify-center rounded-lg bg-white px-8 text-base font-semibold text-blue-700 shadow-lg shadow-slate-950/10 transition hover:shadow-slate-950/20 sm:w-auto sm:min-w-[24rem]"
            href="/join-school"
          >
            Get Started
          </Link>
          <Link
            className="inline-flex h-14 w-full max-w-md items-center justify-center rounded-lg border border-white/50 bg-white/10 px-8 text-base font-semibold text-white transition hover:bg-white/15 sm:w-auto sm:min-w-[24rem]"
            href="/admin/login"
          >
            Admin Login →
          </Link>
        </div>
      </main>
    </div>
  );
}
