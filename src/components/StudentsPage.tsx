import Link from "next/link";

export type StudentItem = {
  id: string;
  studentId: string;
  name: string;
  school: string;
  grade: string;
  streak: number;
  credits: number;
  progress: number;
  avatar: string;
};

const students: StudentItem[] = [
  {
    id: "student-001",
    studentId: "1-sarah",
    name: "Sarah Chen",
    school: "Melbourne High",
    grade: "Grade 9",
    streak: 15,
    credits: 2840,
    progress: 78,
    avatar: "👩",
  },
  {
    id: "student-002",
    studentId: "1-alex",
    name: "Alex Thompson",
    school: "Melbourne High",
    grade: "Grade 10",
    streak: 12,
    credits: 2795,
    progress: 82,
    avatar: "👨",
  },
  {
    id: "student-003",
    studentId: "2-emma",
    name: "Emma Wilson",
    school: "Sydney Grammar",
    grade: "Grade 8",
    streak: 18,
    credits: 3150,
    progress: 85,
    avatar: "👩",
  },
  {
    id: "student-004",
    studentId: "1-james",
    name: "James Lee",
    school: "Melbourne High",
    grade: "Grade 7",
    streak: 8,
    credits: 1520,
    progress: 65,
    avatar: "👨",
  },
  {
    id: "student-005",
    studentId: "3-olivia",
    name: "Olivia Brown",
    school: "Brisbane High",
    grade: "Grade 9",
    streak: 10,
    credits: 1890,
    progress: 71,
    avatar: "👩",
  },
  {
    id: "student-006",
    studentId: "4-noah",
    name: "Noah Garcia",
    school: "Sydney Grammar",
    grade: "Grade 10",
    streak: 6,
    credits: 2650,
    progress: 79,
    avatar: "👨",
  },
  {
    id: "student-007",
    studentId: "5-mia",
    name: "Mia Johnson",
    school: "Melbourne High",
    grade: "Grade 8",
    streak: 12,
    credits: 2410,
    progress: 73,
    avatar: "👩",
  },
];

interface StudentsPageProps {
  role?: "Admin" | "Moderator";
  basePath?: string;
}

export default function StudentsPage({ role = "Admin", basePath = "/admin" }: StudentsPageProps) {
  const activeStudents = students.filter((s) => s.streak > 0).length;
  const activeRate = Math.round((activeStudents / students.length) * 100);
  const totalCredits = students.reduce((sum, s) => sum + s.credits, 0);
  const avgProgress = Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 rounded-[2rem] bg-white px-6 py-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Students</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">View student accounts and performance</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Read-only view of student progress and engagement metrics for {role.toLowerCase()} workflows.</p>
          </div>
        </div>

        {/* Active Students Card */}
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

        {/* Search, Filter, Export */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by student ID, name or school..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm placeholder-slate-400 transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              ⚙️ Filter
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
              ⬇️ Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-[2rem] bg-white shadow ring-1 ring-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  STUDENT
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  SCHOOL
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  GRADE
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  STREAK
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  CREDITS
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  PROG
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {students.map((student) => (
                <tr key={student.id} className="transition hover:bg-slate-50">
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg">
                        {student.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-950">{student.name}</div>
                        <div className="text-xs text-slate-500">{student.studentId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top text-sm text-slate-600">{student.school}</td>
                  <td className="px-6 py-4 align-top text-sm font-medium text-slate-950">{student.grade}</td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔥</span>
                      <span className="text-sm font-semibold text-amber-600">{student.streak}d</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top text-sm font-semibold text-slate-950">{student.credits.toLocaleString()}</td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
