import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Ghost } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.43, 0.13, 0.23, 0.96],
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }
  }
};

const numberVariants = {
  hidden: (direction) => ({
    opacity: 0,
    x: direction * 40,
    y: 15,
    rotate: direction * 5
  }),
  visible: {
    opacity: 0.7,
    x: 0,
    y: 0,
    rotate: 0,
    transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }
  }
};

const ghostVariants = {
  hidden: { scale: 0.8, opacity: 0, y: 15, rotate: -5 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    y: 0, 
    rotate: 0,
    transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }
  },
  floating: {
    y: [-10, 10],
    rotate: [0, -5, 5, -5, 0],
    transition: {
      y: { duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" },
      rotate: { duration: 4, ease: "linear", repeat: Infinity, repeatType: "reverse" }
    }
  }
};

const NotFound = () => {
  return (
    <div className="not-found-root">
      <div className="not-found-bg-glow"></div>
      
      <AnimatePresence mode="wait">
        <motion.div 
          className="not-found-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="error-code-container">
            <motion.span 
              className="error-number"
              variants={numberVariants}
              custom={-1}
            >
              4
            </motion.span>
            
            <motion.div
              className="ghost-visual"
              variants={ghostVariants}
              animate={["visible", "floating"]}
            >
              <div className="ghost-glow"></div>
              <Ghost size={120} strokeWidth={1} color="var(--accent)" />
              <div className="ghost-shadow"></div>
            </motion.div>
            
            <motion.span 
              className="error-number"
              variants={numberVariants}
              custom={1}
            >
              4
            </motion.span>
          </div>
          
          <motion.h1 className="error-title" variants={itemVariants}>
            Boo! This Vibe is <span className="italic-text">Missing.</span>
          </motion.h1>
          
          <motion.p className="error-desc" variants={itemVariants}>
            It seems the artisan masterpiece you're looking for has vanished into the spectral void.
          </motion.p>

          <motion.div variants={itemVariants} className="action-row">
            <Link to="/buyer-dashboard" className="premium-btn">
              <span>Find Shelter in Marketplace</span>
              <ArrowRight size={18} />
            </Link>
          </motion.div>

          <motion.div className="error-info" variants={itemVariants}>
            <div className="info-badge">
                <Sparkles size={14} />
                <span>Protocol: ERROR_404_CONCEPT_NOT_FOUND</span>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <style>{`
        .not-found-root {
          min-height: 100vh;
          background: #050505;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 2rem;
          font-family: 'Inter', sans-serif;
        }

        .not-found-bg-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.05) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .not-found-content {
          text-align: center;
          z-index: 10;
          max-width: 600px;
        }

        .error-code-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .error-number {
          font-size: clamp(80px, 15vw, 150px);
          font-weight: 900;
          color: white;
          opacity: 0.1;
          letter-spacing: -0.05em;
          user-select: none;
        }

        .ghost-visual {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .ghost-glow {
          position: absolute;
          width: 80px;
          height: 80px;
          background: var(--accent);
          filter: blur(40px);
          opacity: 0.2;
          z-index: -1;
        }

        .ghost-shadow {
          width: 40px;
          height: 4px;
          background: rgba(255,255,255,0.05);
          border-radius: 50%;
          margin-top: 1rem;
          filter: blur(2px);
        }

        .error-title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 900;
          letter-spacing: -0.02em;
          margin-bottom: 1.5rem;
          color: white;
        }

        .italic-text {
          font-style: italic;
          opacity: 0.6;
        }

        .error-desc {
          font-size: 1.1rem;
          color: #71717a;
          margin-bottom: 3rem;
          line-height: 1.6;
        }

        .premium-btn {
          display: inline-flex;
          align-items: center;
          gap: 1rem;
          background: white;
          color: black;
          padding: 1.2rem 2.5rem;
          border-radius: 100px;
          text-decoration: none;
          font-weight: 800;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .premium-btn:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(255,255,255,0.15);
        }

        .error-info {
          margin-top: 4rem;
          display: flex;
          justify-content: center;
        }

        .info-badge {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 0.6rem 1rem;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.65rem;
          color: #444;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
