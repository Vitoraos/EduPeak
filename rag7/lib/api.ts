const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jamb7.onrender.com/api'

export interface ContextChunk {
  question_id: string
  chunk_text: string
  similarity: number
}

export interface ChatResponse {
  aiResponse: string
  contextChunks: ContextChunk[]
}

export interface ChatRequest {
  userPrompt: string
  keywords: string[]
  subject: string | null
  userId?: string
}

export interface KeywordsResponse {
  keywords: string[]
}

/**
 * Step 1: Ask backend to extract JAMB keywords from the student prompt.
 * Backend calls Llama internally — frontend never constructs keywords manually.
 */
export async function extractKeywords(
  userPrompt: string,
  subject: string
): Promise<string[]> {
  const response = await fetch(BASE_URL + '/keywords', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userPrompt, subject }),
  })
  if (!response.ok) {
    throw new Error('Failed to extract keywords: ' + response.status)
  }
  const data: KeywordsResponse = await response.json()
  return data.keywords
}

/**
 * Step 2: Send full chat request with extracted keywords + subject.
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(BASE_URL + '/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!response.ok) {
    throw new Error('API error: ' + response.status + ' ' + response.statusText)
  }
  return response.json()
}
