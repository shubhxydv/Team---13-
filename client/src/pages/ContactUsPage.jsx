import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Mail, Send, User, UserCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function ContactUsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    query: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.name || "",
      email: prev.email || user.email || "",
    }));
  }, [user]);

  useEffect(() => {
    const handleOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          query: form.query.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to send your query");
      }

      setSuccess(
        data.emailSent
          ? "Your query has been sent. Please check your email for confirmation."
          : "Your query was saved, but the confirmation email could not be sent right now."
      );

      setForm((prev) => ({
        ...prev,
        query: "",
      }));
    } catch (submitError) {
      setError(submitError.message || "Unable to send your query");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ue-contact-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        body { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Sora', sans-serif; }

        .nav-glass {
          background: rgba(7,20,50,0.7);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .ue-contact-page {
          min-height: 100vh;
          background:
            linear-gradient(180deg, #071432 0px, #071432 300px, #f8fafc 300px, #f8fafc 100%);
        }

        .ue-page-wrap {
          max-width: 1120px;
          margin: 0 auto;
          padding: 108px 16px 56px;
        }

        .ue-hero {
          text-align: center;
          color: white;
          margin-bottom: 34px;
        }

        .ue-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(37, 99, 235, 0.18);
          border: 1px solid rgba(147, 197, 253, 0.22);
          color: #bfdbfe;
          font-size: 0.88rem;
          font-weight: 600;
          margin-bottom: 18px;
        }

        .ue-kicker-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #60a5fa;
        }

        .ue-title {
          margin: 0 0 12px;
          font-family: 'Sora', sans-serif;
          font-size: clamp(2.1rem, 4.4vw, 4rem);
          line-height: 1.05;
          letter-spacing: -0.03em;
        }

        .ue-title span {
          color: #93c5fd;
        }

        .ue-subtitle {
          max-width: 700px;
          margin: 0 auto;
          color: #dbeafe;
          font-size: 1rem;
          line-height: 1.75;
        }

        .ue-form-card {
          max-width: 720px;
          margin: 0 auto;
          background: white;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 16px 44px rgba(15, 23, 42, 0.1);
          padding: 30px;
        }

        .ue-form-title {
          margin: 0 0 8px;
          font-family: 'Sora', sans-serif;
          font-size: 1.5rem;
          color: #0f172a;
        }

        .ue-form-copy {
          margin: 0 0 22px;
          color: #64748b;
          line-height: 1.65;
        }

        .ue-alert {
          padding: 12px 14px;
          border-radius: 14px;
          margin-bottom: 16px;
          font-size: 0.92rem;
          line-height: 1.55;
        }

        .ue-alert-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
        }

        .ue-alert-success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
        }

        .ue-form {
          display: grid;
          gap: 18px;
        }

        .ue-field label {
          display: block;
          margin-bottom: 8px;
          font-size: 0.88rem;
          font-weight: 600;
          color: #334155;
        }

        .ue-input-wrap {
          position: relative;
        }

        .ue-input-icon {
          position: absolute;
          top: 15px;
          left: 14px;
          width: 18px;
          height: 18px;
          color: #94a3b8;
        }

        .ue-input,
        .ue-textarea {
          width: 100%;
          box-sizing: border-box;
          border-radius: 16px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          color: #0f172a;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.2s ease;
        }

        .ue-input {
          padding: 14px 16px 14px 44px;
        }

        .ue-textarea {
          min-height: 150px;
          padding: 14px 16px;
          resize: vertical;
        }

        .ue-input:focus,
        .ue-textarea:focus {
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
        }

        .ue-submit-btn {
          width: 100%;
          padding: 14px 22px;
          border: none;
          border-radius: 16px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.96rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 10px 24px rgba(37,99,235,0.22);
        }

        .ue-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 14px 30px rgba(37,99,235,0.28);
        }

        .ue-submit-btn:disabled {
          opacity: 0.72;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .ue-page-wrap {
            padding: 96px 12px 40px;
          }

          .ue-form-card {
            padding: 22px 18px;
            border-radius: 20px;
          }
        }
      `}</style>

      <nav className="nav-glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600">
              <span className="font-display text-white font-bold">U</span>
            </div>
            <span className="font-display text-white font-semibold text-lg">UrbanEase</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/#how-it-works" className="text-blue-200 hover:text-white text-sm no-underline">How It Works</Link>
            <Link to="/" className="text-blue-200 hover:text-white text-sm no-underline">Services</Link>
            <Link to="/contact" className="text-blue-200 hover:text-white text-sm no-underline">Contact</Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 cursor-pointer text-white"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                    {(user?.name?.[0] || "U").toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{user?.name?.split(" ")[0]}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[100]">
                    <div className="p-4 border-bottom border-gray-50 bg-gray-50">
                      <div className="text-sm font-bold text-gray-800">{user?.name}</div>
                      <div className="text-xs text-gray-400">{user?.email}</div>
                    </div>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate("/profile");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 bg-white border-none cursor-pointer"
                    >
                      <UserCircle className="w-4 h-4 text-blue-600" /> My Profile
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 bg-white border-none cursor-pointer border-t border-gray-50"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 rounded-lg text-white text-sm font-medium border border-white/30 hover:bg-white/10 no-underline">Sign In</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="ue-page-wrap">
        <section className="ue-hero">
          <div className="ue-kicker">
            <span className="ue-kicker-dot" />
            Contact Us
          </div>
          <h1 className="ue-title">
            Let's solve it <span>together.</span>
          </h1>
          <p className="ue-subtitle">
            Have a question, need help, or want to share something with us?
            Send us your message and our team will get back to you soon.
          </p>
        </section>

        <section className="ue-form-card">
          <h2 className="ue-form-title">Send a Message</h2>
          <p className="ue-form-copy">
            Fill out the form below and we'll receive your query directly.
          </p>

          {error ? <div className="ue-alert ue-alert-error">{error}</div> : null}
          {success ? <div className="ue-alert ue-alert-success">{success}</div> : null}

          <form onSubmit={handleSubmit} className="ue-form">
            <div className="ue-field">
              <label htmlFor="contact-name">Name</label>
              <div className="ue-input-wrap">
                <User className="ue-input-icon" />
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="ue-input"
                  required
                />
              </div>
            </div>

            <div className="ue-field">
              <label htmlFor="contact-email">Email</label>
              <div className="ue-input-wrap">
                <Mail className="ue-input-icon" />
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="ue-input"
                  required
                />
              </div>
            </div>

            <div className="ue-field">
              <label htmlFor="contact-query">Your Query</label>
              <textarea
                id="contact-query"
                name="query"
                value={form.query}
                onChange={handleChange}
                placeholder="Write your message here"
                className="ue-textarea"
                required
              />
            </div>

            <button type="submit" className="ue-submit-btn" disabled={loading}>
              <Send className="w-4 h-4" />
              {loading ? "Sending..." : "Submit"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
