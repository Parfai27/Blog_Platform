import { useCallback, useEffect, useMemo, useState } from "react"
import { api, AUTH_EXPIRED_EVENT, clearToken, getToken, setToken } from "../lib/api"
import { AuthContext } from "./auth-context"

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // With a saved token we check it before deciding whether someone is logged in.
  const [loading, setLoading] = useState(() => Boolean(getToken()))

  useEffect(() => {
    if (!getToken()) return
    let cancelled = false

    api("/auth/me")
      .then((data) => {
        if (!cancelled) setUser(data.user)
      })
      .catch((error) => {
        // A token for no account (or a blocked one) is useless. Keep it if the API is just down.
        if ([401, 403, 404].includes(error.status)) clearToken()
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const onExpired = () => setUser(null)
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired)
  }, [])

  const signIn = useCallback((token, nextUser) => {
    setToken(token)
    setUser(nextUser)
  }, [])

  const signOut = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  const refresh = useCallback(async () => {
    const data = await api("/auth/me")
    setUser(data.user)
    return data.user
  }, [])

  const value = useMemo(
    () => ({ user, loading, isAdmin: user?.role === "admin", signIn, signOut, refresh, setUser }),
    [user, loading, signIn, signOut, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
