import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { ShoppingBag, DollarSign, Package, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const SellerDashboardHome = () => {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/seller-analytics?period=30d');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        addToast({ type: 'error', message: 'Failed to load dashboard stats' });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your dashboard...</div>;

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="dashboard-title" style={{ fontWeight: '900', marginBottom: '0.5rem' }}>Welcome back!</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Here's what's happening with your store in the last 30 days.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid" style={{ marginBottom: '3rem' }}>
        <div className="glass-panel hover-scale" style={{ padding: '1.25rem', borderRadius: '24px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.75rem', borderRadius: '18px', color: 'var(--accent-primary)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>{stats ? formatCurrency(stats.summary.totalRevenue) : '₹0'}</div>
          </div>
        </div>

        <div className="glass-panel hover-scale" style={{ padding: '1.25rem', borderRadius: '24px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '18px', color: 'var(--accent-secondary)' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Orders</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>{stats ? stats.summary.totalOrders : '0'}</div>
          </div>
        </div>

        <div className="glass-panel hover-scale" style={{ padding: '1.25rem', borderRadius: '24px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '18px', color: '#3b82f6' }}>
            <Package size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Products</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>{stats ? stats.summary.activeProducts : '0'}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-2-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Recent Activity / Top Products */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <TrendingUp size={18} color="var(--accent-primary)" /> Top Products
            </h3>
            <Link to="/seller-dashboard/products" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              All <ArrowRight size={14} />
            </Link>
          </div>

          {stats && stats.topProducts && stats.topProducts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {stats.topProducts.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{p.name}</div>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Sold</div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{p.totalSold}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Revenue</div>
                      <div style={{ fontWeight: '700', color: 'var(--accent-primary)', fontSize: '0.9rem' }}>{formatCurrency(p.revenue)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              No sales activity yet.
            </div>
          )}
        </div>

        {/* AI Suggestions Box */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--accent-primary)30', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(15, 23, 42, 0.2) 100%)' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.1rem' }}>
            <Sparkles size={18} color="var(--accent-primary)" /> AI Insights
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Your revenue is up 12% from last month. Consider running a holiday discount on your top-performing items to boost sales further.
          </p>
          <Link to="/seller-dashboard/ai" className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0.75rem' }}>
            Chat with AI
          </Link>
        </div>
      </div>
    </div>
  );
};


export default SellerDashboardHome;
