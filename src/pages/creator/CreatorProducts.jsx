import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';

const CreatorProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch from /api/seller-products
    // Using mock data for UI visualization based on the Product model
    setTimeout(() => {
      setProducts([
        {
          _id: '1',
          name: 'Custom Engraved Wooden Frame',
          category: 'semi-custom',
          basePrice: 1200,
          inventory: { stockCount: 45 },
          isActive: true,
          images: [{ url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=200' }]
        },
        {
          _id: '2',
          name: 'AI Generated Memory Scrapbook',
          category: 'ai-generated',
          basePrice: 2500,
          inventory: { stockCount: 999 },
          isActive: true,
          images: [{ url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=200' }]
        }
      ]);
      setLoading(false);
    }, 800);
  }, []);

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
                      <button className="btn btn-secondary" style={{ padding: '0.4rem', marginRight: '0.5rem' }}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
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
