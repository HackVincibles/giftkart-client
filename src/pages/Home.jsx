import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Sparkles, Heart, Gift as GiftIcon } from 'lucide-react';
import Navbar from '../components/Navbar';

const Home = () => {
  return (
    <div className="bg-mesh animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '2rem auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '20px', color: 'var(--accent-secondary)', marginBottom: '1.5rem' }}>
            <Sparkles size={16} />
            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Next-Gen AI E-Commerce Platform</span>
          </div>
          
          <h1 className="hero-title" style={{ marginBottom: '1.5rem', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            Find the Perfect Gift with <span className="text-gradient">Artificial Intelligence</span>
          </h1>
          
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
            Stop guessing. Our AI Mind Reader analyzes personalities and emotions to recommend gifts that create unforgettable moments.
          </p>
          
          <div className="hero-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot size={20} /> Start AI Chat
            </Link>
            <Link to="/register" className="btn btn-secondary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
              Become a Creator
            </Link>
          </div>
        </div>

        <div className="grid mt-8" style={{ marginTop: '3rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <Heart color="var(--danger)" size={24} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>Emotion Matching</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>We match gifts not just by price, but by the emotional impact you want to deliver.</p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <GiftIcon color="var(--success)" size={24} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>Auto-Gifting</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Never forget an anniversary again. Set it once, and let our AI curate and deliver the magic.</p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <Bot color="var(--accent-primary)" size={24} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>AI Customizations</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Generate custom poems, romantic captions, and memory scrapbooks instantly.</p>
          </div>
        </div>
      </main>
    </div>
  );
};


export default Home;
