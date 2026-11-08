import { Flag, MessageCircle, Send, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../context/auth-context"
import { api } from "../../lib/api"
import { fullName, timeAgo } from "../../lib/format"
import Avatar from "../ui/Avatar"
import Button from "../ui/Button"
import { ErrorMessage, Spinner } from "../ui/States"

const COMMENT_MAX = 1000
const PAGE_SIZE = 20

// The comments section under a post. onReport(target) opens the report form.
export default function Comments({ postId, initialCount, onReport }) {
  const { user, isAdmin } = useAuth()
  const location = useLocation()
  const [comments, setComments] = useState([])
  const [total, setTotal] = useState(initialCount)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [status, setStatus] = useState("loading")
  const [error, setError] = useState("")
  const [loadingMore, setLoadingMore] = useState(false)
  const [draft, setDraft] = useState("")
  const [posting, setPosting] = useState(false)
  const [formError, setFormError] = useState("")
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let cancelled = false
    setStatus("loading")
    api(`/posts/${postId}/comments`, { query: { page: 1, limit: PAGE_SIZE } })
      .then((data) => {
        if (cancelled) return
        setComments(data.comments)
        setTotal(data.pagination.total)
        setPage(1)
        setPages(data.pagination.pages)
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
  }, [postId, reload])

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const data = await api(`/posts/${postId}/comments`, { query: { page: page + 1, limit: PAGE_SIZE } })
      setComments((current) => [...current, ...data.comments])
      setPage(page + 1)
      setPages(data.pagination.pages)
      setTotal(data.pagination.total)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setLoadingMore(false)
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    const body = draft.trim()
    if (!body) return
    setPosting(true)
    setFormError("")
    try {
      const data = await api(`/posts/${postId}/comments`, { method: "POST", body: { body } })
      setComments((current) => [...current, data.comment])
      setTotal((count) => count + 1)
      setDraft("")
    } catch (err) {
      setFormError(err.message)
    } finally {
      setPosting(false)
    }
  }

  const remove = async (comment) => {
    if (!window.confirm("Delete this comment?")) return
    try {
      await api(`/comments/${comment.id}`, { method: "DELETE" })
      setComments((current) => current.filter((item) => item.id !== comment.id))
      setTotal((count) => Math.max(0, count - 1))
    } catch (err) {
      setFormError(err.message)
    }
  }

  const next = encodeURIComponent(location.pathname)

  return (
    <section className="mt-14 border-t border-line pt-10" aria-labelledby="comments-title">
      <h2 id="comments-title" className="flex items-center gap-2 font-serif text-2xl text-ink">
        <MessageCircle className="h-5 w-5 text-brand" aria-hidden="true" />
        Comments ({total})
      </h2>

      {user ? (
        <form onSubmit={submit} className="mt-5">
          <label htmlFor="new-comment" className="text-sm font-semibold text-ink">
            Add a comment
          </label>
          <textarea
            id="new-comment"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={COMMENT_MAX}
            rows={3}
            placeholder="Share your thoughts..."
            className="mt-2 w-full rounded-xl border border-line-strong bg-white px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-xs text-subtle">
              {draft.length}/{COMMENT_MAX}
            </span>
            <Button type="submit" disabled={posting || !draft.trim()}>
              <Send className="h-4 w-4" aria-hidden="true" />
              {posting ? "Posting..." : "Post comment"}
            </Button>
          </div>
        </form>
      ) : (
        <p className="mt-5 rounded-xl bg-paper px-4 py-3 text-sm text-muted">
          <Link to={`/login?next=${next}`} className="font-semibold text-brand hover:underline">
            Log in
          </Link>{" "}
          or{" "}
          <Link to="/register" className="font-semibold text-brand hover:underline">
            sign up
          </Link>{" "}
          to join the conversation.
        </p>
      )}

      {formError && <p className="mt-3 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{formError}</p>}

      <div className="mt-8">
        {status === "loading" && (
          <div className="flex items-center gap-3 text-sm text-muted">
            <Spinner />
            Loading comments...
          </div>
        )}
        {status === "error" && <ErrorMessage message={error} onRetry={() => setReload((count) => count + 1)} />}
        {status === "ready" && comments.length === 0 && <p className="text-sm text-muted">No comments yet. Start the conversation.</p>}

        <ul className="divide-y divide-line">
          {comments.map((comment) => {
            const mine = user && comment.author?.id === user.id
            return (
              <li key={comment.id} className="flex gap-3 py-4">
                <Avatar person={comment.author} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="text-sm">
                      {comment.author ? (
                        <Link to={`/authors/${comment.author.id}`} className="font-semibold text-ink hover:underline">
                          {fullName(comment.author)}
                        </Link>
                      ) : (
                        <span className="font-semibold text-muted">Deleted account</span>
                      )}
                      <span className="ml-2 text-xs text-subtle">{timeAgo(comment.createdAt)}</span>
                    </p>
                    <div className="flex gap-3 text-xs">
                      {(mine || isAdmin) && (
                        <button type="button" onClick={() => remove(comment)} className="inline-flex items-center gap-1 font-semibold text-subtle hover:text-danger">
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Delete
                        </button>
                      )}
                      {!mine && (
                        <button
                          type="button"
                          onClick={() => onReport({ type: "comment", id: comment.id, name: "" })}
                          className="inline-flex items-center gap-1 font-semibold text-subtle hover:text-ink"
                        >
                          <Flag className="h-3.5 w-3.5" aria-hidden="true" />
                          Report
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-sm leading-6 whitespace-pre-line text-ink-soft">{comment.body}</p>
                </div>
              </li>
            )
          })}
        </ul>

        {status === "ready" && page < pages && (
          <Button variant="secondary" className="mt-4" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Loading..." : "Show more comments"}
          </Button>
        )}
      </div>
    </section>
  )
}
