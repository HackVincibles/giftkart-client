import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, QrCode, MapPin, Package } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const PackageImageContainer = ({ children }) => (
  <div className="relative flex h-48 w-full items-center justify-center overflow-hidden bg-[#0a0a0a]">
    {/* Animated Conveyor/Artisan Background */}
    <div className="absolute inset-0 z-0 h-full w-full opacity-10 artisan-grid"></div>
    <div className="z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        {children}
    </div>
    
    <style>{`
        .artisan-grid {
            background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0);
            background-size: 24px 24px;
            animation: moveGrid 20s linear infinite;
        }
        @keyframes moveGrid {
            from { background-position: 0 0; }
            to { background-position: 100% 100%; }
        }
    `}</style>
  </div>
);

export const PackageTrackerCard = ({
  status,
  packageNumber,
  destination,
  date,
  qrCodeValue,
  packageImage,
  onTrackClick,
  className = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`kindred-tracker-card ${className}`}
    >
      {/* Top Action */}
      <div className="tracker-top">
        <button onClick={onTrackClick} className="status-badge">
          <CheckCircle2 size={14} className="text-emerald-500" />
          <span>{status}</span>
        </button>
      </div>

      {/* Visual Section */}
      <PackageImageContainer>
        {packageImage || <Package size={60} color="#3f3f46" strokeWidth={1} />}
      </PackageImageContainer>

      {/* Info Section */}
      <div className="tracker-info">
        <div className="destination-row">
            <MapPin size={14} color="#71717a" />
            <span>{destination}</span>
        </div>

        <h2 className="tracker-status-text">{status}</h2>

        <div className="tracker-meta">
          <div className="meta-left">
            <label>Serial Number</label>
            <code>{packageNumber}</code>
            <p className="eta-text">{date}</p>
          </div>

          <div className="qr-container">
            {qrCodeValue ? (
              <QRCodeCanvas 
                value={qrCodeValue} 
                size={64} 
                bgColor="transparent" 
                fgColor="#ffffff" 
              />
            ) : (
              <QrCode size={32} color="#3f3f46" />
            )}
          </div>
        </div>
      </div>

      <style>{`
        .kindred-tracker-card {
            width: 100%;
            max-width: 380px;
            background: #0f1014;
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 32px;
            overflow: hidden;
            transition: all 0.3s;
        }

        .kindred-tracker-card:hover {
            border-color: rgba(255,255,255,0.15);
            transform: translateY(-5px);
            box-shadow: 0 30px 60px rgba(0,0,0,0.4);
        }

        .tracker-top { padding: 1.25rem; }

        .status-badge {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.05);
            padding: 0.6rem;
            border-radius: 100px;
            color: #a1a1aa;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            cursor: pointer;
        }

        .tracker-info { padding: 1.5rem 2rem 2rem; }

        .destination-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #71717a;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .tracker-status-text {
            font-size: 2rem;
            font-weight: 900;
            letter-spacing: -0.02em;
            margin-bottom: 1.5rem;
        }

        .tracker-meta {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }

        .meta-left label {
            display: block;
            font-size: 0.6rem;
            text-transform: uppercase;
            color: #3f3f46;
            letter-spacing: 0.1em;
            margin-bottom: 0.25rem;
        }

        .meta-left code {
            display: block;
            font-family: 'Space Mono', monospace;
            font-size: 0.8rem;
            color: #a1a1aa;
            margin-bottom: 0.5rem;
        }

        .eta-text {
            font-size: 0.7rem;
            color: var(--accent);
            font-weight: 700;
        }

        .qr-container {
            background: rgba(255,255,255,0.05);
            padding: 0.5rem;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.05);
        }
      `}</style>
    </motion.div>
  );
};
