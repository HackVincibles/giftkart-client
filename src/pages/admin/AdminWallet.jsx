import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { Wallet, TrendingUp, DollarSign, RefreshCw, ArrowDownRight, Percent } from 'lucide-react';

const AdminWalletPage = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => { fetchWallet(); }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/admin/wallet');
      if (res.data.success) setWallet(res.data.data);
    } catch (err) {
      error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const transactions = wallet?.transactions?.slice().reverse() || [];

  const typeColor = { commission: '#10b981', withdrawal: '#f59e0b', refund: '#ef4444' };
  const typeLabel = { commission: 'Commission', withdrawal: 'Withdrawal', refund: 'Refund' };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <Wallet size={22} color="var(--accent-primary)" />
            <h1 style={{ fontSize: '2rem', fontWeight: '900' }}>Admin Wallet</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>4% platform commission from every order — tracked here</p>
        </div>
        <button onClick={fetchWallet} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>Loading wallet...</div>
      ) : (
        <>
          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2rem', borderTop: '3px solid #10b981', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', opacity: 0.06 }}>
                <Wallet size={64} color="#10b981" />
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem', fontWeight: '700' }}>Available Balance</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#10b981' }}>
                ₹{(wallet?.availableBalance || 0).toLocaleString()}
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ready for withdrawal</div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', borderTop: '3px solid #8b5cf6' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem', fontWeight: '700' }}>Total Commission Earned</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#8b5cf6' }}>
                ₹{(wallet?.totalCommissionEarned || 0).toLocaleString()}
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lifetime platform revenue</div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', borderTop: '3px solid #f59e0b' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem', fontWeight: '700' }}>Commission Rate</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                4 <Percent size={24} color="#f59e0b" />
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Applied on every order</div>
            </div>
          </div>

          {/* Transaction Ledger */}
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Transaction Ledger</h2>
              <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.82rem' }}>{transactions.length} transactions</span>
            </div>
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  <DollarSign size={48} style={{ opacity: 0.15, display: 'block', margin: '0 auto 1rem' }} />
                  <p>No transactions yet. Commission is recorded when orders are confirmed.</p>
                </div>
              ) : transactions.map((tx, i) => {
                const color = typeColor[tx.type] || '#94a3b8';
                const label = typeLabel[tx.type] || tx.type;
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)',
                    transition: 'background 0.2s'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {tx.type === 'withdrawal' ? <ArrowDownRight size={16} color={color} /> : <TrendingUp size={16} color={color} />}
                      </div>
                      <div>
                        <p style={{ fontWeight: '600', fontSize: '0.88rem' }}>{tx.description || label}</p>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.2rem' }}>
                          <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', background: `${color}15`, color, fontWeight: '700' }}>{label}</span>
                          {tx.orderId && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>Order #{tx.orderId.toString().slice(-6).toUpperCase()}</span>}
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(tx.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: '800', fontSize: '1.1rem', color }}>
                        {tx.type === 'commission' ? '+' : '-'}₹{(tx.commissionAmount || 0).toLocaleString()}
                      </p>
                      {tx.orderAmount && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>on ₹{tx.orderAmount.toLocaleString()} order · {tx.commissionRate || 4}%</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminWalletPage;
