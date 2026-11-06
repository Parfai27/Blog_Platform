import { useState } from "react"
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom"
import AuthCard from "../components/AuthCard"
import AvatarPicker from "../components/AvatarPicker"
import Button from "../components/ui/Button"
import { FormError, PasswordField, TextField } from "../components/ui/Field"
import { useAuth } from "../context/auth-context"
import { api } from "../lib/api"
import { usePageTitle } from "../lib/usePageTitle"
import { checkEmail, checkName, checkPassword, LIMITS, safeNext } from "../lib/validation"

const EMPTY = { firstName: "", lastName: "", email: "", password: "", confirm: "" }

export default function Register() {
  usePageTitle("Sign up")
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get("next"))
  const [form, setForm] = useState(EMPTY)
  const [avatar, setAvatar] = useState(null)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState("")
  const [sending, setSending] = useState(false)

  if (user && !sending) return <Navigate to={next} replace />

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    const found = {
      firstName: checkName(form.firstName, "First name"),
      lastName: checkName(form.lastName, "Last name"),
      email: checkEmail(form.email),
      password: checkPassword(form.password),
      confirm: form.confirm === form.password ? "" : "The passwords do not match",
      avatar: avatar ? "" : "A profile photo is required",
    }
    setErrors(found)
    setFormError("")
    if (Object.values(found).some(Boolean)) return

    setSending(true)
    try {
      const body = new FormData()
      body.append("firstName", form.firstName.trim())
      body.append("lastName", form.lastName.trim())
      body.append("email", form.email.trim())
      body.append("password", form.password)
      body.append("avatar", avatar)
      await api("/auth/signup", { method: "POST", body })

      // Sign-up does not return a token, so log in straight away with the same details.
      const session = await api("/auth/login", {
        method: "POST",
        body: { email: form.email.trim(), password: form.password },
      })
      signIn(session.token, session.user)
      navigate(next, { replace: true })
    } catch (err) {
      setFormError(err.message)
      setSending(false)
    }
  }

  return (
    <AuthCard
      title="Join Open Margin"
      subtitle="Every member can write. Start with a story only you could tell."
      footer={
        <>
          Already have an account?{" "}
          <Link to={`/login${params.get("next") ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="grid gap-4">
        <FormError>{formError}</FormError>
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
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={update("email")}
          error={errors.email}
          placeholder="you@example.com"
        />
        <PasswordField
          autoComplete="new-password"
          value={form.password}
          onChange={update("password")}
          maxLength={LIMITS.passwordMax}
          error={errors.password}
          hint={`At least ${LIMITS.passwordMin} characters`}
        />
        <PasswordField
          label="Confirm password"
          autoComplete="new-password"
          value={form.confirm}
          onChange={update("confirm")}
          maxLength={LIMITS.passwordMax}
          error={errors.confirm}
        />
        <AvatarPicker
          person={{ firstName: form.firstName, lastName: form.lastName }}
          file={avatar}
          onChange={(file) => {
            setAvatar(file)
            setErrors((current) => ({ ...current, avatar: "" }))
          }}
          error={errors.avatar}
          required
        />
        <Button type="submit" size="lg" disabled={sending} className="mt-1 w-full">
          {sending ? "Creating your account..." : "Create account"}
        </Button>
      </form>
    </AuthCard>
  )
}
