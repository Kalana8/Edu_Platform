import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { notFound } from "next/navigation";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, slug, icon, code, status")
    .eq("slug", slug)
    .maybeSingle();

  if (categoryError || !category) {
    notFound();
  }

  const { data: levels, error: levelsError } = await supabase
    .from("content")
    .select("level, page_count")
    .eq("category_id", category.id)
    .eq("is_published", true);

  if (levelsError) {
    console.error("Category levels fetch error:", levelsError);
  }

  const levelMap = new Map<string, { count: number; totalPages: number }>();
  for (const item of levels ?? []) {
    const existing = levelMap.get(item.level) ?? { count: 0, totalPages: 0 };
    existing.count += 1;
    existing.totalPages += item.page_count ?? 0;
    levelMap.set(item.level, existing);
  }

  const essential = levelMap.get("Essential");
  const intermediate = levelMap.get("Intermediate");
  const advanced = levelMap.get("Advanced");

  const mappedLevels = [
    {
      title: "Essential",
      subtitle: "Foundation Level",
      pages: essential?.totalPages ?? 0,
      count: essential?.count ?? 0,
      color: "bg-emerald-100 text-emerald-700",
      icon: "📗",
    },
    {
      title: "Intermediate",
      subtitle: "Building Level",
      pages: intermediate?.totalPages ?? 0,
      count: intermediate?.count ?? 0,
      color: "bg-sky-100 text-sky-700",
      icon: "🎓",
    },
    {
      title: "Advanced",
      subtitle: "Mastery Level",
      pages: advanced?.totalPages ?? 0,
      count: advanced?.count ?? 0,
      color: "bg-fuchsia-100 text-fuchsia-700",
      icon: "🏆",
    },
  ];

  const label = category.slug
    .split("-")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 pb-24">
      <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col gap-4 px-4 py-6">
        <PageHeader
          backHref="/choose-category"
          backLabel="Back to Categories"
          title={label}
          subtitle="Choose your learning level"
          gradientClass="from-blue-600 via-violet-600 to-fuchsia-600"
        />

        <div className="space-y-4">
          {mappedLevels.map((level) => (
            <Link
              key={level.title}
              href={`/category/${slug}?level=${encodeURIComponent(level.title.toLowerCase())}`}
              className="block overflow-hidden rounded-[1.75rem] bg-white p-4 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)] transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-3xl ${level.color}`}>
                  <span className="text-xl">{level.icon}</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-950">{level.title}</p>
                  <p className="text-xs text-slate-500">{level.subtitle}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {level.count > 0
                      ? `${level.count} item${level.count > 1 ? 's' : ''} · ${level.pages} page${level.pages !== 1 ? 's' : ''}`
                      : 'No content yet'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
