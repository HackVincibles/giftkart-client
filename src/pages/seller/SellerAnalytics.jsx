import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

const SellerAnalytics = () => {
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('30d');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/seller-analytics?period=${period}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to load analytics' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  if (loading && !data) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading analytics...</div>;

  const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Analytics Dashboard</h2>
        <select 
          value={period} 
          onChange={(e) => setPeriod(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">Last 1 Year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="hover-scale" style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h4 style={{ color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', fontWeight: '500' }}>Total Revenue</h4>
          <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--accent-primary)' }}>
            {data ? formatCurrency(data.summary.totalRevenue) : '₹0'}
          </h2>
        </div>
        
        <div className="hover-scale" style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h4 style={{ color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', fontWeight: '500' }}>Total Orders</h4>
          <h2 style={{ margin: 0, fontSize: '2rem' }}>
            {data ? data.summary.totalOrders : '0'}
          </h2>
        </div>
        
        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h4 style={{ color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', fontWeight: '500' }}>Active Products</h4>
          <h2 style={{ margin: 0, fontSize: '2rem' }}>
            {data ? data.summary.activeProducts : '0'}
          </h2>
        </div>
      </div>

      {/* Charts Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Revenue Over Time Chart */}
        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontWeight: '600' }}>Revenue Over Time</h3>
          <div style={{ width: '100%', height: 350 }}>
            {data && data.salesOverTime && data.salesOverTime.length > 0 ? (
              <ResponsiveContainer>
                <LineChart data={data.salesOverTime} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                  <XAxis dataKey="_id" stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                  <YAxis stroke="var(--text-secondary)" tick={{fontSize: 12}} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: '8px' }}
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                    labelStyle={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}
                  />
                  <Line type="monotone" dataKey="dailyRevenue" stroke="var(--accent-primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-secondary)', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
               <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                   No sales data for this period
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontWeight: '600' }}>Top Performing Products</h3>
        {data && data.topProducts && data.topProducts.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '500' }}>Product Name</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '500' }}>Units Sold</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '500' }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((product) => (
                <tr key={product._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '1rem' }}>{product.name}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>{product.totalSold}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--accent-primary)' }}>
                    {formatCurrency(product.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
             No product sales data available for this period.
          </div>
        )}
      </div>

    </div>
  );
};

export default SellerAnalytics;
