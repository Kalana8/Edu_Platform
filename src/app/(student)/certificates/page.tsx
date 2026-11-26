import Link from "next/link";
import { redirect } from "next/navigation";
import BottomBar from "@/components/BottomBar";
import PageHeader from "@/components/PageHeader";
import { getSessionUser } from "@/lib/auth";

// Certificates aren't stored anywhere yet; this page holds the spot in the navigation.
export default async function CertificatesPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "student") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-950">
      <main className="mx-auto flex min-h-screen w-full max-w-[450px] flex-col">
        <PageHeader title="Certificates" rounded={false} />

        <div className="px-4 py-4">
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-slate-200/70">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-tint text-brand">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="9" r="6" />
                <path d="m8.5 13.9-1.5 7.1 5-3 5 3-1.5-7.1" />
              </svg>
            </span>
            <p className="font-semibold">No certificates yet</p>
            <p className="text-sm text-slate-500">Certificates you earn will appear here.</p>
            <Link href="/my-learning" className="mt-2 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700">
              Go to My Learning
            </Link>
          </div>
        </div>
      </main>
      <BottomBar />
    </div>
  );
}
