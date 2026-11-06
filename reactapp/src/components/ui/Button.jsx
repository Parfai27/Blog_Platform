import { Link } from "react-router-dom"

// The four button styles from the Figma, plus a quiet "ghost" for low-key actions.
const VARIANTS = {
  primary: "bg-brand text-white hover:bg-brand-hover",
  secondary: "border border-line-strong bg-white text-ink hover:border-ink",
  dark: "bg-ink text-white hover:bg-black",
  danger: "bg-danger-soft text-danger hover:bg-[#fbd9d4]",
  ghost: "text-muted hover:text-ink",
}

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
}

// Renders a <Link> when given `to`, otherwise a <button>.
export default function Button({
  variant = "primary",
  size = "md",
  to,
  type = "button",
  className = "",
  children,
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  )
}
