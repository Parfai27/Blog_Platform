import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import AdminLayout from "./components/admin/AdminLayout"
import Layout from "./components/Layout"
import RequireAuth from "./components/RequireAuth"
import { AuthProvider } from "./context/AuthProvider"
import AdminCategories from "./pages/admin/AdminCategories"
import AdminReports from "./pages/admin/AdminReports"
import AdminUsers from "./pages/admin/AdminUsers"
import Author from "./pages/Author"
import Category from "./pages/Category"
import About from "./pages/About"
import Editor from "./pages/Editor"
import ForgotPassword from "./pages/ForgotPassword"
import Home from "./pages/Home"
import Login from "./pages/Login"
import MyPosts from "./pages/MyPosts"
import NotFound from "./pages/NotFound"
import Post from "./pages/Post"
import Register from "./pages/Register"
import Settings from "./pages/Settings"
import Stories from "./pages/Stories"

// Every page in the Figma has its address here.
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Reading */}
            <Route index element={<Home />} />
            <Route path="blogs" element={<Stories />} />
            <Route path="search" element={<Stories mode="search" />} />
            <Route path="posts/:slug" element={<Post />} />
            <Route path="categories/:slug" element={<Category />} />
            <Route path="authors/:id" element={<Author />} />
            <Route path="about" element={<About />} />

            {/* Accounts */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />

            {/* Logged-in pages */}
            <Route element={<RequireAuth />}>
              <Route path="write" element={<Editor />} />
              <Route path="write/:id" element={<Editor />} />
              <Route path="my-posts" element={<MyPosts />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin pages have their own layout with a sidebar, like the Figma. */}
          <Route path="admin" element={<RequireAuth admin />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="reports" replace />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="*" element={<Navigate to="/admin/reports" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
