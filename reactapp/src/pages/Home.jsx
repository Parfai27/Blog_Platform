import { useEffect, useMemo, useRef, useState } from "react"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar"
import StoryCard from "../components/StoryCard"
import { posts, sortPosts } from "../data/posts"

export default function Home() {
  const scroller = useRef(null)
  const [order, setOrder] = useState("newest")
  const [coverIndex, setCoverIndex] = useState(0)
  const visible = useMemo(() => sortPosts(posts, order), [order])
  const cover = visible[coverIndex % visible.length]

  useEffect(() => {
    const timer = setInterval(() => {
      setCoverIndex((current) => current + 1)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const slide = (direction) => {
    const row = scroller.current
    if (!row) return
    row.scrollBy({ left: direction * 300, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-white text-[#161616]">
      <Navbar />

      <section className="relative h-[520px] overflow-hidden bg-[#1c2420]">
        <img key={cover.id} src={cover.image} alt="" className="cover-fade h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-black/10" />
        <div className="absolute inset-x-0 bottom-28 mx-auto flex max-w-6xl items-end justify-between gap-6 px-6">
          <div className="max-w-xl text-white">
            <h1 className="font-serif-display text-6xl leading-none tracking-tight sm:text-7xl">Open Margin</h1>
            <p className="mt-4 max-w-md text-base leading-7 text-white/85 sm:text-lg">
              A community blog for the stories people actually live.
            </p>
          </div>
          <label className="hidden text-sm text-[#24302c] sm:block">
            <span className="sr-only">Sort stories</span>
            <select
              value={order}
              onChange={(event) => setOrder(event.target.value)}
              className="rounded-md bg-white px-3 py-2 font-medium shadow-sm"
            >
              <option value="newest">Sort by Newest</option>
              <option value="oldest">Sort by Oldest</option>
            </select>
          </label>
        </div>
      </section>

      <section className="relative z-10 -mt-16 w-full pb-12">
        <div className="relative w-full bg-white py-6 shadow-[0_16px_40px_rgba(17,17,17,0.08)]">
          <button
            type="button"
            onClick={() => slide(-1)}
            className="absolute top-1/2 left-3 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#e6e6e6] bg-white text-xl shadow-sm md:flex"
            aria-label="Scroll stories left"
          >
            ‹
          </button>
          <div
            ref={scroller}
            className="flex w-full gap-6 overflow-x-auto scroll-smooth px-16 pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {visible.map((post) => (
              <StoryCard key={post.id} post={post} />
            ))}
          </div>
          <button
            type="button"
            onClick={() => slide(1)}
            className="absolute top-1/2 right-3 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#e6e6e6] bg-white text-xl shadow-sm md:flex"
            aria-label="Scroll stories right"
          >
            ›
          </button>
        </div>
      </section>

      <Footer />
    </div>
  )
}

import { useEffect, useMemo, useRef, useState } from "react"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar"
import StoryCard from "../components/StoryCard"
import { blogApi } from "../lib/api"

export default function Home({ onSelectPost }) {
  const scroller = useRef(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState("newest")
  const [coverIndex, setCoverIndex] = useState(0)

  // Fetch live published posts from Express backend on mount
  useEffect(() => {
    let isMounted = true
    async function loadPosts() {
      try {
        setLoading(true)
        const data = await blogApi.getPublishedPosts()
        if (isMounted) setPosts(data)
      } catch (err) {
        console.error("Failed to fetch posts:", err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadPosts()
    return () => { isMounted = false }
  }, [])

  // Sort posts based on dropdown selection
  const visible = useMemo(() => {
    let sorted = [...posts]
    sorted.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.publishedAt || 0)
      const dateB = new Date(b.createdAt || b.publishedAt || 0)
      return order === "newest" ? dateB - dateA : dateA - dateB
    })
    return sorted
  }, [posts, order])

  // Fallback cover image if post doesn't have one
  const fallbackCover = "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1800&q=80"
  const currentCoverPost = visible[coverIndex % visible.length]
  const coverImage = currentCoverPost?.coverImage?.url || fallbackCover

  // Rotate hero cover images automatically every 4 seconds
  useEffect(() => {
    if (visible.length === 0) return
    const timer = setInterval(() => {
      setCoverIndex((current) => current + 1)
    }, 4000)
    return () => clearInterval(timer)
  }, [visible.length])

  const slide = (direction) => {
    const row = scroller.current
    if (!row) return
    row.scrollBy({ left: direction * 300, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-white text-[#161616]">
      <Navbar />

      <section className="relative h-[520px] overflow-hidden bg-[#1c2420]">
        <img 
          key={currentCoverPost?._id || "hero"} 
          src={coverImage} 
          alt="" 
          className="cover-fade h-full w-full object-cover opacity-85" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-black/10" />
        <div className="absolute inset-x-0 bottom-28 mx-auto flex max-w-6xl items-end justify-between gap-6 px-6">
          <div className="max-w-xl text-white">
            <h1 className="font-serif text-6xl leading-none tracking-tight sm:text-7xl">Open Margin</h1>
            <p className="mt-4 max-w-md text-base leading-7 text-white/85 sm:text-lg">
              A community blog for the stories people actually live.
            </p>
          </div>
          <label className="hidden text-sm text-[#24302c] sm:block">
            <span className="sr-only">Sort stories</span>
            <select
              value={order}
              onChange={(event) => setOrder(event.target.value)}
              className="rounded-md bg-white px-3 py-2 font-medium shadow-sm cursor-pointer"
            >
              <option value="newest">Sort by Newest</option>
              <option value="oldest">Sort by Oldest</option>
            </select>
          </label>
        </div>
      </section>

      <section className="relative z-10 -mt-16 w-full pb-12">
        <div className="relative w-full bg-white py-6 shadow-[0_16px_40px_rgba(17,17,17,0.08)]">
          <button
            type="button"
            onClick={() => slide(-1)}
            className="absolute top-1/2 left-3 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#e6e6e6] bg-white text-xl shadow-sm md:flex hover:bg-gray-50"
            aria-label="Scroll stories left"
          >
            ‹
          </button>

          {loading ? (
            <div className="flex justify-center items-center py-12 text-gray-400 text-sm">
              <i className="fa-solid fa-spinner animate-spin mr-2 text-emerald-600"></i> Loading stories...
            </div>
          ) : visible.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No published stories found.
            </div>
          ) : (
            <div
              ref={scroller}
              className="flex w-full gap-6 overflow-x-auto scroll-smooth px-16 pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {visible.map((post) => (
                <div 
                  key={post._id} 
                  onClick={() => onSelectPost && onSelectPost(post.slug)}
                  className="cursor-pointer shrink-0"
                >
                  <StoryCard post={post} />
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => slide(1)}
            className="absolute top-1/2 right-3 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#e6e6e6] bg-white text-xl shadow-sm md:flex hover:bg-gray-50"
            aria-label="Scroll stories right"
          >
            ›
          </button>
        </div>
      </section>

      <Footer />
    </div>
  )
}