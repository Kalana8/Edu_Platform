"use client";

import { useState } from "react";
import { setUser as saveUser } from "@/lib/session";

export default function CreateStudentIdClient({ schoolCode }: { schoolCode: string }) {
    const [studentNumber, setStudentNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fullStudentId = studentNumber ? `${schoolCode}-${studentNumber}` : "";

    const handleContinue = async () => {
        if (!fullStudentId) {
            setError("Please enter a student number.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/students/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    schoolCode: schoolCode.trim(),
                    studentNumber: studentNumber.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Unable to create student ID.");
                setLoading(false);
                return;
            }

            const sessionResponse = await fetch("/api/auth/student-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId: fullStudentId }),
            });

            if (sessionResponse.ok) {
                const sessionData = await sessionResponse.json();
                if (sessionData.user) saveUser(sessionData.user);
                window.location.href = "/home";
            } else {
                window.location.href = `/credits?code=${encodeURIComponent(schoolCode)}&studentId=${encodeURIComponent(fullStudentId)}`;
            }
        } catch (err) {
            console.error("Student registration error:", err);
            setError("An error occurred. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-950">
            <main className="mx-auto flex min-h-screen w-full max-w-[425px] flex-col px-4 py-8">
                <div className="space-y-4">
                    <h1 className="text-3xl font-semibold tracking-tight">Create Your Student ID</h1>
                    <div className="mx-auto max-w-xl rounded-2xl border-none bg-blue-50 p-5 text-left text-sm text-gray-700 shadow-none">
                        Your Student ID helps track your individual progress. You can customize it later in settings.
                    </div>
                </div>

                <div className="mt-8 space-y-5">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-900">Enter Student Number</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="e.g. 1, 42, 999"
                            value={studentNumber}
                            onChange={(e) => setStudentNumber(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-base text-slate-900 outline-none ring-1 ring-transparent transition focus:border-slate-300 focus:ring-slate-200"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-900">Your Student ID</label>
                        <input
                            type="text"
                            readOnly
                            value={fullStudentId}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-100 p-4 text-base text-slate-900 outline-none cursor-not-allowed"
                        />
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <button
                        onClick={handleContinue}
                        disabled={loading || !fullStudentId}
                        className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-500 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-600 disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Continue"}
                    </button>
                </div>
            </main>
        </div>
    );
}