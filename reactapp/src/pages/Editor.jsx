import { useEffect, useRef, useState } from "react"
import AiAssistant from "../components/AiAssistant"
import { api } from "../lib/api"

const TOKEN_KEY = "blog_token"
const STARTER_TAGS = ["Kigali", "transport", "daily life", "food", "school", "tech", "sport", "farming"]
const STARTER_DRAFT =
  "I have taken the Nyabugogo bus every weekday for a month since the lanes opened. The ride itself is not pretty. People still pack the aisle, and the afternoon bus home is loud. What changed is the waiting. On KN 3 the bus used to crawl behind cars that stopped twice in one block. Now it keeps a clearer path, and I get to the office before the standup starts."

const replaceParagraph = (body, selection, improved) => {
  if (!selection) return null
  const current = body.slice(selection.start, selection.end)
  if (current === selection.text) {
    return body.slice(0, selection.start) + improved + body.slice(selection.end)
  }
  const at = body.indexOf(selection.text)
  if (at === -1) return null
  return body.slice(0, at) + improved + body.slice(at + selection.text.length)
}

export default function Editor() {
  const bodyRef = useRef(null)
  const selectionRef = useRef(null)
  const [token, setToken] = useState("")
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [tags, setTags] = useState([])
  const [body, setBody] = useState(STARTER_DRAFT)
  const [authNote, setAuthNote] = useState("")

  useEffect(() => {
    let cancelled = false

    const useDevSession = async () => {
      if (!import.meta.env.DEV) {
        if (!cancelled) setAuthNote("Log in to use the assistant.")
        return
      }
      const payload = await api("/api/ai/dev-session", { method: "POST" })
      localStorage.setItem(TOKEN_KEY, payload.data.token)
      if (!cancelled) setToken(payload.data.token)
    }

    const start = async () => {
      const saved = localStorage.getItem(TOKEN_KEY)
      if (saved) {
        try {
          await api("/api/ai/usage", { token: saved })
          if (!cancelled) setToken(saved)
          return
        } catch (error) {
          if (error.status !== 401) {
            if (!cancelled) setToken(saved)
            return
          }
          localStorage.removeItem(TOKEN_KEY)
        }
      }
      try {
        await useDevSession()
      } catch {
        if (!cancelled) setAuthNote("Log in to use the assistant.")
      }
    }

    start()
    return () => {
      cancelled = true
    }
  }, [])

  const rememberSelection = () => {
    const field = bodyRef.current
    if (!field) return
    selectionRef.current = {
      text: body.slice(field.selectionStart, field.selectionEnd),
      start: field.selectionStart,
      end: field.selectionEnd,
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-2xl border border-[#dfe5e1] bg-white p-4 shadow-sm sm:p-6">
        <p className="text-sm text-[#5d6b66]">
          The assistant never writes the whole post. Accept copies a suggestion into this draft.
        </p>

        <label className="mt-5 grid gap-1 text-sm font-semibold">
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a title, or accept one from the assistant"
            className="rounded-xl border border-[#d5ddd8] px-3 py-2 font-normal"
          />
        </label>

        <label className="mt-4 grid gap-1 text-sm font-semibold">
          Summary
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            rows={3}
            placeholder="The homepage excerpt appears here after you accept it"
            className="rounded-xl border border-[#d5ddd8] px-3 py-2 font-normal"
          />
        </label>

        <div className="mt-4">
          <p className="text-sm font-semibold">Tags</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.length === 0 && <span className="text-sm text-[#5d6b66]">None yet</span>}
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-[#e8f6ee] px-3 py-1 text-sm text-[#0f6b4c]">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <label className="mt-4 grid gap-1 text-sm font-semibold">
          Draft
          <textarea
            ref={bodyRef}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            onSelect={rememberSelection}
            onKeyUp={rememberSelection}
            onMouseUp={rememberSelection}
            rows={16}
            className="rounded-xl border border-[#d5ddd8] px-3 py-3 font-normal leading-7"
          />
        </label>
        {authNote && <p className="mt-3 text-sm text-[#9b2c2c]">{authNote}</p>}
      </section>

      <AiAssistant
        token={token}
        title={title}
        body={body}
        existingTags={STARTER_TAGS}
        getSelection={() => {
          const field = bodyRef.current
          if (!field) return selectionRef.current
          const text = body.slice(field.selectionStart, field.selectionEnd)
          if (text.trim()) {
            return { text, start: field.selectionStart, end: field.selectionEnd }
          }
          return selectionRef.current?.text?.trim() ? selectionRef.current : null
        }}
        onAcceptTitle={setTitle}
        onAcceptSummary={setSummary}
        onAcceptTags={setTags}
        onAcceptParagraph={(selection, improved) => {
          const next = replaceParagraph(body, selection, improved)
          if (next === null) return false
          setBody(next)
          selectionRef.current = null
          return true
        }}
      />
    </div>
  )
}
