import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, MessageSquareText, Send, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function ContactPage() {
  const { user } = useAuth();
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
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .ue-contact-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(96, 165, 250, 0.14), transparent 28%),
            linear-gradient(180deg, #071432 0%, #0f172a 28%, #f8fafc 28%, #f8fafc 100%);
          font-family: 'DM Sans', sans-serif;
          color: #0f172a;
        }

        .ue-contact-shell {
          max-width: 1120px;
          margin: 0 auto;
          padding: 28px 16px 72px;
        }

        .ue-contact-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 48px;
        }

        .ue-contact-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .ue-brand-icon {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          font-family: 'Sora', sans-serif;
          font-weight: 700;
        }

        .ue-brand-text {
          font-family: 'Sora', sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: white;
        }

        .ue-back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 999px;
          text-decoration: none;
          color: #dbeafe;
          border: 1px solid rgba(255,255,255,0.16);
          background: rgba(255,255,255,0.06);
          transition: all 0.2s ease;
        }

        .ue-back-link:hover {
          background: rgba(255,255,255,0.12);
          color: white;
        }

        .ue-contact-hero {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 28px;
          align-items: start;
        }

        .ue-contact-copy {
          color: white;
          padding: 12px 6px 0 6px;
        }

        .ue-contact-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(37, 99, 235, 0.16);
          border: 1px solid rgba(147, 197, 253, 0.18);
          color: #bfdbfe;
          font-size: 0.88rem;
          font-weight: 600;
          margin-bottom: 18px;
        }

        .ue-contact-title {
          margin: 0 0 16px;
          font-family: 'Sora', sans-serif;
          font-size: clamp(2.2rem, 4vw, 3.9rem);
          line-height: 1.05;
          letter-spacing: -0.03em;
        }

        .ue-contact-title span {
          color: #93c5fd;
        }

        .ue-contact-desc {
          max-width: 560px;
          margin: 0 0 28px;
          color: #cbd5e1;
          font-size: 1rem;
          line-height: 1.8;
        }

        .ue-contact-points {
          display: grid;
          gap: 12px;
        }

        .ue-contact-point {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 18px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          max-width: 480px;
        }

        .ue-contact-point-icon {
          width: 40px;
          height: 40px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(37, 99, 235, 0.18);
          color: #93c5fd;
          flex-shrink: 0;
        }

        .ue-contact-point strong {
          display: block;
          margin-bottom: 3px;
          font-size: 0.95rem;
          color: #f8fafc;
        }

        .ue-contact-point span {
          color: #cbd5e1;
          font-size: 0.92rem;
          line-height: 1.55;
        }

        .ue-contact-card {
          background: white;
          border-radius: 28px;
          padding: 28px;
          box-shadow: 0 16px 48px rgba(15, 23, 42, 0.12);
          border: 1px solid rgba(226, 232, 240, 0.9);
        }

        .ue-contact-card h2 {
          margin: 0 0 8px;
          font-family: 'Sora', sans-serif;
          font-size: 1.6rem;
          color: #0f172a;
        }

        .ue-contact-card p {
          margin: 0 0 22px;
          color: #64748b;
          line-height: 1.6;
        }

        .ue-alert {
          padding: 13px 15px;
          border-radius: 14px;
          margin-bottom: 18px;
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

        .ue-form-grid {
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
          top: 16px;
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
          min-height: 156px;
          padding: 14px 16px;
          resize: vertical;
        }

        .ue-input:focus,
        .ue-textarea:focus {
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.09);
        }

        .ue-submit-btn {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 15px 22px;
          border: none;
          border-radius: 16px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.96rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 10px 26px rgba(37, 99, 235, 0.24);
        }

        .ue-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 14px 30px rgba(37, 99, 235, 0.3);
        }

        .ue-submit-btn:disabled {
          opacity: 0.72;
          cursor: not-allowed;
        }

        .ue-note {
          margin-top: 14px;
          font-size: 0.84rem;
          color: #64748b;
          line-height: 1.6;
          text-align: center;
        }

        @media (max-width: 900px) {
          .ue-contact-hero {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 560px) {
          .ue-contact-shell {
            padding: 18px 12px 48px;
          }

          .ue-contact-topbar {
            flex-direction: column;
            align-items: flex-start;
            margin-bottom: 30px;
          }

          .ue-contact-card {
            padding: 22px 18px;
            border-radius: 22px;
          }
        }
      `}</style>

      <div className="ue-contact-shell">
        <div className="ue-contact-topbar">
          <Link to="/" className="ue-contact-brand">
            <div className="ue-brand-icon">U</div>
            <span className="ue-brand-text">UrbanEase</span>
          </Link>

          <Link to="/" className="ue-back-link">
            <ArrowLeft style={{ width: 16, height: 16 }} />
            Back to home
          </Link>
        </div>

        <div className="ue-contact-hero">
          <div className="ue-contact-copy">
            <div className="ue-contact-kicker">Contact UrbanEase</div>
            <h1 className="ue-contact-title">
              Tell us what you need.
              <br />
              <span>We’ll get back to you soon.</span>
            </h1>
            <p className="ue-contact-desc">
              Share your question, issue, or request and we’ll store it in the UrbanEase system.
              As soon as you submit, a confirmation email will also be sent to your inbox.
            </p>

            <div className="ue-contact-points">
              <div className="ue-contact-point">
                <div className="ue-contact-point-icon">
                  <MessageSquareText style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <strong>Clear support flow</strong>
                  <span>Your message is saved in the database so it can be tracked and replied to properly.</span>
                </div>
              </div>

              <div className="ue-contact-point">
                <div className="ue-contact-point-icon">
                  <Mail style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <strong>Email confirmation</strong>
                  <span>Users receive an acknowledgement email right after the query is submitted successfully.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="ue-contact-card">
            <h2>Send your query</h2>
            <p>Fill in your details and our team will review your message.</p>

            {error ? <div className="ue-alert ue-alert-error">{error}</div> : null}
            {success ? <div className="ue-alert ue-alert-success">{success}</div> : null}

            <form onSubmit={handleSubmit} className="ue-form-grid">
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
                    placeholder="Enter your full name"
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
                    placeholder="you@example.com"
                    className="ue-input"
                    required
                  />
                </div>
              </div>

              <div className="ue-field">
                <label htmlFor="contact-query">Query</label>
                <textarea
                  id="contact-query"
                  name="query"
                  value={form.query}
                  onChange={handleChange}
                  placeholder="Write your query here..."
                  className="ue-textarea"
                  required
                />
              </div>

              <button type="submit" className="ue-submit-btn" disabled={loading}>
                <Send style={{ width: 17, height: 17 }} />
                {loading ? "Sending..." : "Submit Query"}
              </button>
            </form>

            <div className="ue-note">
              After submission, UrbanEase will save your message and send a confirmation mail to the email you entered.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
