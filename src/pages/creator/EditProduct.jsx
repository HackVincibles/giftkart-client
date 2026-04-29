import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Camera, Plus, Trash2, Info, ChevronLeft, Save } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const EditProduct = () => {
  const { productId } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'semi-custom',
    basePrice: '',
    inventoryStock: '100',
    images: []
  });

  const [customFields, setCustomFields] = useState([{ fieldName: '', fieldType: 'text', required: true }]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();
  const { success, error } = useToast();

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      const res = await axios.get(`/seller-products/${productId}`);
      if (res.data.success) {
        const product = res.data.data;
        setFormData({
          name: product.name,
          description: product.description,
          category: product.category,
          basePrice: product.basePrice,
          inventoryStock: product.inventory?.stockCount || '100',
          images: product.images || []
        });
        setCustomFields(product.customizableFields.length > 0 ? product.customizableFields : [{ fieldName: '', fieldType: 'text', required: true }]);
      }
    } catch (err) {
      error("Failed to load product details.");
      navigate('/creator-dashboard/products');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddField = () => {
    setCustomFields([...customFields, { fieldName: '', fieldType: 'text', required: true }]);
  };

  const handleRemoveField = (index) => {
    const newFields = customFields.filter((_, i) => i !== index);
    setCustomFields(newFields);
  };

  const handleFieldChange = (index, field, value) => {
    const newFields = [...customFields];
    newFields[index][field] = value;
    setCustomFields(newFields);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'giftkart_products');

    try {
      setLoading(true);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: data
      });
      const fileData = await res.json();
      setFormData({ ...formData, images: [...formData.images, { url: fileData.secure_url, alt: formData.name }] });
      success("Image uploaded successfully!");
    } catch (err) {
      error("Image upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      basePrice: Number(formData.basePrice),
      pricing: {
        base: Number(formData.basePrice)
      },
      images: formData.images,
      inventory: { stockCount: Number(formData.inventoryStock) },
      customizableFields: customFields.filter(f => f.fieldName !== '')
    };

    try {
      const res = await axios.put(`/seller-products/${productId}`, payload);
      if (res.data.success) {
        success("Product updated successfully!");
        navigate('/creator-dashboard/products');
      }
    } catch (err) {
      error(err.response?.data?.message || "Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading product data...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Edit Product</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Update your handcrafted creation's details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Basic Information</h2>
            
            <div className="input-group">
              <label className="input-label">Product Name</label>
              <input 
                name="name"
                className="input-field" 
                style={{ width: '100%' }} 
                placeholder="e.g. Hand-Carved Wooden Music Box"
                value={formData.name}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea 
                name="description"
                className="input-field" 
                style={{ width: '100%', minHeight: '150px' }} 
                placeholder="Describe your craft, materials used, and the story behind it..."
                value={formData.description}
                onChange={handleChange}
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="input-group">
                <label className="input-label">Base Price (₹)</label>
                <input 
                  name="basePrice"
                  type="number" 
                  className="input-field" 
                  style={{ width: '100%' }} 
                  placeholder="999"
                  value={formData.basePrice}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="input-group">
                <label className="input-label">Category</label>
                <select 
                  name="category"
                  className="input-field" 
                  style={{ width: '100%' }}
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="semi-custom">Semi Custom</option>
                  <option value="fully-custom">Fully Custom</option>
                  <option value="standard">Standard</option>
                </select>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Customizable Fields</h2>
              <button type="button" onClick={handleAddField} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                <Plus size={16} /> Add Field
              </button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Define what the buyer can customize. (e.g., Text Engraving, Photo Upload).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {customFields.map((field, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 40px', gap: '1rem', alignItems: 'end', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Field Label</label>
                    <input 
                      className="input-field" 
                      style={{ width: '100%' }} 
                      placeholder="e.g. Your Custom Message"
                      value={field.fieldName}
                      onChange={(e) => handleFieldChange(index, 'fieldName', e.target.value)}
                    />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Field Type</label>
                    <select 
                      className="input-field" 
                      style={{ width: '100%' }}
                      value={field.fieldType}
                      onChange={(e) => handleFieldChange(index, 'fieldType', e.target.value)}
                    >
                      <option value="text">Text Input</option>
                      <option value="image">Image Upload</option>
                      <option value="color">Color Picker</option>
                      <option value="select">Dropdown Menu</option>
                    </select>
                  </div>
                  <button type="button" onClick={() => handleRemoveField(index)} style={{ padding: '0.5rem', color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Media</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              {formData.images.map((img, i) => (
                <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '12px', overflow: 'hidden' }}>
                  <img src={img.url} alt="product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    type="button" 
                    onClick={() => setFormData({ ...formData, images: formData.images.filter((_, idx) => idx !== i) })}
                    style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(239, 68, 68, 0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <label style={{ 
                aspectRatio: '1', 
                border: '2px dashed var(--border-light)', 
                borderRadius: '12px', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer',
                gap: '0.5rem',
                color: 'var(--text-muted)'
              }}>
                <Camera size={24} />
                <span style={{ fontSize: '0.75rem' }}>Upload</span>
                <input type="file" style={{ display: 'none' }} onChange={handleImageUpload} accept="image/*" />
              </label>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Inventory</h2>
            <div className="input-group">
              <label className="input-label">Current Stock Count</label>
              <input 
                name="inventoryStock"
                type="number" 
                className="input-field" 
                style={{ width: '100%' }} 
                value={formData.inventoryStock}
                onChange={handleChange}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} 
            disabled={loading}
          >
            <Save size={20} />
            {loading ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
