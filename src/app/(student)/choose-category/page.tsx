"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import MobileLoader from "@/components/MobileLoader";
import BottomBar from "@/components/BottomBar";
import DiscoverEntryCard from "@/components/explore/DiscoverEntryCard";
import { slugToLabel } from "@/lib/slug";

type CategoryItem = {
  slug: string;
  icon: string;
  status: string;
  label: string;
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
        <PageHeader title="Choose Your Category" rounded={false} className="-mx-4 -mt-6" />

        <div className="mt-2">
          <DiscoverEntryCard />
        </div>

        {error ? (
          <div className="rounded-[1.75rem] bg-rose-50 p-5 text-sm text-rose-700 shadow-sm border border-rose-100">{error}</div>
        ) : null}

        <h2 className="mt-3 px-1 text-base font-semibold">All Categories</h2>

        <div className="grid grid-cols-2 gap-3">
          {isLoading ? (
            <MobileLoader label="Loading categories…" className="col-span-2 py-12" />
          ) : categories.length === 0 ? (
            <div className="col-span-2 rounded-3xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200/70">No categories available yet.</div>
          ) : (
            categories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="group flex flex-col items-center gap-1 rounded-2xl bg-white px-2 py-3 text-center shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span className="text-4xl leading-none transition group-hover:scale-105">{category.icon}</span>
                <p className="text-[13px] font-semibold leading-snug text-slate-900">{category.label}</p>
              </Link>
            ))
          )}
        </div>
      </main>
      <BottomBar />
    </div>
  );
}
