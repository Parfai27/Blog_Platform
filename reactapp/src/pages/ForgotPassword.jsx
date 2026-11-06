import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import AuthCard from "../components/AuthCard"
import Button from "../components/ui/Button"
import { FormError, FormNotice, PasswordField, TextField } from "../components/ui/Field"
import { api } from "../lib/api"
import { usePageTitle } from "../lib/usePageTitle"
import { checkEmail, checkPassword, LIMITS } from "../lib/validation"

// Two steps on one page: ask for a code by email, then enter it with a new password.
export default function ForgotPassword() {
  usePageTitle("Reset your password")
  const navigate = useNavigate()
  const [stage, setStage] = useState("request")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState("")
  const [notice, setNotice] = useState("")
  const [sending, setSending] = useState(false)

  const requestCode = async (event) => {
    event.preventDefault()
    const problem = checkEmail(email)
    setErrors({ email: problem })
    setFormError("")
    if (problem) return

    setSending(true)
    try {
      const reply = await api("/auth/forgot-password", { method: "POST", body: { email: email.trim() }, full: true })
      // On a dev machine the API can hand back the code instead of emailing it.
      const devCode = reply.data?.resetCode
      if (devCode) setCode(devCode)
      setNotice(devCode ? `${reply.message} Development code: ${devCode}` : reply.message)
      setStage("reset")
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSending(false)
    }
  }

  const resetPassword = async (event) => {
    event.preventDefault()
    const found = {
      code: /^\d{6}$/.test(code.trim()) ? "" : "Enter the 6-digit code from the email",
      password: checkPassword(password),
      confirm: confirm === password ? "" : "The passwords do not match",
    }
    setErrors(found)
    setFormError("")
    if (Object.values(found).some(Boolean)) return

    setSending(true)
    try {
      await api("/auth/reset-password", {
        method: "POST",
        body: { email: email.trim(), code: code.trim(), newPassword: password },
      })
      navigate(`/login?reset=1&email=${encodeURIComponent(email.trim())}`, { replace: true })
    } catch (err) {
      setFormError(err.message)
      setSending(false)
    }
  }

  const backToLogin = (
    <Link to="/login" className="font-semibold text-brand hover:underline">
      Back to log in
    </Link>
  )

  if (stage === "request") {
    return (
      <AuthCard
        title="Reset your password"
        subtitle="Enter the email you signed up with and we'll send you a 6-digit code."
        footer={backToLogin}
      >
        <form onSubmit={requestCode} noValidate className="grid gap-4">
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
          <Button type="submit" size="lg" disabled={sending} className="w-full">
            {sending ? "Sending..." : "Send the code"}
          </Button>
        </form>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Choose a new password" subtitle={`The code expires 10 minutes after it is sent to ${email.trim()}.`} footer={backToLogin}>
      <form onSubmit={resetPassword} noValidate className="grid gap-4">
        <FormNotice>{notice}</FormNotice>
        <FormError>{formError}</FormError>
        <TextField
          label="6-digit code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
          error={errors.code}
        />
        <PasswordField
          label="New password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          maxLength={LIMITS.passwordMax}
          error={errors.password}
          hint={`At least ${LIMITS.passwordMin} characters`}
        />
        <PasswordField
          label="Confirm new password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          maxLength={LIMITS.passwordMax}
          error={errors.confirm}
        />
        <Button type="submit" size="lg" disabled={sending} className="w-full">
          {sending ? "Saving..." : "Save new password"}
        </Button>
        <button
          type="button"
          onClick={() => {
            setStage("request")
            setCode("")
            setNotice("")
            setFormError("")
          }}
          className="text-xs font-semibold text-muted hover:text-ink"
        >
          Didn&apos;t get a code? Send a new one
        </button>
      </form>
    </AuthCard>
  )
}
