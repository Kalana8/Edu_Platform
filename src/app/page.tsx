import Link from "next/link";
import SplashGate from "@/components/SplashSlides";

export default function Home() {
  return (
    <SplashGate>
    <div className="min-h-screen bg-brand text-white">
      <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-20 px-6 py-24 text-center">
        <div className="space-y-2">
          <h3 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
           Keep Learning
          </h3>
          <p className="mx-auto max-w-2xl text-lg leading-8 text-white/80 sm:text-xl">
            Read. Compete. Enjoy.
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-4">
          <Link
            href="/join-school"
            className="group relative inline-flex h-14 items-center justify-center rounded-full bg-white pl-6 pr-16 text-base font-semibold text-slate-900 shadow-[0_12px_32px_-8px_rgba(4,43,68,0.45)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-10px_rgba(4,43,68,0.55)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 active:translate-y-0 active:scale-[0.98]"
          >
            Get Started
            <span className="absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-white transition-transform duration-200 group-hover:translate-x-0.5 group-hover:rotate-[-8deg]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </span>
          </Link>
         
        </div>
      </main>
    </div>
    </SplashGate>
  );
}
