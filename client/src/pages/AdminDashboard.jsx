import { useState, useEffect } from "react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogOut, CheckCircle, XCircle, Clock, Users,
  Shield, AlertCircle, ChevronDown, ChevronUp,
  RefreshCw, MapPin, Phone, Briefcase, Star,
  Search, Eye, ArrowLeft, User, Wrench,
  Mail, Calendar, Ban, RotateCcw, Activity,
  TrendingUp, Hash, ToggleLeft, ToggleRight,
  Lock, Unlock, MessageSquare, BadgeCheck, Trash2
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const VERIFY_STYLE = {
  pending: { bg: "#fef9c3", color: "#92400e", dot: "#f59e0b", label: "Pending" },
  approved: { bg: "#dcfce7", color: "#15803d", dot: "#22c55e", label: "Approved" },
  rejected: { bg: "#fee2e2", color: "#dc2626", dot: "#ef4444", label: "Rejected" },
};

const USER_STATUS_STYLE = {
  active: { bg: "#dcfce7", color: "#15803d", dot: "#22c55e", label: "Active" },
  inactive: { bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8", label: "Inactive" },
  banned: { bg: "#fee2e2", color: "#dc2626", dot: "#ef4444", label: "Banned" },
};

const T = {
  font: "'DM Sans', sans-serif",
  serif: "'Fraunces', serif",
  color: {
    bg: "#f1f5f9",
    surface: "white",
    border: "#f1f5f9",
    borderHov: "#bfdbfe",
    text: "#0f172a",
    muted: "#64748b",
    faint: "#94a3b8",
    blue: "#2563eb",
    blueBg: "#eff6ff",
    blueBorder: "#bfdbfe",
  },
};

const SHARED_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  @keyframes ue-spin { to { transform: rotate(360deg); } }
  @keyframes ue-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes ue-slide-in { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }

  .ue-card {
    background: white;
    border-radius: 16px;
    border: 1.5px solid #f1f5f9;
    overflow: hidden;
    margin-bottom: 12px;
    transition: border-color 0.2s, box-shadow 0.2s;
    animation: ue-fade-in 0.25s ease both;
  }
  .ue-card:hover { border-color: #bfdbfe; box-shadow: 0 2px 12px rgba(37,99,235,0.06); }

  .ue-stat-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    border: 1.5px solid #f1f5f9;
    transition: all 0.2s;
    animation: ue-fade-in 0.3s ease both;
  }
  .ue-stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); transform: translateY(-2px); }

  .ue-pill {
    display: inline-flex; align-items: center; gap: 6px;
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

  .ue-btn {
    display: inline-flex; align-items: center; gap: 6px;
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
  .ue-btn-warning { background: #fef9c3; color: #92400e; }
  .ue-btn-warning:not(:disabled):hover { background: #fde68a; }
  .ue-btn-neutral {
    background: white; color: #64748b;
    border: 1.5px solid #e2e8f0;
  }
  .ue-btn-neutral:not(:disabled):hover { border-color: #93c5fd; color: #2563eb; }

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

  .ue-search-wrap { position: relative; }
  .ue-search-wrap input {
    width: 100%; padding: 8px 14px 8px 38px;
    border: 1.5px solid #e2e8f0; border-radius: 10px;
    font-size: 0.875rem; outline: none; background: white;
    font-family: 'DM Sans', sans-serif; transition: border-color 0.2s;
    box-sizing: border-box; color: #0f172a;
  }
  .ue-search-wrap input:focus { border-color: #2563eb; }
  .ue-search-wrap input::placeholder { color: #94a3b8; }

  /* ── Mode toggle switcher ── */
  .mode-toggle {
    display: flex;
    background: #f1f5f9;
    border-radius: 14px;
    padding: 4px;
    gap: 2px;
    border: 1.5px solid #e2e8f0;
  }
  .mode-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 8px 18px;
    border-radius: 10px;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.22s cubic-bezier(.4,0,.2,1);
    color: #64748b;
    background: transparent;
  }
  .mode-btn.active-provider {
    background: white;
    color: #2563eb;
    box-shadow: 0 2px 10px rgba(37,99,235,0.12);
  }
  .mode-btn.active-user {
    background: white;
    color: #7c3aed;
    box-shadow: 0 2px 10px rgba(124,58,237,0.12);
  }
  .mode-btn:not(.active-provider):not(.active-user):hover {
    background: rgba(255,255,255,0.7);
    color: #334155;
  }

  /* ── User avatar colour variants ── */
  .avatar-user { background: linear-gradient(135deg,#7c3aed,#a78bfa); }
  .avatar-provider { background: linear-gradient(135deg,#2563eb,#1d4ed8); }

  .panel-enter { animation: ue-slide-in 0.2s ease both; }
`;

/* ─── Navbar ─────────────────────────────────────────────────────────────── */
function DashboardNav({ user, onLogout, onProfile, onGoHome, onQueries }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const firstName = user?.name?.split(" ")[0] || "Account";

  return (
    <nav style={{
      background: "rgba(7,20,50,0.85)",
      backdropFilter: "blur(12px)",
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
      <div onClick={onGoHome} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <ArrowLeft style={{ width: 15, height: 15, color: "rgba(255,255,255,0.6)" }} />
        <div style={{ width: 32, height: 32, borderRadius: 9, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: T.serif, color: "white", fontWeight: 700, fontSize: "1rem" }}>U</span>
        </div>
        <span style={{ fontFamily: T.serif, fontWeight: 700, fontSize: "1.1rem", color: "white" }}>UrbanEase</span>
        <span style={{ fontSize: "0.68rem", fontWeight: 600, background: "rgba(37,99,235,0.3)", color: "#93c5fd", borderRadius: 6, padding: "2px 8px", border: "1px solid rgba(37,99,235,0.4)" }}>ADMIN</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={onQueries}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            cursor: "pointer", fontSize: "0.82rem",
            color: "rgba(255,255,255,0.9)", fontFamily: T.font,
            transition: "all 0.2s",
          }}
        >
          <Mail style={{ width: 14, height: 14, color: "#93c5fd" }} /> Queries
        </button>

      <div ref={dropdownRef} style={{ position: "relative" }}>
        <button
          onClick={() => setDropdownOpen(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 24, padding: "5px 12px 5px 6px",
            cursor: "pointer", fontFamily: T.font, transition: "all 0.2s",
          }}
        >
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#60a5fa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "white" }}>
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
            <button onClick={() => { setDropdownOpen(false); onProfile(); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", background: "none", border: "none", cursor: "pointer", fontFamily: T.font, fontSize: "0.85rem", color: "#374151", textAlign: "left" }}
              onMouseOver={e => e.currentTarget.style.background = "#f8fafc"}
              onMouseOut={e => e.currentTarget.style.background = "none"}>
              <Shield style={{ width: 16, height: 16, color: "#2563eb" }} />
              My Profile
            </button>
            <button onClick={() => { setDropdownOpen(false); onLogout(); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", background: "none", border: "none", cursor: "pointer", fontFamily: T.font, fontSize: "0.85rem", color: "#ef4444", textAlign: "left", borderTop: "1px solid #f8fafc" }}
              onMouseOver={e => e.currentTarget.style.background = "#fef2f2"}
              onMouseOut={e => e.currentTarget.style.background = "none"}>
              <LogOut style={{ width: 16, height: 16 }} />
              Logout
            </button>
          </div>
        )}
      </div>
      </div>
    </nav>
  );
}

/* ─── Shared atoms ───────────────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color, bg, delay = 0 }) {
  return (
    <div className="ue-stat-card" style={{ animationDelay: `${delay}ms` }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        <Icon style={{ width: 18, height: 18, color }} />
      </div>
      <div style={{ fontFamily: T.serif, fontSize: "1.6rem", fontWeight: 700, color: T.color.text, lineHeight: 1 }}>{value ?? "—"}</div>
      <div style={{ fontSize: "0.72rem", color: T.color.faint, marginTop: 5, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

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

function StatusBadge({ statusStyle }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: statusStyle.dot }} />
      <span style={{ background: statusStyle.bg, color: statusStyle.color, fontSize: "0.7rem", fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
        {statusStyle.label}
      </span>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 16, border: "1.5px solid #f1f5f9" }}>
      <Icon style={{ width: 44, height: 44, color: "#cbd5e1", margin: "0 auto 14px" }} />
      <p style={{ fontWeight: 600, color: "#374151", marginBottom: 6 }}>{title}</p>
      <p style={{ fontSize: "0.85rem", color: T.color.faint }}>{subtitle}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ textAlign: "center", padding: "60px 0", color: T.color.faint }}>
      <RefreshCw style={{ width: 28, height: 28, margin: "0 auto 12px", animation: "ue-spin 1s linear infinite" }} />
      <p>Loading...</p>
    </div>
  );
}

/* ─── Mode Toggle ────────────────────────────────────────────────────────── */
function ModeToggle({ mode, onChange }) {
  return (
    <div className="mode-toggle">
      <button
        className={`mode-btn ${mode === "providers" ? "active-provider" : ""}`}
        onClick={() => onChange("providers")}
      >
        <Wrench style={{ width: 15, height: 15 }} />
        Service Providers
      </button>
      <button
        className={`mode-btn ${mode === "users" ? "active-user" : ""}`}
        onClick={() => onChange("users")}
      >
        <Users style={{ width: 15, height: 15 }} />
        Users
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PROVIDER PANEL (extracted from original AdminDashboard)
   ══════════════════════════════════════════════════════════════════════════ */
function ProvidersPanel({ token }) {
  const [providers, setProviders] = useState([]);
  const [analytics, setAnalytics] = useState({ totalProviders: 0, pending: 0, verified: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");
  const [expanded, setExpanded] = useState(null);
  const [acting, setActing] = useState(null);
  const [rejectNote, setRejectNote] = useState({});
  const [showReject, setShowReject] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchAll(); fetchAnalytics(); }, [token]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API}/auth/admin/provider-analytics`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.success) setAnalytics(data.analytics || analytics);
    } catch (e) { console.error(e); }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/admin/pending-providers`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setProviders(data.providers || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchByStatus = async (status) => {
    setLoading(true);
    try {
      const url = status === "pending"
        ? `${API}/auth/admin/pending-providers`
        : `${API}/auth/admin/providers-by-status?status=${status}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setProviders(data.providers || []);
    } catch { } finally { setLoading(false); }
  };

  const handleVerify = async (providerId, action, reason = "") => {
    setActing(providerId);
    try {
      const res = await fetch(`${API}/auth/admin/verify-provider/${providerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, rejectionReason: reason }),
      });
      const data = await res.json();
      if (data.success) {
        setProviders(prev => prev.filter(p => p._id !== providerId));
        setExpanded(null);
        setShowReject(null);
        await fetchAnalytics();
      }
    } catch (e) { console.error(e); }
    finally { setActing(null); }
  };

  const handleDeleteProvider = async (providerId) => {
    if (!window.confirm("Are you sure you want to delete this provider? This action cannot be undone.")) return;
    setActing(providerId);
    try {
      const res = await fetch(`${API}/auth/admin/providers/${providerId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProviders(prev => prev.filter(p => p._id !== providerId));
        if (expanded === providerId) setExpanded(null);
        await fetchAnalytics();
      } else {
        alert(data.message || "Failed to delete provider");
      }
    } catch (e) { console.error(e); alert("Error deleting provider"); }
    finally { setActing(null); }
  };

  const filtered = providers.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.city?.toLowerCase().includes(search.toLowerCase()) ||
    p.serviceCategory?.toLowerCase().includes(search.toLowerCase())
  );

  const TABS = [
    { id: "pending", label: "Pending", icon: Clock },
    { id: "approved", label: "Approved", icon: CheckCircle },
    { id: "rejected", label: "Rejected", icon: XCircle },
  ];

  return (
    <div className="panel-enter">
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 28 }}>
        <StatCard label="Pending Review" value={analytics.pending} icon={Clock} color="#d97706" bg="#fef9c3" delay={0} />
        <StatCard label="Total Providers" value={analytics.totalProviders} icon={Wrench} color="#2563eb" bg="#eff6ff" delay={60} />
        <StatCard label="Verified" value={analytics.verified} icon={CheckCircle} color="#15803d" bg="#dcfce7" delay={120} />
        <StatCard label="Rejected" value={analytics.rejected} icon={XCircle} color="#dc2626" bg="#fee2e2" delay={180} />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id}
                className={`ue-pill ${tab === t.id ? "ue-pill-active" : "ue-pill-inactive"}`}
                onClick={() => { setTab(t.id); setSearch(""); fetchByStatus(t.id); }}>
                <Icon style={{ width: 13, height: 13 }} />
                {t.label}
                {tab === t.id && providers.length > 0 && (
                  <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: 20, padding: "1px 7px", fontSize: "0.7rem" }}>
                    {providers.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div style={{ flex: 1, minWidth: 200 }} className="ue-search-wrap">
          <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: T.color.faint }} />
          <input placeholder="Search by name, email, city..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => { fetchAll(); fetchAnalytics(); }} className="ue-btn ue-btn-neutral">
          <RefreshCw style={{ width: 14, height: 14 }} /> Refresh
        </button>
      </div>

      <p style={{ color: T.color.faint, fontSize: "0.8rem", marginBottom: 14 }}>
        {loading ? "Loading..." : `${filtered.length} provider${filtered.length !== 1 ? "s" : ""} found`}
      </p>

      {/* Cards */}
      {loading ? <LoadingState /> : filtered.length === 0 ? (
        <EmptyState icon={AlertCircle} title="No providers found"
          subtitle={tab === "pending" ? "No pending applications at the moment." : `No ${tab} providers.`} />
      ) : filtered.map(p => {
        const open = expanded === p._id;
        const st = VERIFY_STYLE[p.verificationStatus] || VERIFY_STYLE.pending;
        return (
          <div key={p._id} className="ue-card">
            <div style={{ padding: "18px 20px", cursor: "pointer" }} onClick={() => setExpanded(open ? null : p._id)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div className="avatar-provider" style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontFamily: T.serif, fontSize: "1rem", flexShrink: 0 }}>
                    {p.name[0]}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.95rem", color: T.color.text }}>{p.name}</span>
                      <StatusBadge statusStyle={st} />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteProvider(p._id); }}
                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 6px", background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 6, fontSize: "0.68rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                        title="Delete Provider"
                      >
                        <Trash2 style={{ width: 12, height: 12 }} />
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      {[{ icon: Briefcase, text: p.serviceCategory }, { icon: MapPin, text: p.city }, { icon: Phone, text: p.phone }].map(({ icon: Icon, text }) => (
                        <span key={text} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.78rem", color: T.color.muted }}>
                          <Icon style={{ width: 12, height: 12 }} />{text}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.72rem", color: T.color.faint }}>Applied</div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 500, color: T.color.text }}>
                      {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                  {open ? <ChevronUp style={{ width: 16, height: 16, color: T.color.faint }} /> : <ChevronDown style={{ width: 16, height: 16, color: T.color.faint }} />}
                </div>
              </div>
            </div>

            {open && (
              <div style={{ borderTop: "1.5px solid #f1f5f9", padding: "18px 20px", background: "#f8fafc" }}>
                <div style={{ fontSize: "0.65rem", color: T.color.faint, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Provider Details</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, marginBottom: 16 }}>
                  <InfoTile icon={Users} label="Full Name" value={p.name} />
                  <InfoTile icon={Briefcase} label="Category" value={p.serviceCategory} />
                  <InfoTile icon={MapPin} label="City" value={p.city} />
                  <InfoTile icon={MapPin} label="Address" value={p.address} />
                  <InfoTile icon={Phone} label="Phone" value={p.phone} />
                  <InfoTile icon={Star} label="Experience" value={`${p.experience} years`} />
                  <InfoTile icon={Eye} label="Email" value={p.email} />
                  <InfoTile icon={Clock} label="Applied On" value={new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} />
                </div>

                {p.serviceDescription && (
                  <div style={{ background: "white", borderRadius: 10, padding: "12px 14px", marginBottom: 16, border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "0.65rem", color: T.color.faint, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Service Description</div>
                    <div style={{ fontSize: "0.85rem", color: "#374151", lineHeight: 1.6 }}>{p.serviceDescription}</div>
                  </div>
                )}

                {showReject === p._id && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#dc2626", display: "block", marginBottom: 6 }}>Rejection Reason (required)</label>
                    <textarea
                      value={rejectNote[p._id] || ""}
                      onChange={e => setRejectNote(prev => ({ ...prev, [p._id]: e.target.value }))}
                      placeholder="e.g. Incomplete documentation, service area not covered…"
                      rows={3}
                      style={{ width: "100%", padding: "10px 12px", border: "2px solid #fecaca", borderRadius: 10, fontSize: "0.85rem", fontFamily: T.font, outline: "none", resize: "none", background: "#fff5f5", boxSizing: "border-box", color: T.color.text }}
                    />
                  </div>
                )}

                {p.verificationStatus === "pending" && (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button className="ue-btn ue-btn-success" disabled={acting === p._id} onClick={() => handleVerify(p._id, "approve")}>
                      <CheckCircle style={{ width: 14, height: 14 }} />
                      {acting === p._id ? "Processing..." : "Approve Provider"}
                    </button>
                    {showReject !== p._id ? (
                      <button className="ue-btn ue-btn-danger" onClick={() => setShowReject(p._id)}>
                        <XCircle style={{ width: 14, height: 14 }} />Reject Application
                      </button>
                    ) : (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="ue-btn ue-btn-danger" disabled={acting === p._id || !rejectNote[p._id]?.trim()} onClick={() => handleVerify(p._id, "reject", rejectNote[p._id])}>
                          <XCircle style={{ width: 14, height: 14 }} />{acting === p._id ? "Processing..." : "Confirm Reject"}
                        </button>
                        <button className="ue-btn ue-btn-neutral" onClick={() => setShowReject(null)}>Cancel</button>
                      </div>
                    )}
                  </div>
                )}

                {p.verificationStatus === "approved" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#dcfce7", borderRadius: 10, width: "fit-content" }}>
                    <CheckCircle style={{ width: 14, height: 14, color: "#15803d" }} />
                    <span style={{ fontSize: "0.82rem", color: "#15803d", fontWeight: 600 }}>This provider has been approved.</span>
                  </div>
                )}

                {p.verificationStatus === "rejected" && (
                  <div style={{ padding: "10px 14px", background: "#fee2e2", borderRadius: 10, width: "fit-content" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: p.rejectionReason ? 4 : 0 }}>
                      <XCircle style={{ width: 14, height: 14, color: "#dc2626" }} />
                      <span style={{ fontSize: "0.82rem", color: "#dc2626", fontWeight: 600 }}>Application Rejected</span>
                    </div>
                    {p.rejectionReason && <div style={{ fontSize: "0.78rem", color: "#b91c1c" }}>Reason: {p.rejectionReason}</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   USERS PANEL
   ══════════════════════════════════════════════════════════════════════════ */
function UsersPanel({ token }) {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({ totalUsers: 0, activeUsers: 0, bannedUsers: 0, newThisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [acting, setActing] = useState(null);
  const [search, setSearch] = useState("");
  const [banNote, setBanNote] = useState({});
  const [showBan, setShowBan] = useState(null);

  useEffect(() => { fetchUsers(); fetchUserAnalytics(); }, [token]);

  const fetchUserAnalytics = async () => {
    try {
      const res = await fetch(`${API}/auth/admin/user-analytics`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.success) setAnalytics(data.analytics || analytics);
    } catch (e) { console.error(e); }
  };

  const fetchUsers = async (status = "all") => {
    setLoading(true);
    try {
      const url = status === "all"
        ? `${API}/auth/admin/users`
        : `${API}/auth/admin/users?status=${status}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setUsers(data.users || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleUserAction = async (userId, action, reason = "") => {
    setActing(userId);
    try {
      const res = await fetch(`${API}/auth/admin/users/${userId}/action`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchUsers(tab);
        await fetchUserAnalytics();
        setExpanded(null);
        setShowBan(null);
      }
    } catch (e) { console.error(e); }
    finally { setActing(null); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    setActing(userId);
    try {
      const res = await fetch(`${API}/auth/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.filter(u => u._id !== userId));
        if (expanded === userId) setExpanded(null);
        await fetchUserAnalytics();
      } else {
        alert(data.message || "Failed to delete user");
      }
    } catch (e) { console.error(e); alert("Error deleting user"); }
    finally { setActing(null); }
  };

  const TABS = [
    { id: "all", label: "All Users", icon: Users },
    { id: "active", label: "Active", icon: Activity },
    { id: "banned", label: "Banned", icon: Ban },
  ];

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="panel-enter">
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 28 }}>
        <StatCard label="Total Users" value={analytics.totalUsers} icon={Users} color="#7c3aed" bg="#f5f3ff" delay={0} />
        <StatCard label="Active Users" value={analytics.activeUsers} icon={Activity} color="#15803d" bg="#dcfce7" delay={60} />
        <StatCard label="New This Month" value={analytics.newThisMonth} icon={TrendingUp} color="#0891b2" bg="#ecfeff" delay={120} />
        <StatCard label="Banned" value={analytics.bannedUsers} icon={Ban} color="#dc2626" bg="#fee2e2" delay={180} />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id}
                className={`ue-pill ${tab === t.id ? "ue-pill-active" : "ue-pill-inactive"}`}
                style={tab === t.id ? { background: "#7c3aed", borderColor: "#7c3aed" } : {}}
                onClick={() => { setTab(t.id); setSearch(""); fetchUsers(t.id); }}>
                <Icon style={{ width: 13, height: 13 }} />
                {t.label}
                {tab === t.id && users.length > 0 && (
                  <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: 20, padding: "1px 7px", fontSize: "0.7rem" }}>
                    {users.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div style={{ flex: 1, minWidth: 200 }} className="ue-search-wrap">
          <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: T.color.faint }} />
          <input placeholder="Search by name, email, phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => { fetchUsers(tab); fetchUserAnalytics(); }} className="ue-btn ue-btn-neutral">
          <RefreshCw style={{ width: 14, height: 14 }} /> Refresh
        </button>
      </div>

      <p style={{ color: T.color.faint, fontSize: "0.8rem", marginBottom: 14 }}>
        {loading ? "Loading..." : `${filtered.length} user${filtered.length !== 1 ? "s" : ""} found`}
      </p>

      {/* Cards */}
      {loading ? <LoadingState /> : filtered.length === 0 ? (
        <EmptyState icon={User} title="No users found" subtitle="No users match the current filter." />
      ) : filtered.map(u => {
        const open = expanded === u._id;
        const status = u.isBanned ? "banned" : u.isActive === false ? "inactive" : "active";
        const st = USER_STATUS_STYLE[status];

        return (
          <div key={u._id} className="ue-card">
            <div style={{ padding: "18px 20px", cursor: "pointer" }} onClick={() => setExpanded(open ? null : u._id)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div className="avatar-user" style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontFamily: T.serif, fontSize: "1rem", flexShrink: 0 }}>
                    {u.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.95rem", color: T.color.text }}>{u.name}</span>
                      <StatusBadge statusStyle={st} />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteUser(u._id); }}
                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 6px", background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 6, fontSize: "0.68rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                        title="Delete User"
                      >
                        <Trash2 style={{ width: 12, height: 12 }} />
                      </button>
                      {u.isVerifiedEmail && (
                        <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "0.68rem", color: "#0891b2", background: "#ecfeff", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>
                          <BadgeCheck style={{ width: 10, height: 10 }} /> Verified
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      {[{ icon: Mail, text: u.email }, { icon: Phone, text: u.phone || "—" }].map(({ icon: Icon, text }) => (
                        <span key={text} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.78rem", color: T.color.muted }}>
                          <Icon style={{ width: 12, height: 12 }} />{text}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.72rem", color: T.color.faint }}>Joined</div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 500, color: T.color.text }}>
                      {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                  {open ? <ChevronUp style={{ width: 16, height: 16, color: T.color.faint }} /> : <ChevronDown style={{ width: 16, height: 16, color: T.color.faint }} />}
                </div>
              </div>
            </div>

            {open && (
              <div style={{ borderTop: "1.5px solid #f1f5f9", padding: "18px 20px", background: "#f8fafc" }}>
                <div style={{ fontSize: "0.65rem", color: T.color.faint, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>User Details</div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, marginBottom: 16 }}>
                  <InfoTile icon={User} label="Full Name" value={u.name} />
                  <InfoTile icon={Mail} label="Email" value={u.email} />
                  <InfoTile icon={Phone} label="Phone" value={u.phone || "Not provided"} />
                  <InfoTile icon={MapPin} label="City" value={u.city || "Not set"} />
                  <InfoTile icon={Calendar} label="Joined" value={new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} />
                  <InfoTile icon={Hash} label="Total Bookings" value={u.totalBookings ?? "—"} />
                  <InfoTile icon={Activity} label="Last Active" value={u.lastActive ? new Date(u.lastActive).toLocaleDateString("en-IN") : "—"} />
                  <InfoTile icon={BadgeCheck} label="Email Verified" value={u.isVerifiedEmail ? "Yes" : "No"} />
                </div>

                {/* Ban reason input */}
                {showBan === u._id && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#dc2626", display: "block", marginBottom: 6 }}>
                      Ban Reason (optional)
                    </label>
                    <textarea
                      value={banNote[u._id] || ""}
                      onChange={e => setBanNote(prev => ({ ...prev, [u._id]: e.target.value }))}
                      placeholder="e.g. Repeated policy violations, fraud reports…"
                      rows={3}
                      style={{ width: "100%", padding: "10px 12px", border: "2px solid #fecaca", borderRadius: 10, fontSize: "0.85rem", fontFamily: T.font, outline: "none", resize: "none", background: "#fff5f5", boxSizing: "border-box", color: T.color.text }}
                    />
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {!u.isBanned ? (
                    <>
                      {showBan !== u._id ? (
                        <button className="ue-btn ue-btn-danger" onClick={() => setShowBan(u._id)}>
                          <Ban style={{ width: 14, height: 14 }} /> Ban User
                        </button>
                      ) : (
                        <>
                          <button className="ue-btn ue-btn-danger" disabled={acting === u._id}
                            onClick={() => handleUserAction(u._id, "ban", banNote[u._id])}>
                            <Ban style={{ width: 14, height: 14 }} />{acting === u._id ? "Processing..." : "Confirm Ban"}
                          </button>
                          <button className="ue-btn ue-btn-neutral" onClick={() => setShowBan(null)}>Cancel</button>
                        </>
                      )}
                    </>
                  ) : (
                    <button className="ue-btn ue-btn-success" disabled={acting === u._id}
                      onClick={() => handleUserAction(u._id, "unban")}>
                      <Unlock style={{ width: 14, height: 14 }} />{acting === u._id ? "Processing..." : "Unban User"}
                    </button>
                  )}

                  <button className="ue-btn ue-btn-warning" disabled={acting === u._id}
                    onClick={() => handleUserAction(u._id, "reset-password")}>
                    <Lock style={{ width: 14, height: 14 }} /> Reset Password
                  </button>
                </div>

                {u.isBanned && u.banReason && (
                  <div style={{ marginTop: 14, padding: "10px 14px", background: "#fee2e2", borderRadius: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <Ban style={{ width: 14, height: 14, color: "#dc2626" }} />
                      <span style={{ fontSize: "0.82rem", color: "#dc2626", fontWeight: 600 }}>Account Banned</span>
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#b91c1c" }}>Reason: {u.banReason}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN ADMIN DASHBOARD
   ══════════════════════════════════════════════════════════════════════════ */
export function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("providers"); // "providers" | "users"

  const headingMap = {
    providers: { title: "Provider Verification", sub: "Review, approve, or reject service provider applications." },
    users: { title: "User Management", sub: "View, manage, and moderate all registered users." },
  };

  return (
    <div style={{ minHeight: "100vh", background: T.color.bg, fontFamily: T.font }}>
      <style>{SHARED_CSS}</style>

      <DashboardNav
        user={user}
        onLogout={logout}
        onProfile={() => navigate("/admin-profile")}
        onGoHome={() => navigate("/")}
        onQueries={() => navigate("/admin-queries")}
      />

      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "28px 20px" }}>

        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: T.serif, fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 700, color: T.color.text, marginBottom: 4 }}>
              {headingMap[mode].title}
            </h1>
            <p style={{ color: T.color.muted, fontSize: "0.875rem" }}>
              {headingMap[mode].sub}
            </p>
          </div>

          {/* ── The main toggle ── */}
          <ModeToggle mode={mode} onChange={(m) => setMode(m)} />
        </div>

        {/* Panel switcher */}
        {mode === "providers"
          ? <ProvidersPanel key="providers" token={token} />
          : <UsersPanel key="users" token={token} />
        }
      </div>
    </div>
  );
}
