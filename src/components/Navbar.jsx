import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, User as UserIcon, Gift, ShoppingBag, X, Bell, Trash2, Check, Sparkles, Calendar, Heart, Users, Store, MessageSquare, Wallet, Shield, Search, Sun, Moon } from 'lucide-react';
import GlobalChatDrawer from './GlobalChatDrawer';

const AdminNotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const typeIcon = { creator_registration: Store, grievance: MessageSquare, withdrawal_request: Wallet, system: Shield };
  const typeColor = { creator_registration: 'var(--text)', grievance: '#ef4444', withdrawal_request: '#f59e0b', system: '#3b82f6' };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifs = async () => {
    try {
      const res = await axios.get('/admin/notifications');
      if (res.data.success) {
        setNotifications(res.data.data.notifications);
        setUnread(res.data.data.unreadCount);
      }
    } catch {}
  };

  const markRead = async (id) => {
    try {
      await axios.put(`/admin/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch {}
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} className="kl-nav-icon-btn">
        <Shield size={20} color={unread > 0 ? 'var(--text)' : 'var(--text-muted)'} />
        {unread > 0 && <span className="kl-notif-dot">{unread}</span>}
      </button>

      {open && (
        <div className="glass-panel kl-dropdown">
          <div className="kl-dropdown-header">
            <h3>Admin Alerts</h3>
          </div>
          <div className="kl-dropdown-content">
            {notifications.length === 0 ? <p className="kl-empty-text">No alerts</p> : 
              notifications.map(n => (
                <div key={n._id} onClick={() => !n.isRead && markRead(n._id)} className={`kl-notif-item ${n.isRead ? 'read' : ''}`}>
                  <p className="kl-notif-title">{n.title}</p>
                  <p className="kl-notif-msg">{n.message}</p>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, deleteNotification, markAllAsRead } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [conversations, setConversations] = useState([]);
  const notificationRef = useRef(null);

  useEffect(() => {
    if (user) {
        fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
        const res = await axios.get('/chat/conversations');
        if (res.data.success) {
            setConversations(res.data.data);
        }
    } catch (err) {
        console.error('Failed to fetch conversations for navbar', err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="kl-nav">
        <div className="kl-nav-left">
          <Link to="/" className="kl-nav-logo">GiftKart</Link>
          
          <div className={`kl-nav-links ${isMenuOpen ? 'active' : ''}`}>
            {user ? (
              <>
                <Link to={user.role === 'admin' ? '/admin-dashboard' : user.role === 'buyer' ? '/buyer-dashboard' : '/creator-dashboard'}>Dashboard</Link>
                {user.role === 'buyer' && (
                  <>
                    <Link to="/vibe-coder" style={{ color: 'var(--accent)', fontWeight: '800' }}>
                      <Sparkles size={14} style={{ marginRight: '4px' }} /> Vibe-Coder
                    </Link>
                    <Link to="/inspiration">Inspiration</Link>
                    <Link to="/social-wishlist">Social</Link>
                    <Link to="/auto-gifting">Calendar</Link>
                    <Link to="/wishlist">Wishlist</Link>
                    <Link to="/orders">Orders</Link>
                  </>
                )}
                {(user.role === 'creator') && (
                  <>
                    <Link to="/buyer-dashboard">Marketplace</Link>
                    <Link to="/profile">Studio Settings</Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Link to="/buyer-dashboard">Marketplace</Link>
                    <Link to="/inspiration">Inspiration</Link>
              </>
            )}
          </div>
        </div>

        <div className="kl-nav-right">
          <button onClick={toggleTheme} className="kl-nav-icon-btn">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <>
              {user.role === 'admin' && <AdminNotificationBell />}
              
              <div style={{ position: 'relative' }} ref={notificationRef}>
                <button onClick={() => setShowNotifications(!showNotifications)} className="kl-nav-icon-btn">
                  <Bell size={20} />
                  {unreadCount > 0 && <span className="kl-notif-dot"></span>}
                </button>
                {showNotifications && (
                  <div className="glass-panel kl-dropdown">
                    <div className="kl-dropdown-header">
                      <h3>Notifications</h3>
                      <button onClick={markAllAsRead}>Clear all</button>
                    </div>
                    <div className="kl-dropdown-content">
                      {notifications.length === 0 ? <p className="kl-empty-text">No notifications</p> : 
                        notifications.map(n => (
                          <div key={n._id} className="kl-notif-item">
                            <p className="kl-notif-title">{n.title}</p>
                            <p className="kl-notif-msg">{n.message}</p>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setShowChat(!showChat)} 
                className="kl-nav-icon-btn hover-scale"
                style={{ position: 'relative', color: showChat ? 'var(--accent)' : 'var(--text-muted)' }}
                title="Chats"
              >
                <MessageSquare size={20} />
                {conversations?.some(c => c.unread) && <span className="kl-notif-dot" style={{ background: 'var(--accent)' }}></span>}
              </button>

              {user.role === 'buyer' && (
                <Link to="/wallet" className="kl-nav-icon-btn" title="My Wallet">
                  <Wallet size={20} />
                </Link>
              )}

              <Link to="/cart" className="kl-nav-icon-btn">
                <ShoppingBag size={20} />
              </Link>

              <div className="kl-user-profile">
                <Link to="/profile" className="kl-profile-trigger">
                  <div className="kl-avatar">
                    {user.avatar ? <img src={user.avatar} alt="" /> : <UserIcon size={16} />}
                  </div>
                  <span className="kl-username">{user.displayName || user.name}</span>
                </Link>
                <button onClick={handleLogout} className="kl-logout-btn"><LogOut size={14} /></button>
              </div>
            </>
          ) : (
            <div className="kl-auth-btns">
              <Link to="/login" className="kl-signin-link">Sign In</Link>
              <Link to="/register" className="btn btn-primary">Join</Link>
            </div>
          )}

          <button className="kl-mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <div className="kl-hamburger"><span></span><span></span></div>}
          </button>
        </div>
      </nav>

      {showChat && <GlobalChatDrawer onClose={() => setShowChat(false)} />}
      
      <style>{`
        .kl-nav-left { display: flex; align-items: center; gap: 3rem; }
        .kl-nav-links { display: flex; gap: 2rem; }
        .kl-nav-links a { 
          font-size: 0.75rem; 
          text-transform: uppercase; 
          letter-spacing: 0.1em; 
          color: var(--text-muted); 
          position: relative;
          padding: 0.5rem 0;
          transition: color 0.3s ease;
        }
        .kl-nav-links a::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 1px;
          background: var(--text);
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .kl-nav-links a:hover { color: var(--text); }
        .kl-nav-links a:hover::after { width: 100%; }
        
        .kl-nav-icon-btn { color: var(--text-muted); display: flex; align-items: center; justify-content: center; padding: 0.5rem; transition: var(--transition); }
        .kl-nav-icon-btn:hover { color: var(--text); transform: translateY(-1px); }
        
        .kl-notif-dot { position: absolute; top: 4px; right: 4px; width: 6px; height: 6px; background: var(--text); border-radius: 50%; }
        
        .kl-dropdown { position: absolute; top: 110%; right: 0; width: 300px; border-radius: var(--radius-md); padding: 1rem; z-index: 1100; }
        .kl-dropdown-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border); }
        .kl-dropdown-header h3 { font-size: 0.9rem; }
        .kl-dropdown-header button { font-size: 0.7rem; color: var(--text-muted); }
        
        .kl-notif-item { padding: 0.8rem; border-radius: var(--radius-sm); margin-bottom: 0.5rem; transition: var(--transition); }
        .kl-notif-item:hover { background: var(--bg-tertiary); }
        .kl-notif-title { font-size: 0.85rem; font-weight: 700; margin-bottom: 0.2rem; }
        .kl-notif-msg { font-size: 0.75rem; color: var(--text-muted); line-height: 1.4; }
        .kl-empty-text { font-size: 0.8rem; color: var(--text-light); text-align: center; padding: 2rem 0; }
        
        .kl-user-profile { display: flex; align-items: center; gap: 1rem; margin-left: 1rem; }
        .kl-profile-trigger { display: flex; align-items: center; gap: 0.5rem; }
        .kl-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .kl-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .kl-username { font-size: 0.85rem; font-weight: 500; }
        .kl-logout-btn { color: var(--text-light); }
        .kl-logout-btn:hover { color: var(--text); }
        
        .kl-auth-btns { display: flex; align-items: center; gap: 1.5rem; }
        .kl-signin-link { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); }
        .kl-signin-link:hover { color: var(--text); }
        
        .kl-mobile-menu-btn { display: none; }
        
        @media (max-width: 768px) {
          .kl-nav-links { display: none; }
          .kl-username { display: none; }
          .kl-mobile-menu-btn { display: block; margin-left: 1rem; }
          .kl-hamburger { display: flex; flex-direction: column; gap: 4px; }
          .kl-hamburger span { width: 18px; height: 2px; background: var(--text); }
        }
      `}</style>
    </>
  );
};

export default Navbar;
