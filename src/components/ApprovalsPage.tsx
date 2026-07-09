"use client";

import { useEffect, useState } from "react";

type ApprovalRequest = {
  id: string;
  user_id: string;
  target_type: 'category' | 'school' | 'content';
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
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [modalRequest, setModalRequest] = useState<ApprovalRequest | null>(null);
  const [resetRequests, setResetRequests] = useState<Array<{
    id: string;
    studentId: string;
    studentName: string;
    schoolId: string;
    schoolName: string;
    status: string;
    comment: string | null;
    reviewedBy: string | null;
    reviewedAt: string | null;
    createdAt: string;
  }>>([]);
  const [activeResetTab, setActiveResetTab] = useState<"Pending" | "All">("Pending");
  const [resetModal, setResetModal] = useState<{
    id: string;
    studentId: string;
    studentName: string;
  } | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

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

  const fetchResetRequests = async () => {
    try {
      const response = await fetch("/api/admin/password-reset-requests");
      const data = await response.json();
      if (response.ok) {
        setResetRequests(data.requests ?? []);
      }
    } catch (err) {
      console.error("Failed to load password reset requests:", err);
    }
  };

  useEffect(() => {
    fetchApprovals();
    fetchResetRequests();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        const map: Record<string, string> = {};
        (data.categories ?? []).forEach((c: { id: string; code?: string; slug?: string; label?: string }) => {
          map[c.id] = c.label || c.code || c.slug || c.id;
        });
        setCategoryMap(map);
      } catch {
        // ignore; category ids will fall back to the raw id
      }
    };
    loadCategories();
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

      setComments((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

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

  const handleResetAction = async (action: "approve" | "reject") => {
    if (!resetModal) return;

    setResetSubmitting(true);
    setResetFeedback(null);

    try {
      const body: any = {
        requestId: resetModal.id,
        action,
      };

      if (action === "approve") {
        if (!resetNewPassword || resetNewPassword.length < 6) {
          setResetFeedback({ type: "error", message: "Password must be at least 6 characters." });
          setResetSubmitting(false);
          return;
        }
        body.newPassword = resetNewPassword;
      }

      const response = await fetch("/api/admin/password-reset-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} password reset request.`);
      }

      setResetFeedback({
        type: "success",
        message: data.message || `Password reset request ${action === "approve" ? "approved" : "rejected"}.`,
      });

      setResetModal(null);
      setResetNewPassword("");
      await fetchResetRequests();
    } catch (err: any) {
      setResetFeedback({
        type: "error",
        message: err.message || `An error occurred while trying to ${action} request.`,
      });
    } finally {
      setResetSubmitting(false);
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

  const resetPendingCount = resetRequests.filter((r) => r.status === "pending").length;
  const resetApprovedCount = resetRequests.filter((r) => r.status === "approved").length;
  const resetRejectedCount = resetRequests.filter((r) => r.status === "rejected").length;
  const resetTotalCount = resetRequests.length;

  const getResetTabCount = (tab: "Pending" | "All") => {
    if (tab === "Pending") return resetPendingCount;
    return resetTotalCount;
  };

  const filteredResetRequests = resetRequests.filter((r) => {
    if (activeResetTab === "Pending") return r.status === "pending";
    return true;
  });

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
                  <div className="py-4 space-y-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Proposed Data changes:</p>

                    {req.target_type === "content" && (
                      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {req.change_data?.category_id && (
                            <div>
                              <span className="text-xs text-slate-400 uppercase tracking-wider">Category</span>
                              <p className="mt-1 text-sm font-semibold text-slate-900 break-words">
                                {categoryMap[req.change_data.category_id as string] ?? String(req.change_data.category_id)}
                              </p>
                            </div>
                          )}
                          {req.change_data?.level && (
                            <div>
                              <span className="text-xs text-slate-400 uppercase tracking-wider">Level</span>
                              <p className="mt-1 text-sm font-semibold text-slate-900">{req.change_data.level}</p>
                            </div>
                          )}
                        </div>
                        {req.change_data?.description && (
                          <div>
                            <span className="text-xs text-slate-400 uppercase tracking-wider">Description</span>
                            <p className="mt-1 text-sm text-slate-700">{req.change_data.description}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {req.target_type !== "content" && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                        {req.target_id && (
                          <div className="col-span-1 sm:col-span-2 lg:col-span-3 border-b border-slate-200 pb-2 mb-1">
                            <span className="text-xs text-slate-500 font-semibold block">Target Identifier (ID / Slug):</span>
                            <span className="text-sm font-mono text-slate-800 break-all">{req.target_id}</span>
                          </div>
                        )}
                        {Object.entries(req.change_data).map(([key, val]) => {
                          if (key === "is_published") return null;
                          const displayVal =
                            typeof val === "boolean"
                              ? val
                                ? "✅ Yes/Active"
                                : "❌ No/Inactive"
                              : String(val);
                          return (
                            <div key={key} className="flex flex-col">
                              <span className="text-xs text-slate-400 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                              <span className="text-sm font-semibold text-slate-900 mt-0.5 break-words">{displayVal}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {req.target_type === "content" && req.change_data?.pages && Array.isArray(req.change_data.pages) && (() => {
                      const pageItems = req.change_data.pages.filter(
                        (page: any) => typeof page?.content === "string" && page.content.trim() !== ""
                      );
                      if (pageItems.length === 0) return null;
                      return (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <span className="text-xs text-slate-400 uppercase tracking-wider block mb-3">Pages ({pageItems.length})</span>
                          <div className="space-y-2">
                            {pageItems.slice(0, 3).map((page: any, index: number) => {
                              const pageTitle = typeof page.title === "string" && page.title.trim() ? page.title.trim() : `Page ${index + 1}`;
                              return (
                                <div key={index} className="rounded-xl border border-slate-200 bg-white p-3">
                                  <p className="text-sm font-semibold text-slate-900">{pageTitle}</p>
                                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                                    {typeof page.content === "string" ? page.content.trim() : ""}
                                  </p>
                                </div>
                              );
                            })}
                            {pageItems.length > 3 && (
                              <p className="text-xs text-slate-500">+{pageItems.length - 3} more page{pageItems.length - 3 > 1 ? "s" : ""}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setModalRequest(req)}
                            className="mt-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
                          >
                            View all content
                          </button>
                        </div>
                      );
                    })()}
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

        {/* Password Reset Requests Section */}
        <div className="mt-10 rounded-[2rem] bg-white p-6 shadow ring-1 ring-slate-200">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Password Reset Requests</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Student password reset requests</h2>
              <p className="mt-1 text-sm text-slate-500">Review and process student password reset requests.</p>
            </div>
          </div>

          {/* Reset Request Tab Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {(["Pending", "All"] as const).map((tab) => {
              const count = getResetTabCount(tab);
              const isActive = activeResetTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveResetTab(tab)}
                  className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition cursor-pointer ${
                    isActive
                      ? "border-amber-400 bg-amber-50 text-amber-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>{tab === "Pending" ? "⏳" : "📂"}</span>
                  <span>{tab}</span>
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

          {filteredResetRequests.length === 0 ? (
            <div className="rounded-[1.75rem] bg-white p-8 text-center text-sm text-slate-500 shadow-sm border border-slate-200">
              No password reset requests found.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResetRequests.map((req) => {
                const statusBadgeColor =
                  req.status === "pending"
                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                    : req.status === "approved"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                    : "bg-rose-100 text-rose-800 border-rose-200";

                return (
                  <div
                    key={req.id}
                    className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                          🔑
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {req.studentName || "Unknown Student"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {req.studentId} · {req.schoolName}
                          </div>
                          {req.comment && (
                            <div className="mt-1 text-xs text-slate-600 italic">"{req.comment}"</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusBadgeColor}`}>
                          {req.status}
                        </span>
                      </div>
                    </div>

                    {req.status === "pending" && (
                      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs text-slate-500">
                          Submitted {new Date(req.createdAt).toLocaleString()}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setResetModal({ id: req.id, studentId: req.studentId, studentName: req.studentName });
                              setResetNewPassword("");
                              setResetFeedback(null);
                            }}
                            className="rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                          >
                            Approve & Set Password
                          </button>
                        </div>
                      </div>
                    )}

                    {req.status !== "pending" && (
                      <div className="mt-3 text-xs text-slate-500 border-t border-slate-100 pt-3">
                        Reviewed {req.reviewedAt ? new Date(req.reviewedAt).toLocaleString() : "N/A"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Password Reset Modal */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4" onClick={() => setResetModal(null)}>
          <div className="w-full max-w-md rounded-4xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Password Reset</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Set New Password</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {resetModal.studentName} ({resetModal.studentId})
                </p>
              </div>
              <button type="button" onClick={() => setResetModal(null)} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">✕</button>
            </div>

            {resetFeedback && (
              <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${resetFeedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
                {resetFeedback.message}
              </div>
            )}

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleResetAction("approve");
              }}
            >
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 block">New Password</span>
                <input
                  type="password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                  minLength={6}
                />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setResetModal(null)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={resetSubmitting} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400">
                  {resetSubmitting ? "Saving..." : "Approve & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
