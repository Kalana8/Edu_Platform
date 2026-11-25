"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Avatar,
  HeaderButton,
  HeaderStat,
  Loader,
  RowAction,
  RowActions,
  SearchInput,
  StatRow,
  StatusBadge,
  TableCard,
  TableMessage,
  TableTitle,
  ToolbarActions,
  tableClass,
} from "./AdminUI";

export type ModeratorItem = {
  id: string;
  name: string;
  email: string;
  status: "Active" | "Inactive";
  lastLogin: string;
};

type ModeratorFormState = {
  name: string;
  email: string;
  password: string;
};

const emptyFormState: ModeratorFormState = {
  name: "",
  email: "",
  password: "",
};

interface ModeratorManagementPageProps {
  basePath?: string;
}

export default function ModeratorManagementPage({ basePath = "/admin" }: ModeratorManagementPageProps) {
  void basePath;

  const [moderators, setModerators] = useState<ModeratorItem[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModerator, setSelectedModerator] = useState<ModeratorItem | null>(null);
  const [editingModerator, setEditingModerator] = useState<ModeratorItem | null>(null);
  const [deletingModerator, setDeletingModerator] = useState<ModeratorItem | null>(null);
  const [formState, setFormState] = useState<ModeratorFormState>(emptyFormState);
  const [editFormState, setEditFormState] = useState<ModeratorFormState>(emptyFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/api/moderators");
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load moderators.");
        }

        setModerators(payload.moderators ?? []);
      } catch (error) {
        setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to load moderators." });
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, []);

  const filteredModerators = useMemo(() => {
    const value = search.toLowerCase();
    return moderators.filter((moderator) => {
      return [moderator.name, moderator.email].some((field) => field.toLowerCase().includes(value));
    });
  }, [moderators, search]);

  const activeModerators = moderators.filter((m) => m.status === "Active").length;

  const openEditModal = (moderator: ModeratorItem) => {
    setEditingModerator(moderator);
    setEditFormState({
      name: moderator.name,
      email: moderator.email,
      password: "",
    });
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.name.trim() || !formState.email.trim() || !formState.password.trim()) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/moderators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formState.name,
          email: formState.email,
          password: formState.password,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to create moderator.");
      }

      setModerators((current) => [payload.moderator, ...current]);
      setFormState(emptyFormState);
      setIsModalOpen(false);
      setFeedback({ type: "success", message: `${payload.moderator.name} was added successfully.` });
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to create moderator." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingModerator || !editFormState.name.trim() || !editFormState.email.trim()) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/moderators", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingModerator.id,
          name: editFormState.name,
          email: editFormState.email,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to update moderator.");
      }

      setModerators((current) =>
        current.map((moderator) => (moderator.id === editingModerator.id ? payload.moderator : moderator))
      );
      setEditingModerator(null);
      setEditFormState(emptyFormState);
      setFeedback({ type: "success", message: `${payload.moderator.name} was updated successfully.` });
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to update moderator." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (moderator: ModeratorItem) => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/moderators", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: moderator.id }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to delete moderator.");
      }

      setModerators((current) => current.filter((item) => item.id !== moderator.id));
      setDeletingModerator(null);
      setFeedback({ type: "success", message: `${moderator.name} was deleted successfully.` });
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to delete moderator." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="text-slate-950">
      <div className="mx-auto max-w-7xl px-1 py-1 sm:px-2">
        {/* Header */}
        <StatRow>
          <HeaderStat label="Moderators" value={moderators.length.toLocaleString()} />
          <HeaderStat label="Active" value={activeModerators.toLocaleString()} hint={`of ${moderators.length}`} />
        </StatRow>

        {feedback ? (
          <div className={`mb-3 rounded-lg border px-4 py-2.5 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
            {feedback.message}
          </div>
        ) : null}

        <TableCard
          toolbar={
            <>
              <TableTitle title="All moderators" count={isLoading ? undefined : filteredModerators.length} />
              <ToolbarActions>
                <SearchInput value={search} onChange={setSearch} placeholder="Search moderators..." />
                <HeaderButton
                  onClick={() => {
                    setFormState(emptyFormState);
                    setIsModalOpen(true);
                  }}
                >
                  Add Moderator
                </HeaderButton>
              </ToolbarActions>
            </>
          }
        >
          {isLoading ? (
            <Loader label="Loading moderators…" />
          ) : (
            <table className={tableClass.table}>
              <thead className={tableClass.thead}>
                <tr>
                  <th scope="col" className={tableClass.th}>Moderator</th>
                  <th scope="col" className={tableClass.th}>Status</th>
                  <th scope="col" className={tableClass.th}>Last login</th>
                  <th scope="col" className={tableClass.thRight}>Actions</th>
                </tr>
              </thead>
              <tbody className={tableClass.tbody}>
                {filteredModerators.length === 0 ? (
                  <TableMessage colSpan={4}>
                    {search ? "No moderators match your search." : "No moderators found."}
                  </TableMessage>
                ) : (
                  filteredModerators.map((moderator) => (
                    <tr key={moderator.id} className={tableClass.tr}>
                      <td className={tableClass.td}>
                        <div className="flex items-center gap-3">
                          <Avatar name={moderator.name} />
                          <div>
                            <div className="font-semibold text-slate-900">{moderator.name}</div>
                            <div className="text-xs text-slate-500">{moderator.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className={tableClass.td}>
                        <StatusBadge active={moderator.status === "Active"} label={moderator.status} />
                      </td>
                      <td className={tableClass.td}>{moderator.lastLogin}</td>
                      <td className={tableClass.tdRight}>
                        <RowActions>
                          <RowAction variant="view" onClick={() => setSelectedModerator(moderator)} />
                          <RowAction variant="edit" onClick={() => openEditModal(moderator)} />
                          <RowAction variant="delete" onClick={() => setDeletingModerator(moderator)} />
                        </RowActions>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </TableCard>
      </div>

      {/* Add Moderator Modal */}
      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-xl rounded-4xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">New moderator</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Add a moderator</h2>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">✕</button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleCreate}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">Full name</span>
                  <input value={formState.name} onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" required />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">Email</span>
                  <input type="email" value={formState.email} onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" required />
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 block">Password</span>
                <input type="password" value={formState.password} onChange={(event) => setFormState((current) => ({ ...current, password: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" required />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400">{isSubmitting ? "Saving..." : "Save moderator"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* View Modal */}
      {selectedModerator ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4" onClick={() => setSelectedModerator(null)}>
          <div className="w-full max-w-xl rounded-4xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Moderator details</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{selectedModerator.name}</h2>
              </div>
              <button type="button" onClick={() => setSelectedModerator(null)} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">✕</button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Email</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{selectedModerator.email}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Status</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{selectedModerator.status}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Last Login</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedModerator.lastLogin}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Edit Modal */}
      {editingModerator ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4" onClick={() => setEditingModerator(null)}>
          <div className="w-full max-w-xl rounded-4xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Edit moderator</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{editingModerator.name}</h2>
              </div>
              <button type="button" onClick={() => setEditingModerator(null)} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">✕</button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleEdit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">Full name</span>
                  <input value={editFormState.name} onChange={(event) => setEditFormState((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" required />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">Email</span>
                  <input type="email" value={editFormState.email} onChange={(event) => setEditFormState((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" required />
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingModerator(null)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400">{isSubmitting ? "Saving..." : "Save changes"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Delete Modal */}
      {deletingModerator ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4" onClick={() => setDeletingModerator(null)}>
          <div className="w-full max-w-md rounded-4xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Confirm delete</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Delete {deletingModerator.name}?</h2>
              </div>
              <button type="button" onClick={() => setDeletingModerator(null)} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">✕</button>
            </div>
            <p className="mt-4 text-sm text-slate-600">This action will remove the moderator account from the database. This cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setDeletingModerator(null)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={() => handleDelete(deletingModerator)} disabled={isSubmitting} className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-400">{isSubmitting ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
