import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { LogOut, User as UserIcon, Gift, ShoppingCart, X, Bell, Trash2, Check, Sparkles, Calendar, Heart, Users, Store, MessageSquare, Wallet, Shield, Search } from 'lucide-react';
import GlobalChatDrawer from './GlobalChatDrawer';

// Admin-specific notification bell (fetches from /admin/notifications)
const AdminNotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const typeIcon = { seller_registration: Store, grievance: MessageSquare, withdrawal_request: Wallet, system: Shield };
  const typeColor = { seller_registration: '#8b5cf6', grievance: '#ef4444', withdrawal_request: '#f59e0b', system: '#3b82f6' };

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

  const markAllRead = async () => {
    try {
      await axios.put('/admin/notifications/all/read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnread(0);
    } catch {}
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '0.5rem', display: 'flex', alignItems: 'center' }}>
        <Shield size={22} color={unread > 0 ? '#8b5cf6' : 'var(--text-muted)'} />
        {unread > 0 && (
          <span style={{ position: 'absolute', top: '2px', right: '2px', background: '#ef4444', color: 'white', borderRadius: '50%', width: '17px', height: '17px', fontSize: '0.62rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', border: '2px solid var(--bg-secondary)' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="glass-panel" style={{ position: 'absolute', top: '110%', right: 0, width: '360px', maxHeight: '460px', overflowY: 'auto', zIndex: 1100, boxShadow: '0 16px 48px rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>Admin Alerts</h3>
            {unread > 0 && <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600' }}>Mark all read</button>}
          </div>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <Shield size={32} style={{ opacity: 0.2, marginBottom: '0.5rem', display: 'block', margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.85rem' }}>No admin alerts</p>
            </div>
          ) : notifications.map(n => {
            const Icon = typeIcon[n.type] || Bell;
            const color = typeColor[n.type] || '#94a3b8';
            return (
              <div key={n._id} onClick={() => !n.isRead && markRead(n._id)}
                style={{ padding: '0.75rem', borderRadius: '12px', marginBottom: '0.4rem', cursor: n.isRead ? 'default' : 'pointer', background: n.isRead ? 'rgba(255,255,255,0.02)' : `${color}10`, border: `1px solid ${n.isRead ? 'rgba(255,255,255,0.05)' : color + '30'}`, transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                  <div style={{ padding: '0.35rem', background: `${color}20`, borderRadius: '7px', flexShrink: 0 }}><Icon size={13} color={color} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: '0.83rem', fontWeight: n.isRead ? '500' : '700', margin: 0 }}>{n.title}</p>
                      {!n.isRead && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, flexShrink: 0 }} />}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0', lineHeight: 1.4 }}>{n.message}</p>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: '0.3rem 0 0' }}>{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, deleteNotification, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <nav className="navbar-container">

      <div className="nav-left" style={{ display: 'flex', alignItems: 'center', gap: 'var(--nav-gap, 2rem)', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <Gift color="var(--accent-primary)" size={24} />
          <Link 
            to={user ? (user.role === 'buyer' ? '/buyer-dashboard' : user.role === 'creator' ? '/creator-dashboard' : '/admin-dashboard') : '/'} 
            className="nav-logo-text"
            style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'Outfit', textDecoration: 'none', fontSize: '1.25rem' }}
          >
            Gift<span className="text-gradient">Kart</span>
          </Link>
        </div>

        {user?.role === 'buyer' && (
          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <Link to="/buyer-dashboard" onClick={() => setIsMenuOpen(false)} className="nav-link">Marketplace</Link>
            <Link to="/social-wishlist" onClick={() => setIsMenuOpen(false)} className="nav-link">
              <Users size={16} color="var(--accent-primary)" /> Social Wishlist
            </Link>
            <Link to="/auto-gifting" onClick={() => setIsMenuOpen(false)} className="nav-link">
              <Calendar size={16} color="var(--accent-secondary)" /> Calendar
            </Link>
            <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="nav-link">
              <Heart size={16} color="#ef4444" /> Wishlist
            </Link>
            <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="nav-link">My Orders</Link>
            
            <div className="mobile-only" style={{ marginTop: 'auto', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
               <button onClick={handleLogout} className="btn btn-secondary w-full" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--nav-gap, 1rem)' }}>

        {user ? (
          <>
            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {localStorage.getItem('activeScheduleId') && (
                <div style={{ 
                  background: 'rgba(139, 92, 246, 0.1)', 
                  padding: '0.4rem 1rem', 
                  borderRadius: '20px', 
                  border: '1px solid var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8rem'
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>Shopping for:</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-secondary)' }}>{localStorage.getItem('activeScheduleRecipient')}</span>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('activeScheduleId');
                      localStorage.removeItem('activeScheduleRecipient');
                      navigate(0);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {user?.role === 'admin' && <AdminNotificationBell />}
              {user?.role !== 'admin' && (
                <div style={{ position: 'relative' }} ref={notificationRef}>
                  <button onClick={() => setShowNotifications(!showNotifications)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', position: 'relative', padding: '0.5rem' }}>
                    <Bell size={24} />
                    {unreadCount > 0 && <span style={{ position: 'absolute', top: '2px', right: '2px', background: 'var(--danger)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '2px solid var(--bg-secondary)' }}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
                  </button>
                  {showNotifications && (
                    <div className="glass-panel" style={{ position: 'absolute', top: '100%', right: 0, width: '320px', maxWidth: '90vw', maxHeight: '450px', marginTop: '0.5rem', overflowY: 'auto', zIndex: 1100, boxShadow: '0 10px 25px rgba(0,0,0,0.5)', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1rem', margin: 0 }}>Notifications</h3>
                        <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.8rem', cursor: 'pointer' }}>Mark all read</button>
                      </div>
                      {notifications.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {notifications.map(n => (
                            <div key={n._id} style={{ padding: '0.75rem', borderRadius: '8px', background: n.read ? 'rgba(255,255,255,0.02)' : 'rgba(139, 92, 246, 0.05)', border: n.read ? '1px solid transparent' : '1px solid rgba(139, 92, 246, 0.2)', position: 'relative' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.25rem 0', color: n.read ? 'var(--text-muted)' : 'var(--text-primary)' }}>{n.title}</h4>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                  {!n.read && <button onClick={() => markAsRead(n._id)} style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer' }}><Check size={14} /></button>}
                                  <button onClick={() => deleteNotification(n._id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                </div>
                              </div>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{n.message}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          <Bell size={32} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                          <p style={{ fontSize: '0.9rem' }}>No new notifications</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {user?.role !== 'admin' && (
                <button 
                    id="nav-message-btn"
                    onClick={() => setShowChat(!showChat)} 
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', position: 'relative', padding: '0.5rem', transition: 'transform 0.2s' }}
                    className="hover:scale-110"
                >
                    <MessageSquare size={24} color={showChat ? 'var(--accent-primary)' : 'var(--text-primary)'} />
                    {unreadCount > 0 && <span style={{ position: 'absolute', top: '2px', right: '2px', background: 'var(--accent-primary)', color: 'white', borderRadius: '50%', width: '12px', height: '12px', border: '2px solid var(--bg-secondary)' }}></span>}
                </button>
              )}

              {user?.role === 'buyer' && (
                <Link to="/cart" style={{ color: 'var(--text-primary)', position: 'relative', display: 'flex', alignItems: 'center', padding: '0.5rem' }}>
                  <ShoppingCart size={24} />
                </Link>
              )}

              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: 'rgba(139, 92, 246, 0.2)', width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {user.avatar ? <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserIcon size={18} color="var(--accent-primary)" />}
                </div>
                <div className="desktop-only" style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: '600', fontSize: '0.8rem' }}>{user.displayName || user.name || 'User'}</span>
                </div>
              </Link>
              
              <div className="desktop-only">
                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <LogOut size={14} /> Logout
                </button>
              </div>

              {/* Hamburger Button */}
              <button className="mobile-only" onClick={toggleMenu} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
                {isMenuOpen ? <X size={28} /> : <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ width: '24px', height: '2px', background: 'var(--text-primary)', borderRadius: '2px' }}></div>
                  <div style={{ width: '24px', height: '2px', background: 'var(--text-primary)', borderRadius: '2px' }}></div>
                  <div style={{ width: '24px', height: '2px', background: 'var(--text-primary)', borderRadius: '2px' }}></div>
                </div>}
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Sign Up</Link>
          </div>
        )}
      </div>

      </nav>

      {/* Floating Global Chat Drawer */}
      {showChat && <GlobalChatDrawer onClose={() => setShowChat(false)} />}

    </>
  );
};

export default Navbar;
