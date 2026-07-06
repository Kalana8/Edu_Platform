"use client";

import { useEffect, useState } from "react";

type ApprovalRequest = {
  id: string;
  user_id: string;
  target_type: 'category' | 'school';
  action_type: 'create' | 'update' | 'delete';
  target_id: string | null;
  change_data: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  admin_comment?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  users?: {
    name: string;
    email: string;
  };
};

type TabName = "Pending" | "Approved" | "Rejected" | "All";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [activeTab, setActiveTab] = useState<TabName>("Pending");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null); // holds approval ID being submitted
  const [comments, setComments] = useState<Record<string, string>>({}); // maps approval ID to comment text

  const fetchApprovals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/approvals");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load approvals.");
      }
      setApprovals(data.approvals ?? []);
    } catch (err: any) {
      setError(err.message || "An error occurred while loading approvals.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleResolve = async (id: string, status: "approved" | "rejected") => {
    setIsSubmitting(id);
    setFeedback(null);
    const comment = comments[id] || "";

    try {
      const response = await fetch("/api/approvals", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status, comment }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${status} request.`);
      }

      setFeedback({
        type: "success",
        message: `Request was successfully ${status}.`,
      });

      // Clear comment for this request
      setComments((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      // Reload approvals lists
      await fetchApprovals();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || `An error occurred while trying to ${status} request.`,
      });
    } finally {
      setIsSubmitting(null);
    }
  };

  const pendingCount = approvals.filter((a) => a.status === "pending").length;
  const approvedCount = approvals.filter((a) => a.status === "approved").length;
  const rejectedCount = approvals.filter((a) => a.status === "rejected").length;
  const totalCount = approvals.length;

  const filteredApprovals = approvals.filter((a) => {
    if (activeTab === "Pending") return a.status === "pending";
    if (activeTab === "Approved") return a.status === "approved";
    if (activeTab === "Rejected") return a.status === "rejected";
    return true; // All
  });

  const getTabCount = (tab: TabName) => {
    if (tab === "Pending") return pendingCount;
    if (tab === "Approved") return approvedCount;
    if (tab === "Rejected") return rejectedCount;
    return totalCount;
  };

  const tabs: { label: TabName; icon: string }[] = [
    { label: "Pending", icon: "⏳" },
    { label: "Approved", icon: "✅" },
    { label: "Rejected", icon: "❌" },
    { label: "All", icon: "📂" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 rounded-[2rem] bg-white px-6 py-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Approvals Manager</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Review and resolve change requests</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Audit moderator requests to create, update, or delete category and school data. Approving changes immediately commits them to the database.
            </p>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm flex items-center justify-between ${
              feedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            <span>{feedback.message}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs font-bold underline hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Filters */}
        <div className="mb-6 rounded-[2rem] bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            {tabs.map((tab) => {
              const count = getTabCount(tab.label);
              const isActive = activeTab === tab.label;
              return (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(tab.label)}
                  className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition cursor-pointer ${
                    isActive
                      ? "border-amber-400 bg-amber-50 text-amber-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span
                    className={`inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                      isActive ? "bg-amber-200 text-amber-800" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Approvals List */}
        {isLoading ? (
          <div className="rounded-[2rem] bg-white p-12 text-center text-slate-500 shadow ring-1 ring-slate-200">
            <span className="inline-block animate-spin text-2xl mr-2">⚙️</span> Loading requests...
          </div>
        ) : error ? (
          <div className="rounded-[2rem] bg-white p-12 text-center text-rose-600 shadow ring-1 ring-slate-200 border border-rose-100">
            <span className="text-2xl block mb-2">⚠️</span>
            <p className="font-semibold">{error}</p>
            <button
              onClick={fetchApprovals}
              className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 font-semibold"
            >
              Retry Load
            </button>
          </div>
        ) : filteredApprovals.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-12 shadow ring-1 ring-slate-200">
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-2xl text-slate-500">
                📭
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-950">No {activeTab.toLowerCase()} requests</h2>
                <p className="mt-2 max-w-xl text-sm text-slate-500">
                  There are no requests matching the current status filter. New requests will appear here when moderators submit changes.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredApprovals.map((req) => {
              const requestDate = new Date(req.created_at).toLocaleString();
              const actionBadgeColor =
                req.action_type === "create"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : req.action_type === "update"
                  ? "bg-sky-100 text-sky-800 border-sky-200"
                  : "bg-rose-100 text-rose-800 border-rose-200";

              const targetBadgeColor =
                req.target_type === "category"
                  ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                  : "bg-amber-100 text-amber-800 border-amber-200";

              const statusBadgeColor =
                req.status === "pending"
                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                  : req.status === "approved"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : "bg-rose-100 text-rose-800 border-rose-200";

              return (
                <div
                  key={req.id}
                  className="rounded-[2rem] bg-white p-6 shadow ring-1 ring-slate-200 transition hover:shadow-md"
                >
                  {/* Card Header Info */}
                  <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                        👤
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {req.users?.name || "Moderator"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {req.users?.email || "Unknown email"} · {requestDate}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${targetBadgeColor}`}>
                        {req.target_type}
                      </span>
                      <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${actionBadgeColor}`}>
                        {req.action_type === "create" ? "Add" : req.action_type === "update" ? "Edit" : "Delete"}
                      </span>
                      <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusBadgeColor}`}>
                        {req.status}
                      </span>
                    </div>
                  </div>

                  {/* Change details grid */}
                  <div className="py-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Proposed Data changes:</p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                      {req.target_id && (
                        <div className="col-span-1 sm:col-span-2 lg:col-span-3 border-b border-slate-200 pb-2 mb-1">
                          <span className="text-xs text-slate-500 font-semibold block">Target Identifier (ID / Slug):</span>
                          <span className="text-sm font-mono text-slate-800 break-all">{req.target_id}</span>
                        </div>
                      )}

                      {Object.entries(req.change_data).map(([key, val]) => {
                        const displayVal =
                          typeof val === "boolean"
                            ? val
                              ? "✅ Yes/Active"
                              : "❌ No/Inactive"
                            : String(val);
                        return (
                          <div key={key} className="flex flex-col">
                            <span className="text-xs text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="text-sm font-semibold text-slate-900 mt-0.5 break-words">
                              {displayVal}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Resolution comment and buttons */}
                  {req.status === "pending" ? (
                    <div className="mt-4 border-t border-slate-100 pt-4 flex flex-col gap-4">
                      <div className="w-full">
                        <textarea
                          value={comments[req.id] || ""}
                          onChange={(e) =>
                            setComments((prev) => ({ ...prev, [req.id]: e.target.value }))
                          }
                          placeholder="Optional: Add a comment describing the approval or rejection reason..."
                          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          rows={2}
                        />
                      </div>
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          disabled={isSubmitting !== null}
                          onClick={() => handleResolve(req.id, "rejected")}
                          className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          {isSubmitting === req.id ? "Processing..." : "Reject Request"}
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting !== null}
                          onClick={() => handleResolve(req.id, "approved")}
                          className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                          {isSubmitting === req.id ? "Processing..." : "Approve Request"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 border-t border-slate-100 pt-4 bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Review log:</p>
                      <div className="mt-2 text-sm text-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <span className="font-semibold text-slate-500">Reviewed At:</span>{" "}
                          {req.reviewed_at ? new Date(req.reviewed_at).toLocaleString() : "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-500">Verdict Comment:</span>{" "}
                          <span className="italic text-slate-800">
                            {req.admin_comment || "No comment provided."}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
