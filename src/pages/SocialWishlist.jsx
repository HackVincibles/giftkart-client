import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { ShoppingBag, Heart, Search, Package, ArrowRight, Loader, Users, TrendingUp, Award, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const SocialWishlist = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { error } = useToast();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [wishlistIds, setWishlistIds] = useState(new Set());

    useEffect(() => {
        fetchSocialWishlist();
        fetchUserWishlist();
    }, []);

    const fetchSocialWishlist = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/products/social/wishlist');
            if (res.data.success) {
                setProducts(res.data.data);
            }
        } catch (err) {
            error('Failed to load social wishlist');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserWishlist = async () => {
        try {
            const res = await axios.get('/wishlist');
            if (res.data.success) {
                setWishlistIds(new Set(res.data.data.products.map(p => p._id)));
            }
        } catch (err) {
            console.error('Error fetching user wishlist:', err);
        }
    };

    const toggleWishlist = async (e, productId) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const isWishlisted = wishlistIds.has(productId);
            if (isWishlisted) {
                await axios.delete(`/wishlist/${productId}`);
                const newIds = new Set(wishlistIds);
                newIds.delete(productId);
                setWishlistIds(newIds);
            } else {
                await axios.post('/wishlist', { productId });
                setWishlistIds(new Set([...wishlistIds, productId]));
            }
        } catch (err) {
            error('Wishlist action failed');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <Navbar />
            
            <main className="container animate-fade-in" style={{ padding: '2rem 1rem 4rem 1rem', maxWidth: '1400px', margin: '0 auto', flex: 1 }}>
                {/* Hero Header */}
                <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 1.25rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '100px', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: '800', marginBottom: '1.25rem', border: '1px solid var(--accent-primary)30' }}>
                        <Users size={14} /> COMMUNITY TRENDS
                    </div>
                    <h1 className="dashboard-title" style={{ fontWeight: '900', marginBottom: '1rem', letterSpacing: '-0.04em' }}>
                        Social <span className="text-gradient">Wishlist</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Discover what the GiftKart community is loving right now.
                    </p>
                </div>


                {loading ? (
                    <div style={{ textAlign: 'center', padding: '5rem' }}>
                        <Loader className="animate-spin" size={40} color="var(--accent-primary)" />
                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Analyzing community trends...</p>
                    </div>
                ) : (
                    <div className="social-grid">


                        {products.map((product, index) => (
                            <div key={product._id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                                <SocialProductCard 
                                    product={product} 
                                    rank={index + 1}
                                    wishlistIds={wishlistIds} 
                                    toggleWishlist={toggleWishlist} 
                                />
                            </div>
                        ))}
                    </div>
                )}
            </main>
            
            <style>{`
                .social-grid {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 2.5rem;
                    width: 100%;
                }
                @media (min-width: 640px) {
                    .social-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (min-width: 1024px) {
                    .social-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
                @media (min-width: 1400px) {
                    .social-grid {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }
            `}</style>
        </div>
    );
};

const SocialProductCard = ({ product, rank, wishlistIds, toggleWishlist }) => (
    <div className="glass-panel hover-scale" style={{ 
        padding: 0, 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column', 
        borderRadius: '24px', 
        border: '1px solid var(--border-light)', 
        position: 'relative',
        height: '420px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
        {/* Rank Badge */}
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, background: 'linear-gradient(135deg, #FF3366, #FF9933)', color: '#ffffff', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 15px rgba(255, 51, 102, 0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Award size={14} /> #{rank} TRENDING
        </div>

        <button 
            onClick={(e) => toggleWishlist(e, product._id)}
            style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: wishlistIds.has(product._id) ? '#ef4444' : 'white', transition: 'all 0.2s' }}
        >
            <Heart size={18} fill={wishlistIds.has(product._id) ? '#ef4444' : 'transparent'} />
        </button>

        <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '220px', overflow: 'hidden' }}>
                <img src={product.images?.[0]?.url || 'https://via.placeholder.com/400x300'} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="card-img" />
            </div>
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{product.name}</h3>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                            <TrendingUp size={14} color="var(--accent-secondary)" />
                            <span>{product.popularity?.orders || 0} Orders</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                            <Heart size={14} color="#ef4444" />
                            <span>{product.popularity?.wishlistCount || 0} Saved</span>
                        </div>
                    </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--accent-primary)', margin: 0 }}>₹{product.basePrice}</p>
                    <div className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: '700', borderRadius: '10px' }}>
                        View Details
                    </div>
                </div>
            </div>
        </Link>
    </div>
);

export default SocialWishlist;
