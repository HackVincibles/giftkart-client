import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ShoppingBag, ArrowLeft, Heart, ShieldCheck, Truck, Zap } from 'lucide-react';
import axios from 'axios';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customData, setCustomData] = useState({});

  useEffect(() => {
    // Mock fetching product details
    setTimeout(() => {
      setProduct({
        _id: id || '1',
        name: 'Custom Engraved Wooden Frame',
        description: 'A beautiful, handcrafted wooden frame perfectly suited for your most precious memories. Customize it with an engraving and an uploaded photo.',
        basePrice: 1200,
        images: [{ url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800' }],
        customizableFields: [
          { fieldName: 'Name to Engrave', fieldType: 'text', required: true },
          { fieldName: 'Upload Photo', fieldType: 'image', required: true }
        ],
        creator: { studioName: 'Artisan Crafts Co.' }
      });
      setLoading(false);
    }, 600);
  }, [id]);

  const handleCustomDataChange = (field, value) => {
    setCustomData({ ...customData, [field]: value });
  };

  const handleAddToCart = () => {
    // In a real app, save customization and add to cart context or backend
    console.log("Added to cart with customizations:", customData);
    navigate('/cart');
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      <main className="container animate-fade-in" style={{ padding: '2rem', flex: 1 }}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={18} /> Back
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
          {/* Image Gallery */}
          <div style={{ position: 'sticky', top: '2rem' }}>
            <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-light)', background: 'var(--bg-secondary)' }}>
              <img src={product.images[0].url} alt={product.name} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck color="var(--success)" size={20} /> <span style={{ fontSize: '0.85rem' }}>Quality Guarantee</span>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck color="#3b82f6" size={20} /> <span style={{ fontSize: '0.85rem' }}>Ships in 2 Days</span>
              </div>
            </div>
          </div>

          {/* Product Info & Customization */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <p style={{ color: 'var(--accent-secondary)', fontWeight: '600', marginBottom: '0.5rem' }}>{product.creator.studioName}</p>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', lineHeight: '1.2' }}>{product.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{product.basePrice}</span>
                <span style={{ padding: '4px 12px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                  Best Seller
                </span>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
              {product.description}
            </p>

            <div style={{ height: '1px', background: 'var(--border-light)', margin: '1rem 0' }}></div>

            {/* Dynamic Customization Form */}
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap color="var(--accent-primary)" /> Personalize Your Gift
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {product.customizableFields.map((field, index) => (
                  <div key={index} className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">
                      {field.fieldName} {field.required && <span style={{ color: 'var(--danger)' }}>*</span>}
                    </label>
                    
                    {field.fieldType === 'text' && (
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder={`Enter ${field.fieldName.toLowerCase()}`}
                        onChange={(e) => handleCustomDataChange(field.fieldName, e.target.value)}
                      />
                    )}
                    
                    {field.fieldType === 'image' && (
                      <div style={{ 
                        border: '2px dashed var(--border-light)', padding: '2rem', textAlign: 'center', 
                        borderRadius: '8px', background: 'rgba(15, 23, 42, 0.4)', cursor: 'pointer'
                      }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Click to upload {field.fieldName}</p>
                        <input type="file" style={{ display: 'none' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                onClick={handleAddToCart}
                className="btn btn-primary" 
                style={{ flex: 1, padding: '1rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                <ShoppingBag size={20} /> Add to Cart
              </button>
              <button className="btn btn-secondary" style={{ padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Heart size={24} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetails;
