import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Simple modal component (glass‑morphic style)
const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '20px',
        minWidth: '320px', maxWidth: '90%', boxShadow: '0 16px 48px rgba(0,0,0,0.4)'
      }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

const SellerProducts = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = create, otherwise product object
  const [form, setForm] = useState({
    name: '', description: '', category: 'standard', basePrice: '', customizationFee: '', urgentDeliveryFee: '', images: []
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/seller-products');
      if (res.data.success) setProducts(res.data.data.products);
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to load products' });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', category: 'standard', basePrice: '', customizationFee: '', urgentDeliveryFee: '', images: [] });
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      basePrice: product.basePrice,
      customizationFee: product.pricing?.customizationFee || '',
      urgentDeliveryFee: product.pricing?.urgentDeliveryFee || '',
      images: [] // new images to add
    });
    setModalOpen(true);
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setForm(prev => ({ ...prev, images: Array.from(e.target.files) }));
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    try {
      // 1️⃣ Upload images (if any)
      let uploadedUrls = [];
      if (form.images.length > 0) {
        const fd = new FormData();
        form.images.forEach(file => fd.append('images', file));
        const upRes = await axios.post('/api/seller-products/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedUrls = upRes.data.data.urls;
      }

      // 2️⃣ Build payload
      const payload = {
        name: form.name,
        description: form.description,
        category: form.category,
        basePrice: Number(form.basePrice),
        pricing: {
          base: Number(form.basePrice),
          customizationFee: Number(form.customizationFee) || 0,
          urgentDeliveryFee: Number(form.urgentDeliveryFee) || 0
        },
        images: uploadedUrls.map(url => ({ url, alt: form.name }))
      };

      let res;
      if (editing) {
        // Update existing product
        res = await axios.put(`/api/seller-products/${editing._id}`, payload);
      } else {
        // Create new product
        res = await axios.post('/api/seller-products', payload);
      }
      if (res.data.success) {
        addToast({ type: 'success', message: editing ? 'Product updated' : 'Product created' });
        fetchProducts();
        setModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to save product' });
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const res = await axios.delete(`/api/seller-products/${id}`);
      if (res.data.success) {
        addToast({ type: 'success', message: 'Product deleted' });
        fetchProducts();
      }
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Delete failed' });
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>My Products</h2>
      <button onClick={openCreate} style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', marginBottom: '1rem', cursor: 'pointer' }}>Add Product</button>

      {loading ? (<p>Loading...</p>) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)' }}>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Category</th>
              <th style={{ padding: '0.5rem', textAlign: 'right' }}>Price (₹)</th>
              <th style={{ padding: '0.5rem', textAlign: 'center' }}>Stock</th>
              <th style={{ padding: '0.5rem', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '0.5rem' }}>{p.name}</td>
                <td style={{ padding: '0.5rem', textTransform: 'capitalize' }}>{p.category}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>{p.pricing?.final?.toLocaleString() || p.basePrice}</td>
                <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                  {p.inventory?.stockCount ?? '-'}
                  {p.inventory?.stockCount <= 5 && (
                    <span style={{ marginLeft: '0.5rem', background: '#ef4444', color: 'white', borderRadius: '4px', padding: '2px 4px', fontSize: '0.7rem' }}>Low</span>
                  )}
                </td>
                <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                  <button onClick={() => openEdit(p)} style={{ marginRight: '0.5rem', background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => deleteProduct(p._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ---------- Modal ---------- */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h3 style={{ marginTop: 0 }}>{editing ? 'Edit Product' : 'Add New Product'}</h3>
        <form onSubmit={submitProduct} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input name="name" placeholder="Product name" value={form.name} onChange={handleInput} required />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleInput} rows={3} required />
          <select name="category" value={form.category} onChange={handleInput} required>
            <option value="standard">Standard</option>
            <option value="semi-custom">Semi‑custom</option>
            <option value="fully-custom">Fully‑custom</option>
            <option value="ai-generated">AI‑generated</option>
          </select>
          <input name="basePrice" placeholder="Base price (₹)" type="number" min="0" value={form.basePrice} onChange={handleInput} required />
          <input name="customizationFee" placeholder="Customization fee (₹)" type="number" min="0" value={form.customizationFee} onChange={handleInput} />
          <input name="urgentDeliveryFee" placeholder="Urgent delivery fee (₹)" type="number" min="0" value={form.urgentDeliveryFee} onChange={handleInput} />
          <label>
            Images (optional):
            <input type="file" multiple accept="image/*" onChange={handleFileChange} />
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setModalOpen(false)} style={{ background: 'var(--border-light)', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}>{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SellerProducts;
