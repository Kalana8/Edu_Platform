"use client";

import { useEffect, useState, type FormEvent } from "react";
import { slugToLabel } from "@/lib/slug";
import EmojiPicker from "./EmojiPicker";
import {
  AdminPageHeader,
  HeaderButton,
  RowAction,
  RowActions,
  StatusBadge,
  TableCard,
  TableMessage,
  TableTitle,
  tableClass,
} from "./AdminUI";

const categoryBadgeClass = (status: CategoryItem["status"]) =>
  status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700";

export type CategoryItem = {
  slug: string;
  code: string;
  label: string;
  icon: string;
  status: "Active" | "Inactive";
  description?: string;
  badgeClass: string;
};

interface CategoryPageProps {
  role?: "Admin" | "Moderator";
  basePath?: string;
}

type CategoryFormState = {
  label: string;
  code: string;
  icon: string;
  status: CategoryItem["status"];
};

const emptyFormState: CategoryFormState = {
  label: "",
  code: "",
  icon: "📚",
  status: "Active",
};

export default function CategoryPage({ role = "Admin", basePath = "/admin" }: CategoryPageProps) {
  void basePath;

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null);
  const [formState, setFormState] = useState<CategoryFormState>(emptyFormState);
  const [editFormState, setEditFormState] = useState<CategoryFormState>(emptyFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load categories.");
        }

        const nextCategories = (payload.categories ?? []).map((category: Partial<CategoryItem> & { slug: string; code: string; icon: string; status: CategoryItem["status"] }) => ({
          slug: category.slug,
          code: category.code,
          label: category.label ?? slugToLabel(category.slug),
          icon: category.icon,
          status: category.status,
          description: category.description ?? "",
          badgeClass: categoryBadgeClass(category.status),
        }));

        setCategories(nextCategories);
      } catch (error) {
        setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to load categories." });
      } finally {
        setIsLoading(false);
      }
    };

    void loadCategories();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.label.trim() || !formState.code.trim()) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: formState.label.trim(),
          code: formState.code.trim(),
          icon: formState.icon.trim(),
          status: formState.status,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to save category.");
      }

      if (payload.pendingApproval) {
        setFormState(emptyFormState);
        setIsModalOpen(false);
        setFeedback({ type: "success", message: payload.message || "Request submitted for approval." });
        return;
      }

      const category = payload.category as CategoryItem;
      const newCategory: CategoryItem = {
        slug: category.slug,
        code: category.code,
        label: category.label,
        icon: category.icon,
        status: category.status,
        description: category.description,
        badgeClass: categoryBadgeClass(category.status),
      };

      setCategories((current) => [newCategory, ...current]);
      setFormState(emptyFormState);
      setIsModalOpen(false);
      setFeedback({ type: "success", message: `${category.label} was added successfully.` });
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to save category." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openViewModal = (category: CategoryItem) => {
    setSelectedCategory(category);
  };

  const openEditModal = (category: CategoryItem) => {
    setEditingCategory(category);
    setEditFormState({
      label: category.label,
      code: category.code,
      icon: category.icon,
      status: category.status,
    });
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingCategory || !editFormState.label.trim() || !editFormState.code.trim()) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/categories", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: editingCategory.slug,
          label: editFormState.label.trim(),
          code: editFormState.code.trim(),
          icon: editFormState.icon.trim(),
          status: editFormState.status,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to update category.");
      }

      if (payload.pendingApproval) {
        setEditingCategory(null);
        setEditFormState(emptyFormState);
        setFeedback({ type: "success", message: payload.message || "Request submitted for approval." });
        return;
      }

      const updatedCategory = payload.category as CategoryItem;
      const nextCategory: CategoryItem = {
        slug: updatedCategory.slug,
        code: updatedCategory.code,
        label: updatedCategory.label,
        icon: updatedCategory.icon,
        status: updatedCategory.status,
        description: updatedCategory.description,
        badgeClass: categoryBadgeClass(updatedCategory.status),
      };

      setCategories((current) => current.map((category) => (category.slug === editingCategory.slug ? nextCategory : category)));
      setEditingCategory(null);
      setEditFormState(emptyFormState);
      setFeedback({ type: "success", message: `${nextCategory.label} was updated successfully.` });
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to update category." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category: CategoryItem) => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/categories", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug: category.slug }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to delete category.");
      }

      if (payload.pendingApproval) {
        setDeletingCategory(null);
        setFeedback({ type: "success", message: payload.message || "Request submitted for approval." });
        return;
      }

      setCategories((current) => current.filter((item) => item.slug !== category.slug));
      setDeletingCategory(null);
      setFeedback({ type: "success", message: `${category.label} was deleted successfully.` });
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to delete category." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="text-slate-950">
      <div className="mx-auto max-w-7xl px-1 py-1 sm:px-2">
        <AdminPageHeader
          title="Manage curriculum categories"
          description={`View categories, manage status, and access content tiers for ${role.toLowerCase()} workflows.`}
          action={<HeaderButton onClick={() => setIsModalOpen(true)}>Add Category</HeaderButton>}
        />

        {feedback ? (
          <div className={`mb-3 rounded-2xl border px-4 py-2.5 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
            {feedback.message}
          </div>
        ) : null}

        <TableCard toolbar={<TableTitle title="All categories" count={isLoading ? undefined : categories.length} />}>
          {isLoading ? (
            <TableMessage>Loading categories…</TableMessage>
          ) : (
          <table className={tableClass.table}>
            <thead className={tableClass.thead}>
              <tr>
                <th scope="col" className={tableClass.th}>Category</th>
                <th scope="col" className={tableClass.th}>Code</th>
                <th scope="col" className={tableClass.th}>Status</th>
                <th scope="col" className={tableClass.thRight}>Actions</th>
              </tr>
            </thead>
            <tbody className={tableClass.tbody}>
              {categories.length === 0 ? (
                <TableMessage colSpan={4}>No categories yet. Add one to get started.</TableMessage>
              ) : categories.map((category) => (
                <tr key={category.slug} className={tableClass.tr}>
                  <td className={tableClass.td}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-tint">
                        <span className="text-base">{category.icon}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{category.label}</div>
                        <div className="text-xs text-slate-500">{category.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className={tableClass.td}>
                    <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">{category.code}</span>
                  </td>
                  <td className={tableClass.td}>
                    <StatusBadge active={category.status === "Active"} />
                  </td>
                  <td className={tableClass.tdRight}>
                    <RowActions>
                      <RowAction variant="view" onClick={() => openViewModal(category)} />
                      <RowAction variant="edit" onClick={() => openEditModal(category)} />
                      <RowAction variant="delete" onClick={() => setDeletingCategory(category)} />
                    </RowActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </TableCard>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-xl rounded-4xl bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">New category</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">Add a curriculum category</h2>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">✕</button>
            </div>

            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-1.5 block">Category name</span>
                  <input
                    value={formState.label}
                    onChange={(event) => setFormState((current) => ({ ...current, label: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    placeholder="e.g. Climate Science"
                    required
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-1.5 block">Category code</span>
                  <input
                    value={formState.code}
                    onChange={(event) => setFormState((current) => ({ ...current, code: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    placeholder="e.g. CAT-009"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <EmojiPicker
                  value={formState.icon}
                  onChange={(icon) => setFormState((current) => ({ ...current, icon }))}
                  label="Icon"
                />
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-1.5 block">Status</span>
                  <select
                    value={formState.status}
                    onChange={(event) => setFormState((current) => ({ ...current, status: event.target.value as CategoryItem["status"] }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400">{isSubmitting ? "Saving..." : "Save category"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {selectedCategory ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4" onClick={() => setSelectedCategory(null)}>
          <div className="w-full max-w-xl rounded-4xl bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Category details</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">{selectedCategory.label}</h2>
              </div>
              <button type="button" onClick={() => setSelectedCategory(null)} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">✕</button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Code</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{selectedCategory.code}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Status</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{selectedCategory.status}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Icon</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selectedCategory.icon}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Slug</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selectedCategory.slug}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {deletingCategory ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4" onClick={() => setDeletingCategory(null)}>
          <div className="w-full max-w-md rounded-4xl bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Confirm delete</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">Delete {deletingCategory.label}?</h2>
              </div>
              <button type="button" onClick={() => setDeletingCategory(null)} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">✕</button>
            </div>

            <p className="mt-3 text-sm text-slate-600">
              This action will remove the category from the database. This cannot be undone.
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setDeletingCategory(null)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={() => handleDelete(deletingCategory)} disabled={isSubmitting} className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-400">{isSubmitting ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      ) : null}

      {editingCategory ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4" onClick={() => setEditingCategory(null)}>
          <div className="w-full max-w-xl rounded-4xl bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Edit category</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">{editingCategory.label}</h2>
              </div>
              <button type="button" onClick={() => setEditingCategory(null)} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">✕</button>
            </div>

            <form className="mt-4 space-y-3" onSubmit={handleEditSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-1.5 block">Category name</span>
                  <input
                    value={editFormState.label}
                    onChange={(event) => setEditFormState((current) => ({ ...current, label: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    required
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-1.5 block">Category code</span>
                  <input
                    value={editFormState.code}
                    onChange={(event) => setEditFormState((current) => ({ ...current, code: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <EmojiPicker
                  value={editFormState.icon}
                  onChange={(icon) => setEditFormState((current) => ({ ...current, icon }))}
                  label="Icon"
                />
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-1.5 block">Status</span>
                  <select
                    value={editFormState.status}
                    onChange={(event) => setEditFormState((current) => ({ ...current, status: event.target.value as CategoryItem["status"] }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setEditingCategory(null)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400">{isSubmitting ? "Saving..." : "Save changes"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
