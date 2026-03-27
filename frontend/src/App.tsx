
import { useState } from "react";
import { Quiz } from "./types";
import UploadPage from "./components/UploadPage";
import QuizPage from "./components/QuizPage";
import ResultsPage from "./components/ResultsPage";

type AppView = "upload" | "quiz" | "results";

interface ResultsData {
  quiz: Quiz;
  answers: Record<string, string>;
  score: number;
}

export default function App() {
  const [view, setView] = useState<AppView>("upload");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [results, setResults] = useState<ResultsData | null>(null);

  const handleQuizReady = (generatedQuiz: Quiz) => {
    setQuiz(generatedQuiz);
    setView("quiz");
  };

  const handleQuizComplete = (answers: Record<string, string>, score: number) => {
    if (!quiz) return;
    setResults({ quiz, answers, score });
    setView("results");
  };

  const handleRestart = () => {
    setQuiz(null);
    setResults(null);
    setView("upload");
  };

  const handleRetake = () => {
    if (!quiz) return;
    setResults(null);
    setView("quiz");
  };

  return (
    <div className="min-h-screen">
      {view === "upload" && <UploadPage onQuizReady={handleQuizReady} />}
      {view === "quiz" && quiz && (
        <QuizPage quiz={quiz} onComplete={handleQuizComplete} onBack={handleRestart} />
      )}
      {view === "results" && results && (
        <ResultsPage
          quiz={results.quiz}
          answers={results.answers}
          score={results.score}
          onRetake={handleRetake}
          onNewQuiz={handleRestart}
        />
      )}
    </div>
  );
}


