import type { createAdminClient } from "@/lib/supabase/admin";
import { slugToLabel } from "@/lib/slug";

export type StudentCourse = {
  contentId: string;
  title: string;
  level: string;
  icon: string;
  percent: number;
  pagesRead: number;
  pageCount: number;
};

type SupabaseError = { message?: string; code?: string; details?: string; hint?: string } | null;

function logError(label: string, error: SupabaseError) {
  if (!error) return;
  console.error(label, { message: error.message, code: error.code, details: error.details, hint: error.hint });
}

/**
 * The courses a student has started, with their reading progress.
 * Uses plain queries (no embedded joins, which depend on the live DB's foreign keys).
 */
export async function getStudentCourses(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<{ courses: StudentCourse[]; totalPagesRead: number }> {
  const { data: progressItems, error: progressError } = await supabase
    .from("reading_progress")
    .select("content_id, pages_read, is_completed")
    .eq("user_id", userId);

  if (progressError) {
    logError("Reading progress fetch error:", progressError);
    return { courses: [], totalPagesRead: 0 };
  }
  if (!progressItems || progressItems.length === 0) {
    return { courses: [], totalPagesRead: 0 };
  }

  const totalPagesRead = progressItems.reduce((sum, p) => sum + (p.pages_read ?? 0), 0);

  const contentIds = [...new Set(progressItems.map((p) => p.content_id))];
  const { data: contentRows, error: contentError } = await supabase
    .from("content")
    .select("id, category_id, level, page_count")
    .in("id", contentIds);
  logError("Course content fetch error:", contentError);

  const categoryIds = [...new Set((contentRows ?? []).map((c) => c.category_id).filter(Boolean))];
  const { data: categoryRows, error: categoryError } = categoryIds.length
    ? await supabase.from("categories").select("id, slug, label, icon").in("id", categoryIds)
    : { data: [], error: null };
  logError("Course category fetch error:", categoryError);

  const contentById = new Map((contentRows ?? []).map((c) => [c.id, c]));
  const categoryById = new Map((categoryRows ?? []).map((c) => [c.id, c]));

  const courses = progressItems.map((p) => {
    const content = contentById.get(p.content_id);
    const category = content ? categoryById.get(content.category_id) : undefined;
    const pageCount = content?.page_count ?? 0;
    const pagesRead = p.pages_read ?? 0;
    const percent = p.is_completed ? 100 : pageCount > 0 ? (pagesRead / pageCount) * 100 : 0;
    return {
      contentId: p.content_id,
      title: category?.label || slugToLabel(category?.slug) || "Course",
      level: content?.level ?? "",
      icon: category?.icon || "📚",
      percent,
      pagesRead,
      pageCount,
    };
  });

  return { courses, totalPagesRead };
}
