import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/auth-context"
import { api } from "../../lib/api"

function Heart({ filled }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// The heart with the like count. Visitors are sent to log in first.
export default function LikeButton({ postId, initialCount }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [busy, setBusy] = useState(false)

  // A logged-in reader needs to know whether they already liked it.
  useEffect(() => {
    if (!user) {
      setLiked(false)
      return
    }
    let cancelled = false
    api(`/posts/${postId}/like`)
      .then((data) => {
        if (cancelled) return
        setLiked(data.liked)
        setCount(data.likeCount)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [user, postId])

  const toggle = async () => {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`)
      return
    }
    setBusy(true)
    try {
      const data = await api(`/posts/${postId}/like`, { method: "POST" })
      setLiked(data.liked)
      setCount(data.likeCount)
    } catch {
      // Leave the heart as it was. The reader can tap again.
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={liked}
      aria-label={liked ? "Unlike this post" : "Like this post"}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition disabled:opacity-60 ${
        liked ? "border-danger/30 bg-danger-soft text-danger" : "border-line-strong bg-white text-ink hover:border-ink"
      }`}
    >
      <Heart filled={liked} />
      {count}
    </button>
  )
}
