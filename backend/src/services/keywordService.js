// backend/src/services/keywordService.js
import dotenv from "dotenv";
dotenv.config();
const HF_API_KEY = process.env.LLM_API_KEY;
const LLM_MODEL = "meta-llama/Llama-3.1-8B-Instruct";
export async function extractKeywords(userPrompt, subject) {
  try {
    const messages = [
      { role: "system", content: "You are a JAMB exam keyword extractor. Return ONLY a valid JSON array of 4-7 specific " + subject + " keywords. No explanation, no markdown. Format: [\"kw1\", \"kw2\"]" },
      { role: "user", content: "Student question: \"" + userPrompt + "\"\nSubject: " + subject + "\nReturn JSON array only." }
    ];
    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${LLM_MODEL}/v1/chat/completions`,
      { method: "POST", headers: { Authorization: `Bearer ${HF_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: LLM_MODEL, messages, max_tokens: 80, temperature: 0.1, top_p: 0.9 }) }
    );
    if (!response.ok) { const e = await response.text(); throw new Error(`HF error ${response.status}: ${e}`); }
    const res = await response.json();
    const raw = res?.choices?.[0]?.message?.content?.trim() || "[]";
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const keywords = JSON.parse(cleaned);
    if (!Array.isArray(keywords) || keywords.length === 0) throw new Error("Invalid format");
    console.log("Keywords [" + subject + "] " + JSON.stringify(keywords));
    return keywords;
  } catch (err) {
    console.error("Keyword extraction failed:", err?.message || err);
    const fallback = userPrompt.toLowerCase().replace(/[^a-z0-9\s]/g,"").split(" ")
      .filter(w => w.length > 3 && !["explain","what","when","where","which","does","with","from","that","this","have","will"].includes(w)).slice(0,5);
    return fallback.length > 0 ? fallback : [userPrompt];
  }
}
