export default function Logo({ className = "h-9 w-9" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#1DB87A" />
      <rect x="15" y="13" width="34" height="38" rx="5" fill="none" stroke="#fff" strokeWidth="2.4" />
      <path d="M26 13.8v36.4" stroke="#fff" strokeWidth="2.2" />
      <circle cx="20.6" cy="24" r="1.7" fill="#fff" />
      <path d="M32 24h12M32 32h12M32 40h8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}
