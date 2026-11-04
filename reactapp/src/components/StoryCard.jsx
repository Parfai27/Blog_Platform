export default function StoryCard({ post }) {
  return (
    <article className="flex h-full w-[260px] shrink-0 flex-col snap-start sm:w-[280px]">
      <div className="overflow-hidden rounded-xl bg-[#eceae4]">
        <img src={post.image} alt="" className="aspect-[4/3] w-full object-cover" />
      </div>
      <p className="mt-3 text-[11px] font-semibold tracking-[0.14em] text-[#8a918d] uppercase">{post.category}</p>
      <h3 className="mt-1 text-[15px] leading-5 font-semibold text-[#1c1c1c]">{post.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-[#66706c]">{post.excerpt}</p>
      <p className="mt-3 text-sm font-semibold text-[#1c1c1c]">Read More</p>
    </article>
  )
}
