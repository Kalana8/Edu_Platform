import Link from "next/link";
import PageHeader from "@/components/PageHeader";

const categories = [
  { slug: "artificial-intelligence", label: "Artificial Intelligence", icon: "🧠", color: "bg-violet-100 text-violet-700" },
  { slug: "innovation-design", label: "Innovation & Design", icon: "💡", color: "bg-amber-100 text-amber-700" },
  { slug: "personal-development", label: "Personal Development", icon: "👥", color: "bg-rose-100 text-rose-700" },
  { slug: "entrepreneurship", label: "Entrepreneurship", icon: "💼", color: "bg-emerald-100 text-emerald-700" },
  { slug: "economics", label: "Economics", icon: "📈", color: "bg-emerald-100 text-emerald-700" },
  { slug: "science-discovery", label: "Science & Discovery", icon: "🧪", color: "bg-cyan-100 text-cyan-700" },
  { slug: "manufacturing", label: "Manufacturing", icon: "🏭", color: "bg-slate-100 text-slate-700" },
  { slug: "history-society", label: "History & Society", icon: "📚", color: "bg-fuchsia-100 text-fuchsia-700" },
];

export default function ChooseCategoryPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col gap-4 px-4 py-6">
        <PageHeader title="Choose Your Category" subtitle="Select a subject to begin reading" gradientClass="from-blue-600 via-violet-600 to-fuchsia-600" />

        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => (
            <Link
              key={category.label}
              href={`/category/${category.slug}`}
              className="overflow-hidden rounded-[1.75rem] bg-white p-4 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)] transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`flex items-center justify-center rounded-3xl p-3 shadow-sm ${category.color}`}>
                <span className="text-xl">{category.icon}</span>
              </div>
              <p className="mt-4 text-center text-sm font-semibold text-slate-950">{category.label}</p>
            </Link>
          ))}
        </div>

        <div className="rounded-[1.75rem] bg-slate-100 p-4 text-sm leading-6 text-slate-600 shadow-sm">
          <p className="font-medium text-slate-950">Curriculum-aligned content from grades 6-10.</p>
          <p className="mt-2">Strengthen knowledge through spaced repetition.</p>
        </div>
      </main>
    </div>
  );
}
