import { useEffect } from "react"
import { Link, NavLink, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../context/auth-context"
import { fullName } from "../../lib/format"
import ErrorBoundary from "../ErrorBoundary"
import Logo from "../Logo"
import Avatar from "../ui/Avatar"

const LINKS = [
  { to: "/admin/reports", label: "Reports" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/users", label: "Users" },
]

const linkClass = ({ isActive }) =>
  `block rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive ? "bg-brand-soft text-brand" : "text-ink-soft hover:bg-paper hover:text-ink"
  }`

// The admin area from the Figma: a sidebar on the left instead of the site Navbar.
// On phones the sidebar becomes a bar across the top.
export default function AdminLayout() {
  const { user } = useAuth()
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen bg-paper text-ink md:flex">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <aside className="border-b border-line bg-white md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col md:border-r md:border-b-0">
        <div className="flex items-center justify-between gap-3 px-4 py-4 md:px-5 md:py-6">
          <Link to="/admin/reports" className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="text-sm font-extrabold tracking-tight">Open Margin</span>
            <span className="text-xs font-semibold text-brand">Admin</span>
          </Link>
          <Link to="/" className="text-xs font-semibold text-muted hover:text-ink md:hidden">
            ← Back to site
          </Link>
        </div>

        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 md:block md:space-y-1 md:px-3 md:pb-0">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto hidden border-t border-line px-5 py-4 md:block">
          <div className="flex items-center gap-2">
            <Avatar person={user} size="sm" />
            <span className="truncate text-xs text-muted">{fullName(user)}</span>
          </div>
          <Link to="/" className="mt-3 block text-sm font-semibold text-muted hover:text-ink">
            ← Back to site
          </Link>
        </div>
      </aside>

      <main id="main" tabIndex={-1} className="min-w-0 flex-1 px-4 py-8 outline-none sm:px-8">
        <ErrorBoundary key={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
