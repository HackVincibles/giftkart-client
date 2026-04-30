import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  History, 
  DollarSign,
  ArrowRight
} from 'lucide-react';

const SellerWallet = () => {
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWallet = async () => {
    try {
      const res = await axios.get('/seller-analytics/wallet');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to load wallet data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleWithdraw = async () => {
    const amount = prompt("Enter amount to withdraw (₹):", data?.balance);
    if (!amount || isNaN(amount) || amount <= 0) return;
    
    if (amount > data.balance) {
      addToast({ type: 'error', message: 'Insufficient balance' });
      return;
    }

    try {
      const res = await axios.post('/wallet/request-withdrawal', { amount: Number(amount) });
      if (res.data.success) {
        addToast({ type: 'success', message: 'Withdrawal request submitted!' });
        fetchWallet();
      }
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Withdrawal failed' });
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading your wallet...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>My Wallet</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track your earnings, manage withdrawals, and view transaction history.</p>
      </div>

      {/* Wallet Balance Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', background: 'linear-gradient(135deg, var(--bg-secondary), rgba(99, 102, 241, 0.05))', borderLeft: '4px solid var(--accent-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
              <Wallet color="var(--accent-primary)" size={24} />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>AVAILABLE BALANCE</span>
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>
            {data ? formatCurrency(data.balance) : '₹0'}
          </h2>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            disabled={!data || data.balance <= 0}
            onClick={handleWithdraw}
          >
            Withdraw Funds <ArrowRight size={18} />
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
              <DollarSign color="#10b981" size={24} />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>TOTAL EARNED</span>
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            {data ? formatCurrency(data.totalEarned) : '₹0'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Lifetime revenue from your studio</p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
              <Clock color="#f59e0b" size={24} />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>PENDING SETTLEMENT</span>
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            {data ? formatCurrency(data.pendingWithdrawals) : '₹0'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Currently processing withdrawals</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <History size={22} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Recent Transactions</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {data && data.transactions && data.transactions.length > 0 ? data.transactions.map((tx) => (
            <div key={tx._id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '1.25rem', 
              background: 'rgba(255,255,255,0.02)', 
              borderRadius: '16px', 
              border: '1px solid var(--border-light)',
              transition: 'transform 0.2s ease',
              cursor: 'default'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ 
                  background: tx.type === 'deposit' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                  padding: '0.75rem', 
                  borderRadius: '12px' 
                }}>
                  {tx.type === 'deposit' ? <ArrowDownLeft size={20} color="#10b981" /> : <ArrowUpRight size={20} color="#ef4444" />}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.25rem' }}>{tx.description}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontWeight: '800', 
                  fontSize: '1.15rem', 
                  color: tx.type === 'deposit' ? '#10b981' : '#ef4444',
                  marginBottom: '0.25rem'
                }}>
                  {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'flex-end', 
                  gap: '0.4rem', 
                  fontSize: '0.75rem', 
                  fontWeight: '700', 
                  color: tx.status === 'completed' ? '#10b981' : '#f59e0b',
                  textTransform: 'uppercase'
                }}>
                  {tx.status === 'completed' ? <CheckCircle size={14} /> : tx.status === 'failed' ? <XCircle size={14} /> : <Clock size={14} />}
                  {tx.status}
                </div>
              </div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              No transactions found yet. Your sales will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerWallet;
