"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

export type SchoolItem = {
  id: string;
  code: string;
  name: string;
  location: string;
  tier: "Small" | "Medium" | "Large";
  students: number;
  points: number;
  isActive: boolean;
};

type SchoolFormState = {
  name: string;
  code: string;
  location: string;
  tier: SchoolItem["tier"];
  isActive: boolean;
};

const emptyFormState: SchoolFormState = {
  name: "",
  code: "",
  location: "",
  tier: "Medium",
  isActive: true,
};

interface SchoolsPageProps {
  role?: "Admin" | "Moderator";
  basePath?: string;
}

export default function SchoolsPage({ role = "Admin", basePath = "/admin" }: SchoolsPageProps) {
  void basePath;

  const [schools, setSchools] = useState<SchoolItem[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<SchoolItem | null>(null);
  const [editingSchool, setEditingSchool] = useState<SchoolItem | null>(null);
  const [deletingSchool, setDeletingSchool] = useState<SchoolItem | null>(null);
  const [formState, setFormState] = useState<SchoolFormState>(emptyFormState);
  const [editFormState, setEditFormState] = useState<SchoolFormState>(emptyFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const loadSchools = async () => {
      try {
        const response = await fetch("/api/schools");
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load schools.");
        }

        setSchools(payload.schools ?? []);
      } catch (error) {
        setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to load schools." });
      } finally {
        setIsLoading(false);
      }
    };

    void loadSchools();
  }, []);

  const filteredSchools = useMemo(() => {
    const value = search.toLowerCase();
    return schools.filter((school) => {
      return [school.name, school.code, school.location, school.tier].some((field) => field.toLowerCase().includes(value));
    });
  }, [schools, search]);

  const totalStudents = schools.reduce((sum, school) => sum + school.students, 0);
  const totalPoints = schools.reduce((sum, school) => sum + school.points, 0);
  const activeSchools = schools.filter((school) => school.isActive).length;

  const openEditModal = (school: SchoolItem) => {
    setEditingSchool(school);
    setEditFormState({
      name: school.name,
      code: school.code,
      location: school.location,
      tier: school.tier,
      isActive: school.isActive,
    });
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.name.trim() || !formState.code.trim() || !formState.location.trim()) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to create school.");
      }

      if (payload.pendingApproval) {
        setFormState(emptyFormState);
        setIsModalOpen(false);
        setFeedback({ type: "success", message: payload.message || "Request submitted for approval." });
        return;
      }

      setSchools((current) => [payload.school, ...current]);
      setFormState(emptyFormState);
      setIsModalOpen(false);
      setFeedback({ type: "success", message: `${payload.school.name} was added successfully.` });
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to create school." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingSchool || !editFormState.name.trim() || !editFormState.code.trim() || !editFormState.location.trim()) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/schools", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingSchool.id, ...editFormState }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to update school.");
      }

      if (payload.pendingApproval) {
        setEditingSchool(null);
        setEditFormState(emptyFormState);
        setFeedback({ type: "success", message: payload.message || "Request submitted for approval." });
        return;
      }

      setSchools((current) => current.map((school) => (school.id === editingSchool.id ? payload.school : school)));
      setEditingSchool(null);
      setEditFormState(emptyFormState);
      setFeedback({ type: "success", message: `${payload.school.name} was updated successfully.` });
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to update school." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (school: SchoolItem) => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/schools", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: school.id }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to delete school.");
      }

      if (payload.pendingApproval) {
        setDeletingSchool(null);
        setFeedback({ type: "success", message: payload.message || "Request submitted for approval." });
        return;
      }

      setSchools((current) => current.filter((item) => item.id !== school.id));
      setDeletingSchool(null);
      setFeedback({ type: "success", message: `${school.name} was deleted successfully.` });
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to delete school." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-4xl bg-white px-6 py-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Schools</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Manage participating schools</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              View schools, manage performance, and track student engagement for {role.toLowerCase()} workflows.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            + Add School
          </button>
        </div>

        {feedback ? (
          <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
            {feedback.message}
          </div>
        ) : null}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[1.5rem] bg-white px-6 py-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Schools</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{schools.length}</p>
              </div>
              <span className="text-3xl">📚</span>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white px-6 py-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Students</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{totalStudents.toLocaleString()}</p>
              </div>
              <span className="text-3xl">👥</span>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white px-6 py-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Points</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{totalPoints.toLocaleString()}</p>
              </div>
              <span className="text-3xl">💰</span>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white px-6 py-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{activeSchools}</p>
              </div>
              <span className="text-3xl">✅</span>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white shadow ring-1 ring-slate-200">
          <div className="border-b border-slate-200 px-6 py-4">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search schools..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm placeholder-slate-500 transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {isLoading ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">Loading schools…</div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">SCHOOL</th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">TIER</th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">STUDENTS</th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">POINTS</th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">STATUS</th>
                  <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-slate-600">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredSchools.map((school) => (
                  <tr key={school.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${school.tier === "Large" ? "bg-blue-100 text-blue-700" : school.tier === "Medium" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          <span className="text-xl">🏫</span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-950">{school.name}</div>
                          <div className="text-xs text-slate-500">{school.code} · {school.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${school.tier === "Large" ? "bg-blue-100 text-blue-700" : school.tier === "Medium" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {school.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top text-sm font-medium text-slate-950">{school.students}</td>
                    <td className="px-6 py-4 align-top text-sm font-medium text-slate-950">{school.points.toLocaleString()}</td>
                    <td className="px-6 py-4 align-top">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${school.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                        {school.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top text-right text-sm font-medium text-slate-600">
                      <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setSelectedSchool(school)} className="transition hover:text-slate-950">View</button>
                        <button type="button" onClick={() => openEditModal(school)} className="transition hover:text-slate-950">Edit</button>
                        <button type="button" onClick={() => setDeletingSchool(school)} className="text-red-500 transition hover:text-red-700">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-xl rounded-4xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">New school</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Add a school</h2>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">✕</button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleCreate}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">School name</span>
                  <input value={formState.name} onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" required />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">School code</span>
                  <input value={formState.code} onChange={(event) => setFormState((current) => ({ ...current, code: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" required />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">Location</span>
                  <input value={formState.location} onChange={(event) => setFormState((current) => ({ ...current, location: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" required />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">Tier</span>
                  <select value={formState.tier} onChange={(event) => setFormState((current) => ({ ...current, tier: event.target.value as SchoolItem["tier"] }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                  </select>
                </label>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={formState.isActive} onChange={(event) => setFormState((current) => ({ ...current, isActive: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                Active school
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400">{isSubmitting ? "Saving..." : "Save school"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {selectedSchool ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4" onClick={() => setSelectedSchool(null)}>
          <div className="w-full max-w-xl rounded-4xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">School details</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{selectedSchool.name}</h2>
              </div>
              <button type="button" onClick={() => setSelectedSchool(null)} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">✕</button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Code</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{selectedSchool.code}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Location</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{selectedSchool.location}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Tier</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{selectedSchool.tier}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Status</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{selectedSchool.isActive ? "Active" : "Inactive"}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Students / Points</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedSchool.students} students · {selectedSchool.points.toLocaleString()} points</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {editingSchool ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4" onClick={() => setEditingSchool(null)}>
          <div className="w-full max-w-xl rounded-4xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Edit school</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{editingSchool.name}</h2>
              </div>
              <button type="button" onClick={() => setEditingSchool(null)} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">✕</button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleEdit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">School name</span>
                  <input value={editFormState.name} onChange={(event) => setEditFormState((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" required />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">School code</span>
                  <input value={editFormState.code} onChange={(event) => setEditFormState((current) => ({ ...current, code: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" required />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">Location</span>
                  <input value={editFormState.location} onChange={(event) => setEditFormState((current) => ({ ...current, location: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" required />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">Tier</span>
                  <select value={editFormState.tier} onChange={(event) => setEditFormState((current) => ({ ...current, tier: event.target.value as SchoolItem["tier"] }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                  </select>
                </label>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={editFormState.isActive} onChange={(event) => setEditFormState((current) => ({ ...current, isActive: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                Active school
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingSchool(null)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400">{isSubmitting ? "Saving..." : "Save changes"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deletingSchool ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4" onClick={() => setDeletingSchool(null)}>
          <div className="w-full max-w-md rounded-4xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Confirm delete</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Delete {deletingSchool.name}?</h2>
              </div>
              <button type="button" onClick={() => setDeletingSchool(null)} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">✕</button>
            </div>
            <p className="mt-4 text-sm text-slate-600">This action will remove the school from the database. This cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setDeletingSchool(null)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={() => handleDelete(deletingSchool)} disabled={isSubmitting} className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-400">{isSubmitting ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
