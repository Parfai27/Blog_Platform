import { Search, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { api } from "../lib/api"
import { plural } from "../lib/format"
import PostCard from "./PostCard"
import { EmptyState, ErrorMessage, Spinner } from "./ui/States"

const PAGE_SIZE = 12

const CONTROL =
  "rounded-full border border-line-strong bg-white px-4 py-2 text-sm text-ink outline-none focus:border-brand"

// The searchable, filterable list of published stories behind All stories, Search, Category, and Author pages.
// Filters live in the address (?q=&category=&tag=&sort=) so a filtered list can be shared or reloaded.
//   fixed: filters the page itself sets, e.g. { category: "food" } or { author: id }
//   layout: "grid" (cards) or "rows" (the search-results list)
//   onTotal(n): tells the page how many stories match
export default function StoryList({ fixed = {}, layout = "grid", showSearch = true, showCategory = true, onTotal, emptyTitle = "No stories found" }) {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const q = params.get("q") ?? ""
  const tag = params.get("tag") ?? ""
  const sort = params.get("sort") === "oldest" ? "oldest" : "newest"
  const category = fixed.category ?? params.get("category") ?? ""

  const [draft, setDraft] = useState(q)
  const [categories, setCategories] = useState([])
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState("loading")
  const [error, setError] = useState("")
  const [loadingMore, setLoadingMore] = useState(false)
  const [reload, setReload] = useState(0)

  useEffect(() => setDraft(q), [q])

  useEffect(() => {
    if (!showCategory) return
    api("/categories")
      .then((data) => setCategories(data.categories))
      .catch(() => {})
  }, [showCategory])

  const query = useMemo(
    () => ({ search: q, category, tag, author: fixed.author, sort, limit: PAGE_SIZE }),
    [q, category, tag, fixed.author, sort],
  )

  useEffect(() => {
    const controller = new AbortController()
    setStatus("loading")
    api("/posts", { query: { ...query, page: 1 }, signal: controller.signal })
      .then((data) => {
        setPosts(data.posts)
        setPage(1)
        setPages(data.pagination.pages)
        setTotal(data.pagination.total)
        onTotal?.(data.pagination.total)
        setStatus("ready")
      })
      .catch((err) => {
        if (err.name === "AbortError") return
        setError(err.message)
        setStatus("error")
      })
    return () => controller.abort()
    // onTotal is a callback from the page; reloading on its identity would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, reload])

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const data = await api("/posts", { query: { ...query, page: page + 1 } })
      setPosts((current) => [...current, ...data.posts])
      setPage(page + 1)
      setPages(data.pagination.pages)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingMore(false)
    }
  }

  // Changes one filter in the address and keeps the others.
  const setParam = (name, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(name, value)
    else next.delete(name)
    setParams(next)
  }

  const submitSearch = (event) => {
    event.preventDefault()
    setParam("q", draft.trim())
  }

  const changeCategory = (slug) => {
    // On a category page, picking another category goes to that category's page.
    if (fixed.category) {
      const rest = new URLSearchParams(params)
      rest.delete("category")
      const search = rest.toString()
      navigate(slug ? `/categories/${slug}${search ? `?${search}` : ""}` : `/blogs${search ? `?${search}` : ""}`)
      return
    }
    setParam("category", slug)
  }

  // Tag chips come from the stories on screen, so they are always ones that match something.
  const tagChoices = useMemo(() => {
    const seen = new Map()
    for (const post of posts) for (const item of post.tags) if (!seen.has(item.slug)) seen.set(item.slug, item.name)
    return [...seen].slice(0, 8)
  }, [posts])
  const activeTagName = tagChoices.find(([slug]) => slug === tag)?.[1] ?? tag

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {showSearch && (
          <form onSubmit={submitSearch} role="search" className="flex flex-1 gap-2">
            <label className="sr-only" htmlFor="story-search">
              Search stories
            </label>
            <input
              id="story-search"
              type="search"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={fixed.category ? "Search in this category" : "Search stories"}
              className={`${CONTROL} min-w-0 flex-1`}
            />
            <button type="submit" className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-black">
              <Search className="h-4 w-4" aria-hidden="true" />
              Search
            </button>
          </form>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {showCategory && (
            <label className="text-sm">
              <span className="sr-only">Category</span>
              <select value={category} onChange={(event) => changeCategory(event.target.value)} className={CONTROL}>
                <option value="">All categories</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="text-sm">
            <span className="sr-only">Sort</span>
            <select value={sort} onChange={(event) => setParam("sort", event.target.value === "newest" ? "" : event.target.value)} className={CONTROL}>
              <option value="newest">Sort by Newest</option>
              <option value="oldest">Sort by Oldest</option>
            </select>
          </label>
        </div>
      </div>

      {(tagChoices.length > 0 || tag) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-subtle">Tags:</span>
          {tag && !tagChoices.some(([slug]) => slug === tag) && (
            <button type="button" onClick={() => setParam("tag", "")} className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-xs font-medium text-white">
              {activeTagName}
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          )}
          {tagChoices.map(([slug, name]) => (
            <button
              key={slug}
              type="button"
              aria-pressed={tag === slug}
              onClick={() => setParam("tag", tag === slug ? "" : slug)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition ${
                tag === slug ? "border-brand bg-brand text-white" : "border-brand/25 bg-brand-soft text-brand hover:border-brand"
              }`}
            >
              {name}
              {tag === slug && <X className="h-3 w-3" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6">
        {status === "loading" && (
          <div className="flex items-center justify-center gap-3 py-16 text-sm text-muted">
            <Spinner />
            Loading stories...
          </div>
        )}

        {status === "error" && <ErrorMessage message={error} onRetry={() => setReload((count) => count + 1)} />}

        {status === "ready" && posts.length === 0 && (
          <EmptyState title={emptyTitle}>
            {q || tag || (category && !fixed.category) ? (
              <button type="button" onClick={() => setParams({})} className="font-semibold text-brand hover:underline">
                Clear the filters
              </button>
            ) : (
              <Link to="/write" className="font-semibold text-brand hover:underline">
                Write the first one
              </Link>
            )}
          </EmptyState>
        )}

        {status === "ready" && posts.length > 0 &&
          (layout === "rows" ? (
            <div className="border-t border-line">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} layout="row" />
              ))}
            </div>
          ) : (
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} showMeta />
              ))}
            </div>
          ))}

        {status === "ready" && page < pages && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="rounded-full border border-line-strong bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:border-ink disabled:opacity-60"
            >
              {loadingMore ? "Loading..." : `Show more (${plural(total - posts.length, "story", "stories")} left)`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
