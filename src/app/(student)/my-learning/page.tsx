import Link from "next/link";
import { redirect } from "next/navigation";
import BottomBar from "@/components/BottomBar";
import PageHeader from "@/components/PageHeader";
import { getSessionUser } from "@/lib/auth";
import { getStudentCourses, type StudentCourse } from "@/lib/student/courses";
import { createAdminClient } from "@/lib/supabase/admin";
import { titleCase } from "@/lib/titleCase";

export default async function MyLearningPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "student") {
    redirect("/");
  }

  const { courses } = await getStudentCourses(createAdminClient(), user.id);
  const inProgress = courses.filter((c) => c.percent < 100);
  const completed = courses.filter((c) => c.percent >= 100);

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-950">
      <main className="mx-auto flex min-h-screen w-full max-w-[450px] flex-col">
        <PageHeader title="My Learning" rounded={false} />

        <div className="flex flex-col gap-5 px-4 py-4">
          {courses.length === 0 ? (
            <Link
              href="/choose-category"
              className="flex flex-col items-center gap-2 rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/70"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-tint text-brand">
                <BookIcon className="h-7 w-7" />
              </span>
              <p className="font-semibold">No courses yet</p>
              <p className="text-sm text-slate-500">Pick a category to start your first course.</p>
            </Link>
          ) : (
            <>
              <CourseSection title="In Progress" courses={inProgress} empty="Nothing in progress. Pick a new category to keep going." />
              <CourseSection title="Completed" courses={completed} empty="Courses you finish will appear here." />
            </>
          )}
        </div>
      </main>
      <BottomBar />
    </div>
  );
}

function CourseSection({ title, courses, empty }: { title: string; courses: StudentCourse[]; empty: string }) {
  return (
    <section>
      <h2 className="mb-2 flex items-center gap-2 px-1 text-[11px] font-semibold text-slate-500">
        {titleCase(title)}
        <span className="rounded-full bg-brand-tint px-2 py-0.5 text-[10px] text-brand">{courses.length}</span>
      </h2>
      {courses.length === 0 ? (
        <p className="rounded-2xl bg-white px-4 py-4 text-center text-sm text-slate-500 ring-1 ring-slate-200/70">{empty}</p>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
          {courses.map((c) => (
            <li key={c.contentId}>
              <Link href={`/read/${c.contentId}`} className="flex items-center gap-3 px-4 py-3 transition hover:bg-blue-50/50">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand">
                  <BookIcon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-900">{c.title}</span>
                  <span className="mt-1.5 flex items-center gap-2">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <span
                        className={`block h-full rounded-full ${c.percent >= 100 ? "bg-emerald-500" : "bg-brand"}`}
                        style={{ width: `${Math.min(100, Math.round(c.percent))}%` }}
                      />
                    </span>
                    <span className="shrink-0 text-[11px] text-slate-500">
                      {c.percent >= 100 ? "Completed" : `${Math.round(c.percent)}%`}
                      {c.level && ` · ${c.level}`}
                    </span>
                  </span>
                </span>
                <svg className="h-4 w-4 shrink-0 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function BookIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
      <path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
