"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/components/PageHeader";

type Option = {
  id: string;
  text: string;
};

type Question = {
  id: string;
  question: string;
  options: Option[];
  correctIndex: number;
};

type QuizResult = {
  score: number;
  total: number;
  answered: number;
  passed: boolean;
  earnedCredits: number;
  availableEarned: number;
  withheldEarned: number;
  schoolPoints: number;
};

const TIME_PER_QUESTION = 60;

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const contentId = params.contentId as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/quiz/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentId }),
        });

        if (response.status === 401) {
          router.replace("/");
          return;
        }

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to generate quiz.");
        }

        const normalized: Question[] = (payload.questions ?? []).map((q: Record<string, unknown>) => ({
          id: typeof q.id === "string" ? q.id : "",
          question: typeof q.question === "string" ? q.question : "",
          options: Array.isArray(q.options)
            ? q.options.map((opt: Record<string, unknown>) => ({
                id: typeof opt.id === "string" ? opt.id : "",
                text: typeof opt.text === "string" ? opt.text : "",
              }))
            : [],
          correctIndex: typeof q.correctIndex === "number" && Number.isInteger(q.correctIndex) ? q.correctIndex : 0,
        }));

        setQuestions(normalized);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load quiz.");
      } finally {
        setLoading(false);
      }
    };

    void loadQuiz();
  }, [contentId]);

  const submitQuiz = async () => {
    setSubmitting(true);
    setError(null);

      try {
        const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId,
          userAnswers: selectedAnswers,
          questions,
        }),
      });

      const payload = await response.json();

      if (response.status === 401) {
        router.replace("/");
        return;
      }

      if (!response.ok) {
        throw new Error(payload.error || "Unable to submit quiz.");
      }

      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  const goToNext = useRef(() => {});

  goToNext.current = () => {
    if (currentIndex >= questions.length - 1) {
      void submitQuiz();
    } else {
      setCurrentIndex((i) => i + 1);
      setTimeLeft(TIME_PER_QUESTION);
    }
  };

  useEffect(() => {
    if (loading || submitting || result) return;
    if (questions.length === 0) return;

    if (timeLeft <= 0) {
      goToNext.current();
      return;
    }

    const timer = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, loading, submitting, result, questions.length]);

  const handleSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleNext = () => {
    goToNext.current();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col items-center justify-center px-4">
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-950">Generating quiz…</p>
            <p className="mt-2 text-sm text-slate-500">This may take a few seconds.</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col items-center justify-center gap-4 px-4">
          <p className="text-sm text-rose-600">{error}</p>
          <button
            onClick={() => router.push(`/read/${contentId}`)}
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Back to Reading
          </button>
        </main>
      </div>
    );
  }

  if (result) {
    const optionLabels = ["a", "b", "c", "d"];
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col items-center justify-center gap-6 px-4">
          <div className="w-full rounded-[1.75rem] bg-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Quiz Result</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              {result.total > 0 ? `${result.score} / ${result.total}` : "Completed"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {result.passed ? "You passed!" : "Keep trying! You need at least 3 correct answers to unlock the next chapter."}
            </p>
            <div className="mt-4 rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Credits Earned</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">+{result.earnedCredits}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-emerald-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Available</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-700">+{result.availableEarned}</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Withhold</p>
                  <p className="mt-1 text-lg font-semibold text-amber-700">+{result.withheldEarned}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-500">
                School Contribution: <span className="font-semibold text-slate-700">+{result.schoolPoints}</span> points added to your school
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {questions.map((q, idx) => {
                const userOptionId = selectedAnswers[q.id];
                const userIndex = q.options.findIndex((o) => o.id === userOptionId);
                const isCorrect = userIndex === q.correctIndex;
                const optionLetter = (q.options[userIndex]?.id ?? "").toUpperCase();

                return (
                  <div
                    key={q.id}
                    className={`rounded-2xl border p-4 ${
                      isCorrect ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-950">
                      {idx + 1}. {q.question}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Your answer: {optionLetter ? `Option ${optionLetter}` : "Skipped"}
                      {!isCorrect && userIndex >= 0 && (
                        <span className="ml-2 text-emerald-700">
                          (Correct: Option {q.options[q.correctIndex]?.id?.toUpperCase()})
                        </span>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <button
                onClick={() => router.push(`/read/${contentId}`)}
                className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                Continue Reading
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex >= questions.length - 1;
  const progress = Math.round(((currentIndex + 1) / questions.length) * 100);
  const timerPercent = (timeLeft / TIME_PER_QUESTION) * 100;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col px-4 py-6">
        <PageHeader
          backHref={`/read/${contentId}`}
          backLabel="Back to Reading"
          title="Quiz"
          subtitle={`Question ${currentIndex + 1} of ${questions.length}`}
          gradientClass="from-blue-600 via-violet-600 to-fuchsia-600"
          rounded={false}
          className="-mx-4 -mt-6"
        />

        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-4 rounded-[1.75rem] bg-white p-5 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Time left</p>
            <p className={`text-lg font-bold tabular-nums ${timeLeft <= 10 ? "text-rose-600" : "text-slate-950"}`}>
              {timeLeft}s
            </p>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 10 ? "bg-rose-500" : "bg-blue-500"}`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>

          <p className="mt-4 text-base font-semibold text-slate-950">{currentQuestion.question}</p>
          <div className="mt-3 space-y-2">
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedAnswers[currentQuestion.id] === opt.id;
              return (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition cursor-pointer ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={opt.id}
                    checked={isSelected}
                    onChange={() => handleSelect(currentQuestion.id, opt.id)}
                    className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    <span className="font-semibold uppercase">{opt.id.toUpperCase()}.</span> {opt.text}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={submitting}
          className="mt-4 w-full rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isLast ? (submitting ? "Submitting…" : "Submit Quiz") : "Next"}
        </button>
      </main>
    </div>
  );
}
