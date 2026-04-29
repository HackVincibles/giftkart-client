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
        <div className={embedded ? "" : "glass-panel"} style={embedded ? {
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
            width: '380px', 
            height: '500px', 
            display: 'flex', 
            flexDirection: 'column', 
            zIndex: 2000,
            padding: 0,
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            border: '1px solid var(--border-light)',
            background: 'var(--bg-secondary)'
        }}>
            {/* Header - Only show if not embedded */}
            {!embedded && (
                <div style={{ 
                    padding: '1rem 1.25rem', 
                    background: 'var(--accent-primary)', 
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={18} />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800' }}>{recipientName || 'Artisan'}</h4>
                            <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>Order #{orderId?.toString().slice(-6).toUpperCase() || 'NEW'}</span>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}>
                        <X size={20} />
                    </button>
                </div>
            )}

            {/* Message Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(0,0,0,0.2)' }} className="custom-scrollbar">
                {loading ? (
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div className="animate-spin" style={{ width: '24px', height: '24px', border: '2px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', opacity: 0.5 }}>
                        <MessageSquare size={32} style={{ marginBottom: '0.5rem' }} />
                        <p style={{ fontSize: '0.8rem' }}>No messages yet. Start the conversation about your custom gift!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const senderId = msg.sender?._id || msg.sender;
                        const isMe = senderId?.toString() === user?._id?.toString() || senderId?.toString() === user?.id?.toString();
                        
                        return (
                            <div key={idx} style={{ 
                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                maxWidth: '75%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isMe ? 'flex-end' : 'flex-start',
                                marginBottom: '0.5rem'
                            }}>
                                <div style={{ 
                                    padding: '0.7rem 1rem', 
                                    borderRadius: '16px',
                                    borderTopRightRadius: isMe ? '4px' : '16px',
                                    borderTopLeftRadius: isMe ? '16px' : '4px',
                                    background: isMe ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                    position: 'relative',
                                    lineHeight: '1.4'
                                }}>
                                    {msg.content}
                                    <div style={{ 
                                        fontSize: '0.65rem', 
                                        opacity: 0.6, 
                                        marginTop: '4px',
                                        textAlign: 'right',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        gap: '4px'
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
            <form onSubmit={handleSend} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)' }}>
                <div style={{ position: 'relative' }}>
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        style={{ 
                            width: '100%', 
                            padding: '0.75rem 3rem 0.75rem 1rem', 
                            borderRadius: '24px', 
                            background: 'var(--bg-tertiary)', 
                            border: '1px solid var(--border-light)',
                            color: 'white',
                            fontSize: '0.85rem',
                            outline: 'none'
                        }}
                    />
                    <button 
                        type="submit"
                        disabled={!input.trim()}
                        style={{ 
                            position: 'absolute', 
                            right: '6px', 
                            top: '50%', 
                            transform: 'translateY(-50%)',
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '50%', 
                            background: 'var(--accent-primary)', 
                            border: 'none', 
                            color: 'white', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            cursor: 'pointer',
                            opacity: input.trim() ? 1 : 0.5
                        }}
                    >
                        <Send size={14} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ArtisanChat;
