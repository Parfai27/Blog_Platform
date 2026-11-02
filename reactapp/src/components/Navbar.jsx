import Logo from "./Logo"

const stop = (event) => {
  event.preventDefault()
}

const links = ["Home", "Blogs", "About Us"]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#ececec] bg-white">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 sm:px-6">
        <a href="#top" onClick={stop} className="flex shrink-0 items-center gap-2.5">
          <Logo className="h-9 w-9" />
          <span className="text-[15px] font-extrabold tracking-tight text-[#161616]">Open Margin</span>
        </a>

        <form onSubmit={stop} className="hidden min-w-0 flex-1 md:block">
          <label className="relative block max-w-xl">
            <span className="sr-only">Search stories</span>
            <svg viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#8a8a8a]" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M16 16.5 20 20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              placeholder="Search stories"
              className="h-11 w-full rounded-full bg-[#f3f3f4] pr-4 pl-11 text-sm outline-none placeholder:text-[#8d8d8d]"
            />
          </label>
        </form>

        <nav className="ml-auto hidden items-center md:flex">
          <div className="flex items-center gap-6">
            {links.map((label) => (
              <a key={label} href="#top" onClick={stop} className="text-sm font-semibold text-[#3c3c3c]">
                {label}
              </a>
            ))}
          </div>
          <div className="ml-14 flex items-center gap-5">
            <a href="#top" onClick={stop} className="text-sm font-semibold text-[#3c3c3c]">
              Sign up
            </a>
            <a href="#top" onClick={stop} className="rounded-full bg-[#111111] px-4 py-2 text-sm font-semibold text-white">
              Log in
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}
