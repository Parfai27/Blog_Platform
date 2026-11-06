export const fullName = (person) =>
  [person?.firstName, person?.lastName].filter(Boolean).join(" ").trim()

export const initials = (person) => {
  const letters = [person?.firstName, person?.lastName]
    .map((part) => part?.trim()?.[0] ?? "")
    .join("")
  return letters.toUpperCase() || "?"
}

// "Oct 21, 2026"
export const formatDate = (value) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

// "just now", "5 min ago", "3 h ago", "2 days ago", then the date.
export const timeAgo = (value) => {
  const time = new Date(value).getTime()
  if (Number.isNaN(time)) return ""
  const seconds = Math.max(0, (Date.now() - time) / 1000)
  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`
  if (seconds < 7 * 86400) return plural(Math.floor(seconds / 86400), "day") + " ago"
  return formatDate(value)
}

// Splits a post body into paragraphs at line breaks.
export const paragraphs = (text) =>
  (text ?? "")
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean)

export const formatReadTime = (minutes) => (minutes ? `${minutes} min read` : "")

export const plural = (count, word, many = `${word}s`) => `${count} ${count === 1 ? word : many}`

// 1400 -> "1.4k", as on the author profile in the Figma.
export const compactNumber = (value) =>
  new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value ?? 0).toLowerCase()

// "Joined Mar 2026"
export const formatMonth = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}
