import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Sparkles, ArrowRight, Layers, Hammer, Palette, Zap, Check, Share2, Send } from 'lucide-react';
import Navbar from '../components/Navbar';

const VibeCoder = () => {
    const [vibe, setVibe] = useState('');
    const [isCoding, setIsCoding] = useState(false);
    const [prototype, setPrototype] = useState(null);
    const [phase, setPhase] = useState('');
    const resultRef = useRef(null);

    const phases = [
        "Analyzing creative frequencies...",
        "Deconstructing the aesthetic...",
        "Materializing artisan patterns...",
        "Encoding bespoke details...",
        "Finalizing gift persona..."
    ];

    const [isSending, setIsSending] = useState(false);
    const [sentSuccess, setSentSuccess] = useState(false);

    const handleSendToCreator = async () => {
        setIsSending(true);
        try {
            const res = await axios.post('/ai/save-concept', { 
                vibeInput: vibe,
                blueprint: prototype 
            });
            if (res.data.success) {
                setSentSuccess(true);
                setTimeout(() => setSentSuccess(false), 5000);
            }
        } catch (err) {
            alert("Connection error. The artisans couldn't be reached.");
        } finally {
            setIsSending(false);
        }
    };

    const handleVibeCode = async (e) => {
        e.preventDefault();
        if (!vibe.trim()) return;

        setIsCoding(true);
        setPrototype(null);
        
        // Cycle through phases for "Buttery" loading feel
        let i = 0;
        const interval = setInterval(() => {
            setPhase(phases[i % phases.length]);
            i++;
        }, 1500);

        try {
            const res = await axios.post('/ai/vibe-code', { vibe });
            if (res.data.success) {
                setTimeout(() => {
                    clearInterval(interval);
                    setPrototype(res.data.prototype);
                    setIsCoding(false);
                    // Scroll to result
                    setTimeout(() => {
                        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }, 2000); // Ensure a minimum "Thinking" time for UX feel
            }
        } catch (err) {
            clearInterval(interval);
            setIsCoding(false);
            alert("The AI had a creative block. Please try again.");
        }
    };

    return (
        <div className="vibe-page">
            <Navbar />
            
            {/* Immersive Background */}
            <div className={`vibe-canvas ${isCoding ? 'coding-active' : ''}`}>
                <div className="mesh-gradient"></div>
                <div className="grain-overlay"></div>
            </div>

            <main className="vibe-content">
                <div className="vibe-hero">
                    <div className="ai-badge">
                        <Sparkles size={14} /> <span>Bespoke AI Engine</span>
                    </div>
                    <h1>Vibe-Code Your Gift</h1>
                    <p>Describe the soul of the gift. The AI will code the blueprint.</p>
                </div>

                <div className="vibe-input-section">
                    <form onSubmit={handleVibeCode} className="vibe-form">
                        <textarea 
                            value={vibe}
                            onChange={(e) => setVibe(e.target.value)}
                            placeholder="e.g. A rustic obsidian box with a hidden golden key, smells like old libraries and adventure..."
                            disabled={isCoding}
                        />
                        <button type="submit" className="vibe-submit" disabled={isCoding || !vibe.trim()}>
                            {isCoding ? (
                                <div className="loading-dots">
                                    <span>.</span><span>.</span><span>.</span>
                                </div>
                            ) : (
                                <><span>Code Concept</span> <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>
                    {isCoding && <p className="phase-text">{phase}</p>}
                </div>

                {prototype && (
                    <div ref={resultRef} className="vibe-result-section animate-slide-up">
                        <div className="prototype-card">
                            <div className="proto-header">
                                <div className="proto-meta">
                                    <span className="proto-id">ID: VIBE-{Math.floor(Math.random() * 9000) + 1000}</span>
                                    <span className="proto-score"><Zap size={12} /> {prototype.vibeScore}% Match</span>
                                </div>
                                <h2>{prototype.prototypeName}</h2>
                                <p className="proto-tagline">{prototype.tagline}</p>
                            </div>

                            <div className="proto-body">
                                <div className="proto-section">
                                    <div className="section-title"><Palette size={16} /> <span>Aesthetic Blueprint</span></div>
                                    <div className="palette-row">
                                        {prototype.aestheticPalette.map((color, i) => (
                                            <div key={i} className="color-pill">
                                                <div className="color-dot" style={{ background: color.toLowerCase() }}></div>
                                                {color}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="proto-concept">{prototype.concept}</p>
                                </div>

                                <div className="proto-grid">
                                    <div className="proto-column">
                                        <div className="section-title"><Layers size={16} /> <span>BOM (Materials)</span></div>
                                        <ul className="proto-list">
                                            {prototype.materials.map((m, i) => <li key={i}>{m}</li>)}
                                        </ul>
                                    </div>
                                    <div className="proto-column">
                                        <div className="section-title"><Hammer size={16} /> <span>Artisan Process</span></div>
                                        <ul className="proto-list">
                                            {prototype.craftingSteps.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="proto-footer">
                                <div className="proto-price">
                                    <span>Target Value:</span>
                                    <strong>₹{prototype.suggestedPrice}</strong>
                                </div>
                                <div className="proto-actions">
                                    <button className="btn btn-secondary" onClick={() => navigate('/checkout', { state: { amount: parseInt(prototype.suggestedPrice?.replace(/\D/g, '') || 1499), item: prototype.prototypeName } })}>
                                        <Zap size={16} /> <span>Realize & Pay</span>
                                    </button>
                                    <button className="btn btn-secondary"><Share2 size={16} /> <span>Share</span></button>
                                    <button 
                                        className={`btn ${sentSuccess ? 'btn-success' : 'btn-primary'}`} 
                                        onClick={handleSendToCreator}
                                        disabled={isSending || sentSuccess}
                                    >
                                        {isSending ? (
                                            <div className="loading-dots"><span>.</span><span>.</span><span>.</span></div>
                                        ) : sentSuccess ? (
                                            <><Check size={16} /> <span>Concept Sent!</span></>
                                        ) : (
                                            <><Send size={16} /> <span>Send to Creator</span></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <style>{`
                .vibe-page {
                    min-height: 100vh;
                    background: #050505;
                    color: white;
                    overflow-x: hidden;
                    position: relative;
                }

                .vibe-canvas {
                    position: fixed;
                    inset: 0;
                    z-index: 0;
                    opacity: 0.4;
                    transition: opacity 2s ease;
                }

                .vibe-canvas.coding-active {
                    opacity: 0.8;
                }

                .mesh-gradient {
                    position: absolute;
                    width: 150%;
                    height: 150%;
                    background: radial-gradient(circle at 20% 30%, #312e81 0%, transparent 40%),
                                radial-gradient(circle at 80% 70%, #4c1d95 0%, transparent 40%),
                                radial-gradient(circle at 50% 50%, #1e1b4b 0%, transparent 100%);
                    filter: blur(100px);
                    animation: mesh-drift 20s infinite alternate;
                }

                @keyframes mesh-drift {
                    0% { transform: translate(-10%, -10%) rotate(0deg); }
                    100% { transform: translate(10%, 10%) rotate(10deg); }
                }

                .grain-overlay {
                    position: absolute;
                    inset: 0;
                    background-image: url("https://grainy-gradients.vercel.app/noise.svg");
                    filter: contrast(150%) brightness(1000%);
                    opacity: 0.05;
                }

                .vibe-content {
                    position: relative;
                    z-index: 1;
                    padding: 120px 2rem 5rem;
                    max-width: 900px;
                    margin: 0 auto;
                }

                .vibe-hero {
                    text-align: center;
                    margin-bottom: 4rem;
                }

                .ai-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.4rem 0.8rem;
                    background: rgba(139, 92, 246, 0.1);
                    border: 1px solid rgba(139, 92, 246, 0.2);
                    border-radius: 100px;
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: #a78bfa;
                    margin-bottom: 1.5rem;
                }

                .vibe-hero h1 {
                    font-size: 4rem;
                    font-weight: 900;
                    letter-spacing: -0.04em;
                    margin-bottom: 1rem;
                    background: linear-gradient(to bottom, #fff 0%, #a1a1aa 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .vibe-hero p {
                    color: #a1a1aa;
                    font-size: 1.2rem;
                }

                .vibe-form {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 32px;
                    padding: 1.5rem;
                    backdrop-filter: blur(20px);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .vibe-form textarea {
                    background: transparent;
                    border: none;
                    color: white;
                    font-size: 1.4rem;
                    line-height: 1.5;
                    min-height: 150px;
                    resize: none;
                    outline: none;
                    font-family: 'Inter', sans-serif;
                }

                .vibe-submit {
                    align-self: flex-end;
                    padding: 1rem 2.5rem;
                    background: white;
                    color: black;
                    border: none;
                    border-radius: 100px;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
                }

                .vibe-submit:hover:not(:disabled) {
                    transform: scale(1.05) translateY(-2px);
                    box-shadow: 0 10px 20px rgba(255,255,255,0.1);
                }

                .vibe-submit:disabled {
                    background: #27272a;
                    color: #71717a;
                    cursor: not-allowed;
                }

                .phase-text {
                    text-align: center;
                    margin-top: 2rem;
                    font-size: 0.9rem;
                    color: #a78bfa;
                    font-family: 'Space Mono', monospace;
                    letter-spacing: 0.05em;
                }

                /* Result Card */
                .vibe-result-section {
                    margin-top: 5rem;
                }

                .prototype-card {
                    background: #0f1014;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 40px;
                    overflow: hidden;
                    box-shadow: 0 40px 100px rgba(0,0,0,0.8);
                }

                .proto-header {
                    padding: 3rem;
                    background: linear-gradient(to bottom, rgba(255,255,255,0.02) 0%, transparent 100%);
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }

                .proto-meta {
                    display: flex;
                    justify-content: space-between;
                    font-family: 'Space Mono', monospace;
                    font-size: 0.7rem;
                    color: #71717a;
                    margin-bottom: 1.5rem;
                    text-transform: uppercase;
                }

                .proto-score {
                    color: #a78bfa;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .proto-header h2 {
                    font-size: 2.5rem;
                    font-weight: 900;
                    margin-bottom: 0.5rem;
                }

                .proto-tagline {
                    font-size: 1.1rem;
                    color: #a78bfa;
                    font-style: italic;
                    opacity: 0.9;
                }

                .proto-body {
                    padding: 3rem;
                }

                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                    color: #71717a;
                    font-weight: 800;
                    margin-bottom: 1.5rem;
                }

                .palette-row {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .color-pill {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.4rem 0.8rem;
                    background: rgba(255,255,255,0.05);
                    border-radius: 100px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .color-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    border: 1px solid rgba(255,255,255,0.2);
                }

                .proto-concept {
                    font-size: 1.1rem;
                    line-height: 1.6;
                    color: #d1d1d6;
                    margin-bottom: 3rem;
                }

                .proto-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 3rem;
                }

                .proto-list {
                    list-style: none;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 0.8rem;
                }

                .proto-list li {
                    font-size: 0.95rem;
                    color: #a1a1aa;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .proto-list li::before {
                    content: "";
                    width: 4px;
                    height: 4px;
                    background: #a78bfa;
                    border-radius: 50%;
                }

                .proto-footer {
                    padding: 3rem;
                    background: rgba(255,255,255,0.02);
                    border-top: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .proto-price span { font-size: 0.8rem; color: #71717a; display: block; }
                .proto-price strong { font-size: 2rem; color: white; }

                .proto-actions {
                    display: flex;
                    gap: 1rem;
                }

                .btn {
                    padding: 0.8rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.85rem;
                }

                .btn-primary { background: white; color: black; border: none; }
                .btn-secondary { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; }
                .btn-success { background: #10b981; color: white; border: none; }

                .loading-dots span {
                    animation: dot-blink 1.4s infinite both;
                    font-size: 2rem;
                    line-height: 0;
                }

                .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
                .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

                @keyframes dot-blink {
                    0% { opacity: 0.2; }
                    20% { opacity: 1; }
                    100% { opacity: 0.2; }
                }

                .animate-slide-up {
                    animation: slide-up 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }

                @keyframes slide-up {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                @media (max-width: 768px) {
                    .vibe-hero h1 { font-size: 2.5rem; }
                    .proto-grid { grid-template-columns: 1fr; }
                    .proto-footer { flex-direction: column; gap: 2rem; text-align: center; }
                }
            `}</style>
        </div>
    );
};

export default VibeCoder;
