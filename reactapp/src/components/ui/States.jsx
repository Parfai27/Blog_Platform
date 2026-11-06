import Button from "./Button"

export function Spinner({ className = "" }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-brand/25 border-t-brand ${className}`}
    />
  )
}

export function PageLoading({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-3 py-24 text-sm text-muted">
      <Spinner />
      {label}
    </div>
  )
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl bg-danger-soft px-5 py-4 text-center text-sm text-danger">
      <p>{message || "Something went wrong."}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

export function EmptyState({ title, children }) {
  return (
    <div className="py-16 text-center">
      <p className="font-serif text-2xl text-ink">{title}</p>
      {children && <div className="mt-2 text-sm text-muted">{children}</div>}
    </div>
  )
}
