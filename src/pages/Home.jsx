import React, { useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogIn, ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';
import { Footer } from '../components/ui/Footer';
import { AnimatedTestimonials } from '../components/ui/AnimatedTestimonials';
import './Home.css';

/* ─────────────────────────────────────────────
   BOW LOOP — stable geometry via useMemo
───────────────────────────────────────────── */
function BowLoop({ side, color }) {
  const geo = useMemo(() => {
    const pts = [];
    const N = 50;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI;
      pts.push(new THREE.Vector3(Math.cos(a) * 0.3 * side, Math.sin(a) * 0.48, 0));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, 50, 0.07, 12, false);
  }, [side]);

  return (
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial color={color} roughness={0.75} metalness={0.05} />
    </mesh>
  );
}

/* ─────────────────────────────────────────────
   GIFT BOX — scroll-reactive 3D scene
───────────────────────────────────────────── */
function GiftBox({ scrollY, heroHeight, isDark }) {
  const groupRef = useRef();
  const lidRef = useRef();
  const { clock } = useThree();

  const BW = 2.6, BH = 2.2, BD = 2.6;
  const LH = 0.32, LO = 0.1;
  const RW = 0.34, RT = 0.025;
  const LID_OPEN_ANGLE = -Math.PI * 0.75; // Opened wider like the screenshot

  const boxColor = isDark ? "#231a2e" : "#ffdad8";       // Rosewater tint
  const lidColor = isDark ? "#2e2240" : "#e8ddff";       // Lavender tint
  const ribbonColor = isDark ? "#ffb3b1" : "#9e3f42";    // Rosewater primary
  const shadowColor = isDark ? "#000000" : "#dcc0bf";    // Outline variant

  useFrame(() => {
    if (!groupRef.current || !lidRef.current) return;
    const t = clock.getElapsedTime();
    
    // 1. Continuous Idle Animation
    const idleFloat = Math.sin(t * 0.8) * 0.1;
    const idleRotate = t * 0.2; // Slow continuous rotation
    
    // 2. Scroll Interaction
    const raw = Math.min(scrollY.current / (heroHeight.current * 0.8), 1);
    const eased = raw < 0.5 ? 2 * raw * raw : -1 + (4 - 2 * raw) * raw;

    // Apply Idle + Scroll
    groupRef.current.position.y = -0.1 + idleFloat;
    groupRef.current.rotation.y = idleRotate + (eased * Math.PI * 0.6); // Rotates on scroll too
    
    // Lid opens on scroll
    lidRef.current.rotation.x = eased * LID_OPEN_ANGLE;
    
    // Subtle tilt on scroll
    groupRef.current.rotation.x = eased * 0.2;
  });

  return (
    <group ref={groupRef} position={[0.6, -0.1, 0]}>
      {/* Soft ground shadow ellipse */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -BH / 2 - 0.005, 0]}>
        <circleGeometry args={[2.4, 64]} />
        <meshBasicMaterial color={shadowColor} transparent opacity={isDark ? 0.8 : 0.55} depthWrite={false} />
      </mesh>

      {/* Box body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[BW, BH, BD]} />
        <meshStandardMaterial color={boxColor} roughness={0.6} metalness={0} />
      </mesh>

      {/* Ribbon — body faces */}
      {[
        [0, 0, BD / 2 + RT / 2, [RW, BH, RT]],
        [0, 0, -BD / 2 - RT / 2, [RW, BH, RT]],
        [BW / 2 + RT / 2, 0, 0, [RT, BH, RW]],
        [-BW / 2 - RT / 2, 0, 0, [RT, BH, RW]]
      ].map((pos, idx) => (
        <mesh key={idx} castShadow position={pos.slice(0, 3)}>
          <boxGeometry args={pos[3]} />
          <meshStandardMaterial color={ribbonColor} roughness={0.75} metalness={0.05} />
        </mesh>
      ))}

      {/* Lid group — pivots at base of lid */}
      <group ref={lidRef} position={[0, BH / 2, 0]}>
        <mesh castShadow position={[0, LH / 2, 0]}>
          <boxGeometry args={[BW + LO * 2, LH, BD + LO * 2]} />
          <meshStandardMaterial color={lidColor} roughness={0.5} metalness={0} />
        </mesh>

        {/* Lid ribbons */}
        <mesh position={[0, LH + RT / 2, 0]}>
          <boxGeometry args={[RW, RT, BD + LO * 2 + 0.02]} />
          <meshStandardMaterial color={ribbonColor} roughness={0.75} metalness={0.05} />
        </mesh>
        <mesh position={[0, LH + RT * 1.5, 0]}>
          <boxGeometry args={[BW + LO * 2 + 0.02, RT, RW]} />
          <meshStandardMaterial color={ribbonColor} roughness={0.75} metalness={0.05} />
        </mesh>

        <group position={[0, LH + 0.04, 0]}>
          <BowLoop side={1} color={ribbonColor} />
          <BowLoop side={-1} color={ribbonColor} />
        </group>

        <mesh position={[0, LH + 0.06, 0]} scale={[1.3, 0.75, 0.75]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color={ribbonColor} roughness={0.75} metalness={0.05} />
        </mesh>
      </group>
    </group>
  );
}

function Scene({ scrollY, heroHeight, isDark }) {
  return (
    <>
      <directionalLight
        position={[5, 10, 6]}
        intensity={isDark ? 2 : 3.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-5, 3, 4]} intensity={isDark ? 0.5 : 1.2} color={isDark ? "#2e2c28" : "#EEEAE0"} />
      <ambientLight intensity={isDark ? 0.5 : 1.8} color={isDark ? "#1a1814" : "#F0EBE0"} />
      <GiftBox scrollY={scrollY} heroHeight={heroHeight} isDark={isDark} />
    </>
  );
}

/* ─────────────────────────────────────────────
   HOME PAGE
───────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const scrollY = useRef(0);
  const heroH = useRef(640);
  const heroRef = useRef(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    const onScroll = () => { scrollY.current = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });
    
    const els = document.querySelectorAll('.kl-reveal');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('kl-visible'); });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));

    if (heroRef.current) heroH.current = heroRef.current.offsetHeight;

    return () => {
      window.removeEventListener('scroll', onScroll);
      io.disconnect();
    };
  }, []);

  const PRODUCTS = [
    { img: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80&auto=format&fit=crop', cat: 'Fragrance', name: 'Aurora Eau de Parfum', price: '$128', desc: 'Rare alpine bergamot and sandalwood.' },
    { img: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600&q=80&auto=format&fit=crop', cat: 'Fragrance', name: 'Bloom Botanical Mist', price: '$66', desc: 'Spring cut flowers in a glass.' },
    { img: 'https://images.unsplash.com/photo-1612543070757-5e6b596cb030?w=600&q=80&auto=format&fit=crop', cat: 'Still', name: 'Ivory Sculpt Vase', price: '$142', desc: 'Cast concrete for the minimalist home.' },
    { img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80&auto=format&fit=crop', cat: 'Still', name: 'Onyx Farm Vessel', price: '$168', desc: 'Sculptural ceramic statement piece.' },
    { img: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&q=80&auto=format&fit=crop', cat: 'Home', name: 'Silk Cloud Throw', price: '$240', desc: 'Whisper-weight mulberry silk blend.' },
    { img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80&auto=format&fit=crop', cat: 'Wellness', name: 'Amber Hour Candle', price: '$64', desc: 'Slow-burn rich amber and clove.' },
  ];

  return (
    <div className="kl-root">
      <nav className="kl-nav">
        <Link to="/" className="kl-nav-logo">GiftKart</Link>
        <ul className="kl-nav-center">
          <li><Link to="/buyer-dashboard">Catalog</Link></li>
          <li><Link to="/gifting-ai" className="kl-gift-finder-link">Gift Finder</Link></li>
          <li><Link to="/">Home</Link></li>
        </ul>
        <div className="kl-nav-right">
          <button onClick={toggleTheme} className="kl-theme-toggle">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/cart" className="kl-cart-icon"><ShoppingBag size={18} /></Link>
          <button onClick={() => navigate('/login')} className="kl-signin-btn">
            <LogIn size={16} /> Sign In
          </button>
        </div>
      </nav>

      <section id="kl-hero" ref={heroRef} className="kl-hero">
        <div className="kl-canvas-wrap">
          <Canvas shadows camera={{ fov: 32, position: [0, 3.5, 8.5] }} gl={{ antialias: true, alpha: true, shadowMapType: THREE.PCFSoftShadowMap }}>
            <Scene scrollY={scrollY} heroHeight={heroH} isDark={isDark} />
          </Canvas>
        </div>
        <div className="kl-hero-text">
          <div className="kl-hero-eyebrow">Intelligent Gifting · Est. 2024</div>
          <h1 className="kl-hero-h1">
            The gift,<br />already <span className="kl-italic">in mind.</span>
          </h1>
          <p className="kl-hero-sub">
            A quiet boutique where a gentle AI listens, then suggests something they'll quietly love.
          </p>
          <div className="kl-hero-btns">
            <button className="btn btn-primary" onClick={() => navigate('/gifting-ai')}>
              <Sparkles size={16} /> Find a gift in 30 seconds
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/buyer-dashboard')}>
              Browse catalog <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <section id="kl-how" className="kl-how">
        <div className="container kl-how-inner">
          <div className="kl-reveal">
            <div className="kl-section-label">How it works</div>
            <h2 className="kl-section-title">Tell us about them.<br />We'll listen.</h2>
          </div>
          <div className="kl-how-steps">
            {[
              { num: '01', title: 'A few quiet questions', body: 'Occasion, budget, who they are, what they love.' },
              { num: '02', title: 'AI hand-picks 1–3 ideas', body: 'Real products, curated and considered, not random.', delay: '0.12s' },
              { num: '03', title: 'Wrapped & sent', body: 'Gift options arrive beautifully packaged, on time.', delay: '0.24s' }
            ].map(step => (
              <div key={step.num} className="kl-reveal" style={{ transitionDelay: step.delay }}>
                <div className="kl-step-num">{step.num}</div>
                <div className="kl-step-title">{step.title}</div>
                <p className="kl-step-body">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="kl-catalog" className="kl-catalog">
        <div className="container">
          <div className="kl-catalog-header kl-reveal">
            <div>
              <div className="kl-cat-label">Carefully · Made</div>
              <h2 className="kl-catalog-title">A curated edit.</h2>
            </div>
            <Link to="/buyer-dashboard" className="kl-see-all">See all <ArrowRight size={14} /></Link>
          </div>
          <div className="kl-products-grid">
            {PRODUCTS.map((p, i) => (
              <div key={i} className="kl-product-card kl-reveal" style={{ transitionDelay: `${(i % 3) * 0.1}s` }} onClick={() => navigate('/buyer-dashboard')}>
                <div className="kl-product-img-wrap"><img src={p.img} alt={p.name} loading="lazy" /></div>
                <div className="kl-product-cat">{p.cat}</div>
                <div className="kl-product-row">
                  <div className="kl-product-name">{p.name}</div>
                  <div className="kl-product-price">{p.price}</div>
                </div>
                <p className="kl-product-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="kl-cta" className="kl-cta">
        <div className="container kl-reveal">
          <span className="kl-sparkle">✦</span>
          <h2 className="kl-cta-title">Not sure where to begin?<br />Let GiftKart think for you.</h2>
          <p className="kl-cta-sub">A 30-second conversation, then three thoughtful ideas.</p>
          <button className="btn btn-primary" onClick={() => navigate('/gifting-ai')}>Open the gift finder</button>
        </div>
      </section>

      <AnimatedTestimonials />

      <Footer />
    </div>
  );
}
