import Button from "../components/ui/Button"
import { usePageTitle } from "../lib/usePageTitle"

export default function NotFound() {
  usePageTitle("Page not found")
  return (
    <section className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="text-xs font-semibold tracking-[0.14em] text-subtle uppercase">404</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight text-ink">This page is not here</h1>
      <p className="mt-3 text-muted">The link may be old, or the story may have been removed.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Button to="/">Go to the homepage</Button>
        <Button to="/blogs" variant="secondary">
          Browse stories
        </Button>
      </div>
    </section>
  )
}
