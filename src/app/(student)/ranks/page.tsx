import PageHeader from "@/components/PageHeader";

const rankItems = [
  { label: "Sydney Grammar School", points: "9,800 pts", highlight: "gold" },
  { label: "Brisbane State High", points: "9,450 pts", highlight: "silver" },
  { label: "Adelaide High School", points: "9,100 pts", highlight: "bronze" },
  { label: "Perth Modern School", points: "8,750 pts" },
  { label: "Canberra High", points: "8,320 pts" },
  { label: "Melbourne High School", points: "7,200 pts", current: true },
];

export default function RanksPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 pb-24">
      <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col gap-4 px-4 py-6">
        <PageHeader title="Leaderboard" subtitle="See how schools rank" gradientClass="from-amber-500 via-orange-500 to-rose-500" />

        <div className="rounded-[1.75rem] bg-white p-4 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
          <div className="grid gap-3">
            <div className="flex items-center justify-between rounded-[1.5rem] bg-slate-100 p-4">
              <span className="text-sm font-semibold text-slate-700">Tier</span>
              <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-semibold text-white">Selected</span>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-[1.5rem] bg-slate-100 p-2 text-center text-sm font-medium text-slate-600">
              <button className="rounded-3xl bg-white py-3 shadow-sm">Tier</button>
              <button className="rounded-3xl py-3">National</button>
              <button className="rounded-3xl py-3">Students</button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {rankItems.map((item, index) => (
            <div
              key={item.label}
              className={`flex items-center justify-between rounded-[1.75rem] border px-4 py-4 shadow-sm ${
                item.current ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                  item.highlight === "gold"
                    ? "bg-amber-100 text-amber-700"
                    : item.highlight === "silver"
                    ? "bg-slate-200 text-slate-700"
                    : item.highlight === "bronze"
                    ? "bg-orange-100 text-orange-700"
                    : item.current
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700"
                } font-bold text-lg`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-slate-950">{item.label}</p>
                </div>
              </div>
              <p className="font-semibold text-slate-950">{item.points}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
