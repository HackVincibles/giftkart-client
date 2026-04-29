import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { 
    ShoppingBag, Heart, Search, Package, ArrowRight, Loader, Filter, 
    SlidersHorizontal, ChevronDown, Check, X, Sparkles, MessageCircle, 
    Tag, Calendar, Wallet 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error, info } = useToast();

  // Core Marketplace State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [orderedProductIds, setOrderedProductIds] = useState(new Set());
  const [coupons, setCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ maxPrice: 50000, onlyPrevious: false });
  const [pendingFilters, setPendingFilters] = useState({ maxPrice: 50000, onlyPrevious: false });

  // Data Fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, wishRes, orderRes, couponRes] = await Promise.allSettled([
          axios.get('/products'),
          axios.get('/wishlist'),
          axios.get('/payment/orders'),
          axios.get('/coupons/active')
        ]);

        if (prodRes.status === 'fulfilled' && prodRes.value.data.success) setProducts(prodRes.value.data.data);
        if (wishRes.status === 'fulfilled' && wishRes.value.data.success) {
          const ids = new Set(wishRes.value.data.data.products.filter(p => p.product).map(p => p.product._id));
          setWishlistIds(ids);
        }
        if (orderRes.status === 'fulfilled' && orderRes.value.data.success) {
          const ids = new Set(orderRes.value.data.data.flatMap(o => (o.products || []).map(i => i.product?._id || i.product)).filter(id => id));
          setOrderedProductIds(ids);
        }
        if (couponRes.status === 'fulfilled' && couponRes.value.data.success) setCoupons(couponRes.value.data.data || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = !searchTerm || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = p.basePrice <= filters.maxPrice;
      const matchesPrevious = !filters.onlyPrevious || orderedProductIds.has(p._id);
      return matchesSearch && matchesPrice && matchesPrevious;
    });
  }, [products, searchTerm, filters, orderedProductIds]);

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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main className="container animate-fade-in" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', flex: 1, width: '100%' }}>
        
        {/* Search Hero Area */}
        <div style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '1.5rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '1.5rem', letterSpacing: '-0.04em' }}>Find the <span style={{ color: 'var(--accent-primary)' }}>Perfect</span> Gift</h1>
          
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '22px', border: '1px solid var(--border-light)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            
            <Link to="/gifting-ai" style={{ textDecoration: 'none' }}>
                <button className="btn btn-secondary" style={{ padding: '0.7rem 1.5rem', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '800', fontSize: '0.9rem', border: '1px solid var(--accent-primary)30', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)', whiteSpace: 'nowrap' }}>
                    <Sparkles size={20} /> Gifting AI
                </button>
            </Link>

            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
              <Search size={22} style={{ position: 'absolute', left: '1.25rem', color: 'var(--text-muted)' }} />
              <input 
                type="text" placeholder="Search for anyone or any occasion..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', padding: '0.8rem 1rem 0.8rem 3.75rem', outline: 'none', fontSize: '1.1rem' }}
              />
            </div>

            <button onClick={() => setShowFilters(!showFilters)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: '18px', padding: '0.7rem 1.5rem', fontWeight: '700', fontSize: '0.95rem' }}>
              <Filter size={20} /> Filters
            </button>
          </div>
          
          {showFilters && (
            <div className="glass-panel animate-slide-up" style={{ maxWidth: '400px', margin: '1.25rem auto', padding: '1.75rem', borderRadius: '26px', textAlign: 'left', border: '1px solid var(--border-light)', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span style={{ fontWeight: '800', fontSize: '1rem' }}>Budget Limit: ₹{pendingFilters.maxPrice.toLocaleString()}</span>
              </div>
              <input type="range" min="500" max="100000" step="500" value={pendingFilters.maxPrice} onChange={e => setPendingFilters({...pendingFilters, maxPrice: parseInt(e.target.value)})} style={{ width: '100%', accentColor: 'var(--accent-primary)', marginBottom: '1.75rem' }} />
              <button onClick={() => { setFilters({...pendingFilters}); setShowFilters(false); }} className="btn btn-primary" style={{ width: '100%', borderRadius: '16px', fontWeight: '800', padding: '1rem', fontSize: '1rem' }}>Apply Filters</button>
            </div>
          )}
        </div>

        {/* Product Grid */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
            <Package size={30} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: 0, letterSpacing: '-0.02em' }}>{searchTerm ? `Found Gifts for "${searchTerm}"` : 'Curated Marketplace'}</h2>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '7rem 2rem' }}>
              <Loader className="animate-spin" size={48} color="var(--accent-primary)" />
              <p style={{ marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: '600' }}>Loading your collection...</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2.5rem' }}>
              {filteredProducts.map(p => (
                <ProductCard key={p._id} product={p} wishlistIds={wishlistIds} toggleWishlist={toggleWishlist} />
              ))}
            </div>
          )}
        </section>
      </main>

    </div>
  );
};

const ProductCard = ({ product, wishlistIds, toggleWishlist }) => (
  <div className="glass-panel hover-scale" style={{ borderRadius: '32px', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.02)' }}>
    <button onClick={(e) => toggleWishlist(e, product._id)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', border: 'none', borderRadius: '16px', width: '48px', height: '48px', color: wishlistIds.has(product._id) ? '#ef4444' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }}>
      <Heart size={24} fill={wishlistIds.has(product._id) ? '#ef4444' : 'transparent'} />
    </button>
    <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
        <img src={product.images?.[0]?.url || 'https://via.placeholder.com/400'} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem', background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95), transparent)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '900', color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{product.category}</span>
        </div>
      </div>
      <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.8rem', color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>{product.name}</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>₹{product.basePrice.toLocaleString()}</p>
        </div>
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <Sparkles size={18} color="var(--accent-secondary)" />
            <span style={{ fontWeight: '800' }}>AI Recommended</span>
          </div>
          <div className="btn btn-secondary" style={{ padding: '0.7rem 1.75rem', borderRadius: '16px', fontSize: '1rem', fontWeight: '800' }}>View Details</div>
        </div>
      </div>
    </Link>
  </div>
);

export default BuyerDashboard;
