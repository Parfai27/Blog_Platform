import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { AdminHeader, AdminTable } from "../../components/admin/AdminTable"
import Button from "../../components/ui/Button"
import { FormError, FormNotice } from "../../components/ui/Field"
import { ErrorMessage, Spinner } from "../../components/ui/States"
import { api } from "../../lib/api"
import { usePageTitle } from "../../lib/usePageTitle"

const NAME_MAX = 40
const DESCRIPTION_MAX = 200

const INPUT =
  "w-full rounded-lg border border-line-strong bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand"

export default function AdminCategories() {
  usePageTitle("Admin: Categories")
  const [categories, setCategories] = useState([])
  const [state, setState] = useState("loading")
  const [error, setError] = useState("")
  const [actionError, setActionError] = useState("")
  const [notice, setNotice] = useState("")
  const [reload, setReload] = useState(0)

  const [newName, setNewName] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [adding, setAdding] = useState(false)

  const [editingId, setEditingId] = useState("")
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [busyId, setBusyId] = useState("")

  useEffect(() => {
    let cancelled = false
    setState("loading")
    api("/categories")
      .then((data) => {
        if (cancelled) return
        setCategories(data.categories)
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
  }, [reload])

  const start = () => {
    setActionError("")
    setNotice("")
  }

  const add = async (event) => {
    event.preventDefault()
    start()
    if (!newName.trim()) {
      setActionError("Give the category a name")
      return
    }
    setAdding(true)
    try {
      const data = await api("/categories", {
        method: "POST",
        body: { name: newName.trim(), description: newDescription.trim() },
      })
      setNotice(`Added "${data.category.name}".`)
      setNewName("")
      setNewDescription("")
      setReload((count) => count + 1)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setAdding(false)
    }
  }

  const edit = (category) => {
    start()
    setEditingId(category.id)
    setEditName(category.name)
    setEditDescription(category.description ?? "")
  }

  const save = async (category) => {
    start()
    if (!editName.trim()) {
      setActionError("The name cannot be empty")
      return
    }
    setBusyId(category.id)
    try {
      const data = await api(`/categories/${category.id}`, {
        method: "PATCH",
        body: { name: editName.trim(), description: editDescription.trim() },
      })
      const renamed = data.category.slug !== category.slug
      setNotice(renamed ? `Saved. Its address is now /categories/${data.category.slug}.` : "Saved.")
      setEditingId("")
      setReload((count) => count + 1)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusyId("")
    }
  }

  const remove = async (category) => {
    if (!window.confirm(`Delete the "${category.name}" category?`)) return
    start()
    setBusyId(category.id)
    try {
      await api(`/categories/${category.id}`, { method: "DELETE" })
      setNotice(`Deleted "${category.name}".`)
      setReload((count) => count + 1)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusyId("")
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <AdminHeader title="Categories" subtitle="Authors pick one category per post." />

      <form onSubmit={add} className="grid gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm sm:grid-cols-[1fr_2fr_auto] sm:items-end">
        <label className="text-sm font-semibold text-ink">
          New category
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            maxLength={NAME_MAX}
            placeholder="e.g. Music"
            className={`${INPUT} mt-1.5 font-normal`}
          />
        </label>
        <label className="text-sm font-semibold text-ink">
          Description <span className="font-normal text-subtle">(optional)</span>
          <input
            value={newDescription}
            onChange={(event) => setNewDescription(event.target.value)}
            maxLength={DESCRIPTION_MAX}
            placeholder="One line about what belongs here"
            className={`${INPUT} mt-1.5 font-normal`}
          />
        </label>
        <Button type="submit" disabled={adding}>
          {adding ? "Adding..." : "Add category"}
        </Button>
      </form>

      <div className="mt-4 grid gap-3">
        <FormNotice>{notice}</FormNotice>
        <FormError>{actionError}</FormError>

        {state === "loading" && (
          <div className="flex items-center justify-center gap-3 py-16 text-sm text-muted">
            <Spinner />
            Loading categories...
          </div>
        )}
        {state === "error" && <ErrorMessage message={error} onRetry={() => setReload((count) => count + 1)} />}
        {state === "ready" && categories.length === 0 && (
          <p className="rounded-2xl bg-white py-12 text-center text-sm text-muted">No categories yet. Add the first one above.</p>
        )}

        {state === "ready" && categories.length > 0 && (
          <AdminTable columns={["Name", "Slug", "Posts", "Description", "Actions"]}>
            {categories.map((category) => {
              const busy = busyId === category.id
              if (editingId === category.id) {
                return (
                  <tr key={category.id} className="bg-paper">
                    <td className="px-4 py-3" colSpan={2}>
                      <input
                        value={editName}
                        onChange={(event) => setEditName(event.target.value)}
                        maxLength={NAME_MAX}
                        aria-label="Category name"
                        className={INPUT}
                      />
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{category.postCount}</td>
                    <td className="px-4 py-3">
                      <input
                        value={editDescription}
                        onChange={(event) => setEditDescription(event.target.value)}
                        maxLength={DESCRIPTION_MAX}
                        aria-label="Description"
                        className={INPUT}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" disabled={busy} onClick={() => save(category)}>
                          Save
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => setEditingId("")}>
                          Cancel
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              }
              return (
                <tr key={category.id}>
                  <td className="px-4 py-3 font-semibold text-ink">
                    <Link to={`/categories/${category.slug}`} className="hover:underline">
                      {category.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-subtle">{category.slug}</td>
                  <td className="px-4 py-3 text-ink-soft">{category.postCount}</td>
                  <td className="px-4 py-3 text-ink-soft">{category.description || <span className="text-subtle">—</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" disabled={busy} onClick={() => edit(category)}>
                        Rename
                      </Button>
                      <Button variant="danger" size="sm" disabled={busy} onClick={() => remove(category)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </AdminTable>
        )}
      </div>
    </div>
  )
}
