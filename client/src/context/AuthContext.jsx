import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("urbanease_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) localStorage.setItem("urbanease_token", token);
    else localStorage.removeItem("urbanease_token");
  }, [token]);

  const fetchMe = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setUser(data.user);
      else { setToken(null); setUser(null); }
    } catch {
      setToken(null); setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  // Step 1: Signup sends OTP — does NOT log the user in yet
  const signupUser = async ({ name, email, password, phone }) => {
    const res = await fetch(`${API_BASE}/auth/signup/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    // Returns { success, message, email, role } — no token yet
    return data;
  };

  const signupProvider = async (formData) => {
    const res = await fetch(`${API_BASE}/auth/signup/provider`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  };

  const signupAdmin = async ({ name, email, password, adminKey }) => {
    const res = await fetch(`${API_BASE}/auth/signup/admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, adminKey }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  // Step 2: Verify OTP → completes signup & logs user in
  const verifyOtp = async ({ email, otp, role }) => {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, role }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  // Resend OTP
  const resendOtp = async ({ email, role }) => {
    const res = await fetch(`${API_BASE}/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  };

  const login = async ({ email, password }) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === "admin";
  const isServiceProvider = user?.role === "serviceProvider";
  const isNormalUser = user?.role === "user";
  const isVerifiedProvider = isServiceProvider && user?.isVerified;

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      signupUser, signupProvider, signupAdmin,
      verifyOtp, resendOtp,
      login, logout,
      updateUser,
      isAuthenticated, isAdmin, isServiceProvider,
      isNormalUser, isVerifiedProvider,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;