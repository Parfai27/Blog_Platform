const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");
export const AUTH_TOKEN_KEY = "blog_auth_token";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data: { message?: string } & Record<string, unknown> = {};
  if (text) {
    try {
      const parsed: unknown = JSON.parse(text);
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        data = parsed as { message?: string } & Record<string, unknown>;
      }
    } catch {
      throw new Error(`The API returned an invalid response (HTTP ${response.status}).`);
    }
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data as T;
}