import { BrowserRouter, Link, Route, Routes } from "react-router-dom"
import Editor from "./pages/Editor"
import Home from "./pages/Home"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/write" element={<Write />} />
      </Routes>
    </BrowserRouter>
  )
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
