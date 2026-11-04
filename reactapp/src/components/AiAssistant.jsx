import { useEffect, useState } from "react"
import { api } from "../lib/api"

const ACTIONS = [
  { id: "titles", label: "Suggest titles", path: "/api/ai/titles" },
  { id: "summary", label: "Write a summary", path: "/api/ai/summary" },
  { id: "tags", label: "Suggest tags", path: "/api/ai/tags" },
  { id: "improve", label: "Improve this paragraph", path: "/api/ai/improve" },
]

const emptySuggestion = () => ({
  kind: "",
  titles: [],
  chosenTitle: "",
  summary: "",
  tags: "",
  improved: "",
  original: "",
  mock: false,
})

export default function AiAssistant({
  token,
  title,
  body,
  existingTags,
  getSelection,
  onAcceptTitle,
  onAcceptSummary,
  onAcceptTags,
  onAcceptParagraph,
}) {
  const [usage, setUsage] = useState(null)
  const [pending, setPending] = useState("")
  const [message, setMessage] = useState("")
  const [messageTone, setMessageTone] = useState("error")
  const [suggestion, setSuggestion] = useState(emptySuggestion)

  useEffect(() => {
    if (!token) return
    api("/api/ai/usage", { token })
      .then((payload) => setUsage(payload.data))
      .catch(() => {})
  }, [token])

  const ask = async (action) => {
    setMessage("")
    setSuggestion(emptySuggestion())

    let bodyPayload
    let selection = null
    if (action.id === "improve") {
      selection = getSelection()
      if (!selection?.text?.trim()) {
        setMessageTone("error")
        setMessage("Select a paragraph in the draft first.")
        return
      }
      bodyPayload = { paragraph: selection.text }
    } else {
      bodyPayload = { draft: body, title, existingTags }
    }

    setPending(action.id)
    try {
      const payload = await api(action.path, { token, method: "POST", body: bodyPayload })
      const data = payload.data
      setUsage(data.usage)
      setSuggestion({
        kind: action.id,
        titles: data.titles || [],
        chosenTitle: data.titles?.[0] || "",
        summary: data.summary || "",
        tags: (data.tags || []).join(", "),
        improved: data.improved || "",
        original: selection?.text || "",
        range: selection,
        mock: Boolean(data.mock),
      })
    } catch (error) {
      setMessageTone("error")
      setMessage(error.message || "The assistant is unavailable right now. Keep writing and try again.")
      if (token) {
        api("/api/ai/usage", { token })
          .then((payload) => setUsage(payload.data))
          .catch(() => {})
      }
    } finally {
      setPending("")
    }
  }

  const accept = () => {
    if (suggestion.kind === "titles") {
      const next = suggestion.chosenTitle.trim()
      if (!next) return
      onAcceptTitle(next)
    }
    if (suggestion.kind === "summary") {
      const next = suggestion.summary.trim()
      if (!next) return
      onAcceptSummary(next)
    }
    if (suggestion.kind === "tags") {
      const next = suggestion.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
      if (next.length === 0) return
      onAcceptTags(next)
    }
    if (suggestion.kind === "improve") {
      const next = suggestion.improved.trim()
      if (!next || !suggestion.range) return
      const replaced = onAcceptParagraph(suggestion.range, next)
      if (!replaced) {
        setMessageTone("error")
        setMessage("The paragraph changed. Select it again.")
        return
      }
    }
    setSuggestion(emptySuggestion())
    setMessageTone("ok")
    setMessage("Added to the draft.")
  }

  return (
    <aside className="rounded-2xl border border-[#dfe5e1] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold">AI assistant</h2>
          <p className="mt-1 text-sm text-[#5d6b66]">
            Suggestions stay here until you edit them and click Accept.
          </p>
        </div>
        {usage && (
          <p className="shrink-0 text-xs font-semibold text-[#0f6b4c]">
            {usage.remaining} of {usage.limit} left today
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-2">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            disabled={!token || pending !== ""}
            onClick={() => ask(action)}
            className="rounded-xl border border-[#d5ddd8] px-3 py-2 text-left text-sm font-semibold enabled:hover:border-[#0f6b4c] enabled:hover:bg-[#f3faf6] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending === action.id ? "Working…" : action.label}
          </button>
        ))}
      </div>

      {message && (
        <p
          className={`mt-4 rounded-xl px-3 py-2 text-sm ${
            messageTone === "ok" ? "bg-[#e8f6ee] text-[#0f6b4c]" : "bg-[#fff1f0] text-[#9b2c2c]"
          }`}
        >
          {message}
        </p>
      )}

      {suggestion.kind && (
        <div className="mt-4 rounded-xl bg-[#f6f7f4] p-3">
          {suggestion.mock && (
            <p className="mb-3 text-xs text-[#5d6b66]">
              Local preview. Set LLM_API_KEY and turn MOCK_AI off for a real model.
            </p>
          )}

          {suggestion.kind === "titles" && (
            <div className="grid gap-2">
              {suggestion.titles.map((option, index) => (
                <label key={`${option}-${index}`} className="flex items-start gap-2 text-sm">
                  <input
                    type="radio"
                    name="title-option"
                    className="mt-1"
                    checked={suggestion.chosenTitle === option}
                    onChange={() => setSuggestion((current) => ({ ...current, chosenTitle: option }))}
                  />
                  <span>{option}</span>
                </label>
              ))}
              <label className="mt-2 grid gap-1 text-sm font-medium">
                Edit before accepting
                <input
                  value={suggestion.chosenTitle}
                  onChange={(event) =>
                    setSuggestion((current) => ({ ...current, chosenTitle: event.target.value }))
                  }
                  className="rounded-lg border border-[#d5ddd8] bg-white px-3 py-2"
                />
              </label>
            </div>
          )}

          {suggestion.kind === "summary" && (
            <label className="grid gap-1 text-sm font-medium">
              Summary
              <textarea
                value={suggestion.summary}
                onChange={(event) =>
                  setSuggestion((current) => ({ ...current, summary: event.target.value }))
                }
                rows={4}
                className="rounded-lg border border-[#d5ddd8] bg-white px-3 py-2"
              />
            </label>
          )}

          {suggestion.kind === "tags" && (
            <label className="grid gap-1 text-sm font-medium">
              Tags, separated by commas
              <input
                value={suggestion.tags}
                onChange={(event) =>
                  setSuggestion((current) => ({ ...current, tags: event.target.value }))
                }
                className="rounded-lg border border-[#d5ddd8] bg-white px-3 py-2"
              />
            </label>
          )}

          {suggestion.kind === "improve" && (
            <div className="grid gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#5d6b66]">Before</p>
                <p className="mt-1 text-sm leading-6">{suggestion.original}</p>
              </div>
              <label className="grid gap-1 text-sm font-medium">
                After
                <textarea
                  value={suggestion.improved}
                  onChange={(event) =>
                    setSuggestion((current) => ({ ...current, improved: event.target.value }))
                  }
                  rows={5}
                  className="rounded-lg border border-[#d5ddd8] bg-white px-3 py-2"
                />
              </label>
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={accept}
              className="rounded-lg bg-[#0f6b4c] px-3 py-2 text-sm font-semibold text-white"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => setSuggestion(emptySuggestion())}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-[#5d6b66]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
