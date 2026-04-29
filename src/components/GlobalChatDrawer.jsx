import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Send, MessageSquare, ArrowLeft, Loader, User } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';
import ArtisanChat from './ArtisanChat';

const GlobalChatDrawer = ({ onClose }) => {
    const [view, setView] = useState('inbox'); // 'inbox' or 'chat'
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeChat, setActiveChat] = useState(null);
    const { error } = useToast();
    const { socket } = useSocket();

    useEffect(() => {
        fetchConversations();
        
        if (socket) {
            socket.on('new-message', () => {
                fetchConversations();
            });
        }
        
        return () => {
            if (socket) socket.off('new-message');
        };
    }, [socket]);

    const fetchConversations = async () => {
        try {
            const res = await axios.get('/chat/conversations');
            if (res.data.success) {
                setConversations(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch conversations', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChat = (conv) => {
        setActiveChat({
            orderId: conv.orderId,
            recipientId: conv.otherUser.id,
            recipientName: conv.otherUser.name
        });
        setView('chat');
    };

    return (
        <div className="glass-panel animate-slide-in" style={{
            position: 'fixed', bottom: '20px', right: '20px', width: '380px', height: '600px',
            maxHeight: '80vh', zIndex: 2000, display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '1px solid var(--accent-primary)30',
            overflow: 'hidden', borderRadius: '24px'
        }}>
            {/* Header */}
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {view === 'chat' && (
                        <button onClick={() => setView('inbox')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', fontFamily: 'Outfit' }}>
                        {view === 'inbox' ? 'Messages' : activeChat?.recipientName}
                    </h3>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={22} />
                </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.2)' }}>
                {view === 'inbox' ? (
                    loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                            <Loader className="animate-spin" color="var(--accent-primary)" />
                        </div>
                    ) : conversations.length > 0 ? (
                        conversations.map((conv, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => handleSelectChat(conv)}
                                style={{ 
                                    padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', 
                                    cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.03)',
                                    transition: 'all 0.2s', background: conv.unread ? 'rgba(139, 92, 246, 0.05)' : 'transparent'
                                }}
                                className="hover-glow"
                            >
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-primary)20', overflow: 'hidden', flexShrink: 0, border: '2px solid var(--border-light)' }}>
                                    {conv.otherUser.avatar ? (
                                        <img src={conv.otherUser.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={24} color="var(--accent-primary)" />
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                        <p style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{conv.otherUser.name}</p>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {conv.lastMessage}
                                    </p>
                                </div>
                                {conv.unread && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-primary)' }} />}
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                            <MessageSquare size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                            <p>No conversations yet. Order a gift to start chatting with an artisan!</p>
                        </div>
                    )
                ) : (
                    <ArtisanChat 
                        orderId={activeChat.orderId}
                        recipientId={activeChat.recipientId}
                        recipientName={activeChat.recipientName}
                        embedded={true}
                    />
                )}
            </div>
        </div>
    );
};

export default GlobalChatDrawer;
