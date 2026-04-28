import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Image as ImageIcon, Save, Loader } from 'lucide-react';
import axios from 'axios';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { useToast } from '../../context/ToastContext';

const AddProduct = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'semi-custom',
    basePrice: '',
    inventoryStock: 100,
    images: []
  });

  const [customFields, setCustomFields] = useState([
    { fieldName: '', fieldType: 'text', required: true, maxLength: '' }
  ]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadToCloudinary(file);
      setFormData(prev => ({
        ...prev,
        images: [{ url }]
      }));
      success("Image uploaded successfully!");
    } catch (err) {
      error("Failed to upload image to Cloudinary.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddField = () => {
    setCustomFields([...customFields, { fieldName: '', fieldType: 'text', required: true, maxLength: '' }]);
  };

  const handleRemoveField = (index) => {
    const updated = customFields.filter((_, i) => i !== index);
    setCustomFields(updated);
  };

  const handleFieldChange = (index, key, value) => {
    const updated = [...customFields];
    updated[index][key] = value;
    setCustomFields(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      basePrice: Number(formData.basePrice),
      images: formData.images,
      inventory: { stockCount: Number(formData.inventoryStock) },
      customizableFields: customFields.filter(f => f.fieldName !== '')
    };

    try {
      // In a real app, send to backend
      setTimeout(() => {
        setLoading(false);
        navigate('/creator-dashboard/products');
      }, 1000);
    } catch (error) {
      console.error('Failed to create product', error);
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/creator-dashboard/products')} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.2rem' }}>Create New Product</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Add an item to your catalog.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>Basic Information</h3>
            
            <div className="input-group">
              <label className="input-label">Product Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g., Personalized Name Necklace"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea 
                className="input-field" 
                rows="4"
                placeholder="Describe the product, materials, and emotional value..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required 
              ></textarea>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Base Price (₹)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="0.00"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                  required 
                />
              </div>
              <div className="input-group">
                <label className="input-label">Category</label>
                <select 
                  className="input-field"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="semi-custom">Semi Custom</option>
                  <option value="fully-custom">Fully Custom</option>
                  <option value="standard">Standard</option>
                  <option value="ai-generated">AI Generated</option>
                </select>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Customizable Fields</h3>
              <button type="button" onClick={handleAddField} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={16} /> Add Field
              </button>
            </div>
            
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Define what the buyer can customize. (e.g., Text Engraving, Photo Upload).
            </p>

            {customFields.map((field, index) => (
              <div key={index} style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '1rem', alignItems: 'start' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '0.8rem' }}>Field Label</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g., Name to Engrave"
                      value={field.fieldName}
                      onChange={(e) => handleFieldChange(index, 'fieldName', e.target.value)}
                    />
                  </div>
                  
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '0.8rem' }}>Field Type</label>
                    <select 
                      className="input-field"
                      value={field.fieldType}
                      onChange={(e) => handleFieldChange(index, 'fieldType', e.target.value)}
                    >
                      <option value="text">Text Input</option>
                      <option value="image">Image Upload</option>
                      <option value="color">Color Picker</option>
                    </select>
                  </div>

                  <div style={{ paddingTop: '1.75rem' }}>
                    <button type="button" onClick={() => handleRemoveField(index)} className="btn btn-secondary" style={{ padding: '0.5rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>Product Images</h3>
            
            <label style={{ 
              border: '2px dashed var(--border-light)', borderRadius: '8px', padding: '2rem', 
              textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', display: 'block', cursor: 'pointer' 
            }}>
              {uploadingImage ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Loader className="animate-spin" size={40} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>Uploading to Cloudinary...</p>
                </div>
              ) : (
                <>
                  <ImageIcon size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Click to upload via Cloudinary</p>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                </>
              )}
            </label>
            
            {formData.images.length > 0 && formData.images[0].url && (
              <div style={{ marginTop: '1rem', borderRadius: '8px', overflow: 'hidden', height: '150px' }}>
                <img src={formData.images[0].url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>Inventory</h3>
            <div className="input-group">
              <label className="input-label">Initial Stock Count</label>
              <input 
                type="number" 
                className="input-field" 
                value={formData.inventoryStock}
                onChange={(e) => setFormData({...formData, inventoryStock: e.target.value})}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }} disabled={loading}>
            {loading ? 'Saving...' : <><Save size={20} /> Publish Product</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
