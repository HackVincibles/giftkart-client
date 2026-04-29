import React, { useEffect, useState } from 'react';
import { ShoppingBag, Search, ExternalLink, Filter, Clock, CheckCircle, Truck, Package, MoreVertical, AlertCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';

const CreatorOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const { success, error } = useToast();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/creator-dashboard/orders');
            if (res.data.success) {
                setOrders(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching creator orders:', err);
            error('Failed to load order queue.');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            const res = await axios.put(`/creator-dashboard/orders/${orderId}`, { status: newStatus });
            if (res.data.success) {
                setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
                success(`Order status updated to ${newStatus}`);
            }
        } catch (err) {
            error('Failed to update status.');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'new': return <Clock size={16} color="var(--warning)" />;
            case 'in-progress': return <Package size={16} color="var(--accent-primary)" />;
            case 'completed': return <CheckCircle size={16} color="var(--success)" />;
            case 'cancelled': return <XCircle size={16} color="var(--danger)" />;
            default: return <AlertCircle size={16} color="var(--text-muted)" />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return '#ef4444';
            case 'high': return '#f59e0b';
            case 'normal': return '#3b82f6';
            case 'low': return '#10b981';
            default: return 'var(--text-muted)';
        }
    };

    const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Order Queue</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage and fulfill your incoming gift requests.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="glass-panel" style={{ padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Filter size={18} color="var(--text-muted)" />
                        <select 
                            value={filter} 
                            onChange={(e) => setFilter(e.target.value)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
                        >
                            <option value="all">All Orders</option>
                            <option value="new">New</option>
                            <option value="in-progress">In Progress</option>
                            <option value="awaiting-approval">Awaiting Approval</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>
                    <div className="animate-spin" style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(139, 92, 246, 0.1)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%' }}></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading orders...</p>
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                    {filteredOrders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '5rem' }}>
                            <ShoppingBag size={48} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '1.5rem' }} />
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No orders found</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Orders for your products will appear here once customers checkout.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-light)' }}>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Order Details</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Priority</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Deadline</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map(item => (
                                        <tr key={item._id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }} className="hover:bg-white/[0.02]">
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>#{item.order?._id?.slice(-6).toUpperCase() || 'NEW'}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                            {item.order?.products?.map(p => p.name).join(', ') || 'Custom Gift'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{item.order?.buyer?.displayName || 'Guest'}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.order?.shippingAddress?.city || 'No Address'}</div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: getPriorityColor(item.priority), fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
                                                    <AlertCircle size={14} />
                                                    {item.priority}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '700', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>
                                                    {getStatusIcon(item.status)}
                                                    <span style={{ textTransform: 'capitalize' }}>{item.status.replace('-', ' ')}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ fontSize: '0.85rem', color: item.deadline && new Date(item.deadline) < new Date() ? 'var(--danger)' : 'var(--text-secondary)' }}>
                                                    {item.deadline ? new Date(item.deadline).toLocaleDateString() : 'No deadline'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                    <select 
                                                        onChange={(e) => updateStatus(order._id, e.target.value)}
                                                        value={order.status}
                                                        style={{ padding: '0.4rem 0.6rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', fontSize: '0.8rem', cursor: 'pointer' }}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="processing">Processing</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                    </select>
                                                    <button className="btn btn-secondary" style={{ padding: '0.4rem' }}>
                                                        <ExternalLink size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CreatorOrders;
