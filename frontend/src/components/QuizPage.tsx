
import { useState } from "react";
import { Quiz, Question } from "../types";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import clsx from "clsx";

interface Props {
  quiz: Quiz;
  onComplete: (answers: Record<string, string>, score: number) => void;
  onBack: () => void;
}

export default function QuizPage({ quiz, onComplete, onBack }: Props) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState("");

  const question = quiz.questions[current];
  const total = quiz.questions.length;
  const progress = (current / total) * 100;
  const selectedAnswer = answers[question.id];

  const handleSelect = (answer: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: answer }));
  };

  const handleNext = () => {
    const finalAnswers = { ...answers };
    if (question.type === "short-answer" && inputValue.trim()) {
      finalAnswers[question.id] = inputValue.trim();
    }

    if (current < total - 1) {
      setAnswers(finalAnswers);
      setCurrent((c) => c + 1);
      setInputValue(finalAnswers[quiz.questions[current + 1]?.id] || "");
    } else {
      let correct = 0;
      for (const q of quiz.questions) {
        const userAns = (finalAnswers[q.id] || "").trim().toLowerCase();
        if (userAns === q.correctAnswer.trim().toLowerCase()) correct++;
      }
      onComplete(finalAnswers, Math.round((correct / total) * 100));
    }
  };

  const handleBack = () => {
    if (current > 0) {
      setCurrent((c) => c - 1);
      setInputValue(answers[quiz.questions[current - 1]?.id] || "");
    }
  };

  const canProceed = question.type === "short-answer"
    ? inputValue.trim().length > 0 || !!selectedAnswer
    : !!selectedAnswer;

  const difficultyColor: Record<Question["difficulty"], string> = {
    easy: "#4ade80",
    medium: "#facc15",
    hard: "#f97066",
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-2xl mb-8 flex items-center gap-4 animate-fade-up">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm transition-colors hover:opacity-70"
          style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
        >
          <ArrowLeft size={14} /> Exit
        </button>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: "var(--accent)" }}
          />
        </div>
        <span className="text-xs tabular-nums" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          {current + 1} / {total}
        </span>
      </div>

      <div className="w-full max-w-2xl mb-2 animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          {quiz.title}
        </p>
      </div>

      <div
        key={question.id}
        className="w-full max-w-2xl rounded-2xl border p-8 space-y-7 animate-fade-up"
        style={{ background: "var(--surface)", borderColor: "var(--border)", animationDelay: "0.1s" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ fontFamily: "var(--font-mono)", color: difficultyColor[question.difficulty], background: `${difficultyColor[question.difficulty]}18` }}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: difficultyColor[question.difficulty] }} />
            {question.difficulty}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            {question.type === "multiple-choice" ? "Multiple choice" : question.type === "true-false" ? "True / False" : "Short answer"}
          </span>
        </div>

        <h2 className="text-xl font-semibold leading-snug" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
          {question.question}
        </h2>

        {(question.type === "multiple-choice" || question.type === "true-false") && question.options && (
          <div className="space-y-3">
            {question.options.map((option) => {
              const selected = selectedAnswer === option;
              return (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  className="w-full text-left px-5 py-4 rounded-xl border transition-all duration-150 text-sm font-medium"
                  style={{
                    borderColor: selected ? "var(--accent)" : "var(--border)",
                    background: selected ? "rgba(124,106,247,0.12)" : "var(--surface-2)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all"
                      style={{ borderColor: selected ? "var(--accent)" : "var(--border)", background: selected ? "var(--accent)" : "transparent" }}
                    >
                      {selected && <CheckCircle size={12} color="#fff" />}
                    </span>
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {question.type === "short-answer" && (
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your answer here…"
            rows={3}
            className="w-full rounded-xl border p-4 text-sm resize-none outline-none transition-all duration-200"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--border)",
              color: "var(--text)",
              fontFamily: "var(--font-mono)",
              fontWeight: 300,
              lineHeight: 1.7,
            }}
          />
        )}
      </div>

      <div className="w-full max-w-2xl mt-6 flex gap-3 animate-fade-up" style={{ animationDelay: "0.15s" }}>
        {current > 0 && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium transition-all hover:opacity-80"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
          >
            <ArrowLeft size={15} /> Back
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-150"
          style={{
            background: canProceed ? "var(--accent)" : "var(--surface-2)",
            color: canProceed ? "#fff" : "var(--text-muted)",
            fontFamily: "var(--font-display)",
            letterSpacing: "0.04em",
            cursor: canProceed ? "pointer" : "not-allowed",
          }}
        >
          {current === total - 1 ? <><span>Submit Quiz</span><CheckCircle size={15} /></> : <><span>Next</span><ArrowRight size={15} /></>}
        </button>
      </div>
    </div>
  );
}

