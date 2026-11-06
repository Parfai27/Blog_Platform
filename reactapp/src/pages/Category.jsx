import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import StoryList from "../components/StoryList"
import { ErrorMessage, PageLoading } from "../components/ui/States"
import { api } from "../lib/api"
import { plural } from "../lib/format"
import { usePageTitle } from "../lib/usePageTitle"
import NotFound from "./NotFound"

// The Figma "Category – Food" page: name, description, story count, then its stories.
export default function Category() {
  const { slug } = useParams()
  const [category, setCategory] = useState(null)
  const [status, setStatus] = useState("loading")
  const [error, setError] = useState("")
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let cancelled = false
    setStatus("loading")
    api(`/categories/${encodeURIComponent(slug)}`)
      .then((data) => {
        if (cancelled) return
        setCategory(data.category)
        setStatus("ready")
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
        setStatus(err.status === 404 ? "missing" : "error")
      })
    return () => {
      cancelled = true
    }
  }, [slug, reload])

  usePageTitle(category?.name)

  if (status === "loading") return <PageLoading />
  if (status === "missing") return <NotFound />
  if (status === "error") {
    return (
      <div className="px-6 py-24">
        <ErrorMessage message={error} onRetry={() => setReload((count) => count + 1)} />
      </div>
    )
  }

  return (
    <div className="bg-paper px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="text-xs text-subtle">
          <Link to="/" className="hover:text-ink">
            Home
          </Link>
          {" / "}
          <Link to="/blogs" className="hover:text-ink">
            Categories
          </Link>
          {" / "}
          <span className="text-ink-soft">{category.name}</span>
        </nav>
        <h1 className="mt-3 font-serif text-5xl tracking-tight text-ink">{category.name}</h1>
        <p className="mt-3 text-sm text-muted">
          {category.description && `${category.description} `}
          {plural(category.postCount ?? 0, "story", "stories")}.
        </p>
        <div className="mt-8">
          <StoryList key={slug} fixed={{ category: slug }} emptyTitle={`No ${category.name} stories yet`} />
        </div>
      </div>
    </div>
  )
}
