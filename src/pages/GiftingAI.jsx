import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { Sparkles, Send, Mic, User, Bot, ShoppingCart, Calendar, Heart, Brain, Zap, ArrowRight, Loader, Star, ChevronDown, Filter, RefreshCw, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const GiftingAI = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hi! I'm the GiftKart AI. Describe who you're shopping for, their personality, and the occasion. I'll search our entire marketplace to find something truly meaningful." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [budget, setBudget] = useState(5000);
  
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { success, error, info } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        queryType: 'description',
        context: {
            budget: { min: 0, max: budget }
        }
      });

      if (res.data.success) {
        const { recommendations: recs, analysis: aiAnalysis } = res.data.data;
        setRecommendations(recs);
        setAnalysis(aiAnalysis);
        
        const botReply = recs.length > 0 
          ? `I've analyzed your description and found ${recs.length} matches. I detected a ${aiAnalysis.primaryEmotion} emotion and ${aiAnalysis.personalityTraits.join(', ')} personality traits. Here are my top picks for you!`
          : `I analyzed your description, but I couldn't find exact matches in our marketplace right now. Try broadening your description or adjusting the budget!`;

        setMessages(prev => [...prev, { role: 'bot', content: botReply }]);
      }
    } catch (err) {
      error("AI is having trouble connecting. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    try {
      await axios.post('/cart/add', { productId, quantity: 1 });
      success("Added to cart!");
    } catch (err) {
      error("Failed to add to cart.");
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', color: 'var(--text-primary)' }}>
      <Navbar />
      
      {/* Background Glows */}
      <div style={{ position: 'fixed', top: '10%', left: '10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }}></div>
      <div style={{ position: 'fixed', bottom: '10%', right: '10%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }}></div>

      <main style={{ flex: 1, display: 'flex', height: 'calc(100vh - 70px)', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        
        {/* Left Sidebar: Chat & Settings */}
        <div style={{ 
          width: '450px', 
          borderRight: '1px solid var(--border-light)', 
          display: 'flex', 
          flexDirection: 'column',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(20px)'
        }}>
          {/* Header */}
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', padding: '0.6rem', borderRadius: '12px', boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}>
                <Brain size={24} color="white" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: '700', letterSpacing: '-0.02em' }}>GiftMind Reader</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <div className="animate-pulse" style={{ width: '6px', height: '6px', background: 'var(--accent-primary)', borderRadius: '50%' }}></div> AI ENGINE ACTIVE
                </span>
              </div>
            </div>

            {/* Quick Filters */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Maximum Budget</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>₹{budget}</span>
                </div>
                <input 
                    type="range" 
                    min="500" 
                    max="20000" 
                    step="500" 
                    value={budget} 
                    onChange={e => setBudget(e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--accent-primary)', height: '4px' }}
                />
            </div>
          </div>

          {/* Chat Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '90%',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{ 
                    padding: '1rem 1.25rem',
                    borderRadius: '18px',
                    borderBottomRightRadius: msg.role === 'user' ? '4px' : '18px',
                    borderBottomLeftRadius: msg.role === 'bot' ? '4px' : '18px',
                    background: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    color: 'white',
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    boxShadow: msg.role === 'user' ? '0 4px 15px rgba(139, 92, 246, 0.2)' : '0 4px 15px rgba(0,0,0,0.1)',
                    border: msg.role === 'bot' ? '1px solid var(--border-light)' : 'none'
                }}>
                    {msg.content}
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', padding: '0 0.5rem' }}>
                    {msg.role === 'bot' ? 'GiftKart AI' : 'You'}
                </span>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '18px', borderBottomLeftRadius: '4px', display: 'flex', gap: '0.5rem', border: '1px solid var(--border-light)' }}>
                <Loader className="animate-spin" size={16} color="var(--accent-primary)" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Analyzing personality...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border-light)' }}>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. My sister who loves minimalist art..." 
                value={input}
                onChange={e => setInput(e.target.value)}
                style={{ marginBottom: 0, paddingRight: '3rem', borderRadius: '14px', height: '52px' }}
                disabled={loading}
              />
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ position: 'absolute', right: '6px', top: '6px', bottom: '6px', width: '40px', padding: 0, borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                disabled={loading || !input.trim()}
              >
                <Send size={20} />
              </button>
            </form>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>
                Powered by Gemini AI • Real-time marketplace matching
            </p>
          </div>
        </div>

        {/* Right Section: Results */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem', background: 'rgba(0,0,0,0.2)' }} className="custom-scrollbar">
          {recommendations.length > 0 ? (
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>Curated Selections</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Based on your description of <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{messages[messages.length-2]?.content}</span></p>
                </div>
                
                {analysis && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {analysis.personalityTraits.map(trait => (
                            <div key={trait} style={{ background: 'var(--accent-primary)15', color: 'var(--accent-primary)', padding: '0.4rem 1rem', borderRadius: '30px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid var(--accent-primary)30' }}>
                                #{trait}
                            </div>
                        ))}
                    </div>
                )}
              </div>

              {/* Results Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="glass-panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ position: 'relative', height: '240px' }}>
                        <img 
                            src={rec.product?.images?.[0]?.url || 'https://via.placeholder.com/400x300'} 
                            alt={rec.product?.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', padding: '0.6rem 1rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: rec.score > 0.8 ? 'var(--success)' : 'var(--accent-primary)' }}></div>
                            <span style={{ fontWeight: '800', fontSize: '0.9rem', color: 'white' }}>{Math.round(rec.score * 100)}% Match</span>
                        </div>
                    </div>
                    
                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, flex: 1 }}>{rec.product?.name}</h3>
                            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-primary)' }}>₹{rec.product?.basePrice}</span>
                        </div>
                        
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>{rec.reasoning}</p>
                        
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Sparkles size={14} color="var(--accent-primary)" />
                                <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--accent-primary)', letterSpacing: '0.05em' }}>AI WHY-PERFECT</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0, fontStyle: 'italic' }}>"{rec.whyPerfect}"</p>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                            <button 
                                onClick={() => addToCart(rec.product?._id)} 
                                className="btn btn-primary" 
                                style={{ flex: 1, height: '48px', fontWeight: '700', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', borderRadius: '12px' }}
                            >
                                <ShoppingCart size={20} /> Add to Cart
                            </button>
                            <button 
                                onClick={() => navigate(`/product/${rec.product?._id}`)} 
                                className="btn btn-secondary" 
                                style={{ padding: '0 1rem', borderRadius: '12px' }}
                            >
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ 
                position: 'relative',
                width: '120px',
                height: '120px',
                marginBottom: '2.5rem'
              }}>
                <div style={{ position: 'absolute', inset: 0, background: 'var(--accent-primary)', borderRadius: '50%', opacity: 0.1, transform: 'scale(1.5)' }} className="animate-pulse"></div>
                <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-tertiary)', borderRadius: '50%', border: '2px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={48} color="var(--accent-primary)" />
                </div>
              </div>
              
              <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '1rem', letterSpacing: '-0.04em' }}>Find the Unfindable.</h1>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '3rem' }}>
                Describe your recipient's world—their coffee order, their favorite movie, or how they make you feel. Our AI will do the rest.
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '800px' }}>
                {[
                  "Gamer who loves minimalist desk setups",
                  "Foodie who recently started baking sourdough",
                  "Traveler who misses the mountains of Himachal",
                  "Minimalist architect with a love for brutalist design",
                  "Sister who just started her first job in tech"
                ].map(suggestion => (
                  <button 
                    key={suggestion}
                    onClick={() => { setInput(suggestion); }}
                    style={{ 
                        background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid var(--border-light)', 
                        color: 'var(--text-secondary)',
                        padding: '0.8rem 1.5rem',
                        borderRadius: '30px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    "{suggestion}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
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
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
};

export default GiftingAI;
