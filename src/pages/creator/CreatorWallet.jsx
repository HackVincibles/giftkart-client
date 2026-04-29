import React, { useEffect, useState } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownLeft, TrendingUp, Download, PieChart, CreditCard, History, Clock, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';

const CreatorWallet = () => {
    const [earnings, setEarnings] = useState({ total: 0, pending: 0, available: 0, withdrawn: 0, monthlyBreakdown: [] });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { success, error } = useToast();

    useEffect(() => {
        fetchEarnings();
    }, []);

    const fetchEarnings = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/creator-dashboard/earnings');
            if (res.data.success) {
                setEarnings(res.data.data);
            }
            const walletRes = await axios.get('/wallet/summary');
            if (walletRes.data.success) {
                setTransactions(walletRes.data.transactions || []);
            }
        } catch (err) {
            console.error('Error fetching earnings:', err);
            error('Failed to load financial data.');
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        if (earnings.available <= 0) return error("No available funds to withdraw.");
        try {
            const res = await axios.post('/creator-dashboard/earnings/withdraw', { amount: earnings.available, method: 'UPI' });
            if (res.data.success) {
                success("Withdrawal request submitted! Processing in 3-5 days.");
                fetchEarnings();
            }
        } catch (err) {
            error("Withdrawal request failed.");
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Earnings & Wallet</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Manage your revenue, withdrawals, and financial growth.</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>Loading financials...</div>
            ) : (
                <>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-primary)' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>TOTAL REVENUE</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '900' }}>₹{earnings.total.toLocaleString()}</div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                <TrendingUp size={14} /> +12% from last month
                            </div>
                        </div>
                        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--warning)' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>PENDING CLEARANCE</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '900' }}>₹{earnings.pending.toLocaleString()}</div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Locked for 7-day safety period</div>
                        </div>
                        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--success)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), transparent)' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>AVAILABLE TO WITHDRAW</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--success)' }}>₹{earnings.available.toLocaleString()}</div>
                            <button onClick={handleWithdraw} className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}>
                                <Download size={16} /> Withdraw Funds
                            </button>
                        </div>
                        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-secondary)' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>ALREADY WITHDRAWN</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '900' }}>₹{earnings.withdrawn.toLocaleString()}</div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sent to registered bank account</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                        <div className="glass-panel" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <PieChart size={20} color="var(--accent-primary)" /> Monthly Performance
                                </h2>
                                <select className="input-field" style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                                    <option>Year 2024</option>
                                    <option>Year 2023</option>
                                </select>
                            </div>
                            
                            <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '1rem', padding: '1rem 0' }}>
                                {earnings.monthlyBreakdown?.length > 0 ? earnings.monthlyBreakdown.map((m, i) => (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ 
                                            width: '100%', 
                                            height: `${earnings.total > 0 ? (m.earnings / earnings.total) * 200 + 10 : 10}px`, 
                                            background: 'linear-gradient(to top, var(--accent-primary), var(--accent-secondary))',
                                            borderRadius: '6px 6px 0 0',
                                            opacity: 0.8,
                                            transition: 'height 0.5s ease-out'
                                        }}></div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{m.month}</div>
                                    </div>
                                )) : (
                                    <div style={{ flex: 1, textAlign: 'center', color: 'var(--text-muted)', paddingBottom: '5rem' }}>Not enough data for chart</div>
                                )}
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <History size={20} color="var(--accent-primary)" /> Recent Transactions
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {transactions.length > 0 ? transactions.slice(0, 5).map(tx => (
                                    <div key={tx._id || tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ background: (tx.type === 'credit' || tx.type === 'deposit') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '0.6rem', borderRadius: '10px' }}>
                                                {(tx.type === 'credit' || tx.type === 'deposit') ? <ArrowDownLeft size={18} color="var(--success)" /> : <ArrowUpRight size={18} color="var(--danger)" />}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: (tx.type === 'credit' || tx.type === 'deposit') ? 'var(--success)' : 'var(--danger)' }}>
                                                    {(tx.type === 'credit' || tx.type === 'deposit') ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.description} • {new Date(tx.createdAt || tx.date).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div style={{ color: tx.status === 'completed' ? 'var(--success)' : 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>
                                            {tx.status === 'completed' ? <CheckCircle size={12} /> : <Clock size={12} />} {tx.status}
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-light)', opacity: 0.7 }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', width: '100%' }}>No recent transactions</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CreatorWallet;
