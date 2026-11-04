<<<<<<< HEAD
import { BrowserRouter, Link, Route, Routes, useParams, useNavigate } from "react-router-dom"
import Editor from "./pages/Editor"
import Home from "./pages/Home"
import SinglePost from "./pages/SinglePost"
=======
import { BrowserRouter, Link, Route, Routes } from "react-router-dom"
import Editor from "./pages/Editor"
import Home from "./pages/Home"
>>>>>>> 64901d03c8267b51cf3338c6552ec3631dbeaa4f

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
<<<<<<< HEAD
        <Route path="/" element={<HomeWrapper />} />
        <Route path="/write" element={<Write />} />
        <Route path="/posts/:slug" element={<SinglePostWrapper />} />
=======
        <Route path="/" element={<Home />} />
        <Route path="/write" element={<Write />} />
>>>>>>> 64901d03c8267b51cf3338c6552ec3631dbeaa4f
      </Routes>
    </BrowserRouter>
  )
}

<<<<<<< HEAD
// Wrapper to pass navigation hooks cleanly into Home
function HomeWrapper() {
  const navigate = useNavigate()
  return <Home onSelectPost={(slug) => navigate(`/posts/${slug}`)} />
}

// Wrapper to grab the dynamic slug parameter from the URL for SinglePost
function SinglePostWrapper() {
  const { slug } = useParams()
  const navigate = useNavigate()
  return <SinglePost slug={slug} onBack={() => navigate("/")} />
}

=======
>>>>>>> 64901d03c8267b51cf3338c6552ec3631dbeaa4f
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
