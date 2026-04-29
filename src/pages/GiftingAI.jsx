import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { Sparkles, Send, Mic, User, Bot, ShoppingCart, Calendar, Heart, Brain, Zap, ArrowRight, Loader, Star, ChevronDown, Filter, RefreshCw, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { fireConfetti } from '../utils/confetti';

const GiftingAI = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hi! I'm the GiftKart AI. Describe who you're shopping for, their personality, and the occasion. I'll search our entire marketplace to find something truly meaningful." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [budget, setBudget] = useState(5000);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [cartIds, setCartIds] = useState(new Set());
  const [orderedIds, setOrderedIds] = useState(new Set());
  
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { success, error, info } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    fetchWishlist();
    fetchCart();
    fetchOrders();
  }, [messages]);

  const fetchWishlist = async () => {
    try {
        const res = await axios.get('/wishlist');
        if (res.data.success) {
            const ids = new Set(res.data.data.products.filter(p => p.product).map(p => p.product._id));
            setWishlistIds(ids);
        }
    } catch (err) {
        console.error('Wishlist fetch error:', err);
    }
  };

  const fetchCart = async () => {
    try {
        const res = await axios.get('/cart');
        if (res.data.success) {
            const ids = new Set(res.data.data.items.map(i => i.product._id));
            setCartIds(ids);
        }
    } catch (err) {
        console.error('Cart fetch error:', err);
    }
  };

  const fetchOrders = async () => {
    try {
        const res = await axios.get('/payment/my-orders');
        if (res.data.success) {
            const ids = new Set(res.data.data.flatMap(o => (o.products || []).map(i => i.product?._id || i.product)).filter(id => id));
            setOrderedIds(ids);
        }
    } catch (err) {
        console.error('Orders fetch error:', err);
    }
  };

  const toggleWishlist = async (productId) => {
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
            fireConfetti('heart');
        }
    } catch (err) {
        error("Failed to update favorites");
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/ai/recommendations', { 
        query: userMsg,
        context: {
            budget: { min: 0, max: budget }
        }
      });

      if (res.data.success) {
        const { recommendations: recs, analysis: aiAnalysis, message: aiMessage, conversationMode } = res.data.data;
        
        setRecommendations(recs || []);
        setAnalysis(aiAnalysis);
        
        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: aiMessage || (conversationMode ? res.data.data.message : "Here are my recommendations!")
        }]);
      }
    } catch (err) {
      console.error('AI Connection Error:', err);
      error("AI is having trouble connecting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    try {
      await axios.post('/cart/add', { productId, quantity: 1 });
      setCartIds(prev => new Set(prev).add(productId));
      success("Added to cart!");
    } catch (err) {
      error("Failed to add to cart.");
    }
  };

  const handleOrderNow = async (productId) => {
    try {
        await axios.post('/cart/add', { productId, quantity: 1 });
        fireConfetti('success');
        setTimeout(() => navigate('/cart'), 1500);
    } catch (err) {
        error("Failed to initiate order.");
    }
  };

  // Filter out products that have already been ordered
  const filteredRecommendations = recommendations.filter(rec => !orderedIds.has(rec.product?._id));

  return (
    <div style={{ height: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', color: 'var(--text-primary)', overflow: 'hidden' }}>
      <Navbar />
      
      {/* Background Glows */}
      <div style={{ position: 'fixed', top: '10%', right: '10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.03) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }}></div>
      <div style={{ position: 'fixed', bottom: '10%', left: '10%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(37, 99, 235, 0.03) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }}></div>

      <main className="gifting-ai-main" style={{ flex: 1, display: 'flex', height: 'calc(100vh - 70px)', position: 'relative', zIndex: 1, flexDirection: 'row' }}>

        
        {/* Left Section: Recommendations (Flexible Width) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: 'rgba(0,0,0,0.1)' }} className="custom-scrollbar">
          {filteredRecommendations.length > 0 ? (
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>Curated Selections</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Based on: <span style={{ color: 'var(--accent-primary)' }}>{messages.filter(m => m.role === 'user').pop()?.content || 'Your request'}</span></p>
                </div>
                
                {analysis && (
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {analysis.personalityTraits.slice(0, 2).map(trait => (
                            <div key={trait} style={{ background: 'var(--accent-primary)10', color: 'var(--accent-primary)', padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold', border: '1px solid var(--accent-primary)20' }}>
                                #{trait}
                            </div>
                        ))}
                    </div>
                )}
              </div>

              {/* Results Grid - Compact Cards */}
              <div className="grid">

                {filteredRecommendations.map((rec, idx) => (
                  <div key={idx} className="glass-panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease', border: '1px solid var(--border-light)' }}>
                    <div style={{ position: 'relative', height: '160px' }}>
                        <img 
                            src={rec.product?.images?.[0]?.url || 'https://via.placeholder.com/400x300'} 
                            alt={rec.product?.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(5px)', padding: '0.3rem 0.6rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.3rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'white' }}>{Math.round(rec.score * 100)}% Match</span>
                        </div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleWishlist(rec.product?._id);
                            }}
                            style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.1)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: wishlistIds.has(rec.product?._id) ? '#ef4444' : 'white' }}
                        >
                            <Heart size={16} fill={wishlistIds.has(rec.product?._id) ? '#ef4444' : 'transparent'} />
                        </button>
                    </div>
                    
                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rec.product?.name}</h3>
                        <p style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-primary)', marginBottom: '0.75rem' }}>₹{rec.product?.basePrice}</p>
                        
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--border-light)' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic', lineHeight: '1.3' }}>"{rec.whyPerfect}"</p>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: 'auto' }}>
                            <button 
                                onClick={() => addToCart(rec.product?._id)} 
                                className={cartIds.has(rec.product?._id) ? "btn btn-secondary" : "btn btn-primary"}
                                style={{ flex: 1, height: '36px', fontSize: '0.8rem', fontWeight: '700', borderRadius: '8px', opacity: cartIds.has(rec.product?._id) ? 0.7 : 1 }}
                                disabled={cartIds.has(rec.product?._id)}
                            >
                                {cartIds.has(rec.product?._id) ? 'In Cart' : 'Add'}
                            </button>
                            <button 
                                onClick={() => handleOrderNow(rec.product?._id)} 
                                className="btn btn-secondary"
                                style={{ flex: 1, height: '36px', fontSize: '0.8rem', fontWeight: '700', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}
                            >
                                Order
                            </button>
                            <button 
                                onClick={() => navigate(`/product/${rec.product?._id}`)} 
                                className="btn btn-secondary" 
                                style={{ width: '36px', height: '36px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '8px' }}
                            >
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '2rem', borderRadius: '50%', marginBottom: '2rem', border: '1px solid var(--border-light)' }}>
                <Sparkles size={48} color="var(--accent-primary)" style={{ opacity: 0.5 }} />
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>AI Curation Ready</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '0.9rem' }}>
                Describe a personality in the chat sidebar to populate this marketplace with personalized gift matches.
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar: Chat (Narrower - 30%) */}
        <div className="ai-sidebar" style={{ 
          width: '30%', 
          minWidth: '320px',
          borderLeft: '1px solid var(--border-light)', 
          display: 'flex', 
          flexDirection: 'column',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(40px)',
          height: '100%'
        }}>
          {/* Sidebar Header */}
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', padding: '0.5rem', borderRadius: '10px' }}>
                <Brain size={20} color="white" />
              </div>
              <div>
                <h2 style={{ fontSize: '1rem', margin: 0, fontWeight: '700' }}>GiftMind AI</h2>
                <div style={{ fontSize: '0.65rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <div className="animate-pulse" style={{ width: '5px', height: '5px', background: 'var(--success)', borderRadius: '50%' }}></div> LIVE ANALYSIS
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Max Budget</span>
                    <span style={{ fontWeight: 'bold' }}>₹{budget}</span>
                </div>
                <input 
                    type="range" min="500" max="20000" step="500" value={budget} 
                    onChange={e => setBudget(e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--accent-primary)', height: '3px' }}
                />
            </div>
          </div>

          {/* WhatsApp-style Message Area (Scrollable Only Here) */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{ 
                    padding: '0.75rem 1rem',
                    borderRadius: '16px',
                    borderBottomRightRadius: msg.role === 'user' ? '2px' : '16px',
                    borderBottomLeftRadius: msg.role === 'bot' ? '2px' : '16px',
                    background: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    color: 'white',
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    border: msg.role === 'bot' ? '1px solid var(--border-light)' : 'none'
                }}>
                    {msg.content}
                </div>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', opacity: 0.7 }}>
                    {msg.role === 'bot' ? 'AI Assistant' : 'You'}
                </span>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', background: 'var(--bg-tertiary)', padding: '0.75rem 1rem', borderRadius: '16px 16px 16px 2px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <div className="typing-dot" style={{ width: '6px', height: '6px', background: 'var(--accent-primary)', borderRadius: '50%', animation: 'typingDot 1.4s infinite ease-in-out' }}></div>
                    <div className="typing-dot" style={{ width: '6px', height: '6px', background: 'var(--accent-primary)', borderRadius: '50%', animation: 'typingDot 1.4s infinite ease-in-out 0.2s' }}></div>
                    <div className="typing-dot" style={{ width: '6px', height: '6px', background: 'var(--accent-primary)', borderRadius: '50%', animation: 'typingDot 1.4s infinite ease-in-out 0.4s' }}></div>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.02em' }}>GiftKart AI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Sticky Bottom Input Area */}
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border-light)', marginTop: 'auto' }}>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Message AI..." 
                value={input}
                onChange={e => setInput(e.target.value)}
                style={{ marginBottom: 0, paddingRight: '2.5rem', borderRadius: '12px', height: '44px', fontSize: '0.85rem' }}
                disabled={loading}
              />
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ position: 'absolute', right: '5px', top: '5px', bottom: '5px', width: '34px', padding: 0, borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                disabled={loading || !input.trim()}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </main>


      <style>{`
        @media (max-width: 1024px) {
          .gifting-ai-main {
            flex-direction: column !important;
            height: auto !important;
            overflow-y: auto !important;
          }
          .ai-sidebar {
            width: 100% !important;
            min-width: 100% !important;
            height: 600px !important;
            border-left: none !important;
            border-top: 1px solid var(--border-light) !important;
          }
        }
        
        @keyframes typingDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1.1); opacity: 1; }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
};

export default GiftingAI;
