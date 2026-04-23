import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, CheckCircle, CreditCard, Smartphone, Banknote,
  Shield, MapPin, Clock, Calendar, User, Tag, FileText,
  LogOut, UserCircle, ChevronDown, Loader2, AlertCircle,
  Wallet, Lock, ChevronRight, Zap, IndianRupee
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const PAYMENT_METHODS = [
  {
    id: "upi",
    label: "UPI Payment",
    icon: Smartphone,
    desc: "GPay · PhonePe · Paytm · Any UPI App",
    color: "#7c3aed",
    bg: "linear-gradient(135deg,#ede9fe,#f5f3ff)",
    badge: "Instant",
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    icon: CreditCard,
    desc: "Visa · Mastercard · RuPay · Amex",
    color: "#2563eb",
    bg: "linear-gradient(135deg,#dbeafe,#eff6ff)",
    badge: "Secure",
  },
  {
    id: "cash",
    label: "Cash on Service",
    icon: Banknote,
    desc: "Pay in cash after the service is completed",
    color: "#059669",
    bg: "linear-gradient(135deg,#d1fae5,#ecfdf5)",
    badge: "No prepay",
  },
];

/* ─── Load Razorpay Script Dynamically ─── */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/* ─── Main Component ─── */
export function PaymentPage() {
  const { bookingId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();

  const [selectedMethod, setSelectedMethod] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("select"); // select | processing | done
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const booking = state?.booking;
  const provider = state?.provider;

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Preload Razorpay script
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  /* ── Razorpay Payment Handler ── */
  const handleRazorpayPayment = useCallback(async () => {
    setProcessing(true);
    setError("");
    setStep("processing");

    try {
      // 1. Load Razorpay SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Razorpay SDK failed to load. Check your internet connection.");
        setStep("select");
        setProcessing(false);
        return;
      }

      // 2. Create Razorpay Order on server
      const orderRes = await fetch(`${API}/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookingId }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        setError(orderData.message || "Failed to create payment order.");
        setStep("select");
        setProcessing(false);
        return;
      }

      // 3. Open Razorpay Checkout
      const options = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "UrbanEase",
        description: `${booking?.serviceCategory || "Service"} Booking`,
        order_id: orderData.order.id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        notes: {
          bookingId: bookingId,
        },
        theme: {
          color: "#2563eb",
          backdrop_color: "rgba(15, 23, 42, 0.75)",
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            setStep("select");
            setError("Payment was cancelled. You can try again.");
          },
        },
        handler: async function (response) {
          // 4. Verify payment on server
          try {
            const verifyRes = await fetch(`${API}/payment/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId,
                paymentMethod: selectedMethod,
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              setStep("done");
              // Navigate to booking confirmation after a brief success indication
              setTimeout(() => {
                navigate(`/booking-confirmation/${bookingId}`, {
                  state: {
                    booking: verifyData.booking,
                    provider,
                    paymentMethod: selectedMethod,
                  },
                });
              }, 1500);
            } else {
              setError(verifyData.message || "Payment verification failed.");
              setStep("select");
            }
          } catch {
            setError("Payment verification error. Contact support with your payment ID.");
            setStep("select");
          }
          setProcessing(false);
        },
      };

      // Set preferred method in Razorpay modal
      if (selectedMethod === "upi") {
        options.config = {
          display: {
            blocks: {
              upi: { name: "UPI Payment", instruments: [{ method: "upi" }] },
            },
            sequence: ["block.upi"],
            preferences: { show_default_blocks: false },
          },
        };
      } else if (selectedMethod === "card") {
        options.config = {
          display: {
            blocks: {
              card: { name: "Card Payment", instruments: [{ method: "card" }] },
            },
            sequence: ["block.card"],
            preferences: { show_default_blocks: false },
          },
        };
      }

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp) {
        setError(`Payment failed: ${resp.error.description}`);
        setStep("select");
        setProcessing(false);
      });
      rzp.open();

    } catch (err) {
      console.error("Payment error:", err);
      setError("Something went wrong. Please try again.");
      setStep("select");
      setProcessing(false);
    }
  }, [token, bookingId, booking, provider, user, selectedMethod, navigate]);

  /* ── Cash on Service Handler ── */
  const handleCashPayment = useCallback(async () => {
    setProcessing(true);
    setError("");
    setStep("processing");

    try {
      const res = await fetch(`${API}/payment/cash`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();

      if (data.success) {
        setStep("done");
        setTimeout(() => {
          navigate(`/booking-confirmation/${bookingId}`, {
            state: {
              booking: data.booking,
              provider,
              paymentMethod: "cash",
            },
          });
        }, 1500);
      } else {
        setError(data.message || "Failed to confirm cash booking.");
        setStep("select");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setStep("select");
    }
    setProcessing(false);
  }, [token, bookingId, provider, navigate]);

  /* ── Main Pay Button ── */
  const handlePay = () => {
    if (!selectedMethod) {
      setError("Please select a payment method.");
      return;
    }
    if (selectedMethod === "cash") {
      handleCashPayment();
    } else {
      handleRazorpayPayment();
    }
  };

  const firstName = user?.name?.split(" ")[0] || "Account";

  /* ─────────── RENDER ─────────── */
  return (
    <div style={{ minHeight: "100vh", background: step === "done" ? "linear-gradient(160deg,#f0fdf4 0%,#ecfdf5 50%,#f0f9ff 100%)" : "linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)", fontFamily: "'DM Sans',sans-serif", transition: "background 0.5s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .method-card {
          border: 2px solid #e8edf5;
          border-radius: 18px;
          padding: 18px 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
          background: white;
          margin-bottom: 12px;
          position: relative;
          overflow: hidden;
        }
        .method-card::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.25s;
        }
        .method-card.active {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37,99,235,0.08), 0 8px 24px rgba(37,99,235,0.12);
          transform: translateY(-2px);
        }
        .method-card.active::before { opacity: 1; }
        .method-card:hover:not(.active) {
          border-color: #94a3b8;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        }

        .pay-btn {
          width: 100%;
          background: linear-gradient(135deg, #0F172A 0%, #1e3a5f 50%, #2563eb 100%);
          background-size: 200% 100%;
          color: white;
          border: none;
          border-radius: 16px;
          padding: 18px;
          font-size: 1.05rem;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.3s;
          letter-spacing: 0.02em;
          box-shadow: 0 4px 20px rgba(15,23,42,0.25);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .pay-btn:hover:not(:disabled) {
          background-position: 100% 0;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(37,99,235,0.35);
        }
        .pay-btn:active:not(:disabled) { transform: translateY(0); }
        .pay-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        @keyframes checkBounce {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes ripple {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          100% { box-shadow: 0 0 0 20px rgba(34,197,94,0); }
        }

        .slide-up { animation: slideUp 0.4s ease-out both; }
        .scale-in { animation: scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
        .check-bounce { animation: checkBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) both; }
        .ripple-ring { animation: ripple 1.5s ease-out infinite; }

        .summary-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 0; font-size: 0.84rem;
        }

        .trust-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 20px;
          font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.02em;
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav style={{
        background: "linear-gradient(135deg, rgba(7,20,50,0.95), rgba(30,58,95,0.95))",
        backdropFilter: "blur(12px)",
        padding: "0 20px", height: 64,
        display: "flex", alignItems: "center", gap: 12,
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 4px 24px rgba(15,23,42,0.25)",
      }}>
        {step !== "done" && (
          <>
            <button
              onClick={() => navigate(-1)}
              style={{ border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.85)", fontSize: "0.875rem", fontFamily: "'DM Sans',sans-serif", padding: "7px 14px", borderRadius: 10, transition: "all 0.2s" }}
              onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
              onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
            >
              <ArrowLeft style={{ width: 16, height: 16 }} /> Back
            </button>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
          </>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Wallet style={{ width: 18, height: 18, color: "#60a5fa" }} />
          <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, color: "white", fontSize: "1.05rem" }}>
            {step === "done" ? "Payment Successful" : "Secure Payment"}
          </span>
        </div>

        {/* User dropdown — right side */}
        <div ref={dropdownRef} style={{ marginLeft: "auto", position: "relative" }}>
          <button
            onClick={() => setDropdownOpen(o => !o)}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 24, padding: "5px 12px 5px 6px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s" }}
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
            <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "white", borderRadius: 14, minWidth: 180, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", border: "1px solid #f1f5f9", overflow: "hidden", zIndex: 200 }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #f8fafc", background: "#fafbff" }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>{user?.name}</div>
                <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 2 }}>{user?.email}</div>
              </div>
              <button onClick={() => { setDropdownOpen(false); navigate("/profile"); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: "0.85rem", color: "#374151", textAlign: "left", transition: "background 0.15s" }}
                onMouseOver={e => e.currentTarget.style.background = "#f8fafc"}
                onMouseOut={e => e.currentTarget.style.background = "none"}
              >
                <UserCircle style={{ width: 16, height: 16, color: "#2563eb" }} /> My Profile
              </button>
              <button onClick={() => { setDropdownOpen(false); logout(); navigate("/login"); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: "0.85rem", color: "#ef4444", textAlign: "left", borderTop: "1px solid #f8fafc", transition: "background 0.15s" }}
                onMouseOver={e => e.currentTarget.style.background = "#fef2f2"}
                onMouseOut={e => e.currentTarget.style.background = "none"}
              >
                <LogOut style={{ width: 16, height: 16 }} /> Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ── Processing Overlay ── */}
      {step === "processing" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="scale-in" style={{ background: "white", borderRadius: 24, padding: "48px 40px", textAlign: "center", maxWidth: 360, width: "90%", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
            <Loader2 style={{ width: 48, height: 48, color: "#2563eb", margin: "0 auto 20px", animation: "spin 1s linear infinite" }} />
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
              Processing Payment
            </div>
            <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.6, animation: "pulse 2s ease-in-out infinite" }}>
              {selectedMethod === "cash" ? "Confirming your cash booking..." : "Please complete payment in the Razorpay window..."}
            </p>
          </div>
        </div>
      )}

      {/* ── Success Overlay ── */}
      {step === "done" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(8px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="scale-in" style={{ background: "white", borderRadius: 24, padding: "48px 40px", textAlign: "center", maxWidth: 380, width: "90%", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
            <div className="check-bounce ripple-ring" style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#dcfce7,#bbf7d0)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
              <CheckCircle style={{ width: 42, height: 42, color: "#16a34a" }} />
            </div>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1.4rem", fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
              {selectedMethod === "cash" ? "Booking Confirmed!" : "Payment Successful!"}
            </div>
            <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.6, marginBottom: 6 }}>
              {selectedMethod === "cash"
                ? "Your booking is confirmed. Pay after service completion."
                : `₹${booking?.amount} paid successfully via ${selectedMethod?.toUpperCase()}`
              }
            </p>
            <p style={{ fontSize: "0.78rem", color: "#94a3b8", animation: "pulse 1.5s ease-in-out infinite" }}>
              Redirecting to booking confirmation...
            </p>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <div style={{ maxWidth: 540, margin: "0 auto", padding: "28px 16px 40px" }}>

        {/* ── Amount Header Card ── */}
        <div className="slide-up" style={{
          background: "linear-gradient(135deg,#0f172a,#1e3a5f,#2563eb)",
          borderRadius: 22, padding: "26px 28px", marginBottom: 18,
          position: "relative", overflow: "hidden",
        }}>
          {/* Decorative circles */}
          <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ position: "absolute", bottom: -20, left: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
              <IndianRupee style={{ width: 14, height: 14, color: "rgba(255,255,255,0.6)" }} />
              <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Amount</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 18 }}>
              <span style={{ fontFamily: "'Fraunces',serif", fontSize: "2.6rem", fontWeight: 700, color: "white", lineHeight: 1 }}>₹{booking?.amount || "—"}</span>
              <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)" }}>INR</span>
            </div>

            {/* Mini order details */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
              {[
                { icon: Tag, text: booking?.serviceCategory },
                { icon: User, text: provider?.name },
                { icon: Calendar, text: booking?.date },
                { icon: Clock, text: booking?.timeSlot },
              ].filter(i => i.text).map(({ icon: Icon, text }) => (
                <span key={text} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.75rem", color: "rgba(255,255,255,0.7)" }}>
                  <Icon style={{ width: 11, height: 11, opacity: 0.7 }} />{text}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Price Breakdown ── */}
        <div className="slide-up" style={{
          background: "white", borderRadius: 18, padding: "20px 22px",
          marginBottom: 16, border: "1px solid #f1f5f9",
          boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
          animationDelay: "0.05s",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <FileText style={{ width: 15, height: 15, color: "#2563eb" }} />
            <span style={{ fontWeight: 600, fontSize: "0.88rem", color: "#0f172a" }}>Price Breakdown</span>
          </div>
          <div className="summary-row">
            <span style={{ color: "#64748b" }}>Service Charge ({booking?.hours || 1}hr × ₹{booking?.pricePerHour || Math.max((booking?.amount || 348) - 49, 0) / (booking?.hours || 1)})</span>
            <span style={{ fontWeight: 600, color: "#0f172a" }}>₹{(booking?.amount || 348) - 49}</span>
          </div>
          <div className="summary-row">
            <span style={{ color: "#64748b" }}>Platform Fee</span>
            <span style={{ fontWeight: 600, color: "#0f172a" }}>₹49</span>
          </div>
          <div style={{ borderTop: "2px dashed #e8edf5", marginTop: 8, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>Total</span>
            <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: "1.2rem", color: "#2563eb" }}>₹{booking?.amount}</span>
          </div>
        </div>

        {/* ── Payment Methods ── */}
        <div className="slide-up" style={{
          background: "white", borderRadius: 18, padding: "22px 22px",
          marginBottom: 18, border: "1px solid #f1f5f9",
          boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
          animationDelay: "0.1s",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Wallet style={{ width: 15, height: 15, color: "#2563eb" }} />
              <span style={{ fontWeight: 600, fontSize: "0.88rem", color: "#0f172a" }}>Choose Payment Method</span>
            </div>
            <span className="trust-badge" style={{ background: "#dcfce7", color: "#15803d" }}>
              <Shield style={{ width: 10, height: 10 }} /> Secured
            </span>
          </div>

          {PAYMENT_METHODS.map(({ id, label, icon: Icon, desc, color, bg, badge }) => (
            <div
              key={id}
              className={`method-card ${selectedMethod === id ? "active" : ""}`}
              onClick={() => { setSelectedMethod(id); setError(""); }}
              style={selectedMethod === id ? { borderColor: color } : {}}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: selectedMethod === id ? bg : "#f8fafc",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "all 0.25s",
                border: `1.5px solid ${selectedMethod === id ? color + "30" : "#f1f5f9"}`,
              }}>
                <Icon style={{ width: 22, height: 22, color: selectedMethod === id ? color : "#94a3b8", transition: "color 0.25s" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#0f172a" }}>{label}</span>
                  <span className="trust-badge" style={{
                    background: selectedMethod === id ? color + "15" : "#f8fafc",
                    color: selectedMethod === id ? color : "#94a3b8",
                    border: `1px solid ${selectedMethod === id ? color + "25" : "#f1f5f9"}`,
                  }}>
                    <Zap style={{ width: 8, height: 8 }} /> {badge}
                  </span>
                </div>
                <div style={{ fontSize: "0.76rem", color: "#94a3b8", marginTop: 3 }}>{desc}</div>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                border: `2.5px solid ${selectedMethod === id ? color : "#e2e8f0"}`,
                background: selectedMethod === id ? color : "white",
                flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.25s",
                boxShadow: selectedMethod === id ? `0 0 0 4px ${color}15` : "none",
              }}>
                {selectedMethod === id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "white" }} />}
              </div>
            </div>
          ))}
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{
            padding: "14px 18px", borderRadius: 14,
            background: "linear-gradient(135deg,#fef2f2,#fff1f2)", border: "1.5px solid #fecaca",
            color: "#dc2626", fontSize: "0.85rem", marginBottom: 18,
            display: "flex", alignItems: "flex-start", gap: 10,
          }}>
            <AlertCircle style={{ width: 18, height: 18, flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Payment Error</div>
              <div style={{ fontSize: "0.8rem", color: "#b91c1c" }}>{error}</div>
            </div>
          </div>
        )}

        {/* ── Pay Button ── */}
        <button className="pay-btn" onClick={handlePay} disabled={processing || !selectedMethod}>
          {processing ? (
            <>
              <Loader2 style={{ width: 20, height: 20, animation: "spin 0.8s linear infinite" }} />
              Processing...
            </>
          ) : selectedMethod === "cash" ? (
            <>
              <Banknote style={{ width: 20, height: 20 }} />
              Confirm Cash Booking
              <ChevronRight style={{ width: 18, height: 18 }} />
            </>
          ) : selectedMethod ? (
            <>
              <Lock style={{ width: 18, height: 18 }} />
              Pay ₹{booking?.amount || "—"} Securely
              <ChevronRight style={{ width: 18, height: 18 }} />
            </>
          ) : (
            <>
              <Wallet style={{ width: 20, height: 20 }} />
              Select a Payment Method
            </>
          )}
        </button>

        {/* ── Security Footer ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 20, flexWrap: "wrap" }}>
          {[
            { icon: Lock, text: "256-bit SSL" },
            { icon: Shield, text: "PCI DSS Compliant" },
            { icon: CheckCircle, text: "Razorpay Secured" },
          ].map(({ icon: Icon, text }) => (
            <span key={text} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.7rem", color: "#94a3b8" }}>
              <Icon style={{ width: 11, height: 11 }} /> {text}
            </span>
          ))}
        </div>

        {/* ── Service Address (if present) ── */}
        {booking?.address && (
          <div className="slide-up" style={{
            background: "white", borderRadius: 16, padding: "16px 20px",
            marginTop: 18, border: "1px solid #f1f5f9",
            animationDelay: "0.15s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <MapPin style={{ width: 13, height: 13, color: "#2563eb" }} />
              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>Service Address</span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#374151", lineHeight: 1.6, margin: 0 }}>{booking.address}</p>
          </div>
        )}
      </div>
    </div>
  );
}