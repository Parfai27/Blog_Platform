import {
  useEffect,
  useState,
} from "react";
import { AuthContext } from "./auth-context";

import {
  getCurrentUser,
  logoutUser,
} from "../services/AuthServices";
import { AUTH_TOKEN_KEY } from "../services/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check whether the user already has a valid session
  useEffect(() => {
    async function loadUser() {
      if (!localStorage.getItem(AUTH_TOKEN_KEY)) {
        setLoading(false);
        return;
      }

      try {
        setUser(await getCurrentUser());
      } catch {
        logoutUser();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // Log out the current user
  function logout() {
    logoutUser();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}