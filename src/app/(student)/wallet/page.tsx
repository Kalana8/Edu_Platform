import PageHeader from "@/components/PageHeader";

export default function WalletPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 pb-24">
      <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col gap-4 px-4 py-6">
        <PageHeader title="Wallet" subtitle="Manage your credits" gradientClass="from-blue-600 via-cyan-600 to-sky-500" />

        <div className="rounded-[1.75rem] bg-white p-5 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
          <div className="rounded-[1.75rem] bg-slate-100 p-4">
            <p className="text-sm text-slate-500">Available Credits</p>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-3xl font-semibold text-slate-950">120</p>
              <span className="rounded-3xl bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">Active</span>
            </div>
          </div>

          <div className="mt-4 grid gap-4">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-950">Spend Credits</p>
              <p className="mt-2 text-sm text-slate-500">Use credits for boosts and premium features.</p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-950">Unlocked Balance</p>
              <p className="mt-2 text-sm text-slate-500">56 credits are locked and will unlock soon.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
