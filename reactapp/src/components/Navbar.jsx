import { LogOut, Menu, PenSquare, Search, Settings, ShieldCheck, UserRound, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/auth-context"
import { fullName } from "../lib/format"
import Logo from "./Logo"
import Avatar from "./ui/Avatar"
import Button from "./ui/Button"

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/blogs", label: "Blogs" },
  { to: "/about", label: "About Us" },
]

const linkClass = ({ isActive }) =>
  `text-sm font-semibold transition ${isActive ? "text-ink" : "text-ink-soft hover:text-ink"}`

function SearchBox({ onDone, className = "" }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")

  const submit = (event) => {
    event.preventDefault()
    const q = query.trim()
    if (!q) return
    navigate(`/search?q=${encodeURIComponent(q)}`)
    setQuery("")
    onDone?.()
  }

  return (
    <form onSubmit={submit} role="search" className={className}>
      <label className="relative block">
        <span className="sr-only">Search stories</span>
        <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search stories"
          className="h-11 w-full rounded-full bg-[#f3f3f4] pr-4 pl-11 text-sm outline-none placeholder:text-subtle focus:ring-2 focus:ring-brand/30"
        />
      </label>
    </form>
  )
}

function AccountMenu({ user, isAdmin, onSignOut }) {
  const [open, setOpen] = useState(false)
  const box = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (event) => {
      if (!box.current?.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => event.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", close)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", close)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const item = "flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-ink-soft hover:bg-paper hover:text-ink"
  const icon = "h-4 w-4 shrink-0 text-subtle"

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="rounded-full focus:ring-2 focus:ring-brand/40 focus:outline-none"
      >
        <Avatar person={user} size="sm" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-lg">
          <p className="truncate border-b border-line px-4 py-2 text-xs text-subtle">{fullName(user) || user.email}</p>
          <Link role="menuitem" to={`/authors/${user.id}`} className={item} onClick={() => setOpen(false)}>
            <UserRound className={icon} aria-hidden="true" />
            My public profile
          </Link>
          <Link role="menuitem" to="/settings" className={item} onClick={() => setOpen(false)}>
            <Settings className={icon} aria-hidden="true" />
            Profile settings
          </Link>
          {isAdmin && (
            <Link role="menuitem" to="/admin" className={item} onClick={() => setOpen(false)}>
              <ShieldCheck className={icon} aria-hidden="true" />
              Admin
            </Link>
          )}
          <button role="menuitem" type="button" className={`${item} border-t border-line`} onClick={onSignOut}>
            <LogOut className={icon} aria-hidden="true" />
            Log out
          </button>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const { user, loading, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the mobile menu whenever the page changes.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.search])

  const handleSignOut = () => {
    signOut()
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <Logo className="h-9 w-9" />
          <span className="text-[15px] font-extrabold tracking-tight text-ink">Open Margin</span>
        </Link>

        <SearchBox className="hidden max-w-xl min-w-0 flex-1 md:block" />

        <nav className="ml-auto hidden items-center gap-6 lg:flex" aria-label="Main">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-4 md:flex lg:ml-8">
          {!loading &&
            (user ? (
              <>
                <Button to="/write" size="md">
                  <PenSquare className="h-4 w-4" aria-hidden="true" />
                  Write a post
                </Button>
                <NavLink to="/my-posts" className={linkClass}>
                  My posts
                </NavLink>
                <AccountMenu user={user} isAdmin={isAdmin} onSignOut={handleSignOut} />
              </>
            ) : (
              <>
                <NavLink to="/register" className={linkClass}>
                  Sign up
                </NavLink>
                <Button to="/login" variant="dark">
                  Log in
                </Button>
              </>
            ))}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-paper md:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {/* Tablet widths: the page links move under the bar. */}
      <nav className="hidden border-t border-line md:flex lg:hidden" aria-label="Pages">
        <div className="mx-auto flex w-full max-w-7xl gap-6 px-6 py-2">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-line bg-white px-4 pt-3 pb-5 md:hidden">
          <SearchBox onDone={() => setMenuOpen(false)} />
          <nav className="mt-4 grid gap-3" aria-label="Mobile">
            {LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 border-t border-line pt-4">
            {!loading &&
              (user ? (
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar person={user} size="sm" />
                    <span className="truncate text-sm font-semibold text-ink">{fullName(user)}</span>
                  </div>
                  <Button to="/write">
                    <PenSquare className="h-4 w-4" aria-hidden="true" />
                    Write a post
                  </Button>
                  <NavLink to="/my-posts" className={linkClass}>
                    My posts
                  </NavLink>
                  <NavLink to={`/authors/${user.id}`} className={(state) => `${linkClass(state)} inline-flex items-center gap-2`}>
                    <UserRound className="h-4 w-4 text-subtle" aria-hidden="true" />
                    My public profile
                  </NavLink>
                  <NavLink to="/settings" className={(state) => `${linkClass(state)} inline-flex items-center gap-2`}>
                    <Settings className="h-4 w-4 text-subtle" aria-hidden="true" />
                    Profile settings
                  </NavLink>
                  {isAdmin && (
                    <NavLink to="/admin" className={(state) => `${linkClass(state)} inline-flex items-center gap-2`}>
                      <ShieldCheck className="h-4 w-4 text-subtle" aria-hidden="true" />
                      Admin
                    </NavLink>
                  )}
                  <button type="button" onClick={handleSignOut} className="inline-flex items-center gap-2 text-left text-sm font-semibold text-danger">
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button to="/register" variant="secondary" className="flex-1">
                    Sign up
                  </Button>
                  <Button to="/login" variant="dark" className="flex-1">
                    Log in
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}
    </header>
  )
}
