import { useId, useState } from "react"
import { LIMITS } from "../../lib/validation"
import TagChip from "../ui/TagChip"

// Tags as removable chips, plus a box to add more. Enter or a comma adds what was typed.
// suggestions are existing tag names, offered as the user types.
export default function TagInput({ tags, onChange, suggestions = [] }) {
  const id = useId()
  const [text, setText] = useState("")
  const [error, setError] = useState("")
  const full = tags.length >= LIMITS.tags

  const add = (raw) => {
    const name = raw.trim().replace(/\s+/g, " ")
    if (!name) return
    if (name.length > LIMITS.tagName) {
      setError(`Tags must be ${LIMITS.tagName} characters or fewer`)
      return
    }
    if (tags.some((tag) => tag.toLowerCase() === name.toLowerCase())) {
      setText("")
      return
    }
    // Reuse the existing spelling, e.g. "kigali" becomes "Kigali".
    const known = suggestions.find((tag) => tag.toLowerCase() === name.toLowerCase())
    onChange([...tags, known ?? name])
    setText("")
    setError("")
  }

  const onKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      add(text)
    } else if (event.key === "Backspace" && !text && tags.length) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        Tags
      </label>
      <div className="mt-2 flex flex-wrap gap-2">
        {tags.length === 0 && <span className="text-sm text-subtle">No tags yet</span>}
        {tags.map((tag) => (
          <TagChip key={tag} name={tag} onRemove={() => onChange(tags.filter((item) => item !== tag))} />
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          id={id}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          disabled={full}
          maxLength={LIMITS.tagName + 5}
          list={`${id}-list`}
          placeholder={full ? `Up to ${LIMITS.tags} tags` : "Add a tag"}
          className="min-w-0 flex-1 rounded-full border border-line-strong bg-white px-3 py-1.5 text-sm outline-none focus:border-brand disabled:bg-paper"
        />
        <button
          type="button"
          onClick={() => add(text)}
          disabled={full || !text.trim()}
          className="rounded-full border border-line-strong px-3 py-1.5 text-sm font-semibold text-ink hover:border-ink disabled:opacity-50"
        >
          Add
        </button>
        <datalist id={`${id}-list`}>
          {suggestions
            .filter((name) => !tags.includes(name))
            .map((name) => (
              <option key={name} value={name} />
            ))}
        </datalist>
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
}
