
import { useState } from "react";
import { Quiz } from "../types";
import { CheckCircle2, XCircle, RotateCcw, Plus, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  quiz: Quiz;
  answers: Record<string, string>;
  score: number;
  onRetake: () => void;
  onNewQuiz: () => void;
}

export default function ResultsPage({ quiz, answers, score, onRetake, onNewQuiz }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const correctCount = quiz.questions.filter((q) =>
    (answers[q.id] || "").trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
  ).length;

  const total = quiz.questions.length;
  const scoreColor = score >= 80 ? "#4ade80" : score >= 50 ? "#facc15" : "#f97066";
  const scoreLabel = score >= 80 ? "Excellent" : score >= 50 ? "Good effort" : "Keep practicing";

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-16">
      <div className="text-center mb-14 animate-fade-up">
        <div
          className="inline-flex items-center justify-center w-28 h-28 rounded-full border-4 mb-6"
          style={{ borderColor: scoreColor, background: `${scoreColor}12`, animation: "pulse-ring 2s ease-in-out infinite" }}
        >
          <span className="text-3xl font-extrabold" style={{ color: scoreColor, fontFamily: "var(--font-display)" }}>
            {score}%
          </span>
        </div>
        <h1 className="text-4xl font-extrabold mb-2 tracking-tight" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>
          {scoreLabel}
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 300 }}>
          {correctCount} of {total} questions correct
        </p>
      </div>

      <div className="flex gap-3 mb-12 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <button
          onClick={onRetake}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium hover:opacity-80 transition-all"
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)", fontFamily: "var(--font-display)" }}
        >
          <RotateCcw size={14} /> Retake
        </button>
        <button
          onClick={onNewQuiz}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-all"
          style={{ background: "var(--accent)", color: "#fff", fontFamily: "var(--font-display)", letterSpacing: "0.04em" }}
        >
          <Plus size={14} /> New Quiz
        </button>
      </div>

      <div className="w-full max-w-2xl animate-fade-up" style={{ animationDelay: "0.15s" }}>
        <h2 className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          Review Answers
        </h2>
        <div className="space-y-3">
          {quiz.questions.map((q, i) => {
            const userAns = (answers[q.id] || "—").trim();
            const isCorrect = userAns.toLowerCase() === q.correctAnswer.trim().toLowerCase();
            const isOpen = expanded === q.id;
            return (
              <div
                key={q.id}
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: isCorrect ? "#4ade8030" : "#f9706630", background: "var(--surface)" }}
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : q.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left"
                >
                  {isCorrect
                    ? <CheckCircle2 size={17} className="shrink-0" style={{ color: "#4ade80" }} />
                    : <XCircle size={17} className="shrink-0" style={{ color: "#f97066" }} />
                  }
                  <span className="flex-1 text-sm font-medium leading-snug" style={{ fontFamily: "var(--font-display)" }}>
                    <span className="text-xs mr-2" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Q{i + 1}</span>
                    {q.question}
                  </span>
                  {isOpen
                    ? <ChevronUp size={15} className="shrink-0" style={{ color: "var(--text-muted)" }} />
                    : <ChevronDown size={15} className="shrink-0" style={{ color: "var(--text-muted)" }} />
                  }
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 space-y-3 text-sm border-t" style={{ borderColor: "var(--border)" }}>
                    <div className="pt-3 space-y-2">
                      <div className="flex gap-2">
                        <span className="text-xs shrink-0 mt-0.5" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Your answer:</span>
                        <span style={{ fontFamily: "var(--font-mono)", color: isCorrect ? "#4ade80" : "#f97066", textDecoration: isCorrect ? "none" : "line-through", opacity: isCorrect ? 1 : 0.6 }}>
                          {userAns}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div className="flex gap-2">
                          <span className="text-xs shrink-0 mt-0.5" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Correct:</span>
                          <span style={{ fontFamily: "var(--font-mono)", color: "#4ade80" }}>{q.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                    <div className="rounded-lg p-3 text-xs leading-relaxed" style={{ background: "var(--surface-2)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                      {q.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

