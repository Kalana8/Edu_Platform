"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Icon, { type IconName } from "@/components/Icon";

const STORAGE_KEY = "splash_seen";

type Slide = {
  icon: IconName;
  title: string;
};

const SLIDES: Slide[] = [
  { icon: "book", title: "Read Anywhere" },
  { icon: "bolt", title: "Earn Credits" },
  { icon: "trophy", title: "Climb The Ranks" },
  { icon: "graduation", title: "Get Certified" },
];

/**
 * Shows the intro slides on a student's first visit, then the wrapped page
 * (the landing screen) on every visit after that.
 */
export default function SplashGate({ children }: { children: ReactNode }) {
  // null = not yet checked (avoids flashing the wrong screen before localStorage is read)
  const [showSlides, setShowSlides] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      // "/?splash" always replays the slides (handy for testing).
      const forced = new URLSearchParams(window.location.search).has("splash");
      setShowSlides(forced || localStorage.getItem(STORAGE_KEY) !== "1");
    } catch {
      setShowSlides(false);
    }
  }, []);

  const markSeen = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* storage unavailable: slides will show again next time */
    }
  };

  if (showSlides === null) return <div className="min-h-screen bg-brand" />;
  if (!showSlides) return <>{children}</>;

  return (
    <SplashSlides
      onDone={() => {
        markSeen();
        setShowSlides(false);
      }}
    />
  );
}

function SplashSlides({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const isLast = index === SLIDES.length - 1;

  const goTo = (i: number) => setIndex(Math.max(0, Math.min(SLIDES.length - 1, i)));

  const next = () => (isLast ? onDone() : goTo(index + 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIndex((i) => Math.min(SLIDES.length - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-brand text-white">
      <main
        className="relative mx-auto flex min-h-screen w-full max-w-sm flex-col px-6 pb-10 pt-6"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(dx) < 50) return;
          goTo(dx < 0 ? index + 1 : index - 1);
        }}
      >
        <div className="relative z-10 flex h-10 items-center justify-end">
          {!isLast && (
            <button
              type="button"
              onClick={onDone}
              className="text-sm font-medium text-white/80 hover:cursor-pointer hover:text-white"
            >
              Skip
            </button>
          )}
        </div>

        {/* Slides track */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="flex h-full transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {SLIDES.map((slide, i) => (
              <section
                key={slide.title}
                aria-hidden={i !== index}
                className="flex w-full shrink-0 flex-col items-center justify-center gap-10 px-6 text-center"
              >
                <SlideArt icon={slide.icon} />
                <h1 className="text-3xl font-semibold leading-tight tracking-tight">{slide.title}</h1>
              </section>
            ))}
          </div>
        </div>

        {/* Dots + next */}
        <div className="relative z-10 mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2 pl-1" role="tablist" aria-label="Intro slides">
            {SLIDES.map((slide, i) => (
              <button
                key={slide.title}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1} of ${SLIDES.length}`}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all duration-300 hover:cursor-pointer ${
                  i === index ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={next}
            className="group flex h-12 w-40 items-center justify-center gap-2 rounded-[1.25rem] bg-slate-900 text-base font-semibold text-white shadow-lg transition hover:cursor-pointer hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 active:scale-[0.98]"
          >
            {isLast ? "Done" : "Next"}
            <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 12h16" />
              <path d="m14 6 6 6-6 6" />
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
}

function SlideArt({ icon }: { icon: IconName }) {
  return (
    <div className="relative flex h-56 w-56 items-center justify-center" aria-hidden>
      <span className="absolute inset-0 rounded-full bg-white/10" />
      <span className="absolute inset-6 rounded-full bg-white/10" />
      <span className="absolute -right-1 top-6 h-5 w-5 rounded-full bg-[#ffd66b]" />
      <span className="absolute bottom-8 left-0 h-3 w-3 rounded-full bg-[#f2a1b3]" />
      <span className="absolute left-10 top-2 h-2.5 w-2.5 rounded-full bg-brand-soft" />
      <span className="relative flex h-28 w-28 items-center justify-center rounded-4xl bg-white text-brand shadow-[0_24px_48px_-20px_rgba(4,43,68,0.55)]">
        <Icon name={icon} className="h-14 w-14" strokeWidth={1.75} />
      </span>
    </div>
  );
}
