import Link from "next/link";

export type ModeratorItem = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  permissions: string[];
  status: "Active" | "Inactive";
  lastLogin: string;
  permissionCount: number;
};

const moderators: ModeratorItem[] = [
  {
    id: "mod-001",
    name: "Jake Williams",
    email: "moderator@example.com",
    avatar: "J",
    permissions: ["All permissions"],
    status: "Active",
    lastLogin: "2026-06-05",
    permissionCount: 0,
  },
  {
    id: "mod-002",
    name: "Priya Singh",
    email: "priya@school.edu.au",
    avatar: "P",
    permissions: ["Schools", "Students", "+1"],
    status: "Active",
    lastLogin: "2026-06-04",
    permissionCount: 1,
  },
  {
    id: "mod-003",
    name: "Liam O'Brien",
    email: "liam@school.edu.au",
    avatar: "L",
    permissions: ["Students", "Dispute & Support"],
    status: "Inactive",
    lastLogin: "2026-05-12",
    permissionCount: 0,
  },
];

interface ModeratorManagementPageProps {
  basePath?: string;
}

export default function ModeratorManagementPage({ basePath = "/admin" }: ModeratorManagementPageProps) {
  const activeModerators = moderators.filter((m) => m.status === "Active").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 rounded-[2rem] bg-white px-6 py-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Moderator Management</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Add and manage moderator accounts and permissions</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Control moderator access, assign permissions, and monitor account status.
            </p>
          </div>
          <Link
            href="#"
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            + Add Moderator
          </Link>
        </div>

        {/* Stats Card */}
        <div className="mb-6 rounded-[2rem] bg-white px-6 py-4 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active Moderators</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{activeModerators} of {moderators.length}</p>
            </div>
            <span className="text-3xl">👥</span>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search moderators..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm placeholder-slate-400 transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-[2rem] bg-white shadow ring-1 ring-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  MODERATOR
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  PERMISSIONS
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  STATUS
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  LAST LOGIN
                </th>
                <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {moderators.map((moderator) => (
                <tr key={moderator.id} className="transition hover:bg-slate-50">
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-400 text-sm font-semibold text-white">
                        {moderator.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-950">{moderator.name}</div>
                        <div className="text-xs text-slate-500">{moderator.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="space-y-1">
                      {moderator.permissions.map((permission, idx) => (
                        <div key={idx} className="text-xs text-slate-600">
                          {permission === "All permissions" ? (
                            <span className="font-semibold text-slate-700">{permission}</span>
                          ) : (
                            permission
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        moderator.status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {moderator.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top text-sm text-slate-600">{moderator.lastLogin}</td>
                  <td className="px-6 py-4 align-top text-right text-sm font-medium text-slate-600">
                    <button className="transition hover:text-slate-950">⋮</button>
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
