import { Eye, EyeOff, Pencil, Send, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import Badge from "../components/ui/Badge"
import Button from "../components/ui/Button"
import { FormError } from "../components/ui/Field"
import { EmptyState, ErrorMessage, Spinner } from "../components/ui/States"
import { api } from "../lib/api"
import { usePageTitle } from "../lib/usePageTitle"
import { formatDate, plural } from "../lib/format"

const FILTERS = [
  { value: "", label: "All" },
  { value: "draft", label: "Drafts" },
  { value: "published", label: "Published" },
]

const PAGE_SIZE = 12

export default function MyPosts() {
  usePageTitle("My posts")
  const [params, setParams] = useSearchParams()
  const filter = params.get("status") ?? ""
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState("loading")
  const [error, setError] = useState("")
  const [actionError, setActionError] = useState("")
  const [busyId, setBusyId] = useState("")
  const [loadingMore, setLoadingMore] = useState(false)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let cancelled = false
    setStatus("loading")
    api("/posts/mine", { query: { status: filter, page: 1, limit: PAGE_SIZE } })
      .then((data) => {
        if (cancelled) return
        setPosts(data.posts)
        setPage(1)
        setPages(data.pagination.pages)
        setTotal(data.pagination.total)
        setStatus("ready")
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
        setStatus("error")
      })
    return () => {
      cancelled = true
    }
  }, [filter, reload])

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const data = await api("/posts/mine", { query: { status: filter, page: page + 1, limit: PAGE_SIZE } })
      setPosts((current) => [...current, ...data.posts])
      setPage(page + 1)
      setPages(data.pagination.pages)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setLoadingMore(false)
    }
  }

  // Runs an action on one post and swaps in the updated post, or drops it when it no longer fits the filter.
  const act = async (post, action) => {
    setBusyId(post.id)
    setActionError("")
    try {
      const updated = await action()
      setPosts((current) =>
        current.flatMap((item) => {
          if (item.id !== post.id) return [item]
          if (!updated || (filter && updated.status !== filter)) return []
          return [updated]
        }),
      )
      if (!updated || (filter && updated.status !== filter)) setTotal((count) => count - 1)
    } catch (err) {
      setActionError(`"${post.title}": ${err.message}`)
    } finally {
      setBusyId("")
    }
  }

  const publish = (post) => act(post, async () => (await api(`/posts/${post.id}/publish`, { method: "POST" })).post)

  const unpublish = (post) => {
    if (!window.confirm(`Move "${post.title}" back to drafts? It will leave the public site.`)) return
    act(post, async () => (await api(`/posts/${post.id}/unpublish`, { method: "POST" })).post)
  }

  const remove = (post) => {
    if (!window.confirm(`Delete "${post.title}"? Its comments and likes go too. This cannot be undone.`)) return
    act(post, async () => {
      await api(`/posts/${post.id}`, { method: "DELETE" })
      return null
    })
  }

  return (
    <div className="bg-paper px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl tracking-tight text-ink">My posts</h1>
            <p className="mt-1 text-sm text-muted">Drafts are private. Published posts appear on the public site.</p>
          </div>
          <Button to="/write">Write a post</Button>
        </div>

        <div className="mt-6 flex gap-2" role="tablist" aria-label="Filter posts">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={filter === option.value}
              onClick={() => setParams(option.value ? { status: option.value } : {})}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                filter === option.value ? "bg-ink text-white" : "bg-white text-ink-soft hover:text-ink"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3">
          <FormError>{actionError}</FormError>

          {status === "loading" && (
            <div className="flex items-center justify-center gap-3 py-16 text-sm text-muted">
              <Spinner />
              Loading your posts...
            </div>
          )}

          {status === "error" && <ErrorMessage message={error} onRetry={() => setReload((count) => count + 1)} />}

          {status === "ready" && posts.length === 0 && (
            <div className="rounded-2xl bg-white">
              <EmptyState title={filter === "draft" ? "No drafts" : filter === "published" ? "Nothing published yet" : "You haven't written anything yet"}>
                <Link to="/write" className="font-semibold text-brand hover:underline">
                  Start a new post
                </Link>
              </EmptyState>
            </div>
          )}

          {posts.map((post) => {
            const published = post.status === "published"
            const busy = busyId === post.id
            return (
              <article key={post.id} className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  {post.coverImage?.url ? (
                    <img src={post.coverImage.url} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="h-16 w-24 shrink-0 rounded-lg bg-brand-soft" />
                  )}
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-ink">
                      <Link to={`/write/${post.id}`} className="hover:underline">
                        {post.title}
                      </Link>
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-subtle">
                      <Badge status={post.status} />
                      {post.category && <span>{post.category.name}</span>}
                      <span>
                        {published ? `Published ${formatDate(post.publishedAt)}` : `Edited ${formatDate(post.updatedAt)}`}
                      </span>
                      {published && (
                        <span>
                          · {post.likeCount} likes · {post.commentCount} comments
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button to={`/write/${post.id}`} variant="secondary" size="sm">
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit
                  </Button>
                  {published ? (
                    <>
                      <Button to={`/posts/${post.slug}`} variant="secondary" size="sm">
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => unpublish(post)} disabled={busy}>
                        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                        Unpublish
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={() => publish(post)} disabled={busy}>
                      <Send className="h-3.5 w-3.5" aria-hidden="true" />
                      Publish
                    </Button>
                  )}
                  <Button variant="danger" size="sm" onClick={() => remove(post)} disabled={busy}>
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Delete
                  </Button>
                </div>
              </article>
            )
          })}

          {status === "ready" && page < pages && (
            <div className="text-center">
              <Button variant="secondary" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? "Loading..." : "Show more"}
              </Button>
            </div>
          )}

          {status === "ready" && total > 0 && (
            <p className="text-center text-xs text-subtle">
              {filter === "draft" ? plural(total, "draft") : filter === "published" ? `${plural(total, "post")} published` : plural(total, "post")}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
