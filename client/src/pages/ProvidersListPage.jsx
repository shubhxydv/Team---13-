import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Star, MapPin, Briefcase, SlidersHorizontal, Search, Clock } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const CATEGORY_NAMES = {
  cleaning: "Cleaning", plumbing: "Plumbing", electrical: "Electrical",
  carpentry: "Carpentry", painting: "Painting", appliance_repair: "Appliance Repair",
  ac_repair: "AC Repair", pest_control: "Pest Control", gardening: "Gardening",
  security: "Security", interior_design: "Interior Design", locksmith: "Locksmith", other: "Other Services",
};

export function ProvidersListPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("createdAt");
  const [minRating, setMinRating] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");

  const renderAverageStars = (rating) => {
    const filled = Math.round(rating || 0);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            style={{
              width: 15,
              height: 15,
              color: "#facc15",
              fill: star <= filled ? "#facc15" : "transparent",
              strokeWidth: 2,
            }}
          />
        ))}
      </div>
    );
  };

  const fetchProviders = async () => {
    setLoading(true);
    try {
      let url = `${API}/services/providers/${category}?sort=${sort}`;
      if (minRating) url += `&minRating=${minRating}`;
      if (cityFilter) url += `&city=${cityFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setProviders(data.providers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProviders(); }, [category, sort, minRating, cityFilter]);

  const filtered = providers.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        .provider-card {
          background: white; border-radius: 16px;
          border: 1.5px solid #f1f5f9;
          padding: 20px; cursor: pointer;
          transition: all 0.2s ease;
          display: flex; gap: 16px; align-items: flex-start;
        }
        .provider-card:hover {
          border-color: #2563eb;
          box-shadow: 0 6px 20px rgba(37,99,235,0.1);
          transform: translateY(-2px);
        }
        .avatar {
          width: 56px; height: 56px; border-radius: 14px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem; font-weight: 700; color: white;
          flex-shrink: 0; font-family: 'Fraunces', serif;
        }
        .badge-verified {
          background: #dcfce7; color: #15803d;
          font-size: 0.7rem; font-weight: 600;
          padding: 2px 8px; border-radius: 20px;
        }
        .filter-select {
          padding: 8px 12px; border-radius: 10px;
          border: 1.5px solid #e2e8f0; background: white;
          font-size: 0.85rem; outline: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; color: #374151;
        }
        .filter-select:focus { border-color: #2563eb; }
        .search-wrap { position: relative; flex: 1; min-width: 200px; }
        .search-wrap input {
          width: 100%; padding: 10px 14px 10px 38px;
          border: 1.5px solid #e2e8f0; border-radius: 10px;
          font-size: 0.875rem; outline: none; background: white;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .search-wrap input:focus { border-color: #2563eb; }
        .book-btn {
          background: #2563eb; color: white; border: none;
          border-radius: 10px; padding: 8px 18px;
          font-size: 0.8rem; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.2s; white-space: nowrap;
        }
        .book-btn:hover { background: #1d4ed8; }
        .star { color: #f59e0b; }
        @media (max-width: 640px) {
          .provider-card { flex-direction: column; }
          .filter-row { flex-direction: column !important; }
        }
      `}</style>

      {/* Top nav */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "0 20px", height: 60, display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 50 }}>
        <button onClick={() => navigate("/services")}
          style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: "0.875rem" }}>
          <ArrowLeft style={{ width: 18, height: 18 }} /> Back
        </button>
        <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />
        <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, color: "#0f172a", fontSize: "1.05rem" }}>
          {CATEGORY_NAMES[category] || "Services"}
        </span>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px" }}>

        {/* Filters */}
        <div className="filter-row" style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <div className="search-wrap">
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#94a3b8" }} />
            <input placeholder="Search by name or city..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="createdAt">Latest</option>
            <option value="rating">Top Rated</option>
            <option value="experience">Most Experienced</option>
            <option value="reviews">Most Reviewed</option>
          </select>
          <select className="filter-select" value={minRating} onChange={e => setMinRating(e.target.value)}>
            <option value="">Any Rating</option>
            <option value="5">5 stars</option>
            <option value="4">4★ & above</option>
            <option value="3">3★ & above</option>
            <option value="2">2★ & above</option>
            <option value="1">1★ & above</option>
          </select>
          <input
            placeholder="Filter by city"
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: "0.85rem", outline: "none", fontFamily: "'DM Sans', sans-serif", width: 130 }}
          />
        </div>

        {/* Count */}
        <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: 16 }}>
          {loading ? "Loading..." : `${filtered.length} provider${filtered.length !== 1 ? "s" : ""} found`}
        </p>

        {/* List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
            <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
            Loading providers...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔍</div>
            <p style={{ color: "#64748b", fontSize: "1rem" }}>No verified providers found.</p>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Try adjusting your filters.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map(p => (
              <div key={p._id} className="provider-card">
                <div className="avatar">{p.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: "1rem", color: "#0f172a" }}>{p.name}</span>
                        <span className="badge-verified">✓ Verified</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem", color: "#64748b" }}>
                          <MapPin style={{ width: 13, height: 13 }} /> {p.city}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem", color: "#64748b" }}>
                          <Briefcase style={{ width: 13, height: 13 }} /> {p.experience} yrs exp
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem", color: "#64748b" }}>
                          <Clock style={{ width: 13, height: 13 }} /> {p.totalReviews || 0} reviews
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {renderAverageStars(p.rating)}
                      <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#0f172a" }}>{p.rating > 0 ? p.rating.toFixed(1) : "New"}</span>
                    </div>
                  </div>
                  {p.serviceDescription && (
                    <p style={{ fontSize: "0.82rem", color: "#64748b", marginTop: 8, lineHeight: 1.5 }}>
                      {p.serviceDescription.slice(0, 120)}{p.serviceDescription.length > 120 ? "..." : ""}
                    </p>
                  )}
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                    <button className="book-btn" onClick={() => navigate(user ? `/book/${p._id}` : "/login")}>
                      Book Now →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
