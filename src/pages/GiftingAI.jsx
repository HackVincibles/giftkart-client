import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { Sparkles, Send, Mic, Brain, ArrowRight, Loader, Heart, ShoppingBag, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

const confusedQuestions = [
  {
    text: "Let's figure this out together. Who is this gift for?",
    key: "relationship",
    options: ["Partner", "Parent", "Friend", "Colleague", "Child"]
  },
  {
    text: "Got it. What's the occasion?",
    key: "occasion",
    options: ["Birthday", "Anniversary", "Just Because", "Milestone", "Apology"]
  },
  {
    text: "And what kind of vibe are you hoping to achieve?",
    key: "vibe",
    options: ["Romantic", "Practical", "Funny", "Sentimental", "Luxury"]
  }
];

const GiftingAI = () => {
  const [mode, setMode] = useState(null); // 'brief' | 'confused' | null
  const [confusedStep, setConfusedStep] = useState(0);
  const [confusedAnswers, setConfusedAnswers] = useState({});

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [budget, setBudget] = useState(10000);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { theme } = useTheme();

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    const fetchContext = async () => {
        try {
            const res = await axios.get('/wishlist');
            if (res.data.success) {
                const ids = new Set(res.data.data.products.filter(p => p.product).map(p => p.product._id));
                setWishlistIds(ids);
            }
        } catch {}
    };
    fetchContext();
  }, []);

  const startConfusedMode = () => {
    setMode('confused');
    setConfusedStep(0);
    setConfusedAnswers({});
    const q = confusedQuestions[0];
    setMessages([{ role: 'bot', content: q.text, options: q.options, key: q.key }]);
  };

  const handleOptionSelect = async (key, option) => {
    // Remove options from the previous message and add user response
    setMessages(prev => {
        const newMsg = [...prev];
        if (newMsg.length > 0) newMsg[newMsg.length - 1].options = undefined;
        return [...newMsg, { role: 'user', content: option }];
    });
    
    const newAnswers = { ...confusedAnswers, [key]: option };
    setConfusedAnswers(newAnswers);
    
    const nextStep = confusedStep + 1;
    if (nextStep < confusedQuestions.length) {
      setConfusedStep(nextStep);
      const q = confusedQuestions[nextStep];
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'bot', content: q.text, options: q.options, key: q.key }]);
      }, 500);
    } else {
      setConfusedStep(nextStep);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'bot', content: "Perfect. Let me find some wonderful gifts based on your answers..." }]);
        triggerConfusedAI(newAnswers);
      }, 500);
    }
  };

  const triggerConfusedAI = async (answers) => {
    setLoading(true);
    const query = `I am looking for a ${answers.vibe} gift for my ${answers.relationship} for their ${answers.occasion}.`;
    try {
      const res = await axios.post('/ai/recommendations', { 
        query,
        context: { budget: { min: 0, max: budget } }
      });
      if (res.data.success) {
        const { recommendations: recs, message: aiMessage } = res.data.data;
        setRecommendations(recs || []);
        setMessages(prev => [...prev, { role: 'bot', content: aiMessage || "I've curated a few items that match your description perfectly." }]);
      }
    } catch (err) {
      error("The AI assistant is momentarily unavailable. Please try again.");
    } finally {
      setLoading(false);
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
        context: { budget: { min: 0, max: budget } }
      });

      if (res.data.success) {
        const { recommendations: recs, message: aiMessage } = res.data.data;
        setRecommendations(recs || []);
        setMessages(prev => [...prev, { role: 'bot', content: aiMessage || "I've curated a few items that match your description." }]);
      }
    } catch (err) {
      error("The AI assistant is momentarily unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (productId) => {
    try {
        if (wishlistIds.has(productId)) {
            await axios.delete(`/wishlist/${productId}`);
            setWishlistIds(prev => { const next = new Set(prev); next.delete(productId); return next; });
            success("Removed from favorites");
        } else {
            await axios.post('/wishlist/add', { productId });
            setWishlistIds(prev => new Set(prev).add(productId));
            success("Added to favorites!");
        }
    } catch { error("Action failed"); }
  };

  const addToCart = async (productId) => {
    try {
      await axios.post('/cart/add', { productId, quantity: 1 });
      success("Added to bag");
    } catch { error("Failed to add to bag"); }
  };

  return (
    <div className="kl-root" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Navbar />
      
      <main style={{ flex: 1, display: 'flex', paddingTop: '70px', overflow: 'hidden', height: '100%' }}>
        {/* Chat Section */}
        <div style={{ width: '400px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', position: 'relative', zIndex: 10 }}>
          <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--accent)', padding: '0.6rem', borderRadius: '12px' }}><Brain size={20} color="var(--white)" /></div>
                <div>
                    <h2 style={{ fontSize: '1rem', fontWeight: '700' }}>Assistant</h2>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Ready to listen</p>
                </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700' }}>
                    <span>Budget Limit</span>
                    <span>₹{budget.toLocaleString()}</span>
                </div>
                <input type="range" min="500" max="50000" step="500" value={budget} onChange={e => setBudget(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--text)' }} />
            </div>
          </div>

          {mode === null ? (
            <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '2rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <Sparkles size={40} color="var(--accent)" style={{ marginBottom: '1rem' }} />
                <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>How can I help you?</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                <button onClick={() => { setMode('brief'); setMessages([{ role: 'bot', content: "Welcome to Brief Mode. Tell me about the person you're shopping for—their quirks, their loves, or a moment you want to celebrate. I'll find something they'll quietly love." }]); }} className="btn btn-secondary" style={{ padding: '1.2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.4rem', border: '1px solid var(--border)', borderRadius: '12px', height: 'auto', whiteSpace: 'normal' }}>
                  <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}><MessageSquare size={16} /> Brief Mode</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>You know what you want to say. Just describe the person and occasion.</p>
                </button>
                <button onClick={() => { startConfusedMode(); }} className="btn btn-primary" style={{ padding: '1.2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.4rem', borderRadius: '12px', height: 'auto', whiteSpace: 'normal' }}>
                  <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}><Brain size={16} /> Confused Mode</h3>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: '1.4' }}>Not sure where to start? I'll ask you a few simple multiple-choice questions.</p>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="kl-chat-scroll">
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
                        padding: '1rem 1.2rem',
                        borderRadius: 'var(--radius-md)',
                        background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg)',
                        color: msg.role === 'user' ? 'var(--white)' : 'var(--text)',
                        fontSize: '0.85rem',
                        lineHeight: '1.6',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow)'
                    }}>{msg.content}</div>
                    
                    {msg.options && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {msg.options.map(opt => (
                          <button key={opt} onClick={() => handleOptionSelect(msg.key, opt)} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', borderRadius: '100px', border: '1px solid var(--border)' }}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {loading && <div className="kl-typing">Thinking...</div>}
                <div ref={messagesEndRef} />
              </div>

              {mode === 'brief' && (
                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
                  <form onSubmit={handleSend} style={{ position: 'relative' }}>
                    <input 
                      type="text" placeholder="Tell me about them..." value={input}
                      onChange={e => setInput(e.target.value)}
                      style={{ borderRadius: 'var(--radius-full)', paddingRight: '3rem' }}
                      disabled={loading}
                    />
                    <button type="submit" style={{ position: 'absolute', right: '6px', top: '6px', bottom: '6px', width: '34px', background: 'var(--accent)', borderRadius: '50%', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={loading}><Send size={14} /></button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>

        {/* Results Section */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '3rem', background: 'var(--bg)' }}>
          {recommendations.length > 0 ? (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div style={{ marginBottom: '3rem' }}>
                  <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Curated Edit</h2>
                  <p style={{ color: 'var(--text-muted)' }}>Selected based on your conversation</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {recommendations.map((rec, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-secondary)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s' }} onClick={() => navigate(`/product/${rec.product?._id}`)}>
                    <div style={{ position: 'relative', height: '250px', width: '100%' }}>
                        <img src={rec.product?.images?.[0]?.url || 'https://via.placeholder.com/600'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--glass)', backdropFilter: 'blur(10px)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text)' }}>{Math.round(rec.score * 100)}% Match</div>
                    </div>
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', lineHeight: '1.3', flex: 1 }}>{rec.product?.name}</h3>
                            <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--accent)', whiteSpace: 'nowrap' }}>₹{rec.product?.basePrice}</span>
                        </div>
                        <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1, display: 'flex', alignItems: 'center' }}>
                            "{rec.whyPerfect}"
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                            <button onClick={(e) => { e.stopPropagation(); addToCart(rec.product?._id); }} className="btn btn-primary" style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', fontWeight: '600' }}>Add to Bag</button>
                            <button onClick={(e) => { e.stopPropagation(); toggleWishlist(rec.product?._id); }} className="btn btn-secondary" style={{ padding: '0 1rem', borderRadius: '12px' }}>
                                <Heart size={18} fill={wishlistIds.has(rec.product?._id) ? 'var(--accent)' : 'none'} color={wishlistIds.has(rec.product?._id) ? 'var(--accent)' : 'currentColor'} />
                            </button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
              <Sparkles size={64} style={{ marginBottom: '2rem' }} />
              <h2 style={{ fontSize: '1.5rem' }}>Your curation will appear here</h2>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .kl-chat-scroll::-webkit-scrollbar { width: 4px; }
        .kl-chat-scroll::-webkit-scrollbar-thumb { background: var(--text-light); border-radius: 10px; }
        .kl-typing { font-size: 0.75rem; color: var(--text-light); font-style: italic; }
      `}</style>
    </div>
  );
};

export default GiftingAI;
