import { useState } from "react"
import { fullName, initials } from "../../lib/format"

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  picker: "h-16 w-16 text-lg",
  lg: "h-20 w-20 text-2xl",
}

// The API sends the avatar as a URL string (posts, comments) or as { url } (the user).
// "/logo.svg" is the placeholder the seed and dev accounts use, so those show initials.
const avatarUrl = (person) => {
  const url = typeof person?.avatar === "string" ? person.avatar : person?.avatar?.url
  return url && !url.endsWith("/logo.svg") ? url : ""
}

export default function Avatar({ person, size = "md", className = "" }) {
  const [broken, setBroken] = useState(false)
  const url = avatarUrl(person)
  const box = `${SIZES[size]} shrink-0 rounded-full ${className}`

  if (url && !broken) {
    return <img src={url} alt={fullName(person)} onError={() => setBroken(true)} className={`${box} object-cover`} />
  }

  return (
    <span aria-label={fullName(person) || undefined} className={`${box} inline-flex items-center justify-center bg-brand-soft font-bold text-brand`}>
      {initials(person)}
    </span>
  )
}
