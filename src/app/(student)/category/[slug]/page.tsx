import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { notFound } from "next/navigation";

const categories = {
  "artificial-intelligence": {
    title: "Artificial Intelligence",
    subtitle: "Choose your learning level",
    gradientClass: "from-blue-600 via-violet-600 to-fuchsia-600",
    levels: [
      { title: "Essential", subtitle: "Foundation Level", pages: 200, color: "bg-emerald-100 text-emerald-700", icon: "📗" },
      { title: "Intermediate", subtitle: "Building Level", pages: 200, color: "bg-sky-100 text-sky-700", icon: "🎓" },
      { title: "Advanced", subtitle: "Mastery Level", pages: 200, color: "bg-fuchsia-100 text-fuchsia-700", icon: "🏆" },
    ],
  },
  "innovation-design": {
    title: "Innovation & Design",
    subtitle: "Choose your learning level",
    gradientClass: "from-amber-500 via-orange-500 to-rose-500",
    levels: [
      { title: "Essential", subtitle: "Foundation Level", pages: 180, color: "bg-amber-100 text-amber-700", icon: "📙" },
      { title: "Intermediate", subtitle: "Building Level", pages: 190, color: "bg-cyan-100 text-cyan-700", icon: "🎓" },
      { title: "Advanced", subtitle: "Mastery Level", pages: 180, color: "bg-violet-100 text-violet-700", icon: "🏆" },
    ],
  },
};

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categories[slug];
  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 pb-24">
      <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col gap-4 px-4 py-6">
        <PageHeader backHref="/choose-category" backLabel="Back to Categories" title={category.title} subtitle={category.subtitle} gradientClass={category.gradientClass} />

        <div className="space-y-4">
          {category.levels.map((level) => (
            <Link
              key={level.title}
              href="#"
              className="block overflow-hidden rounded-[1.75rem] bg-white p-4 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)] transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-3xl ${level.color}`}>
                  <span className="text-xl">{level.icon}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
