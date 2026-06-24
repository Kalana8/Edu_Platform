import Link from "next/link";

export type SchoolItem = {
  id: string;
  code: string;
  name: string;
  location: string;
  tier: "Small" | "Medium" | "Large";
  students: number;
  points: number;
  avgPerformance: number;
  icon: string;
  tierColor: "bg-emerald-100 text-emerald-700" | "bg-amber-100 text-amber-700" | "bg-blue-100 text-blue-700";
};

const schools: SchoolItem[] = [
  {
    id: "sch-001",
    code: "SCH-001",
    name: "Sydney Grammar School",
    location: "Sydney, NSW",
    tier: "Large",
    students: 458,
    points: 15400,
    avgPerformance: 87,
    icon: "🏛️",
    tierColor: "bg-blue-100 text-blue-700",
  },
  {
    id: "sch-002",
    code: "SCH-002",
    name: "Melbourne High School",
    location: "Melbourne, VIC",
    tier: "Medium",
    students: 312,
    points: 12200,
    avgPerformance: 82,
    icon: "🏫",
    tierColor: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "sch-003",
    code: "SCH-003",
    name: "Brisbane State High",
    location: "Brisbane, QLD",
    tier: "Large",
    students: 425,
    points: 11850,
    avgPerformance: 79,
    icon: "🏛️",
    tierColor: "bg-blue-100 text-blue-700",
  },
  {
    id: "sch-004",
    code: "SCH-004",
    name: "Adelaide High School",
    location: "Adelaide, SA",
    tier: "Medium",
    students: 267,
    points: 10500,
    avgPerformance: 81,
    icon: "🏫",
    tierColor: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "sch-005",
    code: "SCH-005",
    name: "Perth College",
    location: "Perth, WA",
    tier: "Small",
    students: 157,
    points: 8450,
    avgPerformance: 85,
    icon: "🎓",
    tierColor: "bg-amber-100 text-amber-700",
  },
];

interface SchoolsPageProps {
  role?: "Admin" | "Moderator";
  basePath?: string;
}

export default function SchoolsPage({ role = "Admin", basePath = "/admin" }: SchoolsPageProps) {
  const totalStudents = schools.reduce((sum, school) => sum + school.students, 0);
  const totalPoints = schools.reduce((sum, school) => sum + school.points, 0);
  const avgPerformance = Math.round(schools.reduce((sum, school) => sum + school.avgPerformance, 0) / schools.length);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 rounded-[2rem] bg-white px-6 py-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Schools</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Manage participating schools</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              View schools, manage performance, and track student engagement for {role.toLowerCase()} workflows.
            </p>
          </div>
          <Link
            href="#"
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            + Add School
          </Link>
        </div>

        {/* Stats Cards */}
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
                <p className="text-sm font-medium text-slate-600">Avg Performance</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{avgPerformance}%</p>
              </div>
              <span className="text-3xl">📊</span>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white px-6 py-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{schools.length}</p>
              </div>
              <span className="text-3xl">✅</span>
            </div>
          </div>
        </div>

        {/* Search and Table */}
        <div className="rounded-[2rem] bg-white shadow ring-1 ring-slate-200">
          {/* Search Bar */}
          <div className="border-b border-slate-200 px-6 py-4">
            <input
              type="text"
              placeholder="Search schools..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm placeholder-slate-500 transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Table */}
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  SCHOOL
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  TIER
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  STUDENTS
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  POINTS
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  AVG PERF.
                </th>
                <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {schools.map((school) => (
                <tr key={school.id} className="transition hover:bg-slate-50">
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${school.tierColor}`}>
                        <span className="text-xl">{school.icon}</span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-950">{school.name}</div>
                        <div className="text-xs text-slate-500">{school.code} · {school.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      school.tier === "Large"
                        ? "bg-blue-100 text-blue-700"
                        : school.tier === "Medium"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                    }`}>
                      {school.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top text-sm font-medium text-slate-950">{school.students}</td>
                  <td className="px-6 py-4 align-top text-sm font-medium text-slate-950">{school.points.toLocaleString()}</td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${school.avgPerformance}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-950">{school.avgPerformance}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top text-right text-sm font-medium text-slate-600">
                    <div className="flex justify-end gap-3">
                      <Link href="#" className="transition hover:text-slate-950">
                        View
                      </Link>
                      <Link href="#" className="transition hover:text-slate-950">
                        Edit
                      </Link>
                      <button className="text-red-500 transition hover:text-red-700">Delete</button>
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
