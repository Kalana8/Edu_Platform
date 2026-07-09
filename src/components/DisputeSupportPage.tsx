import Link from "next/link";

type TicketStatus = "Open" | "In Progress" | "Resolved";

type TicketType = "Dispute" | "Technical" | "Support";

type TicketItem = {
  id: string;
  title: string;
  code: string;
  type: TicketType;
  student: string;
  school: string;
  status: TicketStatus;
  updated: string;
};

const tickets: TicketItem[] = [
  {
    id: "tkt-001",
    title: "Quiz answer marked incorrectly",
    code: "TKT-001",
    type: "Dispute",
    student: "1-sarah",
    school: "Melbourne High",
    status: "Open",
    updated: "2026-06-05",
  },
  {
    id: "tkt-002",
    title: "Credits not received after tier completion",
    code: "TKT-002",
    type: "Dispute",
    student: "2-emma",
    school: "Sydney Grammar",
    status: "In Progress",
    updated: "2026-06-05",
  },
  {
    id: "tkt-003",
    title: "Cannot access Advanced tier content",
    code: "TKT-003",
    type: "Technical",
    student: "3-james",
    school: "Brisbane High",
    status: "Open",
    updated: "2026-06-05",
  },
  {
    id: "tkt-004",
    title: "Reading streak reset incorrectly",
    code: "TKT-004",
    type: "Support",
    student: "1-alex",
    school: "Melbourne High",
    status: "Resolved",
    updated: "2026-06-03",
  },
  {
    id: "tkt-005",
    title: "School leaderboard points missing",
    code: "TKT-005",
    type: "Support",
    student: "4-noah",
    school: "Sydney Grammar",
    status: "In Progress",
    updated: "2026-06-04",
  },
];

const statusClasses: Record<TicketStatus, string> = {
  Open: "bg-rose-100 text-rose-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Resolved: "bg-emerald-100 text-emerald-700",
};

const typeClasses: Record<TicketType, string> = {
  Dispute: "bg-rose-50 text-rose-700",
  Technical: "bg-violet-50 text-violet-700",
  Support: "bg-sky-50 text-sky-700",
};

export default function DisputeSupportPage() {
  const totals = {
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === "Open").length,
    inProgress: tickets.filter((ticket) => ticket.status === "In Progress").length,
    resolved: tickets.filter((ticket) => ticket.status === "Resolved").length,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col gap-3 rounded-[2rem] bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Dispute & Support</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Manage student disputes and support requests</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Review and resolve ticket requests from students across the platform.</p>
          </div>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-4">
          <div className="rounded-[1.5rem] border border-blue-500 bg-white px-4 py-3 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Tickets</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{totals.total}</p>
          </div>
          <div className="rounded-[1.5rem] bg-white px-4 py-3 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Open</p>
              <p className="mt-1 text-3xl font-semibold text-slate-950">{totals.open}</p>
            </div>
            <div className="rounded-[1.5rem] bg-white px-4 py-3 shadow-sm">
              <p className="text-sm font-medium text-slate-500">In Progress</p>
              <p className="mt-1 text-3xl font-semibold text-slate-950">{totals.inProgress}</p>
            </div>
            <div className="rounded-[1.5rem] bg-white px-4 py-3 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Resolved</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{totals.resolved}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] bg-white shadow ring-1 ring-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">TICKET</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">TYPE</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">STUDENT</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">STATUS</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-600">UPDATED</th>
                <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-slate-600">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="transition hover:bg-slate-50">
                  <td className="px-6 py-4 align-top">
                    <div className="text-sm font-semibold text-slate-950">{ticket.title}</div>
                    <div className="mt-1 text-xs text-slate-500">{ticket.code}</div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${typeClasses[ticket.type]}`}>
                      {ticket.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="text-sm font-semibold text-slate-950">{ticket.student}</div>
                    <div className="text-xs text-slate-500">{ticket.school}</div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[ticket.status]}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top text-sm text-slate-600">{ticket.updated}</td>
                  <td className="px-6 py-4 align-top text-right text-sm font-medium text-slate-600">
                    <Link href="#" className="text-blue-600 transition hover:text-blue-800">View</Link>
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
