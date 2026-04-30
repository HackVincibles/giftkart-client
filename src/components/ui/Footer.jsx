import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Globe, Camera, MessageCircle, Sparkles, Send } from 'lucide-react';

export const Footer = ({
  companyName = 'GiftKart Artisan',
  description = 'Redefining the soul of gifting through AI-driven design and artisan craftsmanship.',
  usefulLinks = [
    { label: 'Inspiration Gallery', href: '/inspiration' },
    { label: 'Vibe-Coder', href: '/vibe-coder' },
    { label: 'Artisan Studio', href: '/creator-dashboard' },
    { label: 'Marketplace', href: '/buyer-dashboard' },
  ],
  socialLinks = [
    { label: 'Instagram', href: '#', icon: <Camera size={18} /> },
    { label: 'X (Twitter)', href: '#', icon: <MessageCircle size={18} /> },
    { label: 'Facebook', href: '#', icon: <Globe size={18} /> },
  ],
  newsletterTitle = 'Join the Artisan Inner Circle',
  className,
  ...props
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('idle');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || isSubmitting) return;
    setIsSubmitting(true);
    
    setTimeout(() => {
        setIsSubmitting(false);
        setStatus('success');
        setEmail('');
        setTimeout(() => setStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <footer className="artisan-footer-root" {...props}>
      <div className="artisan-footer-container">
        <div className="artisan-footer-grid">
          
          {/* Branding Column */}
          <div className="footer-col branding-col">
            <div className="footer-brand">
              <div className="brand-icon">
                  <Sparkles size={24} />
              </div>
              <span className="brand-text">{companyName}</span>
            </div>
            <p className="footer-desc">{description}</p>
            <div className="social-hub">
              {socialLinks.map((link) => (
                <a key={link.label} href={link.href} className="social-pill" aria-label={link.label}>
                    {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="footer-col links-col">
            <h3 className="col-title">Discovery</h3>
            <ul className="footer-links">
              {usefulLinks.map((link) => (
                <li key={link.label}><a href={link.href}>{link.label}</a></li>
              ))}
            </ul>
          </div>

          <div className="footer-col links-col">
            <h3 className="col-title">Artisan Hub</h3>
            <ul className="footer-links">
                <li><a href="/login">Creator Login</a></li>
                <li><a href="/register">Join the Guild</a></li>
                <li><a href="/inspiration">Aesthetic Feed</a></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="footer-col newsletter-col">
            <div className="newsletter-box">
                <h3 className="newsletter-title">{newsletterTitle}</h3>
                <p className="newsletter-sub">Cinematic updates and exclusive artisan drops.</p>
                <form onSubmit={handleSubscribe} className="newsletter-form">
                    <input
                        type="email"
                        placeholder="artisan@giftkart.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? '...' : 'Subscribe'}
                    </button>
                </form>
                {status === 'success' && (
                    <p className="status-msg">Welcome to the artisan circle. 🎉</p>
                )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="copyright">© 2024 GIFTKART ARTISAN LABS — BORN IN INDIA.</p>
          <div className="legal-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Ethics</a>
          </div>
        </div>
      </div>

      <style>{`
        .artisan-footer-root {
          background: #050505;
          color: white;
          border-top: 1px solid rgba(255,255,255,0.05);
          width: 100%;
          font-family: 'Inter', sans-serif;
          padding-top: 80px;
          margin-top: auto;
        }

        .artisan-footer-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 40px;
        }

        .artisan-footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 2fr;
          gap: 60px;
          margin-bottom: 80px;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 30px;
        }

        .brand-icon {
          width: 48px;
          height: 48px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: black;
          box-shadow: 0 10px 20px rgba(255,255,255,0.1);
        }

        .brand-text {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -2px;
          text-transform: uppercase;
          font-style: italic;
        }

        .footer-desc {
          color: #888;
          line-height: 1.6;
          font-size: 15px;
          margin-bottom: 30px;
          max-width: 320px;
        }

        .social-hub {
          display: flex;
          gap: 12px;
        }

        .social-pill {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .social-pill:hover {
          color: white;
          border-color: white;
          transform: translateY(-3px);
          background: rgba(255,255,255,0.05);
        }

        .col-title {
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #555;
          margin-bottom: 30px;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-links li {
          margin-bottom: 15px;
        }

        .footer-links a {
          color: #888;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
        }

        .footer-links a:hover {
          color: white;
        }

        .newsletter-box {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 24px;
          padding: 30px;
        }

        .newsletter-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .newsletter-sub {
          font-size: 14px;
          color: #666;
          margin-bottom: 25px;
        }

        .newsletter-form {
          display: flex;
          gap: 10px;
          position: relative;
        }

        .newsletter-form input {
          flex: 1;
          background: #000;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 0 15px;
          height: 50px;
          color: white;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .newsletter-form input:focus {
          border-color: rgba(255,255,255,0.3);
        }

        .newsletter-form button {
          background: white;
          color: black;
          border: none;
          padding: 0 20px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 12px;
          text-transform: uppercase;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .newsletter-form button:hover {
          transform: scale(1.02);
        }

        .status-msg {
          margin-top: 15px;
          color: #10b981;
          font-size: 12px;
          font-weight: 700;
          text-align: center;
        }

        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 40px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .copyright {
          font-size: 11px;
          font-weight: 900;
          color: #444;
          letter-spacing: 3px;
          font-style: italic;
        }

        .legal-links {
          display: flex;
          gap: 30px;
        }

        .legal-links a {
          font-size: 11px;
          color: #444;
          text-decoration: none;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: color 0.2s;
        }

        .legal-links a:hover {
          color: white;
        }

        @media (max-width: 1024px) {
          .artisan-footer-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 768px) {
          .artisan-footer-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .footer-bottom {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
          .artisan-footer-container {
            padding: 0 20px;
          }
        }
      `}</style>
    </footer>
  );
};
