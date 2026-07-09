import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import BottomBar from "@/components/BottomBar";
import { notFound } from "next/navigation";
import { slugToLabel } from "@/lib/slug";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, slug, label, icon, code, status")
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

  const label = category.label ?? slugToLabel(category.slug);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 pb-24">
      <main className="mx-auto flex min-h-screen w-full max-w-[450px] flex-col gap-3 px-4 py-6">
        <PageHeader
          backHref="/choose-category"
          backLabel="Back to Categories"
          title={label}
          subtitle="Choose your learning level"
          gradientClass="from-blue-600 via-violet-600 to-fuchsia-600"
          rounded={false}
          className="-mx-4 -mt-6"
        />

        <div className="space-y-4">

          {mappedLevels.map((level, index) => (
            <Link
              key={level.title}
              href={`/category/${slug}/${level.title.toLowerCase()}`}
              className="group relative block overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
            >

              {/* Decorative background */}
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-50 opacity-70 transition group-hover:scale-150" />

              <div className="relative flex items-center gap-4">

                {/* Level Icon */}
                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl text-3xl transition-transform duration-300 group-hover:scale-110 ${level.color}`}
                >
                  {level.icon}
                </div>


                <div className="min-w-0 flex-1">

                  <div className="flex items-center justify-between">

                    <h3 className="text-lg font-bold text-slate-900">
                      {level.title}
                    </h3>


                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      Level {index + 1}
                    </div>

                  </div>


                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                    {level.subtitle}
                  </p>




                </div>


                {/* Arrow */}
                <div className="rounded-full p-2 text-slate-600 transition group-hover:bg-blue-600 group-hover:text-white">
                  →
                </div>


              </div>


            </Link>
          ))}

        </div>
      </main>
      <BottomBar />
    </div>
  );
}
