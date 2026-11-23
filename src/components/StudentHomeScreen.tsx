import Link from "next/link";
import { redirect } from "next/navigation";
import BottomBar from "@/components/BottomBar";
import ProgressRing from "@/components/ProgressRing";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugToLabel } from "@/lib/slug";
import { cookies } from "next/headers";

async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionUserStr = cookieStore.get("session_user")?.value;
  if (!sessionUserStr) return null;
  try {
    return JSON.parse(sessionUserStr);
  } catch {
    return null;
  }
}

type CourseCard = {
  contentId: string;
  title: string;
  level: string;
  icon: string;
  percent: number;
};

type SupabaseError = { message?: string; code?: string; details?: string; hint?: string } | null;

// Soft tiles for course thumbnails, drawn from the palette.
const TILE_COLORS = ["bg-brand-soft/60", "bg-brand-tint", "bg-blue-100", "bg-slate-100"];

function logError(label: string, error: SupabaseError) {
  if (!error) return;
  console.error(label, {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

export default async function StudentHomeScreen() {
  const user = await getSessionUser();

  if (!user || user.role !== "student") {
    redirect("/");
  }

  const supabase = createAdminClient();

  let studentName = "";
  let availableCredits = 0;
  let withheldCredits = 0;
  let totalPagesRead = 0;
  let courses: CourseCard[] = [];

  const [{ data: student, error: studentError }, { data: progressItems, error: progressError }] = await Promise.all([
    supabase
      .from("students")
      .select("name, available_credits, withheld_credits")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("reading_progress")
      .select("content_id, pages_read, is_completed")
      .eq("user_id", user.id),
  ]);

  if (studentError) {
    logError("Student fetch error:", studentError);
  } else if (student) {
    studentName = student.name ?? "";
    availableCredits = student.available_credits ?? 0;
    withheldCredits = student.withheld_credits ?? 0;
  }

  if (progressError) {
    logError("Reading progress fetch error:", progressError);
  } else if (progressItems && progressItems.length > 0) {
    totalPagesRead = progressItems.reduce((sum, p) => sum + (p.pages_read ?? 0), 0);

    // Look up the content and category for each progress row with plain queries
    // (no embedded joins, which depend on the live DB's foreign keys).
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

    courses = progressItems.map((p) => {
      const content = contentById.get(p.content_id);
      const category = content ? categoryById.get(content.category_id) : undefined;
      const pageCount = content?.page_count ?? 0;
      const percent = p.is_completed ? 100 : pageCount > 0 ? ((p.pages_read ?? 0) / pageCount) * 100 : 0;
      return {
        contentId: p.content_id,
        title: category?.label || slugToLabel(category?.slug) || "Course",
        level: content?.level ?? "",
        icon: category?.icon || "📚",
        percent,
      };
    });
  }

  const firstName = studentName.split(" ")[0];
  const initial = (studentName.trim()[0] ?? "S").toUpperCase();
  const continueCourse = courses.find((c) => c.percent < 100);

  return (
    <div className="min-h-screen bg-background text-slate-900">
      <main className="mx-auto flex w-full max-w-[450px] flex-col gap-6 px-5 pb-32 pt-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Hello{firstName ? `, ${firstName}` : ""} 👋</p>
            <h1 className="text-xl font-semibold">Let&apos;s keep learning</h1>
          </div>
          <Link
            href="/profile"
            aria-label="Profile"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-base font-semibold text-white shadow-md shadow-brand/30"
          >
            {initial}
          </Link>
        </header>

        {/* Search */}
        <Link
          href="/choose-category"
          className="flex items-center gap-3 rounded-full bg-white px-5 py-3.5 text-sm text-slate-400 shadow-sm ring-1 ring-slate-200/70 transition hover:ring-brand-soft"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          Search courses
        </Link>

        {/* Hero banner */}
        <section className="relative overflow-hidden rounded-[1.75rem] bg-brand p-6 text-white shadow-xl shadow-brand/25">
          <div aria-hidden className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
          <div aria-hidden className="absolute -bottom-16 left-10 h-36 w-36 rounded-full bg-brand-soft/20" />

          <div className="relative flex items-center gap-3">
            <HeroIllustration />
            <div className="flex-1">
              <h2 className="text-xl font-semibold leading-snug">What would you like to learn today?</h2>
              <Link
                href={continueCourse ? `/read/${continueCourse.contentId}` : "/choose-category"}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-brand transition hover:bg-blue-50"
              >
                {continueCourse ? "Continue reading" : "Start learning"} →
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-3">
          <Stat label="Credits" value={availableCredits} accent="text-brand" />
          <Stat label="Withheld" value={withheldCredits} accent="text-amber-600" />
          <Stat label="Pages read" value={totalPagesRead} accent="text-slate-900" />
        </section>

        {/* My courses */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">My Courses</h2>
            <Link href="/choose-category" className="text-xs font-medium text-brand">
              See all
            </Link>
          </div>

          {courses.length === 0 ? (
            <Link
              href="/choose-category"
              className="flex flex-col items-center gap-2 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/70"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-tint text-3xl">📚</span>
              <p className="font-semibold">No courses yet</p>
              <p className="text-sm text-slate-500">Pick a category to start your first course.</p>
            </Link>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {courses.map((course, i) => (
                <Link
                  key={course.contentId}
                  href={`/read/${course.contentId}`}
                  className="group flex flex-col rounded-3xl bg-white p-2.5 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div
                    className={`flex aspect-[4/3] items-center justify-center rounded-2xl text-5xl transition group-hover:scale-[1.02] ${TILE_COLORS[i % TILE_COLORS.length]}`}
                  >
                    {course.icon}
                  </div>
                  <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
                    {course.level && <p className="text-[11px] text-slate-400">{course.level}</p>}
                    <p className="line-clamp-2 text-sm font-semibold leading-snug">{course.title}</p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
                        <path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
                      </svg>
                      <ProgressRing value={course.percent} size={30} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <BottomBar />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-slate-200/70">
      <p className={`text-xl font-semibold ${accent}`}>{value}</p>
      <p className="mt-0.5 text-[11px] text-slate-500">{label}</p>
    </div>
  );
}

function HeroIllustration() {
  return (
    <svg viewBox="0 0 120 110" className="h-28 w-28 shrink-0" aria-hidden>
      {/* desk */}
      <rect x="8" y="88" width="104" height="6" rx="3" fill="#a0c3e2" />
      {/* books */}
      <rect x="14" y="72" width="34" height="8" rx="2" fill="#f8f8f6" />
      <rect x="17" y="64" width="30" height="8" rx="2" fill="#d7e0eb" />
      <rect x="12" y="80" width="38" height="8" rx="2" fill="#ffffff" />
      {/* laptop */}
      <rect x="56" y="50" width="46" height="32" rx="4" fill="#ffffff" />
      <rect x="60" y="54" width="38" height="24" rx="2" fill="#a0c3e2" />
      <rect x="64" y="59" width="18" height="3" rx="1.5" fill="#ffffff" />
      <rect x="64" y="65" width="26" height="3" rx="1.5" fill="#ffffff" opacity=".7" />
      <rect x="64" y="71" width="12" height="3" rx="1.5" fill="#ffffff" opacity=".7" />
      <path d="M50 82h58l-4 6H54z" fill="#d7e0eb" />
      {/* lightbulb */}
      <circle cx="32" cy="34" r="13" fill="#ffd66b" />
      <rect x="27" y="46" width="10" height="7" rx="2" fill="#f8f8f6" />
      <path d="M32 12v-6M14 20l-4-4M50 20l4-4M10 34H4M60 34h-6" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity=".8" />
      {/* graduation cap */}
      <path d="M82 18l18 8-18 8-18-8z" fill="#ffffff" />
      <path d="M72 30v7c0 3 20 3 20 0v-7l-10 4z" fill="#d7e0eb" />
    </svg>
  );
}
