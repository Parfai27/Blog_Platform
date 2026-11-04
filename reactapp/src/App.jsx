import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { useAuth } from "./context/auth-context"
import Editor from "./pages/Editor"
import ForgotPassword from "./pages/ForgotPassword"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Profile from "./pages/Profile"
import Register from "./pages/Register"

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/write" element={<Write />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <p className="p-6 text-center">Loading your account...</p>
  }

  return user ? children : <Navigate to="/login" replace />
}

function Write() {
  return (
    <main className="min-h-screen bg-[#f6f7f4] px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="text-sm font-semibold text-[#0f6b4c]">
          Back to Open Margin
        </Link>
        <h1 className="font-serif-display mt-3 text-4xl tracking-tight">Write</h1>
        <div className="mt-6">
          <Editor />
        </div>
      </div>
    </main>
  )
}
