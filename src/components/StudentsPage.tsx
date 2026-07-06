"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

export type StudentItem = {
  id: string;
  studentId: string;
  name: string;
  email: string;
  school: string;
  schoolId: string | null;
  totalCredits: number;
  availableCredits: number;
  withheldCredits: number;
  isActive: boolean;
};

type StudentFormState = {
  name: string;
  email: string;
  studentId: string;
  schoolId: string;
  totalCredits: string;
  availableCredits: string;
};

const emptyFormState: StudentFormState = {
  name: "",
  email: "",
  studentId: "",
  schoolId: "",
  totalCredits: "0",
  availableCredits: "0",
};

interface StudentsPageProps {
  role?: "Admin" | "Moderator";
  basePath?: string;
}

export default function StudentsPage({ role = "Admin", basePath = "/admin" }: StudentsPageProps) {
  void basePath;

  const [students, setStudents] = useState<StudentItem[]>([]);
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<StudentItem | null>(null);
  const [formState, setFormState] = useState<StudentFormState>(emptyFormState);
  const [editFormState, setEditFormState] = useState<StudentFormState>(emptyFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [studentsResponse, schoolsResponse] = await Promise.all([fetch("/api/students"), fetch("/api/schools")]);
        const studentsPayload = await studentsResponse.json();
        const schoolsPayload = await schoolsResponse.json();

        if (!studentsResponse.ok) {
          throw new Error(studentsPayload.error || "Unable to load students.");
        }

        if (!schoolsResponse.ok) {
          throw new Error(schoolsPayload.error || "Unable to load schools.");
        }

        setStudents(studentsPayload.students ?? []);
        setSchools(schoolsPayload.schools ?? []);
      } catch (error) {
        setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to load data." });
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, []);

  const filteredStudents = useMemo(() => {
    const value = search.toLowerCase();
    return students.filter((student) => {
      return [student.name, student.studentId, student.email, student.school].some((field) => field.toLowerCase().includes(value));
    });
  }, [students, search]);

  const activeStudents = students.filter((student) => student.isActive).length;
  const activeRate = students.length ? Math.round((activeStudents / students.length) * 100) : 0;
  const totalCredits = students.reduce((sum, student) => sum + student.totalCredits, 0);
  const totalAvailableCredits = students.reduce((sum, student) => sum + student.availableCredits, 0);

  const openEditModal = (student: StudentItem) => {
    setEditingStudent(student);
    setEditFormState({
      name: student.name,
      email: student.email,
      studentId: student.studentId,
      schoolId: student.schoolId ?? "",
      totalCredits: String(student.totalCredits),
      availableCredits: String(student.availableCredits),
    });
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.name.trim() || !formState.email.trim() || !formState.studentId.trim() || !formState.schoolId) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to create student.");
      }

      setStudents((current) => [payload.student, ...current]);
      setFormState(emptyFormState);
      setIsModalOpen(false);
      setFeedback({ type: "success", message: `${payload.student.name} was added successfully.` });
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to create student." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingStudent || !editFormState.name.trim() || !editFormState.email.trim() || !editFormState.studentId.trim() || !editFormState.schoolId) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingStudent.id, ...editFormState }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to update student.");
      }

      setStudents((current) => current.map((student) => (student.id === editingStudent.id ? payload.student : student)));
      setEditingStudent(null);
      setEditFormState(emptyFormState);
      setFeedback({ type: "success", message: `${payload.student.name} was updated successfully.` });
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to update student." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (student: StudentItem) => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/students", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: student.id }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to delete student.");
      }

      setStudents((current) => current.filter((item) => item.id !== student.id));
      setDeletingStudent(null);
      setFeedback({ type: "success", message: `${student.name} was deleted successfully.` });
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to delete student." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-4xl bg-white px-6 py-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Students</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Manage student accounts and progress</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Track students, school assignment, and credits for {role.toLowerCase()} workflows.</p>
          </div>
          <button type="button" onClick={() => setIsModalOpen(true)} className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
            + Add Student
          </button>
        </div>

        {feedback ? (
          <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
            {feedback.message}
          </div>
        ) : null}

        <div className="mb-6 rounded-[2rem] bg-gradient-to-br from-blue-50 to-indigo-50 px-6 py-6 shadow-sm ring-1 ring-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Active Students</p>
                <p className="mt-1 text-2xl font-bold text-slate-950">{activeStudents} of {students.length} students are active</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">{activeRate}%</p>
              <p className="text-xs font-semibold text-blue-600">active rate</p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by student ID, name, email or school..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm placeholder-slate-400 transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600">Credits: {totalCredits.toLocaleString()}</div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600">Available: {totalAvailableCredits.toLocaleString()}</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] bg-white shadow ring-1 ring-slate-200">
          {isLoading ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">Loading students…</div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">STUDENT</th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">SCHOOL</th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">STUDENT ID</th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">CREDITS</th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">STATUS</th>
                  <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-slate-600">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg">👤</div>
                        <div>
                          <div className="text-sm font-semibold text-slate-950">{student.name}</div>
                          <div className="text-xs text-slate-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-sm text-slate-600">{student.school}</td>
                    <td className="px-6 py-4 align-top text-sm font-medium text-slate-950">{student.studentId}</td>
                    <td className="px-6 py-4 align-top text-sm font-semibold text-slate-950">{student.availableCredits.toLocaleString()} / {student.totalCredits.toLocaleString()}</td>
                    <td className="px-6 py-4 align-top">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${student.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                        {student.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top text-right text-sm font-medium text-slate-600">
                      <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setSelectedStudent(student)} className="transition hover:text-slate-950">View</button>
                        <button type="button" onClick={() => openEditModal(student)} className="transition hover:text-slate-950">Edit</button>
                        <button type="button" onClick={() => setDeletingStudent(student)} className="text-red-500 transition hover:text-red-700">Delete</button>
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
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">New student</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Add a student</h2>
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

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">Student ID</span>
                  <input value={formState.studentId} onChange={(event) => setFormState((current) => ({ ...current, studentId: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" required />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">School</span>
                  <select value={formState.schoolId} onChange={(event) => setFormState((current) => ({ ...current, schoolId: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" required>
                    <option value="">Select school</option>
                    {schools.map((school) => (<option key={school.id} value={school.id}>{school.name}</option>))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">Total credits</span>
                  <input type="number" value={formState.totalCredits} onChange={(event) => setFormState((current) => ({ ...current, totalCredits: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" required />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">Available credits</span>
                  <input type="number" value={formState.availableCredits} onChange={(event) => setFormState((current) => ({ ...current, availableCredits: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" required />
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400">{isSubmitting ? "Saving..." : "Save student"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {selectedStudent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4" onClick={() => setSelectedStudent(null)}>
          <div className="w-full max-w-xl rounded-4xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Student details</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{selectedStudent.name}</h2>
              </div>
              <button type="button" onClick={() => setSelectedStudent(null)} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">✕</button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Email</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{selectedStudent.email}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Student ID</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{selectedStudent.studentId}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">School</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{selectedStudent.school}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Status</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{selectedStudent.isActive ? "Active" : "Inactive"}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Credits</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedStudent.availableCredits.toLocaleString()} available / {selectedStudent.totalCredits.toLocaleString()} total</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {editingStudent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4" onClick={() => setEditingStudent(null)}>
          <div className="w-full max-w-xl rounded-4xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Edit student</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{editingStudent.name}</h2>
              </div>
              <button type="button" onClick={() => setEditingStudent(null)} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">✕</button>
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

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">Student ID</span>
                  <input value={editFormState.studentId} onChange={(event) => setEditFormState((current) => ({ ...current, studentId: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" required />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">School</span>
                  <select value={editFormState.schoolId} onChange={(event) => setEditFormState((current) => ({ ...current, schoolId: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" required>
                    <option value="">Select school</option>
                    {schools.map((school) => (<option key={school.id} value={school.id}>{school.name}</option>))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">Total credits</span>
                  <input type="number" value={editFormState.totalCredits} onChange={(event) => setEditFormState((current) => ({ ...current, totalCredits: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" required />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">Available credits</span>
                  <input type="number" value={editFormState.availableCredits} onChange={(event) => setEditFormState((current) => ({ ...current, availableCredits: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" required />
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingStudent(null)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400">{isSubmitting ? "Saving..." : "Save changes"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deletingStudent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4" onClick={() => setDeletingStudent(null)}>
          <div className="w-full max-w-md rounded-4xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Confirm delete</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Delete {deletingStudent.name}?</h2>
              </div>
              <button type="button" onClick={() => setDeletingStudent(null)} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">✕</button>
            </div>
            <p className="mt-4 text-sm text-slate-600">This action will remove the student account from the database. This cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setDeletingStudent(null)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={() => handleDelete(deletingStudent)} disabled={isSubmitting} className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-400">{isSubmitting ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
