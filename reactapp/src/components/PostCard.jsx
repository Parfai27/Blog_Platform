import { Link } from "react-router-dom"
import { formatDate, formatReadTime, fullName } from "../lib/format"

// The Figma "Post card". Takes a post as the API returns it.
// layout="card" is the tall card on the homepage; layout="row" is the search-results row.
export default function PostCard({ post, layout = "card", showMeta = false }) {
  const href = `/posts/${post.slug}`
  const meta = [fullName(post.author), formatDate(post.publishedAt), formatReadTime(post.readTime)]
    .filter(Boolean)
    .join(" · ")

  const cover = post.coverImage?.url ? (
    <img src={post.coverImage.url} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
  ) : (
    <div className="h-full w-full bg-brand-soft" />
  )

  if (layout === "row") {
    return (
      <article className="group flex gap-4 border-b border-line py-5 sm:gap-6">
        <Link to={href} className="block aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl sm:w-36" tabIndex={-1} aria-hidden="true">
          {cover}
        </Link>
        <div className="min-w-0">
          {post.category && <p className="text-[11px] font-semibold tracking-[0.14em] text-subtle uppercase">{post.category.name}</p>}
          <h3 className="mt-1 text-lg leading-6 font-bold text-ink">
            <Link to={href} className="hover:underline">
              {post.title}
            </Link>
          </h3>
          {post.excerpt && <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">{post.excerpt}</p>}
          {meta && <p className="mt-1 text-xs text-subtle">{meta}</p>}
          <Link to={href} className="mt-1 inline-block text-sm font-semibold text-ink">
            Read More
          </Link>
        </div>
      </article>
    )
  }

  return (
    <article className="group flex h-full flex-col">
      <Link to={href} className="block aspect-[4/3] overflow-hidden rounded-xl" tabIndex={-1} aria-hidden="true">
        {cover}
      </Link>
      {post.category && <p className="mt-3 text-[11px] font-semibold tracking-[0.14em] text-subtle uppercase">{post.category.name}</p>}
      <h3 className="mt-1 text-[15px] leading-5 font-semibold text-ink">
        <Link to={href} className="hover:underline">
          {post.title}
        </Link>
      </h3>
      {post.excerpt && <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-muted">{post.excerpt}</p>}
      {showMeta && meta && <p className="mt-2 text-xs text-subtle">{meta}</p>}
      <Link to={href} className="mt-3 text-sm font-semibold text-ink">
        Read More
      </Link>
    </article>
  )
}
