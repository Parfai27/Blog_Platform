import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import StoryList from "../components/StoryList"
import Avatar from "../components/ui/Avatar"
import Button from "../components/ui/Button"
import { ErrorMessage, PageLoading } from "../components/ui/States"
import { useAuth } from "../context/auth-context"
import { api } from "../lib/api"
import { compactNumber, formatMonth, fullName, plural } from "../lib/format"
import { usePageTitle } from "../lib/usePageTitle"
import NotFound from "./NotFound"

// The Figma "Author profile": photo, name, bio, counts, then the author's published stories.
export default function Author() {
  const { id } = useParams()
  const { user } = useAuth()
  const [author, setAuthor] = useState(null)
  const [status, setStatus] = useState("loading")
  const [error, setError] = useState("")
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let cancelled = false
    setStatus("loading")
    api(`/users/${encodeURIComponent(id)}`)
      .then((data) => {
        if (cancelled) return
        setAuthor(data.author)
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
  }, [id, reload])

  usePageTitle(author ? fullName(author) : "")

  if (status === "loading") return <PageLoading />
  if (status === "missing") return <NotFound />
  if (status === "error") {
    return (
      <div className="px-6 py-24">
        <ErrorMessage message={error} onRetry={() => setReload((count) => count + 1)} />
      </div>
    )
  }

  const isMe = user?.id === author.id
  const firstName = author.firstName || fullName(author)

  return (
    <div>
      <section className="bg-white px-4 py-12 text-center sm:py-16">
        <Avatar person={author} size="lg" className="mx-auto" />
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink">{fullName(author)}</h1>
        {author.bio && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{author.bio}</p>}
        <p className="mt-3 text-sm text-muted">
          <span className="font-semibold text-ink">{plural(author.postCount, "post")}</span>
          <span className="mx-2">·</span>
          <span className="font-semibold text-ink">
            {compactNumber(author.likeCount)} {author.likeCount === 1 ? "like" : "likes"}
          </span>
          {author.joinedAt && (
            <>
              <span className="mx-2">·</span>
              Joined {formatMonth(author.joinedAt)}
            </>
          )}
        </p>
        {isMe && (
          <Button to="/settings" variant="secondary" size="sm" className="mt-4">
            Edit profile
          </Button>
        )}
      </section>

      <section className="bg-paper px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-serif text-3xl tracking-tight text-ink">Stories by {firstName}</h2>
          <div className="mt-6">
            <StoryList key={id} fixed={{ author: id }} showSearch={false} showCategory={false} emptyTitle={`${firstName} hasn't published anything yet`} />
          </div>
        </div>
      </section>
    </div>
  )
}
