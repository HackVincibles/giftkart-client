import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { PriceSlider } from '../components/PriceSlider';
import { Label } from '@/components/ui/label';
import { Heart, Search, Filter, Sparkles, Loader, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import SearchSuggestions from '../components/SearchSuggestions';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('artisan_vault_products');
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [vibeConcepts, setVibeConcepts] = useState([]);
  const [loading, setLoading] = useState(products.length === 0);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ minPrice: 0, maxPrice: 200000 });
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, wishRes, vibeRes] = await Promise.allSettled([
          axios.get('/products?limit=100'),
          axios.get('/wishlist'),
          axios.get('/vibe/my-concepts')
        ]);

        if (prodRes.status === 'fulfilled' && prodRes.value.data.success) {
          const data = prodRes.value.data.data;
          setProducts(data);
          localStorage.setItem('artisan_vault_products', JSON.stringify(data));
        }

        if (wishRes.status === 'fulfilled' && wishRes.value.data.success) {
          const ids = new Set(wishRes.value.data.data.products.filter(p => p.product).map(p => p.product._id));
          setWishlistIds(ids);
        }

        if (vibeRes.status === 'fulfilled' && vibeRes.value.data.success) {
          setVibeConcepts(vibeRes.value.data.data);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    if (query.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    setShowSuggestions(true);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await axios.get(`/search/suggestions?q=${query}`);
        if (res.data.success) setSuggestions(res.data.suggestions);
      } catch (err) { console.error(err); }
    }, 300);
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Smart Price Logic: Only filter if user has explicitly set a range
      // If min is 0 and max is very high (default) or not provided, show all
      const hasMinSet = filters.minPrice > 0;
      const hasMaxSet = filters.maxPrice > 0 && filters.maxPrice < 200000;
      
      let matchesPrice = true;
      if (hasMinSet && hasMaxSet) {
        matchesPrice = p.basePrice >= filters.minPrice && p.basePrice <= filters.maxPrice;
      } else if (hasMinSet) {
        matchesPrice = p.basePrice >= filters.minPrice;
      } else if (hasMaxSet) {
        matchesPrice = p.basePrice <= filters.maxPrice;
      }
      
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesPrice && matchesCategory;
    });

    if (sortBy === 'price-low') result.sort((a, b) => a.basePrice - b.basePrice);
    else if (sortBy === 'price-high') result.sort((a, b) => b.basePrice - a.basePrice);
    else if (sortBy === 'newest') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return result;
  }, [products, searchTerm, filters, sortBy, selectedCategory]);

  const categories = useMemo(() => {
    return ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
  }, [products]);

  const toggleWishlist = async (e, productId) => {
    e.preventDefault(); e.stopPropagation();
    try {
      if (wishlistIds.has(productId)) {
        await axios.delete(`/wishlist/${productId}`);
        setWishlistIds(prev => { const next = new Set(prev); next.delete(productId); return next; });
        success?.("Removed from favorites");
      } else {
        await axios.post('/wishlist/add', { productId });
        setWishlistIds(prev => new Set(prev).add(productId));
        success?.("Added to favorites!");
      }
    } catch (err) { error?.("Failed to update favorites"); }
  };

  const handlePriceChange = React.useCallback((val) => {
    setFilters(prev => {
      if (prev.minPrice === val[0] && prev.maxPrice === val[1]) return prev;
      return { ...prev, minPrice: val[0], maxPrice: val[1] };
    });
  }, []);

  return (
    <div className="kl-root" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ paddingTop: '10rem', paddingBottom: '8rem', maxWidth: '1400px', margin: '0 auto', paddingLeft: '2rem', paddingRight: '2rem' }}>
        <header style={{ textAlign: 'center', marginBottom: '10rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 1.2rem', background: 'var(--bg-secondary)', borderRadius: '100px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent)', marginBottom: '2.5rem', border: '1px solid var(--border)', fontWeight: '900' }}>
            <Sparkles size={14} /> CURATED GIFT INTELLIGENCE
          </div>
          <h1 style={{ fontSize: 'clamp(3rem, 7vw, 5rem)', fontWeight: '900', letterSpacing: '-0.05em', lineHeight: '1.05', marginBottom: '4rem' }}>
            Discovery for the <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontWeight: '300' }}>discerning.</span>
          </h1>

          <div className="discovery-tab-container" style={{
            maxWidth: '1200px',
            margin: '0 auto',
            textAlign: 'left',
            position: 'relative'
          }}>
            {/* Unified Discovery Row */}
            <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                alignItems: 'center',
                background: 'transparent'
            }}>
              {/* Search Section */}
              <div ref={searchRef} style={{ flex: 2.5, position: 'relative' }}>
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  background: 'var(--bg-secondary)',
                  padding: '0.4rem',
                  borderRadius: '100px',
                  border: '1px solid var(--border)',
                  alignItems: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1.5rem', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Search for artisan gifts..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        padding: '1rem 1rem 1rem 4rem',
                        outline: 'none',
                        fontSize: '0.95rem',
                        color: 'var(--text)',
                        fontWeight: '600'
                      }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.4rem', marginRight: '0.4rem' }}>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        style={{
                        background: showFilters ? 'var(--text)' : 'transparent',
                        color: showFilters ? 'var(--bg)' : 'var(--text-muted)',
                        border: 'none',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                        }}
                        title="Filters"
                    >
                        <Filter size={16} />
                    </button>
                    <button
                        onClick={() => navigate('/gifting-ai')}
                        style={{
                        background: 'var(--gradient-primary)',
                        color: '#fff',
                        border: 'none',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(255, 51, 102, 0.2)'
                        }}
                        title="AI Gift Finder"
                    >
                        <Sparkles size={16} />
                    </button>
                  </div>
                </div>
                {showSuggestions && suggestions.length > 0 && (
                  <SearchSuggestions
                    suggestions={suggestions}
                    onSelect={(s) => { setSearchTerm(s.name || s); setShowSuggestions(false); }}
                    onClose={() => setShowSuggestions(false)}
                  />
                )}
              </div>

              {/* Min Price Box */}
              <div style={{ flex: 0.6, position: 'relative' }}>
                <div style={{
                  background: 'var(--bg-secondary)',
                  padding: '0 1.2rem',
                  borderRadius: '100px',
                  border: '1px solid var(--border)',
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)' }}>₹</span>
                  <input 
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice || ''}
                    onChange={(e) => handlePriceChange([parseInt(e.target.value) || 0, filters.maxPrice])}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: '0.85rem',
                      color: 'var(--text)',
                      fontWeight: '700'
                    }}
                  />
                </div>
              </div>

              {/* Max Price Box */}
              <div style={{ flex: 0.6, position: 'relative' }}>
                <div style={{
                  background: 'var(--bg-secondary)',
                  padding: '0 1.2rem',
                  borderRadius: '100px',
                  border: '1px solid var(--border)',
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)' }}>₹</span>
                  <input 
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handlePriceChange([filters.minPrice, parseInt(e.target.value) || 0])}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: '0.85rem',
                      color: 'var(--text)',
                      fontWeight: '700'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Floating Filter Card */}
            {showFilters && (
              <div className="animate-fade-in" style={{
                position: 'absolute',
                top: 'calc(100% + 1rem)',
                left: 0,
                width: '400px',
                background: 'var(--bg-secondary)',
                borderRadius: '24px',
                border: '1px solid var(--border)',
                padding: '2rem',
                boxShadow: 'var(--shadow-2xl)',
                zIndex: 100,
                backdropFilter: 'blur(20px)'
              }}>
                <div style={{ marginBottom: '2rem' }}>
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 block">Categories</Label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        style={{
                          padding: '0.6rem 1.2rem',
                          borderRadius: '100px',
                          border: '1px solid var(--border)',
                          fontSize: '0.8rem',
                          fontWeight: '800',
                          background: selectedCategory === cat ? 'var(--text)' : 'transparent',
                          color: selectedCategory === cat ? 'var(--bg)' : 'var(--text-muted)',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 block">Sort By</Label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        padding: '0.9rem 1.2rem',
                        borderRadius: '14px',
                        color: 'var(--text)',
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        appearance: 'none',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="newest">Newest Arrivals</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="popular">Most Popular</option>
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="discovery-section">
          <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '0.5rem' }}>The Marketplace</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{filteredProducts.length} items meticulously curated for your aesthetic.</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', outline: 'none', fontWeight: '600' }}
              >
                <option value="newest">Sort by: Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '3rem' }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton-card" />
              ))}
            </div>
          ) : (
            <div className="commerce-grid">
              {filteredProducts.map(p => (
                <div key={p._id} className="commerce-card" onClick={() => navigate(`/product/${p._id}`)}>
                  <div className="card-image-container">
                    <img src={p.images?.[0]?.url || 'https://via.placeholder.com/800'} alt={p.name} loading="lazy" />
                    <div className="card-overlay">
                      <button onClick={(e) => toggleWishlist(e, p._id)} className="wish-btn">
                        <Heart size={20} fill={wishlistIds.has(p._id) ? '#ef4444' : 'transparent'} stroke={wishlistIds.has(p._id) ? '#ef4444' : 'currentColor'} />
                      </button>
                      <div className="quick-view">Quick View</div>
                    </div>
                  </div>
                  <div className="card-details">
                    <div className="card-meta">
                      <span className="card-category">{p.category}</span>
                      <span className="card-rating"><Star size={12} fill="#fbbf24" stroke="none" /> 4.9</span>
                    </div>
                    <h4 className="card-title">{p.name}</h4>
                    <div className="card-bottom">
                      <div className="card-price">₹{p.basePrice.toLocaleString()}</div>
                      <div className="view-link">Details <ArrowRight size={14} /></div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '10rem 0', color: 'var(--text-muted)' }}>
                  <Search size={48} style={{ opacity: 0.1, marginBottom: '2rem' }} />
                  <h2 style={{ fontWeight: '800' }}>No products found</h2>
                  <p>Try adjusting your search or filters.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <style>{`
        .commerce-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 4rem 3rem;
        }

        .commerce-card {
          cursor: pointer;
          transition: transform 0.4s cubic-bezier(0.2, 1, 0.3, 1);
        }

        .commerce-card:hover {
          transform: translateY(-12px);
        }

        .card-image-container {
          position: relative;
          aspect-ratio: 4/5;
          border-radius: 24px;
          overflow: hidden;
          background: #0a0a0a;
          margin-bottom: 1.8rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .card-image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.8s cubic-bezier(0.2, 1, 0.3, 1);
        }

        .commerce-card:hover .card-image-container img {
          transform: scale(1.1);
        }

        .card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.4));
          opacity: 0;
          transition: 0.3s opacity;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.5rem;
        }

        .commerce-card:hover .card-overlay {
          opacity: 1;
        }

        .wish-btn {
          align-self: flex-end;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.2s;
          color: #111;
        }

        .wish-btn:hover {
          transform: scale(1.1);
        }

        .quick-view {
          background: white;
          color: black;
          padding: 0.8rem;
          border-radius: 12px;
          text-align: center;
          font-weight: 800;
          font-size: 0.8rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .card-details {
          padding: 0 0.5rem;
        }

        .card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.6rem;
        }

        .card-category {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
        }

        .card-rating {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .card-title {
          font-size: 1.3rem;
          font-weight: 800;
          margin-bottom: 1rem;
          color: var(--text);
        }

        .card-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-price {
          font-size: 1.2rem;
          font-weight: 900;
          color: var(--accent-primary);
        }

        .view-link {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.4rem;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s;
        }

        .commerce-card:hover .view-link {
          opacity: 1;
          transform: translateX(0);
        }

        .skeleton-card {
          aspect-ratio: 4/5;
          border-radius: 24px;
          background: rgba(255,255,255,0.02);
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 0.8; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

const Star = ({ size, fill, stroke }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ArrowRight = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export default BuyerDashboard;
