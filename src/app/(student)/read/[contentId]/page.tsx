"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

type PageData = {
  id: string;
  page_number: number;
  title: string;
  content: string;
};

type ReadingState = {
  contentId: string;
  title: string;
  level: string;
  totalPages: number;
  pagesRead: number;
};

export default function ReadingPage() {
  const router = useRouter();
  const params = useParams();
  const contentId = params.contentId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingState, setReadingState] = useState<ReadingState | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pagesReadThisSession, setPagesReadThisSession] = useState(0);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [contentRes, progressRes, pagesRes] = await Promise.all([
        fetch(`/api/content/${contentId}`),
        fetch(`/api/student/reading-progress?contentId=${contentId}`),
        fetch(`/api/content/${contentId}/pages`),
      ]);

      if (contentRes.status === 401 || progressRes.status === 401 || pagesRes.status === 401) {
        router.replace("/");
        return;
      }

      if (!contentRes.ok) throw new Error("Content not found");
      if (!progressRes.ok) throw new Error("Failed to load reading progress");
      if (!pagesRes.ok) throw new Error("Failed to load pages");

      const contentData = await contentRes.json();
      const progressData = await progressRes.json();
      const pagesData = await pagesRes.json();

      const totalPages = pagesData.pages?.length || 0;
      const pagesRead = progressData.progress?.pages_read || 0;

      setReadingState({
        contentId,
        title: contentData.content?.title || "Reading",
        level: contentData.content?.level || "",
        totalPages,
        pagesRead,
      });

      setPages(pagesData.pages || []);
      const nextIndex = Math.min(pagesRead, totalPages - 1);
      setCurrentPageIndex(Math.max(nextIndex, 0));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reading material.");
    } finally {
      setLoading(false);
    }
  }, [contentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateProgress = async (increment: number) => {
    setSaving(true);
    try {
      const res = await fetch("/api/student/reading-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId,
          pagesReadIncrement: increment,
        }),
      });

      if (!res.ok) throw new Error("Failed to update progress");
      const data = await res.json();

      setReadingState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          pagesRead: data.pages_read,
        };
      });
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const goNext = async () => {
    if (!readingState || pages.length === 0) return;

    const isLastPage = currentPageIndex >= pages.length - 1;
    const newCount = pagesReadThisSession + 1;
    setPagesReadThisSession(newCount);

    await updateProgress(1);

    if (isLastPage) {
      if (pages.length >= 2 && newCount >= 2) {
        router.push(`/quiz/${contentId}`);
      }
      return;
    }

    if (newCount >= 2) {
      router.push(`/quiz/${contentId}`);
    } else {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        <p className="text-sm font-medium animate-pulse">Loading reading material…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4">
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
        <Link href="/choose-category" className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]">
          Back to Categories
        </Link>
      </div>
    );
  }

  if (!readingState || pages.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4">
        <p className="text-sm text-slate-600">No pages available for this content yet.</p>
        <Link href="/choose-category" className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]">
          Back to Categories
        </Link>
      </div>
    );
  }

  const allPagesRead =
    !!readingState &&
    readingState.totalPages > 0 &&
    readingState.pagesRead >= readingState.totalPages;

  if (allPagesRead) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <main className="mx-auto flex min-h-screen w-full max-w-[450px] flex-col items-center justify-center gap-6 px-4">
          <div className="w-full rounded-[1.75rem] border border-slate-200/80 bg-white p-8 text-center shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-blue-500 text-3xl text-white shadow-lg shadow-emerald-500/20">✅</div>
            <h2 className="mt-5 text-xl font-bold text-slate-950 tracking-tight">You&apos;ve finished this content!</h2>
            <p className="mt-2 text-sm text-slate-500">
              You have read all {readingState.totalPages} pages. Review with a quiz or pick another topic.
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push("/choose-category")}
                className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
              >
                Back to Categories
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4">
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
        <Link href="/choose-category" className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]">
          Back to Categories
        </Link>
      </div>
    );
  }

  if (!readingState || pages.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4">
        <p className="text-sm text-slate-600">No pages available for this content yet.</p>
        <Link href="/choose-category" className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]">
          Back to Categories
        </Link>
      </div>
    );
  }

  const currentPage = pages[currentPageIndex];
  const progressPercent = readingState.totalPages > 0 ? ((readingState.pagesRead) / readingState.totalPages) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <main className="mx-auto flex min-h-screen w-full max-w-[450px] flex-col">
        <PageHeader
          backHref="/choose-category"
          backLabel="Back to Categories"
          title={readingState.title}
          subtitle={`${readingState.level} · Page ${currentPageIndex + 1} of ${readingState.totalPages}`}
          gradientClass="from-blue-600 via-violet-600 to-fuchsia-600"
          rounded={false}
        />

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <div className="sticky top-0 z-10 bg-slate-50 pb-3 pt-2">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200 shadow-inner">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600 transition-all duration-300" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
            <h2 className="text-xl font-semibold text-slate-950 tracking-tight">{currentPage.title}</h2>
            <div className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">{currentPage.content}</div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur-lg">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-500">
              {pagesReadThisSession}/2 read this session
            </span>
            <button
              onClick={goNext}
              disabled={saving}
              className="rounded-3xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95 disabled:opacity-40 disabled:active:scale-100"
            >
              {currentPageIndex >= pages.length - 1
                ? (pages.length >= 2 ? "Take Quiz" : "Finish")
                : "Next"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
