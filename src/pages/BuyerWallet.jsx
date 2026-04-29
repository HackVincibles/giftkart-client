import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { ShoppingBag, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, Plus, Wallet, ShieldCheck, Loader } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const BuyerWallet = () => {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addAmount, setAddAmount] = useState('');
    const [processing, setProcessing] = useState(false);
    const { success, error } = useToast();

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/wallet/summary');
            if (res.data.success) {
                setBalance(res.data.balance || 0);
                setTransactions(res.data.transactions || []);
            }
        } catch (err) {
            console.error('Error fetching wallet data:', err);
            error('Failed to load wallet data.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddFunds = async (e) => {
        e.preventDefault();
        const amount = Number(addAmount);
        if (!amount || amount < 100) {
            return error("Minimum amount to add is ₹100");
        }

        try {
            setProcessing(true);
            
            // 1. Create Order
            const orderRes = await axios.post('/wallet/create-order', { amount });
            
            if (!orderRes.data.success) {
                throw new Error("Failed to create order");
            }

            const { order } = orderRes.data;

            // 2. Initialize Razorpay
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy',
                amount: order.amount,
                currency: order.currency,
                name: "Giftkart Wallet",
                description: "Wallet Top-up",
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await axios.post('/wallet/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (verifyRes.data.success) {
                            success("Funds added successfully!");
                            setAddAmount('');
                            fetchWalletData();
                        }
                    } catch (err) {
                        error("Payment verification failed.");
                    }
                },
                prefill: {
                    name: "Giftkart User",
                    email: "user@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#8b5cf6"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response){
                error("Payment failed or was cancelled.");
            });
            rzp.open();
            
        } catch (err) {
            console.error("Add funds error:", err);
            error(err.response?.data?.message || "Failed to initiate payment");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <Navbar />
            
            <main className="container animate-fade-in" style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto', flex: 1 }}>
                <div style={{ marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Wallet color="var(--accent-primary)" size={36} /> My Wallet
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Manage your funds for seamless gifting and one-click checkouts.</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '5rem' }}>
                        <Loader className="animate-spin" size={40} color="var(--accent-primary)" />
                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading wallet data...</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                        {/* Left Column - Balance & Add Funds */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Balance Card */}
                            <div className="glass-panel hover-scale" style={{ padding: '2.5rem', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(15, 23, 42, 0.4) 100%)', border: '1px solid var(--accent-primary)30', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05 }}>
                                    <ShoppingBag size={200} />
                                </div>
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Current Balance</h3>
                                    <div style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
                                        <span style={{ color: 'var(--accent-primary)' }}>₹</span>{balance.toLocaleString()}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.85rem', fontWeight: '600', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem 1rem', borderRadius: '100px', width: 'fit-content' }}>
                                        <ShieldCheck size={16} /> Secure funds ready for checkout
                                    </div>
                                </div>
                            </div>

                            {/* Add Funds Form */}
                            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Plus color="var(--accent-primary)" size={20} /> Add Funds
                                </h3>
                                <form onSubmit={handleAddFunds}>
                                    <div className="input-group">
                                        <label className="input-label">Amount (₹)</label>
                                        <input 
                                            type="number" 
                                            className="input-field" 
                                            placeholder="Enter amount (Min ₹100)"
                                            value={addAmount}
                                            onChange={(e) => setAddAmount(e.target.value)}
                                            min="100"
                                            required
                                        />
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                        {[500, 1000, 2000, 5000].map(amt => (
                                            <button 
                                                key={amt} 
                                                type="button"
                                                onClick={() => setAddAmount(amt.toString())}
                                                style={{ flex: 1, padding: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', borderRadius: '10px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', transition: 'all 0.2s' }}
                                                onMouseEnter={(e) => e.target.style.background = 'rgba(139, 92, 246, 0.1)'}
                                                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.03)'}
                                            >
                                                +₹{amt}
                                            </button>
                                        ))}
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={processing}
                                        className="btn btn-primary"
                                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontSize: '1rem', fontWeight: '800', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        {processing ? <Loader className="animate-spin" size={20} /> : 'Proceed to Pay'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Right Column - Transactions */}
                        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', height: 'fit-content' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                                <Clock color="var(--accent-secondary)" size={20} /> Recent Transactions
                            </h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {transactions.length > 0 ? transactions.map(tx => (
                                    <div key={tx._id} className="table-row-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ background: (tx.type === 'deposit' || tx.type === 'credit') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                                                {(tx.type === 'deposit' || tx.type === 'credit') ? <ArrowDownLeft size={20} color="var(--success)" /> : <ArrowUpRight size={20} color="var(--danger)" />}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '800', fontSize: '1rem', color: (tx.type === 'deposit' || tx.type === 'credit') ? 'var(--success)' : 'var(--text-primary)' }}>
                                                    {tx.description || (tx.type === 'deposit' ? 'Wallet Top-up' : 'Purchase')}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                                    {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: '900', fontSize: '1.1rem', color: (tx.type === 'deposit' || tx.type === 'credit') ? 'var(--success)' : 'var(--danger)' }}>
                                                {(tx.type === 'deposit' || tx.type === 'credit') ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                            </div>
                                            <div style={{ color: tx.status === 'completed' ? 'var(--success)' : 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', marginTop: '0.2rem' }}>
                                                {tx.status === 'completed' ? <CheckCircle size={12} /> : <Clock size={12} />} {tx.status}
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                                        <Clock size={40} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
                                        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Transactions Yet</h4>
                                        <p style={{ fontSize: '0.9rem' }}>When you add funds or make a purchase, it will appear here.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default BuyerWallet;
