// Status badges from the Figma: Published, Draft, Open, Resolved, Active, Blocked.
const TONES = {
  published: "bg-brand-soft text-brand",
  active: "bg-brand-soft text-brand",
  resolved: "bg-brand-soft text-brand",
  draft: "bg-warn-soft text-warn",
  open: "bg-danger-soft text-danger",
  blocked: "bg-danger-soft text-danger",
}

export default function Badge({ status, children }) {
  const tone = TONES[status] ?? "bg-paper text-muted"
  const label = children ?? (status ? status[0].toUpperCase() + status.slice(1) : "")

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>
      {label}
    </span>
  )
}
