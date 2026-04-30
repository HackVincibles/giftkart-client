import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Bot, X, Sparkles, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const FloatingAI = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [responses, setResponses] = useState([]);

    // Don't show on admin or login/register pages
    const hideOn = ['/login', '/register', '/admin', '/ai-chat', '/seller'];
    if (hideOn.some(path => location.pathname.startsWith(path))) return null;

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!message.trim()) return;

        const userMsg = message;
        setMessage('');
        setIsTyping(true);
        setIsOpen(true);

        try {
            // Simplified chat for floating bubble - redirects to full chat for deep analysis
            if (responses.length >= 2) {
                navigate('/ai-chat');
                setIsOpen(false);
                return;
            }

            const res = await axios.post('/chatbot/chat', { message: userMsg });
            if (res.data.success) {
                setResponses(prev => [...prev, { role: 'user', text: userMsg }, { role: 'ai', text: res.data.data.message }]);
            }
        } catch (err) {
            setResponses(prev => [...prev, { role: 'user', text: userMsg }, { role: 'ai', text: "I'd love to help with that! For a deep emotional analysis, let's move to the full Mind Reader." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
            {isOpen && (
                <div className="glass-panel animate-slide-up" style={{ width: '320px', maxHeight: '400px', display: 'flex', flexDirection: 'column', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.4)', border: '1px solid var(--border-light)' }}>
                    <div style={{ padding: '1rem', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Bot size={18} />
                            <span style={{ fontWeight: '800', fontSize: '0.85rem' }}>Gift Mind Reader</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={18} /></button>
                    </div>
                    
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '200px' }}>
                        {responses.length === 0 ? (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>
                                Ask me anything about gifting! I can find gifts based on emotions, vibes, or relationship stories.
                            </p>
                        ) : (
                            responses.map((r, i) => (
                                <div key={i} style={{ alignSelf: r.role === 'user' ? 'flex-end' : 'flex-start', background: r.role === 'user' ? 'var(--accent-primary)20' : 'rgba(255,255,255,0.05)', padding: '0.6rem 0.8rem', borderRadius: '12px', maxWidth: '85%', fontSize: '0.8rem' }}>
                                    {r.text}
                                </div>
                            ))
                        )}
                        {isTyping && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Thinking...</div>}
                    </div>

                    <form onSubmit={handleSend} style={{ padding: '0.75rem', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '0.5rem' }}>
                        <input 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ask a question..."
                            style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '0.5rem', color: 'white', fontSize: '0.8rem' }}
                        />
                        <button type="submit" style={{ background: 'var(--accent-primary)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Send size={14} />
                        </button>
                    </form>

                    <button 
                        onClick={() => navigate('/ai-chat')}
                        style={{ width: '100%', padding: '0.6rem', background: 'rgba(255,255,255,0.02)', border: 'none', color: 'var(--accent-primary)', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer', borderTop: '1px solid var(--border-light)' }}>
                        OPEN FULL MIND READER <Sparkles size={10} style={{ marginLeft: '4px' }} />
                    </button>
                </div>
            )}

            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="hover-scale"
                style={{ 
                    width: '60px', height: '60px', borderRadius: '50%', 
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', 
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)', border: 'none', cursor: 'pointer',
                    position: 'relative'
                }}
            >
                <MessageSquare size={24} />
                <div style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'white', borderRadius: '50%', padding: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                    <Sparkles size={12} color="var(--accent-primary)" />
                </div>
            </button>
        </div>
    );
};

export default FloatingAI;
