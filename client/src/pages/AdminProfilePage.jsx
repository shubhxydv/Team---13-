import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Mail, Phone, LogOut, Edit2, Check, X, ArrowLeft,
  ChevronRight, ChevronDown, Shield, Users, CheckCircle,
  XCircle, Clock, BarChart2, Settings, Activity
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function AdminProfilePage() {
  const { user, token, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [isEditing,    setIsEditing]    = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [stats,        setStats]        = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [recentProviders, setRecentProviders] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({ name: "", email: "" });

  useEffect(() => {
    if (user) setFormData({ name: user.name || "", email: user.email || "" });

    const fetchStats = async () => {
      try {
        const res  = await fetch(`${API}/auth/admin/pending-providers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setStats(prev => ({ ...prev, pending: data.providers?.length || 0 }));
          setRecentProviders((data.providers || []).slice(0, 4));
        }
      } catch(e) { console.error(e); }
      finally { setLoadingStats(false); }
    };
    fetchStats();
  }, [user, token]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res  = await fetch(`${API}/auth/update-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed");
      if (data.user) { updateUser(data.user); setFormData({ name: data.user.name || "", email: data.user.email || "" }); }
      setIsEditing(false);
    } catch(err) { alert(err.message); } finally { setSaving(false); }
  };

  const adminStats = [
    { label: "Pending",  value: stats.pending,  icon: Clock,        color: "#d97706", bg: "#fef9c3" },
    { label: "Approved", value: stats.approved,  icon: CheckCircle,  color: "#15803d", bg: "#dcfce7" },
    { label: "Rejected", value: stats.rejected,  icon: XCircle,      color: "#dc2626", bg: "#fee2e2" },
    { label: "Total",    value: stats.total,     icon: Users,        color: "#2563eb", bg: "#eff6ff" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#f1f5f9", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        .profile-input { background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.3); border-radius:10px; padding:8px 12px; color:white; font-size:0.875rem; outline:none; width:100%; font-family:'DM Sans',sans-serif; transition:border-color 0.2s; }
        .profile-input:focus { border-color:rgba(255,255,255,0.7); }
        .profile-input::placeholder { color:rgba(255,255,255,0.5); }
        .astat-card { border-radius:14px; padding:18px 16px; border:1.5px solid #f1f5f9; background:white; transition:all 0.2s; }
        .astat-card:hover { transform:translateY(-2px); box-shadow:0 4px 16px rgba(0,0,0,0.06); }
        .prov-row { background:white; border-radius:12px; padding:14px 16px; border:1.5px solid #f1f5f9; margin-bottom:10px; transition:border-color 0.2s; }
        .prov-row:hover { border-color:#bfdbfe; }
        .info-tile { background:rgba(255,255,255,0.1); border-radius:12px; padding:10px 14px; }
        .quick-link { display:flex; align-items:center; justify-content:space-between; padding:14px 18px; cursor:pointer; border-bottom:1px solid #f1f5f9; transition:background 0.15s; }
        .quick-link:last-child { border-bottom:none; }
        .quick-link:hover { background:#f8fafc; }
        @media(max-width:768px){ .agrid{ grid-template-columns:1fr !important; } .asgrid{ grid-template-columns:1fr 1fr !important; } }
      `}</style>

      {/* Navbar */}
      <nav style={{ background:"linear-gradient(135deg,#0f172a,#1e3a5f)", padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"#2563eb", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Shield style={{ width:15, height:15, color:"white" }} />
          </div>
          <span style={{ fontFamily:"'Fraunces',serif", fontWeight:700, color:"white", fontSize:"1.05rem" }}>UrbanEase</span>
          <span style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:20, padding:"2px 8px", fontSize:"0.65rem", color:"rgba(255,255,255,0.7)", fontWeight:600 }}>Admin</span>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={() => navigate("/admin-dashboard")}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.2)", background:"rgba(255,255,255,0.08)", cursor:"pointer", fontSize:"0.82rem", color:"rgba(255,255,255,0.9)", fontFamily:"'DM Sans',sans-serif" }}>
            <BarChart2 style={{ width:14, height:14, color:"#93c5fd" }} /> Dashboard
          </button>

          <button onClick={() => navigate("/admin-queries")}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.2)", background:"rgba(255,255,255,0.08)", cursor:"pointer", fontSize:"0.82rem", color:"rgba(255,255,255,0.9)", fontFamily:"'DM Sans',sans-serif" }}>
            <Mail style={{ width:14, height:14, color:"#93c5fd" }} /> Queries
          </button>

          <div ref={dropdownRef} style={{ position:"relative" }}>
            <button onClick={() => setDropdownOpen(v => !v)}
              style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:24, padding:"5px 12px 5px 6px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}
              onMouseOver={e => e.currentTarget.style.background="rgba(255,255,255,0.15)"}
              onMouseOut={e => e.currentTarget.style.background="rgba(255,255,255,0.08)"}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#2563eb,#60a5fa)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.75rem", fontWeight:700, color:"white", flexShrink:0 }}>
                {(user?.name?.[0] || "A").toUpperCase()}
              </div>
              <span style={{ fontSize:"0.82rem", fontWeight:500, color:"rgba(255,255,255,0.9)" }}>{user?.name?.split(" ")[0] || "Admin"}</span>
              <ChevronDown style={{ width:13, height:13, color:"rgba(255,255,255,0.5)", transform: dropdownOpen?"rotate(180deg)":"none", transition:"transform 0.2s" }} />
            </button>

            {dropdownOpen && (
              <div style={{ position:"absolute", right:0, top:"calc(100% + 8px)", background:"white", borderRadius:14, minWidth:180, boxShadow:"0 8px 32px rgba(0,0,0,0.15)", border:"1px solid #f1f5f9", overflow:"hidden", zIndex:200 }}>
                <div style={{ padding:"14px 16px", borderBottom:"1px solid #f8fafc", background:"#fafbff" }}>
                  <div style={{ fontSize:"0.82rem", fontWeight:700, color:"#0f172a" }}>{user?.name}</div>
                  <div style={{ fontSize:"0.72rem", color:"#94a3b8", marginTop:2 }}>{user?.email}</div>
                  <div style={{ fontSize:"0.65rem", background:"#eff6ff", color:"#2563eb", padding:"2px 8px", borderRadius:20, display:"inline-block", marginTop:4, fontWeight:600 }}>Administrator</div>
                </div>
                <button onClick={() => { setDropdownOpen(false); logout(); }}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"11px 16px", background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:"0.85rem", color:"#ef4444", textAlign:"left", transition:"background 0.15s" }}
                  onMouseOver={e => e.currentTarget.style.background="#fef2f2"}
                  onMouseOut={e => e.currentTarget.style.background="none"}>
                  <LogOut style={{ width:16, height:16 }} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:1080, margin:"0 auto", padding:"28px 20px" }}>
        <div className="agrid" style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:20, alignItems:"start" }}>

          {/* LEFT */}
          <div style={{ position:"sticky", top:80 }}>

            {/* Profile card */}
            <div style={{ background:"linear-gradient(145deg,#0f172a 0%,#1e3a5f 60%,#2563eb 100%)", borderRadius:20, padding:"28px 24px", marginBottom:14, color:"white", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />
              <div style={{ position:"absolute", bottom:-30, left:-20, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.03)" }} />
              <div style={{ position:"relative", zIndex:1 }}>
                <div style={{ width:68, height:68, borderRadius:18, background:"rgba(255,255,255,0.15)", border:"2px solid rgba(255,255,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.6rem", fontWeight:700, fontFamily:"'Fraunces',serif", marginBottom:14 }}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>

                {isEditing ? (
                  <input value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} className="profile-input" style={{ fontSize:"1.05rem", fontWeight:600, marginBottom:4 }} placeholder="Your name" />
                ) : (
                  <div style={{ fontFamily:"'Fraunces',serif", fontSize:"1.15rem", fontWeight:700, marginBottom:2 }}>{user?.name}</div>
                )}

                <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:20, padding:"3px 10px", marginBottom:14 }}>
                  <Shield style={{ width:11, height:11, color:"#93c5fd" }} />
                  <span style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.85)", fontWeight:600, letterSpacing:"0.04em" }}>ADMINISTRATOR</span>
                </div>

                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <div className="info-tile" style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Mail style={{ width:14, height:14, opacity:0.7, flexShrink:0 }} />
                    <div>
                      <div style={{ fontSize:"0.62rem", opacity:0.55, marginBottom:1 }}>Email</div>
                      <div style={{ fontSize:"0.82rem", opacity:0.9 }}>{user?.email}</div>
                    </div>
                  </div>

                  <div className="info-tile" style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Activity style={{ width:14, height:14, opacity:0.7, flexShrink:0 }} />
                    <div>
                      <div style={{ fontSize:"0.62rem", opacity:0.55, marginBottom:1 }}>Last Login</div>
                      <div style={{ fontSize:"0.82rem", opacity:0.9 }}>
                        {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "Current session"}
                      </div>
                    </div>
                  </div>

                  <div className="info-tile" style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Settings style={{ width:14, height:14, opacity:0.7, flexShrink:0 }} />
                    <div>
                      <div style={{ fontSize:"0.62rem", opacity:0.55, marginBottom:1 }}>Permissions</div>
                      <div style={{ fontSize:"0.75rem", opacity:0.85, lineHeight:1.5 }}>Verify Providers · Manage Users</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop:16, display:"flex", gap:8 }}>
                  {!isEditing ? (
                    <button onClick={()=>setIsEditing(true)}
                      style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"10px", borderRadius:12, background:"rgba(255,255,255,0.15)", border:"1.5px solid rgba(255,255,255,0.25)", color:"white", cursor:"pointer", fontSize:"0.85rem", fontWeight:500, fontFamily:"'DM Sans',sans-serif" }}>
                      <Edit2 style={{ width:14, height:14 }} /> Edit Profile
                    </button>
                  ) : (
                    <>
                      <button onClick={handleSave} disabled={saving}
                        style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"10px", borderRadius:12, background:"#22c55e", border:"none", color:"white", cursor:"pointer", fontSize:"0.85rem", fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>
                        <Check style={{ width:14, height:14 }} /> {saving?"Saving...":"Save"}
                      </button>
                      <button onClick={()=>{ setIsEditing(false); setFormData({name:user?.name||"",email:user?.email||""}); }}
                        style={{ width:42, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:12, background:"rgba(255,255,255,0.15)", border:"1.5px solid rgba(255,255,255,0.25)", color:"white", cursor:"pointer" }}>
                        <X style={{ width:15, height:15 }} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div style={{ background:"white", borderRadius:16, border:"1.5px solid #f1f5f9", overflow:"hidden" }}>
              {[
                { label:"Admin Dashboard",    path:"/admin-dashboard",   icon:BarChart2  },
                { label:"Pending Approvals",  path:"/admin-dashboard",   icon:Clock      },
                { label:"Platform Settings",  path:null,                 icon:Settings   },
              ].map(({ label, path, icon: Icon }, i) => (
                <div key={label} className="quick-link" onClick={() => path && navigate(path)}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Icon style={{ width:16, height:16, color:"#2563eb" }} />
                    <span style={{ fontSize:"0.875rem", color:"#374151", fontWeight:500 }}>{label}</span>
                  </div>
                  {path && <ChevronRight style={{ width:15, height:15, color:"#94a3b8" }} />}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div>
            {/* Stats */}
            <div className="asgrid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
              {adminStats.map(({label,value,icon:Icon,color,bg}) => (
                <div key={label} className="astat-card">
                  <div style={{ width:38, height:38, borderRadius:10, background:bg, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
                    <Icon style={{ width:18, height:18, color }} />
                  </div>
                  <div style={{ fontFamily:"'Fraunces',serif", fontSize:"1.8rem", fontWeight:700, color:"#0f172a", lineHeight:1 }}>{value}</div>
                  <div style={{ fontSize:"0.72rem", color:"#94a3b8", marginTop:4, fontWeight:500 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Pending providers section */}
            <div style={{ background:"white", borderRadius:18, padding:24, marginBottom:14, border:"1.5px solid #f1f5f9" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
                <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:"1.1rem", fontWeight:700, color:"#0f172a" }}>Pending Applications</h2>
                <button onClick={()=>navigate("/admin-dashboard")}
                  style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 14px", borderRadius:10, border:"1.5px solid #e2e8f0", background:"white", cursor:"pointer", fontSize:"0.78rem", color:"#2563eb", fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>
                  View All <ChevronRight style={{ width:14, height:14 }} />
                </button>
              </div>

              {loadingStats ? (
                <div style={{ textAlign:"center", padding:"30px 0", color:"#94a3b8", fontSize:"0.875rem" }}>Loading...</div>
              ) : recentProviders.length === 0 ? (
                <div style={{ textAlign:"center", padding:"40px 0" }}>
                  <CheckCircle style={{ width:40, height:40, color:"#86efac", margin:"0 auto 12px" }} />
                  <p style={{ fontWeight:600, color:"#374151", marginBottom:4 }}>All caught up!</p>
                  <p style={{ fontSize:"0.82rem", color:"#94a3b8" }}>No pending applications right now.</p>
                </div>
              ) : (
                recentProviders.map(p => (
                  <div key={p._id} className="prov-row">
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ width:42, height:42, borderRadius:12, background:"linear-gradient(135deg,#2563eb,#1d4ed8)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontFamily:"'Fraunces',serif", flexShrink:0 }}>
                        {p.name[0]}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600, fontSize:"0.9rem", color:"#0f172a", marginBottom:2 }}>{p.name}</div>
                        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                          <span style={{ fontSize:"0.75rem", color:"#64748b" }}>{p.serviceCategory}</span>
                          <span style={{ fontSize:"0.75rem", color:"#64748b" }}>· {p.city}</span>
                          <span style={{ fontSize:"0.75rem", color:"#64748b" }}>· {p.experience} yrs</span>
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={()=>navigate("/admin-dashboard")}
                          style={{ padding:"6px 14px", borderRadius:9, border:"none", background:"#dcfce7", color:"#15803d", fontSize:"0.75rem", fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                          Review
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Admin info card */}
            <div style={{ background:"linear-gradient(135deg,#f8fafc,#eff6ff)", borderRadius:18, padding:24, border:"1.5px solid #dbeafe" }}>
              <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:"1rem", fontWeight:700, color:"#0f172a", marginBottom:16 }}>Admin Capabilities</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {[
                  { icon:"✅", label:"Approve Providers",    desc:"Review and verify new service providers"        },
                  { icon:"❌", label:"Reject Applications",  desc:"Decline with reason and notify provider"        },
                  { icon:"👥", label:"Manage Users",         desc:"View all registered users on platform"          },
                  { icon:"📊", label:"Platform Analytics",   desc:"Monitor bookings and service performance"       },
                  { icon:"🔒", label:"Security Control",     desc:"Manage admin keys and access levels"            },
                  { icon:"📧", label:"Notifications",        desc:"Send updates to providers and users"            },
                ].map(({icon,label,desc})=>(
                  <div key={label} style={{ background:"white", borderRadius:12, padding:"12px 14px", border:"1px solid #e2e8f0" }}>
                    <div style={{ fontSize:"1rem", marginBottom:6 }}>{icon}</div>
                    <div style={{ fontWeight:600, fontSize:"0.8rem", color:"#0f172a", marginBottom:3 }}>{label}</div>
                    <div style={{ fontSize:"0.72rem", color:"#94a3b8", lineHeight:1.4 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
