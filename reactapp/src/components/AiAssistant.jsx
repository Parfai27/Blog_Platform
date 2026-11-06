import { useEffect, useState } from "react"
import { api } from "../lib/api"

const ACTIONS = [
  { id: "titles", label: "Suggest titles", path: "/ai/titles" },
  { id: "summary", label: "Write a summary", path: "/ai/summary" },
  { id: "tags", label: "Suggest tags", path: "/ai/tags" },
  { id: "improve", label: "Improve this paragraph", path: "/ai/improve" },
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

// enabled: true once there is a token the AI routes accept (a login or the dev session).
export default function AiAssistant({
  enabled,
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
    if (!enabled) return
    api("/ai/usage")
      .then(setUsage)
      .catch(() => {})
  }, [enabled])

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
      const data = await api(action.path, { method: "POST", body: bodyPayload })
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
      if (enabled) {
        api("/ai/usage")
          .then(setUsage)
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
    <aside className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold">AI assistant</h2>
          <p className="mt-1 text-sm text-muted">
            Suggestions stay here until you edit them and click Accept.
          </p>
        </div>
        {usage && (
          <p className="shrink-0 text-xs font-semibold text-brand">
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
            disabled={!enabled || pending !== ""}
            onClick={() => ask(action)}
            className="rounded-xl border border-line-strong px-3 py-2 text-left text-sm font-semibold enabled:hover:border-brand enabled:hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending === action.id ? "Working…" : action.label}
          </button>
        ))}
      </div>

      {message && (
        <p
          className={`mt-4 rounded-xl px-3 py-2 text-sm ${
            messageTone === "ok" ? "bg-brand-soft text-brand" : "bg-danger-soft text-danger"
          }`}
        >
          {message}
        </p>
      )}

      {suggestion.kind && (
        <div className="mt-4 rounded-xl bg-paper p-3">
          {suggestion.mock && (
            <p className="mb-3 text-xs text-muted">
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
                  className="rounded-lg border border-line-strong bg-white px-3 py-2"
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
                className="rounded-lg border border-line-strong bg-white px-3 py-2"
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
                className="rounded-lg border border-line-strong bg-white px-3 py-2"
              />
            </label>
          )}

          {suggestion.kind === "improve" && (
            <div className="grid gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Before</p>
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
                  className="rounded-lg border border-line-strong bg-white px-3 py-2"
                />
              </label>
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={accept}
              className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => setSuggestion(emptySuggestion())}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-muted"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
