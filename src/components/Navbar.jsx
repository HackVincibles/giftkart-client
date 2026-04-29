import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { LogOut, User as UserIcon, Gift, ShoppingCart, X, Bell, Trash2, Check, Sparkles, Calendar, Heart, Users, Store, MessageSquare, Wallet, Shield } from 'lucide-react';

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
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  React.useEffect(() => {
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

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem 2rem',
      backgroundColor: 'rgba(15, 23, 42, 0.8)', // Semi-transparent dark background
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-light)',
      height: '70px',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      width: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Gift color="var(--accent-primary)" size={28} />
          <Link 
            to={user ? (user.role === 'buyer' ? '/buyer-dashboard' : user.role === 'creator' ? '/creator-dashboard' : '/admin-dashboard') : '/'} 
            style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'Outfit', textDecoration: 'none' }}
          >
            Gift<span className="text-gradient">Kart</span>
          </Link>
        </div>

        {user?.role === 'buyer' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginLeft: '1rem' }}>
            <Link to="/buyer-dashboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }} className="hover:text-primary transition-colors">Marketplace</Link>
            <Link to="/social-wishlist" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }} className="hover:text-primary transition-colors">
              <Users size={16} color="var(--accent-primary)" /> Social Wishlist
            </Link>
            <Link to="/auto-gifting" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }} className="hover:text-primary transition-colors">
              <Calendar size={16} color="var(--accent-secondary)" /> Calendar
            </Link>
            <Link to="/wishlist" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }} className="hover:text-primary transition-colors">
              <Heart size={16} color="#ef4444" /> Wishlist
            </Link>
            <Link to="/orders" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }} className="hover:text-primary transition-colors">My Orders</Link>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {user ? (
          <>
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
                    navigate(0); // Refresh
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Admin Notification Bell — only for admins */}
            {user?.role === 'admin' && <AdminNotificationBell />}

            {/* Regular Notification Bell — for non-admin users */}
            {user?.role !== 'admin' && (
            <div style={{ position: 'relative' }} ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', position: 'relative', padding: '0.5rem' }}
              >
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    background: 'var(--danger)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    border: '2px solid var(--bg-secondary)'
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="glass-panel" style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  width: '350px',
                  maxHeight: '450px',
                  marginTop: '0.5rem',
                  overflowY: 'auto',
                  zIndex: 1100,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  padding: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem', margin: 0 }}>Notifications</h3>
                    <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.8rem', cursor: 'pointer' }}>Mark all read</button>
                  </div>

                  {notifications.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {notifications.map(n => (
                        <div key={n._id} style={{ 
                          padding: '0.75rem', 
                          borderRadius: '8px', 
                          background: n.read ? 'rgba(255,255,255,0.02)' : 'rgba(139, 92, 246, 0.05)',
                          border: n.read ? '1px solid transparent' : '1px solid rgba(139, 92, 246, 0.2)',
                          position: 'relative'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.25rem 0', color: n.read ? 'var(--text-muted)' : 'var(--text-primary)' }}>{n.title}</h4>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              {!n.read && (
                                <button onClick={() => markAsRead(n._id)} style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer' }} title="Mark as read">
                                  <Check size={14} />
                                </button>
                              )}
                              <button onClick={() => deleteNotification(n._id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="Delete">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{n.message}</p>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
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

            {user?.role === 'buyer' && (
              <Link to="/cart" style={{ color: 'var(--text-primary)', position: 'relative', display: 'flex', alignItems: 'center', padding: '0.5rem' }} className="hover:opacity-80 transition-opacity">
                <ShoppingCart size={24} />
              </Link>
            )}
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }} className="hover:opacity-80 transition-opacity">
              <div style={{
                background: 'rgba(139, 92, 246, 0.2)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <UserIcon size={20} color="var(--accent-primary)" />
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.displayName || user.name || 'User'}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {user.role}
                </span>
              </div>
            </Link>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LogOut size={16} /> Logout
            </button>
            {user.role === 'buyer' && (
              <Link to="/seller-login" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold', marginLeft: '0.5rem' }}>Sell on GiftKart</Link>
            )}
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
            <div style={{ height: '20px', width: '1px', background: 'var(--border-light)', margin: '0 0.5rem' }}></div>
            <Link to="/seller-login" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>Sell on GiftKart</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
