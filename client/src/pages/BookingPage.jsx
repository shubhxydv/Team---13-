import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Star, Briefcase, Calendar as CalIcon,
  Clock, FileText, ChevronRight, Plus, Minus, Phone, ChevronLeft
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const PRICE_PER_HOUR = {
  Cleaning: 199, Plumbing: 349, Electrical: 399, Carpentry: 449,
  Painting: 299, "Appliance Repair": 379, "AC Repair": 499,
  "Pest Control": 599, Gardening: 249, Security: 449,
  "Interior Design": 799, Locksmith: 299, Other: 299,
};

const SUBCATS = {
  Cleaning:          ["Regular Cleaning","Deep Cleaning","Sofa Cleaning","Carpet Cleaning","Kitchen Cleaning","Bathroom Cleaning"],
  Plumbing:          ["Leak Repair","Pipe Fitting","Tap Installation","Drain Cleaning","Water Tank Cleaning","Geyser Installation"],
  Electrical:        ["Fan Installation","Switch Repair","Wiring","MCB/Fuse","Light Fitting","Inverter Installation"],
  Carpentry:         ["Furniture Repair","Door Fixing","Cabinet Installation","Custom Furniture","Window Repair","Wardrobe Fitting"],
  Painting:          ["Wall Painting","Waterproofing","Texture Painting","Wood Polish","Exterior Painting","Whitewash"],
  "Appliance Repair":["Washing Machine","Refrigerator","Microwave","TV Repair","Dishwasher","Water Purifier"],
  "AC Repair":       ["AC Service","AC Installation","Gas Refill","AC Repair","Duct Cleaning","Thermostat Fix"],
  "Pest Control":    ["Cockroach Control","Termite Control","Bed Bug Control","Rodent Control","Mosquito Control","Ant Control"],
  Gardening:         ["Lawn Mowing","Tree Trimming","Garden Setup","Plant Care","Soil Treatment","Irrigation Setup"],
  Security:          ["CCTV Installation","Lock Repair","Door Lock","Alarm System","Video Doorbell","Gate Automation"],
  "Interior Design": ["Room Design","Space Planning","Decor Consultation","Modular Kitchen","False Ceiling","Wallpaper"],
  Locksmith:         ["Lock Change","Key Duplicate","Locker Repair","Car Key","Safe Opening","Padlock Replacement"],
  Other:             ["Other Services"],
};

const TIME_SLOTS = ["8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM"];
const MONTHS     = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS       = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function CalendarPicker({ selectedDate, onSelect }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const [view, setView] = useState({ month: today.getMonth(), year: today.getFullYear() });

  const firstDay    = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();

  const prevMonth = () => view.month === 0 ? setView({ month:11, year: view.year-1 }) : setView({...view, month: view.month-1});
  const nextMonth = () => view.month === 11? setView({ month:0,  year: view.year+1 }) : setView({...view, month: view.month+1});

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ borderRadius: 16, overflow: "hidden", border: "2px solid #e2e8f0" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0f172a,#2563eb)", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={prevMonth} style={{ width:32, height:32, borderRadius:8, border:"1px solid rgba(255,255,255,0.2)", background:"rgba(255,255,255,0.1)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}>
          <ChevronLeft style={{ width:16, height:16 }} />
        </button>
        <span style={{ fontFamily:"'Fraunces',serif", fontWeight:700, color:"white", fontSize:"1rem" }}>
          {MONTHS[view.month]} {view.year}
        </span>
        <button onClick={nextMonth} style={{ width:32, height:32, borderRadius:8, border:"1px solid rgba(255,255,255,0.2)", background:"rgba(255,255,255,0.1)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}>
          <ChevronRight style={{ width:16, height:16 }} />
        </button>
      </div>
      {/* Day names */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", background:"#f8fafc", padding:"8px 8px 0" }}>
        {DAYS.map(d => <div key={d} style={{ textAlign:"center", fontSize:"0.65rem", fontWeight:700, color:"#94a3b8", padding:"4px 0", textTransform:"uppercase", letterSpacing:"0.04em" }}>{d}</div>)}
      </div>
      {/* Dates */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, padding:"6px 8px 12px", background:"white" }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const date    = new Date(view.year, view.month, day);
          const isPast  = date < today;
          const dateStr = `${view.year}-${String(view.month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const isSel   = selectedDate === dateStr;
          const isTod   = date.getTime() === today.getTime();
          return (
            <button key={day} disabled={isPast} onClick={() => !isPast && onSelect(dateStr)}
              style={{ width:"100%", aspectRatio:"1", borderRadius:10, border:"none",
                background: isSel ? "#2563eb" : isTod ? "#eff6ff" : "transparent",
                color: isSel ? "white" : isPast ? "#d1d5db" : isTod ? "#2563eb" : "#0f172a",
                fontWeight: isSel || isTod ? 700 : 400, fontSize:"0.875rem",
                cursor: isPast ? "not-allowed" : "pointer", transition:"all 0.15s",
                outline: isTod && !isSel ? "2px solid #bfdbfe" : "none",
              }}
              onMouseEnter={e => { if(!isPast && !isSel) e.currentTarget.style.background="#eff6ff"; }}
              onMouseLeave={e => { if(!isPast && !isSel) e.currentTarget.style.background="transparent"; }}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function BookingPage() {
  const { providerId }  = useParams();
  const navigate        = useNavigate();
  const { token, user } = useAuth();

  const [provider,     setProvider]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [startSlot,    setStartSlot]    = useState("");
  const [hours,        setHours]        = useState(1);
  const [address,      setAddress]      = useState(user?.address || "");
  const [instructions, setInstructions] = useState("");
  const [subcategory,  setSubcategory]  = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState("");

  const renderAverageStars = (rating) => {
    const filled = Math.round(rating || 0);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            style={{
              width: 14,
              height: 14,
              color: "#facc15",
              fill: star <= filled ? "#facc15" : "transparent",
              strokeWidth: 2,
            }}
          />
        ))}
      </div>
    );
  };

  useEffect(() => {
    const f = async () => {
      try {
        const res = await fetch(`${API}/services/provider/${providerId}`);
        const d   = await res.json();
        if (d.success) setProvider(d.provider);
      } catch(e){ console.error(e); } finally { setLoading(false); }
    };
    f();
  }, [providerId]);

  const pricePerHour = provider ? (PRICE_PER_HOUR[provider.serviceCategory] || 299) : 299;
  const subtotal     = pricePerHour * hours;
  const total        = subtotal + 49;
  const subcats      = provider ? (SUBCATS[provider.serviceCategory] || []) : [];

  const getEndTime = () => {
    if (!startSlot) return "";
    const idx = TIME_SLOTS.indexOf(startSlot);
    return TIME_SLOTS[idx + hours] || "End of day";
  };

  const handleBook = async () => {
    if (!selectedDate || !startSlot || !address.trim()) {
      setError("Please select a date, start time, and enter your address."); return;
    }
    setSubmitting(true); setError("");
    try {
      const res  = await fetch(`${API}/bookings`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({
          providerId, serviceCategory: provider.serviceCategory,
          subcategory, date: selectedDate,
          timeSlot: `${startSlot} – ${getEndTime()} (${hours}hr)`,
          hours, address, instructions, amount: total, pricePerHour,
        }),
      });
      const data = await res.json();
      if (data.success) navigate(`/payment/${data.booking._id}`, { state:{ booking: data.booking, provider } });
      else setError(data.message);
    } catch { setError("Something went wrong."); } finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", color:"#94a3b8" }}>⏳ Loading...</div>;
  if (!provider) return <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}><div style={{ textAlign:"center" }}><p style={{ color:"#64748b" }}>Provider not found.</p><button onClick={()=>navigate("/services")} style={{ color:"#2563eb",background:"none",border:"none",cursor:"pointer" }}>← Go back</button></div></div>;

  return (
    <div style={{ minHeight:"100vh", background:"#f1f5f9", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        .sbox { background:white; border-radius:18px; padding:24px; margin-bottom:14px; border:1.5px solid #f1f5f9; }
        .slot-chip { border:2px solid #e2e8f0; border-radius:10px; padding:9px 14px; cursor:pointer; font-size:0.82rem; transition:all 0.2s; background:white; white-space:nowrap; font-family:'DM Sans',sans-serif; }
        .slot-chip:hover { border-color:#93c5fd; }
        .slot-chip.active { border-color:#2563eb; background:#eff6ff; color:#1d4ed8; font-weight:600; }
        .ifield { width:100%; padding:12px 14px; border:2px solid #e2e8f0; border-radius:12px; font-size:0.9rem; outline:none; font-family:'DM Sans',sans-serif; color:#0f172a; transition:border-color 0.2s; background:#f8fafc; box-sizing:border-box; resize:none; }
        .ifield:focus { border-color:#2563eb; background:white; }
        .sel { width:100%; padding:12px 14px; border:2px solid #e2e8f0; border-radius:12px; font-size:0.9rem; outline:none; cursor:pointer; font-family:'DM Sans',sans-serif; color:#0f172a; background:#f8fafc; box-sizing:border-box; }
        .sel:focus { border-color:#2563eb; background:white; }
        .bkbtn { width:100%; background:linear-gradient(135deg,#2563eb,#1d4ed8); color:white; border:none; border-radius:14px; padding:16px; font-size:1rem; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; box-shadow:0 4px 20px rgba(37,99,235,0.35); display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s; }
        .bkbtn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 28px rgba(37,99,235,0.45); }
        .bkbtn:disabled { opacity:0.7; cursor:not-allowed; }
        .hbtn { width:36px; height:36px; border-radius:10px; border:2px solid #e2e8f0; background:white; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; color:#374151; }
        .hbtn:hover { border-color:#2563eb; color:#2563eb; }
        @media(max-width:768px){ .blayout{ grid-template-columns:1fr !important; } }
      `}</style>

      {/* Navbar */}
      <div style={{ background:"rgba(7,20,50,0.7)", padding:"0 20px", height:60, display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:50 }}>
        <button onClick={()=>navigate(-1)} style={{ border:"1px solid rgba(255,255,255,0.2)", background:"rgba(255,255,255,0.08)", cursor:"pointer", display:"flex", alignItems:"center", gap:6, color:"rgba(255,255,255,0.85)", fontSize:"0.875rem", fontFamily:"'DM Sans',sans-serif", padding:"6px 12px", borderRadius:8 }}>
          <ArrowLeft style={{ width:16, height:16 }} /> Back
        </button>
        <span style={{ color:"rgba(255,255,255,0.3)" }}>|</span>
        <span style={{ fontFamily:"'Fraunces',serif", fontWeight:700, color:"white" }}>Book Service</span>
      </div>

      <div style={{ maxWidth:1000, margin:"0 auto", padding:"24px 16px" }}>
        <div className="blayout" style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:20, alignItems:"start" }}>

          {/* LEFT */}
          <div>
            {/* Provider hero card */}
            <div style={{ background:"linear-gradient(135deg,#0f172a,#1e3a5f,#2563eb)", borderRadius:18, padding:24, marginBottom:14 }}>
              <div style={{ display:"flex", gap:16, alignItems:"center" }}>
                <div style={{ width:64, height:64, borderRadius:16, background:"rgba(255,255,255,0.15)", border:"2px solid rgba(255,255,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.5rem", fontWeight:700, color:"white", fontFamily:"'Fraunces',serif", flexShrink:0 }}>
                  {provider.name[0]}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                    <span style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:"1.1rem", color:"white" }}>{provider.name}</span>
                    <span style={{ background:"rgba(34,197,94,0.2)", color:"#86efac", fontSize:"0.68rem", fontWeight:600, padding:"2px 8px", borderRadius:20, border:"1px solid rgba(34,197,94,0.3)" }}>✓ Verified</span>
                  </div>
                  <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                    {[{I:Briefcase,t:provider.serviceCategory},{I:MapPin,t:provider.city},{I:Phone,t:provider.phone}].map(({I,t})=>(
                      <span key={t} style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.78rem", color:"rgba(255,255,255,0.75)" }}>
                        <I style={{ width:12, height:12 }} />{t}
                      </span>
                    ))}
                    <span style={{ display:"flex", alignItems:"center", gap:6, fontSize:"0.78rem", color:"rgba(255,255,255,0.9)" }}>
                      {renderAverageStars(provider.rating)}
                      {provider.rating > 0 ? `${provider.rating.toFixed(1)} (${provider.totalReviews || 0} reviews)` : "New"}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontFamily:"'Fraunces',serif", fontSize:"1.5rem", fontWeight:700, color:"white" }}>₹{pricePerHour}</div>
                  <div style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.55)" }}>per hour</div>
                </div>
              </div>
              {provider.serviceDescription && (
                <div style={{ marginTop:14, padding:"10px 14px", background:"rgba(255,255,255,0.08)", borderRadius:10, fontSize:"0.78rem", color:"rgba(255,255,255,0.75)", lineHeight:1.5 }}>
                  {provider.serviceDescription}
                </div>
              )}
            </div>

            {/* Subcategory — only for this category */}
            {subcats.length > 1 && (
              <div className="sbox">
                <div style={{ display:"flex", alignItems:"center", gap:8, fontWeight:600, fontSize:"0.9rem", color:"#0f172a", marginBottom:12 }}>
                  <FileText style={{ width:16, height:16, color:"#2563eb" }} /> Specific Service
                </div>
                <select className="sel" value={subcategory} onChange={e=>setSubcategory(e.target.value)}>
                  <option value="">Choose specific service (optional)</option>
                  {subcats.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            {/* Calendar */}
            <div className="sbox">
              <div style={{ display:"flex", alignItems:"center", gap:8, fontWeight:600, fontSize:"0.9rem", color:"#0f172a", marginBottom:16 }}>
                <CalIcon style={{ width:16, height:16, color:"#2563eb" }} /> Select Date
              </div>
              <CalendarPicker selectedDate={selectedDate} onSelect={d=>{ setSelectedDate(d); setStartSlot(""); }} />
              {selectedDate && (
                <div style={{ marginTop:12, fontSize:"0.82rem", color:"#2563eb", fontWeight:600, background:"#eff6ff", padding:"8px 14px", borderRadius:10, display:"flex", alignItems:"center", gap:6 }}>
                  <CalIcon style={{ width:13, height:13 }} />
                  {new Date(selectedDate+"T00:00:00").toLocaleDateString("en-IN",{ weekday:"long", day:"numeric", month:"long", year:"numeric" })}
                </div>
              )}
            </div>

            {/* Time slots — only after date */}
            {selectedDate && (
              <div className="sbox">
                <div style={{ display:"flex", alignItems:"center", gap:8, fontWeight:600, fontSize:"0.9rem", color:"#0f172a", marginBottom:16 }}>
                  <Clock style={{ width:16, height:16, color:"#2563eb" }} /> Select Start Time
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {TIME_SLOTS.map(slot=>(
                    <div key={slot} className={`slot-chip ${startSlot===slot?"active":""}`} onClick={()=>setStartSlot(slot)}>{slot}</div>
                  ))}
                </div>
                {startSlot && (
                  <div style={{ marginTop:14, padding:"10px 14px", background:"#f0fdf4", borderRadius:10, border:"1px solid #bbf7d0", fontSize:"0.82rem", color:"#15803d", fontWeight:500 }}>
                    ✓ Service: <strong>{startSlot}</strong> → <strong>{getEndTime()}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Duration — only after time selected */}
            {startSlot && (
              <div className="sbox">
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:"0.9rem", color:"#0f172a", marginBottom:2, display:"flex", alignItems:"center", gap:6 }}>
                      <Clock style={{ width:15, height:15, color:"#2563eb" }} /> Duration
                    </div>
                    <div style={{ fontSize:"0.75rem", color:"#94a3b8" }}>₹{pricePerHour}/hr · 1–8 hours</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <button className="hbtn" onClick={()=>setHours(h=>Math.max(1,h-1))}><Minus style={{ width:16, height:16 }} /></button>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontFamily:"'Fraunces',serif", fontSize:"1.6rem", fontWeight:700, color:"#0f172a", lineHeight:1 }}>{hours}</div>
                      <div style={{ fontSize:"0.65rem", color:"#94a3b8" }}>hr{hours>1?"s":""}</div>
                    </div>
                    <button className="hbtn" onClick={()=>setHours(h=>Math.min(8,h+1))}><Plus style={{ width:16, height:16 }} /></button>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, marginTop:14, flexWrap:"wrap" }}>
                  {[1,2,3,4,6,8].map(h=>(
                    <button key={h} onClick={()=>setHours(h)}
                      style={{ padding:"6px 16px", borderRadius:20, border:`2px solid ${hours===h?"#2563eb":"#e2e8f0"}`, background:hours===h?"#eff6ff":"white", color:hours===h?"#1d4ed8":"#64748b", fontSize:"0.8rem", fontWeight:hours===h?600:400, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}>
                      {h}h
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Address */}
            <div className="sbox">
              <div style={{ display:"flex", alignItems:"center", gap:8, fontWeight:600, fontSize:"0.9rem", color:"#0f172a", marginBottom:12 }}>
                <MapPin style={{ width:16, height:16, color:"#2563eb" }} /> Service Address
              </div>
              <textarea value={address} onChange={e=>setAddress(e.target.value)} placeholder="Enter your full address with landmark..." rows={3} className="ifield" />
            </div>

            {/* Instructions */}
            <div className="sbox">
              <div style={{ display:"flex", alignItems:"center", gap:8, fontWeight:600, fontSize:"0.9rem", color:"#0f172a", marginBottom:4 }}>
                <FileText style={{ width:16, height:16, color:"#2563eb" }} />
                Special Instructions
                <span style={{ fontWeight:400, color:"#94a3b8", fontSize:"0.75rem" }}>(optional)</span>
              </div>
              <p style={{ fontSize:"0.73rem", color:"#94a3b8", marginBottom:10, lineHeight:1.5 }}>Describe the issue in detail, access instructions, preferred tools, etc.</p>
              <textarea value={instructions} onChange={e=>setInstructions(e.target.value)} placeholder="e.g. Kitchen tap leaking from base, please bring extra fittings..." rows={3} className="ifield" />
            </div>
          </div>

          {/* RIGHT — Sticky summary */}
          <div style={{ position:"sticky", top:80 }}>
            <div className="sbox" style={{ border:"2px solid #dbeafe" }}>
              <div style={{ fontFamily:"'Fraunces',serif", fontSize:"1.05rem", fontWeight:700, color:"#0f172a", marginBottom:18 }}>Booking Summary</div>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px", background:"#f8fafc", borderRadius:12, marginBottom:16 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:"linear-gradient(135deg,#2563eb,#1d4ed8)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontFamily:"'Fraunces',serif", flexShrink:0 }}>{provider.name[0]}</div>
                <div>
                  <div style={{ fontWeight:600, fontSize:"0.85rem", color:"#0f172a" }}>{provider.name}</div>
                  <div style={{ fontSize:"0.72rem", color:"#64748b" }}>{provider.serviceCategory} · {provider.city}</div>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:18 }}>
                {[
                  { label:"Date",       value: selectedDate ? new Date(selectedDate+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "Not selected" },
                  { label:"Start Time", value: startSlot || "Not selected" },
                  { label:"End Time",   value: getEndTime() || "—" },
                  { label:"Duration",   value: `${hours} hr${hours>1?"s":""}` },
                  { label:"Service",    value: subcategory || provider.serviceCategory },
                ].map(({label,value})=>(
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", fontSize:"0.82rem" }}>
                    <span style={{ color:"#64748b" }}>{label}</span>
                    <span style={{ fontWeight:500, color:"#0f172a", textAlign:"right", maxWidth:"58%" }}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop:"1px dashed #e2e8f0", paddingTop:14, marginBottom:18 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.82rem", marginBottom:8 }}>
                  <span style={{ color:"#64748b" }}>₹{pricePerHour} × {hours}hr</span>
                  <span>₹{subtotal}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.82rem", marginBottom:12 }}>
                  <span style={{ color:"#64748b" }}>Platform fee</span><span>₹49</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", paddingTop:10, borderTop:"1.5px solid #e2e8f0" }}>
                  <span style={{ fontWeight:700, color:"#0f172a" }}>Total</span>
                  <span style={{ fontFamily:"'Fraunces',serif", fontSize:"1.25rem", fontWeight:700, color:"#2563eb" }}>₹{total}</span>
                </div>
              </div>
              {error && <div style={{ padding:"10px 14px", borderRadius:10, background:"#fef2f2", border:"1px solid #fecaca", color:"#dc2626", fontSize:"0.8rem", marginBottom:14 }}>⚠️ {error}</div>}
              <button className="bkbtn" onClick={handleBook} disabled={submitting}>
                {submitting ? "Processing..." : <>Proceed to Payment <ChevronRight style={{ width:18, height:18 }} /></>}
              </button>
              <p style={{ textAlign:"center", fontSize:"0.7rem", color:"#94a3b8", marginTop:10, lineHeight:1.5 }}>🔒 Charged only after payment confirmation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
