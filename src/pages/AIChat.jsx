import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Send, Bot, User, Sparkles, ArrowLeft, ShoppingBag } from 'lucide-react';
import axios from 'axios';

const AIChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${user?.displayName || 'there'}! I'm GiftKart's AI Gift Mind Reader. Tell me a bit about who you're buying a gift for—their personality, your relationship, or the occasion—and I'll find the perfect emotional match.`,
      suggestedActions: ["Gift for my mom", "Anniversary gift for my wife", "Something funny for a friend"]
    }
  ]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend = input) => {
    if (!textToSend.trim()) return;

    const userMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // In a fully working backend, this hits the real NLP Gemini service
      const res = await axios.post('/chatbot/chat', {
        message: textToSend,
        sessionId: sessionId
      });

      if (res.data.success) {
        setSessionId(res.data.data.sessionId);
        const aiMessage = {
          role: 'assistant',
          content: res.data.data.message,
          suggestedActions: res.data.data.suggestedActions || [],
          productReferences: res.data.data.productReferences || []
        };
        
        // Mocking product references if the backend didn't return any but intent was gift suggestion
        if (res.data.data.intent === 'gift_suggestion' && (!res.data.data.productReferences || res.data.data.productReferences.length === 0)) {
          aiMessage.productReferences = [
            { _id: '1', name: 'Custom Engraved Wooden Frame', basePrice: 1200, category: 'semi-custom', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=200' },
            { _id: '2', name: 'AI Memory Scrapbook', basePrice: 2500, category: 'ai-generated', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=200' }
          ];
        }

        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("Chat error", error);
      // Fallback for UI demonstration if backend fails
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I've analyzed your request! Based on their profile, here are some deeply meaningful suggestions that I know they will love.",
          suggestedActions: ["Customize the Scrapbook", "See more options"],
          productReferences: [
            { _id: '1', name: 'Custom Engraved Wooden Frame', basePrice: 1200, category: 'semi-custom', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=200' },
            { _id: '2', name: 'AI Memory Scrapbook', basePrice: 2500, category: 'ai-generated', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=200' }
          ]
        }]);
        setIsTyping(false);
      }, 1500);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Navbar />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0' }}>
          <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot color="var(--accent-primary)" /> AI Gift Mind Reader
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Powered by Gemini NLP</p>
          </div>
        </div>

        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
          {/* Chat History */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {messages.map((msg, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  maxWidth: '80%', 
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' 
                }}>
                  {/* Avatar */}
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                    background: msg.role === 'user' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {msg.role === 'user' ? <User size={20} color="var(--accent-primary)" /> : <Bot size={20} color="var(--success)" />}
                  </div>

                  {/* Message Content */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ 
                      padding: '1rem 1.5rem', 
                      borderRadius: '16px', 
                      borderTopRightRadius: msg.role === 'user' ? '4px' : '16px',
                      borderTopLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
                      background: msg.role === 'user' ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'rgba(30, 41, 59, 0.8)',
                      color: 'white',
                      border: msg.role === 'assistant' ? '1px solid var(--border-light)' : 'none',
                      lineHeight: '1.5'
                    }}>
                      {msg.content}
                    </div>

                    {/* Product References UI */}
                    {msg.productReferences && msg.productReferences.length > 0 && (
                      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', width: '100%', maxWidth: '600px' }}>
                        {msg.productReferences.map((prod, i) => (
                          <div key={i} style={{ 
                            background: 'var(--bg-primary)', border: '1px solid var(--border-light)', 
                            borderRadius: '12px', overflow: 'hidden', minWidth: '200px', cursor: 'pointer',
                            transition: 'transform 0.2s'
                          }} className="hover:transform hover:-translate-y-1">
                            <img src={prod.image || prod.images?.[0]?.url || 'https://via.placeholder.com/200'} alt={prod.name} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                            <div style={{ padding: '1rem' }}>
                              <p style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</p>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>₹{prod.basePrice}</span>
                                <button 
                                  onClick={() => navigate(`/product/${prod._id}`)}
                                  className="btn" 
                                  style={{ padding: '0.25rem 0.5rem', background: 'var(--accent-primary)', color: 'white', fontSize: '0.75rem' }}
                                >
                                  View
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suggested Actions Chips */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                        {msg.suggestedActions.map((action, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleSend(action)}
                            style={{ 
                              background: 'transparent', border: '1px solid var(--accent-secondary)', 
                              color: 'var(--accent-secondary)', padding: '0.4rem 1rem', borderRadius: '20px',
                              fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { e.target.style.background = 'rgba(139, 92, 246, 0.1)'; }}
                            onMouseOut={(e) => { e.target.style.background = 'transparent'; }}
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div style={{ display: 'flex', gap: '1rem', maxWidth: '80%' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={20} color="var(--success)" />
                </div>
                <div style={{ padding: '1rem 1.5rem', borderRadius: '16px', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="dot-typing" style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'fadeIn 1s infinite alternate' }}></span>
                  <span className="dot-typing" style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'fadeIn 1s infinite alternate 0.2s' }}></span>
                  <span className="dot-typing" style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'fadeIn 1s infinite alternate 0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-light)', background: 'rgba(15, 23, 42, 0.6)' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-light)', padding: '0.5rem', display: 'flex', alignItems: 'center' }}>
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Describe the person, the occasion, or the emotion you want to convey..."
                  style={{ 
                    flex: 1, background: 'transparent', border: 'none', color: 'white', 
                    padding: '0.5rem', resize: 'none', height: '50px', outline: 'none', fontFamily: 'Inter' 
                  }}
                />
              </div>
              <button 
                onClick={() => handleSend()} 
                disabled={!input.trim() || isTyping}
                className="btn btn-primary" 
                style={{ height: '50px', width: '50px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', opacity: (!input.trim() || isTyping) ? 0.5 : 1 }}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
