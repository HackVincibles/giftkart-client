import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { Search, CheckCircle, XCircle, Clock, Banknote, Filter, RefreshCw, User, Store } from 'lucide-react';

const AdminWithdrawals = () => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [actionLoading, setActionLoading] = useState(null);
    const { addToast } = useToast();

    useEffect(() => {
        fetchWithdrawals();
    }, [statusFilter]);

    const fetchWithdrawals = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/admin/withdrawals?status=${statusFilter}`);
            if (res.data.success) {
                setWithdrawals(res.data.data.withdrawals);
            }
        } catch (err) {
            addToast({ type: 'error', message: 'Failed to load withdrawals' });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        const adminNote = prompt(`Add a note for this ${status} status (optional):`) || '';
        try {
            setActionLoading(id);
            const res = await axios.put(`/admin/withdrawals/${id}/status`, { status, adminNote });
            if (res.data.success) {
                addToast({ type: 'success', message: `Withdrawal marked as ${status}` });
                fetchWithdrawals();
            }
        } catch (err) {
            addToast({ type: 'error', message: 'Failed to update status' });
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return '#10b981';
            case 'pending': return '#f59e0b';
            case 'rejected': return '#ef4444';
            case 'processing': return '#3b82f6';
            default: return 'var(--text-muted)';
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '0.5rem' }}>Withdrawal Requests</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Review and process payout requests from sellers and creators.</p>
                </div>
                <button onClick={fetchWithdrawals} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                {['pending', 'processing', 'completed', 'rejected'].map(status => (
                    <button 
                        key={status} 
                        onClick={() => setStatusFilter(status)}
                        className={statusFilter === status ? 'btn btn-primary' : 'btn btn-secondary'}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', textTransform: 'capitalize' }}
                    >
                        {status}
                    </button>
                ))}
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-light)' }}>
                            <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recipient</th>
                            <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount</th>
                            <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bank Details</th>
                            <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</th>
                            <th style={{ padding: '1.25rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>Loading requests...</td></tr>
                        ) : withdrawals.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                                    <Banknote size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                                    <p>No withdrawal requests found for this status.</p>
                                </td>
                            </tr>
                        ) : withdrawals.map(w => (
                            <tr key={w._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <td style={{ padding: '1.25rem' }}>
                                    {w.seller ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                                                <Store size={18} color="var(--accent-primary)" />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{w.seller.businessName}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Seller: {w.seller.ownerName}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                                                <User size={18} color="#10b981" />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{w.user?.displayName}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Creator Account</div>
                                            </div>
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '1.25rem' }}>
                                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-primary)' }}>₹{w.amount.toLocaleString()}</div>
                                </td>
                                <td style={{ padding: '1.25rem' }}>
                                    <div style={{ fontSize: '0.85rem' }}>
                                        {w.bankDetails?.accountNumber ? (
                                            <>
                                                <div style={{ fontWeight: '600' }}>{w.bankDetails.bankName}</div>
                                                <div style={{ color: 'var(--text-secondary)' }}>A/C: {w.bankDetails.accountNumber}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>IFSC: {w.bankDetails.ifscCode || w.bankDetails.ifsc}</div>
                                            </>
                                        ) : (
                                            <div style={{ color: 'var(--text-secondary)' }}>UPI: {w.bankDetails?.upiId}</div>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {new Date(w.createdAt).toLocaleDateString()}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                        {new Date(w.createdAt).toLocaleTimeString()}
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                                    {w.status === 'pending' || w.status === 'processing' ? (
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            {w.status === 'pending' && (
                                                <button 
                                                    onClick={() => handleStatusUpdate(w._id, 'processing')}
                                                    disabled={actionLoading === w._id}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#3b82f6' }}
                                                >
                                                    Process
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleStatusUpdate(w._id, 'completed')}
                                                disabled={actionLoading === w._id}
                                                className="btn btn-secondary"
                                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#10b981' }}
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleStatusUpdate(w._id, 'rejected')}
                                                disabled={actionLoading === w._id}
                                                className="btn btn-secondary"
                                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#ef4444' }}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <span style={{ 
                                            fontSize: '0.75rem', 
                                            fontWeight: '700', 
                                            textTransform: 'uppercase', 
                                            color: getStatusColor(w.status),
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            background: `${getStatusColor(w.status)}15`
                                        }}>
                                            {w.status}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminWithdrawals;
