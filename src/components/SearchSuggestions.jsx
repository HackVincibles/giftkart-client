import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Sparkles } from 'lucide-react';

const SearchSuggestions = ({ suggestions, query, onSelect, onClose }) => {
  const navigate = useNavigate();

  if (!query || query.length < 2) return null;

  return (
    <div className="glass-panel animate-slide-up" style={{ 
      position: 'absolute', 
      top: '110%', 
      left: 0, 
      width: '100%', 
      minWidth: '350px',
      maxHeight: '480px', 
      overflowY: 'auto', 
      zIndex: 2000, 
      padding: '0.75rem',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      border: '1px solid var(--border-light)',
      borderRadius: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-light)', marginBottom: '0.5rem' }}>
        <Search size={14} color="var(--text-muted)" />
        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Results for "{query}"</span>
      </div>

      {suggestions.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {suggestions.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelect(item);
                navigate(`/product/${item.id}`);
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem',
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              className="hover:bg-white/5"
            >
              <div style={{ width: '50px', height: '50px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-secondary)' }}>
                <img 
                  src={item.image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=200'} 
                  alt="" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', margin: 0, color: 'var(--text-primary)' }}>{item.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '700' }}>₹{item.price}</span>
                  <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--text-muted)' }}></span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.category?.replace('-', ' ')}</span>
                </div>
              </div>
              <ShoppingBag size={16} color="var(--text-muted)" style={{ opacity: 0.5 }} />
            </button>
          ))}
          
          <button 
            onClick={() => {
                navigate(`/search?q=${query}`);
                onClose();
            }}
            style={{ marginTop: '0.5rem', width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px dashed var(--border-light)', background: 'rgba(139, 92, 246, 0.05)', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>
            View all results
          </button>
        </div>
      ) : (
        <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
          <Sparkles size={24} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No gifts found matching "{query}"</p>
          <button style={{ marginTop: '1rem', color: 'var(--accent-secondary)', background: 'none', border: 'none', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer underline' }}>Try searching by emotion (e.g. "Joyful")</button>
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;
