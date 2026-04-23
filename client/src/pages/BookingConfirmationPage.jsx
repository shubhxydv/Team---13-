import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeft, Download, MapPin, Clock, Calendar,
  Phone, Star, CheckCircle, Briefcase, FileText,
  Home, RefreshCw, Shield, MessageSquare
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function BookingConfirmationPage() {
  const { bookingId }     = useParams();
  const { state }         = useLocation();
  const navigate          = useNavigate();
  const { token, user }   = useAuth();

  const [booking,  setBooking]  = useState(state?.booking  || null);
  const [provider, setProvider] = useState(state?.provider || null);
  const [loading,  setLoading]  = useState(!state?.booking);
  const [reviewForm, setReviewForm] = useState({ rating: 0, feedback: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const paymentMethod = state?.paymentMethod || booking?.paymentMethod || "paid";

  useEffect(() => {
    if (!booking) {
      (async () => {
        try {
          const res  = await fetch(`${API}/bookings/${bookingId}`, { headers:{ Authorization:`Bearer ${token}` } });
          const data = await res.json();
          if (data.success) { setBooking(data.booking); setProvider(data.booking.provider); }
        } catch(e){ console.error(e); } finally { setLoading(false); }
      })();
    }
  }, [bookingId, token, booking]);

  const pName  = provider?.name  || booking?.provider?.name  || "Provider";
  const pCity  = provider?.city  || booking?.provider?.city  || "—";
  const pPhone = provider?.phone || booking?.provider?.phone || "—";
  const pCat   = provider?.serviceCategory || booking?.provider?.serviceCategory || booking?.serviceCategory || "—";
  const pExp   = provider?.experience || booking?.provider?.experience || "—";
  const pRat   = provider?.rating     || booking?.provider?.rating;

  const renderAverageStars = (rating, onSelect) => {
    const filled = onSelect ? (rating || 0) : Math.round(rating || 0);
    return (
      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onSelect?.(star)}
            style={{ border:"none", background:"none", padding:0, cursor:onSelect ? "pointer" : "default", display:"flex", alignItems:"center", justifyContent:"center" }}
          >
            <Star
              style={{
                width: onSelect ? 20 : 15,
                height: onSelect ? 20 : 15,
                color:"#facc15",
                fill: star <= filled ? "#facc15" : "transparent",
                strokeWidth:2,
              }}
            />
          </button>
        ))}
      </div>
    );
  };

  const submitReview = async () => {
    if (!reviewForm.rating) {
      window.alert("Please select a rating before submitting.");
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await fetch(`${API}/bookings/${bookingId}/review`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewForm),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to submit review");
      }
      setBooking(data.booking);
      setProvider(data.booking.provider);
      setReviewForm({ rating: 0, feedback: "" });
    } catch (error) {
      window.alert(error.message || "Unable to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDownloadPDF = () => {
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html><head>
      <meta charset="UTF-8"/>
      <title>UrbanEase Booking Receipt</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:'DM Sans',sans-serif;color:#0f172a;background:white;padding:0;}
        .page{max-width:620px;margin:0 auto;padding:40px 36px;}

        /* Header */
        .receipt-header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:2px solid #e2e8f0;margin-bottom:24px;}
        .logo-area .logo{font-size:1.4rem;font-weight:700;color:#2563eb;letter-spacing:-0.02em;}
        .logo-area .tagline{font-size:0.72rem;color:#94a3b8;margin-top:2px;}
        .receipt-meta{text-align:right;}
        .receipt-meta .receipt-title{font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin-bottom:4px;}
        .receipt-meta .receipt-id{font-size:1rem;font-weight:700;color:#0f172a;}
        .receipt-meta .receipt-date{font-size:0.72rem;color:#64748b;margin-top:3px;}

        /* Status banner */
        .status-banner{background:linear-gradient(135deg,#dcfce7,#bbf7d0);border:1.5px solid #86efac;border-radius:12px;padding:14px 18px;display:flex;align-items:center;gap:12px;margin-bottom:24px;}
        .status-icon{width:36px;height:36px;border-radius:50%;background:#22c55e;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .status-text .s-title{font-size:0.9rem;font-weight:700;color:#15803d;}
        .status-text .s-sub{font-size:0.75rem;color:#16a34a;margin-top:2px;}

        /* Sections */
        .section{margin-bottom:20px;}
        .section-title{font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin-bottom:10px;display:flex;align-items:center;gap:6px;}
        .section-title::after{content:'';flex:1;height:1px;background:#f1f5f9;}

        /* Provider card */
        .provider-card{display:flex;align-items:center;gap:14px;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;padding:14px 16px;margin-bottom:14px;}
        .provider-avatar{width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#2563eb,#1d4ed8);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:1.2rem;flex-shrink:0;}
        .provider-info .p-name{font-weight:700;font-size:0.95rem;color:#0f172a;margin-bottom:3px;}
        .provider-info .p-meta{display:flex;gap:12px;flex-wrap:wrap;}
        .provider-info .p-meta span{font-size:0.72rem;color:#64748b;}
        .badge{display:inline-block;background:#dcfce7;color:#15803d;padding:2px 8px;border-radius:20px;font-size:0.65rem;font-weight:700;margin-left:6px;}

        /* Info grid */
        .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        .info-box{background:#f8fafc;border-radius:10px;padding:12px 14px;border:1px solid #f1f5f9;}
        .info-label{font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#94a3b8;margin-bottom:4px;}
        .info-value{font-size:0.875rem;font-weight:600;color:#0f172a;line-height:1.4;}

        /* Payment */
        .payment-box{background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:12px;padding:16px 20px;}
        .pay-row{display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:8px;}
        .pay-row.total{font-size:1rem;font-weight:700;border-top:2px solid #bfdbfe;padding-top:10px;margin-top:4px;color:#1d4ed8;}

        /* Address */
        .address-box{background:#f8fafc;border-radius:10px;padding:12px 14px;border:1px solid #f1f5f9;font-size:0.875rem;color:#374151;line-height:1.6;}

        /* Instructions */
        .inst-box{background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:12px 14px;font-size:0.82rem;color:#78350f;line-height:1.6;}

        /* Footer */
        .receipt-footer{margin-top:32px;padding-top:20px;border-top:1.5px dashed #e2e8f0;text-align:center;}
        .receipt-footer p{font-size:0.7rem;color:#94a3b8;line-height:1.7;}
        .receipt-footer .support{font-size:0.72rem;color:#64748b;margin-top:6px;}

        /* Watermark strip */
        .watermark{background:linear-gradient(135deg,#0f172a,#1e3a5f);color:white;padding:10px 24px;display:flex;justify-content:space-between;align-items:center;}
        .watermark span{font-size:0.72rem;opacity:0.7;}
        .watermark .brand{font-weight:700;font-size:0.875rem;opacity:1;}
      </style>
    </head><body>
    <div class="watermark">
      <span class="brand">UrbanEase</span>
      <span>Booking Receipt · ${new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</span>
    </div>
    <div class="page">
      <div class="receipt-header">
        <div class="logo-area">
          <div class="logo">UrbanEase</div>
          <div class="tagline">Local Service Provider Platform</div>
        </div>
        <div class="receipt-meta">
          <div class="receipt-title">Booking Receipt</div>
          <div class="receipt-id">#${bookingId?.slice(-10).toUpperCase()}</div>
          <div class="receipt-date">Generated: ${new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}</div>
        </div>
      </div>

      <div class="status-banner">
        <div class="status-icon">✓</div>
        <div class="status-text">
          <div class="s-title">Booking Confirmed</div>
          <div class="s-sub">Your service is scheduled for ${booking?.date} at ${booking?.timeSlot}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Service Provider</div>
        <div class="provider-card">
          <div class="provider-avatar">${pName[0]}</div>
          <div class="provider-info">
            <div class="p-name">${pName} <span class="badge">✓ Verified</span></div>
            <div class="p-meta">
              <span>📍 ${pCity}</span>
              <span>📞 ${pPhone}</span>
              <span>⭐ ${pRat > 0 ? pRat.toFixed(1) : "New"}</span>
              <span>💼 ${pExp} yrs exp</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Booking Details</div>
        <div class="info-grid">
          <div class="info-box"><div class="info-label">Service Category</div><div class="info-value">${booking?.serviceCategory || "—"}</div></div>
          <div class="info-box"><div class="info-label">Specific Service</div><div class="info-value">${booking?.subcategory || "General"}</div></div>
          <div class="info-box"><div class="info-label">Date</div><div class="info-value">${booking?.date || "—"}</div></div>
          <div class="info-box"><div class="info-label">Time Slot</div><div class="info-value">${booking?.timeSlot || "—"}</div></div>
          <div class="info-box"><div class="info-label">Duration</div><div class="info-value">${booking?.hours || 1} Hour(s)</div></div>
          <div class="info-box"><div class="info-label">Booking Status</div><div class="info-value" style="text-transform:capitalize;">${booking?.status || "confirmed"}</div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Customer Details</div>
        <div class="info-grid">
          <div class="info-box"><div class="info-label">Customer Name</div><div class="info-value">${user?.name || booking?.user?.name || "—"}</div></div>
          <div class="info-box"><div class="info-label">Phone</div><div class="info-value">${user?.phone || booking?.user?.phone || "—"}</div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Service Address</div>
        <div class="address-box">${booking?.address || "—"}</div>
        ${booking?.instructions ? `<div class="inst-box" style="margin-top:10px;"><strong style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.05em;">Instructions:</strong><br/>${booking.instructions}</div>` : ""}
      </div>

      <div class="section">
        <div class="section-title">Payment Summary</div>
        <div class="payment-box">
          <div class="pay-row"><span style="color:#64748b;">Rate</span><span>₹${booking?.pricePerHour || 299}/hr</span></div>
          <div class="pay-row"><span style="color:#64748b;">Service Charge (${booking?.hours||1}hr)</span><span>₹${(booking?.amount||348)-49}</span></div>
          <div class="pay-row"><span style="color:#64748b;">Platform Fee</span><span>₹49</span></div>
          <div class="pay-row"><span style="color:#64748b;">Payment Method</span><span style="text-transform:uppercase;">${paymentMethod}</span></div>
          <div class="pay-row total"><span>Total Paid</span><span>₹${booking?.amount || "—"}</span></div>
        </div>
      </div>

      <div class="receipt-footer">
        <p>Thank you for choosing <strong>UrbanEase</strong>. We hope you have a great service experience!</p>
        <p class="support">For support: support@urbanease.com &nbsp;|&nbsp; 1-800-URBAN-EASE &nbsp;|&nbsp; urbanease.com</p>
        <p style="margin-top:10px;font-size:0.65rem;color:#cbd5e1;">This is a computer-generated receipt and does not require a physical signature. Booking ID: ${bookingId?.slice(-10).toUpperCase()}</p>
      </div>
    </div>
    </body></html>`);
    win.document.close();
    setTimeout(()=>{ win.print(); }, 600);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f8fafc", fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ textAlign:"center", color:"#94a3b8" }}>
        <RefreshCw style={{ width:32, height:32, margin:"0 auto 12px", animation:"spin 1s linear infinite" }} />
        <p>Loading booking details...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (!booking) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <p style={{ color:"#64748b" }}>Booking not found.</p>
        <button onClick={()=>navigate("/profile")} style={{ color:"#2563eb", background:"none", border:"none", cursor:"pointer", marginTop:8 }}>View My Bookings</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#f1f5f9", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        .ccard { background:white; border-radius:18px; padding:24px; margin-bottom:14px; border:1.5px solid #f1f5f9; }
        .irow { display:flex; justify-content:space-between; align-items:flex-start; padding:10px 0; border-bottom:1px solid #f8fafc; font-size:0.85rem; }
        .irow:last-child { border-bottom:none; }
        .mini { background:#f8fafc; border-radius:11px; padding:11px 13px; border:1px solid #f1f5f9; }
        .mlabel { font-size:0.6rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#94a3b8; margin-bottom:3px; }
        .mvalue { font-size:0.85rem; font-weight:600; color:#0f172a; line-height:1.4; }
        .igrid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .dlbtn { display:flex; align-items:center; gap:8px; padding:13px 22px; border-radius:12px; background:linear-gradient(135deg,#2563eb,#1d4ed8); color:white; border:none; cursor:pointer; font-size:0.875rem; font-weight:600; font-family:'DM Sans',sans-serif; box-shadow:0 4px 16px rgba(37,99,235,0.3); transition:all 0.2s; }
        .dlbtn:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(37,99,235,0.4); }
        @media(max-width:768px){ .clayout{ grid-template-columns:1fr !important; } .igrid{ grid-template-columns:1fr 1fr; } }
      `}</style>

      {/* Navbar */}
      <div style={{ background:"rgba(7,20,50,0.7)", padding:"0 20px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={()=>navigate("/profile")} style={{ border:"1px solid rgba(255,255,255,0.2)", background:"rgba(255,255,255,0.08)", cursor:"pointer", display:"flex", alignItems:"center", gap:6, color:"rgba(255,255,255,0.8)", fontSize:"0.875rem", fontFamily:"'DM Sans',sans-serif", padding:"6px 12px", borderRadius:8 }}>
            <ArrowLeft style={{ width:16, height:16 }} /> Back
          </button>
          <span style={{ color:"rgba(255,255,255,0.3)" }}>|</span>
          <span style={{ fontFamily:"'Fraunces',serif", fontWeight:700, color:"white" }}>Booking Confirmed</span>
        </div>
        <button className="dlbtn" onClick={handleDownloadPDF}>
          <Download style={{ width:15, height:15 }} /> Download PDF
        </button>
      </div>

      <div style={{ maxWidth:860, margin:"0 auto", padding:"24px 16px" }}>

        {/* Success banner */}
        <div style={{ background:"linear-gradient(135deg,#15803d,#16a34a)", borderRadius:18, padding:"22px 28px", marginBottom:20, display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
          <div style={{ width:52, height:52, borderRadius:"50%", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <CheckCircle style={{ width:28, height:28, color:"white" }} />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:"1.2rem", fontWeight:700, color:"white", marginBottom:3 }}>Booking Confirmed! 🎉</div>
            <div style={{ fontSize:"0.82rem", color:"rgba(255,255,255,0.85)" }}>
              ID: <strong>#{bookingId?.slice(-10).toUpperCase()}</strong> · Scheduled for <strong>{booking?.date}</strong> · <strong>{booking?.timeSlot}</strong>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:"1.8rem", fontWeight:700, color:"white" }}>₹{booking?.amount}</div>
            <div style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.7)" }}>
              {booking?.paymentStatus === "paid" ? "✓ Payment Received" : "Cash on Service"}
            </div>
          </div>
        </div>

        <div className="clayout" style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:16 }}>

          {/* LEFT */}
          <div>
            {/* Provider */}
            <div className="ccard">
              <div style={{ fontSize:"0.65rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#94a3b8", marginBottom:14, display:"flex", alignItems:"center", gap:6 }}>
                <Briefcase style={{ width:12, height:12 }} /> Service Provider
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
                <div style={{ width:54, height:54, borderRadius:14, background:"linear-gradient(135deg,#2563eb,#1d4ed8)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontFamily:"'Fraunces',serif", fontSize:"1.2rem", flexShrink:0 }}>
                  {pName[0]}
                </div>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <span style={{ fontWeight:700, fontSize:"1rem", color:"#0f172a" }}>{pName}</span>
                    <span style={{ background:"#dcfce7", color:"#15803d", fontSize:"0.65rem", fontWeight:700, padding:"2px 8px", borderRadius:20 }}>✓ Verified</span>
                  </div>
                  <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                    {[[Briefcase,pCat],[MapPin,pCity],[Phone,pPhone]].map(([I,t],i)=>(
                      <span key={i} style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.75rem", color:"#64748b" }}>
                        <I style={{ width:12, height:12 }} />{t}
                      </span>
                    ))}
                    <span style={{ display:"flex", alignItems:"center", gap:6, fontSize:"0.75rem", color:"#64748b" }}>
                      {renderAverageStars(pRat)}
                      {pRat > 0 ? `${pRat.toFixed(1)} (${booking?.provider?.totalReviews || provider?.totalReviews || 0} reviews)` : "New"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking details */}
            <div className="ccard">
              <div style={{ fontSize:"0.65rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#94a3b8", marginBottom:14, display:"flex", alignItems:"center", gap:6 }}>
                <FileText style={{ width:12, height:12 }} /> Booking Details
              </div>
              <div className="igrid">
                {[
                  { label:"Category",    value: booking?.serviceCategory },
                  { label:"Service",     value: booking?.subcategory || "General" },
                  { label:"Date",        value: booking?.date },
                  { label:"Time Slot",   value: booking?.timeSlot },
                  { label:"Duration",    value: `${booking?.hours || 1} Hour(s)` },
                  { label:"Status",      value: booking?.status },
                ].map(({label,value})=>(
                  <div key={label} className="mini">
                    <div className="mlabel">{label}</div>
                    <div className="mvalue" style={{ textTransform:"capitalize" }}>{value || "—"}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="ccard">
              <div style={{ fontSize:"0.65rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#94a3b8", marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>
                <MapPin style={{ width:12, height:12 }} /> Address & Instructions
              </div>
              <div style={{ background:"#f8fafc", borderRadius:11, padding:"12px 14px", marginBottom:10, border:"1px solid #f1f5f9" }}>
                <div className="mlabel">Service Address</div>
                <div style={{ fontSize:"0.875rem", color:"#374151", fontWeight:500, lineHeight:1.5, marginTop:3 }}>{booking?.address || "—"}</div>
              </div>
              {booking?.instructions && (
                <div style={{ background:"#fffbeb", borderRadius:11, padding:"12px 14px", border:"1px solid #fde68a" }}>
                  <div className="mlabel" style={{ color:"#92400e" }}>Special Instructions</div>
                  <div style={{ fontSize:"0.875rem", color:"#78350f", lineHeight:1.5, marginTop:3 }}>{booking.instructions}</div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT sticky */}
          <div style={{ position:"sticky", top:80, height:"fit-content" }}>

            {/* Payment */}
            <div className="ccard" style={{ border:"2px solid #dbeafe" }}>
              <div style={{ fontSize:"0.65rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#94a3b8", marginBottom:14 }}>Payment Summary</div>
              {[
                { label:"Rate",           value:`₹${booking?.pricePerHour || 299}/hr` },
                { label:`Service (${booking?.hours||1}hr)`, value:`₹${(booking?.amount||348)-49}` },
                { label:"Platform Fee",   value:"₹49" },
              ].map(({label,value})=>(
                <div key={label} style={{ display:"flex", justifyContent:"space-between", fontSize:"0.82rem", marginBottom:8 }}>
                  <span style={{ color:"#64748b" }}>{label}</span>
                  <span style={{ fontWeight:500, color:"#0f172a" }}>{value}</span>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", paddingTop:12, marginTop:6, borderTop:"2px solid #e2e8f0" }}>
                <span style={{ fontWeight:700, color:"#0f172a" }}>Total</span>
                <span style={{ fontFamily:"'Fraunces',serif", fontSize:"1.4rem", fontWeight:700, color:"#2563eb" }}>₹{booking?.amount}</span>
              </div>
              <div style={{ marginTop:14, padding:"10px 14px", background: booking?.paymentStatus==="paid" ? "#dcfce7" : "#fef9c3", borderRadius:10 }}>
                <div style={{ fontSize:"0.75rem", fontWeight:700, color: booking?.paymentStatus==="paid" ? "#15803d" : "#92400e" }}>
                  {booking?.paymentStatus==="paid" ? "✓ Payment Successful" : "⏳ Cash on Service"}
                </div>
                <div style={{ fontSize:"0.7rem", color: booking?.paymentStatus==="paid"?"#16a34a":"#92400e", marginTop:2 }}>
                  via {paymentMethod?.toUpperCase() || booking?.paymentMethod?.toUpperCase() || "—"}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="ccard">
              <div style={{ fontSize:"0.65rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#94a3b8", marginBottom:14 }}>What Happens Next</div>
              {[
                { label:"Provider notified",         done:true  },
                { label:"Provider arrives at time",  done:false },
                { label:"Service completed",         done:false },
                { label:"Rate your experience",      done:false },
              ].map(({label,done},i)=>(
                <div key={label} style={{ display:"flex", gap:10, marginBottom: i<3?14:0 }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                    <div style={{ width:24, height:24, borderRadius:"50%", background:done?"#2563eb":"#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      {done ? <CheckCircle style={{ width:13, height:13, color:"white" }} /> : <span style={{ fontSize:"0.65rem", color:"#94a3b8", fontWeight:600 }}>{i+1}</span>}
                    </div>
                    {i<3 && <div style={{ width:1, height:18, background:"#e2e8f0", margin:"3px 0" }} />}
                  </div>
                  <div style={{ paddingTop:3, fontSize:"0.78rem", color:done?"#0f172a":"#64748b", fontWeight:done?500:400, lineHeight:1.4 }}>{label}</div>
                </div>
              ))}
            </div>

            {booking?.status === "completed" && (
              <div className="ccard">
                <div style={{ fontSize:"0.65rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#94a3b8", marginBottom:14, display:"flex", alignItems:"center", gap:6 }}>
                  <MessageSquare style={{ width:12, height:12 }} /> Review This Service
                </div>
                {booking?.reviewRating ? (
                  <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:14, padding:"14px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, flexWrap:"wrap", marginBottom:8 }}>
                      <div style={{ fontWeight:600, color:"#92400e" }}>Your submitted review</div>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        {renderAverageStars(booking.reviewRating)}
                        <span style={{ fontSize:"0.8rem", fontWeight:600, color:"#92400e" }}>{booking.reviewRating}/5</span>
                      </div>
                    </div>
                    <div style={{ fontSize:"0.82rem", color:"#78350f", lineHeight:1.6 }}>
                      {booking.reviewFeedback || "You rated this service without additional feedback."}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize:"0.82rem", color:"#64748b", marginBottom:10 }}>
                      Rate the service provider after the work is completed.
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                      {renderAverageStars(reviewForm.rating, (rating) => setReviewForm((prev) => ({ ...prev, rating })))}
                      <span style={{ fontSize:"0.8rem", color:"#64748b" }}>
                        {reviewForm.rating ? `${reviewForm.rating}/5 selected` : "Select stars"}
                      </span>
                    </div>
                    <textarea
                      value={reviewForm.feedback}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, feedback: e.target.value }))}
                      rows={3}
                      placeholder="Share your experience with this provider..."
                      style={{ width:"100%", borderRadius:12, border:"1.5px solid #e2e8f0", padding:"12px 14px", fontFamily:"'DM Sans',sans-serif", fontSize:"0.84rem", resize:"vertical", outline:"none", boxSizing:"border-box" }}
                    />
                    <button
                      onClick={submitReview}
                      disabled={submittingReview}
                      style={{ marginTop:12, border:"none", borderRadius:10, background:"#2563eb", color:"white", padding:"10px 18px", cursor:"pointer", fontSize:"0.84rem", fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <button className="dlbtn" onClick={handleDownloadPDF} style={{ justifyContent:"center" }}>
                <Download style={{ width:16, height:16 }} /> Download Receipt (PDF)
              </button>
              <button onClick={()=>navigate("/services")} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px", borderRadius:12, background:"white", border:"1.5px solid #e2e8f0", color:"#374151", cursor:"pointer", fontSize:"0.875rem", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}>
                <Home style={{ width:15, height:15 }} /> Book Another Service
              </button>
              <button onClick={()=>navigate("/profile")} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px", borderRadius:12, background:"white", border:"1.5px solid #e2e8f0", color:"#374151", cursor:"pointer", fontSize:"0.875rem", fontFamily:"'DM Sans',sans-serif" }}>
                View All Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
