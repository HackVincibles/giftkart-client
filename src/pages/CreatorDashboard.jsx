import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { ShoppingCart, Package, DollarSign, TrendingUp, Sparkles, MessageSquare, Plus, ArrowRight, User, Settings, LogOut, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreatorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Mock data for now
    setTimeout(() => {
      setData({
        pendingOrders: 12,
        activeProducts: 34,
        totalEarnings: 45200,
        rating: 4.8,
        recentOrders: [
            { id: '#GK-8924', product: 'Custom Photo Frame', status: 'Pending', customization: '2 Photos, Engraving' },
            { id: '#GK-8923', product: 'Memory Scrapbook', status: 'In Production', customization: 'AI Poem Included' },
            { id: '#GK-8922', product: 'Handcrafted Lamp', status: 'Completed', customization: 'Warm LEDs' }
        ]
      });
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="kl-root">
      <Navbar />
      
      <main className="container" style={{ paddingTop: '8rem', paddingBottom: '8rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                    <Sparkles size={14} /> Creator Studio
                </div>
                <h1 style={{ fontSize: '3rem', lineHeight: '1' }}>Your Creative Space</h1>
            </div>
            <button onClick={() => navigate('/add-product')} className="btn btn-primary">
                <Plus size={18} /> New Product
            </button>
        </div>

        {loading ? (
            <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Curating your studio insights...</div>
        ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
                        <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', marginBottom: '1rem' }}>Revenue</p>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>₹{data.totalEarnings.toLocaleString()}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.8rem' }}>
                            <TrendingUp size={14} /> +12% from last month
                        </div>
                    </div>
                    <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
                        <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', marginBottom: '1rem' }}>Active Curation</p>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{data.activeProducts}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Items listed in marketplace</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-secondary)' }}>
                        <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', marginBottom: '1rem' }}>Pending Requests</p>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{data.pendingOrders}</h2>
                        <button style={{ color: 'var(--text)', fontSize: '0.8rem', fontWeight: '700', textDecoration: 'underline' }}>View Queue</button>
                    </div>
                </div>

                {/* AI Insights Card */}
                <div style={{ background: 'var(--accent)', color: 'var(--white)', padding: '3rem', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ maxWidth: '600px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7, marginBottom: '1.5rem' }}>
                            <Sparkles size={14} /> Intelligence Suggestion
                        </div>
                        <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'inherit' }}>Trending: Sustainable Packaging</h3>
                        <p style={{ opacity: 0.8, lineHeight: '1.7' }}>Our community is showing a 40% increase in searches for "eco-friendly gifts". Consider updating your packaging options to increase conversion.</p>
                    </div>
                    <button className="btn" style={{ background: 'var(--white)', color: 'var(--black)' }}>Update Curation</button>
                </div>

                {/* Recent Orders Table */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.5rem' }}>Recent Order Requests</h3>
                        <button style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>View All <ChevronRight size={14} /></button>
                    </div>
                    <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', padding: 0 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                                    <th style={{ textAlign: 'left', padding: '1.5rem 2rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-light)' }}>Order</th>
                                    <th style={{ textAlign: 'left', padding: '1.5rem 2rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-light)' }}>Product</th>
                                    <th style={{ textAlign: 'left', padding: '1.5rem 2rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-light)' }}>Status</th>
                                    <th style={{ textAlign: 'left', padding: '1.5rem 2rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-light)' }}>Notes</th>
                                    <th style={{ textAlign: 'right', padding: '1.5rem 2rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-light)' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentOrders.map((order, idx) => (
                                    <tr key={idx} style={{ borderBottom: idx === data.recentOrders.length - 1 ? 'none' : '1px solid var(--border)' }}>
                                        <td style={{ padding: '1.5rem 2rem', fontSize: '0.9rem', fontWeight: '700' }}>{order.id}</td>
                                        <td style={{ padding: '1.5rem 2rem', fontSize: '0.9rem' }}>{order.product}</td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem', borderRadius: '20px', background: order.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: order.status === 'Completed' ? '#10b981' : '#f59e0b' }}>{order.status}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{order.customization}</td>
                                        <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                            <button style={{ color: 'var(--text)', fontSize: '0.8rem', fontWeight: '700' }}>Manage</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default CreatorDashboard;
