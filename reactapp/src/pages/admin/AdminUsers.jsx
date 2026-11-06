import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { AdminHeader, AdminTable, Tabs } from "../../components/admin/AdminTable"
import Badge from "../../components/ui/Badge"
import Button from "../../components/ui/Button"
import { FormError, FormNotice } from "../../components/ui/Field"
import { ErrorMessage, Spinner } from "../../components/ui/States"
import { useAuth } from "../../context/auth-context"
import { api } from "../../lib/api"
import { usePageTitle } from "../../lib/usePageTitle"
import { formatDate, fullName, plural } from "../../lib/format"

const PAGE_SIZE = 20

const FILTERS = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "blocked", label: "Blocked" },
]

export default function AdminUsers() {
  usePageTitle("Admin: Users")
  const { user: me } = useAuth()
  const [params, setParams] = useSearchParams()
  const filter = ["active", "blocked"].includes(params.get("status")) ? params.get("status") : ""
  const search = params.get("search") ?? ""
  const [draft, setDraft] = useState(search)
  const [users, setUsers] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [state, setState] = useState("loading")
  const [error, setError] = useState("")
  const [actionError, setActionError] = useState("")
  const [notice, setNotice] = useState("")
  const [busyId, setBusyId] = useState("")
  const [reload, setReload] = useState(0)

  useEffect(() => setDraft(search), [search])

  useEffect(() => {
    let cancelled = false
    setState("loading")
    api("/admin/users", { query: { status: filter, search, page: 1, limit: PAGE_SIZE } })
      .then((data) => {
        if (cancelled) return
        setUsers(data.users)
        setPage(1)
        setPages(data.pagination.pages)
        setTotal(data.pagination.total)
        setState("ready")
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
        setState("error")
      })
    return () => {
      cancelled = true
    }
  }, [filter, search, reload])

  const setParam = (name, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(name, value)
    else next.delete(name)
    setParams(next)
  }

  const loadMore = async () => {
    try {
      const data = await api("/admin/users", { query: { status: filter, search, page: page + 1, limit: PAGE_SIZE } })
      setUsers((current) => [...current, ...data.users])
      setPage(page + 1)
      setPages(data.pagination.pages)
    } catch (err) {
      setActionError(err.message)
    }
  }

  const setBlocked = async (person, blocked) => {
    const name = fullName(person)
    if (blocked && !window.confirm(`Block ${name}? They will not be able to log in, post, comment, or like.`)) return
    setBusyId(person.id)
    setActionError("")
    setNotice("")
    try {
      await api(`/admin/users/${person.id}/${blocked ? "block" : "unblock"}`, { method: "PATCH" })
      setNotice(`${name} is ${blocked ? "blocked" : "unblocked"}.`)
      setUsers((current) =>
        current.flatMap((item) => {
          if (item.id !== person.id) return [item]
          const updated = { ...item, isBlocked: blocked }
          // Drop the row when it no longer fits the Active / Blocked filter.
          return filter && (filter === "blocked") !== blocked ? [] : [updated]
        }),
      )
      if (filter) setTotal((count) => count - 1)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusyId("")
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <AdminHeader title="Users" subtitle="Blocked users can read but cannot post, comment, or like." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs label="User status" options={FILTERS} value={filter} onChange={(value) => setParam("status", value)} />
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            setParam("search", draft.trim())
          }}
          className="flex gap-2"
        >
          <label htmlFor="user-search" className="sr-only">
            Search users
          </label>
          <input
            id="user-search"
            type="search"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Name or email"
            className="min-w-0 rounded-full border border-line-strong bg-white px-4 py-2 text-sm outline-none focus:border-brand sm:w-64"
          />
          <Button type="submit" variant="dark">
            Search
          </Button>
        </form>
      </div>

      <div className="mt-4 grid gap-3">
        <FormNotice>{notice}</FormNotice>
        <FormError>{actionError}</FormError>

        {state === "loading" && (
          <div className="flex items-center justify-center gap-3 py-16 text-sm text-muted">
            <Spinner />
            Loading users...
          </div>
        )}
        {state === "error" && <ErrorMessage message={error} onRetry={() => setReload((count) => count + 1)} />}
        {state === "ready" && users.length === 0 && (
          <p className="rounded-2xl bg-white py-12 text-center text-sm text-muted">No users match.</p>
        )}

        {state === "ready" && users.length > 0 && (
          <AdminTable columns={["User", "Email", "Role", "Posts", "Joined", "Status", "Actions"]} minWidth={860}>
            {users.map((person) => {
              const isMe = person.id === me?.id
              const isAdmin = person.role === "admin"
              return (
                <tr key={person.id}>
                  <td className="px-4 py-3 font-semibold text-ink">
                    <Link to={`/authors/${person.id}`} className="hover:underline">
                      {fullName(person)}
                    </Link>
                    {isMe && <span className="ml-1 text-xs font-normal text-subtle">(you)</span>}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{person.email}</td>
                  <td className="px-4 py-3 text-ink-soft capitalize">{person.role}</td>
                  <td className="px-4 py-3 text-ink-soft">{person.postCount}</td>
                  <td className="px-4 py-3 text-subtle">{formatDate(person.joinedAt)}</td>
                  <td className="px-4 py-3">
                    <Badge status={person.isBlocked ? "blocked" : "active"} />
                  </td>
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <span className="text-xs text-subtle">Admins can't be blocked</span>
                    ) : person.isBlocked ? (
                      <Button variant="secondary" size="sm" disabled={busyId === person.id} onClick={() => setBlocked(person, false)}>
                        Unblock
                      </Button>
                    ) : (
                      <Button variant="danger" size="sm" disabled={busyId === person.id} onClick={() => setBlocked(person, true)}>
                        Block
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
          </AdminTable>
        )}

        {state === "ready" && page < pages && (
          <div className="text-center">
            <Button variant="secondary" onClick={loadMore}>
              Show more
            </Button>
          </div>
        )}
        {state === "ready" && total > 0 && <p className="text-center text-xs text-subtle">{plural(total, "user")}</p>}
      </div>
    </div>
  )
}
