import { CalendarDays, Clock, Flag, Pencil } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import Comments from "../components/post/Comments"
import LikeButton from "../components/post/LikeButton"
import ReportDialog from "../components/post/ReportDialog"
import Avatar from "../components/ui/Avatar"
import Button from "../components/ui/Button"
import { ErrorMessage, PageLoading } from "../components/ui/States"
import TagChip from "../components/ui/TagChip"
import { useAuth } from "../context/auth-context"
import { api } from "../lib/api"
import { formatDate, formatReadTime, fullName, paragraphs } from "../lib/format"
import { usePageTitle } from "../lib/usePageTitle"
import NotFound from "./NotFound"

export default function Post() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [post, setPost] = useState(null)
  const [status, setStatus] = useState("loading")
  const [error, setError] = useState("")
  const [reportTarget, setReportTarget] = useState(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setStatus("loading")
    api(`/posts/${encodeURIComponent(slug)}`, { signal: controller.signal })
      .then((data) => {
        setPost(data.post)
        setStatus("ready")
      })
      .catch((err) => {
        if (err.name === "AbortError") return
        setError(err.message)
        setStatus(err.status === 404 ? "missing" : "error")
      })
    return () => controller.abort()
  }, [slug, reload])

  usePageTitle(post?.title)

  // Visitors have to log in before they can report anything.
  const openReport = useCallback(
    (target) => {
      if (!user) {
        navigate(`/login?next=${encodeURIComponent(location.pathname)}`)
        return
      }
      setReportTarget(target)
    },
    [user, navigate, location.pathname],
  )

  if (status === "loading") return <PageLoading label="Loading story..." />
  if (status === "missing") return <NotFound />
  if (status === "error") {
    return (
      <div className="px-6 py-24">
        <ErrorMessage message={error} onRetry={() => setReload((count) => count + 1)} />
      </div>
    )
  }

  const isOwner = user && post.author?.id === user.id
  const published = formatDate(post.publishedAt)
  const readTime = formatReadTime(post.readTime)

  return (
    <div className="bg-paper">
      <article className="mx-auto max-w-2xl px-5 pt-10 pb-16 sm:pt-14">
        {post.category && (
          <Link
            to={`/categories/${post.category.slug}`}
            className="text-xs font-bold tracking-[0.14em] text-brand uppercase hover:underline"
          >
            {post.category.name}
          </Link>
        )}
        <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-ink sm:text-5xl">{post.title}</h1>
        {post.excerpt && <p className="mt-4 text-lg leading-7 text-muted">{post.excerpt}</p>}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar person={post.author} />
            <div>
              {post.author ? (
                <Link to={`/authors/${post.author.id}`} className="text-sm font-semibold text-ink hover:underline">
                  {fullName(post.author)}
                </Link>
              ) : (
                <span className="text-sm font-semibold text-muted">Deleted account</span>
              )}
              {(published || readTime) && (
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-subtle">
                  {published && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                      {published}
                    </span>
                  )}
                  {readTime && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {readTime}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LikeButton postId={post.id} initialCount={post.likeCount} />
            {isOwner ? (
              <Button to={`/write/${post.id}`} variant="secondary" size="md">
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => openReport({ type: "post", id: post.id, name: post.title })}>
                <Flag className="h-4 w-4" aria-hidden="true" />
                Report
              </Button>
            )}
          </div>
        </div>

        {post.coverImage?.url && (
          <img src={post.coverImage.url} alt="" className="mt-8 aspect-[16/10] w-full rounded-2xl object-cover" />
        )}

        <div className="mt-8 grid gap-5 text-[17px] leading-8 text-ink-soft">
          {paragraphs(post.body).map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </div>

        {post.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <TagChip key={tag.id} name={tag.name} slug={tag.slug} />
            ))}
          </div>
        )}

        <Comments postId={post.id} initialCount={post.commentCount} onReport={openReport} />
      </article>

      {reportTarget && <ReportDialog target={reportTarget} onClose={() => setReportTarget(null)} />}
    </div>
  )
}
