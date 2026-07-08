import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

const LEVEL_LABELS: Record<string, { title: string; subtitle: string; color: string; icon: string }> = {
  "essential": {
    title: "Essential",
    subtitle: "Foundation Level",
    color: "bg-emerald-100 text-emerald-700",
    icon: "📗",
  },
  "intermediate": {
    title: "Intermediate",
    subtitle: "Building Level",
    color: "bg-sky-100 text-sky-700",
    icon: "🎓",
  },
  "advanced": {
    title: "Advanced",
    subtitle: "Mastery Level",
    color: "bg-fuchsia-100 text-fuchsia-700",
    icon: "🏆",
  },
};

export default async function CategoryLevelPage({
  params,
}: {
  params: Promise<{ slug: string; level: string }>;
}) {
  const { slug, level } = await params;
  const supabase = createAdminClient();

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, slug, icon, code, status")
    .eq("slug", slug)
    .maybeSingle();

  if (categoryError || !category) {
    notFound();
  }

  const normalizedLevel =
    level.toLowerCase() === "intermediate"
      ? "Intermediate"
      : level.toLowerCase() === "advanced"
        ? "Advanced"
        : "Essential";

  const { data: content, error: contentError } = await supabase
    .from("content")
    .select("id")
    .eq("category_id", category.id)
    .eq("level", normalizedLevel)
    .eq("is_published", true)
    .order("created_at", { ascending: true })
    .maybeSingle();

  if (contentError) {
    console.error("Category level content fetch error:", contentError);
  }

  if (!content) {
    const levelInfo = LEVEL_LABELS[level.toLowerCase()] ?? LEVEL_LABELS.essential;

    return (
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col px-4 py-6">
          <PageHeader
            backHref={`/category/${slug}`}
            backLabel="Back to Levels"
            title={levelInfo.title}
            subtitle={levelInfo.subtitle}
            gradientClass="from-blue-600 via-violet-600 to-fuchsia-600"
            rounded={false}
            className="-mx-4 -mt-6"
          />

          <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-4 rounded-[1.75rem] bg-white p-6 text-center shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-3xl">
              {levelInfo.icon}
            </div>
            <h2 className="text-xl font-semibold text-slate-950">No content yet</h2>
            <p className="text-sm text-slate-500">
              There are no published reading materials for this level right now. Please check back later.
            </p>
            <Link
              href="/choose-category"
              className="mt-2 w-full rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Back to Categories
            </Link>
          </div>
        </main>
      </div>
    );
  }

  redirect(`/read/${content.id}`);
}
