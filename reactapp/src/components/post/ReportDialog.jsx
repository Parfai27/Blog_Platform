import { Flag } from "lucide-react"
import { useState } from "react"
import { api } from "../../lib/api"
import Button from "../ui/Button"
import Modal from "../ui/Modal"

// The reasons the API accepts, with the wording from the Figma report form.
const REASONS = [
  { value: "spam", label: "Spam or advertising" },
  { value: "harassment", label: "Harassment or hate" },
  { value: "misleading", label: "False or misleading" },
  { value: "sexual_violent", label: "Sexual or violent content" },
  { value: "other", label: "Other" },
]

const DETAILS_MAX = 500

// target: { type: "post" | "comment", id, name } — name is shown in the intro line.
export default function ReportDialog({ target, onClose }) {
  const [reason, setReason] = useState("spam")
  const [details, setDetails] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setSending(true)
    setError("")
    try {
      await api("/reports", {
        method: "POST",
        body: { targetType: target.type, targetId: target.id, reason, details: details.trim() },
      })
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const title = target.type === "post" ? "Report this post" : "Report this comment"

  if (sent) {
    return (
      <Modal title="Thanks for telling us" onClose={onClose}>
        <p className="mt-3 text-sm leading-6 text-muted">An admin will review your report. Your report is private.</p>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit}>
        <p className="mt-2 text-sm leading-6 text-muted">
          Tell the admin what&apos;s wrong{target.name ? <> with &ldquo;{target.name}&rdquo;</> : ""}. Your report is private.
        </p>

        <fieldset className="mt-4 grid gap-2">
          <legend className="sr-only">Reason</legend>
          {REASONS.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                reason === option.value ? "border-brand bg-brand-soft text-ink" : "border-line hover:border-line-strong"
              }`}
            >
              <input
                type="radio"
                name="reason"
                value={option.value}
                checked={reason === option.value}
                onChange={() => setReason(option.value)}
                className="accent-brand"
              />
              {option.label}
            </label>
          ))}
        </fieldset>

        <label className="mt-4 grid gap-1 text-sm font-semibold text-ink">
          Details (optional)
          <textarea
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            maxLength={DETAILS_MAX}
            rows={3}
            className="rounded-xl border border-line-strong px-3 py-2 font-normal outline-none focus:border-brand"
          />
        </label>

        {error && <p className="mt-3 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={sending}>
            <Flag className="h-4 w-4" aria-hidden="true" />
            {sending ? "Sending..." : "Submit report"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
