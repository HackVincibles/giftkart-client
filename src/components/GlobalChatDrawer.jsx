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
        <div className="glass-panel animate-fade-in" style={{
            position: 'fixed', 
            bottom: '2rem', 
            right: '2rem', 
            width: '420px', 
            height: '650px',
            maxHeight: '85vh', 
            zIndex: 3000, 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: 'var(--shadow-2xl)', 
            border: '1px solid var(--border)',
            overflow: 'hidden', 
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg)'
        }}>
            {/* Header */}
            <div style={{ 
                padding: '1.5rem', 
                borderBottom: '1px solid var(--border)', 
                background: 'var(--bg-secondary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {view === 'chat' && (
                        <button onClick={() => setView('inbox')} className="hover-scale" style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '4px' }}>
                            <ArrowLeft size={22} />
                        </button>
                    )}
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', letterSpacing: '-0.02em' }}>
                            {view === 'inbox' ? 'Chats' : activeChat?.recipientName}
                        </h3>
                        {view === 'inbox' && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--accent)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Chats</p>}
                    </div>
                </div>
                <button onClick={onClose} className="hover-scale" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={24} />
                </button>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }} className="custom-scrollbar">
                {view === 'inbox' ? (
                    loading ? (
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <Loader className="animate-spin" color="var(--accent)" size={32} />
                        </div>
                    ) : conversations.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {conversations.map((conv, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => handleSelectChat(conv)}
                                    style={{ 
                                        padding: '1.25rem 1.5rem', 
                                        display: 'flex', 
                                        gap: '1.25rem', 
                                        alignItems: 'center', 
                                        cursor: 'pointer', 
                                        borderBottom: '1px solid var(--border)',
                                        transition: 'all 0.3s', 
                                        background: conv.unread ? 'var(--accent)05' : 'transparent'
                                    }}
                                    className="hover-bg"
                                >
                                    <div style={{ 
                                        width: '54px', 
                                        height: '54px', 
                                        borderRadius: 'var(--radius-full)', 
                                        background: 'var(--bg-secondary)', 
                                        overflow: 'hidden', 
                                        flexShrink: 0, 
                                        border: `2px solid ${conv.unread ? 'var(--accent)' : 'var(--border)'}`,
                                        transition: 'all 0.3s'
                                    }}>
                                        {conv.otherUser?.avatar ? (
                                            <img src={conv.otherUser.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <User size={24} color="var(--text-light)" />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                                            <p style={{ margin: 0, fontWeight: '800', fontSize: '1rem', color: 'var(--text)' }}>{conv.otherUser?.name || 'Artisan'}</p>
                                            <span style={{ fontSize: '0.7rem', color: conv.unread ? 'var(--accent)' : 'var(--text-muted)', fontWeight: '700' }}>
                                                {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <p style={{ 
                                                margin: 0, 
                                                fontSize: '0.85rem', 
                                                color: conv.unread ? 'var(--text)' : 'var(--text-muted)', 
                                                fontWeight: conv.unread ? '700' : '400',
                                                whiteSpace: 'nowrap', 
                                                overflow: 'hidden', 
                                                textOverflow: 'ellipsis' 
                                            }}>
                                                {conv.lastMessage}
                                            </p>
                                            {conv.unread && (
                                                <div style={{ 
                                                    minWidth: '18px', 
                                                    height: '18px', 
                                                    borderRadius: '9px', 
                                                    background: 'var(--accent)', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    fontSize: '0.6rem',
                                                    color: 'var(--bg)',
                                                    fontWeight: '900',
                                                    marginLeft: '0.5rem',
                                                    padding: '0 4px'
                                                }}>
                                                    NEW
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '6rem 3rem', color: 'var(--text-muted)' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <MessageSquare size={36} color="var(--text-light)" />
                            </div>
                            <h4 style={{ color: 'var(--text)', marginBottom: '0.5rem', fontWeight: '800' }}>No Active Chats</h4>
                            <p style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>Start a conversation with our talented creators by placing an order or inquiry!</p>
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
