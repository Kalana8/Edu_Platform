import type { Metadata } from "next";
import BottomBar from "@/components/BottomBar";

export const metadata: Metadata = {
  title: "EduMate Explore",
  description: "University-informed advanced learning in EduMate.",
};

/**
 * Shell for the Explore area — matches the existing student page frame
 * (450px mobile column + BottomBar).
 */
export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-950">
      <main className="mx-auto flex min-h-screen w-full max-w-[450px] flex-col px-4">{children}</main>
      <BottomBar />
    </div>
  );
}
