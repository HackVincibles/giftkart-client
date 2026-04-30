import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { ShoppingBag, DollarSign, Package, TrendingUp, ArrowRight, Sparkles, AlertTriangle, BarChart3, Tag, Truck, ChevronRight, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const SellerDashboardHome = () => {
  const { success, error } = useToast();
  const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        fetchStats();
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const res = await axios.get('/api/seller-products/submissions');
            if (res.data.success) setSubmissions(res.data.data);
        } catch (err) {
            console.error("Submissions error:", err);
        }
    };

    const handleApprove = async (id) => {
        try {
            await axios.post(`/api/seller-products/approve-submission/${id}`, {
                price: 4999, // Default premium price for artisan hampers
                category: 'Artisan Curated',
                name: 'Kindred Masterpiece: The Artisan Blend'
            });
            success?.("Masterpiece is now LIVE in the shop!");
            fetchSubmissions();
            fetchStats();
        } catch (err) {
            error?.("Failed to approve submission.");
        }
    };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/seller-analytics?period=30d');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      // Mock data for demo
      setStats({
        summary: { totalRevenue: 125400, totalOrders: 42, activeProducts: 85 },
        topProducts: [
            { name: 'Luxury Gift Box Set', totalSold: 12, revenue: 15600 },
            { name: 'Corporate Desk Organizer', totalSold: 8, revenue: 12000 }
        ],
        inventoryAlerts: [
            { name: 'Premium Wrapping Paper', stock: 4 },
            { name: 'Scented Candle Bundle', stock: 2 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  if (loading) return <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Synchronizing store data...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text-light)', fontWeight: '800', marginBottom: '0.5rem' }}>Business Overview</p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900' }}>Seller Central</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => navigate('/seller-dashboard/analytics')}>
            <BarChart3 size={16} /> Reports
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/seller-dashboard/products')}>
            <Package size={16} /> Manage Stock
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-muted)' }}>Revenue (30D)</span>
                <DollarSign size={20} color="#10b981" />
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: '900', marginBottom: '0.5rem' }}>{formatCurrency(stats.summary.totalRevenue)}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>
                <TrendingUp size={14} /> +18.4%
            </div>
        </div>
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-muted)' }}>Total Orders</span>
                <ShoppingBag size={20} color="var(--accent)" />
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: '900', marginBottom: '0.5rem' }}>{stats.summary.totalOrders}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Awaiting fulfillment: 5</p>
        </div>
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-muted)' }}>Catalog Size</span>
                <Package size={20} color="#3b82f6" />
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: '900', marginBottom: '0.5rem' }}>{stats.summary.activeProducts}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Active listings in store</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="mobile-stack">
        {/* Inventory Alerts */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <AlertTriangle size={20} color="#ef4444" /> Inventory Alerts
                </h3>
                <button style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'underline' }}>Restock All</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {stats.inventoryAlerts?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                        <div>
                            <p style={{ fontWeight: '700', fontSize: '0.9rem', margin: 0 }}>{item.name}</p>
                            <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: 0 }}>Only {item.stock} left in stock</p>
                        </div>
                        <button className="btn" style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem', background: '#ef4444', color: 'white' }}>Update</button>
                    </div>
                ))}
            </div>
        </div>

        {/* Promotion Center */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', background: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Tag size={20} color="var(--accent)" /> Campaign Center
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div>
                            <p style={{ fontWeight: '700', fontSize: '0.95rem', margin: 0 }}>Active Coupon: SUMMER20</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>20% OFF on all gift boxes</p>
                        </div>
                        <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: '700', height: 'fit-content' }}>RUNNING</span>
                    </div>
                    <div style={{ height: '4px', width: '100%', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: '65%', height: '100%', background: 'var(--accent)' }}></div>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>65 / 100 uses claimed</p>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Create New Campaign</button>
            </div>
        </div>

        {/* Artisan Submission Review */}
        {submissions.length > 0 && (
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', gridColumn: 'span 2', background: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Sparkles size={20} color="#fbbf24" /> Artisan Submission Review
                    </h3>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#fbbf24', background: 'rgba(251,191,36,0.1)', padding: '0.3rem 0.7rem', borderRadius: '100px' }}>{submissions.length} PENDING</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
                    {submissions.map((sub, idx) => (
                        <div key={idx} style={{ background: '#0a0a0a', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden' }}>
                            <div style={{ aspectRatio: '1', background: '#000', position: 'relative' }}>
                                <img src={sub.canvasState.previewUrl} alt="Masterpiece" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: '#fbbf24', color: 'black', fontSize: '0.6rem', fontWeight: '900', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>AI ENHANCED</div>
                            </div>
                            <div style={{ padding: '1.2rem' }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: '800', margin: '0 0 0.4rem 0' }}>{sub.buyer?.displayName || 'Anonymous Artisan'}'s Choice</p>
                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>Submitted: {new Date(sub.updatedAt).toLocaleDateString()}</p>
                                <button className="btn btn-primary" style={{ width: '100%', background: '#fbbf24', color: 'black', fontWeight: '900' }} onClick={() => handleApprove(sub._id)}>
                                    <Zap size={14} /> APPROVE & GO LIVE
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Logistics Summary */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Truck size={20} color="#3b82f6" /> Logistics Status
                </h3>
                <Link to="/seller-dashboard/orders" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>View Tracking <ChevronRight size={14} /></Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {[
                    { label: 'To Process', count: 5, color: '#f59e0b' },
                    { label: 'In Transit', count: 12, color: '#3b82f6' },
                    { label: 'Out for Delivery', count: 3, color: 'var(--accent)' },
                    { label: 'Delivered (Today)', count: 8, color: '#10b981' }
                ].map((item, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <h4 style={{ fontSize: '1.8rem', fontWeight: '900', color: item.color, margin: '0 0 0.5rem 0' }}>{item.count}</h4>
                        <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-muted)', margin: 0 }}>{item.label}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardHome;
