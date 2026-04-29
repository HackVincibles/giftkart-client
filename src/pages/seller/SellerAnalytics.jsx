import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, AreaChart, Area
} from 'recharts';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Package, 
  ArrowUpRight, 
  Download,
  Calendar,
  Filter
} from 'lucide-react';

const SellerAnalytics = () => {
  const { error } = useToast();
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
      error(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

  if (loading && !data) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>
      <div className="animate-spin" style={{ width: '30px', height: '30px', border: '3px solid rgba(139, 92, 246, 0.1)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%' }}></div>
      <span style={{ marginLeft: '1rem' }}>Analyzing studio data...</span>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ padding: '1rem 0 2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontFamily: 'Outfit' }}>Revenue & Sales</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Performance metrics and sales analysis for your store.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} /> Export
          </button>
          <div className="glass-panel" style={{ padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="var(--text-muted)" />
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', outline: 'none' }}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last 1 Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
              <DollarSign size={20} color="var(--accent-primary)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--success)', fontSize: '0.8rem', fontWeight: '700' }}>
              <ArrowUpRight size={14} /> +12.5%
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Revenue</p>
          <h2 style={{ fontSize: '1.75rem', margin: '0.2rem 0' }}>{data ? formatCurrency(data.summary.totalRevenue) : '₹0'}</h2>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
              <ShoppingBag size={20} color="var(--success)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--success)', fontSize: '0.8rem', fontWeight: '700' }}>
              <ArrowUpRight size={14} /> +8.4%
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Orders</p>
          <h2 style={{ fontSize: '1.75rem', margin: '0.2rem 0' }}>{data ? data.summary.totalOrders : '0'}</h2>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(192, 132, 252, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
              <Package size={20} color="var(--accent-secondary)" />
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Products</p>
          <h2 style={{ fontSize: '1.75rem', margin: '0.2rem 0' }}>{data ? data.summary.activeProducts : '0'}</h2>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '2rem', fontWeight: '600' }}>Revenue Trend</h3>
        <div style={{ width: '100%', height: 350 }}>
          {data && data.salesOverTime && data.salesOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.salesOverTime}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="_id" 
                  stroke="var(--text-muted)" 
                  tick={{fontSize: 11}} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="var(--text-muted)" 
                  tick={{fontSize: 11}} 
                  tickFormatter={(val) => `₹${val}`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="dailyRevenue" 
                  stroke="var(--accent-primary)" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
             <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                 No sales data for this period
             </div>
          )}
        </div>
      </div>

      {/* Top Products Table */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: '600' }}>Top Performing Products</h3>
        {data && data.topProducts && data.topProducts.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', textTransform: 'uppercase' }}>Product</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', textTransform: 'uppercase' }}>Units Sold</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', textTransform: 'uppercase' }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.map((product) => (
                  <tr key={product._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }} className="hover:bg-white/[0.02]">
                    <td style={{ padding: '1.25rem 1rem', fontWeight: '600' }}>{product.name}</td>
                    <td style={{ padding: '1.25rem 1rem', textAlign: 'right', color: 'var(--text-secondary)' }}>{product.totalSold}</td>
                    <td style={{ padding: '1.25rem 1rem', textAlign: 'right', fontWeight: '700', color: 'var(--success)' }}>
                      {formatCurrency(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
             No product sales data available for this period.
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerAnalytics;

