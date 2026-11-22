import { Link } from "react-router-dom"
import { usePageTitle } from "../../lib/usePageTitle"

// Shared facts for the Privacy, Terms and Cookies pages, so the three never disagree.
export const LEGAL = {
  owner: "Parfait Mugwaneza",
  site: "Open Margin",
  contact: "122968150+Parfai27@users.noreply.github.com",
  updated: "22 November 2026",
  country: "Rwanda",
}

const PAGES = [
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
  { to: "/cookies", label: "Cookies" },
]

export function Mail() {
  return (
    <a href={`mailto:${LEGAL.contact}`} className="text-brand underline underline-offset-2">
      {LEGAL.contact}
    </a>
  )
}

export function H2({ children }) {
  return <h2 className="mt-10 font-serif text-2xl tracking-tight text-ink">{children}</h2>
}

export function P({ children }) {
  return <p className="mt-3 leading-7 text-ink-soft">{children}</p>
}

export function List({ items }) {
  return (
    <ul className="mt-3 list-disc space-y-1.5 pl-6 leading-7 text-ink-soft">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}

export function Table({ head, rows }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} className="border-b border-line py-2 pr-4 font-semibold text-ink">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="border-b border-line py-2.5 pr-4 align-top text-ink-soft">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function LegalPage({ title, children }) {
  usePageTitle(title)
  return (
    <div className="bg-paper px-6 py-12 sm:py-16">
      <article className="mx-auto max-w-3xl">
        <nav aria-label="Legal" className="flex gap-4 text-sm text-muted">
          {PAGES.map((p) => (
            <Link key={p.to} to={p.to} className="hover:text-ink">{p.label}</Link>
          ))}
        </nav>
        <h1 className="mt-6 font-serif text-4xl leading-tight tracking-tight text-ink sm:text-5xl">{title}</h1>
        <p className="mt-3 text-sm text-muted">Last updated {LEGAL.updated}</p>
        {children}
      </article>
    </div>
  )
}
