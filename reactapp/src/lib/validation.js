// The same rules the API checks, so mistakes show before the form is sent.

export const LIMITS = {
  name: 40,
  bio: 280,
  passwordMin: 8,
  passwordMax: 72,
  avatarMb: 2,
  coverMb: 5,
  title: 150,
  excerpt: 300,
  body: 50000,
  tags: 5,
  tagName: 30,
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

export const IMAGE_ACCEPT = IMAGE_TYPES.join(",")

export const checkName = (value, label) => {
  const text = value.trim()
  if (!text) return `${label} is required`
  if (text.length > LIMITS.name) return `${label} must be ${LIMITS.name} characters or fewer`
  return ""
}

export const checkEmail = (value) => {
  const text = value.trim()
  if (!text) return "Email is required"
  if (!EMAIL_PATTERN.test(text)) return "Enter a valid email address"
  return ""
}

export const checkPassword = (value) => {
  if (!value) return "Password is required"
  if (value.length < LIMITS.passwordMin || value.length > LIMITS.passwordMax) {
    return `Password must be ${LIMITS.passwordMin} to ${LIMITS.passwordMax} characters`
  }
  return ""
}

export const checkImage = (file, maxMb = LIMITS.avatarMb) => {
  if (!IMAGE_TYPES.includes(file.type)) return "Choose a JPEG, PNG, or WebP image"
  if (file.size > maxMb * 1024 * 1024) return `The image must be ${maxMb} MB or smaller`
  return ""
}

// Keeps ?next= inside this site, so a link cannot send someone elsewhere after logging in.
export const safeNext = (value) => (value && value.startsWith("/") && !value.startsWith("//") ? value : "/")
