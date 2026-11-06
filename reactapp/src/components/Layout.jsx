import { useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import ErrorBoundary from "./ErrorBoundary"
import Footer from "./Footer"
import Navbar from "./Navbar"

// Every public page sits inside this: Navbar on top, Footer at the bottom.
export default function Layout() {
  const { pathname } = useLocation()

  // Start each new page at the top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col bg-white text-ink">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <ErrorBoundary key={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}
