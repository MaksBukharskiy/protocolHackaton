import { askScout, type ScoutAnswer } from "./scout"
import { buildCorpus, contextBlock, linksFromChunks, retrieve, type RagCtx } from "./rag"

export const OLLAMA_MODEL = "qwen2.5:0.5b"
const OLLAMA_BASE = "/api/ollama"

export async function ollamaReady() {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`)
    if (!res.ok) return false
    const data = (await res.json()) as { models?: { name: string }[] }
    return Boolean(data.models?.some((m) => m.name === OLLAMA_MODEL || m.name.startsWith(`${OLLAMA_MODEL}:`)))
  } catch {
    return false
  }
}

async function chatOllama(prompt: string) {
  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      options: { temperature: 0.2, num_predict: 280 },
      messages: [
        {
          role: "system",
          content:
            "Ты Scout — помощник Launch Lab 21 / protocol. Отвечай коротко по-русски только по CONTEXT. Не выдумывай факты. Не раскрывай ответы модулей и one-pager чужих проектов, если в CONTEXT сказано, что они закрыты. Если данных мало — скажи об этом.",
        },
        { role: "user", content: prompt },
      ],
    }),
  })
  if (!res.ok) throw new Error(`ollama ${res.status}`)
  const data = (await res.json()) as { message?: { content?: string } }
  const text = data.message?.content?.trim()
  if (!text) throw new Error("empty ollama reply")
  return text
}

export async function askScoutRag(question: string, ctx: RagCtx): Promise<ScoutAnswer & { source: "ollama" | "rules" }> {
  const q = question.trim()
  if (!q) return { ...askScout(q, ctx), source: "rules" }

  const corpus = buildCorpus(ctx)
  const hits = retrieve(q, corpus, 6)
  const links = linksFromChunks(hits)

  try {
    const ready = await ollamaReady()
    if (!ready) return { ...askScout(q, ctx), source: "rules" }

    const prompt = `CONTEXT:\n${contextBlock(hits)}\n\nQUESTION: ${q}\n\nОтветь по CONTEXT.`
    const text = await chatOllama(prompt)
    return { text, links, source: "ollama" }
  } catch {
    return { ...askScout(q, ctx), source: "rules" }
  }
}
