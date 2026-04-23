import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, Routes, Route, useLocation } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const UPLOADS = (import.meta.env.VITE_API_URL || "http://localhost:5000/api")
  .replace("/api", "") + "/uploads/";

/* ─────────────────────────────────────────────────────────────
   SHARED NAV
───────────────────────────────────────────────────────────── */
function TeamNav() {
  const navigate = useNavigate();
  const loc = useLocation();

  const links = [
    { to: "/team",         label: "Home" },
    { to: "/team/add",     label: "Add Member" },
    { to: "/team/members", label: "View Members" },
  ];

  return (
    <nav style={{
      background: "#1a1a2e",
      height: 56,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 2rem",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <span
        onClick={() => navigate("/team")}
        style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", cursor: "pointer", letterSpacing: 1 }}
      >
        TEAM 13
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        {links.map(l => {
          const active = loc.pathname === l.to;
          return (
            <Link key={l.to} to={l.to} style={{
              color: active ? "#fff" : "#9ca3af",
              textDecoration: "none",
              fontSize: "0.88rem",
              fontWeight: active ? 600 : 400,
              borderBottom: active ? "2px solid #fff" : "2px solid transparent",
              paddingBottom: 2,
            }}>
              {l.label}
            </Link>
          );
        })}

        <button
          onClick={() => navigate("/")}
          style={{
            background: "transparent",
            border: "1px solid #4b5563",
            color: "#9ca3af",
            borderRadius: 6,
            padding: "5px 14px",
            fontSize: "0.82rem",
            cursor: "pointer",
          }}
        >
          ← UrbanEase
        </button>
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────────
   HOME PAGE
───────────────────────────────────────────────────────────── */
function TeamHome() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "calc(100vh - 56px)",
      background: "#1a1a2e",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
    }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{
          color: "#fff",
          fontSize: "2.8rem",
          fontWeight: 300,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          margin: "0 0 0.5rem",
        }}>
          TEAM 13
        </h1>

        <p style={{ color: "#9ca3af", fontSize: "0.9rem", margin: "0 0 2.5rem" }}>
          Welcome to the Team 13 Management
        </p>

        <div style={{
          background: "#2d3a6b",
          borderRadius: 10,
          padding: "2rem 3rem",
          display: "inline-block",
          minWidth: 260,
        }}>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", margin: "0 0 1.2rem" }}>
            Manage Team
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <HomeBtn onClick={() => navigate("/team/add")}>Add Member</HomeBtn>
            <HomeBtn onClick={() => navigate("/team/members")}>View Members</HomeBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeBtn({ children, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "#e5e7eb" : "#f3f4f6",
        color: "#1a1a2e",
        border: "none",
        borderRadius: 6,
        padding: "10px 22px",
        fontSize: "0.88rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "background 0.15s",
      }}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   ADD MEMBER — underline inputs matching SS
───────────────────────────────────────────────────────────── */
function AddMember() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", roll: "", year: "", degree: "",
    project: "", hobbies: "", certificate: "",
    internship: "", aim: "", email: "",
  });
  const [image, setImage]     = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = e => {
    const f = e.target.files[0];
    if (f) { setImage(f); setPreview(URL.createObjectURL(f)); }
  };

  const validate = () => {
    if (!form.name.trim())   return "Name is required";
    if (!form.roll.trim())   return "Roll Number is required";
    if (!form.year.trim())   return "Year is required";
    if (!form.degree.trim()) return "Degree is required";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) return "Invalid email";
    return null;
  };

  const submit = async e => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true); setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append("image", image);
      await axios.post(`${API}/members`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess("Member added successfully!");
      setTimeout(() => navigate("/team/members"), 1400);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    display: "block", width: "100%",
    border: "none", borderBottom: "1px solid #d1d5db",
    borderRadius: 0, padding: "10px 2px",
    fontSize: "0.92rem", outline: "none",
    background: "transparent", color: "#111",
    boxSizing: "border-box", marginBottom: "1.1rem",
    fontFamily: "inherit",
  };

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", background: "#fff", padding: "2.5rem 1rem" }}>
      <style>{`input::placeholder,textarea::placeholder{color:#9ca3af;}`}</style>

      <div style={{ maxWidth: 500, margin: "0 auto" }}>
        <h2 style={{
          textAlign: "center", color: "#2563eb",
          fontWeight: 600, fontSize: "1.4rem", marginBottom: "2rem",
        }}>
          Add Team Member
        </h2>

        {error   && <Msg bg="#fee2e2" color="#b91c1c" text={error} />}
        {success && <Msg bg="#dcfce7" color="#166534" text={success} />}

        <form onSubmit={submit}>
          <input style={inp} name="name"   value={form.name}   onChange={change} placeholder="Name" />
          <input style={inp} name="roll"   value={form.roll}   onChange={change} placeholder="Roll Number" />
          <input style={inp} name="year"   value={form.year}   onChange={change} placeholder="Year" />
          <input style={inp} name="degree" value={form.degree} onChange={change} placeholder="Degree" />
          <input style={inp} name="email" type="email" value={form.email} onChange={change} placeholder="Email (optional)" />

          <textarea
            name="project" value={form.project} onChange={change}
            placeholder="About Project" rows={3}
            style={{ ...inp, resize: "vertical" }}
          />

          <input style={inp} name="hobbies"     value={form.hobbies}     onChange={change} placeholder="Hobbies (comma separated)" />
          <input style={inp} name="certificate" value={form.certificate} onChange={change} placeholder="Certificate" />
          <input style={inp} name="internship"  value={form.internship}  onChange={change} placeholder="Internship" />

          <textarea
            name="aim" value={form.aim} onChange={change}
            placeholder="About Your Aim" rows={3}
            style={{ ...inp, resize: "vertical" }}
          />

          <div style={{ marginBottom: "1.5rem" }}>
            <input type="file" accept="image/*" onChange={handleImage} />
            {preview && (
              <img src={preview} alt="preview" style={{
                marginTop: 10, width: 90, height: 90,
                objectFit: "cover", borderRadius: 6, border: "1px solid #e5e7eb",
              }} />
            )}
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              display: "block", width: "100%",
              background: loading ? "#93c5fd" : "#2563eb",
              color: "#fff", border: "none", borderRadius: 4,
              padding: "13px", fontSize: "0.9rem",
              fontWeight: 700, letterSpacing: "0.08em",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "SUBMITTING..." : "SUBMIT"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   VIEW MEMBERS
───────────────────────────────────────────────────────────── */
function ViewMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/members`)
      .then(r => { setMembers(r.data.data); setLoading(false); })
      .catch(() => { setError("Failed to load members"); setLoading(false); });
  }, []);

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", background: "#f9fafb", padding: "2rem 1rem" }}>
      <h2 style={{
        textAlign: "center", color: "#111827",
        fontWeight: 600, fontSize: "1.3rem",
        letterSpacing: "0.05em", textTransform: "uppercase",
        marginBottom: "2rem",
      }}>
        MEET OUR AMAZING TEAM
      </h2>

      {loading && <p style={{ textAlign: "center", color: "#6b7280" }}>Loading...</p>}
      {error   && <Msg bg="#fee2e2" color="#b91c1c" text={error} />}

      {!loading && members.length === 0 && (
        <p style={{ textAlign: "center", color: "#6b7280" }}>
          No members yet.{" "}
          <Link to="/team/add" style={{ color: "#2563eb" }}>Add one!</Link>
        </p>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "1.5rem", maxWidth: 900, margin: "0 auto",
      }}>
        {members.map(m => (
          <div key={m._id} style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            overflow: "hidden",
            textAlign: "center",
          }}>
            <img
              src={m.image ? UPLOADS + m.image : "https://placehold.co/300x200?text=Photo"}
              alt={m.name}
              style={{ width: "100%", height: 170, objectFit: "cover", display: "block" }}
            />
            <div style={{ padding: "0.9rem 1rem 1.1rem" }}>
              <div style={{ fontWeight: 700, color: "#111827", fontSize: "0.92rem" }}>{m.name}</div>
              <div style={{ color: "#6b7280", fontSize: "0.78rem", margin: "3px 0 12px" }}>
                Roll Number: {m.roll}
              </div>
              <button
                onClick={() => navigate(`/team/member/${m._id}`)}
                style={{
                  background: "#2563eb", color: "#fff",
                  border: "none", borderRadius: 4,
                  padding: "7px 18px", fontSize: "0.75rem",
                  fontWeight: 700, letterSpacing: "0.08em",
                  textTransform: "uppercase", cursor: "pointer",
                }}
              >
                VIEW DETAILS
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MEMBER DETAILS
───────────────────────────────────────────────────────────── */
function MemberDetails() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [member, setMember]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    axios.get(`${API}/members/${id}`)
      .then(r => { setMember(r.data.data); setLoading(false); })
      .catch(() => { setError("Member not found"); setLoading(false); });
  }, [id]);

  if (loading) return <p style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>Loading...</p>;
  if (error)   return <Msg bg="#fee2e2" color="#b91c1c" text={error} />;

  const hobbies = member.hobbies
    ? member.hobbies.split(",").map(h => h.trim()).filter(Boolean)
    : [];

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", background: "#f9fafb", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <button
          onClick={() => navigate("/team/members")}
          style={{
            background: "none", border: "1px solid #d1d5db",
            color: "#374151", borderRadius: 5,
            padding: "5px 14px", fontSize: "0.82rem",
            cursor: "pointer", marginBottom: "1.2rem",
          }}
        >
          ← Back
        </button>

        <div style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          overflow: "hidden",
        }}>
          <img
            src={member.image ? UPLOADS + member.image : "https://placehold.co/480x260?text=Photo"}
            alt={member.name}
            style={{ width: "100%", height: 240, objectFit: "cover", display: "block" }}
          />

          <div style={{ padding: "1.5rem 2rem" }}>
            <h2 style={{
              textAlign: "center", color: "#111827",
              margin: "0 0 4px", fontWeight: 700, fontSize: "1.2rem",
            }}>
              {member.name}
            </h2>
            <p style={{
              textAlign: "center", color: "#6b7280",
              margin: "0 0 1.4rem", fontSize: "0.85rem",
            }}>
              {member.degree} · {member.year}
            </p>

            <Row label="Roll Number"   value={member.roll} />
            {member.email       && <Row label="Email"          value={member.email} />}
            {member.project     && <Row label="Project"        value={member.project} />}
            {member.certificate && <Row label="Certificate"    value={member.certificate} />}
            {member.internship  && <Row label="Internship"     value={member.internship} />}
            {member.aim         && <Row label="About Your Aim" value={member.aim} />}

            {hobbies.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151" }}>Hobbies:</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: 6 }}>
                  {hobbies.map((h, i) => (
                    <span key={i} style={{
                      background: "#dbeafe", color: "#1d4ed8",
                      borderRadius: 20, padding: "3px 12px",
                      fontSize: "0.78rem", fontWeight: 600,
                    }}>
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function Row({ label, value }) {
  return (
    <div style={{ marginBottom: "0.65rem", fontSize: "0.88rem" }}>
      <span style={{ fontWeight: 700, color: "#374151" }}>{label}: </span>
      <span style={{ color: "#6b7280" }}>{value}</span>
    </div>
  );
}

function Msg({ bg, color, text }) {
  return (
    <div style={{
      background: bg, color, borderRadius: 5,
      padding: "9px 14px", marginBottom: "1rem", fontSize: "0.87rem",
    }}>
      {text}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROOT EXPORT
───────────────────────────────────────────────────────────── */
export function TeamPage() {
  return (
    <div>
      <TeamNav />
      <Routes>
        <Route index           element={<TeamHome />} />
        <Route path="add"      element={<AddMember />} />
        <Route path="members"  element={<ViewMembers />} />
        <Route path="member/:id" element={<MemberDetails />} />
      </Routes>
    </div>
  );
}