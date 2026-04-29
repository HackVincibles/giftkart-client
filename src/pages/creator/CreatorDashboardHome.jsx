import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, DollarSign, Sparkles } from 'lucide-react';
import axios from 'axios';

const CreatorDashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/creator-dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      // Fallback to defaults if API fails
      setData({
        pendingOrders: 0,
        activeProducts: 0,
        totalEarnings: '0',
        rating: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessOrder = async (orderQueueId) => {
    try {
      // Automatically move to in-progress when processing starts
      await axios.put(`/creator-dashboard/orders/${orderQueueId}`, { status: 'in-progress' });
      navigate('/creator-dashboard/orders');
    } catch (err) {
      console.error("Failed to process order", err);
      // Fallback navigate anyway
      navigate('/creator-dashboard/orders');
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Creator Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back to your studio, {user?.displayName}.</p>
        </div>
        <Link to="/creator-dashboard/products/add" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={18} /> Add New Product
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>Loading your studio data...</div>
      ) : (
        <>
          <div className="grid">
            <div className="stat-card">
              <h3 className="stat-label">Pending Orders</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <ShoppingCart size={32} color="var(--warning)" />
                <p className="stat-value" style={{ margin: 0 }}>{data.pendingOrders}</p>
              </div>
              <Link to="/creator-dashboard/orders" className="btn btn-secondary mt-4 w-full" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                View Queue
              </Link>
            </div>

            <div className="stat-card">
              <h3 className="stat-label">Total Earnings (This Month)</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <DollarSign size={32} color="var(--success)" />
                <p className="stat-value" style={{ margin: 0 }}>₹{data.totalEarnings}</p>
              </div>
              <Link to="/creator-dashboard/wallet" className="btn btn-secondary mt-4 w-full" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                Withdraw to Bank
              </Link>
            </div>

            <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))', borderColor: 'var(--accent-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>AI STUDIO INSIGHTS</div>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.4', margin: 0 }}>
                    {data.pendingOrders > 0 
                      ? `Your "${data.orderQueue?.[0]?.order?.products?.[0]?.name || 'Custom Gift'}" is trending! Priority fulfillment recommended.` 
                      : "Market analysis suggests adding more 'Minimalist' designs this week."}
                  </p>
                </div>
                <Sparkles size={24} color="var(--accent-primary)" />
              </div>
              <Link to="/creator-dashboard/ai" className="btn btn-secondary mt-4 w-full" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid var(--accent-primary)' }}>
                View Full Analysis
              </Link>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Recent Order Requests</h2>
            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Order ID</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Product</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Customization</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orderQueue && data.orderQueue.length > 0 ? (
                    data.orderQueue.slice(0, 5).map(item => (
                      <tr key={item._id} style={{ borderTop: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '1rem' }}>#{item.order?._id?.slice(-6).toUpperCase() || 'NEW'}</td>
                        <td style={{ padding: '1rem' }}>{item.order?.products?.map(p => p.name).join(', ') || 'Custom Gift'}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            color: item.status === 'new' ? 'var(--warning)' : item.status === 'in-progress' ? 'var(--accent-secondary)' : 'var(--success)',
                            textTransform: 'capitalize'
                          }}>
                            {item.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {item.userInputs?.description || 'Standard Order'}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button 
                            onClick={() => handleProcessOrder(item._id)} 
                            className="btn btn-secondary" 
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                          >
                            Process
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No recent orders.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default CreatorDashboardHome;
