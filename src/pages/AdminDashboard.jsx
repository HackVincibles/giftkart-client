import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import AdminSidebar from '../components/AdminSidebar';
import { Users, Store, ShoppingCart, DollarSign, Activity, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/admin/dashboard/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error('Error fetching admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div className="dashboard-layout animate-fade-in">
        <AdminSidebar />
        
        <div className="main-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Admin Overview</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user?.displayName}. Here's what's happening on GiftKart today.</p>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>Loading statistics...</div>
          ) : (
            <div className="grid">
              <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 className="stat-label">Total Users</h3>
                    <p className="stat-value">{stats?.totalUsers || '2,405'}</p>
                  </div>
                  <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px' }}>
                    <Users color="#3b82f6" />
                  </div>
                </div>
                <div style={{ marginTop: '1rem', color: 'var(--success)', fontSize: '0.85rem', fontWeight: '500' }}>
                  +12% from last month
                </div>
              </div>

              <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 className="stat-label">Active Sellers</h3>
                    <p className="stat-value">{stats?.totalSellers || '142'}</p>
                  </div>
                  <div style={{ padding: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px' }}>
                    <Store color="var(--accent-primary)" />
                  </div>
                </div>
                <div style={{ marginTop: '1rem', color: 'var(--success)', fontSize: '0.85rem', fontWeight: '500' }}>
                  +5 new approvals pending
                </div>
              </div>

              <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 className="stat-label">Total Orders</h3>
                    <p className="stat-value">{stats?.totalOrders || '8,294'}</p>
                  </div>
                  <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
                    <ShoppingCart color="var(--success)" />
                  </div>
                </div>
                <div style={{ marginTop: '1rem', color: 'var(--success)', fontSize: '0.85rem', fontWeight: '500' }}>
                  +18% from last month
                </div>
              </div>

              <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 className="stat-label">Revenue Overview</h3>
                    <p className="stat-value">₹{stats?.totalRevenue || '4,52,000'}</p>
                  </div>
                  <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px' }}>
                    <DollarSign color="var(--warning)" />
                  </div>
                </div>
                <div style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>
                  Platform commission total
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Activity size={20} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.25rem' }}>Recent Activity</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', borderLeft: '3px solid var(--accent-primary)' }}>
                  <p style={{ fontWeight: '500' }}>New Seller Registration: "Artisan Crafts Co."</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>2 minutes ago • Pending Approval</p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', borderLeft: '3px solid var(--success)' }}>
                  <p style={{ fontWeight: '500' }}>Order #GK-8924 Completed</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>15 minutes ago</p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', borderLeft: '3px solid var(--danger)' }}>
                  <p style={{ fontWeight: '500' }}>New Grievance Ticket #TR-204</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>1 hour ago • Requires Action</p>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <AlertTriangle size={20} color="var(--warning)" />
                <h3 style={{ fontSize: '1.25rem' }}>Action Required</h3>
              </div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '1rem 0', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Seller KYC Verifications</span>
                  <span style={{ background: 'var(--danger)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>5</span>
                </li>
                <li style={{ padding: '1rem 0', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Open Grievances</span>
                  <span style={{ background: 'var(--warning)', color: 'black', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>2</span>
                </li>
                <li style={{ padding: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Withdrawal Requests</span>
                  <span style={{ background: 'var(--accent-primary)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>12</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
