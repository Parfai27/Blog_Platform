import { createContext, useContext } from "react"

export const AuthContext = createContext(null)

// { user, loading, isAdmin, signIn(token, user), signOut(), refresh(), setUser }
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }
  return context
}
