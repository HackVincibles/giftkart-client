import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Sparkles, Zap, Heart, Share2, Plus, ArrowUpRight, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const InspirationGallery = () => {
    const navigate = useNavigate();
    const [vibes, setVibes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVibes();
    }, []);

    const fetchVibes = async () => {
        try {
            // Fetching from our new VibeConcept model
            const res = await axios.get('/ai/history'); // We'll repurpose this or add a new public route
            // For now, using mock data if empty
            if (res.data.success && res.data.data.length > 0) {
                setVibes(res.data.data);
            } else {
                setVibes([
                    { 
                        _id: '1', 
                        blueprint: { prototypeName: 'The Obsidian Hearth', tagline: 'A cosmic dance of shadow and gold.' }, 
                        vibeInput: 'Dark marble, gold leaf, cinematic moonlight',
                        image: '/home/pineapple/.gemini/antigravity/brain/86651ed9-c98a-46e5-a3b3-4a7147a26fc8/kindred_masterpiece_1_1777502405374.png' 
                    },
                    { 
                        _id: '2', 
                        blueprint: { prototypeName: 'Eternal Lotus Crystal', tagline: 'Light emerging from the heart of stillness.' }, 
                        vibeInput: 'Glowing violet crystal lotus on wood',
                        image: '/home/pineapple/.gemini/antigravity/brain/86651ed9-c98a-46e5-a3b3-4a7147a26fc8/kindred_masterpiece_2_1777502498131.png' 
                    },
                    { 
                        _id: '3', 
                        blueprint: { prototypeName: 'Aetheria Flask', tagline: 'Capture the essence of old library magic.' }, 
                        vibeInput: 'Aged leather, copper accents, blue luminescence',
                        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?q=80&w=2070&auto=format&fit=crop'
                    },
                ]);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="gallery-page">
            <Navbar />
            
            <header className="gallery-header">
                <div className="header-bg"></div>
                <div className="header-content">
                    <div className="badge-row">
                        <span className="gallery-badge"><Sparkles size={12} /> GLOBAL VIBE FEED</span>
                    </div>
                    <h1>GiftKart Inspiration</h1>
                    <p>Discover gift concepts coded by our community and brought to life by artisans.</p>
                    
                    <div className="search-bar">
                        <Search size={18} />
                        <input type="text" placeholder="Search vibes (e.g. 'Lunar', 'Artisan Wood', 'Minimalist')..." />
                        <button className="filter-btn"><Filter size={16} /> <span>Filters</span></button>
                    </div>
                </div>
            </header>

            <main className="gallery-container">
                <div className="gallery-grid">
                    {vibes.map((vibe, idx) => (
                        <div key={vibe._id} className={`vibe-card ${idx % 3 === 0 ? 'large' : ''} animate-fade-in`}>
                            <div className="vibe-media">
                                <img src={vibe.image || 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=1974&auto=format&fit=crop'} alt={vibe.blueprint?.prototypeName} />
                                <div className="vibe-overlay">
                                    <div className="overlay-top">
                                        <button className="icon-btn"><Heart size={18} /></button>
                                        <button className="icon-btn"><Share2 size={18} /></button>
                                    </div>
                                    <div className="overlay-bottom">
                                        <button className="realize-btn" onClick={() => navigate('/vibe-coder', { state: { remix: vibe.vibeInput } })}>
                                            <span>Remix Vibe</span> <Zap size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="vibe-details">
                                <div className="v-head">
                                    <h3>{vibe.blueprint?.prototypeName}</h3>
                                    <ArrowUpRight size={16} color="#71717a" />
                                </div>
                                <p className="v-tagline">{vibe.blueprint?.tagline}</p>
                                <div className="v-meta">
                                    <span className="v-input">"{vibe.vibeInput}"</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* CTA Card */}
                    <div className="vibe-card cta-card" onClick={() => navigate('/vibe-coder')}>
                        <div className="cta-content">
                            <Plus size={48} strokeWidth={1} />
                            <h3>Code Your Own Vibe</h3>
                            <p>Turn your unique imagination into a professional artisan blueprint.</p>
                            <span className="cta-btn">Start Vibe-Coding</span>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                .gallery-page {
                    background: #050505;
                    min-height: 100vh;
                    color: white;
                    padding-bottom: 5rem;
                }

                .gallery-header {
                    height: 50vh;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    overflow: hidden;
                }

                .header-bg {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
                    z-index: 0;
                }

                .header-content {
                    position: relative;
                    z-index: 1;
                    max-width: 800px;
                    padding: 0 2rem;
                }

                .gallery-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.4rem 0.8rem;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 100px;
                    font-size: 0.65rem;
                    font-weight: 800;
                    letter-spacing: 0.1em;
                    color: #71717a;
                    margin-bottom: 1.5rem;
                }

                .header-content h1 {
                    font-size: 4.5rem;
                    font-weight: 900;
                    letter-spacing: -0.05em;
                    margin-bottom: 1.5rem;
                }

                .header-content p {
                    font-size: 1.2rem;
                    color: #a1a1aa;
                    margin-bottom: 3rem;
                }

                .search-bar {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 0.5rem 0.5rem 0.5rem 1.5rem;
                    border-radius: 100px;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    backdrop-filter: blur(10px);
                }

                .search-bar input {
                    background: transparent;
                    border: none;
                    color: white;
                    flex: 1;
                    font-size: 1rem;
                    outline: none;
                }

                .filter-btn {
                    background: white;
                    color: black;
                    border: none;
                    padding: 0.6rem 1.2rem;
                    border-radius: 100px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }

                /* Gallery Grid */
                .gallery-container {
                    padding: 0 4rem;
                    max-width: 1600px;
                    margin: 0 auto;
                }

                .gallery-grid {
                    columns: 3;
                    column-gap: 2rem;
                }

                .vibe-card {
                    break-inside: avoid;
                    margin-bottom: 2.5rem;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 24px;
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
                }

                .vibe-card:hover {
                    transform: translateY(-10px);
                    border-color: rgba(255,255,255,0.15);
                    background: rgba(255,255,255,0.04);
                }

                .vibe-media {
                    position: relative;
                    aspect-ratio: 1;
                    overflow: hidden;
                }

                .vibe-card.large .vibe-media { aspect-ratio: 0.8; }

                .vibe-media img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.8s;
                }

                .vibe-card:hover .vibe-media img { transform: scale(1.1); }

                .vibe-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 30%, rgba(0,0,0,0.8) 100%);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 1.5rem;
                    opacity: 0;
                    transition: opacity 0.3s;
                }

                .vibe-card:hover .vibe-overlay { opacity: 1; }

                .overlay-top { display: flex; justify-content: flex-end; gap: 0.75rem; }
                .icon-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(5px);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .realize-btn {
                    width: 100%;
                    padding: 0.8rem;
                    background: white;
                    color: black;
                    border: none;
                    border-radius: 12px;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }

                .vibe-details { padding: 1.5rem; }
                .v-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
                .v-head h3 { font-size: 1.2rem; font-weight: 800; }
                .v-tagline { font-size: 0.85rem; color: #a78bfa; font-style: italic; margin-bottom: 1rem; }
                .v-input { font-size: 0.75rem; color: #71717a; font-family: 'Space Mono', monospace; }

                /* CTA Card Specific */
                .cta-card {
                    height: 400px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
                    border: 2px dashed rgba(255,255,255,0.1);
                    cursor: pointer;
                }

                .cta-content { padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
                .cta-content h3 { font-size: 1.5rem; font-weight: 900; }
                .cta-content p { color: #71717a; font-size: 0.9rem; }
                .cta-btn { margin-top: 1rem; color: white; border-bottom: 1px solid white; padding-bottom: 4px; font-weight: 700; font-size: 0.8rem; }

                @media (max-width: 1200px) { .gallery-grid { columns: 2; } }
                @media (max-width: 768px) { 
                    .header-content h1 { font-size: 3rem; }
                    .gallery-grid { columns: 1; }
                    .gallery-container { padding: 0 1.5rem; }
                }
            `}</style>
        </div>
    );
};

export default InspirationGallery;
