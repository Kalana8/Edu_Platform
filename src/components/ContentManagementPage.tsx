import Link from "next/link";

const categories = [
  { label: "Artificial Intelligence", pages: 0, icon: "🤖" },
  { label: "Innovation & Design", pages: 0, icon: "💡" },
  { label: "Personal Development", pages: 2, icon: "🌱" },
  { label: "Entrepreneurship", pages: 0, icon: "🚀" },
  { label: "Economics", pages: 0, icon: "📈" },
  { label: "Science & Discovery", pages: 0, icon: "🧪" },
  { label: "Manufacturing", pages: 0, icon: "⚙️" },
  { label: "History & Society", pages: 0, icon: "🏛️" },
];

export default function ContentManagementPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-[2rem] bg-white px-6 py-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Content Management</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Add and manage reading content for each category and tier</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Select a category from the left to manage its content.</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="rounded-[2rem] bg-white p-6 shadow ring-1 ring-slate-200">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Categories</h2>
            <div className="space-y-3">
              {categories.map((category) => (
                <Link
                  key={category.label}
                  href="#"
                  className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-blue-300 hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-3xl bg-slate-100 text-xl">
                      {category.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-950">{category.label}</div>
                      <div className="text-xs text-slate-500">{category.pages} pages</div>
                    </div>
                  </div>
                  <div className="text-slate-400">›</div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-12 text-center shadow ring-1 ring-slate-200">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-slate-100 text-4xl">
              📖
            </div>
            <h2 className="mt-8 text-xl font-semibold text-slate-950">Select a category</h2>
            <p className="mt-3 max-w-xl text-sm text-slate-500">
              Choose a category from the left to manage its content and page listings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
