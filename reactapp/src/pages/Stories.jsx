import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import StoryList from "../components/StoryList"
import { plural } from "../lib/format"
import { usePageTitle } from "../lib/usePageTitle"

// /blogs lists every published story. /search?q= is the same list with a search word,
// shown as rows like the "Results for" page in the Figma.
export default function Stories({ mode = "all" }) {
  const [params] = useSearchParams()
  const [total, setTotal] = useState(null)
  const q = params.get("q") ?? ""
  const searching = mode === "search"

  const title = searching ? (q ? `Results for “${q}”` : "Search stories") : "All stories"
  usePageTitle(searching ? (q ? `Search: ${q}` : "Search") : "All stories")
  const count = total === null ? "" : plural(total, "story", "stories")

  return (
    <div className="bg-paper px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-serif text-4xl tracking-tight text-ink sm:text-5xl">{title}</h1>
        <p className="mt-2 text-sm text-muted">
          {searching && !q ? "Type a word to search titles, summaries, and stories." : count}
        </p>
        <div className="mt-8">
          <StoryList layout={searching ? "rows" : "grid"} onTotal={setTotal} emptyTitle={searching ? "No stories match that search" : "No stories yet"} />
        </div>
      </div>
    </div>
  )
}
