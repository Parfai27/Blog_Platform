// The one way the app talks to the API. It adds the login token, sends JSON or form-data,
// and returns the `data` part of the API's { success, data } reply.

const TOKEN_KEY = "blog_token"

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || ""
  } catch {
    return ""
  }
}

export const setToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // Private browsing can block storage. The session then lasts until the tab closes.
  }
}

export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Nothing to clear.
  }
}

// Fired when the API rejects a stored token, so the app can show the user as logged out.
export const AUTH_EXPIRED_EVENT = "auth:expired"

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

// path is the part after /api, e.g. "/posts" or "/posts/abc/like".
// query skips empty values. body can be a plain object (sent as JSON) or FormData.
// full: true returns the whole reply, for the few places that need its message.
export async function api(path, { method = "GET", body, query, signal, full = false } = {}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") params.append(key, String(value))
  }
  const url = `/api${path}${params.size ? `?${params}` : ""}`

  const headers = { Accept: "application/json" }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let payload = body
  if (body !== undefined && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
    payload = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(url, { method, headers, body: payload, signal })
  } catch (error) {
    if (error.name === "AbortError") throw error
    throw new ApiError("Could not reach the server. Check your connection and try again.", 0)
  }

  const reply = await response.json().catch(() => ({}))

  if (!response.ok) {
    // A wrong password on the login form is also a 401, but that is not an expired session.
    if (response.status === 401 && token && path !== "/auth/login") {
      clearToken()
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    }
    const fallback =
      response.status >= 500
        ? "The server is not responding right now. Try again in a moment."
        : `Request failed (${response.status})`
    throw new ApiError(reply.message || fallback, response.status)
  }

  if (full) return reply
  return reply.data !== undefined ? reply.data : reply
}
