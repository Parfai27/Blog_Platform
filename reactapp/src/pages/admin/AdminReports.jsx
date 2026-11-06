import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { AdminHeader, AdminTable, Tabs } from "../../components/admin/AdminTable"
import Badge from "../../components/ui/Badge"
import Button from "../../components/ui/Button"
import { FormError, FormNotice } from "../../components/ui/Field"
import { ErrorMessage, Spinner } from "../../components/ui/States"
import { api } from "../../lib/api"
import { usePageTitle } from "../../lib/usePageTitle"
import { formatDate, plural, timeAgo } from "../../lib/format"

const PAGE_SIZE = 20

// What the admin did, in the words of the Figma ("Resolved — no action").
const outcome = (actions) => {
  if (!actions.length) return "No action"
  return actions.map((action) => (action === "content_removed" ? "Content removed" : "User blocked")).join(", ")
}

export default function AdminReports() {
  usePageTitle("Admin: Reports")
  const [params, setParams] = useSearchParams()
  const status = ["resolved", "all"].includes(params.get("status")) ? params.get("status") : "open"
  const [reports, setReports] = useState([])
  const [counts, setCounts] = useState({ open: 0, resolved: 0, all: 0 })
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [state, setState] = useState("loading")
  const [error, setError] = useState("")
  const [actionError, setActionError] = useState("")
  const [notice, setNotice] = useState("")
  const [busyId, setBusyId] = useState("")
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState("loading")
    api("/admin/reports", { query: { status, page: 1, limit: PAGE_SIZE } })
      .then((data) => {
        if (cancelled) return
        setReports(data.reports)
        setCounts(data.counts)
        setPage(1)
        setPages(data.pagination.pages)
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
  }, [status, reload])

  const loadMore = async () => {
    try {
      const data = await api("/admin/reports", { query: { status, page: page + 1, limit: PAGE_SIZE } })
      setReports((current) => [...current, ...data.reports])
      setPage(page + 1)
      setPages(data.pagination.pages)
    } catch (err) {
      setActionError(err.message)
    }
  }

  const resolve = async (report, choice) => {
    const who = report.targetAuthor?.name || "the author"
    const questions = {
      remove: `Remove this ${report.targetType}? ${report.targetType === "post" ? "Its comments and likes go too. " : ""}This cannot be undone.`,
      block: `Block ${who}? They will not be able to log in, post, comment, or like until you unblock them.`,
    }
    if (questions[choice] && !window.confirm(questions[choice])) return

    setBusyId(report.id)
    setActionError("")
    setNotice("")
    try {
      await api(`/admin/reports/${report.id}/resolve`, {
        method: "PATCH",
        body: { removeContent: choice === "remove", blockUser: choice === "block" },
      })
      setNotice(
        choice === "remove"
          ? `The ${report.targetType} was removed. Other open reports about it were closed too.`
          : choice === "block"
            ? `${who} is blocked and the report is resolved.`
            : "Report resolved with no action.",
      )
      // Removing content can close other reports as well, so load the list again.
      setReload((count) => count + 1)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusyId("")
    }
  }

  const tabs = [
    { value: "open", label: `Open (${counts.open})` },
    { value: "resolved", label: `Resolved (${counts.resolved})` },
    { value: "all", label: "All" },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      <AdminHeader
        title="Reports"
        subtitle={`Review reported posts and comments. ${counts.open} open, ${counts.resolved} resolved.`}
      />

      <Tabs label="Report status" options={tabs} value={status} onChange={(value) => setParams(value === "open" ? {} : { status: value })} />

      <div className="mt-4 grid gap-3">
        <FormNotice>{notice}</FormNotice>
        <FormError>{actionError}</FormError>

        {state === "loading" && (
          <div className="flex items-center justify-center gap-3 py-16 text-sm text-muted">
            <Spinner />
            Loading reports...
          </div>
        )}
        {state === "error" && <ErrorMessage message={error} onRetry={() => setReload((count) => count + 1)} />}
        {state === "ready" && reports.length === 0 && (
          <p className="rounded-2xl bg-white py-12 text-center text-sm text-muted">
            {status === "open" ? "No open reports. Nothing needs your attention." : "No reports here."}
          </p>
        )}

        {state === "ready" && reports.length > 0 && (
          <AdminTable columns={["Status", "Target", "Content", "Reason", "Reported by", "Actions"]} minWidth={960}>
            {reports.map((report) => {
              const busy = busyId === report.id
              const open = report.status === "open"
              return (
                <tr key={report.id} className="align-top">
                  <td className="px-4 py-3">
                    <Badge status={report.status} />
                  </td>
                  <td className="px-4 py-3 text-ink-soft capitalize">{report.targetType}</td>
                  <td className="max-w-xs px-4 py-3">
                    <p className="text-ink">&ldquo;{report.preview}&rdquo;</p>
                    <p className="mt-1 text-xs text-subtle">
                      {report.targetType === "comment" && <>on &ldquo;{report.postTitle}&rdquo; · </>}
                      by{" "}
                      {report.targetAuthor ? (
                        <Link to={`/authors/${report.targetAuthor.id}`} className="font-semibold hover:text-ink">
                          {report.targetAuthor.name}
                        </Link>
                      ) : (
                        "a deleted account"
                      )}
                      {report.targetAuthor?.isBlocked && <span className="ml-1 text-danger">(blocked)</span>}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-ink-soft">{report.reasonLabel}</p>
                    {report.details && <p className="mt-1 text-xs text-subtle italic">&ldquo;{report.details}&rdquo;</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-subtle">
                    <p className="text-sm text-ink-soft">{report.reporter?.name ?? "Deleted account"}</p>
                    {timeAgo(report.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {open ? (
                      <div className="flex flex-wrap gap-2">
                        <Button variant="danger" size="sm" disabled={busy} onClick={() => resolve(report, "remove")}>
                          Remove content
                        </Button>
                        {report.targetAuthor && !report.targetAuthor.isBlocked && (
                          <Button variant="secondary" size="sm" disabled={busy} onClick={() => resolve(report, "block")}>
                            Block user
                          </Button>
                        )}
                        <Button variant="secondary" size="sm" disabled={busy} onClick={() => resolve(report, "dismiss")}>
                          Resolve
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-subtle">
                        <span className="font-semibold text-ink-soft">Resolved — {outcome(report.actions).toLowerCase()}</span>
                        {report.resolvedBy && <> · by {report.resolvedBy.name}</>}
                        {report.resolvedAt && <> · {formatDate(report.resolvedAt)}</>}
                      </p>
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
        {state === "ready" && reports.length > 0 && status !== "all" && (
          <p className="text-center text-xs text-subtle">{plural(status === "open" ? counts.open : counts.resolved, `${status} report`)}</p>
        )}
      </div>
    </div>
  )
}
