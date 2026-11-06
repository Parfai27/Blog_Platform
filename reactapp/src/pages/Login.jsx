import { useState } from "react"
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom"
import AuthCard from "../components/AuthCard"
import Button from "../components/ui/Button"
import { FormError, FormNotice, PasswordField, TextField } from "../components/ui/Field"
import { useAuth } from "../context/auth-context"
import { api } from "../lib/api"
import { usePageTitle } from "../lib/usePageTitle"
import { checkEmail, safeNext } from "../lib/validation"

export default function Login() {
  usePageTitle("Log in")
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get("next"))
  const [email, setEmail] = useState(params.get("email") ?? "")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState("")
  const [sending, setSending] = useState(false)

  if (user) return <Navigate to={next} replace />

  const submit = async (event) => {
    event.preventDefault()
    const found = {
      email: checkEmail(email),
      password: password ? "" : "Password is required",
    }
    setErrors(found)
    setFormError("")
    if (found.email || found.password) return

    setSending(true)
    try {
      const data = await api("/auth/login", { method: "POST", body: { email: email.trim(), password } })
      signIn(data.token, data.user)
      navigate(next, { replace: true })
    } catch (err) {
      setFormError(err.message)
      setSending(false)
    }
  }

  const notice =
    params.get("reset") === "1"
      ? "Your password is reset. Log in with the new one."
      : params.get("next")
        ? "Log in to continue."
        : ""

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to write, comment, and like stories."
      footer={
        <>
          New to Open Margin?{" "}
          <Link to={`/register${params.get("next") ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="grid gap-4">
        <FormNotice>{notice}</FormNotice>
        <FormError>{formError}</FormError>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          placeholder="you@example.com"
        />
        <div>
          <PasswordField
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
          />
          <Link to="/forgot-password" className="mt-2 inline-block text-xs font-semibold text-brand hover:underline">
            Forgot your password?
          </Link>
        </div>
        <Button type="submit" size="lg" disabled={sending} className="mt-1 w-full">
          {sending ? "Logging in..." : "Log in"}
        </Button>
      </form>
    </AuthCard>
  )
}
