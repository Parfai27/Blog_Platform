export async function api(path, { token, method = "GET", body } = {}) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers["Content-Type"] = "application/json"

  const response = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.message || "Request failed")
    error.status = response.status
    throw error
  }
  return data
}

// Higher-level API helpers matching your Express backend routes
const BASE_URL = "http://localhost:5000/api"

export const blogApi = {
  // Fetch published posts with optional search & category query parameters
  async getPublishedPosts(search = "", category = "") {
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    if (category && category !== "All") params.append("category", category)

    const queryString = params.toString() ? `?${params.toString()}` : ""
    const data = await api(`${BASE_URL}/posts${queryString}`)
    return Array.isArray(data) ? data : data.posts || []
  },

  // Fetch single post details by slug
  async getPostBySlug(slug) {
    return api(`${BASE_URL}/posts/${slug}`)
  },

  // Fetch all categories for filter buttons
  async getCategories() {
    return api(`${BASE_URL}/categories`)
  },

  // Fetch comments for a specific post
  async getComments(postId) {
    const data = await api(`${BASE_URL}/posts/${postId}/comments`)
    return Array.isArray(data) ? data : []
  },

  // Add comment (expects body matching comment.model.ts)
  async addComment(postId, body, token) {
    return api(`${BASE_URL}/posts/${postId}/comments`, {
      method: "POST",
      token,
      body: { body },
    })
  },

  // Toggle post like
  async toggleLike(postId, token) {
    return api(`${BASE_URL}/posts/${postId}/like`, {
      method: "POST",
      token,
    })
  },
}