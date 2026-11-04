import { apiRequest, AUTH_TOKEN_KEY } from "./api";

function saveSession(token, user) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  return user;
}

export async function registerUser({ firstName, lastName, email, password, bio, avatar }) {
  const formData = new FormData();
  formData.append("firstName", firstName);
  formData.append("lastName", lastName);
  formData.append("email", email);
  formData.append("password", password);
  formData.append("bio", bio);
  formData.append("avatar", avatar);

  const response = await apiRequest("/auth/signup", {
    method: "POST",
    body: formData,
  });

  return response.data.user;
}

export async function loginUser({ email, password }) {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return saveSession(response.data.token, response.data.user);
}

export async function getCurrentUser() {
  if (!localStorage.getItem(AUTH_TOKEN_KEY)) {
    return null;
  }

  const response = await apiRequest("/auth/me");
  return response.data.user;
}

export async function updateCurrentUser({ firstName, lastName, bio, avatar }) {
  const formData = new FormData();
  formData.append("firstName", firstName);
  formData.append("lastName", lastName);
  formData.append("bio", bio);
  if (avatar) {
    formData.append("avatar", avatar);
  }

  const response = await apiRequest("/users/me", {
    method: "PATCH",
    body: formData,
  });

  return response.data.user;
}

export function logoutUser() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function requestPasswordReset(email) {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword({ email, code, newPassword }) {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, code, newPassword }),
  });
}
