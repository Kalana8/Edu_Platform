"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import BottomBar from "@/components/BottomBar";
import { slugToLabel } from "@/lib/slug";

type CategoryItem = {
  slug: string;
  code: string;
  icon: string;
  status: string;
  label: string;
  color: string;
};

export default function ChooseCategoryPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load categories.");
        }

        const mapped: CategoryItem[] = (payload.categories ?? [])
          .filter((category: { status: string }) => category.status === "Active")
          .map((category: { slug: string; code: string; icon: string; status: string; label?: string }) => ({
            slug: category.slug,
            label: category.label ?? slugToLabel(category.slug),
            icon: category.icon || "📚",
            color: getColorForSlug(category.slug),
            status: category.status,
          }));

        setCategories(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load categories.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadCategories();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 pb-24">
      <main className="mx-auto flex min-h-screen w-full max-w-[450px] flex-col gap-2 px-4 py-6">
        <PageHeader title="Choose Your Category" subtitle="Select a subject to begin reading" gradientClass="from-blue-600 via-violet-600 to-fuchsia-600" rounded={false} className="-mx-4 -mt-6" />

        {error ? (
          <div className="rounded-[1.75rem] bg-rose-50 p-5 text-sm text-rose-700 shadow-sm border border-rose-100">{error}</div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 px-3 mt-5">
          {isLoading ? (
            <div className="col-span-2 rounded-[1.75rem] bg-white p-6 text-center text-sm text-slate-500 shadow-sm">Loading categories…</div>
          ) : categories.length === 0 ? (
            <div className="col-span-2 rounded-[1.75rem] bg-white p-6 text-center text-sm text-slate-500 shadow-sm">No categories available yet.</div>
          ) : (
            categories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className={`flex items-center justify-center rounded-lg p-4  transition group-hover:scale-105 `}>
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <p className="mt-4 text-center text-sm font-semibold text-slate-950">{category.label}</p>
              </Link>
            ))
          )}
        </div>
      </main>
      <BottomBar />
    </div>
  );
}

function getColorForSlug(slug: string): string {
  const colors: Record<string, string> = {
    "artificial-intelligence": "bg-violet-100 text-violet-700",
    "innovation-design": "bg-amber-100 text-amber-700",
    "personal-development": "bg-rose-100 text-rose-700",
    "entrepreneurship": "bg-emerald-100 text-emerald-700",
    "economics": "bg-emerald-100 text-emerald-700",
    "science-discovery": "bg-cyan-100 text-cyan-700",
    "manufacturing": "bg-slate-100 text-slate-700",
    "history-society": "bg-fuchsia-100 text-fuchsia-700",
  };

  return colors[slug] || "bg-blue-100 text-blue-700";
}
