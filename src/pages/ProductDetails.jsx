import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Heart, ShoppingCart, Star, Clock, Shield, Sparkles, Plus, Minus, Loader, Gift, Box, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import Product3DPreview from '../components/Product3DPreview';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [viewMode, setViewMode] = useState('image'); // 'image' or '3d'
  const [customData, setCustomData] = useState({});
  const { success, error, info } = useToast();
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [suggesting, setSuggesting] = useState(false);
  
  const [activeScheduleId] = useState(localStorage.getItem('activeScheduleId'));
  const [activeScheduleRecipient] = useState(localStorage.getItem('activeScheduleRecipient'));
  const [isInWishlist, setIsInWishlist] = useState(false);

  const handleAddToSchedule = async () => {
    try {
      setLoading(true);
      await axios.post(`/auto-gift-calendar/${activeScheduleId}/select-gifts`, {
        selectedGifts: [{ product: product._id, quantity: quantity }]
      });
      success(`Added to ${activeScheduleRecipient}'s gift plan!`);
      localStorage.removeItem('activeScheduleId');
      localStorage.removeItem('activeScheduleRecipient');
      navigate('/auto-gifting');
    } catch (err) {
      error("Failed to add to schedule.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        if (id === '1' || id === '2') {
           setProduct(null);
        } else {
          const res = await axios.get(`/products/${id}`);
          if (res.data.success) {
            setProduct(res.data.data);
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        error("Product not found or database error.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const checkWishlist = async () => {
      try {
        const res = await axios.get('/wishlist');
        if (res.data.success) {
          const exists = res.data.data.products.some(p => p.product?._id === id);
          setIsInWishlist(exists);
        }
      } catch (err) {
        console.error("Wishlist check error:", err);
      }
    };
    if (product) checkWishlist();
  }, [id, product]);

  const handleToggleWishlist = async () => {
    try {
      if (isInWishlist) {
        await axios.delete(`/wishlist/${product._id}`);
        setIsInWishlist(false);
        success("Removed from favorites");
      } else {
        await axios.post('/wishlist/add', { productId: product._id });
        setIsInWishlist(true);
        success("Added to favorites!");
      }
    } catch (err) {
      error("Failed to update favorites");
    }
  };

  const handleAddToCart = async () => {
    if (!product) return error("Cannot add a non-existent product to cart.");
    try {
      setLoading(true);
      await axios.post('/cart/add', {
        productId: product._id,
        quantity: quantity,
        customizationId: null,
        selectedVariants: customData
      });
      success("Added to cart successfully!");
    } catch (err) {
      error(err.response?.data?.message || "Failed to add to cart.");
    } finally {
      setLoading(false);
    }
  };

  const getAiSuggestion = async () => {
    try {
      setSuggesting(true);
      const res = await axios.post('/ai/personalization-suggestion', {
        productName: product.name,
        description: product.description,
        category: product.category
      });
      if (res.data.success) {
        setAiSuggestion(res.data.suggestion);
        info("AI has a creative idea for you!");
      }
    } catch (err) {
      error("AI is shy right now. Try again later.");
    } finally {
      setSuggesting(false);
    }
  };

  const handleOrderNow = async () => {
    if (!product) return error("Cannot order a non-existent product.");
    try {
      setLoading(true);
      await axios.post('/cart/add', {
        productId: product._id,
        quantity: quantity,
        customizationId: null,
        selectedVariants: customData
      });
      navigate('/cart');
    } catch (err) {
      error(err.response?.data?.message || "Failed to initiate order.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader className="animate-spin" color="var(--accent-primary)" size={48} />
      </div>
    </div>
  );

  if (!product) return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Product Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>This product doesn't exist in our real database yet. Creators need to add products via the dashboard.</p>
        <button onClick={() => navigate('/buyer-dashboard')} className="btn btn-primary">Browse Gifts</button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      <main className="container animate-fade-in" style={{ padding: '2rem 1rem', flex: 1 }}>
        <div className="product-details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          
          {/* Left: Images & 3D */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '0.4rem', borderRadius: '24px', overflow: 'hidden', position: 'relative', height: '100%', aspectRatio: '1/1' }}>
              
              {/* Toggle View Mode */}
              <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10, display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => setViewMode('image')}
                  style={{ 
                    padding: '0.6rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
                    background: viewMode === 'image' ? 'var(--accent-primary)' : 'rgba(0,0,0,0.5)',
                    color: 'white', backdropFilter: 'blur(10px)', transition: 'all 0.3s'
                  }}
                  title="View Images"
                >
                  <ImageIcon size={20} />
                </button>
                <button 
                  onClick={() => setViewMode('3d')}
                  style={{ 
                    padding: '0.6rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
                    background: viewMode === '3d' ? 'var(--accent-primary)' : 'rgba(0,0,0,0.5)',
                    color: 'white', backdropFilter: 'blur(10px)', transition: 'all 0.3s'
                  }}
                  title="View 3D Model"
                >
                  <Box size={20} />
                </button>
              </div>

              {viewMode === 'image' ? (
                <img 
                  src={product.images?.[activeImage]?.url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800'} 
                  alt={product.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }}
                />
              ) : (
                <Product3DPreview product={product} />
              )}
            </div>
            
            {viewMode === 'image' && (
              <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {product.images?.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className="glass-panel"
                    style={{ 
                      flex: '0 0 70px', height: '70px', padding: '3px', 
                      border: activeImage === idx ? '2px solid var(--accent-primary)' : '1px solid var(--border-light)',
                      transition: 'all 0.2s', borderRadius: '12px'
                    }}
                  >
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-secondary)', marginBottom: '0.75rem' }}>
                <Sparkles size={14} />
                <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>{product.category?.replace('-', ' ')}</span>
              </div>
              
              <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', marginBottom: '0.75rem', lineHeight: '1.2', fontWeight: '900' }}>{product.name}</h1>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < Math.floor(product.averageRating || 4.5) ? "var(--warning)" : "none"} color="var(--warning)" />
                  ))}
                  <span style={{ marginLeft: '0.4rem', fontWeight: '700', fontSize: '0.9rem' }}>{product.averageRating || 4.5}</span>
                </div>
                <div style={{ width: '1px', height: '14px', background: 'var(--border-light)' }} className="mobile-hide"></div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{product.popularity?.orders || 120} Happy Customers</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-primary)' }}>₹{product.basePrice.toLocaleString()}</span>
                {product.pricing?.mrp > product.basePrice && (
                  <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{product.pricing.mrp.toLocaleString()}</span>
                )}
              </div>

              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                {product.description || "A beautifully crafted gift designed to create lasting memories. Hand-made by expert artisans with premium materials."}
              </p>

              {/* Customization Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {product.customizationOptions?.map(opt => (
                  <div key={opt.fieldName} className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontWeight: '700', fontSize: '0.85rem' }}>{opt.label}</label>
                    {opt.type === 'text' ? (
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder={opt.placeholder}
                        onChange={(e) => setCustomData({...customData, [opt.fieldName]: e.target.value})}
                      />
                    ) : (
                      <select 
                        className="input-field"
                        onChange={(e) => setCustomData({...customData, [opt.fieldName]: e.target.value})}
                      >
                        <option value="">Select Option</option>
                        {opt.options?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    )}
                  </div>
                ))}
              </div>

              {/* AI Suggestion Area */}
              <div style={{ marginTop: '1.5rem' }}>
                <button 
                  onClick={getAiSuggestion}
                  disabled={suggesting}
                  style={{ 
                    background: 'none', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)',
                    padding: '0.6rem 1rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800',
                    display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  className="hover-glow"
                >
                  <Sparkles size={16} className={suggesting ? 'animate-spin' : ''} />
                  {suggesting ? 'Generating Idea...' : 'AI Design Suggestion'}
                </button>
                
                {aiSuggestion && (
                  <div className="glass-panel animate-fade-in" style={{ marginTop: '1rem', padding: '1rem', borderLeft: '4px solid var(--accent-primary)', background: 'rgba(139, 92, 246, 0.05)' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0, fontStyle: 'italic' }}>
                      "{aiSuggestion}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.4rem', border: '1px solid var(--border-light)' }}>
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{ padding: '0.4rem', color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <Minus size={18} />
                  </button>
                  <span style={{ width: '36px', textAlign: 'center', fontSize: '1.1rem', fontWeight: '800' }}>{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    style={{ padding: '0.4rem', color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <Plus size={18} />
                  </button>
                </div>
                
                <span style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: '700' }}>
                  Low stock: {product.inventory?.stockCount || 5} left
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {activeScheduleId ? (
                  <button 
                    onClick={handleAddToSchedule}
                    className="btn btn-primary mobile-full-width" 
                    style={{ flex: 1, padding: '1rem', fontSize: '1rem', background: 'var(--accent-secondary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '800' }}
                  >
                    <Gift size={20} /> Add to Plan
                  </button>
                ) : (
                  <button 
                    onClick={handleOrderNow}
                    className="btn btn-primary mobile-full-width" 
                    style={{ flex: 1, padding: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '800' }}
                  >
                    Buy Now
                  </button>
                )}
                <button 
                  onClick={handleAddToCart}
                  className="btn btn-secondary mobile-full-width" 
                  style={{ flex: 1, padding: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '800' }}
                >
                  <ShoppingCart size={20} /> Cart
                </button>
                <button 
                  onClick={handleToggleWishlist}
                  className="btn btn-secondary" 
                  style={{ padding: '1rem', color: isInWishlist ? '#ef4444' : 'inherit', borderRadius: '16px' }}
                >
                  <Heart size={20} fill={isInWishlist ? '#ef4444' : 'transparent'} />
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem', borderRadius: '16px' }}>
                <Clock size={16} color="var(--accent-secondary)" />
                <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Fast Shipping</span>
              </div>
              <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem', borderRadius: '16px' }}>
                <Shield size={16} color="var(--success)" />
                <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Secure Pay</span>
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
};

export default ProductDetails;
