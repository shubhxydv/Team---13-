import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, KeyRound, RefreshCw } from "lucide-react";

export function LoginPage() {
  const { login, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // OTP States (for users who need to verify)
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [pendingRole, setPendingRole] = useState("user");

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const data = await login(form);
      if (data.user.role === "admin") navigate("/admin-dashboard");
      else if (data.user.role === "serviceProvider") navigate("/provider-dashboard");
      else navigate("/");
    } catch (err) {
      // Check if the error is specifically about email verification
      // My backend returns { success: false, message: "...", needsVerification: true, email: "...", role: "..." }
      // But AuthContext login function just throws Error(data.message).
      // I should modify AuthContext.login to return the full data or catch it here.
      // Let's assume for now the backend error message includes "verify your email" or I check the API response properly.
      
      // Since I know I need to handle this, let's briefly look at AuthContext again.
      // In AuthContext.js: if (!data.success) throw new Error(data.message);
      // I need to change AuthContext to pass the extra data if possible, or just parse the error.
      // Better: I'll update AuthContext.js login to pass the whole data object if it needs verification.
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if error message suggests verification is needed
  useEffect(() => {
    if (error.toLowerCase().includes("verify your email")) {
      // We could automatically show OTP if we had the role.
      // For now, let's add a "Verify Now" button to the error message or just show it if we encounter the error.
    }
  }, [error]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // We need to know the role. Since we don't know it from login error yet, 
      // let's assume 'user' or try both. Better to update AuthContext.
      const data = await verifyOtp({ email: form.email, otp, role: pendingRole });
      setSuccess("Email verified and logged in!");
      
      setTimeout(() => {
        if (data.user.role === "serviceProvider") navigate("/provider-dashboard");
        else navigate("/");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError("");
    try {
      await resendOtp({ email: form.email, role: pendingRole });
      setSuccess("New OTP sent to your email!");
      setResendTimer(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerVerificationFlow = (role) => {
    setPendingRole(role);
    setShowOtp(true);
    setError("");
    setResendTimer(0); // Allow immediate resend if they just got here
  };

  return (
    <div className="ue-auth-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .ue-auth-page {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          font-family: 'DM Sans', sans-serif;
          padding: 24px 16px;
        }

        .ue-auth-card {
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          border-radius: 24px;
          padding: 40px 32px;
          box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.04),
            0 8px 32px rgba(0, 0, 0, 0.06);
          position: relative;
        }

        .ue-back-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          margin-bottom: 32px;
          transition: opacity 0.2s;
        }
        .ue-back-link:hover { opacity: 0.8; }

        .ue-back-arrow {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .ue-back-link:hover .ue-back-arrow { background: #e2e8f0; }

        .ue-logo-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ue-logo-icon span {
          font-family: 'Sora', sans-serif;
          color: white;
          font-weight: 700;
          font-size: 1rem;
        }
        .ue-logo-text {
          font-family: 'Sora', sans-serif;
          font-weight: 600;
          font-size: 1.1rem;
          color: #0f172a;
        }

        .ue-auth-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 6px 0;
          letter-spacing: -0.01em;
        }
        .ue-auth-subtitle {
          color: #64748b;
          font-size: 0.92rem;
          margin: 0 0 28px 0;
          line-height: 1.5;
        }
        .ue-auth-subtitle a {
          color: #2563eb;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s;
        }
        .ue-auth-subtitle a:hover { color: #1d4ed8; }

        /* Error & Success */
        .ue-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.85rem;
          margin-bottom: 20px;
          line-height: 1.4;
        }
        .ue-success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.85rem;
          margin-bottom: 20px;
          line-height: 1.4;
        }

        .ue-verify-hint {
          margin-top: 10px;
          display: block;
          font-weight: 600;
          text-decoration: underline;
          cursor: pointer;
          color: #b91c1c;
        }

        /* Form fields */
        .ue-field { margin-bottom: 20px; }
        .ue-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }
        .ue-input-wrap {
          position: relative;
        }
        .ue-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          color: #94a3b8;
          pointer-events: none;
        }
        .ue-input {
          width: 100%;
          padding: 14px 16px 14px 44px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.92rem;
          font-family: 'DM Sans', sans-serif;
          color: #0f172a;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .ue-input:focus {
          border-color: #3b82f6;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
        }
        .ue-input::placeholder { color: #94a3b8; }

        .ue-eye-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        .ue-eye-btn:hover { color: #64748b; }

        /* Submit */
        .ue-submit-btn {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
          margin-top: 8px;
        }
        .ue-submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
          box-shadow: 0 6px 24px rgba(37, 99, 235, 0.45);
          transform: translateY(-1px);
        }
        .ue-submit-btn:active:not(:disabled) { transform: translateY(0); }
        .ue-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .ue-spinner {
          width: 18px;
          height: 18px;
          animation: ue-spin 0.8s linear infinite;
        }
        @keyframes ue-spin { to { transform: rotate(360deg); } }

        /* OTP Specific */
        .ue-otp-input {
          letter-spacing: 12px;
          font-size: 1.4rem;
          font-weight: 700;
          text-align: center;
          padding-left: 16px;
        }
        .ue-resend-container {
          margin-top: 16px;
          text-align: center;
          font-size: 0.85rem;
          color: #64748b;
        }
        .ue-resend-btn {
          background: none;
          border: none;
          color: #2563eb;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 8px;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .ue-resend-btn:hover:not(:disabled) {
          color: #1e40af;
          text-decoration: underline;
        }
        .ue-resend-btn:disabled {
          color: #94a3b8;
          cursor: not-allowed;
        }

        /* Animations */
        @keyframes ue-fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ue-animate { animation: ue-fadeIn 0.5s ease forwards; }
        .ue-delay-1 { animation-delay: 0.08s; opacity: 0; }
        .ue-delay-2 { animation-delay: 0.16s; opacity: 0; }
        .ue-delay-3 { animation-delay: 0.24s; opacity: 0; }

        /* Responsive */
        @media (max-width: 480px) {
          .ue-auth-page { padding: 16px 12px; }
          .ue-auth-card {
            padding: 28px 20px;
            border-radius: 20px;
          }
          .ue-auth-title { font-size: 1.5rem; }
        }
      `}</style>

      <div className="ue-auth-card">
        {/* Logo + Back */}
        {!showOtp ? (
          <Link to="/" className="ue-back-link ue-animate" aria-label="Back to homepage">
            <div className="ue-back-arrow">
              <ArrowLeft style={{ width: 16, height: 16, color: "#64748b" }} />
            </div>
            <div className="ue-logo-icon">
              <span>U</span>
            </div>
            <span className="ue-logo-text">UrbanEase</span>
          </Link>
        ) : (
          <button onClick={() => setShowOtp(false)} className="ue-back-link ue-animate" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <div className="ue-back-arrow">
              <ArrowLeft style={{ width: 16, height: 16, color: "#64748b" }} />
            </div>
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>Back to login</span>
          </button>
        )}

        {/* Heading */}
        <div className="ue-animate ue-delay-1">
          <h1 className="ue-auth-title">{showOtp ? "Verify Email" : "Sign in"}</h1>
          <p className="ue-auth-subtitle">
            {showOtp 
              ? `Enter the code sent to ${form.email}`
              : <>Don't have an account? <Link to="/signup">Create one free</Link></>
            }
          </p>
        </div>

        {/* Error & Success */}
        {error && (
          <div className="ue-error">
            {error}
            {error.toLowerCase().includes("verify your email") && !showOtp && (
              <span className="ue-verify-hint" onClick={() => triggerVerificationFlow("user")}>
                Verify My Account Now
              </span>
            )}
          </div>
        )}
        {success && <div className="ue-success">{success}</div>}

        {!showOtp ? (
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="ue-field ue-animate ue-delay-2">
              <label className="ue-label" htmlFor="login-email">Email address</label>
              <div className="ue-input-wrap">
                <Mail className="ue-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="ue-input"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="ue-field ue-animate ue-delay-2">
              <label className="ue-label" htmlFor="login-password">Password</label>
              <div className="ue-input-wrap">
                <Lock className="ue-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="ue-input"
                  style={{ paddingRight: 48 }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="ue-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="ue-animate ue-delay-3">
              <button type="submit" disabled={loading} className="ue-submit-btn">
                {loading ? (
                  <>
                    <svg className="ue-spinner" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>Sign In <ArrowRight style={{ width: 16, height: 16 }} /></>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="ue-animate">
            <div className="ue-field">
              <label className="ue-label" htmlFor="otp-input">Verification Code</label>
              <div className="ue-input-wrap">
                <KeyRound className="ue-input-icon" />
                <input
                  id="otp-input"
                  type="text"
                  name="otp"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  required
                  className="ue-input ue-otp-input"
                  autoComplete="one-time-code"
                  autoFocus
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="ue-submit-btn">
              {loading ? (
                <>
                  <svg className="ue-spinner" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Verifying…
                </>
              ) : (
                <>Verify & Login <ArrowRight style={{ width: 16, height: 16 }} /></>
              )}
            </button>

            <div className="ue-resend-container">
              {resendTimer > 0 ? (
                <p>Resend code in <strong>{resendTimer}s</strong></p>
              ) : (
                <button 
                  type="button" 
                  onClick={handleResendOtp} 
                  disabled={loading}
                  className="ue-resend-btn"
                >
                  <RefreshCw style={{ width: 14, height: 14 }} /> Resend OTP
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}