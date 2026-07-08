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
      router.push(`/quiz/${contentId}`);
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
        Loading reading material…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4">
        <p className="text-sm text-rose-600">{error}</p>
        <Link href="/choose-category" className="text-sm font-medium text-blue-600 underline">
          Back to Categories
        </Link>
      </div>
    );
  }

  if (!readingState || pages.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4">
        <p className="text-sm text-slate-600">No pages available for this content yet.</p>
        <Link href="/choose-category" className="text-sm font-medium text-blue-600 underline">
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
        <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col items-center justify-center gap-6 px-4">
          <div className="w-full rounded-[1.75rem] bg-white p-6 text-center shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-3xl">✅</div>
            <h2 className="mt-4 text-xl font-semibold text-slate-950">You&apos;ve finished this content!</h2>
            <p className="mt-1 text-sm text-slate-500">
              You have read all {readingState.totalPages} pages. Review with a quiz or pick another topic.
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push("/choose-category")}
                className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to Categories
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const currentPage = pages[currentPageIndex];
  const progressPercent = readingState.totalPages > 0 ? ((readingState.pagesRead) / readingState.totalPages) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col">
        <PageHeader
          backHref="/choose-category"
          backLabel="Back to Categories"
          title={readingState.title}
          subtitle={`${readingState.level} · Page ${currentPageIndex + 1} of ${readingState.totalPages}`}
          gradientClass="from-blue-600 via-violet-600 to-fuchsia-600"
          rounded={false}
        />

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
          </div>

          <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
            <h2 className="text-xl font-semibold text-slate-950">{currentPage.title}</h2>
            <div className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-700">
              {currentPage.content}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-slate-200 bg-white/80 px-4 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              {pagesReadThisSession}/2 read this session
            </span>
            <button
              onClick={goNext}
              disabled={saving}
              className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-40"
            >
              {currentPageIndex >= pages.length - 1 ? "Take Quiz" : "Next"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
