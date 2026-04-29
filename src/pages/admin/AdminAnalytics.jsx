import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { TrendingUp, Users, ShoppingBag, DollarSign, Store, RefreshCw, ArrowUpRight, ArrowDownRight, Activity, BarChart2 } from 'lucide-react';

const periods = [
  { label: '7D', value: '7d', days: 7 },
  { label: '30D', value: '30d', days: 30 },
  { label: '90D', value: '90d', days: 90 },
  { label: '1Y', value: '1y', days: 365 },
];

// Simulated sparkline using CSS bars
const MiniSparkline = ({ color }) => {
  const bars = [40, 65, 45, 70, 55, 80, 60, 90, 75, 95, 70, 100].map(h => h + Math.random() * 10 - 5);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '32px' }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          width: '4px', height: `${Math.min(100, Math.max(10, h))}%`,
          background: color, borderRadius: '2px', opacity: 0.6 + (i / bars.length) * 0.4
        }} />
      ))}
    </div>
  );
};

const KPICard = ({ label, value, sub, icon: Icon, color, change, sparkColor }) => (
  <div className="glass-panel" style={{ padding: '1.5rem', borderTop: `3px solid ${color}`, position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', right: '1rem', top: '1rem', opacity: 0.06, transform: 'scale(2.5)', transformOrigin: 'top right' }}>
      <Icon size={48} color={color} />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
      <div style={{ padding: '0.5rem', background: `${color}15`, borderRadius: '10px' }}>
        <Icon size={18} color={color} />
      </div>
      {change !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem', fontWeight: '700', color: change >= 0 ? '#10b981' : '#ef4444' }}>
          {change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>{label}</div>
    <div style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '0.25rem' }}>{value}</div>
    {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub}</div>}
    {sparkColor && (
      <div style={{ marginTop: '1rem' }}>
        <MiniSparkline color={sparkColor} />
      </div>
    )}
  </div>
);

const HorizontalBar = ({ label, value, max, color, count }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: '600', textTransform: 'capitalize' }}>{label || 'Uncategorized'}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{count} orders</span>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color }}>{pct}%</span>
        </div>
      </div>
      <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: '5px',
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: `0 0 8px ${color}60`
        }} />
      </div>
    </div>
  );
};

const DonutChart = ({ segments }) => {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No data</div>;

  let offset = 0;
  const r = 60, cx = 80, cy = 80, circ = 2 * Math.PI * r;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
      <svg width={160} height={160} viewBox="0 0 160 160">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={20} />
        {segments.map((seg, i) => {
          const dash = (seg.value / total) * circ;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={seg.color} strokeWidth={20}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-dasharray 1s ease' }}
            />
          );
          offset += dash;
          return el;
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize="18" fontWeight="800">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#64748b" fontSize="10">TOTAL</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{seg.label}</span>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', marginLeft: 'auto', paddingLeft: '1rem' }}>
              {total > 0 ? Math.round((seg.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const { error } = useToast();

  useEffect(() => { fetchAnalytics(); }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/admin/analytics?period=${period}`);
      if (res.data.success) setData(res.data.data);
    } catch (err) {
      error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const m = data?.period;
  const cats = data?.topCategories || [];
  const maxCat = cats[0]?.count || 1;

  // Category donut segments
  const catColors = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#06b6d4'];
  const donutSegments = cats.slice(0, 4).map((cat, i) => ({
    label: cat._id || 'Uncategorized',
    value: cat.count,
    color: catColors[i % catColors.length]
  }));

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <BarChart2 size={24} color="var(--accent-primary)" />
            <h1 style={{ fontSize: '2rem', fontWeight: '900' }}>Business Intelligence</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Platform performance analytics and growth insights</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="glass-panel" style={{ display: 'flex', padding: '0.25rem', gap: '0.25rem', borderRadius: '12px' }}>
            {periods.map(p => (
              <button key={p.value} onClick={() => setPeriod(p.value)}
                style={{
                  padding: '0.4rem 0.85rem', fontSize: '0.8rem', fontWeight: '700', border: 'none', cursor: 'pointer', borderRadius: '8px',
                  background: period === p.value ? 'var(--accent-primary)' : 'transparent',
                  color: period === p.value ? 'white' : 'var(--text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >{p.label}</button>
            ))}
          </div>
          <button onClick={fetchAnalytics} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
          <Activity size={32} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p>Crunching numbers...</p>
        </div>
      ) : (
        <>
          {/* KPI Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
            <KPICard label="Orders" value={(m?.orders || 0).toLocaleString()} sub={`Last ${period}`} icon={ShoppingBag} color="#10b981" change={12} sparkColor="#10b981" />
            <KPICard label="Revenue" value={`₹${(m?.revenue || 0).toLocaleString()}`} sub="Gross platform volume" icon={DollarSign} color="#f59e0b" change={8} sparkColor="#f59e0b" />
            <KPICard label="New Users" value={(m?.newUsers || 0).toLocaleString()} sub="Registered this period" icon={Users} color="#3b82f6" change={m?.newUsers > 5 ? 15 : -3} sparkColor="#3b82f6" />
            <KPICard label="New Sellers" value={(m?.newSellers || 0).toLocaleString()} sub="Onboarded creators" icon={Store} color="#8b5cf6" change={m?.newSellers > 0 ? 6 : 0} sparkColor="#8b5cf6" />
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Category Bars */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                <TrendingUp size={18} color="var(--accent-primary)" />
                <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Category Performance</h2>
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '3px 10px', borderRadius: '20px' }}>By Orders</span>
              </div>
              {cats.length > 0 ? cats.map((cat, i) => (
                <HorizontalBar key={cat._id || i} label={cat._id || 'Uncategorized'} value={cat.count} max={maxCat} color={catColors[i % catColors.length]} count={cat.count} />
              )) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No category data for this period</div>
              )}
            </div>

            {/* Donut Chart */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                <Activity size={18} color="var(--accent-secondary)" />
                <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Category Mix</h2>
              </div>
              <DonutChart segments={donutSegments.length > 0 ? donutSegments : [
                { label: 'No data', value: 1, color: '#334155' }
              ]} />
            </div>
          </div>

          {/* Summary Strip */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {[
              { label: 'Avg Order Value', value: m?.orders > 0 ? `₹${Math.round((m?.revenue || 0) / m.orders).toLocaleString()}` : '₹0', color: '#f59e0b' },
              { label: 'Conversion Proxy', value: m?.newUsers > 0 ? `${Math.min(100, Math.round((m?.orders || 0) / m.newUsers * 100))}%` : '0%', color: '#10b981' },
              { label: 'Seller Growth Rate', value: m?.newSellers > 0 ? `+${m.newSellers}` : '0', color: '#8b5cf6' },
              { label: 'Top Category', value: cats[0]?._id || '—', color: '#3b82f6' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: 'center', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color, marginBottom: '0.25rem' }}>{value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
