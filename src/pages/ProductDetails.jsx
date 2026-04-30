import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Heart, ShoppingCart, Star, Clock, Shield, Sparkles, Plus, Minus, Loader, Box, Image as ImageIcon, XCircle, Calendar } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState('image');
  const [customData, setCustomData] = useState({});
  const { success, error, info } = useToast();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [suggesting, setSuggesting] = useState(false);
  const [aiFormData, setAiFormData] = useState({
    recipientName: '',
    relationship: '',
    occasion: '',
    tone: 'heartfelt',
    interests: '',
    messageType: 'message'
  });

  const activeScheduleId = localStorage.getItem('activeScheduleId');
  const activeScheduleRecipient = localStorage.getItem('activeScheduleRecipient');


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/products/${id}`);
        if (res.data.success) setProduct(res.data.data);
      } catch (err) {
        error("Product not found.");
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
          setIsInWishlist(res.data.data.products.some(p => p.product?._id === id));
        }
      } catch {}
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
    } catch { error("Failed to update favorites"); }
  };

  const handleAddToCart = async () => {
    try {
      await axios.post('/cart/add', { productId: product._id, quantity, selectedVariants: customData });
      success("Added to bag");
    } catch { error("Failed to add to bag"); }
  };

  const handleScheduleGift = async () => {
    try {
      await axios.post(`/auto-gift-calendar/${activeScheduleId}/select-gifts`, {
        selectedGifts: [{
           product: product._id,
           quantity
        }]
      });
      success(`Gift scheduled for ${activeScheduleRecipient || 'your event'}!`);
      localStorage.removeItem('activeScheduleId');
      localStorage.removeItem('activeScheduleRecipient');
      navigate('/auto-gifting');
    } catch (err) {
      error("Failed to schedule gift");
    }
  };

  const handleAiGenerate = async () => {
    try {
      setSuggesting(true);
      const res = await axios.post('/custom-gifts/ai-message', aiFormData);
      if (res.data.success) {
        setAiResult(res.data.data);
        success("AI has crafted your message!");
      }
    } catch { 
      error("AI is busy right now."); 
    } finally { 
      setSuggesting(false); 
    }
  };

  if (loading) return (
    <div className="kl-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Navbar />
      <Loader className="animate-spin" size={32} color="var(--text-light)" />
    </div>
  );

  if (!product) return (
    <div className="kl-root" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Navbar />
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Object not found.</h2>
      <button onClick={() => navigate('/buyer-dashboard')} className="btn btn-primary">Browse Collection</button>
    </div>
  );

  return (
    <div className="kl-root">
      <Navbar />
      
      <main className="container" style={{ paddingTop: '8rem', paddingBottom: '8rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '5rem', alignItems: 'start' }}>
          
          {/* Visuals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-panel" style={{ aspectRatio: '1/1', borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10, display: 'flex', gap: '0.8rem' }}>
                <button onClick={() => setViewMode('image')} className={`kl-nav-icon-btn ${viewMode === 'image' ? 'active' : ''}`} style={{ background: viewMode === 'image' ? 'var(--accent)' : 'var(--glass)', color: viewMode === 'image' ? 'var(--white)' : 'var(--text)', borderRadius: '12px' }}><ImageIcon size={18} /></button>
                <button onClick={() => setViewMode('3d')} className={`kl-nav-icon-btn ${viewMode === '3d' ? 'active' : ''}`} style={{ background: viewMode === '3d' ? 'var(--accent)' : 'var(--glass)', color: viewMode === '3d' ? 'var(--white)' : 'var(--text)', borderRadius: '12px' }}><Box size={18} /></button>
              </div>

              {viewMode === 'image' ? (
                <img src={product.images?.[activeImage]?.url || 'https://via.placeholder.com/800'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Product3DPreview product={product} />
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto' }}>
              {product.images?.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImage(idx)} style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: activeImage === idx ? '2px solid var(--accent)' : '1px solid var(--border)', flexShrink: 0 }}>
                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.5rem' }}>
                <Sparkles size={14} /> {product.category}
              </div>
              <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: '1.1' }}>{product.name}</h1>
              
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '2.5rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: '400' }}>₹{product.basePrice.toLocaleString()}</span>
                {product.pricing?.mrp > product.basePrice && (
                  <span style={{ color: 'var(--text-light)', textDecoration: 'line-through' }}>₹{product.pricing.mrp.toLocaleString()}</span>
                )}
              </div>

              <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
                {product.description}
              </p>

              {/* Customization */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
                {product.customizationOptions?.map(opt => (
                  <div key={opt.fieldName}>
                    <label style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem', display: 'block', color: 'var(--text-light)' }}>{opt.label}</label>
                    {opt.type === 'text' ? (
                      <input type="text" placeholder={opt.placeholder} onChange={(e) => setCustomData({...customData, [opt.fieldName]: e.target.value})} />
                    ) : (
                      <select onChange={(e) => setCustomData({...customData, [opt.fieldName]: e.target.value})}>
                        <option value="">Select Option</option>
                        {opt.options?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', padding: '0.4rem 1rem' }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ padding: '0.5rem' }}><Minus size={16} /></button>
                  <span style={{ width: '40px', textAlign: 'center', fontWeight: '700' }}>{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} style={{ padding: '0.5rem' }}><Plus size={16} /></button>
                </div>
                
                {activeScheduleId ? (
                  <button onClick={handleScheduleGift} className="btn btn-primary" style={{ flex: 1, background: 'var(--accent-primary)', border: 'none' }}>
                    <Calendar size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />
                    Schedule for {activeScheduleRecipient || 'Event'}
                  </button>
                ) : (
                  <button onClick={handleAddToCart} className="btn btn-primary" style={{ flex: 1 }}>Add to Bag</button>
                )}
                
                <button onClick={handleToggleWishlist} className="btn btn-secondary" style={{ padding: '0 1.5rem', color: isInWishlist ? '#ef4444' : 'inherit' }}><Heart size={18} fill={isInWishlist ? '#ef4444' : 'none'} /></button>
              </div>

              {/* AI Trigger */}
              <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--accent-primary)30', background: 'var(--gradient-soft)' }}>
                <Sparkles size={24} style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.6rem' }}>AI Personalization Center</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Generate unique poems, messages or captions for your gift using our advanced AI.</p>
                <button onClick={() => setShowAiModal(true)} className="btn btn-primary" style={{ width: '100%', background: 'var(--gradient-primary)' }}>Open AI Suite</button>
              </div>
            </div>
          </div>
        </div>
      </main>
      {showAiModal && (
        <AiPersonalizationModal 
          formData={aiFormData}
          setFormData={setAiFormData}
          onSubmit={handleAiGenerate}
          result={aiResult}
          setAiResult={setAiResult}
          loading={suggesting}
          onClose={() => { setShowAiModal(false); setAiResult(null); }}
        />
      )}
      
      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const AiPersonalizationModal = ({ formData, setFormData, onSubmit, result, setAiResult, loading, onClose }) => {
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', border: '1px solid var(--accent-primary)30', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Sparkles color="var(--accent-primary)" /> AI Personalization</h2>
          <button onClick={onClose} className="kl-nav-icon-btn"><XCircle size={24} /></button>
        </div>

        {!result ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Recipient Name</label>
                <input name="recipientName" value={formData.recipientName} onChange={handleChange} placeholder="e.g. Sarah" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Relationship</label>
                <input name="relationship" value={formData.relationship} onChange={handleChange} placeholder="e.g. Sister, Friend" style={{ width: '100%' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Occasion</label>
                <input name="occasion" value={formData.occasion} onChange={handleChange} placeholder="e.g. Birthday, Farewell" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Tone</label>
                <select name="tone" value={formData.tone} onChange={handleChange} style={{ width: '100%' }}>
                  <option value="heartfelt">Heartfelt</option>
                  <option value="funny">Funny</option>
                  <option value="professional">Professional</option>
                  <option value="poetic">Poetic</option>
                  <option value="minimalist">Minimalist</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Content Type</label>
              <select name="messageType" value={formData.messageType} onChange={handleChange} style={{ width: '100%' }}>
                <option value="message">Personal Message</option>
                <option value="poem">Short Poem</option>
                <option value="caption">Social Media Caption</option>
                <option value="story">Mini Memory Story</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Interests / Traits (Optional)</label>
              <textarea name="interests" value={formData.interests} onChange={handleChange} placeholder="e.g. Loves gardening, coffee enthusiast..." style={{ width: '100%', minHeight: '80px' }} />
            </div>

            <button onClick={onSubmit} disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              {loading ? <Loader className="animate-spin" size={18} /> : 'Craft with AI'}
            </button>
          </div>
        ) : (
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-light)', marginBottom: '2rem', whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
              {result}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setAiResult(null)} className="btn btn-secondary" style={{ flex: 1 }}>Back to Edit</button>
              <button onClick={() => {
                navigator.clipboard.writeText(result);
                alert("Copied to clipboard!");
              }} className="btn btn-primary" style={{ flex: 1 }}>Copy Message</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
