import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Store, ShoppingCart, DollarSign, Activity, AlertTriangle, Tag, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: `4px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
      <div style={{ padding: '0.5rem', background: `${color}20`, borderRadius: '10px' }}>
        <Icon size={18} color={color} />
      </div>
    </div>
    <div style={{ fontSize: '2rem', fontWeight: '900' }}>{value}</div>
    {sub && <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sub}</div>}
  </div>
);

const AdminOverview = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/admin/dashboard/stats')
      .then(res => setData(res.data.data))
      .catch(err => console.error('Admin stats error:', err))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '0.25rem' }}>Admin Overview</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user?.displayName}. Here's your platform summary.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>Loading platform statistics...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
            <StatCard label="Total Users" value={stats?.totalUsers?.toLocaleString() || '0'} icon={Users} color="#3b82f6" sub="Registered accounts" />
            <StatCard label="Active Creators" value={stats?.totalSellers?.toLocaleString() || '0'} icon={Store} color="#8b5cf6" sub="Verified partners" />
            <StatCard label="Total Orders" value={stats?.totalOrders?.toLocaleString() || '0'} icon={ShoppingCart} color="#10b981" sub="Lifetime orders" />
            <StatCard label="Gross Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} color="#f59e0b" sub="Platform volume" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
            <StatCard label="Active Products" value={stats?.totalProducts?.toLocaleString() || '0'} icon={Tag} color="#ec4899" sub="Live listings" />
            <StatCard label="Open Grievances" value={stats?.pendingGrievances?.toLocaleString() || '0'} icon={AlertTriangle} color="#ef4444" sub="Need attention" />
            <StatCard label="Active Coupons" value={stats?.activeCoupons?.toLocaleString() || '0'} icon={TrendingUp} color="#06b6d4" sub="Discount codes" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={20} color="var(--accent-primary)" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Recent Orders</h3>
                </div>
                <Link to="/admin-dashboard/orders" style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '600' }}>
                  View All <ArrowRight size={14} />
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {data?.recentOrders?.length > 0 ? data.recentOrders.slice(0, 6).map(order => (
                  <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>#{order._id.slice(-6).toUpperCase()}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.buyer?.name || 'Customer'} · {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>₹{order.amount || 0}</p>
                      <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--success)', fontWeight: 'bold' }}>{order.status}</span>
                    </div>
                  </div>
                )) : <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No recent orders.</p>}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Store size={20} color="var(--warning)" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>New Creators</h3>
                </div>
                <Link to="/admin-dashboard/sellers" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '600' }}>View All</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {data?.recentSellers?.length > 0 ? data.recentSellers.slice(0, 6).map(seller => {
                  const businessName = seller.creatorProfile?.businessName || seller.displayName || 'Creator';
                  return (
                    <div key={seller._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                      <div style={{ background: 'var(--accent-primary)', width: '36px', height: '36px', minWidth: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.9rem' }}>
                        {businessName[0]}
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <p style={{ fontWeight: '600', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{businessName}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{seller.email}</p>
                      </div>
                    </div>
                  );
                }) : <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No creators yet.</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminOverview;
