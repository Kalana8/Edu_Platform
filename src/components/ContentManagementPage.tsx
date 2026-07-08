"use client";

import { useEffect, useState, type FormEvent } from "react";
import { slugToLabel } from "@/lib/slug";

export type CategoryItem = {
  id: string;
  slug: string;
  code: string;
  label: string;
  icon: string;
  status: "Active" | "Inactive";
};

export type ContentItem = {
  id: string;
  category_id: string;
  level: "Essential" | "Intermediate" | "Advanced";
  description: string;
  page_count: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  pages: Array<{ page_number: number; title: string; content: string }>;
};

const levelOptions = ["Essential", "Intermediate", "Advanced"] as const;

export default function ContentManagementPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingContents, setLoadingContents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);

  const blankForm = {
    level: "Essential" as "Essential" | "Intermediate" | "Advanced",
    description: "",
    pages: [{ title: "", content: "" }] as Array<{ title: string; content: string }>,
    is_published: true,
  };

  const [form, setForm] = useState<{
    level: "Essential" | "Intermediate" | "Advanced";
    description: string;
    pages: Array<{ title: string; content: string }>;
    is_published: boolean;
  }>(blankForm);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch("/api/categories");
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Unable to load categories.");
        }
        const mapped: CategoryItem[] = (payload.categories ?? []).map((category: any) => ({
          id: category.id,
          slug: category.slug,
          code: category.code,
          label: category.label ?? slugToLabel(category.slug),
          icon: category.icon,
          status: category.status,
        }));
        setCategories(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load categories.");
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setContents([]);
      return;
    }
    const categoryId = selectedCategory.id;
    async function loadContents() {
      setLoadingContents(true);
      setError(null);
      try {
        const response = await fetch(`/api/content?category_id=${categoryId}`);
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Unable to load content.");
        }
        setContents(payload.content ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load content.");
      } finally {
        setLoadingContents(false);
      }
    }
    loadContents();
  }, [selectedCategory]);

  const handleSelectCategory = (category: CategoryItem) => {
    setSelectedCategory(category);
    setEditingContent(null);
    setForm(blankForm);
    setError(null);
    setSuccess(null);
  };

  const updatePage = (index: number, field: "title" | "content", value: string) => {
    setForm((current) => {
      const next = [...current.pages];
      next[index] = { ...next[index], [field]: value };
      return { ...current, pages: next };
    });
  };

  const addPage = () => {
    setForm((current) => ({ ...current, pages: [...current.pages, { title: "", content: "" }] }));
  };

  const removePage = (index: number) => {
    setForm((current) => {
      const next = current.pages.filter((_, i) => i !== index);
      return { ...current, pages: next.length ? next : [{ title: "", content: "" }] };
    });
  };

  const movePage = (index: number, direction: "up" | "down") => {
    setForm((current) => {
      const next = [...current.pages];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...current, pages: next };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    const trimmedPages = form.pages
      .map((page) => ({ title: page.title.trim(), content: page.content.trim() }))
      .filter((page) => page.content !== "");
    if (trimmedPages.length === 0) {
      setError("At least one non-empty page is required.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const isEdit = !!editingContent;
      const url = "/api/content";
      const method = isEdit ? "PUT" : "POST";
      const body = isEdit
        ? { id: editingContent.id, ...form, pages: trimmedPages }
        : { category_id: selectedCategory.id, ...form, pages: trimmedPages };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to save content.");
      }

      setSuccess(
        isEdit
          ? "Content updated successfully."
          : payload.pendingApproval
          ? "Content creation submitted for admin approval."
          : "Content created successfully."
      );

      if (!payload.pendingApproval) {
        setForm(blankForm);
        setEditingContent(null);
        const updatedResponse = await fetch(`/api/content?category_id=${selectedCategory.id}`);
        const updatedPayload = await updatedResponse.json();
        if (updatedResponse.ok) {
          setContents(updatedPayload.content ?? []);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save content.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: ContentItem) => {
    setEditingContent(item);
    setForm({
      level: item.level,
      description: item.description,
      pages: item.pages.map((p) => ({ title: p.title, content: p.content })),
      is_published: item.is_published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content?")) return;

    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/content", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to delete content.");
      }

      setSuccess(
        payload.pendingApproval
          ? "Deletion submitted for admin approval."
          : "Content deleted successfully."
      );

      if (selectedCategory && !payload.pendingApproval) {
        const updatedResponse = await fetch(`/api/content?category_id=${selectedCategory.id}`);
        const updatedPayload = await updatedResponse.json();
        if (updatedResponse.ok) {
          setContents(updatedPayload.content ?? []);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete content.");
    }
  };

  const handleCancelEdit = () => {
    setEditingContent(null);
    setForm(blankForm);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-[2rem] bg-white px-6 py-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Content Management</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Add and manage reading content for each category and tier</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Select a category from the left to manage its content and page listings.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-[1.75rem] bg-red-50 px-6 py-4 text-sm text-red-600">{error}</div>
        )}
        {success && (
          <div className="mb-6 rounded-[1.75rem] bg-emerald-50 px-6 py-4 text-sm text-emerald-700">{success}</div>
        )}

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="rounded-[2rem] bg-white p-6 shadow ring-1 ring-slate-200">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Categories</h2>
            {loadingCategories ? (
              <div className="px-6 py-10 text-center text-sm text-slate-500">Loading categories…</div>
            ) : categories.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-slate-500">No categories available yet.</div>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleSelectCategory(category)}
                    className={`flex w-full items-center justify-between gap-3 rounded-3xl border px-4 py-4 text-left transition ${
                      selectedCategory?.id === category.id
                        ? "border-blue-300 bg-white shadow-sm"
                        : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-3xl bg-slate-100 text-xl">
                        {category.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-950">{category.label}</div>
                        <div className="text-xs text-slate-500">{category.code}</div>
                      </div>
                    </div>
                    {category.status === "Active" && (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                        Active
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {!selectedCategory ? (
              <div className="rounded-[2rem] bg-white p-12 text-center shadow ring-1 ring-slate-200">
                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-slate-100 text-4xl">
                  📖
                </div>
                <h2 className="mt-8 text-xl font-semibold text-slate-950">Select a category</h2>
                <p className="mt-3 max-w-xl text-sm text-slate-500">
                  Choose a category from the left to manage its content and page listings.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-[2rem] bg-white p-6 shadow ring-1 ring-slate-200">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">
                        {selectedCategory.label}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                        {editingContent ? "Edit Content" : "Upload New Content"}
                      </h2>
                    </div>
                    {editingContent && (
                      <button
                        onClick={handleCancelEdit}
                        className="rounded-3xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Level</label>
                        <select
                          value={form.level}
                          onChange={(e) => setForm((current) => ({ ...current, level: e.target.value as any }))}
                          className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-blue-500"
                          required
                        >
                          {levelOptions.map((level) => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Status</label>
                        <label className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3">
                          <input
                            type="checkbox"
                            checked={form.is_published}
                            onChange={(e) =>
                              setForm((current) => ({ ...current, is_published: e.target.checked }))
                            }
                            className="h-4 w-4 rounded border-slate-300"
                          />
                          <span className="text-sm font-medium text-slate-700">Published</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Description</label>
                      <input
                        type="text"
                        value={form.description}
                        onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
                        className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-blue-500"
                        placeholder="Brief description for this level"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-slate-700">Pages</label>
                        <button
                          type="button"
                          onClick={addPage}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-slate-300"
                        >
                          + Add Page
                        </button>
                      </div>
                      <div className="space-y-3">
                        {form.pages.map((page, index) => (
                          <div key={index} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Page {index + 1}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => movePage(index, "up")}
                                  disabled={index === 0}
                                  className="rounded-full px-2 py-1 text-xs text-slate-500 disabled:opacity-40"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  onClick={() => movePage(index, "down")}
                                  disabled={index === form.pages.length - 1}
                                  className="rounded-full px-2 py-1 text-xs text-slate-500 disabled:opacity-40"
                                >
                                  ↓
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removePage(index)}
                                  disabled={form.pages.length === 1}
                                  className="rounded-full px-2 py-1 text-xs text-red-600 disabled:opacity-40"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                            <input
                              type="text"
                              value={page.title}
                              onChange={(e) => updatePage(index, "title", e.target.value)}
                              className="mb-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-950 outline-none focus:border-blue-500"
                              placeholder={`Page ${index + 1} title`}
                            />
                            <textarea
                              value={page.content}
                              onChange={(e) => updatePage(index, "content", e.target.value)}
                              rows={6}
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-blue-500"
                              placeholder={`Enter content for page ${index + 1}`}
                              required
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="rounded-3xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500 disabled:opacity-60"
                      >
                        {saving ? "Saving..." : editingContent ? "Update Content" : "Upload Content"}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="rounded-[2rem] bg-white p-6 shadow ring-1 ring-slate-200">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">
                    Existing Content ({contents.length})
                  </h3>
                  {loadingContents ? (
                    <div className="px-6 py-10 text-center text-sm text-slate-500">Loading content…</div>
                  ) : contents.length === 0 ? (
                    <div className="px-6 py-10 text-center text-sm text-slate-500">
                      No content added yet for this category.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {contents.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                                    item.level === "Essential"
                                      ? "bg-sky-100 text-sky-700"
                                      : item.level === "Intermediate"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-rose-100 text-rose-700"
                                  }`}
                                >
                                  {item.level}
                                </span>
                                {item.is_published ? (
                                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                                    Published
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-slate-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                                    Draft
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                              )}
                              <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                                <span>{item.pages.length} pages</span>
                                <span>Updated {new Date(item.updated_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:border-slate-300"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="rounded-2xl border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 hover:border-red-300"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
