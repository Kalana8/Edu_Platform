"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function CreditsPageClient({ studentId }: { studentId: string }) {
    useEffect(() => {
        if (!studentId) return;

        const establishSession = async () => {
            try {
                const response = await fetch("/api/auth/student-session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ studentId }),
                });

                if (response.ok) {
                    window.location.href = "/home";
                }
            } catch (err) {
                console.error("Student session error:", err);
            }
        };

        establishSession();
    }, [studentId]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-950">
            <main className="mx-auto flex min-h-screen w-full max-w-[425px] flex-col px-4 py-8">
                <div className="space-y-4 ">
                    <h1 className="text-3xl font-semibold ">How Credits Work</h1>
                </div>

                <div className="mt-8 space-y-4">
                    <div className="rounded-2xl bg-white p-5 shadow-[0_28px_60px_-30px_rgba(15,23,42,0.35)]">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-lg  text-slate-950">68% Available</p>
                                <p className="mt-2 text-sm text-slate-500">Use credits to boost your progress</p>
                            </div>
                            <span className="rounded-2xl bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700">68%</span>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-[0_28px_60px_-30px_rgba(15,23,42,0.35)]">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-lg  text-slate-950">32% Withhold</p>
                                <p className="mt-2 text-sm text-slate-500">Unlocked after consistency</p>
                            </div>
                            <span className="rounded-2xl bg-amber-50 px-4 py-1 text-sm font-semibold text-amber-700">32%</span>
                        </div>
                    </div>
                </div>

                <div className="mt-10">
                    <Link
                        href="/home"
                        className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                    >
                        Go to Home
                    </Link>
                </div>
            </main>
        </div>
    );
}