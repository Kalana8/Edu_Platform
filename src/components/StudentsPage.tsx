"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Avatar,
  HeaderStat,
  RowAction,
  RowActions,
  SearchInput,
  StatRow,
  StatusBadge,
  TableCard,
  TableLoader,
  TableMessage,
  TableTitle,
  tableClass,
} from "./AdminUI";

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
  students?: StudentItem[];
  schools?: Array<{ id: string; name: string }>;
}

export default function StudentsPage({ basePath = "/admin", students: initialStudents, schools: initialSchools }: StudentsPageProps = {}) {
  void basePath;

  const [students, setStudents] = useState<StudentItem[]>(initialStudents ?? []);
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>(initialSchools ?? []);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<StudentItem | null>(null);
  const [editFormState, setEditFormState] = useState<StudentFormState>(emptyFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const hasInitialData = (initialStudents?.length ?? 0) > 0 || (initialSchools?.length ?? 0) > 0;

  useEffect(() => {
    if (hasInitialData) {
      setIsLoading(false);
      return;
    }

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
  }, [hasInitialData]);

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
    <div className="text-slate-950">
      <div className="mx-auto max-w-7xl px-1 py-1 sm:px-2">
        <StatRow>
          <HeaderStat label="Students" value={students.length.toLocaleString()} />
          <HeaderStat label="Active rate" value={`${activeRate}%`} hint={`${activeStudents} of ${students.length} active`} />
          <HeaderStat label="Total Credits" value={totalCredits.toLocaleString()} />
          <HeaderStat label="Available Credits" value={totalAvailableCredits.toLocaleString()} />
        </StatRow>

        {feedback ? (
          <div className={`mb-3 rounded-2xl border px-4 py-2.5 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
            {feedback.message}
          </div>
        ) : null}

        <TableCard
          toolbar={
            <>
              <TableTitle title="All students" count={filteredStudents.length} />
              <SearchInput value={search} onChange={setSearch} placeholder="Search by ID, name, email or school..." />
            </>
          }
        >
            <table className={tableClass.table}>
              <thead className={tableClass.thead}>
                <tr>
                  <th scope="col" className={tableClass.th}>Student</th>
                  <th scope="col" className={tableClass.th}>School</th>
                  <th scope="col" className={tableClass.th}>Student ID</th>
                  <th scope="col" className={tableClass.thRight}>Credits</th>
                  <th scope="col" className={tableClass.th}>Status</th>
                  <th scope="col" className={tableClass.thRight}>Actions</th>
                </tr>
              </thead>
              <tbody className={tableClass.tbody}>
                {isLoading ? (
                  <TableLoader colSpan={6} label="Loading students…" />
                ) : filteredStudents.length === 0 ? (
                  <TableMessage colSpan={6}>{search ? "No students match your search." : "No students yet."}</TableMessage>
                ) : filteredStudents.map((student) => (
                  <tr key={student.id} className={tableClass.tr}>
                    <td className={tableClass.td}>
                      <div className="flex items-center gap-3">
                        <Avatar name={student.name} />
                        <div>
                          <div className="font-semibold text-slate-900">{student.name}</div>
                          <div className="text-xs text-slate-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className={tableClass.td}>{student.school}</td>
                    <td className={tableClass.td}>
                      <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">{student.studentId}</span>
                    </td>
                    <td className={tableClass.tdRight}>
                      <div className="flex flex-col items-end tabular-nums leading-tight">
                        <span className="font-semibold text-slate-900">{student.availableCredits.toLocaleString()} <span className="font-normal text-slate-500">available</span></span>
                        <span className="text-xs text-slate-500">{student.totalCredits.toLocaleString()} total</span>
                        {student.withheldCredits > 0 && <span className="text-xs font-medium text-amber-600">{student.withheldCredits.toLocaleString()} withheld</span>}
                      </div>
                    </td>
                    <td className={tableClass.td}>
                      <StatusBadge active={student.isActive} />
                    </td>
                    <td className={tableClass.tdRight}>
                      <RowActions>
                        <RowAction variant="view" onClick={() => setSelectedStudent(student)} />
                        <RowAction variant="edit" onClick={() => openEditModal(student)} />
                        <RowAction variant="delete" onClick={() => setDeletingStudent(student)} />
                      </RowActions>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </TableCard>
     </div>

      {selectedStudent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4" onClick={() => setSelectedStudent(null)}>
          <div className="w-full max-w-xl rounded-4xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Student Details</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{selectedStudent.name}</h2>
              </div>
              <button type="button" onClick={() => setSelectedStudent(null)} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">✕</button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-400">Email</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{selectedStudent.email}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-400">Student ID</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{selectedStudent.studentId}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-400">School</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{selectedStudent.school}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-400">Status</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{selectedStudent.isActive ? "Active" : "Inactive"}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-400">Credits</p>
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
                <p className="text-sm font-semibold text-slate-500">Edit Student</p>
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
                <p className="text-sm font-semibold text-slate-500">Confirm Delete</p>
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
