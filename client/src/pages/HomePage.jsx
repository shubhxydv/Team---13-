import {
  Search, Calendar, CheckCircle, Facebook, Twitter, Instagram, Linkedin,
  Mail, Phone, MapPin, ArrowRight, Star, Shield, Clock, ChevronDown,
  UserCircle, LogOut, MessageSquare, X, Send, Settings, Globe
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
const KB = {
  keywords: {
    about: ["urbanease", "urban ease", "what is urbanease", "about urbanease", "tell me about", "explain urbanease"],
    how_it_works: ["how it works", "how does it work", "process", "steps", "how to use"],
    services: ["services", "service", "what do you offer", "cleaning", "plumbing", "electrician", "painting", "pest control", "carpentry", "ac", "repair"],
    pricing: ["price", "pricing", "cost", "how much", "charges", "fee", "rate", "affordable"],
    booking: ["book", "booking", "schedule", "appointment", "how to book", "reserve"],
    provider: ["provider", "professional", "worker", "technician", "verified", "background"],
    payment: ["payment", "pay", "upi", "card", "cash", "wallet", "gpay"],
    refund: ["refund", "cancel", "cancellation", "money back", "policy"],
    founder: ["founder", "who made", "who created", "owner", "team", "who started"],
    technology: ["technology", "tech", "tech stack", "built with", "framework"],
    advantages: ["advantage", "benefits", "why urbanease", "why choose", "unique", "best"],
  },
  qa: {
    about: "UrbanEase is an on-demand home services platform connecting homeowners with trusted, verified local professionals. Book, track, and pay — all in one place. 🏠",
    how_it_works: "Simple! 1️⃣ Choose a service, 2️⃣ Pick your date & time, 3️⃣ Verified pro arrives at your door, 4️⃣ Pay online or cash. Track your professional in real-time!",
    services: "We offer: 🧹 Cleaning · 🔧 Plumbing · ⚡ Electrical · 🎨 Painting · 🐜 Pest Control · 🪚 Carpentry · 🌿 Gardening · 🛠️ Handyman · ❄️ AC Service — and more!",
    pricing: "Transparent pricing, no hidden charges. Services start from ₹149. The price you see before booking is exactly what you pay. ✅",
    booking: "Booking takes under 2 minutes! Browse → Pick a slot → Enter address → Confirm & pay. Free rescheduling up to 2 hours before your appointment!",
    provider: "Every pro is verified: ✅ Govt ID check · ✅ Criminal background check · ✅ Skill certified. Only the top 15% of applicants are accepted. Your safety is our priority!",
    payment: "We accept: 💳 Cards · 📱 UPI (GPay, PhonePe, Paytm) · 🏦 Net Banking · 💵 Cash. All payments are SSL-encrypted.",
    refund: "Cancel 2+ hrs before → 100% refund. Cancel within 2 hrs → 50% refund. Unhappy with service? Complain within 24 hrs for free re-service or full refund!",
    founder: "Founded by young entrepreneurs who felt the pain of finding reliable home service professionals. The team blends tech, ops, and customer experience to make home services stress-free.",
    technology: "Built with: 🌐 React.js · 📱 React Native · ⚙️ Node.js · 🗄️ MongoDB · ☁️ AWS · 🤖 AI chatbot · 🔐 End-to-end encryption.",
    advantages: "⭐ Verified pros · 💰 Zero hidden charges · ⏱️ On-time guarantee · 🔄 Free re-service · 📍 Real-time tracking · 🌟 24/7 support · 🏆 50,000+ happy customers!",
    default: "I can help with info about UrbanEase! Ask me about services, pricing, booking, payments, refunds, or anything about the platform. 😊",
  },
};

function getKBAnswer(query) {
  const q = query.toLowerCase().trim();
  let bestCategory = null, bestScore = 0;
  for (const [cat, keywords] of Object.entries(KB.keywords)) {
    for (const kw of keywords) {
      if (q.includes(kw) && kw.length > bestScore) {
        bestScore = kw.length; bestCategory = cat;
      }
    }
  }
  return KB.qa[bestCategory] || KB.qa.default;
}
const steps = [
  {
    id: 1,
    title: 'Choose a Service',
    description: 'Browse our categories and select the service you need for your home.',
    icon: Search,
    color: 'from-blue-500 to-blue-700',
  },
  {
    id: 2,
    title: 'Book a Professional',
    description: 'Pick a date and time that works for you and book a verified professional.',
    icon: Calendar,
    color: 'from-blue-600 to-blue-800',
  },
  {
    id: 3,
    title: 'Get It Done',
    description: 'Relax while our expert completes the job to your satisfaction.',
    icon: CheckCircle,
    color: 'from-blue-700 to-blue-900',
  },
];

const stats = [
  { value: '500+', label: 'Verified Professionals', icon: Shield },
  { value: '10K+', label: 'Happy Customers', icon: Star },
  { value: '50+', label: 'Service Categories', icon: CheckCircle },
  { value: '24/7', label: 'Support Available', icon: Clock },
];

export function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const videoRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [backendUrl, setBackendUrl] = useState(() => localStorage.getItem('urbanease_chatbot_url') || 'http://localhost:5000/api/chat');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: "Hi! I'm UrbanBot. How can I help you with your home services today?", isBot: true }
  ]);
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    localStorage.setItem('urbanease_chatbot_url', backendUrl);
  }, [backendUrl]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSearchClick = () => {
    if (searchRef.current) searchRef.current.focus();
  };

  const handleServicesClick = () => {
    if (!user) { navigate('/services'); return; }
    if (user.role === 'admin') { navigate('/admin-dashboard'); return; }
    if (user.role === 'serviceProvider') { navigate('/provider-dashboard'); return; }
    navigate('/services');
  };

  const handleProfileClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role === 'admin') {
      navigate('/admin-profile');
      return;
    }

    if (user.role === 'serviceProvider') {
      navigate('/provider-profile');
      return;
    }

    navigate('/profile');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const query = userInput.trim();
    setChatMessages(prev => [...prev, { id: Date.now(), text: query, isBot: false }]);
    setUserInput('');

    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: getKBAnswer(query),
        isBot: true,
      }]);
    }, 500);
  };

  return (
    <div className="bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        body { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Sora', sans-serif; }

        .hero-video-overlay {
          background: linear-gradient(135deg, rgba(7, 20, 50, 0.82) 0%, rgba(10, 40, 100, 0.65) 50%, rgba(7, 20, 50, 0.75) 100%);
        }
        .text-gradient {
          background: linear-gradient(135deg, #60a5fa 0%, #93c5fd 50%, #bfdbfe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .search-bar {
          backdrop-filter: blur(20px);
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          transition: all 0.3s ease;
        }
        .search-bar:focus-within {
          background: rgba(255,255,255,0.18);
          border-color: rgba(255,255,255,0.4);
          box-shadow: 0 0 0 4px rgba(96,165,250,0.15);
        }
        .stat-card {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        .stat-card:hover { background: rgba(255,255,255,0.12); transform: translateY(-2px); }

        .step-card {
          position: relative;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .step-card:hover { transform: translateY(-8px); }
        .step-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 24px;
          padding: 1px;
          background: linear-gradient(135deg, #3b82f6, transparent, #1d4ed8);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .step-card:hover::before { opacity: 1; }

        .step-number {
          font-family: 'Sora', sans-serif;
          font-size: 5rem;
          font-weight: 800;
          line-height: 1;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          opacity: 0.38;
          position: absolute;
          top: -10px;
          right: 20px;
          text-shadow: 0 10px 28px rgba(37, 99, 235, 0.2);
        }
        .connector-line {
          position: absolute;
          top: 56px;
          left: calc(100% - 20px);
          width: calc(100% - 60px);
          height: 1px;
          background: linear-gradient(90deg, #3b82f6, transparent);
          z-index: 0;
        }
        .connector-dot {
          position: absolute;
          right: -4px;
          top: -3px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #3b82f6;
        }
        .footer-link { position: relative; transition: color 0.2s; }
        .footer-link::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0;
          width: 0; height: 1px;
          background: #60a5fa;
          transition: width 0.3s ease;
        }
        .footer-link:hover::after { width: 100%; }

        .btn-primary {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          box-shadow: 0 4px 20px rgba(37,99,235,0.4);
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
          box-shadow: 0 6px 28px rgba(37,99,235,0.55);
          transform: translateY(-1px);
        }
        .btn-outline {
          border: 1.5px solid rgba(255,255,255,0.35);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        .btn-outline:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.6);
        }
        .nav-glass {
          background: rgba(7,20,50,0.7);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp 0.8s ease forwards; }

        @keyframes pulse-ring {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(14,165,233,0.3); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(14,165,233,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(14,165,233,0); }
        }
        .pulse-ring { animation: pulse-ring 2.5s ease infinite; }

        /* Chatbot Custom Styles */
        .ue-chatbot-btn {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 56px;
          height: 56px;
          border-radius: 20px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          border: none;
          cursor: pointer;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px rgba(37, 99, 235, 0.35);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .ue-chatbot-btn:hover {
          transform: scale(1.1) rotate(-5deg);
          box-shadow: 0 12px 40px rgba(37, 99, 235, 0.45);
        }

        .ue-chatbot-window {
          position: fixed;
          bottom: 100px;
          right: 30px;
          width: 360px;
          height: 500px;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 12px 48px rgba(0,0,0,0.15);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform-origin: bottom right;
          border: 1px solid #f1f5f9;
        }

        .ue-chatbot-header {
          padding: 20px;
          background: linear-gradient(135deg, #1e293b, #0f172a);
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ue-chatbot-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ue-chat-bubble {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 0.88rem;
          line-height: 1.4;
          word-wrap: break-word;
        }
        .ue-chat-bubble.bot {
          align-self: flex-start;
          background: #ffffff;
          color: #1e293b;
          border-bottom-left-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          border: 1px solid #f1f5f9;
        }
        .ue-chat-bubble.user {
          align-self: flex-end;
          background: #2563eb;
          color: white;
          border-bottom-right-radius: 4px;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }

        .ue-chat-input-area {
          padding: 16px;
          background: #ffffff;
          border-top: 1px solid #f1f5f9;
          display: flex;
          gap: 10px;
        }
        .ue-chat-input {
          flex: 1;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 0.88rem;
          outline: none;
          transition: all 0.2s;
        }
        .ue-chat-input:focus {
          background: #ffffff;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .ue-chat-send-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #2563eb;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .ue-chat-send-btn:hover { background: #1d4ed8; transform: scale(1.05); }

        /* Responsive Fixes */
        @media (max-width: 480px) {
          .ue-chatbot-window {
            width: calc(100vw - 40px);
            right: 20px;
            bottom: 90px;
            height: 400px;
          }
          .ue-chatbot-btn {
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
          }
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav className="nav-glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600">
              <span className="font-display text-white font-bold">U</span>
            </div>
            <span className="font-display text-white font-semibold text-lg">UrbanEase</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-blue-200 hover:text-white text-sm">How It Works</a>
            <button onClick={handleServicesClick} className="text-blue-200 hover:text-white text-sm bg-transparent border-none cursor-pointer">Services</button>
            <Link to="/contact" className="text-blue-200 hover:text-white text-sm no-underline">Contact</Link>

            {/* ── CT2: Team 13 button ── */}
            <Link
              to="/team"
              className="no-underline"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.35)",
                color: "#fff",
                borderRadius: 20,
                padding: "5px 16px",
                fontSize: "0.82rem",
                fontWeight: 700,
                letterSpacing: 0.5,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.28)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
            >
              🎓 Team 13
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 cursor-pointer text-white"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                    {(user?.name?.[0] || 'U').toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[100]">
                    <div className="p-4 border-bottom border-gray-50 bg-gray-50">
                      <div className="text-sm font-bold text-gray-800">{user?.name}</div>
                      <div className="text-xs text-gray-400">{user?.email}</div>
                    </div>
                    <button onClick={() => { setDropdownOpen(false); handleProfileClick(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 bg-white border-none cursor-pointer">
                      <UserCircle className="w-4 h-4 text-blue-600" /> My Profile
                    </button>
                    <button onClick={() => { setDropdownOpen(false); logout(); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 bg-white border-none cursor-pointer border-t border-gray-50">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 rounded-lg text-white text-sm font-medium border border-white/30 hover:bg-white/10 no-underline">Sign In</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0 z-0">
          <video autoPlay muted loop playsInline className="w-full h-full object-cover filter brightness-[0.7]">
            <source src="/service_provide.mp4" type="video/mp4" />
          </video>
          <div className="hero-video-overlay absolute inset-0" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 bg-blue-500/20 border border-blue-400/30">
            <span className="w-2 h-2 rounded-full bg-blue-400 pulse-ring" />
            <span className="text-blue-200 text-sm font-medium">Trusted by 10,000+ homeowners</span>
          </div>

          <h1 className="font-display animate-fade-up text-white mb-6 text-5xl md:text-7xl font-extrabold tracking-tight">
            Home Services, <br />
            <span className="text-gradient">Made Simple.</span>
          </h1>

          <p className="animate-fade-up text-blue-100 max-w-2xl mx-auto mb-10 text-lg md:text-xl font-light opacity-90">
            Connect with trusted local professionals for all your home service needs. From cleaning to repairs — we've got you covered.
          </p>

          <div className="animate-fade-up search-bar rounded-2xl p-2 flex flex-col sm:flex-row items-center gap-2 max-w-2xl mx-auto mb-12">
            <div className="flex-1 flex items-center gap-3 px-4 w-full">
              <Search className="w-5 h-5 text-blue-300" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="What service do you need?"
                className="flex-1 bg-transparent border-none outline-none py-3 text-white placeholder-blue-200"
              />
            </div>
            <button onClick={handleSearchClick} className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border-none shadow-lg">
              Search <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-0 right-0 z-10 hidden md:block">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="stat-card rounded-2xl p-4 flex items-center gap-4">
                  <stat.icon className="w-6 h-6 text-blue-400" />
                  <div>
                    <div className="text-white font-bold text-xl">{stat.value}</div>
                    <div className="text-blue-300 text-xs uppercase tracking-tight">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ... (rest of the sections: How It Works, Footer) ... */}
      <section id="how-it-works" className="py-24 bg-gray-50 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 font-display">How UrbanEase Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(step => (
              <div key={step.id} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative">
                <div className="text-6xl font-bold text-blue-100 absolute top-4 right-8">{step.id}</div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6`}>
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="footer" className="bg-[#0a0f1e] text-white py-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12 border-b border-white/5 pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center font-bold text-xs">U</div>
              <span className="font-bold text-lg font-display">UrbanEase</span>
            </div>
            <p className="text-sm text-gray-500">Your trusted partner for home services. Anytime, anywhere.</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-sm">Services</h4>
            <ul className="list-none p-0 space-y-2 text-sm text-gray-400">
              <li>Cleaning</li><li>Plumbing</li><li>Electrical</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-sm">Legal</h4>
            <ul className="list-none p-0 space-y-2 text-sm text-gray-400">
              <li>Privacy Policy</li><li>Terms of Use</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-sm">Contact</h4>
            <Link to="/contact" className="text-sm text-gray-400 no-underline hover:text-white transition-colors">Contact Us</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-8 flex justify-between items-center text-xs text-gray-600">
          <p>© 2026 UrbanEase. All rights reserved.</p>
          <div className="flex gap-4">
            <Facebook className="w-4 h-4 hover:text-blue-500 cursor-pointer" />
            <Twitter className="w-4 h-4 hover:text-blue-400 cursor-pointer" />
            <Instagram className="w-4 h-4 hover:text-pink-500 cursor-pointer" />
          </div>
        </div>
      </footer>


      {/* ── Chatbot FAB ── */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="ue-chatbot-btn"
        aria-label="Toggle Chatbot"
      >
        {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* ── Chatbot Window ── */}
      {isChatOpen && (
        <div className={`ue-chatbot-window animate-fade-up`}>
          <div className="ue-chatbot-header">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-white text-xs">UB</div>
              <div>
                <div className="font-bold text-sm">UrbanBot</div>
                <div className="text-[10px] text-blue-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Online
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors bg-transparent border-none cursor-pointer"
                title="Bot Configuration"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors bg-transparent border-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="ue-chatbot-messages">
            {showSettings ? (
              <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  <Globe className="w-4 h-4" /> BOT BACKEND CONFIG
                </div>
                <p className="text-[11px] text-gray-500">Paste your deployed AI bot URL here to connect.</p>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Backend Endpoint</label>
                  <input
                    type="text"
                    value={backendUrl}
                    onChange={(e) => setBackendUrl(e.target.value)}
                    placeholder="https://api.yourbot.com/v1"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors border-none cursor-pointer"
                >
                  Save Configuration
                </button>
              </div>
            ) : (
              chatMessages.map(msg => (
                <div key={msg.id} className={`ue-chat-bubble ${msg.isBot ? 'bot' : 'user'}`}>
                  {msg.text}
                </div>
              ))
            )}
          </div>

          {!showSettings && (
            <form onSubmit={handleSendMessage} className="ue-chat-input-area">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type a message..."
                className="ue-chat-input"
              />
              <button type="submit" className="ue-chat-send-btn">
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
