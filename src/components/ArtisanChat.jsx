import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Paperclip, X, MessageSquare, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ArtisanChat = ({ orderId, recipientId, recipientName, onClose, embedded = false }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();
    const { user } = useAuth();
    const { error } = useToast();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        fetchMessages();
        
        if (socket) {
            socket.emit('join-order', orderId);
            
            socket.on('new-message', (message) => {
                setMessages(prev => {
                    // Check if message already exists (optimistic update)
                    if (prev.some(m => m._id === message._id)) return prev;
                    return [...prev, message];
                });
            });

            return () => {
                socket.emit('leave-order', orderId);
                socket.off('new-message');
            };
        }
    }, [orderId, socket]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/chat/${orderId}`);
            if (res.data.success) {
                setMessages(res.data.data);
            }
        } catch (err) {
            console.error('Chat fetch error:', err);
            error('Failed to load conversation history.');
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim()) return;

        const msgContent = input.trim();
        setInput('');

        try {
            const res = await axios.post('/chat', {
                orderId,
                content: msgContent,
                recipientId
            });
            
            if (res.data.success) {
                setMessages(prev => {
                    if (prev.some(m => m._id === res.data.data._id)) return prev;
                    return [...prev, res.data.data];
                });
            }
        } catch (err) {
            error('Message failed to send.');
            // Revert or show error
        }
    };

    return (
        <div className={embedded ? "" : "glass-panel animate-fade-in"} style={embedded ? {
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            width: '100%',
            padding: 0,
            overflow: 'hidden',
        } : { 
            position: 'fixed', 
            bottom: '2rem', 
            right: '2rem', 
            width: '400px', 
            height: '550px', 
            display: 'flex', 
            flexDirection: 'column', 
            zIndex: 2000,
            padding: 0,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            borderRadius: 'var(--radius-lg)'
        }}>
            {/* Header - Only show if not embedded */}
            {!embedded && (
                <div style={{ 
                    padding: '1.25rem 1.5rem', 
                    background: 'var(--bg-secondary)', 
                    color: 'var(--text)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent)15', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--accent)30' }}>
                            <User size={18} color="var(--accent)" />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '900' }}>{recipientName || 'Artisan'}</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }}></div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>Order #{orderId?.toString().slice(-6).toUpperCase() || 'NEW'}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.3s' }} className="hover-scale">
                        <X size={22} />
                    </button>
                </div>
            )}

            {/* Message Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', background: 'var(--bg)' }} className="custom-scrollbar">
                {loading ? (
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div className="animate-spin" style={{ width: '24px', height: '24px', border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                            <MessageSquare size={28} color="var(--text-muted)" />
                        </div>
                        <h4 style={{ margin: '0 0 0.5rem', fontWeight: '800' }}>Direct Message</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>Discuss your order requirements and customization directly with the artisan.</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const senderId = msg.sender?._id || msg.sender;
                        const isMe = senderId?.toString() === user?._id?.toString() || senderId?.toString() === user?.id?.toString();
                        
                        return (
                            <div key={idx} style={{ 
                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isMe ? 'flex-end' : 'flex-start'
                            }}>
                                <div style={{ 
                                    padding: '0.8rem 1.2rem', 
                                    borderRadius: '1.2rem',
                                    borderTopRightRadius: isMe ? '0.2rem' : '1.2rem',
                                    borderTopLeftRadius: isMe ? '1.2rem' : '0.2rem',
                                    background: isMe ? 'var(--text)' : 'var(--bg-secondary)',
                                    color: isMe ? 'var(--bg)' : 'var(--text)',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    boxShadow: 'var(--shadow-sm)',
                                    border: isMe ? 'none' : '1px solid var(--border)',
                                    lineHeight: '1.5'
                                }}>
                                    {msg.content}
                                    <div style={{ 
                                        fontSize: '0.65rem', 
                                        opacity: 0.7, 
                                        marginTop: '0.4rem',
                                        textAlign: 'right',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        gap: '0.4rem',
                                        fontWeight: '700'
                                    }}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {isMe && <span style={{ color: 'var(--success)' }}>✓✓</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
                <div style={{ position: 'relative', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Message artisan..."
                            style={{ 
                                width: '100%', 
                                padding: '0.85rem 1.25rem', 
                                borderRadius: 'var(--radius-full)', 
                                background: 'var(--bg)', 
                                border: '1px solid var(--border)',
                                color: 'var(--text)',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                outline: 'none',
                                transition: 'all 0.3s'
                            }}
                            className="input-focus"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={!input.trim()}
                        style={{ 
                            width: '45px', 
                            height: '45px', 
                            borderRadius: '50%', 
                            background: input.trim() ? 'var(--text)' : 'var(--border)', 
                            border: 'none', 
                            color: 'var(--bg)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            boxShadow: input.trim() ? 'var(--shadow-md)' : 'none'
                        }}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ArtisanChat;
