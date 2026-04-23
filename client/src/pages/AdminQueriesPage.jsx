import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  ChevronDown,
  Download,
  FileSpreadsheet,
  LogOut,
  Mail,
  MessageSquareText,
  RefreshCw,
  Search,
  Shield,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function AdminNav({ user, onLogout, onDashboard, onProfile, onQueries }) {
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

  return (
    <nav
      style={{
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
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={onDashboard}
          style={{
            border: "none",
            background: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            color: "rgba(255,255,255,0.65)",
          }}
          aria-label="Back to dashboard"
        >
          <ArrowLeft style={{ width: 15, height: 15 }} />
        </button>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontFamily: "'Fraunces', serif", color: "white", fontWeight: 700, fontSize: "1rem" }}>
            U
          </span>
        </div>
        <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.1rem", color: "white" }}>
          UrbanEase
        </span>
        <span
          style={{
            fontSize: "0.68rem",
            fontWeight: 600,
            background: "rgba(37,99,235,0.3)",
            color: "#93c5fd",
            borderRadius: 6,
            padding: "2px 8px",
            border: "1px solid rgba(37,99,235,0.4)",
          }}
        >
          ADMIN
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={onDashboard}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            cursor: "pointer",
            fontSize: "0.82rem",
            color: "rgba(255,255,255,0.9)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <Shield style={{ width: 14, height: 14, color: "#93c5fd" }} /> Dashboard
        </button>

        <button
          onClick={onQueries}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 10,
            border: "1px solid rgba(147,197,253,0.35)",
            background: "rgba(37,99,235,0.18)",
            cursor: "pointer",
            fontSize: "0.82rem",
            color: "#dbeafe",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <Mail style={{ width: 14, height: 14, color: "#bfdbfe" }} /> Queries
        </button>

        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 24,
              padding: "5px 12px 5px 6px",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#2563eb,#60a5fa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "white",
              }}
            >
              {(user?.name?.[0] || "A").toUpperCase()}
            </div>
            <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>
              {user?.name?.split(" ")[0] || "Admin"}
            </span>
            <ChevronDown
              style={{
                width: 13,
                height: 13,
                color: "rgba(255,255,255,0.5)",
                transform: dropdownOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                background: "white",
                borderRadius: 14,
                minWidth: 180,
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                border: "1px solid #f1f5f9",
                overflow: "hidden",
                zIndex: 200,
              }}
            >
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #f8fafc", background: "#fafbff" }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>{user?.name}</div>
                <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 2 }}>{user?.email}</div>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onProfile();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "11px 16px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.85rem",
                  color: "#374151",
                  textAlign: "left",
                }}
              >
                <Shield style={{ width: 16, height: 16, color: "#2563eb" }} />
                My Profile
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "11px 16px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.85rem",
                  color: "#ef4444",
                  textAlign: "left",
                  borderTop: "1px solid #f8fafc",
                }}
              >
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

export function AdminQueriesPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const fetchQueries = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/contact/admin/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to fetch queries");
      }

      setQueries(data.queries || []);
    } catch (fetchError) {
      setError(fetchError.message || "Unable to fetch queries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [token]);

  const filteredQueries = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return queries;

    return queries.filter((item) =>
      item.name?.toLowerCase().includes(term) ||
      item.email?.toLowerCase().includes(term) ||
      item.query?.toLowerCase().includes(term)
    );
  }, [queries, search]);

  const handleExport = () => {
    const rows = filteredQueries.map((item, index) => ({
      Sno: index + 1,
      Name: item.name || "",
      Email: item.email || "",
      Query: (item.query || "").replace(/\r?\n/g, " "),
      Status: item.status || "",
      ReceivedAt: item.createdAt
        ? new Date(item.createdAt).toLocaleString("en-IN")
        : "",
    }));

    const headers = ["Sno", "Name", "Email", "Query", "Status", "ReceivedAt"];
    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `urbanease-contact-queries-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
      `}</style>

      <AdminNav
        user={user}
        onLogout={logout}
        onDashboard={() => navigate("/admin-dashboard")}
        onProfile={() => navigate("/admin-profile")}
        onQueries={() => navigate("/admin-queries")}
      />

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: "clamp(1.5rem,3vw,1.9rem)",
                fontWeight: 700,
                color: "#0f172a",
                marginBottom: 6,
              }}
            >
              Contact Queries Inbox
            </h1>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              Review every message users submitted from the Contact Us form.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={fetchQueries}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 14px",
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                background: "white",
                cursor: "pointer",
                fontSize: "0.82rem",
                color: "#2563eb",
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <RefreshCw style={{ width: 14, height: 14 }} />
              Refresh
            </button>

            <button
              onClick={handleExport}
              disabled={!filteredQueries.length}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 14px",
                borderRadius: 10,
                border: "none",
                background: filteredQueries.length ? "#16a34a" : "#cbd5e1",
                cursor: filteredQueries.length ? "pointer" : "not-allowed",
                fontSize: "0.82rem",
                color: "white",
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <Download style={{ width: 14, height: 14 }} />
              Download Excel
            </button>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: 18,
            border: "1.5px solid #f1f5f9",
            padding: 18,
            marginBottom: 16,
          }}
        >
          <div style={{ position: "relative", maxWidth: 340 }}>
            <Search
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                width: 15,
                height: 15,
                color: "#94a3b8",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or query..."
              style={{
                width: "100%",
                padding: "10px 14px 10px 38px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 10,
                fontSize: "0.875rem",
                outline: "none",
                background: "white",
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: "border-box",
                color: "#0f172a",
              }}
            />
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: 18,
            border: "1.5px solid #f1f5f9",
            overflow: "hidden",
          }}
        >
          {error ? (
            <div style={{ padding: 20, color: "#dc2626", background: "#fef2f2" }}>{error}</div>
          ) : loading ? (
            <div style={{ padding: 32, textAlign: "center", color: "#64748b" }}>Loading queries...</div>
          ) : filteredQueries.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
              <FileSpreadsheet style={{ width: 34, height: 34, margin: "0 auto 12px", color: "#94a3b8" }} />
              No queries found.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                    {["#", "Name", "Email", "Query", "Status", "Received"].map((header) => (
                      <th
                        key={header}
                        style={{
                          padding: "14px 16px",
                          fontSize: "0.78rem",
                          color: "#64748b",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredQueries.map((item, index) => (
                    <tr key={item._id} style={{ borderBottom: "1px solid #f8fafc" }}>
                      <td style={{ padding: "16px", fontSize: "0.85rem", color: "#64748b", verticalAlign: "top" }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: "16px", verticalAlign: "top" }}>
                        <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.92rem" }}>{item.name}</div>
                      </td>
                      <td style={{ padding: "16px", verticalAlign: "top" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#2563eb", fontSize: "0.88rem" }}>
                          <Mail style={{ width: 14, height: 14 }} />
                          {item.email}
                        </div>
                      </td>
                      <td style={{ padding: "16px", verticalAlign: "top", maxWidth: 360 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                          <MessageSquareText style={{ width: 15, height: 15, color: "#2563eb", marginTop: 2, flexShrink: 0 }} />
                          <span style={{ fontSize: "0.88rem", color: "#334155", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                            {item.query}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "16px", verticalAlign: "top" }}>
                        <span
                          style={{
                            background: "#eff6ff",
                            color: "#2563eb",
                            fontSize: "0.74rem",
                            fontWeight: 700,
                            padding: "4px 10px",
                            borderRadius: 999,
                            textTransform: "capitalize",
                          }}
                        >
                          {item.status || "new"}
                        </span>
                      </td>
                      <td style={{ padding: "16px", verticalAlign: "top", fontSize: "0.85rem", color: "#64748b" }}>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
