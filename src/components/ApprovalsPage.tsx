"use client";

import { useEffect, useState } from "react";
import {
  Avatar,
  Card,
  Loader,
  Pill,
  SegmentedTabs,
  TableCard,
  TableMessage,
  TableTitle,
  tableClass,
  type PillTone,
} from "./AdminUI";

const statusTone = (status: string): PillTone =>
  status === "pending" ? "amber" : status === "approved" ? "emerald" : "rose";

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

  const tabs: TabName[] = ["Pending", "Approved", "Rejected", "All"];

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
    <div className="text-slate-950">
      <div className="mx-auto max-w-7xl px-1 py-1 sm:px-2">
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mb-3 rounded-lg border px-4 py-2.5 text-sm flex items-center justify-between ${
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
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <TableTitle title="Change requests" />
          <SegmentedTabs
            label="Filter change requests"
            tabs={tabs.map((t) => ({ id: t, label: t, count: getTabCount(t) }))}
            active={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* Approvals List */}
        {isLoading ? (
          <Card>
            <Loader label="Loading requests…" />
          </Card>
        ) : error ? (
          <Card className="px-4 py-8 text-center">
            <p className="text-sm font-semibold text-rose-600">{error}</p>
            <button
              onClick={fetchApprovals}
              className="mt-3 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </Card>
        ) : filteredApprovals.length === 0 ? (
          <Card className="px-4 py-8 text-center">
            <h2 className="text-sm font-semibold text-slate-900">No {activeTab.toLowerCase()} requests</h2>
            <p className="mt-1 text-sm text-slate-500">New requests will appear here when moderators submit changes.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredApprovals.map((req) => {
              const requestDate = new Date(req.created_at).toLocaleString();
              const actionTone: PillTone =
                req.action_type === "create" ? "emerald" : req.action_type === "update" ? "brand" : "rose";
              const targetTone: PillTone = req.target_type === "category" ? "brand" : req.target_type === "school" ? "amber" : "slate";

              return (
                <Card key={req.id} className="p-4">
                  {/* Card Header Info */}
                  <div className="flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={req.users?.name || "Moderator"} />
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {req.users?.name || "Moderator"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {req.users?.email || "Unknown email"} · {requestDate}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Pill tone={targetTone}>{req.target_type}</Pill>
                      <Pill tone={actionTone}>
                        {req.action_type === "create" ? "Add" : req.action_type === "update" ? "Edit" : "Delete"}
                      </Pill>
                      <Pill tone={statusTone(req.status)}>{req.status}</Pill>
                    </div>
                  </div>

                  {/* Change details grid */}
                  <div className="py-3 space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Proposed changes</p>

                    {req.target_type === "content" && (
                      <div className="rounded-md bg-white border border-slate-200 p-3 space-y-3">
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
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 rounded-md bg-slate-50 p-3 border border-slate-100">
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
                                ? "Yes / Active"
                                : "No / Inactive"
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
                        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                          <span className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Pages ({pageItems.length})</span>
                          <div className="space-y-2">
                            {pageItems.slice(0, 3).map((page: any, index: number) => {
                              const pageTitle = typeof page.title === "string" && page.title.trim() ? page.title.trim() : `Page ${index + 1}`;
                              return (
                                <div key={index} className="rounded-md border border-slate-200 bg-white p-2.5">
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
                            className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-blue-50"
                          >
                            View all content
                          </button>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Resolution comment and buttons */}
                  {req.status === "pending" ? (
                    <div className="border-t border-slate-100 pt-3 flex flex-col gap-2 sm:flex-row sm:items-start">
                      <textarea
                        value={comments[req.id] || ""}
                        onChange={(e) =>
                          setComments((prev) => ({ ...prev, [req.id]: e.target.value }))
                        }
                        placeholder="Optional comment explaining the approval or rejection…"
                        aria-label="Review comment"
                        className="w-full flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                        rows={1}
                      />
                      <div className="flex shrink-0 justify-end gap-2">
                        <button
                          type="button"
                          disabled={isSubmitting !== null}
                          onClick={() => handleResolve(req.id, "rejected")}
                          className="rounded-lg border border-rose-200 bg-white px-3.5 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          {isSubmitting === req.id ? "Processing..." : "Reject"}
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting !== null}
                          onClick={() => handleResolve(req.id, "approved")}
                          className="rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                          {isSubmitting === req.id ? "Processing..." : "Approve"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-slate-100 pt-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Review log</p>
                      <div className="mt-1 text-sm text-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-1">
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
                </Card>
              );
            })}
          </div>
        )}

        {/* Password Reset Requests Section */}
        <div className="mt-4">
          <TableCard
            toolbar={
              <>
                <TableTitle title="Password reset requests" />
                <SegmentedTabs
                  label="Filter password reset requests"
                  tabs={(["Pending", "All"] as const).map((t) => ({ id: t, label: t, count: getResetTabCount(t) }))}
                  active={activeResetTab}
                  onChange={setActiveResetTab}
                />
              </>
            }
          >
            <table className={tableClass.table}>
              <thead className={tableClass.thead}>
                <tr>
                  <th scope="col" className={tableClass.th}>Student</th>
                  <th scope="col" className={tableClass.th}>School</th>
                  <th scope="col" className={tableClass.th}>Date</th>
                  <th scope="col" className={tableClass.th}>Status</th>
                  <th scope="col" className={tableClass.thRight}>Action</th>
                </tr>
              </thead>
              <tbody className={tableClass.tbody}>
                {filteredResetRequests.length === 0 ? (
                  <TableMessage colSpan={5}>No password reset requests found.</TableMessage>
                ) : (
                  filteredResetRequests.map((req) => (
                    <tr key={req.id} className={tableClass.tr}>
                      <td className={tableClass.td}>
                        <div className="flex items-center gap-3">
                          <Avatar name={req.studentName || "Unknown Student"} />
                          <div>
                            <div className="font-semibold text-slate-900">{req.studentName || "Unknown Student"}</div>
                            <div className="text-xs text-slate-500">{req.studentId}</div>
                            {req.comment && <div className="text-xs italic text-slate-500">&ldquo;{req.comment}&rdquo;</div>}
                          </div>
                        </div>
                      </td>
                      <td className={tableClass.td}>{req.schoolName}</td>
                      <td className={`${tableClass.td} whitespace-nowrap text-xs`}>
                        {req.status === "pending"
                          ? `Submitted ${new Date(req.createdAt).toLocaleString()}`
                          : `Reviewed ${req.reviewedAt ? new Date(req.reviewedAt).toLocaleString() : "N/A"}`}
                      </td>
                      <td className={tableClass.td}>
                        <Pill tone={statusTone(req.status)}>{req.status}</Pill>
                      </td>
                      <td className={tableClass.tdRight}>
                        {req.status === "pending" ? (
                          <button
                            type="button"
                            onClick={() => {
                              setResetModal({ id: req.id, studentId: req.studentId, studentName: req.studentName });
                              setResetNewPassword("");
                              setResetFeedback(null);
                            }}
                            className="whitespace-nowrap rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                          >
                            Approve &amp; set password
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableCard>
        </div>
      </div>

      {/* Password Reset Modal */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4" onClick={() => setResetModal(null)}>
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
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
