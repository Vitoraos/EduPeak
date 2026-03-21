// backend/src/services/llmService.js
import dotenv from "dotenv";
dotenv.config();
const HF_API_KEY = process.env.LLM_API_KEY;
const LLM_MODEL = "meta-llama/Llama-3.1-8B-Instruct";
const MAX_CHUNK_CHARS = 400;
export async function getLLMResponse({ systemPrompt, userPrompt, contextChunks = [], chatHistory = [] }) {
  try {
    let referenceBlock = null;
    if (contextChunks.length > 0) {
      referenceBlock = contextChunks.map((c, i) => {
        const text = (c.chunk_text || "").slice(0, MAX_CHUNK_CHARS);
        const score = c.similarity != null ? c.similarity.toFixed(2) : "0.00";
        const qid = c.question_id ? "[" + c.question_id + "]\n" : "";
        return "[Reference " + (i+1) + "] (similarity: " + score + ")\n" + qid + text;
      }).join("\n\n---\n\n");
    }
    const historyMessages = chatHistory.slice(-6).flatMap(h => [
      { role: "user", content: h.user_prompt }, { role: "assistant", content: h.ai_response }
    ]);
    let userMessage = userPrompt;
    if (referenceBlock) userMessage = "Relevant JAMB past questions:\n\n" + referenceBlock + "\n\n---\n\nStudent question:\n" + userPrompt;
    const messages = [{ role: "system", content: systemPrompt }, ...historyMessages, { role: "user", content: userMessage }];
    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${LLM_MODEL}/v1/chat/completions`,
      { method: "POST", headers: { Authorization: `Bearer ${HF_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: LLM_MODEL, messages, max_tokens: 700, temperature: 0.35, top_p: 0.9 }) }
    );
    if (!response.ok) { const e = await response.text(); throw new Error(`HF error ${response.status}: ${e}`); }
    const res = await response.json();
    return res?.choices?.[0]?.message?.content?.trim() || "No response generated.";
  } catch (err) {
    console.error("LLM error:", err?.message || err);
    return "Sorry, I could not generate a response. Please try again.";
  }
}
