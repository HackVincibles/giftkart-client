import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, DollarSign, Sparkles } from 'lucide-react';

const CreatorDashboardHome = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // In a real app, this would fetch from /creator-dashboard
    // For now, setting mock data after timeout
    setTimeout(() => {
      setData({
        pendingOrders: 12,
        activeProducts: 34,
        totalEarnings: '45,200',
        rating: 4.8
      });
      setLoading(false);
    }, 1000);
  }, []);

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
              <button className="btn btn-secondary mt-4 w-full">View Queue</button>
            </div>

            <div className="stat-card">
              <h3 className="stat-label">Total Earnings (This Month)</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <DollarSign size={32} color="var(--success)" />
                <p className="stat-value" style={{ margin: 0 }}>₹{data.totalEarnings}</p>
              </div>
              <button className="btn btn-secondary mt-4 w-full">Withdraw to Bank</button>
            </div>

            <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))', borderColor: 'var(--accent-primary)' }}>
              <h3 className="stat-label" style={{ color: 'var(--accent-secondary)' }}>AI Insights</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <Sparkles size={32} color="var(--accent-primary)" />
                <p style={{ fontWeight: '500', margin: 0 }}>High demand for "Mother's Day" products</p>
              </div>
              <button className="btn mt-4 w-full" style={{ background: 'var(--accent-primary)', color: 'white' }}>Generate Product Ideas</button>
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
                  <tr style={{ borderTop: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1rem' }}>#GK-8924</td>
                    <td style={{ padding: '1rem' }}>Custom Photo Frame</td>
                    <td style={{ padding: '1rem' }}><span style={{ color: 'var(--warning)' }}>Pending</span></td>
                    <td style={{ padding: '1rem' }}>2 Photos, Engraving</td>
                    <td style={{ padding: '1rem' }}><button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Process</button></td>
                  </tr>
                  <tr style={{ borderTop: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1rem' }}>#GK-8923</td>
                    <td style={{ padding: '1rem' }}>Memory Scrapbook</td>
                    <td style={{ padding: '1rem' }}><span style={{ color: 'var(--accent-secondary)' }}>In Production</span></td>
                    <td style={{ padding: '1rem' }}>AI Poem Included</td>
                    <td style={{ padding: '1rem' }}><button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Update</button></td>
                  </tr>
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
