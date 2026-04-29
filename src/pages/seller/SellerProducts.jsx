import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { Plus, Edit2, Trash2, Loader2, Image as ImageIcon, X } from 'lucide-react';

// Simple modal component (glass‑morphic style)
const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '24px',
        minWidth: '400px', maxWidth: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        border: '1px solid var(--border-light)', position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
        </button>
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
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = create, otherwise product object
  const [form, setForm] = useState({
    name: '', description: '', category: 'standard', basePrice: '', customizationFee: '', urgentDeliveryFee: '', images: []
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/seller-products');
      if (res.data.success) setProducts(res.data.data.products);
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to load products' });
    } finally { setLoading(false); }
  };

  useEffect(() => { 
    fetchProducts(); 
    
    // Check for AI pending idea
    const pendingIdea = sessionStorage.getItem('pendingIdea');
    if (pendingIdea) {
        try {
            const idea = JSON.parse(pendingIdea);
            setForm({
                name: idea.title || '',
                description: idea.reason || '',
                category: idea.category || 'standard',
                basePrice: idea.suggestedPrice || '',
                customizationFee: '',
                urgentDeliveryFee: '',
                images: []
            });
            setEditing(null);
            setModalOpen(true);
            sessionStorage.removeItem('pendingIdea');
        } catch (e) {}
    }
  }, []);

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
    setSubmitting(true);
    try {
      // 1️⃣ Upload images to Cloudinary (if any)
      let uploadedUrls = [];
      if (form.images.length > 0) {
        uploadedUrls = await Promise.all(form.images.map(file => uploadToCloudinary(file)));
      }

      // 2️⃣ Build payload
      const imageObjects = uploadedUrls.map(url => ({ url, alt: form.name }));
      
      // If editing, merge with existing images if no new ones, or append
      let finalImages = editing ? [...(editing.images || [])] : [];
      if (imageObjects.length > 0) {
          // For now, let's replace if new ones are uploaded, or we could append.
          // User said "cant update img", so let's allow replacing.
          finalImages = imageObjects;
      }

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
        images: finalImages
      };

      let res;
      if (editing) {
        res = await axios.put(`/seller-products/${editing._id}`, payload);
      } else {
        res = await axios.post('/seller-products', payload);
      }
      
      if (res.data.success) {
        addToast({ type: 'success', message: editing ? 'Product updated successfully' : 'Product created successfully' });
        fetchProducts();
        setModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to save product' });
    } finally {
        setSubmitting(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await axios.delete(`/seller-products/${id}`);
      if (res.data.success) {
        addToast({ type: 'success', message: 'Product deleted' });
        fetchProducts();
      }
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Delete failed' });
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>My Products</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage your catalog and stock levels.</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
            <Plus size={20} /> Add New Product
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
            <Loader2 className="animate-spin" size={40} color="var(--accent-primary)" />
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading products...</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ overflow: 'hidden', borderRadius: '24px', border: '1px solid var(--border-light)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-light)' }}>
                <th style={{ padding: '1.25rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600' }}>Product</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600' }}>Category</th>
                <th style={{ padding: '1.25rem', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: '600' }}>Price (₹)</th>
                <th style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '600' }}>Stock</th>
                <th style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }} className="hover:bg-white/5">
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-secondary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-light)' }}>
                            {p.images?.[0]?.url ? (
                                <img src={p.images[0].url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <ImageIcon size={20} color="var(--text-muted)" />
                            )}
                        </div>
                        <div style={{ fontWeight: '700' }}>{p.name}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)', textTransform: 'capitalize' }}>
                        {p.category}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '800' }}>{p.pricing?.final?.toLocaleString() || p.basePrice}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontWeight: '600' }}>{p.inventory?.stockCount ?? '-'}</span>
                        {p.inventory?.stockCount <= 5 && (
                            <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: '800', textTransform: 'uppercase' }}>Low Stock</span>
                        )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        <button onClick={() => openEdit(p)} style={{ padding: '0.5rem', background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }} title="Edit"><Edit2 size={18} /></button>
                        <button onClick={() => deleteProduct(p._id)} style={{ padding: '0.5rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Delete"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <ImageIcon size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                  <p>No products found. Start by adding one!</p>
              </div>
          )}
        </div>
      )}

      {/* ---------- Modal ---------- */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '800' }}>{editing ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={submitProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="input-group">
            <label className="input-label">Product Name</label>
            <input name="name" placeholder="Enter product name" value={form.name} onChange={handleInput} required className="input-field" />
          </div>
          
          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea name="description" placeholder="Tell customers about your product..." value={form.description} onChange={handleInput} rows={3} required className="input-field" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Category</label>
                <select name="category" value={form.category} onChange={handleInput} required className="input-field">
                    <option value="standard">Standard</option>
                    <option value="semi-custom">Semi‑custom</option>
                    <option value="fully-custom">Fully‑custom</option>
                    <option value="ai-generated">AI‑generated</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Base Price (₹)</label>
                <input name="basePrice" placeholder="0.00" type="number" min="0" value={form.basePrice} onChange={handleInput} required className="input-field" />
              </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Customization Fee (₹)</label>
                <input name="customizationFee" placeholder="0" type="number" min="0" value={form.customizationFee} onChange={handleInput} className="input-field" />
              </div>
              <div className="input-group">
                <label className="input-label">Urgent Delivery (₹)</label>
                <input name="urgentDeliveryFee" placeholder="0" type="number" min="0" value={form.urgentDeliveryFee} onChange={handleInput} className="input-field" />
              </div>
          </div>

          <div className="input-group">
            <label className="input-label">Images {editing && '(Uploading new will replace existing)'}</label>
            <div style={{ border: '2px dashed var(--border-light)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} id="file-upload" />
                <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <ImageIcon size={32} color="var(--accent-primary)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{form.images.length > 0 ? `${form.images.length} files selected` : 'Click to upload images'}</span>
                </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary" disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minWidth: '120px' }}>
                {submitting ? <Loader2 size={18} className="animate-spin" /> : (editing ? 'Save Changes' : 'Create Product')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SellerProducts;

