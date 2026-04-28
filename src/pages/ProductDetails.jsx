import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Heart, ShoppingCart, Star, Clock, Shield, Sparkles, Plus, Minus, Loader } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [customData, setCustomData] = useState({});
  const { success, error } = useToast();
  const [activeScheduleId] = useState(localStorage.getItem('activeScheduleId'));
  const [activeScheduleRecipient] = useState(localStorage.getItem('activeScheduleRecipient'));

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
        // Handle mock IDs by redirecting to a real product if possible or showing error
        if (id === '1' || id === '2') {
           // Redirect to search or show a helpful message
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
      
      <main className="container animate-fade-in" style={{ padding: '3rem 2rem', flex: 1 }}>
        <div className="grid" style={{ gridTemplateColumns: '1fr 1.2fr', gap: '4rem', alignItems: 'start' }}>
          
          {/* Left: Images */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '0.5rem', borderRadius: '20px', overflow: 'hidden' }}>
              <img 
                src={product.images?.[activeImage]?.url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800'} 
                alt={product.name} 
                style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '15px' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              {product.images?.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className="glass-panel hover:scale-105"
                  style={{ 
                    width: '80px', height: '80px', padding: '4px', 
                    border: activeImage === idx ? '2px solid var(--accent-primary)' : '1px solid var(--border-light)',
                    transition: 'all 0.2s'
                  }}
                >
                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-secondary)', marginBottom: '1rem' }}>
                <Sparkles size={16} />
                <span style={{ fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{product.category?.replace('-', ' ')}</span>
              </div>
              
              <h1 style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: '1.1' }}>{product.name}</h1>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill={i < Math.floor(product.averageRating || 4.5) ? "var(--warning)" : "none"} color="var(--warning)" />
                  ))}
                  <span style={{ marginLeft: '0.5rem', fontWeight: '600' }}>{product.averageRating || 4.5}</span>
                </div>
                <div style={{ width: '1px', height: '20px', background: 'var(--border-light)' }}></div>
                <span style={{ color: 'var(--text-secondary)' }}>{product.popularity?.orders || 120} Orders</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>₹{product.basePrice}</span>
                {product.pricing?.mrp > product.basePrice && (
                  <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{product.pricing.mrp}</span>
                )}
              </div>

              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem' }}>
                {product.description || "A beautifully crafted gift designed to create lasting memories. Hand-made by expert artisans with premium materials."}
              </p>

              {/* Customization Fields */}
              {product.customizationOptions?.map(opt => (
                <div key={opt.fieldName} className="input-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="input-label" style={{ fontWeight: '600' }}>{opt.label}</label>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.5rem' }}>
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{ padding: '0.5rem', color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <Minus size={20} />
                  </button>
                  <span style={{ width: '40px', textAlign: 'center', fontSize: '1.2rem', fontWeight: '600' }}>{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    style={{ padding: '0.5rem', color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <Plus size={20} />
                  </button>
                </div>
                
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Only {product.inventory?.stockCount || 5} units left!
                </span>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={handleOrderNow}
                  className="btn btn-primary" 
                  style={{ flex: 1, padding: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  Order Now
                </button>
                <button 
                  onClick={handleAddToCart}
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <ShoppingCart size={20} /> Add to Cart
                </button>
                <button className="btn btn-secondary" style={{ padding: '1rem' }}>
                  <Heart size={20} />
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <Clock size={18} color="var(--accent-secondary)" />
                <span>Fast 3-5 day delivery</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <Shield size={18} color="var(--success)" />
                <span>Secure payment guarantee</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ProductDetails;
