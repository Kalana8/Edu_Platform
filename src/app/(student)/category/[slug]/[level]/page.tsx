import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";

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
    notFound();
  }

  redirect(`/read/${content.id}`);
}
