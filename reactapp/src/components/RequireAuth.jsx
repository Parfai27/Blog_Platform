import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../context/auth-context"
import { PageLoading } from "./ui/States"

// Wraps routes that need a logged-in user. Visitors go to /login and come back afterwards.
// With `admin`, a logged-in non-admin is sent home instead.
export default function RequireAuth({ admin = false }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoading label="Checking your account..." />

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  if (admin && user.role !== "admin") return <Navigate to="/" replace />

  return <Outlet />
}
