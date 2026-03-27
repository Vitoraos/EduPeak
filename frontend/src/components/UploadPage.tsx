
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Sparkles, AlertCircle, X } from "lucide-react";
import { Quiz } from "../types";
import { generateQuiz } from "../services/geminiService";
import { extractTextFromPDF, extractImagesFromPDF } from "../services/pdfService";

interface Props {
  onQuizReady: (quiz: Quiz) => void;
}

export default function UploadPage({ onQuizReady }: Props) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (f) { setFile(f); setError(null); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleGenerate = async () => {
    if (!file && !text.trim()) {
      setError("Please upload a PDF or enter some text to generate a quiz.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (file) {
        setLoadingStep("Extracting content from PDF…");
        const [extractedText, images] = await Promise.all([
          extractTextFromPDF(file),
          extractImagesFromPDF(file),
        ]);
        setLoadingStep("Generating quiz with AI…");
        const quiz = await generateQuiz({ text: extractedText, images });
        onQuizReady(quiz);
      } else {
        setLoadingStep("Generating quiz with AI…");
        const quiz = await generateQuiz({ text: text.trim() });
        onQuizReady(quiz);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center mb-14 animate-fade-up">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium mb-6"
          style={{ borderColor: "var(--accent)", color: "var(--accent)", background: "rgba(124,106,247,0.08)", fontFamily: "var(--font-mono)" }}
        >
          <Sparkles size={11} />
          AI-POWERED QUIZ GENERATOR
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight mb-4" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>
          Aether Quiz
        </h1>
        <p className="text-lg max-w-md mx-auto" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 300 }}>
          Drop a PDF or paste text. Get a sharp, adaptive quiz in seconds.
        </p>
      </div>

      <div className="w-full max-w-xl animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <div className="rounded-2xl border p-8 space-y-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>

          <div>
            <label className="block text-xs font-medium mb-2 uppercase tracking-widest" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              Upload PDF
            </label>
            <div
              {...getRootProps()}
              className="relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200"
              style={{
                borderColor: isDragActive ? "var(--accent)" : file ? "var(--accent)" : "var(--border)",
                background: isDragActive ? "rgba(124,106,247,0.06)" : "var(--surface-2)",
              }}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText size={20} style={{ color: "var(--accent)" }} />
                  <span className="font-medium text-sm" style={{ fontFamily: "var(--font-mono)" }}>{file.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="ml-auto p-1 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X size={14} style={{ color: "var(--text-muted)" }} />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload size={24} className="mx-auto" style={{ color: "var(--text-muted)" }} />
                  <p className="text-sm" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                    {isDragActive ? "Drop it here…" : "Drag & drop a PDF, or click to browse"}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>OR</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          <div>
            <label className="block text-xs font-medium mb-2 uppercase tracking-widest" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              Paste Text
            </label>
            <textarea
              value={text}
              onChange={(e) => { setText(e.target.value); setError(null); }}
              placeholder="Paste any article, notes, or study material here…"
              rows={5}
              disabled={!!file}
              className="w-full rounded-xl border p-4 text-sm resize-none outline-none transition-all duration-200"
              style={{
                background: file ? "rgba(255,255,255,0.02)" : "var(--surface-2)",
                borderColor: "var(--border)",
                color: file ? "var(--text-muted)" : "var(--text)",
                fontFamily: "var(--font-mono)",
                fontWeight: 300,
                lineHeight: 1.7,
              }}
            />
            {file && (
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                Text input disabled while a PDF is selected.
              </p>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-xl border px-4 py-3" style={{ borderColor: "#f9706640", background: "#f9706610", color: "#f97066" }}>
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p className="text-sm" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{error}</p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200"
            style={{
              background: loading ? "var(--surface-2)" : "var(--accent)",
              color: loading ? "var(--text-muted)" : "#fff",
              fontFamily: "var(--font-display)",
              letterSpacing: "0.05em",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {loadingStep}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles size={15} />
                Generate Quiz
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

