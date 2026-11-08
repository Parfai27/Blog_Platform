import { Eye, EyeOff, Save, Send } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import AiAssistant from "../components/AiAssistant"
import CoverPicker from "../components/editor/CoverPicker"
import TagInput from "../components/editor/TagInput"
import Badge from "../components/ui/Badge"
import Button from "../components/ui/Button"
import { FormError, FormNotice } from "../components/ui/Field"
import { ErrorMessage, PageLoading } from "../components/ui/States"
import { api } from "../lib/api"
import { formatDate } from "../lib/format"
import { usePageTitle } from "../lib/usePageTitle"
import { LIMITS } from "../lib/validation"
import NotFound from "./NotFound"

const EMPTY = { title: "", excerpt: "", body: "", category: "", tags: [] }

const FIELD =
  "w-full rounded-xl border bg-white px-3 py-2.5 text-ink outline-none transition placeholder:text-subtle focus:border-brand focus:ring-2 focus:ring-brand/15"

const replaceParagraph = (body, selection, improved) => {
  if (!selection) return null
  const current = body.slice(selection.start, selection.end)
  if (current === selection.text) {
    return body.slice(0, selection.start) + improved + body.slice(selection.end)
  }
  const at = body.indexOf(selection.text)
  if (at === -1) return null
  return body.slice(0, at) + improved + body.slice(at + selection.text.length)
}

// The editable fields of a post as the API returns it.
const fieldsFrom = (post) => ({
  title: post.title,
  excerpt: post.excerpt ?? "",
  body: post.body ?? "",
  category: post.category?.id ?? "",
  tags: post.tags.map((tag) => tag.name),
})

// /write starts a new post. /write/:id edits one of yours.
export default function Editor() {
  const { id } = useParams()
  usePageTitle(id ? "Edit your post" : "Write a post")
  const navigate = useNavigate()
  const bodyRef = useRef(null)
  const selectionRef = useRef(null)

  const [status, setStatus] = useState(id ? "loading" : "ready")
  const [loadError, setLoadError] = useState("")
  const [post, setPost] = useState(null)
  const [fields, setFields] = useState(EMPTY)
  const [saved, setSaved] = useState(EMPTY)
  const [coverFile, setCoverFile] = useState(null)
  const [categories, setCategories] = useState([])
  const [knownTags, setKnownTags] = useState([])
  const [busy, setBusy] = useState("")
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState("")
  const [notice, setNotice] = useState("")
  const [reload, setReload] = useState(0)

  // Categories for the dropdown and existing tags for suggestions (and for the AI).
  useEffect(() => {
    api("/categories")
      .then((data) => setCategories(data.categories))
      .catch(() => {})
    api("/tags")
      .then((data) => setKnownTags(data.tags.map((tag) => tag.name)))
      .catch(() => {})
  }, [])

  // Opening /write/:id loads the post. Opening /write starts empty.
  useEffect(() => {
    if (!id) {
      setPost(null)
      setFields(EMPTY)
      setSaved(EMPTY)
      setCoverFile(null)
      setStatus("ready")
      return
    }
    // Saving a new draft moves from /write to /write/:id with the post already in hand.
    if (post?.id === id) return

    let cancelled = false
    setStatus("loading")
    api(`/posts/mine/${id}`)
      .then((data) => {
        if (cancelled) return
        setPost(data.post)
        setFields(fieldsFrom(data.post))
        setSaved(fieldsFrom(data.post))
        setCoverFile(null)
        setStatus("ready")
      })
      .catch((err) => {
        if (cancelled) return
        setLoadError(err.message)
        setStatus(err.status === 404 || err.status === 403 ? "missing" : "error")
      })
    return () => {
      cancelled = true
    }
    // post is left out on purpose: it changes on every save and must not trigger a reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, reload])

  const dirty = useMemo(() => Boolean(coverFile) || JSON.stringify(fields) !== JSON.stringify(saved), [fields, saved, coverFile])

  // Warn before closing the tab or reloading with unsaved changes.
  useEffect(() => {
    if (!dirty) return
    const warn = (event) => {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  const set = (name) => (value) => {
    setNotice("")
    setFields((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: "" }))
  }

  const check = (forPublish) => {
    const found = {}
    if (!fields.title.trim()) found.title = "Add a title"
    if (forPublish && !fields.body.trim()) found.body = "Write the post before publishing"
    if (forPublish && !fields.category) found.category = "Choose a category before publishing"
    setErrors(found)
    return Object.keys(found).length === 0
  }

  // Saves the fields (creating the post the first time), then uploads a new cover if one was chosen.
  const persist = useCallback(async () => {
    const payload = {
      title: fields.title.trim(),
      excerpt: fields.excerpt.trim(),
      body: fields.body,
      category: fields.category || null,
      tags: fields.tags,
    }

    let current = post
    if (!current) {
      current = (await api("/posts", { method: "POST", body: payload })).post
    } else if (JSON.stringify(fields) !== JSON.stringify(saved)) {
      current = (await api(`/posts/${current.id}`, { method: "PATCH", body: payload })).post
    }

    let coverError = ""
    if (coverFile) {
      try {
        const form = new FormData()
        form.append("cover", coverFile)
        current = (await api(`/posts/${current.id}/cover`, { method: "POST", body: form })).post
        setCoverFile(null)
      } catch (err) {
        coverError = err.message
      }
    }

    setPost(current)
    setFields(fieldsFrom(current))
    setSaved(fieldsFrom(current))
    if (!id) navigate(`/write/${current.id}`, { replace: true })
    return { current, coverError }
  }, [fields, saved, post, coverFile, id, navigate])

  const run = async (kind, action) => {
    setBusy(kind)
    setFormError("")
    setNotice("")
    try {
      await action()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setBusy("")
    }
  }

  const saveDraft = () => {
    if (!check(false)) return
    run("save", async () => {
      const { current, coverError } = await persist()
      if (coverError) setFormError(`Saved, but the cover image was not uploaded: ${coverError}`)
      else setNotice(current.status === "published" ? "Your changes are live." : "Draft saved.")
    })
  }

  const publish = () => {
    if (!check(true)) return
    run("publish", async () => {
      const { current, coverError } = await persist()
      if (coverError) {
        setFormError(`Saved, but the cover image was not uploaded: ${coverError}. Try again, or publish without it.`)
        return
      }
      const data = await api(`/posts/${current.id}/publish`, { method: "POST" })
      setPost(data.post)
      navigate(`/posts/${data.post.slug}`)
    })
  }

  const unpublish = () => {
    if (!window.confirm("Move this post back to drafts? It will leave the public site.")) return
    run("unpublish", async () => {
      const data = await api(`/posts/${post.id}/unpublish`, { method: "POST" })
      setPost(data.post)
      setNotice("Moved back to drafts. Only you can see it now.")
    })
  }

  const rememberSelection = () => {
    const field = bodyRef.current
    if (!field) return
    selectionRef.current = {
      text: fields.body.slice(field.selectionStart, field.selectionEnd),
      start: field.selectionStart,
      end: field.selectionEnd,
    }
  }

  if (status === "loading") return <PageLoading label="Loading your post..." />
  if (status === "missing") return <NotFound />
  if (status === "error") {
    return (
      <div className="px-6 py-24">
        <ErrorMessage message={loadError} onRetry={() => setReload((count) => count + 1)} />
      </div>
    )
  }

  const published = post?.status === "published"
  const working = busy !== ""

  return (
    <div className="bg-paper px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl tracking-tight text-ink">{post ? "Edit your post" : "Write a post"}</h1>
            <p className="mt-1 text-sm text-muted">Add a cover, choose a category, then save a draft or publish.</p>
          </div>
          <Button to="/my-posts" variant="secondary">
            Back to My posts
          </Button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="grid gap-5 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
            <CoverPicker savedUrl={post?.coverImage?.url} file={coverFile} onChange={setCoverFile} />

            <div>
              <label htmlFor="post-title" className="text-sm font-semibold text-ink">
                Title
              </label>
              <input
                id="post-title"
                value={fields.title}
                onChange={(event) => set("title")(event.target.value)}
                maxLength={LIMITS.title}
                placeholder="Add a title, or accept one from the assistant"
                className={`${FIELD} mt-1.5 text-lg font-semibold ${errors.title ? "border-danger" : "border-line-strong"}`}
              />
              {errors.title && <p className="mt-1 text-xs text-danger">{errors.title}</p>}
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="post-excerpt" className="text-sm font-semibold text-ink">
                  Summary
                </label>
                <span className="text-xs text-subtle">
                  {fields.excerpt.length}/{LIMITS.excerpt}
                </span>
              </div>
              <textarea
                id="post-excerpt"
                value={fields.excerpt}
                onChange={(event) => set("excerpt")(event.target.value)}
                maxLength={LIMITS.excerpt}
                rows={2}
                placeholder="Two or three sentences for the homepage card"
                className={`${FIELD} mt-1.5 border-line-strong text-sm`}
              />
            </div>

            <div>
              <label htmlFor="post-body" className="text-sm font-semibold text-ink">
                Body
              </label>
              <textarea
                id="post-body"
                ref={bodyRef}
                value={fields.body}
                onChange={(event) => set("body")(event.target.value)}
                onSelect={rememberSelection}
                onKeyUp={rememberSelection}
                onMouseUp={rememberSelection}
                maxLength={LIMITS.body}
                rows={18}
                placeholder="Start with a moment only you saw. Leave a blank line between paragraphs."
                className={`${FIELD} mt-1.5 leading-7 ${errors.body ? "border-danger" : "border-line-strong"}`}
              />
              {errors.body && <p className="mt-1 text-xs text-danger">{errors.body}</p>}
            </div>
          </section>

          <aside className="grid content-start gap-6">
            <section className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-ink">Publish</h2>
                <Badge status={published ? "published" : "draft"} />
              </div>

              <div className="mt-4">
                <label htmlFor="post-category" className="text-sm font-semibold text-ink">
                  Category
                </label>
                <select
                  id="post-category"
                  value={fields.category}
                  onChange={(event) => set("category")(event.target.value)}
                  className={`${FIELD} mt-1.5 text-sm ${errors.category ? "border-danger" : "border-line-strong"}`}
                >
                  <option value="">Choose a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-xs text-danger">{errors.category}</p>}
              </div>

              <div className="mt-4">
                <TagInput tags={fields.tags} onChange={set("tags")} suggestions={knownTags} />
              </div>

              <div className="mt-5 grid gap-2">
                <FormNotice>{notice}</FormNotice>
                <FormError>{formError}</FormError>
                <Button variant="secondary" onClick={saveDraft} disabled={working || (post && !dirty)}>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {busy === "save" ? "Saving..." : published ? "Update post" : "Save draft"}
                </Button>
                {published ? (
                  <>
                    <Button to={`/posts/${post.slug}`} variant="dark">
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      View post
                    </Button>
                    <Button variant="ghost" onClick={unpublish} disabled={working}>
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                      {busy === "unpublish" ? "Moving..." : "Unpublish"}
                    </Button>
                  </>
                ) : (
                  <Button onClick={publish} disabled={working}>
                    <Send className="h-4 w-4" aria-hidden="true" />
                    {busy === "publish" ? "Publishing..." : "Publish"}
                  </Button>
                )}
              </div>

              <p className="mt-3 text-xs leading-5 text-subtle">
                {published
                  ? `Status: Published${post.publishedAt ? ` on ${formatDate(post.publishedAt)}` : ""}. Changes go live when you update.`
                  : "Status: Draft. Nothing is public until you publish."}
                {dirty && post && " You have unsaved changes."}
              </p>
            </section>

            <AiAssistant
              enabled
              title={fields.title}
              body={fields.body}
              existingTags={knownTags}
              getSelection={() => {
                const field = bodyRef.current
                if (!field) return selectionRef.current
                const text = fields.body.slice(field.selectionStart, field.selectionEnd)
                if (text.trim()) return { text, start: field.selectionStart, end: field.selectionEnd }
                return selectionRef.current?.text?.trim() ? selectionRef.current : null
              }}
              onAcceptTitle={set("title")}
              onAcceptSummary={set("excerpt")}
              onAcceptTags={(names) => set("tags")(names.slice(0, LIMITS.tags))}
              onAcceptParagraph={(selection, improved) => {
                const next = replaceParagraph(fields.body, selection, improved)
                if (next === null) return false
                set("body")(next)
                selectionRef.current = null
                return true
              }}
            />
          </aside>
        </div>

        {post && (
          <p className="mt-4 text-xs text-subtle">
            Need to go?{" "}
            <Link to="/my-posts" className="font-semibold hover:text-ink">
              Your posts
            </Link>{" "}
            keep every saved draft.
          </p>
        )}
      </div>
    </div>
  )
}
