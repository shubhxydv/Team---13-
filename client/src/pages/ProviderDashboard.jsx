import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogOut, Clock, CheckCircle, XCircle, Calendar,
  MapPin, Phone, User, TrendingUp, Star,
  AlertCircle, RefreshCw, ChevronDown, ChevronUp, ArrowLeft
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const STATUS_STYLE = {
  pending:   { bg: "#fef9c3", color: "#92400e", dot: "#f59e0b", label: "Pending"   },
  confirmed: { bg: "#dcfce7", color: "#15803d", dot: "#22c55e", label: "Confirmed" },
  completed: { bg: "#dbeafe", color: "#1d4ed8", dot: "#3b82f6", label: "Completed" },
  cancelled: { bg: "#fee2e2", color: "#dc2626", dot: "#ef4444", label: "Cancelled" },
};

/* ─── Shared design tokens ─────────────────────────────────────────────────── */
const T = {
  font:      "'DM Sans', sans-serif",
  serif:     "'Fraunces', serif",
  radius:    { sm: 8, md: 12, lg: 16, pill: 20 },
  color: {
    bg:        "#f1f5f9",
    surface:   "white",
    border:    "#f1f5f9",
    borderHov: "#bfdbfe",
    text:      "#0f172a",
    muted:     "#64748b",
    faint:     "#94a3b8",
    blue:      "#2563eb",
    blueBg:    "#eff6ff",
    blueBorder:"#bfdbfe",
  },
};

/* ─── Shared CSS injected once ──────────────────────────────────────────────── */
const SHARED_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  @keyframes ue-spin { to { transform: rotate(360deg); } }

  /* ── Layout cards ── */
  .ue-card {
    background: white;
    border-radius: 16px;
    border: 1.5px solid #f1f5f9;
    overflow: hidden;
    margin-bottom: 12px;
    transition: border-color 0.2s;
  }
  .ue-card:hover { border-color: #bfdbfe; }

  .ue-stat-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    border: 1.5px solid #f1f5f9;
    transition: all 0.2s;
  }
  .ue-stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); transform: translateY(-2px); }

  /* ── Filter / tab pills ── */
  .ue-pill {
    padding: 7px 16px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: 1.5px solid transparent;
    font-family: 'DM Sans', sans-serif;
    text-transform: capitalize;
  }
  .ue-pill-active   { background: #2563eb; color: white; border-color: #2563eb; }
  .ue-pill-inactive { background: white; color: #64748b; border-color: #e2e8f0; }
  .ue-pill-inactive:hover { border-color: #93c5fd; color: #2563eb; }

  /* ── Action buttons ── */
  .ue-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px;
    border-radius: 10px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
  }
  .ue-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .ue-btn-success { background: #dcfce7; color: #15803d; }
  .ue-btn-success:not(:disabled):hover { background: #bbf7d0; }
  .ue-btn-danger  { background: #fee2e2; color: #dc2626; }
  .ue-btn-danger:not(:disabled):hover  { background: #fecaca; }
  .ue-btn-info    { background: #dbeafe; color: #1d4ed8; }
  .ue-btn-info:not(:disabled):hover    { background: #bfdbfe; }
  .ue-btn-neutral {
    background: white; color: #64748b;
    border: 1.5px solid #e2e8f0;
  }
  .ue-btn-neutral:not(:disabled):hover { border-color: #93c5fd; color: #2563eb; }

  /* ── Info tile (inside expanded row) ── */
  .ue-tile {
    background: white;
    border-radius: 10px;
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
  }
  .ue-tile-label {
    font-size: 0.62rem;
    color: #94a3b8;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 3px;
  }
  .ue-tile-value {
    font-size: 0.82rem;
    color: #0f172a;
    font-weight: 500;
  }
`;

/* ─── Shared Navbar ─────────────────────────────────────────────────────────── */
function DashboardNav({ user, onLogout, onProfile, onHome }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const firstName = user?.name?.split(" ")[0] || "Account";

  return (
    <nav style={{
      background: "rgba(7,20,50,0.7)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      padding: "0 24px",
      height: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div
        onClick={onHome}
        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
      >
        <ArrowLeft style={{ width: 15, height: 15, color: "rgba(255,255,255,0.85)" }} />
        <div style={{ width: 32, height: 32, borderRadius: 9, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: T.serif, color: "white", fontWeight: 700, fontSize: "1rem" }}>U</span>
        </div>
        <span style={{ fontFamily: T.serif, fontWeight: 700, fontSize: "1.1rem", color: "white" }}>UrbanEase</span>
      </div>

      <div ref={dropdownRef} style={{ marginLeft: "auto", position: "relative" }}>
        <button
          onClick={() => setDropdownOpen(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 24, padding: "5px 12px 5px 6px",
            cursor: "pointer", fontFamily: T.font,
            transition: "all 0.2s",
          }}
          onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
          onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
        >
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#60a5fa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "white", flexShrink: 0 }}>
            {firstName[0]?.toUpperCase()}
          </div>
          <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>{firstName}</span>
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
              onClick={() => { setDropdownOpen(false); onProfile(); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", background: "none", border: "none", cursor: "pointer", fontFamily: T.font, fontSize: "0.85rem", color: "#374151", textAlign: "left", transition: "background 0.15s" }}
              onMouseOver={e => e.currentTarget.style.background = "#f8fafc"}
              onMouseOut={e => e.currentTarget.style.background = "none"}
            >
              <User style={{ width: 16, height: 16, color: "#2563eb" }} />
              My Profile
            </button>

            <button
              onClick={() => { setDropdownOpen(false); onLogout(); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", background: "none", border: "none", cursor: "pointer", fontFamily: T.font, fontSize: "0.85rem", color: "#ef4444", textAlign: "left", borderTop: "1px solid #f8fafc", transition: "background 0.15s" }}
              onMouseOver={e => e.currentTarget.style.background = "#fef2f2"}
              onMouseOut={e => e.currentTarget.style.background = "none"}
            >
              <LogOut style={{ width: 16, height: 16 }} />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

/* ─── Shared Stat Card ──────────────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="ue-stat-card">
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: bg, display: "flex", alignItems: "center",
        justifyContent: "center", marginBottom: 12,
      }}>
        <Icon style={{ width: 18, height: 18, color }} />
      </div>
      <div style={{
        fontFamily: T.serif, fontSize: "1.6rem",
        fontWeight: 700, color: T.color.text, lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{ fontSize: "0.72rem", color: T.color.faint, marginTop: 5, fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}

/* ─── Shared Info Tile ──────────────────────────────────────────────────────── */
function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="ue-tile">
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <Icon style={{ width: 12, height: 12, color: T.color.blue }} />
        <span className="ue-tile-label">{label}</span>
      </div>
      <div className="ue-tile-value">{value || "—"}</div>
    </div>
  );
}

/* ─── Shared Status Badge ───────────────────────────────────────────────────── */
function StatusBadge({ statusStyle }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: statusStyle.dot }} />
      <span style={{
        background: statusStyle.bg, color: statusStyle.color,
        fontSize: "0.7rem", fontWeight: 600,
        padding: "3px 10px", borderRadius: 20,
      }}>
        {statusStyle.label}
      </span>
    </div>
  );
}

/* ─── Shared Empty State ────────────────────────────────────────────────────── */
function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div style={{
      textAlign: "center", padding: "60px 20px",
      background: "white", borderRadius: 16,
      border: "1.5px solid #f1f5f9",
    }}>
      <Icon style={{ width: 44, height: 44, color: "#cbd5e1", margin: "0 auto 14px" }} />
      <p style={{ fontWeight: 600, color: "#374151", marginBottom: 6 }}>{title}</p>
      <p style={{ fontSize: "0.85rem", color: T.color.faint }}>{subtitle}</p>
    </div>
  );
}

/* ─── Shared Loading State ──────────────────────────────────────────────────── */
function LoadingState() {
  return (
    <div style={{ textAlign: "center", padding: "60px 0", color: T.color.faint }}>
      <RefreshCw style={{ width: 28, height: 28, margin: "0 auto 12px", animation: "ue-spin 1s linear infinite" }} />
      <p>Loading...</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROVIDER DASHBOARD
   ═══════════════════════════════════════════════════════════════════════════ */
export function ProviderDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings,  setBookings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState("all");
  const [expanded,  setExpanded]  = useState(null);
  const [updating,  setUpdating]  = useState(null);

  const renderStars = (value) => (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          style={{
            width: 15,
            height: 15,
            color: "#facc15",
            fill: star <= Math.round(value || 0) ? "#facc15" : "transparent",
            strokeWidth: 2,
          }}
        />
      ))}
    </div>
  );

  useEffect(() => { fetchBookings(); }, [token]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/bookings/provider-bookings/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setBookings(data.bookings);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (bookingId, status) => {
    setUpdating(bookingId);
    try {
      const res  = await fetch(`${API}/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success)
        setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status } : b));
    } catch (e) { console.error(e); }
    finally { setUpdating(null); }
  };

  const filtered = bookings.filter(b =>
    filter === "all" ? true : b.status === filter
  );

  const earnings  = bookings.filter(b => b.status === "completed").reduce((s, b) => s + (b.amount || 0), 0);
  const pending   = bookings.filter(b => b.status === "pending").length;
  const confirmed = bookings.filter(b => b.status === "confirmed").length;
  const completed = bookings.filter(b => b.status === "completed").length;
  const reviewedBookings = bookings.filter((b) => Number.isFinite(b.reviewRating) && b.reviewRating > 0);
  const averageRating = reviewedBookings.length
    ? reviewedBookings.reduce((sum, booking) => sum + booking.reviewRating, 0) / reviewedBookings.length
    : 0;

  /* ── Not verified screen ────────────────────────────────────────────────── */
  if (!user?.isVerified) return (
    <div style={{ minHeight: "100vh", background: T.color.bg, fontFamily: T.font }}>
      <style>{SHARED_CSS}</style>
      <DashboardNav
        user={user}
        onLogout={logout}
        onProfile={() => navigate("/provider-profile")}
        onHome={() => navigate("/")}
      />
      <div style={{ maxWidth: 520, margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "#fef9c3", display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 20px",
        }}>
          <AlertCircle style={{ width: 40, height: 40, color: "#d97706" }} />
        </div>
        <h2 style={{ fontFamily: T.serif, fontSize: "1.5rem", fontWeight: 700, color: T.color.text, marginBottom: 10 }}>
          {user?.verificationStatus === "rejected" ? "Application Rejected" : "Awaiting Verification"}
        </h2>
        <p style={{ color: T.color.muted, fontSize: "0.9rem", lineHeight: 1.7, marginBottom: 24 }}>
          {user?.verificationStatus === "rejected"
            ? `Your application was not approved. Reason: ${user?.rejectionReason || "Not specified"}. Please contact support.`
            : "Your account is under review by our admin team. You'll be notified once verified. This usually takes 24–48 hours."}
        </p>
        <div style={{
          background: "white", borderRadius: 16, padding: "20px 24px",
          border: "1.5px solid #f1f5f9", textAlign: "left", marginBottom: 24,
        }}>
          <div style={{ fontWeight: 600, fontSize: "0.85rem", color: T.color.text, marginBottom: 14 }}>
            Your Application Details
          </div>
          {[
            { label: "Name",     value: user?.name },
            { label: "Category", value: user?.serviceCategory },
            { label: "City",     value: user?.city },
            { label: "Status",   value: user?.verificationStatus || "pending" },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: 8 }}>
              <span style={{ color: T.color.muted }}>{label}</span>
              <span style={{ fontWeight: 500, color: T.color.text, textTransform: "capitalize" }}>{value}</span>
            </div>
          ))}
        </div>
        <button onClick={logout} className="ue-btn ue-btn-neutral" style={{ width: "100%", justifyContent: "center", padding: 13 }}>
          Logout
        </button>
      </div>
    </div>
  );

  /* ── Main dashboard ─────────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: "100vh", background: T.color.bg, fontFamily: T.font }}>
      <style>{SHARED_CSS}</style>
      <DashboardNav
        user={user}
        onLogout={logout}
        onProfile={() => navigate("/provider-profile")}
        onHome={() => navigate("/")}
      />

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 20px" }}>

        {/* Welcome */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: T.serif, fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 700, color: T.color.text, marginBottom: 4 }}>
            Good day, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p style={{ color: T.color.muted, fontSize: "0.875rem" }}>
            Here's an overview of your service bookings and earnings.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 28 }}>
          <StatCard label="Total Bookings" value={bookings.length} icon={Calendar}    color="#2563eb" bg="#eff6ff" />
          <StatCard label="Pending"        value={pending}         icon={Clock}       color="#d97706" bg="#fef9c3" />
          <StatCard label="Confirmed"      value={confirmed}       icon={CheckCircle} color="#15803d" bg="#dcfce7" />
          <StatCard label="Completed"      value={completed}       icon={Star}        color="#7c3aed" bg="#ede9fe" />
          <StatCard label="Avg. Rating"    value={averageRating > 0 ? averageRating.toFixed(1) : "New"} icon={Star} color="#ca8a04" bg="#fef3c7" />
          <StatCard label="Total Earnings" value={`₹${earnings}`}  icon={TrendingUp}  color="#0891b2" bg="#e0f2fe" />
        </div>

        {/* Filter + Refresh */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["all", "pending", "confirmed", "completed"].map(f => (
              <button key={f}
                className={`ue-pill ${filter === f ? "ue-pill-active" : "ue-pill-inactive"}`}
                onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
          <button onClick={fetchBookings} className="ue-btn ue-btn-neutral">
            <RefreshCw style={{ width: 14, height: 14 }} /> Refresh
          </button>
        </div>

        <p style={{ color: T.color.faint, fontSize: "0.8rem", marginBottom: 14 }}>
          {loading ? "Loading..." : `${filtered.length} booking${filtered.length !== 1 ? "s" : ""} found`}
        </p>

        {/* Bookings */}
        {loading ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Calendar} title="No bookings yet" subtitle="Your bookings from customers will appear here." />
        ) : (
          filtered.map(b => {
            const st   = STATUS_STYLE[b.status] || STATUS_STYLE.pending;
            const open = expanded === b._id;
            return (
              <div key={b._id} className="ue-card">
                {/* Card header */}
                <div style={{ padding: "18px 20px", cursor: "pointer" }}
                  onClick={() => setExpanded(open ? null : b._id)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: T.color.blueBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <User style={{ width: 18, height: 18, color: T.color.blue }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.95rem", color: T.color.text }}>{b.user?.name || "Customer"}</div>
                          <div style={{ fontSize: "0.75rem", color: T.color.muted }}>{b.serviceCategory}{b.subcategory ? ` · ${b.subcategory}` : ""}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                        {[
                          { icon: Calendar, text: b.date },
                          { icon: Clock,    text: `${b.timeSlot} · ${b.hours || 1}hr` },
                          { icon: MapPin,   text: (b.address?.slice(0, 30) || "") + (b.address?.length > 30 ? "..." : "") },
                        ].map(({ icon: Icon, text }) => (
                          <span key={text} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.78rem", color: T.color.muted }}>
                            <Icon style={{ width: 12, height: 12 }} />{text}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                      <StatusBadge statusStyle={st} />
                      <div style={{ fontFamily: T.serif, fontSize: "1.1rem", fontWeight: 700, color: T.color.text }}>₹{b.amount}</div>
                      {open
                        ? <ChevronUp   style={{ width: 16, height: 16, color: T.color.faint }} />
                        : <ChevronDown style={{ width: 16, height: 16, color: T.color.faint }} />}
                    </div>
                  </div>
                </div>

                {/* Expanded detail */}
                {open && (
                  <div style={{ borderTop: "1.5px solid #f1f5f9", padding: "18px 20px", background: "#f8fafc" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, marginBottom: 16 }}>
                      <InfoTile icon={User}        label="Customer"     value={b.user?.name} />
                      <InfoTile icon={Phone}       label="Contact"      value={b.user?.phone || "Not provided"} />
                      <InfoTile icon={MapPin}      label="Full Address" value={b.address} />
                      <InfoTile icon={Clock}       label="Duration"     value={`${b.hours || 1} hour(s)`} />
                      <InfoTile icon={Calendar}    label="Booking Date" value={new Date(b.createdAt).toLocaleDateString("en-IN")} />
                      <InfoTile icon={CheckCircle} label="Payment"      value={`${b.paymentStatus} via ${b.paymentMethod || "—"}`} />
                    </div>

                    {b.instructions && (
                      <div style={{ background: "#fffbeb", borderRadius: 10, padding: "12px 14px", marginBottom: 14, border: "1px solid #fde68a" }}>
                        <div style={{ fontSize: "0.65rem", color: "#92400e", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Customer Instructions</div>
                        <div style={{ fontSize: "0.82rem", color: "#78350f", lineHeight: 1.5 }}>{b.instructions}</div>
                      </div>
                    )}

                    {b.status === "completed" && (
                      <div style={{ background: b.reviewRating ? "#fffbeb" : "white", borderRadius: 12, padding: "14px 16px", marginBottom: 14, border: `1px solid ${b.reviewRating ? "#fde68a" : "#e2e8f0"}` }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#0f172a" }}>
                            Customer Review
                          </div>
                          {b.reviewRating ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              {renderStars(b.reviewRating)}
                              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#92400e" }}>{b.reviewRating}/5</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>No review submitted yet</span>
                          )}
                        </div>
                        <div style={{ fontSize: "0.82rem", color: b.reviewRating ? "#78350f" : "#64748b", lineHeight: 1.6 }}>
                          {b.reviewFeedback || (b.reviewRating ? "Customer rated the service without additional feedback." : "Once the customer rates this completed job, their feedback will appear here with their name from this booking history.")}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {b.status === "pending" && (
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button className="ue-btn ue-btn-success" disabled={updating === b._id}
                          onClick={() => updateStatus(b._id, "confirmed")}>
                          <CheckCircle style={{ width: 14, height: 14 }} />
                          {updating === b._id ? "Updating..." : "Accept Booking"}
                        </button>
                        <button className="ue-btn ue-btn-danger" disabled={updating === b._id}
                          onClick={() => updateStatus(b._id, "cancelled")}>
                          <XCircle style={{ width: 14, height: 14 }} />
                          Decline
                        </button>
                      </div>
                    )}
                    {b.status === "confirmed" && (
                      <button className="ue-btn ue-btn-info" disabled={updating === b._id}
                        onClick={() => updateStatus(b._id, "completed")}>
                        <CheckCircle style={{ width: 14, height: 14 }} />
                        {updating === b._id ? "Updating..." : "Mark as Completed"}
                      </button>
                    )}
                    {(b.status === "completed" || b.status === "cancelled") && (
                      <div style={{ fontSize: "0.78rem", color: T.color.faint, fontStyle: "italic" }}>
                        This booking is {b.status}.
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
  );
}
