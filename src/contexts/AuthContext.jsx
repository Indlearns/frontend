import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

/**
 * Authentication state for the whole app
 * Stores user info and token; provides login, logout, register
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          const res = await authService.getMe();
          if (res.success) {
            setUser(res.data);
            localStorage.setItem("user", JSON.stringify(res.data));
          }
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const setSession = (data) => {
    const { token, ...userData } = data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email, password, expectedRole = "student") => {
    const res = await authService.login({ email, password, expectedRole });
    if (res.success) setSession(res.data);
    return res;
  };

  const loginWithAuthData = (data) => {
    setSession(data);
  };

  const register = async (name, email, password) => {
    const res = await authService.register({ name, email, password });
    if (res.success) setSession(res.data);
    return res;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isSuperAdmin = user?.role === "superadmin";
  const isAdmin = user?.role === "admin";
  const isTutor = user?.role === "tutor";
  const isStudent = user?.role === "student";
  const isPartner = user?.role === "partner";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithAuthData,
        register,
        logout,
        isAuthenticated,
        isSuperAdmin,
        isAdmin,
        isTutor,
        isStudent,
        isPartner,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
