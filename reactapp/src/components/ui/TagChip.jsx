import { Link } from "react-router-dom"

const CHIP = "inline-flex items-center gap-1 rounded-full border border-brand/25 bg-brand-soft px-3 py-1 text-xs font-medium text-brand"

// A tag pill. With `slug` it links to the tag's posts; with `onRemove` it shows a remove button.
export default function TagChip({ name, slug, onRemove }) {
  if (slug && !onRemove) {
    return (
      <Link to={`/blogs?tag=${encodeURIComponent(slug)}`} className={`${CHIP} hover:border-brand`}>
        {name}
      </Link>
    )
  }

  return (
    <span className={CHIP}>
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          className="-mr-1 rounded-full px-1 leading-none hover:bg-brand/10"
        >
          ×
        </button>
      )}
    </span>
  )
}
