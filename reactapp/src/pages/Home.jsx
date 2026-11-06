import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import PostCard from "../components/PostCard"
import { EmptyState, ErrorMessage, Spinner } from "../components/ui/States"
import { api } from "../lib/api"

const HOME_LIMIT = 12
const FALLBACK_COVER = "/images/hero.jpg"

export default function Home() {
  const scroller = useRef(null)
  const [order, setOrder] = useState("newest")
  const [posts, setPosts] = useState([])
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState("loading")
  const [error, setError] = useState("")
  const [coverIndex, setCoverIndex] = useState(0)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setStatus("loading")

    api("/posts", { query: { sort: order, limit: HOME_LIMIT }, signal: controller.signal })
      .then((data) => {
        setPosts(data.posts)
        setTotal(data.pagination.total)
        setStatus("ready")
      })
      .catch((err) => {
        if (err.name === "AbortError") return
        setError(err.message)
        setStatus("error")
      })

    return () => controller.abort()
  }, [order, reload])

  // The banner cycles through the covers of the stories on the page.
  const covers = posts.filter((post) => post.coverImage?.url)
  const cover = covers.length ? covers[coverIndex % covers.length].coverImage.url : FALLBACK_COVER

  useEffect(() => {
    if (covers.length < 2) return
    const timer = setInterval(() => setCoverIndex((current) => current + 1), 4000)
    return () => clearInterval(timer)
  }, [covers.length])

  const slide = (direction) => {
    scroller.current?.scrollBy({ left: direction * 300, behavior: "smooth" })
  }

  const retry = useCallback(() => setReload((count) => count + 1), [])

  return (
    <div className="bg-white text-ink">
      <section className="relative h-[440px] overflow-hidden bg-[#1c2420] sm:h-[520px]">
        <img key={cover} src={cover} alt="" className="cover-fade h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-black/10" />
        <div className="absolute inset-x-0 bottom-24 mx-auto flex max-w-6xl items-end justify-between gap-6 px-6 sm:bottom-28">
          <div className="max-w-xl text-white">
            <h1 className="font-serif text-5xl leading-none tracking-tight sm:text-7xl">Open Margin</h1>
            <p className="mt-4 max-w-md text-base leading-7 text-white/85 sm:text-lg">
              Everyday lives, written in the margins.
            </p>
          </div>
          <label className="hidden text-sm text-ink-soft sm:block">
            <span className="sr-only">Sort stories</span>
            <select
              value={order}
              onChange={(event) => setOrder(event.target.value)}
              className="cursor-pointer rounded-md bg-white px-3 py-2 font-medium shadow-sm"
            >
              <option value="newest">Sort by Newest</option>
              <option value="oldest">Sort by Oldest</option>
            </select>
          </label>
        </div>
      </section>

      <section className="relative z-10 -mt-16 w-full pb-12">
        <div className="relative w-full bg-white py-6 shadow-[0_16px_40px_rgba(17,17,17,0.08)]">
          {status === "loading" && (
            <div className="flex items-center justify-center gap-3 py-20 text-sm text-muted">
              <Spinner />
              Loading stories...
            </div>
          )}

          {status === "error" && (
            <div className="px-6 py-12">
              <ErrorMessage message={error} onRetry={retry} />
            </div>
          )}

          {status === "ready" && posts.length === 0 && (
            <EmptyState title="No stories yet">
              Be the first to write one.{" "}
              <Link to="/write" className="font-semibold text-brand hover:underline">
                Write a post
              </Link>
            </EmptyState>
          )}

          {status === "ready" && posts.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => slide(-1)}
                className="absolute top-1/2 left-3 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-xl shadow-sm hover:border-ink md:flex"
                aria-label="Scroll stories left"
              >
                ‹
              </button>
              <div
                ref={scroller}
                className="flex w-full snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-6 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:px-16 [&::-webkit-scrollbar]:hidden"
              >
                {posts.map((post) => (
                  <div key={post.id} className="w-[260px] shrink-0 snap-start sm:w-[280px]">
                    <PostCard post={post} />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => slide(1)}
                className="absolute top-1/2 right-3 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-xl shadow-sm hover:border-ink md:flex"
                aria-label="Scroll stories right"
              >
                ›
              </button>
            </>
          )}
        </div>

        {status === "ready" && total > posts.length && (
          <div className="mt-8 text-center">
            <Link to="/blogs" className="text-sm font-semibold text-brand hover:underline">
              See all {total} stories
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
