import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, ShieldCheck, Zap } from 'lucide-react';

const CreditCardForm = ({ 
    onSubmit, 
    onChange, 
    showSubmit = true,
    ring1 = "#a78bfa", // GiftKart Purple
    ring2 = "#fbbf24",  // GiftKart Gold
    onRazorpayClick,
    isRazorpayProcessing
}) => {
    const [card, setCard] = useState({
        number: '',
        holder: '',
        expiry: '',
        cvv: ''
    });
    const [isFlipped, setIsFlipped] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const formatNumber = (num) => {
        return num.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
    };

    const handleNumberChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 16);
        setCard({ ...card, number: val });
    };

    const handleExpiryChange = (e) => {
        let val = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2);
        setCard({ ...card, expiry: val });
    };

    const handleCVVChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 3);
        setCard({ ...card, cvv: val });
    };

    useEffect(() => {
        if (onChange) onChange(card);
    }, [card]);

    return (
        <div className="giftkart-card-studio">
            {/* Visual Card Section */}
            <div className="card-preview-area">
                <motion.div 
                    className={`artisan-card ${isFlipped ? 'flipped' : ''}`}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                >
                    {/* Front */}
                    <div className="card-face front">
                        <div className="card-glass-overlay"></div>
                        <div className="card-rings">
                            <div className="ring r1" style={{ borderColor: ring1 }}></div>
                            <div className="ring r2" style={{ borderColor: ring2 }}></div>
                        </div>
                        
                        <div className="card-header">
                            <div className="card-chip"></div>
                            <CreditCard size={32} color="rgba(255,255,255,0.4)" />
                        </div>

                        <div className={`card-number-display ${focusedField === 'number' ? 'highlight' : ''}`}>
                            {card.number ? formatNumber(card.number) : '•••• •••• •••• ••••'}
                        </div>

                        <div className="card-footer">
                            <div className={`card-holder-display ${focusedField === 'holder' ? 'highlight' : ''}`}>
                                <span>Card Holder</span>
                                <strong>{card.holder || 'NAME ON CARD'}</strong>
                            </div>
                            <div className={`card-expiry-display ${focusedField === 'expiry' ? 'highlight' : ''}`}>
                                <span>Expires</span>
                                <strong>{card.expiry || 'MM/YY'}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Back */}
                    <div className="card-face back">
                        <div className="card-magstripe"></div>
                        <div className="card-cvv-strip">
                            <span>CVV</span>
                            <div className="cvv-box">{card.cvv || '•••'}</div>
                        </div>
                        <div className="card-back-branding">GIFTKART ARTISAN PLATFORM</div>
                    </div>
                </motion.div>
            </div>

            {/* Input Form Section */}
            <form className="card-form" onSubmit={(e) => { e.preventDefault(); onSubmit?.(card); }}>
                <div className="input-group">
                    <label>Card Number</label>
                    <input 
                        type="text" 
                        placeholder="0000 0000 0000 0000"
                        value={formatNumber(card.number)}
                        onChange={handleNumberChange}
                        onFocus={() => { setFocusedField('number'); setIsFlipped(false); }}
                        onBlur={() => setFocusedField(null)}
                    />
                </div>

                <div className="input-group">
                    <label>Card Holder</label>
                    <input 
                        type="text" 
                        placeholder="NAME AS ON CARD"
                        value={card.holder.toUpperCase()}
                        onChange={(e) => setCard({ ...card, holder: e.target.value.toUpperCase() })}
                        onFocus={() => { setFocusedField('holder'); setIsFlipped(false); }}
                        onBlur={() => setFocusedField(null)}
                    />
                </div>

                <div className="input-row">
                    <div className="input-group">
                        <label>Expiry Date</label>
                        <input 
                            type="text" 
                            placeholder="MM/YY"
                            value={card.expiry}
                            onChange={handleExpiryChange}
                            onFocus={() => { setFocusedField('expiry'); setIsFlipped(false); }}
                            onBlur={() => setFocusedField(null)}
                        />
                    </div>
                    <div className="input-group">
                        <label>CVV</label>
                        <input 
                            type="text" 
                            placeholder="•••"
                            value={card.cvv}
                            onChange={handleCVVChange}
                            onFocus={() => { setFocusedField('cvv'); setIsFlipped(true); }}
                            onBlur={() => { setFocusedField(null); setIsFlipped(false); }}
                        />
                    </div>
                </div>

                {showSubmit && (
                    <div className="form-actions">
                        <button type="submit" className="card-submit-btn">
                            <ShieldCheck size={18} /> <span>Secure Card Payment</span>
                        </button>
                        
                        <div className="alternative-separator">
                            <span>OR</span>
                        </div>

                        <button 
                            type="button" 
                            className="razorpay-alt-btn" 
                            onClick={onRazorpayClick}
                            disabled={isRazorpayProcessing}
                        >
                            <Zap size={16} /> <span>{isRazorpayProcessing ? 'Connecting...' : 'Pay with Razorpay / UPI'}</span>
                        </button>
                    </div>
                )}
            </form>

            <style>{`
                .giftkart-card-studio {
                    display: flex;
                    flex-direction: column;
                    gap: 3rem;
                    width: 100%;
                    max-width: 450px;
                }

                .card-preview-area {
                    perspective: 1000px;
                    height: 240px;
                }

                .artisan-card {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    transform-style: preserve-3d;
                }

                .card-face {
                    position: absolute;
                    inset: 0;
                    background: #0f1014;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 24px;
                    backface-visibility: hidden;
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    overflow: hidden;
                    box-shadow: 0 40px 100px rgba(0,0,0,0.5);
                }

                .card-face.back {
                    transform: rotateY(180deg);
                    padding: 0;
                    background: #0a0a0a;
                }

                .card-glass-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%);
                    z-index: 1;
                }

                .card-rings {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                }

                .ring {
                    position: absolute;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 50%;
                    filter: blur(40px);
                    opacity: 0.3;
                }

                .ring.r1 { width: 300px; height: 300px; top: -150px; left: -150px; }
                .ring.r2 { width: 250px; height: 250px; bottom: -100px; right: -100px; }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: relative;
                    z-index: 2;
                }

                .card-chip {
                    width: 45px;
                    height: 35px;
                    background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
                    border-radius: 6px;
                    position: relative;
                }

                .card-number-display {
                    font-size: 1.6rem;
                    font-family: 'Space Mono', monospace;
                    letter-spacing: 0.1em;
                    color: white;
                    margin: 1.5rem 0;
                    transition: all 0.3s;
                    position: relative;
                    z-index: 2;
                }

                .card-footer {
                    display: flex;
                    justify-content: space-between;
                    position: relative;
                    z-index: 2;
                }

                .card-footer span { font-size: 0.6rem; text-transform: uppercase; color: #71717a; display: block; margin-bottom: 0.3rem; }
                .card-footer strong { font-size: 0.9rem; color: white; letter-spacing: 0.05em; }

                .highlight {
                    text-shadow: 0 0 15px rgba(255,255,255,0.5);
                    transform: scale(1.02);
                }

                /* Back Side */
                .card-magstripe {
                    width: 100%;
                    height: 45px;
                    background: #1a1a1a;
                    margin-top: 2rem;
                }

                .card-cvv-strip {
                    margin: 2rem;
                    background: rgba(255,255,255,0.05);
                    padding: 0.5rem 1rem;
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    gap: 1rem;
                }

                .card-cvv-strip span { font-size: 0.7rem; color: #71717a; }
                .cvv-box { font-family: 'Space Mono', monospace; font-size: 1.2rem; color: white; letter-spacing: 0.2em; }

                .card-back-branding {
                    text-align: center;
                    font-size: 0.6rem;
                    letter-spacing: 0.3em;
                    color: #3f3f46;
                    margin-bottom: 1.5rem;
                }

                /* Form Styling */
                .card-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .input-group label {
                    display: block;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: #71717a;
                    margin-bottom: 0.6rem;
                    font-weight: 700;
                }

                .input-group input {
                    width: 100%;
                    background: var(--bg);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 0.8rem 1.2rem;
                    color: var(--text);
                    font-size: 1rem;
                    outline: none;
                    transition: all 0.2s;
                }

                .input-group input:focus {
                    border-color: var(--accent);
                    background: var(--bg-secondary);
                    box-shadow: 0 0 20px rgba(139, 92, 246, 0.1);
                }

                .input-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .card-submit-btn {
                    margin-top: 1rem;
                    background: white;
                    color: black;
                    border: none;
                    padding: 1rem;
                    border-radius: 14px;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .card-submit-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(255,255,255,0.1);
                }

                .form-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    margin-top: 1rem;
                }

                .alternative-separator {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    color: #3f3f46;
                    font-size: 0.6rem;
                    font-weight: 800;
                    letter-spacing: 0.2em;
                }

                .alternative-separator::before,
                .alternative-separator::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: rgba(255,255,255,0.05);
                }

                .razorpay-alt-btn {
                    background: rgba(51, 153, 204, 0.1);
                    border: 1px solid rgba(51, 153, 204, 0.2);
                    color: #3399cc;
                    padding: 1rem;
                    border-radius: 14px;
                    font-weight: 800;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .razorpay-alt-btn:hover:not(:disabled) {
                    background: rgba(51, 153, 204, 0.15);
                    border-color: #3399cc;
                    transform: translateY(-2px);
                }

                .razorpay-alt-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default CreditCardForm;
