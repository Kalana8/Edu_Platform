import PageHeader from "@/components/PageHeader";

const boostItems = [
  {
    title: "2x Reward Boost",
    description: "Double your credit earnings for the next 3 tasks",
    cost: 20,
    color: "bg-violet-100 text-violet-700",
  },
  {
    title: "Advanced Challenge Entry",
    description: "Access premium learning challenges with higher rewards",
    cost: 30,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Streak Protection",
    description: "Protect your streak for one missed day",
    cost: 15,
    color: "bg-emerald-100 text-emerald-700",
  },
];

export default function BoostPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 pb-24">
      <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col gap-4 px-4 py-6">
        <PageHeader title="Boost Your Progress" subtitle="Use credits to unlock special features" gradientClass="from-fuchsia-500 via-violet-600 to-blue-700" />

        <div className="rounded-[1.75rem] bg-white p-4 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
          <p className="text-sm text-slate-500">Available Credits</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">120</p>
        </div>

        <div className="space-y-4">
          {boostItems.map((item) => (
            <div key={item.title} className="rounded-[1.75rem] bg-white p-4 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
              <div className="flex items-start gap-4">
                <div className={`mt-1 flex h-12 w-12 items-center justify-center rounded-3xl ${item.color}`}>
                  <span className="text-xl">⚡</span>
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-lg font-semibold text-slate-950">{item.cost} credits</p>
                <button className="rounded-3xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
                  Purchase
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
