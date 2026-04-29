import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, Sparkles, Gift, Clock, Tag, ExternalLink } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const PublicWishlist = () => {
  const { wishlistId } = useParams();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicWishlist = async () => {
      try {
        setLoading(true);
        // Use the public endpoint
        const res = await axios.get(`/wishlist/public/${wishlistId}`);
        if (res.data.success) {
          setWishlist(res.data.data);
        }
      } catch (err) {
        console.error("Public wishlist error:", err);
        setError(err.response?.data?.message || "This wishlist is private or doesn't exist.");
      } finally {
        setLoading(false);
      }
    };
    fetchPublicWishlist();
  }, [wishlistId]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Loading shared collection...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Navbar />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh', padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Oops! Gift List Restricted</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{error}</p>
        <Link to="/" className="btn btn-primary">Go to GiftKart</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', paddingBottom: '5rem' }}>
      <Navbar />
      
      <main className="container animate-fade-in" style={{ padding: '4rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)', padding: '0.5rem 1rem', borderRadius: '30px', marginBottom: '1.5rem', border: '1px solid var(--accent-primary)20' }}>
            <Sparkles size={16} />
            <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Shared Collection</span>
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '1rem', letterSpacing: '-0.04em' }}>{wishlist?.name || 'Curated Gift Ideas'}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            A curated selection of meaningful gifts. Feel free to browse and find something special!
          </p>
        </div>

        {wishlist?.products?.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}>
            {wishlist.products.map((item, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '24px', border: '1px solid var(--border-light)' }}>
                <div style={{ position: 'relative', height: '240px' }}>
                  <img 
                    src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/400x300'} 
                    alt={item.product?.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  {item.priority === 'high' && (
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(239, 68, 68, 0.9)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Heart size={14} fill="white" /> Top Choice
                    </div>
                  )}
                </div>
                
                <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>{item.product?.name}</h3>
                    <span style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--accent-primary)' }}>₹{item.product?.basePrice}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: '1.6', flex: 1 }}>
                    {item.product?.description?.substring(0, 120)}...
                  </p>
                  
                  <Link 
                    to={`/product/${item.product?._id}`} 
                    className="btn btn-secondary" 
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.8rem', borderRadius: '14px', fontSize: '0.95rem', fontWeight: '700' }}
                  >
                    View on Marketplace <ExternalLink size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '5rem', textAlign: 'center', borderRadius: '30px' }}>
            <Gift size={48} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>No items in this shared list yet.</h3>
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicWishlist;
