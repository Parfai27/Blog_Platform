import { useEffect } from "react"

// Sets the browser tab to "<title> · Open Margin" while the page is open.
export function usePageTitle(title) {
  useEffect(() => {
    if (!title) return
    const previous = document.title
    document.title = `${title} · Open Margin`
    return () => {
      document.title = previous
    }
  }, [title])
}
