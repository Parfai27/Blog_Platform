import { useState } from "react"
import { Link } from "react-router-dom"
import AvatarPicker from "../components/AvatarPicker"
import Button from "../components/ui/Button"
import { FormError, FormNotice, TextAreaField, TextField } from "../components/ui/Field"
import { useAuth } from "../context/auth-context"
import { api } from "../lib/api"
import { usePageTitle } from "../lib/usePageTitle"
import { checkName, LIMITS } from "../lib/validation"

// Edit your name, bio, and photo. Sits behind RequireAuth, so `user` is always set.
export default function Settings() {
  usePageTitle("Profile settings")
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    bio: user.bio ?? "",
  })
  const [avatar, setAvatar] = useState(null)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState("")
  const [notice, setNotice] = useState("")
  const [saving, setSaving] = useState(false)

  const update = (field) => (event) => {
    setNotice("")
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const changed =
    Boolean(avatar) ||
    form.firstName.trim() !== user.firstName ||
    form.lastName.trim() !== user.lastName ||
    form.bio.trim() !== (user.bio ?? "")

  const save = async (event) => {
    event.preventDefault()
    const found = {
      firstName: checkName(form.firstName, "First name"),
      lastName: checkName(form.lastName, "Last name"),
    }
    setErrors(found)
    setFormError("")
    setNotice("")
    if (found.firstName || found.lastName) return

    setSaving(true)
    try {
      const body = new FormData()
      body.append("firstName", form.firstName.trim())
      body.append("lastName", form.lastName.trim())
      body.append("bio", form.bio.trim())
      if (avatar) body.append("avatar", avatar)
      const data = await api("/users/me", { method: "PATCH", body })
      setUser(data.user)
      setAvatar(null)
      setNotice("Your profile is saved.")
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-paper px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-serif text-4xl tracking-tight text-ink">Profile settings</h1>
          <Link to={`/authors/${user.id}`} className="text-sm font-semibold text-brand hover:underline">
            View my public profile
          </Link>
        </div>

        <form onSubmit={save} noValidate className="mt-6 grid gap-5 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <FormNotice>{notice}</FormNotice>
          <FormError>{formError}</FormError>

          <AvatarPicker
            person={user}
            file={avatar}
            onChange={(file) => {
              setNotice("")
              setAvatar(file)
            }}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="First name"
              autoComplete="given-name"
              value={form.firstName}
              onChange={update("firstName")}
              maxLength={LIMITS.name}
              error={errors.firstName}
            />
            <TextField
              label="Last name"
              autoComplete="family-name"
              value={form.lastName}
              onChange={update("lastName")}
              maxLength={LIMITS.name}
              error={errors.lastName}
            />
          </div>

          <TextField label="Email" value={user.email} disabled hint="Your email cannot be changed here." />

          <TextAreaField
            label="Bio"
            value={form.bio}
            onChange={update("bio")}
            maxLength={LIMITS.bio}
            rows={4}
            placeholder="A line or two about what you write. It shows on your public profile."
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={saving || !changed}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
