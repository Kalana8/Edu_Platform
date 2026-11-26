import Link from "next/link";
import { redirect } from "next/navigation";
import BottomBar from "@/components/BottomBar";
import ProgressRing from "@/components/ProgressRing";
import Icon from "@/components/Icon";
import HomeSearchButton from "@/components/HomeSearchButton";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStudentCourses } from "@/lib/student/courses";
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

type SupabaseError = { message?: string; code?: string; details?: string; hint?: string } | null;

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

  const [{ data: student, error: studentError }, { courses, totalPagesRead }] = await Promise.all([
    supabase
      .from("students")
      .select("name")
      .eq("id", user.id)
      .maybeSingle(),
    getStudentCourses(supabase, user.id),
  ]);

  if (studentError) {
    logError("Student fetch error:", studentError);
  } else if (student) {
    studentName = student.name ?? "";
  }

  // A course earns its certificate once it is fully read.
  const certificatesEarned = courses.filter((c) => c.percent >= 100).length;
  const coursesInProgress = courses.length - certificatesEarned;

  // Sign-up saves "Student <number>" when no name is given; treat that as no name.
  const trimmedName = studentName.trim();
  const displayName = /^Student \S+$/.test(trimmedName) ? "" : trimmedName;
  const initial = (studentName.trim()[0] ?? "S").toUpperCase();

  return (
    <div className="min-h-screen bg-background text-slate-900">
      <main className="mx-auto flex w-full max-w-[450px] flex-col gap-3 px-5 pb-32 pt-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Hello{displayName ? `, ${displayName}` : ""}</p>
            <h1 className="text-xl font-semibold">Let&apos;s Keep Learning</h1>
          </div>
          <div className="flex items-center gap-2">
            <HomeSearchButton />
            <Link
              href="/profile"
              aria-label="Profile"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-base font-semibold text-white shadow-md shadow-brand/30"
            >
              {initial}
            </Link>
          </div>
        </header>

        {/* Hero banner */}
        <section className="relative overflow-hidden rounded-[1.75rem] bg-brand px-6 py-3 text-white shadow-xl shadow-brand/25">
          <div aria-hidden className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
          <div aria-hidden className="absolute -bottom-16 left-10 h-36 w-36 rounded-full bg-brand-soft/20" />

          <div className="relative flex items-center gap-3">
            <HeroIllustration />
            <h2 className="min-w-0 flex-1 whitespace-nowrap text-xl font-semibold leading-snug">Let's Explore</h2>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-3">
          <Stat label="Certificates" value={certificatesEarned} accent="text-brand" />
          <Stat label="In Progress" value={coursesInProgress} accent="text-amber-600" />
          <Stat label="Pages Read" value={totalPagesRead} accent="text-slate-900" />
        </section>

        {/* My courses */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">My Courses</h2>
            <Link href="/my-learning" className="text-xs font-medium text-brand">
              See All
            </Link>
          </div>

          {courses.length === 0 ? (
            <Link
              href="/choose-category"
              className="flex flex-col items-center gap-2 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/70"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-tint text-brand">
                <Icon name="book" className="h-8 w-8" />
              </span>
              <p className="font-semibold">No courses yet</p>
              <p className="text-sm text-slate-500">Pick a category to start your first course.</p>
            </Link>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {courses.map((course) => (
                <Link
                  key={course.contentId}
                  href={`/read/${course.contentId}`}
                  className="flex flex-col rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-2xl leading-none">{course.icon}</span>
                    <ProgressRing value={course.percent} size={26} />
                  </div>
                  <p className="mt-3 line-clamp-2 text-xs font-semibold leading-snug">{course.title}</p>
                  {course.level && <p className="mt-1 text-[10px] text-slate-400">{course.level}</p>}
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
