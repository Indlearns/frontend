import { createContext, useContext, useEffect, useState } from "react";
import { affiliateService } from "../services/affiliateService";

const AffiliateAuthContext = createContext();

export const AffiliateAuthProvider = ({ children }) => {
  const [affiliate, setAffiliate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      const saved = localStorage.getItem("user");

      if (!token || !saved) {
        setLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(saved);
        if (parsed.role !== "affiliate") {
          setLoading(false);
          return;
        }

        setAffiliate(parsed);
        const res = await affiliateService.getMe();
        if (res.success) {
          setAffiliate(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
        }
      } catch {
        if (JSON.parse(localStorage.getItem("user") || "{}").role === "affiliate") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
        setAffiliate(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const setSession = (data) => {
    const { token, ...userData } = data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setAffiliate(userData);
  };

  const login = async (email, password) => {
    const res = await affiliateService.login({ email, password });
    if (res.success) setSession(res.data);
    return res;
  };

  const register = async (payload) => {
    const res = await affiliateService.register(payload);
    if (res.success) setSession(res.data);
    return res;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAffiliate(null);
  };

  const refreshAffiliate = async () => {
    const res = await affiliateService.getMe();
    if (res.success) {
      setAffiliate(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    }
    return res;
  };

  return (
    <AffiliateAuthContext.Provider
      value={{
        affiliate,
        loading,
        login,
        register,
        logout,
        refreshAffiliate,
        isAffiliateAuthenticated: Boolean(affiliate),
      }}
    >
      {children}
    </AffiliateAuthContext.Provider>
  );
};

export const useAffiliateAuth = () => {
  const ctx = useContext(AffiliateAuthContext);
  if (!ctx) throw new Error("useAffiliateAuth must be used within AffiliateAuthProvider");
  return ctx;
};
