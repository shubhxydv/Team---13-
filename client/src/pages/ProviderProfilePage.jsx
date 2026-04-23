import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Mail, Phone, MapPin, LogOut, Edit2, Check, X,
  ChevronRight, ChevronDown, Briefcase, Star,
  Clock, CheckCircle, XCircle, Calendar, TrendingUp,
  AlertCircle, Wrench, Package, BarChart2
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const STATUS_STYLE = {
  pending:   { bg:"#fef9c3", color:"#92400e", dot:"#f59e0b", label:"Pending"   },
  confirmed: { bg:"#dcfce7", color:"#15803d", dot:"#22c55e", label:"Confirmed" },
  completed: { bg:"#dbeafe", color:"#1d4ed8", dot:"#3b82f6", label:"Completed" },
  cancelled: { bg:"#fee2e2", color:"#dc2626", dot:"#ef4444", label:"Cancelled" },
};

const FILTERS = ["all", "pending", "confirmed", "completed"];

export function ProviderProfilePage() {
  const { user, token, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [bookings,     setBookings]     = useState([]);
  const [filter,       setFilter]       = useState("all");
  const [isEditing,    setIsEditing]    = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [loadingB,     setLoadingB]     = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "", phone: "", serviceDescription: "",
  });

  useEffect(() => {
    if (user) setFormData({ name: user.name||"", phone: user.phone||"", serviceDescription: user.serviceDescription||"" });

    const fetchBookings = async () => {
      try {
        const res  = await fetch(`${API}/bookings/provider-bookings/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setBookings(data.bookings || []);
        else setBookings([]);
      } catch { setBookings([]); } finally { setLoadingB(false); }
    };
    fetchBookings();
  }, [user, token]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = bookings.filter(b => {
    if (filter === "all")       return true;
    if (filter === "pending")   return b.status === "pending";
    if (filter === "confirmed") return b.status === "confirmed";
    if (filter === "completed") return b.status === "completed";
    return true;
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      const res  = await fetch(`${API}/auth/update-profile`, {
        method:"PUT",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message||"Failed");
      if (data.user) {
        updateUser(data.user);
        setFormData({ name:data.user.name||"", phone:data.user.phone||"", serviceDescription:data.user.serviceDescription||"" });
      }
      setIsEditing(false);
    } catch(err) { alert(err.message); } finally { setSaving(false); }
  };

  const earnings   = bookings.filter(b=>b.status==="completed").reduce((s,b)=>s+(b.amount||0),0);
  const statsCards = [
    { label:"Total",     value: bookings.length,                                        icon:Package,     color:"#2563eb", bg:"#eff6ff" },
    { label:"Pending",   value: bookings.filter(b=>b.status==="pending").length,        icon:Clock,       color:"#d97706", bg:"#fef9c3" },
    { label:"Completed", value: bookings.filter(b=>b.status==="completed").length,      icon:CheckCircle, color:"#15803d", bg:"#dcfce7" },
    { label:"Earnings",  value: `₹${earnings}`,                                        icon:TrendingUp,  color:"#7c3aed", bg:"#ede9fe" },
  ];

  // Unverified screen
  if (!user?.isVerified) return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
      <nav style={{ background:"linear-gradient(135deg,#0f172a,#1e3a5f)", padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontFamily:"'Fraunces',serif", fontWeight:700, color:"white", fontSize:"1.05rem" }}>UrbanEase Provider</span>
        <button onClick={logout} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:10, border:"none", background:"rgba(239,68,68,0.15)", cursor:"pointer", fontSize:"0.82rem", color:"#fca5a5", fontFamily:"'DM Sans',sans-serif" }}>
          <LogOut style={{ width:14, height:14 }} /> Logout
        </button>
      </nav>
      <div style={{ maxWidth:500, margin:"80px auto", padding:"0 20px", textAlign:"center" }}>
        <div style={{ width:80, height:80, borderRadius:"50%", background:"#fef9c3", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
          <AlertCircle style={{ width:40, height:40, color:"#d97706" }} />
        </div>
        <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:"1.5rem", fontWeight:700, color:"#0f172a", marginBottom:8 }}>
          {user?.verificationStatus==="rejected" ? "Application Rejected" : "Awaiting Verification"}
        </h2>
        <p style={{ color:"#64748b", fontSize:"0.875rem", lineHeight:1.7 }}>
          {user?.verificationStatus==="rejected"
            ? `Your application was not approved. Reason: ${user?.rejectionReason||"Not specified"}.`
            : "Your account is under review by our admin team. This usually takes 24-48 hours."}
        </p>
        <button onClick={logout} style={{ marginTop:24, width:"100%", background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:12, padding:13, fontSize:"0.875rem", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", color:"#374151" }}>Logout</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#f1f5f9", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        .profile-input { background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.3); border-radius:10px; padding:8px 12px; color:white; font-size:0.875rem; outline:none; width:100%; font-family:'DM Sans',sans-serif; transition:border-color 0.2s; box-sizing:border-box; }
        .profile-input:focus { border-color:rgba(255,255,255,0.7); }
        .profile-input::placeholder { color:rgba(255,255,255,0.5); }
        .pstat-card { border-radius:14px; padding:16px 14px; background:white; border:1.5px solid #f1f5f9; transition:all 0.2s; }
        .pstat-card:hover { transform:translateY(-2px); box-shadow:0 4px 12px rgba(0,0,0,0.06); }
        .brow { background:white; border-radius:14px; padding:16px 18px; border:1.5px solid #f1f5f9; margin-bottom:10px; transition:border-color 0.2s; }
        .brow:hover { border-color:#bfdbfe; }
        .fpill { padding:6px 16px; border-radius:20px; font-size:0.8rem; font-weight:500; cursor:pointer; transition:all 0.2s; border:1.5px solid transparent; font-family:'DM Sans',sans-serif; text-transform:capitalize; }
        .fpill.active { background:#2563eb; color:white; border-color:#2563eb; }
        .fpill.inactive { background:white; color:#64748b; border-color:#e2e8f0; }
        .fpill.inactive:hover { border-color:#2563eb; color:#2563eb; }
        .info-tile { background:rgba(255,255,255,0.1); border-radius:12px; padding:10px 14px; }
        .quick-link { display:flex; align-items:center; justify-content:space-between; padding:14px 18px; cursor:pointer; border-bottom:1px solid #f1f5f9; transition:background 0.15s; }
        .quick-link:last-child { border-bottom:none; }
        .quick-link:hover { background:#f8fafc; }
        .textarea-input { background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.25); border-radius:10px; padding:8px 12px; color:white; font-size:0.82rem; outline:none; width:100%; font-family:'DM Sans',sans-serif; resize:none; box-sizing:border-box; line-height:1.5; }
        .textarea-input:focus { border-color:rgba(255,255,255,0.6); }
        .textarea-input::placeholder { color:rgba(255,255,255,0.45); }
        @media(max-width:768px){ .pgrid{ grid-template-columns:1fr !important; } .sgrid{ grid-template-columns:1fr 1fr !important; } }
      `}</style>

      {/* Navbar */}
      <nav style={{ background:"linear-gradient(135deg,#0f172a,#1e3a5f)", padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"#2563eb", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Wrench style={{ width:14, height:14, color:"white" }} />
          </div>
          <span style={{ fontFamily:"'Fraunces',serif", fontWeight:700, color:"white", fontSize:"1.05rem" }}>UrbanEase</span>
          <span style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:20, padding:"2px 8px", fontSize:"0.65rem", color:"rgba(255,255,255,0.7)", fontWeight:600 }}>Provider</span>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={()=>navigate("/provider-dashboard")}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.2)", background:"rgba(255,255,255,0.08)", cursor:"pointer", fontSize:"0.82rem", color:"rgba(255,255,255,0.9)", fontFamily:"'DM Sans',sans-serif" }}>
            <BarChart2 style={{ width:14, height:14, color:"#93c5fd" }} /> Dashboard
          </button>

          <div ref={dropdownRef} style={{ position:"relative" }}>
            <button onClick={()=>setDropdownOpen(v=>!v)}
              style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:24, padding:"5px 12px 5px 6px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}
              onMouseOver={e=>e.currentTarget.style.background="rgba(255,255,255,0.15)"}
              onMouseOut={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#2563eb,#60a5fa)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.75rem", fontWeight:700, color:"white", flexShrink:0 }}>
                {(user?.name?.[0]||"P").toUpperCase()}
              </div>
              <span style={{ fontSize:"0.82rem", fontWeight:500, color:"rgba(255,255,255,0.9)" }}>{user?.name?.split(" ")[0]||"Provider"}</span>
              <ChevronDown style={{ width:13, height:13, color:"rgba(255,255,255,0.5)", transform:dropdownOpen?"rotate(180deg)":"none", transition:"transform 0.2s" }} />
            </button>

            {dropdownOpen && (
              <div style={{ position:"absolute", right:0, top:"calc(100% + 8px)", background:"white", borderRadius:14, minWidth:190, boxShadow:"0 8px 32px rgba(0,0,0,0.15)", border:"1px solid #f1f5f9", overflow:"hidden", zIndex:200 }}>
                <div style={{ padding:"14px 16px", borderBottom:"1px solid #f8fafc", background:"#fafbff" }}>
                  <div style={{ fontSize:"0.82rem", fontWeight:700, color:"#0f172a" }}>{user?.name}</div>
                  <div style={{ fontSize:"0.72rem", color:"#94a3b8", marginTop:2 }}>{user?.email}</div>
                  <div style={{ fontSize:"0.65rem", background:"#dcfce7", color:"#15803d", padding:"2px 8px", borderRadius:20, display:"inline-block", marginTop:4, fontWeight:700 }}>✓ Verified Provider</div>
                </div>
                <button onClick={()=>{ setDropdownOpen(false); logout(); }}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"11px 16px", background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:"0.85rem", color:"#ef4444", textAlign:"left", transition:"background 0.15s" }}
                  onMouseOver={e=>e.currentTarget.style.background="#fef2f2"}
                  onMouseOut={e=>e.currentTarget.style.background="none"}>
                  <LogOut style={{ width:16, height:16 }} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:1080, margin:"0 auto", padding:"28px 20px" }}>
        <div className="pgrid" style={{ display:"grid", gridTemplateColumns:"310px 1fr", gap:20, alignItems:"start" }}>

          {/* LEFT — Profile card */}
          <div style={{ position:"sticky", top:80 }}>
            <div style={{ background:"linear-gradient(145deg,#1e3a5f 0%,#2563eb 100%)", borderRadius:20, padding:"28px 24px", marginBottom:14, color:"white", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
              <div style={{ position:"absolute", bottom:-30, left:-20, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />
              <div style={{ position:"relative", zIndex:1 }}>

                {/* Avatar + verified badge */}
                <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:14 }}>
                  <div style={{ width:68, height:68, borderRadius:18, background:"rgba(255,255,255,0.2)", border:"2px solid rgba(255,255,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.6rem", fontWeight:700, fontFamily:"'Fraunces',serif", flexShrink:0 }}>
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ paddingTop:4 }}>
                    <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(34,197,94,0.2)", border:"1px solid rgba(34,197,94,0.35)", borderRadius:20, padding:"3px 10px" }}>
                      <CheckCircle style={{ width:11, height:11, color:"#86efac" }} />
                      <span style={{ fontSize:"0.65rem", color:"#86efac", fontWeight:700 }}>VERIFIED</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:6 }}>
                      <Star style={{ width:13, height:13, color:"#fde68a", fill:"#fde68a" }} />
                      <span style={{ fontSize:"0.82rem", color:"rgba(255,255,255,0.9)", fontWeight:500 }}>
                        {user?.rating > 0 ? user.rating.toFixed(1) : "New"} · {user?.totalReviews||0} reviews
                      </span>
                    </div>
                  </div>
                </div>

                {isEditing ? (
                  <input value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})}
                    className="profile-input" style={{ fontSize:"1.05rem", fontWeight:600, marginBottom:4 }} placeholder="Your name" />
                ) : (
                  <div style={{ fontFamily:"'Fraunces',serif", fontSize:"1.1rem", fontWeight:700, marginBottom:2 }}>{user?.name}</div>
                )}
                <div style={{ fontSize:"0.78rem", opacity:0.7, marginBottom:14 }}>{user?.serviceCategory} · {user?.city}</div>

                {/* Info fields */}
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <div className="info-tile" style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Phone style={{ width:13, height:13, opacity:0.7, flexShrink:0 }} />
                    {isEditing ? (
                      <input value={formData.phone} onChange={e=>setFormData({...formData,phone:e.target.value})}
                        className="profile-input" style={{ padding:0, background:"transparent", border:"none" }} placeholder="Phone number" />
                    ) : (
                      <div>
                        <div style={{ fontSize:"0.6rem", opacity:0.55, marginBottom:1 }}>Phone</div>
                        <div style={{ fontSize:"0.82rem" }}>{user?.phone||"Not added"}</div>
                      </div>
                    )}
                  </div>

                  <div className="info-tile" style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                    <MapPin style={{ width:13, height:13, opacity:0.7, flexShrink:0, marginTop:2 }} />
                    <div>
                      <div style={{ fontSize:"0.6rem", opacity:0.55, marginBottom:1 }}>Address</div>
                      <div style={{ fontSize:"0.82rem", lineHeight:1.4 }}>{user?.address||user?.city||"Not added"}</div>
                    </div>
                  </div>

                  <div className="info-tile" style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Briefcase style={{ width:13, height:13, opacity:0.7, flexShrink:0 }} />
                    <div>
                      <div style={{ fontSize:"0.6rem", opacity:0.55, marginBottom:1 }}>Experience</div>
                      <div style={{ fontSize:"0.82rem" }}>{user?.experience||0} years in {user?.serviceCategory}</div>
                    </div>
                  </div>

                  <div className="info-tile" style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Mail style={{ width:13, height:13, opacity:0.55, flexShrink:0 }} />
                    <div>
                      <div style={{ fontSize:"0.6rem", opacity:0.5, marginBottom:1 }}>Email</div>
                      <div style={{ fontSize:"0.78rem", opacity:0.8 }}>{user?.email}</div>
                    </div>
                  </div>

                  {/* Service description — editable */}
                  <div className="info-tile">
                    <div style={{ fontSize:"0.6rem", opacity:0.55, marginBottom:6 }}>About / Service Description</div>
                    {isEditing ? (
                      <textarea value={formData.serviceDescription} onChange={e=>setFormData({...formData,serviceDescription:e.target.value})}
                        className="textarea-input" rows={3} placeholder="Describe your services..." />
                    ) : (
                      <div style={{ fontSize:"0.78rem", opacity:0.85, lineHeight:1.5 }}>
                        {user?.serviceDescription||"No description added yet."}
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit buttons */}
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
                      <button onClick={()=>{ setIsEditing(false); setFormData({name:user?.name||"",phone:user?.phone||"",serviceDescription:user?.serviceDescription||""}); }}
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
                { label:"My Dashboard",      path:"/provider-dashboard", icon:BarChart2 },
                { label:"My Bookings",       path:null,                  icon:Package  },
                { label:"My Service Area",   path:null,                  icon:MapPin   },
              ].map(({ label, path, icon: Icon }, i) => (
                <div key={label} className="quick-link" onClick={()=>path&&navigate(path)}>
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
            <div className="sgrid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
              {statsCards.map(({label,value,icon:Icon,color,bg})=>(
                <div key={label} className="pstat-card">
                  <div style={{ width:38, height:38, borderRadius:10, background:bg, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
                    <Icon style={{ width:18, height:18, color }} />
                  </div>
                  <div style={{ fontFamily:"'Fraunces',serif", fontSize:"1.7rem", fontWeight:700, color:"#0f172a", lineHeight:1 }}>{value}</div>
                  <div style={{ fontSize:"0.72rem", color:"#94a3b8", marginTop:4, fontWeight:500 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Filter + heading */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:10 }}>
              <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:"1.1rem", fontWeight:700, color:"#0f172a" }}>
                {filter==="all"?"All Bookings":filter==="pending"?"Pending":filter==="confirmed"?"Confirmed":"Completed"}
              </h2>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {FILTERS.map(f=>(
                  <button key={f} className={`fpill ${filter===f?"active":"inactive"}`} onClick={()=>setFilter(f)}>{f}</button>
                ))}
              </div>
            </div>

            {/* Booking rows */}
            {loadingB ? (
              <div style={{ textAlign:"center", padding:"60px 0", color:"#94a3b8" }}>
                <div style={{ fontSize:"2rem", marginBottom:10 }}>⏳</div>Loading your bookings...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px", background:"white", borderRadius:16, border:"1.5px solid #f1f5f9" }}>
                <Package style={{ width:44, height:44, color:"#cbd5e1", margin:"0 auto 14px" }} />
                <p style={{ fontWeight:600, color:"#374151", marginBottom:6 }}>No bookings found</p>
                <p style={{ fontSize:"0.85rem", color:"#94a3b8" }}>
                  {filter==="all"?"No bookings yet. Once customers book, they appear here.":`No ${filter} bookings.`}
                </p>
              </div>
            ) : (
              filtered.map(b => {
                const st = STATUS_STYLE[b.status] || STATUS_STYLE.pending;
                return (
                  <div key={b._id} className="brow">
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:"0.95rem", color:"#0f172a", marginBottom:2 }}>{b.serviceCategory}</div>
                        <div style={{ fontSize:"0.78rem", color:"#64748b" }}>
                          Customer: <strong>{b.user?.name||"—"}</strong> · {b.user?.phone||"—"}
                        </div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <div style={{ width:7, height:7, borderRadius:"50%", background:st.dot }} />
                        <span style={{ background:st.bg, color:st.color, fontSize:"0.68rem", fontWeight:700, padding:"3px 10px", borderRadius:20 }}>{st.label}</span>
                      </div>
                    </div>

                    <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:10 }}>
                      <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.78rem", color:"#64748b" }}>
                        <Calendar style={{ width:12, height:12 }} />{b.date}
                      </span>
                      <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.78rem", color:"#64748b" }}>
                        <Clock style={{ width:12, height:12 }} />{b.timeSlot}
                      </span>
                      {b.address && (
                        <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.78rem", color:"#64748b" }}>
                          <MapPin style={{ width:12, height:12 }} />
                          {b.address.slice(0,35)}{b.address.length>35?"...":""}
                        </span>
                      )}
                    </div>

                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:10, borderTop:"1px solid #f8fafc" }}>
                      <span style={{ fontFamily:"'Fraunces',serif", fontSize:"1rem", fontWeight:700, color:"#0f172a" }}>₹{b.amount}</span>
                      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        <span style={{ fontSize:"0.7rem", fontWeight:600, color:b.paymentStatus==="paid"?"#15803d":"#92400e", background:b.paymentStatus==="paid"?"#dcfce7":"#fef9c3", padding:"3px 10px", borderRadius:20 }}>
                          {b.paymentStatus==="paid"?"✓ Paid":"⏳ Pending"}
                        </span>
                        <button onClick={()=>navigate("/provider-dashboard")}
                          style={{ padding:"4px 12px", borderRadius:8, border:"1.5px solid #e2e8f0", background:"white", cursor:"pointer", fontSize:"0.72rem", color:"#2563eb", fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>
                          Manage
                        </button>
                      </div>
                    </div>
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