import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart3, 
  PieChart, 
  Download, 
  Filter,
  Calendar,
  Layers
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const CreatorRevenue = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    avgOrderValue: 0,
    conversionRate: 0,
    revenueGrowth: 0,
    salesGrowth: 0
  });
  const [recentSales, setRecentSales] = useState([]);
  const [timeRange, setTimeRange] = useState('7d');
  const { error } = useToast();

  useEffect(() => {
    fetchRevenueData();
  }, [timeRange]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/seller-analytics?period=${timeRange}`);
      if (res.data.success) {
        const { summary, salesOverTime, topProducts } = res.data.data;
        
        setStats({
          totalRevenue: summary.totalRevenue || 0,
          totalSales: summary.totalOrders || 0,
          avgOrderValue: summary.totalOrders > 0 ? (summary.totalRevenue / summary.totalOrders) : 0,
          conversionRate: 0, // No real data for this yet
          revenueGrowth: 0,  // No real data for this yet
          salesGrowth: 0    // No real data for this yet
        });

        setSalesData(salesOverTime || []);

        // Use top products for the sales table - these are real DB products
        setRecentSales(topProducts.map(p => ({
          id: p._id,
          product: p.name,
          date: 'Delivered',
          amount: p.revenue,
          units: p.totalSold
        })));
      }
    } catch (err) {
      console.error("Failed to fetch revenue data", err);
      error("Could not load sales data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontFamily: 'Outfit' }}>Revenue & Sales</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Detailed analysis of your studio's financial performance</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} /> Export Data
          </button>
          <div className="glass-panel" style={{ padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="var(--text-muted)" />
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', outline: 'none' }}
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
              <DollarSign size={20} color="var(--accent-primary)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--success)', fontSize: '0.8rem', fontWeight: '700' }}>
              <ArrowUpRight size={14} /> {stats.revenueGrowth}%
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Revenue</p>
          <h2 style={{ fontSize: '1.75rem', margin: '0.2rem 0' }}>₹{stats.totalRevenue.toLocaleString()}</h2>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
              <ShoppingBag size={20} color="var(--success)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--success)', fontSize: '0.8rem', fontWeight: '700' }}>
              <ArrowUpRight size={14} /> {stats.salesGrowth}%
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Orders Sold</p>
          <h2 style={{ fontSize: '1.75rem', margin: '0.2rem 0' }}>{stats.totalSales}</h2>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(192, 132, 252, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
              <Layers size={20} color="var(--accent-secondary)" />
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Avg Order Value</p>
          <h2 style={{ fontSize: '1.75rem', margin: '0.2rem 0' }}>₹{Math.round(stats.avgOrderValue).toLocaleString()}</h2>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
              <TrendingUp size={20} color="#3b82f6" />
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Conversion Rate</p>
          <h2 style={{ fontSize: '1.75rem', margin: '0.2rem 0' }}>{stats.conversionRate}%</h2>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Revenue Chart Placeholder */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Revenue Growth Trend</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }}></div> Last Period
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-secondary)' }}></div> This Period
              </span>
            </div>
          </div>
          
          {/* Dynamic Chart using SVG - now with real data */}
          <div style={{ height: '300px', width: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '20px' }}>
            {salesData.length > 0 ? salesData.map((day, i) => {
              const maxVal = Math.max(...salesData.map(d => d.dailyRevenue), 1);
              const heightPercent = (day.dailyRevenue / maxVal) * 100;
              return (
                <div key={i} style={{ flex: 1, maxWidth: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', margin: '0 auto' }}>
                  <div 
                    style={{ 
                      height: `${Math.max(heightPercent, 5)}%`, 
                      width: '100%', 
                      background: 'linear-gradient(to top, var(--accent-primary), var(--accent-secondary))', 
                      borderRadius: '6px 6px 0 0',
                      opacity: 0.9,
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      boxShadow: '0 -4px 15px rgba(139, 92, 246, 0.2)'
                    }}
                    className="hover-scale"
                  >
                    <div className="chart-tooltip" style={{ 
                      position: 'absolute', top: '-35px', left: '50%', transform: 'translateX(-50%)',
                      background: 'var(--bg-secondary)', color: 'white', padding: '4px 8px', borderRadius: '4px',
                      fontSize: '11px', fontWeight: '700', opacity: 0, pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 10,
                      border: '1px solid var(--border-light)', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                    }}>₹{day.dailyRevenue.toLocaleString()}</div>
                  </div>
                  <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', transform: 'rotate(-45deg)', transformOrigin: 'top center' }}>
                    {day._id.split('-').slice(1).join('/')}
                  </div>
                </div>
              );
            }) : (
              <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-muted)', paddingBottom: '2rem' }}>
                No trend data for this period
              </div>
            )}
          </div>
        </div>

        {/* Sales by Category Placeholder */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Sales by Category</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[
              { label: 'Personalized Art', value: 45, color: 'var(--accent-primary)' },
              { label: 'Handmade Jewelry', value: 30, color: 'var(--accent-secondary)' },
              { label: 'Custom Stationery', value: 15, color: '#3b82f6' },
              { label: 'Other', value: 10, color: 'var(--text-muted)' }
            ].map((cat, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <span>{cat.label}</span>
                  <span style={{ fontWeight: '700' }}>{cat.value}%</span>
                </div>
                <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${cat.value}%`, background: cat.color, borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '2.5rem', background: 'rgba(139, 92, 246, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px dashed var(--accent-primary)' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, display: 'flex', gap: '0.5rem' }}>
              <TrendingUp size={16} color="var(--accent-primary)" />
              <strong>AI Tip:</strong> "Personalized Art" is currently your highest grossing category. Consider launching 2 new designs in this niche to maximize current trends.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Sales Table */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>All Sold Items</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ position: 'relative' }}>
              <Filter size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search orders..." 
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0.4rem 0.75rem 0.4rem 2.2rem', color: 'white', fontSize: '0.85rem' }} 
              />
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem', borderBottom: '1px solid var(--border-light)' }}>
                <th style={{ padding: '1rem' }}>ORDER ID</th>
                <th style={{ padding: '1rem' }}>PRODUCT</th>
                <th style={{ padding: '1rem' }}>UNITS SOLD</th>
                <th style={{ padding: '1rem' }}>STATUS</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>REVENUE</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.length > 0 ? recentSales.map((sale, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }} className="hover:bg-white/[0.02]">
                  <td style={{ padding: '1.25rem 1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    #{sale.id || sale._id?.slice(-6).toUpperCase()}
                  </td>
                  <td style={{ padding: '1.25rem 1rem' }}>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{sale.product}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gift Item</div>
                  </td>
                  <td style={{ padding: '1.25rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {sale.units} units
                  </td>
                  <td style={{ padding: '1.25rem 1rem' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      background: 'rgba(16, 185, 129, 0.1)', 
                      color: 'var(--success)',
                      fontWeight: '600'
                    }}>
                      DELIVERED
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1rem', textAlign: 'right', fontWeight: '700', fontSize: '1rem', color: 'var(--success)' }}>
                    +₹{sale.amount.toLocaleString()}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No sales data available for the selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <style>{`
        .chart-tooltip { transition: opacity 0.2s ease; }
        .hover-scale:hover .chart-tooltip { opacity: 1 !important; }
      `}</style>
    </div>
  );
};

export default CreatorRevenue;
