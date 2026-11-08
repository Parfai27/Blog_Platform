import { X } from "lucide-react"
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
          className="-mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-brand/10"
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      )}
    </span>
  )
}
