import { useId, useState } from "react"

const INPUT =
  "w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-subtle focus:border-brand focus:ring-2 focus:ring-brand/15"

// A labelled input with an optional hint and error. Extra props go to the <input>.
export function TextField({ label, error, hint, className = "", ...props }) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`${INPUT} mt-1.5 ${error ? "border-danger" : "border-line-strong"}`}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1 text-xs text-subtle">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

// A password input with a Show / Hide toggle.
export function PasswordField({ label = "Password", error, hint, className = "", ...props }) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${INPUT} pr-16 ${error ? "border-danger" : "border-line-strong"}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-controls={id}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-semibold text-muted hover:text-ink"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1 text-xs text-subtle">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

// A labelled textarea with a character counter.
export function TextAreaField({ label, error, maxLength, value, className = "", ...props }) {
  const id = useId()

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
        {maxLength && (
          <span className="text-xs text-subtle">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        id={id}
        value={value}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        className={`${INPUT} mt-1.5 ${error ? "border-danger" : "border-line-strong"}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
}

export function FormError({ children }) {
  if (!children) return null
  return (
    <p role="alert" className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
      {children}
    </p>
  )
}

export function FormNotice({ children }) {
  if (!children) return null
  return (
    <p role="status" className="rounded-xl bg-brand-soft px-3 py-2 text-sm text-brand">
      {children}
    </p>
  )
}
