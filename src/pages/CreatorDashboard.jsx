import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, DollarSign, TrendingUp, Sparkles, MessageSquare } from 'lucide-react';
import axios from 'axios';

const CreatorDashboard = () => {
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      <div className="dashboard-layout animate-fade-in">
        {/* Creator Sidebar */}
        <div className="sidebar" style={{ padding: '2rem 1rem' }}>
          <div style={{ marginBottom: '2rem', padding: '0 1rem' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Creator Studio
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="btn" style={{ background: 'var(--accent-primary)', color: 'white', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <TrendingUp size={20} /> Dashboard
            </div>
            <div className="btn" style={{ background: 'transparent', color: 'var(--text-secondary)', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ShoppingCart size={20} /> Orders Queue
            </div>
            <div className="btn" style={{ background: 'transparent', color: 'var(--text-secondary)', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Package size={20} /> Products
            </div>
            <div className="btn" style={{ background: 'transparent', color: 'var(--text-secondary)', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Sparkles size={20} /> AI Assistance
            </div>
            <div className="btn" style={{ background: 'transparent', color: 'var(--text-secondary)', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <DollarSign size={20} /> Earnings & Wallet
            </div>
          </div>
        </div>

        <div className="main-content">
          <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="dashboard-title" style={{ fontWeight: '900', marginBottom: '0.25rem' }}>Creator Dashboard</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Welcome back to your studio, {user?.displayName}.</p>
            </div>
            <button className="btn btn-primary mobile-full-width" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <Package size={18} /> Add New Product
            </button>
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
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontWeight: '800' }}>Recent Order Requests</h2>
                <div className="glass-panel" style={{ padding: '0', overflowX: 'auto', borderRadius: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order ID</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customization</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action</th>
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
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
