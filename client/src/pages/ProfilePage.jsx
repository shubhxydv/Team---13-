import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  User, Mail, Phone, MapPin, Calendar, Clock,
  LogOut, Edit2, Check, X, Package, ArrowLeft,
  ChevronRight, Sparkles, ChevronDown, Trash2, Star, MessageSquare
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const STATUS_STYLE = {
  pending:   { bg: "#fef9c3", color: "#92400e",  dot: "#f59e0b", label: "Pending"   },
  confirmed: { bg: "#dcfce7", color: "#15803d",  dot: "#22c55e", label: "Confirmed" },
  completed: { bg: "#dbeafe", color: "#1d4ed8",  dot: "#3b82f6", label: "Completed" },
  cancelled: { bg: "#fee2e2", color: "#dc2626",  dot: "#ef4444", label: "Cancelled" },
};

const FILTERS = ["all", "upcoming", "completed", "cancelled"];

export function ProfilePage() {
  const { user, token, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings]   = useState([]);
  const [filter, setFilter]       = useState("all");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [loadingB, setLoadingB]   = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [reviewForms, setReviewForms] = useState({});
  const [savingReview, setSavingReview] = useState("");
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "", phone: "", address: "",
  });

  const parseApiResponse = async (res) => {
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      const text = await res.text();
      throw new Error(`Invalid API response (${res.status}): ${text.slice(0, 80)}`);
    }
    return res.json();
  };

  useEffect(() => {
    if (user) setFormData({ name: user.name || "", phone: user.phone || "", address: user.address || "" });

    const fetchBookings = async () => {
      try {
        const res  = await fetch(`${API}/bookings/my-bookings`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await parseApiResponse(res);
        if (res.ok && data.success) setBookings(data.bookings || []);
        else setBookings([]);
      } catch { setBookings([]); }
      finally  { setLoadingB(false); }
    };
    fetchBookings();
  }, [user, token]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const filtered = bookings.filter(b => {
    if (filter === "all")       return true;
    if (filter === "upcoming")  return b.status === "confirmed";
    if (filter === "completed") return b.status === "completed";
    if (filter === "cancelled") return b.status === "cancelled";
    return true;
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      const res  = await fetch(`${API}/auth/update-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await parseApiResponse(res);
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update profile");
      if (data.user) {
        updateUser(data.user);
        setFormData({ name: data.user.name || "", phone: data.user.phone || "", address: data.user.address || "" });
      }
      setIsEditing(false);
    } catch (error) {
      alert(error.message || "Unable to save changes");
    } finally { setSaving(false); }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking history? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API}/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await parseApiResponse(res);
      if (res.ok && data.success) {
        setBookings(prev => prev.filter(b => b._id !== bookingId));
      } else {
        alert(data.message || "Failed to delete booking");
      }
    } catch (e) {
      alert("Error deleting booking record");
      console.error(e);
    }
  };

  const renderStars = (value, onSelect) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onSelect?.(star)}
            style={{
              border: "none",
              background: "none",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: onSelect ? "pointer" : "default",
            }}
          >
            <Star
              style={{
                width: 20,
                height: 20,
                color: "#facc15",
                fill: active ? "#facc15" : "transparent",
                strokeWidth: 2,
              }}
            />
          </button>
        );
      })}
    </div>
  );

  const updateReviewForm = (bookingId, next) => {
    setReviewForms((prev) => ({
      ...prev,
      [bookingId]: {
        rating: prev[bookingId]?.rating || 0,
        feedback: prev[bookingId]?.feedback || "",
        ...next,
      },
    }));
  };

  const handleSubmitReview = async (bookingId) => {
    const form = reviewForms[bookingId] || { rating: 0, feedback: "" };
    if (!form.rating) {
      alert("Please select a star rating.");
      return;
    }

    try {
      setSavingReview(bookingId);
      const res = await fetch(`${API}/bookings/${bookingId}/review`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: form.rating,
          feedback: form.feedback,
        }),
      });
      const data = await parseApiResponse(res);
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to save review");

      setBookings((prev) => prev.map((booking) => (
        booking._id === bookingId ? data.booking : booking
      )));
      setReviewForms((prev) => {
        const next = { ...prev };
        delete next[bookingId];
        return next;
      });
    } catch (error) {
      alert(error.message || "Unable to save review");
    } finally {
      setSavingReview("");
    }
  };

  const stats = [
    { label: "Total",     value: bookings.length,                                         filter: "all"       },
    { label: "Upcoming",  value: bookings.filter(b => b.status === "confirmed").length,   filter: "upcoming"  },
    { label: "Completed", value: bookings.filter(b => b.status === "completed").length,   filter: "completed" },
    { label: "Cancelled", value: bookings.filter(b => b.status === "cancelled").length,   filter: "cancelled" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        .profile-input {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 10px;
          padding: 8px 12px;
          color: white;
          font-size: 0.875rem;
          outline: none;
          width: 100%;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s;
        }
        .profile-input:focus { border-color: rgba(255,255,255,0.7); }
        .profile-input::placeholder { color: rgba(255,255,255,0.5); }

        .stat-card {
          border-radius: 14px;
          padding: 16px 14px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }
        .stat-card:hover { transform: translateY(-2px); }
        .stat-card.active {
          border-color: #2563eb;
          box-shadow: 0 4px 16px rgba(37,99,235,0.15);
        }

        .booking-row {
          background: white;
          border-radius: 14px;
          padding: 18px 20px;
          border: 1.5px solid #f1f5f9;
          transition: all 0.2s;
          margin-bottom: 10px;
        }
        .booking-row:hover {
          border-color: #bfdbfe;
          box-shadow: 0 4px 12px rgba(37,99,235,0.06);
        }

        .filter-pill {
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: 1.5px solid transparent;
          font-family: 'DM Sans', sans-serif;
          text-transform: capitalize;
        }
        .filter-pill.active  { background: #2563eb; color: white; border-color: #2563eb; }
        .filter-pill.inactive{ background: white; color: #64748b; border-color: #e2e8f0; }
        .filter-pill.inactive:hover { border-color: #2563eb; color: #2563eb; }

        .nav-top {
          background: rgba(7,20,50,0.7);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding: 0 24px;
          height: 60px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 100;
        }

        @media (max-width: 768px) {
          .main-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav className="nav-top">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate("/services")}
            style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.85)", fontSize: "0.875rem" }}>
            <ArrowLeft style={{ width: 17, height: 17 }} /> Back
          </button>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.25)" }} />
          <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, color: "white", fontSize: "1.05rem" }}>My Profile</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => navigate("/services")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", cursor: "pointer", fontSize: "0.82rem", color: "rgba(255,255,255,0.9)", fontFamily: "'DM Sans', sans-serif" }}>
            <Sparkles style={{ width: 14, height: 14, color: "#93c5fd" }} /> Browse Services
          </button>

          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => setDropdownOpen(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 24, padding: "5px 12px 5px 6px",
                cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                transition: "all 0.2s",
              }}
              onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
              onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
            >
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#60a5fa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "white", flexShrink: 0 }}>
                {(user?.name?.[0] || "U").toUpperCase()}
              </div>
              <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>{user?.name?.split(" ")[0] || "Account"}</span>
              <ChevronDown style={{ width: 13, height: 13, color: "rgba(255,255,255,0.5)", transform: dropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>

            {dropdownOpen && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)",
                background: "white", borderRadius: 14, minWidth: 180,
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)", border: "1px solid #f1f5f9",
                overflow: "hidden", zIndex: 200,
              }}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid #f8fafc", background: "#fafbff" }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>{user?.name}</div>
                  <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 2 }}>{user?.email}</div>
                </div>

                <button
                  onClick={() => { setDropdownOpen(false); logout(); }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: "0.85rem", color: "#ef4444", textAlign: "left", borderTop: "1px solid #f8fafc", transition: "background 0.15s" }}
                  onMouseOver={e => e.currentTarget.style.background = "#fef2f2"}
                  onMouseOut={e => e.currentTarget.style.background = "none"}
                >
                  <LogOut style={{ width: 16, height: 16 }} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 20px" }}>
        <div className="main-grid" style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, alignItems: "start" }}>

          {/* ── LEFT: Profile Card ── */}
          <div style={{ position: "sticky", top: 80 }}>

            {/* Hero profile card */}
            <div style={{ background: "linear-gradient(145deg, #1e3a5f 0%, #2563eb 100%)", borderRadius: 20, padding: "28px 24px", marginBottom: 14, color: "white", position: "relative", overflow: "hidden" }}>
              {/* bg decoration */}
              <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
              <div style={{ position: "absolute", bottom: -30, left: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

              {/* Avatar */}
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ width: 68, height: 68, borderRadius: 18, background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", fontWeight: 700, fontFamily: "'Fraunces', serif", marginBottom: 14 }}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>

                {isEditing ? (
                  <input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="profile-input"
                    style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: 4 }}
                    placeholder="Your name"
                  />
                ) : (
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: "1.15rem", fontWeight: 700, marginBottom: 2 }}>{user?.name}</div>
                )}
                <div style={{ fontSize: "0.78rem", opacity: 0.7, marginBottom: 16 }}>{user?.email}</div>

                {/* Info fields */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {/* Phone */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 14px" }}>
                    <Phone style={{ width: 14, height: 14, opacity: 0.7, flexShrink: 0 }} />
                    {isEditing ? (
                      <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="profile-input" style={{ padding: 0, background: "transparent", border: "none" }} placeholder="Phone number" />
                    ) : (
                      <div>
                        <div style={{ fontSize: "0.65rem", opacity: 0.6, marginBottom: 1 }}>Phone</div>
                        <div style={{ fontSize: "0.85rem" }}>{user?.phone || "Not added"}</div>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 14px" }}>
                    <MapPin style={{ width: 14, height: 14, opacity: 0.7, flexShrink: 0, marginTop: 2 }} />
                    {isEditing ? (
                      <input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                        className="profile-input" style={{ padding: 0, background: "transparent", border: "none" }} placeholder="Your address" />
                    ) : (
                      <div>
                        <div style={{ fontSize: "0.65rem", opacity: 0.6, marginBottom: 1 }}>Address</div>
                        <div style={{ fontSize: "0.85rem", lineHeight: 1.4 }}>{user?.address || "Not added"}</div>
                      </div>
                    )}
                  </div>

                  {/* Email (always read-only) */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.07)", borderRadius: 12, padding: "10px 14px" }}>
                    <Mail style={{ width: 14, height: 14, opacity: 0.5, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "0.65rem", opacity: 0.5, marginBottom: 1 }}>Email</div>
                      <div style={{ fontSize: "0.82rem", opacity: 0.8 }}>{user?.email}</div>
                    </div>
                  </div>
                </div>

                {/* Edit / Save buttons */}
                <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 12, background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.25)", color: "white", cursor: "pointer", fontSize: "0.85rem", fontWeight: 500, fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" }}>
                      <Edit2 style={{ width: 14, height: 14 }} /> Edit Profile
                    </button>
                  ) : (
                    <>
                      <button onClick={handleSave} disabled={saving}
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 12, background: "#22c55e", border: "none", color: "white", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                        <Check style={{ width: 14, height: 14 }} /> {saving ? "Saving..." : "Save"}
                      </button>
                      <button onClick={() => { setIsEditing(false); setFormData({ name: user?.name || "", phone: user?.phone || "", address: user?.address || "" }); }}
                        style={{ width: 42, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.25)", color: "white", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                        <X style={{ width: 15, height: 15 }} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick nav */}
            <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #f1f5f9", overflow: "hidden" }}>
              {[
                { label: "Browse Services", path: "/services", icon: Sparkles },
                { label: "My Bookings", path: null, icon: Package },
              ].map(({ label, path, icon: Icon }, i) => (
                <div key={label}
                  onClick={() => path && navigate(path)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", cursor: path ? "pointer" : "default", borderBottom: i === 0 ? "1px solid #f1f5f9" : "none", transition: "background 0.15s" }}
                  onMouseEnter={e => path && (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "white")}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon style={{ width: 16, height: 16, color: "#2563eb" }} />
                    <span style={{ fontSize: "0.875rem", color: "#374151", fontWeight: 500 }}>{label}</span>
                  </div>
                  {path && <ChevronRight style={{ width: 15, height: 15, color: "#94a3b8" }} />}
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Bookings ── */}
          <div>

            {/* Stats */}
            <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
              {stats.map(s => (
                <div key={s.filter} className={`stat-card ${filter === s.filter ? "active" : ""}`}
                  style={{ background: filter === s.filter ? "#eff6ff" : "white" }}
                  onClick={() => setFilter(s.filter)}>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: "1.8rem", fontWeight: 700, color: filter === s.filter ? "#2563eb" : "#0f172a", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: "0.72rem", color: filter === s.filter ? "#2563eb" : "#94a3b8", marginTop: 4, fontWeight: 500, textTransform: "capitalize" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Filter pills + heading */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.15rem", fontWeight: 700, color: "#0f172a" }}>
                {filter === "all" ? "All Bookings" : filter === "upcoming" ? "Upcoming" : filter === "completed" ? "Completed" : "Cancelled"}
              </h2>
              <div style={{ display: "flex", gap: 6 }}>
                {FILTERS.map(f => (
                  <button key={f} className={`filter-pill ${filter === f ? "active" : "inactive"}`}
                    onClick={() => setFilter(f)}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Booking cards */}
            {loadingB ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
                <div style={{ fontSize: "2rem", marginBottom: 10 }}>⏳</div>
                Loading your bookings...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 16, border: "1.5px solid #f1f5f9" }}>
                <Package style={{ width: 44, height: 44, color: "#cbd5e1", margin: "0 auto 14px" }} />
                <p style={{ fontWeight: 600, color: "#374151", marginBottom: 6 }}>No bookings found</p>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: 20 }}>
                  {filter === "all" ? "You haven't booked any service yet." : `No ${filter} bookings.`}
                </p>
                <button onClick={() => navigate("/services")}
                  style={{ background: "#2563eb", color: "white", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  Book a Service
                </button>
              </div>
            ) : (
              filtered.map(b => {
                const st = STATUS_STYLE[b.status] || STATUS_STYLE.pending;
                return (
                  <div key={b._id} className="booking-row">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "#0f172a", marginBottom: 3 }}>{b.serviceCategory}</div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          {b.provider?.name || "Provider"} · {b.provider?.city || ""}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: st.dot }} />
                          <span style={{ background: st.bg, color: st.color, fontSize: "0.7rem", fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
                            {st.label}
                          </span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteBooking(b._id); }}
                          style={{ border: "1px solid #fecaca", background: "#fee2e2", color: "#dc2626", borderRadius: 6, padding: "4px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}
                          title="Delete Booking Record"
                        >
                          <Trash2 style={{ width: 13, height: 13 }} />
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.8rem", color: "#64748b" }}>
                        <Calendar style={{ width: 13, height: 13 }} />{b.date}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.8rem", color: "#64748b" }}>
                        <Clock style={{ width: 13, height: 13 }} />{b.timeSlot}
                      </span>
                      {b.address && (
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.8rem", color: "#64748b" }}>
                          <MapPin style={{ width: 13, height: 13 }} />
                          {b.address.slice(0, 30)}{b.address.length > 30 ? "..." : ""}
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid #f8fafc" }}>
                      <div>
                        <span style={{ fontFamily: "'Fraunces', serif", fontSize: "1.05rem", fontWeight: 700, color: "#0f172a" }}>₹{b.amount}</span>
                      </div>
                      <span style={{ fontSize: "0.72rem", fontWeight: 600, color: b.paymentStatus === "paid" ? "#15803d" : "#92400e", background: b.paymentStatus === "paid" ? "#dcfce7" : "#fef9c3", padding: "3px 10px", borderRadius: 20 }}>
                        {b.paymentStatus === "paid" ? "✓ Paid" : "⏳ Payment Pending"}
                      </span>
                    </div>

                    {b.status === "completed" && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f1f5f9" }}>
                        {b.reviewRating ? (
                          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 14, padding: "14px 16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                              <div style={{ fontWeight: 600, color: "#92400e", display: "flex", alignItems: "center", gap: 8 }}>
                                <MessageSquare style={{ width: 16, height: 16 }} />
                                Your Review
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {renderStars(b.reviewRating)}
                                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#92400e" }}>{b.reviewRating}/5</span>
                              </div>
                            </div>
                            <div style={{ fontSize: "0.82rem", color: "#78350f", lineHeight: 1.6 }}>
                              {b.reviewFeedback || "You rated this service without additional feedback."}
                            </div>
                          </div>
                        ) : (
                          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                              <div>
                                <div style={{ fontWeight: 600, color: "#0f172a", marginBottom: 3 }}>Rate this service</div>
                                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Your feedback helps highlight the best providers.</div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {renderStars(reviewForms[b._id]?.rating || 0, (rating) => updateReviewForm(b._id, { rating }))}
                                <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                                  {(reviewForms[b._id]?.rating || 0) > 0 ? `${reviewForms[b._id]?.rating}/5` : "Select"}
                                </span>
                              </div>
                            </div>
                            <textarea
                              value={reviewForms[b._id]?.feedback || ""}
                              onChange={(e) => updateReviewForm(b._id, { feedback: e.target.value })}
                              placeholder="Share your experience with this provider..."
                              rows={3}
                              style={{
                                width: "100%",
                                borderRadius: 12,
                                border: "1.5px solid #e2e8f0",
                                background: "white",
                                padding: "12px 14px",
                                fontSize: "0.84rem",
                                color: "#0f172a",
                                resize: "vertical",
                                outline: "none",
                                fontFamily: "'DM Sans', sans-serif",
                                boxSizing: "border-box",
                              }}
                            />
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                              <button
                                onClick={() => handleSubmitReview(b._id)}
                                disabled={savingReview === b._id}
                                style={{
                                  border: "none",
                                  borderRadius: 10,
                                  background: "#2563eb",
                                  color: "white",
                                  padding: "10px 18px",
                                  cursor: "pointer",
                                  fontSize: "0.84rem",
                                  fontWeight: 600,
                                  fontFamily: "'DM Sans', sans-serif",
                                }}
                              >
                                {savingReview === b._id ? "Submitting..." : "Submit Review"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
