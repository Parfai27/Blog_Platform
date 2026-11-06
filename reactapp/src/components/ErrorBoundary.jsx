import { Component } from "react"

// If a page crashes while drawing, show this instead of a blank screen.
// The layouts give it a key per address, so moving to another page clears the error.
export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error, info) {
    console.error("A page crashed:", error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <section className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-xs font-semibold tracking-[0.14em] text-danger uppercase">Something went wrong</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight text-ink">This page could not be shown</h1>
        <p className="mt-3 text-muted">Try loading it again. If it keeps happening, go back to the homepage.</p>
        <div className="mt-8 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Reload the page
          </button>
          <a href="/" className="rounded-full border border-line-strong bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-ink">
            Go to the homepage
          </a>
        </div>
      </section>
    )
  }
}
