"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import BottomBar from "@/components/BottomBar";
import DiscoverEntryCard from "@/components/explore/DiscoverEntryCard";
import { slugToLabel } from "@/lib/slug";

type CategoryItem = {
  slug: string;
  icon: string;
  status: string;
  label: string;
};

// Soft tiles for category thumbnails, drawn from the palette.
const TILE_COLORS = ["bg-brand-soft/60", "bg-brand-tint", "bg-blue-100", "bg-slate-100"];

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
        <PageHeader title="Choose Your Category" subtitle="Select a subject to begin reading" rounded={false} className="-mx-4 -mt-6" />

        <div className="mt-2 px-3">
          <DiscoverEntryCard />
        </div>

        {error ? (
          <div className="rounded-[1.75rem] bg-rose-50 p-5 text-sm text-rose-700 shadow-sm border border-rose-100">{error}</div>
        ) : null}

        <h2 className="mt-4 px-3 text-lg font-semibold">All Categories</h2>

        <div className="grid grid-cols-2 gap-4 px-3">
          {isLoading ? (
            <div className="col-span-2 rounded-3xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200/70">Loading categories…</div>
          ) : categories.length === 0 ? (
            <div className="col-span-2 rounded-3xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200/70">No categories available yet.</div>
          ) : (
            categories.map((category, i) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="group flex flex-col rounded-3xl bg-white p-2.5 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className={`flex aspect-[4/3] items-center justify-center rounded-2xl text-5xl transition group-hover:scale-[1.02] ${TILE_COLORS[i % TILE_COLORS.length]}`}>
                  {category.icon}
                </div>
                <div className="px-1.5 pb-1 pt-3">
                  <p className="text-[11px] text-slate-400">Category</p>
                  <p className="text-sm font-semibold leading-snug text-slate-900">{category.label}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
      <BottomBar />
    </div>
  );
}
