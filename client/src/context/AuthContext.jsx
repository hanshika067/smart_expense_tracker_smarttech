import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("se_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    setBooting(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      booting,
      isAuthed: Boolean(getToken() && user),
      async login(email, password) {
        const data = await api.login({ email, password });
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("se_user", JSON.stringify(data.user));
        return data.user;
      },
      async signup(name, email, password) {
        const data = await api.signup({ name, email, password });
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("se_user", JSON.stringify(data.user));
        return data.user;
      },
      logout() {
        setToken(null);
        setUser(null);
        localStorage.removeItem("se_user");
      },
    }),
    [user, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
