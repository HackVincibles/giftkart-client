import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';

const CreatorProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/seller-products');
      if (res.data.success) {
        setProducts(res.data.data.products || res.data.data);
      }
    } catch (err) {
      console.error("Error fetching seller products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`/seller-products/${productId}`);
      setProducts(products.filter(p => p._id !== productId));
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>My Products</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your catalog and customizable items.</p>
        </div>
        <Link to="/creator-dashboard/products/add" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add New Product
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>Loading products...</div>
      ) : (
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Product</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Category</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Price</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Stock</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Package size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                    <p>No products found. Start by creating one!</p>
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product._id} style={{ borderTop: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {product.images?.[0] ? (
                        <img src={product.images[0].url} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                      ) : (
                        <div style={{ width: '50px', height: '50px', background: 'var(--bg-tertiary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={20} />
                        </div>
                      )}
                      <span style={{ fontWeight: '500' }}>{product.name}</span>
                    </td>
                    <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{product.category.replace('-', ' ')}</td>
                    <td style={{ padding: '1rem' }}>₹{product.basePrice}</td>
                    <td style={{ padding: '1rem' }}>{product.inventory.stockCount}</td>
                    <td style={{ padding: '1rem' }}>
                      {product.isActive ? (
                        <span style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>Active</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.1)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>Draft</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Link to={`/creator-dashboard/products/edit/${product._id}`} className="btn btn-secondary" style={{ padding: '0.4rem', marginRight: '0.5rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Edit2 size={16} />
                      </Link>
                      <button onClick={() => handleDelete(product._id)} className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default CreatorProducts;
