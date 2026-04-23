import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Mail, Lock, Eye, EyeOff, User, Phone,
  Briefcase, Shield, ArrowRight, ArrowLeft,
  MapPin, ChevronDown, KeyRound, RefreshCw,
} from "lucide-react";

const SERVICE_CATEGORIES = [
  "Plumbing", "Electrical", "Cleaning", "Carpentry",
  "Painting", "Appliance Repair", "Pest Control", "Gardening", "Security", "Other",
];

export function SignupPage() {
  const { signupUser, signupProvider, signupAdmin, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // OTP States
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
    serviceCategory: "", serviceDescription: "",
    address: "", city: "", experience: "",
    adminKey: "",
  });

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (role === "user") {
        await signupUser({ name: form.name, email: form.email, password: form.password, phone: form.phone });
        setSuccess("OTP sent to your email!");
        setShowOtp(true);
        setResendTimer(60);
      } else if (role === "serviceProvider") {
        await signupProvider({
          name: form.name, email: form.email, password: form.password,
          phone: form.phone, serviceCategory: form.serviceCategory,
          serviceDescription: form.serviceDescription,
          address: form.address, city: form.city,
          experience: Number(form.experience) || 0,
        });
        setSuccess("OTP sent to your email!");
        setShowOtp(true);
        setResendTimer(60);
      } else {
        // Admin signup doesn't need email OTP by default in this implementation, 
        // but we can add it if needed. For now, keeping it direct as per user rules.
        await signupAdmin({ name: form.name, email: form.email, password: form.password, adminKey: form.adminKey });
        navigate("/admin-dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await verifyOtp({ email: form.email, otp, role });
      setSuccess("Account verified successfully!");
      
      // Navigate based on role
      setTimeout(() => {
        if (role === "serviceProvider") navigate("/provider-dashboard");
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
      await resendOtp({ email: form.email, role });
      setSuccess("New OTP sent to your email!");
      setResendTimer(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: "user",            label: "User",     icon: User,      desc: "Book home services" },
    { id: "serviceProvider", label: "Provider",  icon: Briefcase, desc: "Offer your services" },
    { id: "admin",           label: "Admin",     icon: Shield,    desc: "Manage the platform" },
  ];

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
          max-width: 440px;
          background: #ffffff;
          border-radius: 24px;
          padding: 36px 32px;
          box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.04),
            0 8px 32px rgba(0, 0, 0, 0.06);
          position: relative;
          overflow: hidden;
        }

        /* Back + Logo */
        .ue-back-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          margin-bottom: 28px;
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

        /* Heading */
        .ue-auth-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.65rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 6px 0;
          letter-spacing: -0.01em;
        }
        .ue-auth-subtitle {
          color: #64748b;
          font-size: 0.9rem;
          margin: 0 0 24px 0;
          line-height: 1.5;
        }
        .ue-auth-subtitle a {
          color: #2563eb;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s;
        }
        .ue-auth-subtitle a:hover { color: #1d4ed8; }

        /* Role selector */
        .ue-roles {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 24px;
        }
        .ue-role-tab {
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px 8px 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          background: #f8fafc;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
        .ue-role-tab:hover { border-color: #93c5fd; background: #eff6ff; }
        .ue-role-tab.active {
          border-color: #3b82f6;
          background: #eff6ff;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .ue-role-tab .ue-role-icon {
          width: 22px;
          height: 22px;
          margin: 0 auto 6px;
          transition: color 0.2s;
        }
        .ue-role-tab .ue-role-label {
          font-weight: 600;
          font-size: 0.82rem;
          transition: color 0.2s;
        }
        .ue-role-tab .ue-role-desc {
          font-size: 0.68rem;
          color: #94a3b8;
          margin-top: 2px;
          line-height: 1.3;
        }

        /* Notice banners */
        .ue-notice {
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 0.82rem;
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          line-height: 1.45;
        }
        .ue-notice-warn {
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
        }
        .ue-notice-info {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
        }

        /* Error & Success */
        .ue-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.82rem;
          margin-bottom: 16px;
          line-height: 1.4;
        }
        .ue-success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.82rem;
          margin-bottom: 16px;
          line-height: 1.4;
        }

        /* Form fields */
        .ue-field { margin-bottom: 16px; }
        .ue-label {
          display: block;
          font-size: 0.82rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 7px;
        }
        .ue-label-optional { color: #94a3b8; font-weight: 400; }

        .ue-input-wrap { position: relative; }
        .ue-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 17px;
          height: 17px;
          color: #94a3b8;
          pointer-events: none;
        }
        .ue-input {
          width: 100%;
          padding: 13px 16px 13px 42px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.88rem;
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
        .ue-input-no-icon { padding-left: 16px; }

        .ue-select {
          width: 100%;
          padding: 13px 40px 13px 16px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.88rem;
          font-family: 'DM Sans', sans-serif;
          color: #0f172a;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
          appearance: none;
          cursor: pointer;
        }
        .ue-select:focus {
          border-color: #3b82f6;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
        }

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

        /* Grid row */
        .ue-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        /* Submit */
        .ue-submit-btn {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 0.92rem;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
          margin-top: 6px;
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

        /* Animations */
        @keyframes ue-fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ue-animate { animation: ue-fadeIn 0.45s ease forwards; }

        /* Textarea */
        .ue-textarea {
          width: 100%;
          padding: 12px 16px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.88rem;
          font-family: 'DM Sans', sans-serif;
          color: #0f172a;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
          resize: none;
        }
        .ue-textarea:focus {
          border-color: #3b82f6;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
        }
        .ue-textarea::placeholder { color: #94a3b8; }

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

        /* Responsive */
        @media (max-width: 480px) {
          .ue-auth-page { padding: 12px 10px; align-items: flex-start; padding-top: 20px; }
          .ue-auth-card {
            padding: 24px 18px;
            border-radius: 20px;
          }
          .ue-auth-title { font-size: 1.4rem; }
          .ue-roles { gap: 8px; }
          .ue-role-tab { padding: 10px 6px 9px; border-radius: 12px; }
          .ue-role-tab .ue-role-icon { width: 20px; height: 20px; }
          .ue-role-tab .ue-role-label { font-size: 0.78rem; }
          .ue-role-tab .ue-role-desc { font-size: 0.62rem; }
          .ue-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ue-auth-card">
        {/* Logo + Back */}
        {!showOtp && (
          <Link to="/" className="ue-back-link ue-animate" aria-label="Back to homepage">
            <div className="ue-back-arrow">
              <ArrowLeft style={{ width: 16, height: 16, color: "#64748b" }} />
            </div>
            <div className="ue-logo-icon">
              <span>U</span>
            </div>
            <span className="ue-logo-text">UrbanEase</span>
          </Link>
        )}

        {showOtp && (
          <button onClick={() => setShowOtp(false)} className="ue-back-link ue-animate" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <div className="ue-back-arrow">
              <ArrowLeft style={{ width: 16, height: 16, color: "#64748b" }} />
            </div>
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>Back to signup</span>
          </button>
        )}

        {/* Heading */}
        <div className="ue-animate">
          <h1 className="ue-auth-title">{showOtp ? "Verify Email" : "Create your account"}</h1>
          <p className="ue-auth-subtitle">
            {showOtp 
              ? `We've sent a 6-digit code to ${form.email}` 
              : <>Already have one? <Link to="/login">Sign in</Link></>
            }
          </p>
        </div>

        {/* Error & Success Messages */}
        {error && <div className="ue-error">{error}</div>}
        {success && <div className="ue-success">{success}</div>}

        {!showOtp && (
          <>
            {/* Role Selector */}
            <div className="ue-roles ue-animate">
              {roles.map(({ id, label, icon: Icon, desc }) => (
                <div
                  key={id}
                  className={`ue-role-tab ${role === id ? "active" : ""}`}
                  onClick={() => { setRole(id); setError(""); setSuccess(""); }}
                >
                  <Icon
                    className="ue-role-icon"
                    style={{ color: role === id ? "#2563eb" : "#94a3b8" }}
                  />
                  <div className="ue-role-label" style={{ color: role === id ? "#1d4ed8" : "#374151" }}>
                    {label}
                  </div>
                  <div className="ue-role-desc">{desc}</div>
                </div>
              ))}
            </div>

            {/* Provider notice */}
            {role === "serviceProvider" && (
              <div className="ue-notice ue-notice-warn">
                <span>⚠️</span>
                <span>After signup, your account will be reviewed by an admin before you can accept bookings.</span>
              </div>
            )}

            {/* Admin notice */}
            {role === "admin" && (
              <div className="ue-notice ue-notice-info">
                <span>🔐</span>
                <span>Admin registration requires a secret key from your system administrator.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="ue-animate" key={role}>
              {/* Full Name */}
              <div className="ue-field">
                <label className="ue-label" htmlFor="signup-name">Full Name</label>
                <div className="ue-input-wrap">
                  <User className="ue-input-icon" />
                  <input
                    id="signup-name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="ue-input"
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="ue-field">
                <label className="ue-label" htmlFor="signup-email">Email Address</label>
                <div className="ue-input-wrap">
                  <Mail className="ue-input-icon" />
                  <input
                    id="signup-email"
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
              <div className="ue-field">
                <label className="ue-label" htmlFor="signup-password">Password</label>
                <div className="ue-input-wrap">
                  <Lock className="ue-input-icon" />
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    required
                    className="ue-input"
                    style={{ paddingRight: 48 }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="ue-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword
                      ? <EyeOff style={{ width: 17, height: 17 }} />
                      : <Eye style={{ width: 17, height: 17 }} />}
                  </button>
                </div>
              </div>

              {/* Phone — User & Provider */}
              {(role === "user" || role === "serviceProvider") && (
                <div className="ue-field">
                  <label className="ue-label" htmlFor="signup-phone">
                    Phone Number {role === "user" && <span className="ue-label-optional">(optional)</span>}
                  </label>
                  <div className="ue-input-wrap">
                    <Phone className="ue-input-icon" />
                    <input
                      id="signup-phone"
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      required={role === "serviceProvider"}
                      className="ue-input"
                      autoComplete="tel"
                    />
                  </div>
                </div>
              )}

              {/* Provider extra fields */}
              {role === "serviceProvider" && (
                <>
                  <div className="ue-field">
                    <label className="ue-label" htmlFor="signup-category">Service Category</label>
                    <div className="ue-input-wrap">
                      <select
                        id="signup-category"
                        name="serviceCategory"
                        value={form.serviceCategory}
                        onChange={handleChange}
                        required
                        className="ue-select"
                      >
                        <option value="">Select a category</option>
                        {SERVICE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown
                        style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", width: 17, height: 17, color: "#94a3b8", pointerEvents: "none" }}
                      />
                    </div>
                  </div>

                  <div className="ue-row ue-field">
                    <div>
                      <label className="ue-label" htmlFor="signup-city">City</label>
                      <div className="ue-input-wrap">
                        <MapPin className="ue-input-icon" />
                        <input
                          id="signup-city"
                          type="text"
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          placeholder="Coimbatore"
                          required
                          className="ue-input"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="ue-label" htmlFor="signup-exp">Experience (yrs)</label>
                      <input
                        id="signup-exp"
                        type="number"
                        name="experience"
                        value={form.experience}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        className="ue-input ue-input-no-icon"
                      />
                    </div>
                  </div>

                  <div className="ue-field">
                    <label className="ue-label" htmlFor="signup-address">Address</label>
                    <div className="ue-input-wrap">
                      <MapPin className="ue-input-icon" />
                      <input
                        id="signup-address"
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="123 Main Street"
                        required
                        className="ue-input"
                      />
                    </div>
                  </div>

                  <div className="ue-field">
                    <label className="ue-label" htmlFor="signup-desc">
                      Service Description <span className="ue-label-optional">(optional)</span>
                    </label>
                    <textarea
                      id="signup-desc"
                      name="serviceDescription"
                      value={form.serviceDescription}
                      onChange={handleChange}
                      placeholder="Tell clients about your expertise..."
                      rows={3}
                      className="ue-textarea"
                    />
                  </div>
                </>
              )}

              {/* Admin key */}
              {role === "admin" && (
                <div className="ue-field">
                  <label className="ue-label" htmlFor="signup-adminkey">Admin Secret Key</label>
                  <div className="ue-input-wrap">
                    <Shield className="ue-input-icon" />
                    <input
                      id="signup-adminkey"
                      type="password"
                      name="adminKey"
                      value={form.adminKey}
                      onChange={handleChange}
                      placeholder="Enter admin key"
                      required
                      className="ue-input"
                    />
                  </div>
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading} className="ue-submit-btn">
                {loading ? (
                  <>
                    <svg className="ue-spinner" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Processing…
                  </>
                ) : (
                  <>Get Verification OTP <ArrowRight style={{ width: 16, height: 16 }} /></>
                )}
              </button>
            </form>
          </>
        )}

        {showOtp && (
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
                <>Verify & Create Account <ArrowRight style={{ width: 16, height: 16 }} /></>
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