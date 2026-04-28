import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { LogOut, User as UserIcon, Gift, ShoppingCart, X, Bell, Trash2, Check, Sparkles, Calendar, Heart } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, deleteNotification, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const notificationRef = React.useRef(null);

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
      padding: '1rem 2rem',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-light)',
      height: '70px',
      position: 'relative',
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Gift color="var(--accent-primary)" size={28} />
          <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'Outfit', textDecoration: 'none' }}>
            Gift<span className="text-gradient">Kart</span>
          </Link>
        </div>

        {user?.role === 'buyer' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginLeft: '1rem' }}>
            <Link to="/buyer-dashboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }} className="hover:text-primary transition-colors">Marketplace</Link>
            <Link to="/gifting-ai" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }} className="hover:text-primary transition-colors">
              <Sparkles size={16} color="var(--accent-primary)" /> Gifting AI
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

            {/* Notifications Bell */}
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

            <Link to="/cart" style={{ color: 'var(--text-primary)', position: 'relative', display: 'flex', alignItems: 'center', padding: '0.5rem' }} className="hover:opacity-80 transition-opacity">
              <ShoppingCart size={24} />
            </Link>
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
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
