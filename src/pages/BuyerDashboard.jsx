import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

import { ShoppingBag, Heart, Search, Package, ArrowRight, Loader, Filter, SlidersHorizontal, ChevronDown, Check, X, Sparkles, MessageCircle, Tag, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [orderedProductIds, setOrderedProductIds] = useState(new Set());
  const [walletBalance, setWalletBalance] = useState(0);
  const [upcomingGift, setUpcomingGift] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [coupons, setCoupons] = useState([]);
  


  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    maxPrice: 20000,
    onlyPrevious: false
  });
  const [pendingFilters, setPendingFilters] = useState({ ...filters });

  useEffect(() => {
    fetchProducts();
    fetchWishlist();
    fetchOrders();
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
        const [walletRes, upcomingRes, couponRes] = await Promise.all([
            axios.get('/wallet/summary'),
            axios.get('/auto-gift-calendar/upcoming'),
            axios.get('/coupons/active')
        ]);
        
        if (walletRes.data.success) {
            setWalletBalance(walletRes.data.data.balance || 0);
        }
        
        if (upcomingRes.data.success && upcomingRes.data.data.length > 0) {
            setUpcomingGift(upcomingRes.data.data[0]);
        }

        if (couponRes.data.success) {
            setCoupons(couponRes.data.data || []);
        }
    } catch (err) {
        console.error('Summary fetch error:', err);
    }
  };



  const applyFilters = () => {
    setFilters({ ...pendingFilters });
    setShowFilters(false);
    success("Filters applied!");
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/products');
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
        const res = await axios.get('/wishlist');
        if (res.data.success) {
            // Safely map products, filtering out any that might be null (e.g. if product was deleted)
            const ids = new Set(res.data.data.products.filter(p => p.product).map(p => p.product._id));
            setWishlistIds(ids);
        }
    } catch (err) {
        console.error('Wishlist fetch error:', err);
    }
  };

  const fetchOrders = async () => {
    try {
        const res = await axios.get('/payment/orders'); // Corrected from my-orders to orders
        if (res.data.success) {
            // Updated field name to match backend schema (products instead of items)
            // Added safe navigation and fallback empty array for mapping
            const ids = new Set(res.data.data.flatMap(o => (o.products || []).map(i => i.product?._id || i.product)).filter(id => id));
            setOrderedProductIds(ids);
            setTotalOrders(res.data.data.length);
        }
    } catch (err) {
        console.error('Orders fetch error:', err);
    }
  };

  const toggleWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
        if (wishlistIds.has(productId)) {
            await axios.delete(`/wishlist/${productId}`);
            setWishlistIds(prev => {
                const next = new Set(prev);
                next.delete(productId);
                return next;
            });
            success("Removed from favorites");
        } else {
            await axios.post('/wishlist/add', { productId });
            setWishlistIds(prev => new Set(prev).add(productId));
            success("Added to favorites!");
        }
    } catch (err) {
        error("Failed to update favorites");
    }
  };

  // Filter Logic
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return products.filter(p => {
        const matchesName = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = p.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPrice = p.basePrice <= filters.maxPrice;
        const matchesOrdered = !filters.onlyPrevious || orderedProductIds.has(p._id);
        return (matchesName || matchesCategory) && matchesPrice && matchesOrdered;
    });
  }, [searchTerm, products, filters, orderedProductIds]);

  const allFilteredProducts = useMemo(() => {
    return products.filter(p => {
        const matchesPrice = p.basePrice <= filters.maxPrice;
        const matchesOrdered = !filters.onlyPrevious || orderedProductIds.has(p._id);
        return matchesPrice && matchesOrdered;
    });
  }, [products, filters, orderedProductIds]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Navbar />
      
      <main className="container animate-fade-in" style={{ padding: '0.5rem 2rem 3rem 2rem', maxWidth: '1400px', margin: '0 auto', flex: 1 }}>
        
        {/* Premium Status Hub */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.5rem', marginBottom: '2rem' }}>
            {/* Wallet Card */}
            <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--accent-primary)20', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(15, 23, 42, 0.2) 100%)' }}>
                <div style={{ background: 'var(--accent-primary)', padding: '0.75rem', borderRadius: '16px', color: 'white', boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)' }}>
                    <ShoppingBag size={20} />
                </div>
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wallet Balance</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-primary)' }}>₹{walletBalance.toLocaleString()}</div>
                </div>
                <Link to="/wallet" style={{ marginLeft: 'auto', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: '700', textDecoration: 'none' }}>Add +</Link>
            </div>

            {/* Upcoming Occasion Card */}
            <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--accent-secondary)20' }}>
                <div style={{ background: 'var(--accent-secondary)', padding: '0.75rem', borderRadius: '16px', color: 'white', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)' }}>
                    <Calendar size={20} />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Next Event</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {upcomingGift ? upcomingGift.recipientName : 'No events scheduled'}
                    </div>
                </div>
                <Link to="/auto-gifting" style={{ color: 'var(--text-muted)' }}><ArrowRight size={16}/></Link>
            </div>

            {/* Orders Summary Card */}
            <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '16px', color: 'var(--text-primary)' }}>
                    <Package size={20} />
                </div>
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Orders</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-primary)' }}>{totalOrders}</div>
                </div>
                <Link to="/orders" style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}><ArrowRight size={16}/></Link>
            </div>
        </div>

        {/* Coupons/Offers Section */}
        {coupons.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Tag size={20} color="var(--accent-primary)" />
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>Available Offers</h3>
                </div>
                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {coupons.map(coupon => (
                        <div key={coupon._id} className="glass-panel" style={{ minWidth: '280px', padding: '1rem', borderRadius: '18px', border: '1px dashed var(--accent-primary)40', background: 'rgba(139, 92, 246, 0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '700' }}>{coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}</div>
                                <div style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--accent-primary)', letterSpacing: '0.05em' }}>{coupon.code}</div>
                            </div>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(coupon.code);
                                    success("Coupon code copied!");
                                }}
                                style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer' }}
                            >
                                COPY
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Extreme Top Search Hero */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
            <h1 style={{ fontSize: '2.4rem', fontWeight: '900', marginBottom: '0.8rem', letterSpacing: '-0.04em' }}>
                Discover <span style={{ color: 'var(--accent-primary)' }}>Perfect</span> Gifts
            </h1>
            
            <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', gap: '0.6rem', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.35rem', borderRadius: '18px', border: '1px solid var(--border-light)' }}>
                {/* Gifting AI Button (NEW) */}
                <Link to="/gifting-ai" style={{ textDecoration: 'none' }}>
                    <button 
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem 1rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', fontSize: '0.8rem', border: '1px solid var(--accent-primary)30', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)', whiteSpace: 'nowrap' }}
                    >
                        <Sparkles size={16} /> Gifting AI
                    </button>
                </Link>

                {/* Search Box */}
                <div style={{ position: 'relative', flex: 1 }}>
                    <input 
                        type="text" 
                        placeholder="What are you looking for today?" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field"
                        style={{ padding: '0.6rem 3rem 0.6rem 1rem', fontSize: '0.9rem', borderRadius: '14px', border: 'none', background: 'transparent', marginBottom: 0, width: '100%' }}
                    />
                    <button 
                        onClick={handleSearch}
                        style={{ position: 'absolute', right: '0.3rem', top: '50%', transform: 'translateY(-50%)', background: 'var(--accent-primary)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)' }}
                    >
                        <Search size={14} />
                    </button>
                </div>
                
                {/* Filter Trigger */}
                <div style={{ position: 'relative' }}>
                    <button 
                        onClick={() => {
                            setPendingFilters({ ...filters });
                            setShowFilters(!showFilters);
                        }}
                        className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '0.5rem 1rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700', fontSize: '0.8rem', border: 'none' }}
                    >
                        <SlidersHorizontal size={14} /> Filters
                    </button>
                    
                    {showFilters && (
                        <div className="glass-panel animate-slide-up" style={{ position: 'absolute', top: '130%', right: 0, width: '280px', padding: '1.25rem', zIndex: 100, textAlign: 'left', border: '1px solid var(--border-light)', boxShadow: '0 20px 50px rgba(0,0,0,0.4)', borderRadius: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800' }}>Filter Options</h4>
                                <button onClick={() => setShowFilters(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16}/></button>
                            </div>
                            
                            <div style={{ marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Max Price</label>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '800' }}>₹{pendingFilters.maxPrice}</span>
                                </div>
                                <input 
                                    type="range" min="500" max="50000" step="500" value={pendingFilters.maxPrice} 
                                    onChange={(e) => setPendingFilters({...pendingFilters, maxPrice: e.target.value})}
                                    style={{ width: '100%', accentColor: 'var(--accent-primary)', height: '4px' }}
                                />
                            </div>
                            
                            <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={pendingFilters.onlyPrevious} 
                                        onChange={(e) => setPendingFilters({...pendingFilters, onlyPrevious: e.target.checked})}
                                        style={{ width: '14px', height: '14px', accentColor: 'var(--accent-primary)' }}
                                    />
                                    <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Previously Ordered</span>
                                </label>
                            </div>

                            <button 
                                onClick={applyFilters}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
                            >
                                <Check size={14} /> Apply Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>


        {/* Search Results Section */}
        {searchTerm.trim() && (
            <section className="animate-fade-in" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Search color="var(--accent-primary)" size={20} /> Results for "{searchTerm}"
                </h2>
                {searchResults.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        {searchResults.map(product => <ProductCard key={product._id} product={product} wishlistIds={wishlistIds} toggleWishlist={toggleWishlist} />)}
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1.5rem' }}>No products match your search.</p>
                )}
                
                {/* Thin Dividing Line */}
                <div style={{ height: '2px', background: 'var(--accent-primary)15', margin: '2rem 0', borderRadius: '10px' }}></div>
            </section>
        )}

        {/* Full Marketplace Section */}
        <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '-0.02em' }}>
                <Package color="var(--accent-primary)" size={24} /> Featured Collection
            </h2>
            
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <Loader className="animate-spin" size={28} color="var(--accent-primary)" />
                    <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>Curating marketplace...</p>
                </div>
            ) : allFilteredProducts.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    {allFilteredProducts.map(product => (
                        <ProductCard key={product._id} product={product} wishlistIds={wishlistIds} toggleWishlist={toggleWishlist} />
                    ))}
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', borderRadius: '24px' }}>
                    <Package size={48} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No products found</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your filters to find more gifts.</p>
                </div>
            )}
        </section>
      </main>

      {/* Voice Assistant Floating UI - Moved outside main for better fixed positioning */}

    </div>
  );
};

const ProductCard = ({ product, wishlistIds, toggleWishlist }) => (
    <div id={`product-card-${product._id}`} className="glass-panel hover-scale" style={{ 
        padding: 0, 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column', 
        borderRadius: '24px', 
        border: '1px solid var(--border-light)', 
        position: 'relative',
        height: '340px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
        <button 
            id={`wishlist-btn-${product._id}`}
            onClick={(e) => toggleWishlist(e, product._id)}
            style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: wishlistIds.has(product._id) ? '#ef4444' : 'white', transition: 'all 0.2s' }}
        >
            <Heart size={18} fill={wishlistIds.has(product._id) ? '#ef4444' : 'transparent'} />
        </button>

        <Link id={`product-link-${product._id}`} to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                <img src={product.images?.[0]?.url || 'https://via.placeholder.com/400x300'} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }} className="card-img" />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(15, 23, 42, 0.8))', opacity: 0.6 }}></div>
            </div>
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: '900', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>{product.category}</div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.6rem', color: 'var(--text-primary)', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h3>
                    <p style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--accent-primary)' }}>₹</span>{product.basePrice}
                    </p>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                         <Sparkles size={12} color="var(--accent-secondary)" />
                         <span>98% Match</span>
                    </div>
                    <div id={`view-btn-${product._id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: '800', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)20' }}>
                        Details
                    </div>
                </div>
            </div>
        </Link>
    </div>
);

export default BuyerDashboard;
