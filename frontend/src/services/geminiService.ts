import { Quiz } from "../types";

export async function generateQuiz(input: { text?: string, images?: string[] }): Promise<Quiz> {
  const apiUrl = (import.meta as any).env.VITE_API_URL || "";
  const response = await fetch(`${apiUrl}/api/generate-quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to generate quiz content");
  }

  return response.json();
}
