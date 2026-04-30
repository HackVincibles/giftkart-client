import React, { useEffect, useRef, useState } from "react";

const COLORS = [
  "#a78bfa","#818cf8","#c4b5fd","#f0abfc","#38bdf8",
  "#fb7185","#fbbf24","#34d399","#f472b6","#e879f9","#67e8f9","#fde68a"
];

const CSS = `
@keyframes gb-floatIdle {
  0%,100% { transform: translateY(0px) rotate(-2deg); }
  50%      { transform: translateY(-16px) rotate(2deg); }
}
@keyframes gb-spinUp {
  0%   { transform: rotate(0deg) scale(1); }
  100% { transform: rotate(1440deg) scale(1.18); }
}
@keyframes gb-shakeRattle {
  0%,100% { transform: rotate(1440deg) scale(1.18) translate(0,0); }
  20%     { transform: rotate(1440deg) scale(1.18) translate(-4px,2px); }
  40%     { transform: rotate(1440deg) scale(1.18) translate(4px,-3px); }
  60%     { transform: rotate(1440deg) scale(1.18) translate(-3px,4px); }
  80%     { transform: rotate(1440deg) scale(1.18) translate(3px,-2px); }
}
@keyframes gb-boomOut {
  0%   { transform: rotate(1440deg) scale(1.18); opacity:1; filter:brightness(1); }
  30%  { transform: rotate(1480deg) scale(2.2);  opacity:1; filter:brightness(3) saturate(2); }
  100% { transform: rotate(1520deg) scale(0);    opacity:0; filter:brightness(6); }
}
@keyframes gb-flyP {
  0%   { opacity:1; transform: translate(0,0) rotate(0deg) scale(1); }
  100% { opacity:0; transform: translate(var(--tx),var(--ty)) rotate(var(--rot)) scale(.1); }
}
@keyframes gb-rainbowRing {
  0%   { transform: scale(0); opacity:1; }
  100% { transform: scale(5); opacity:0; }
}
@keyframes gb-popIn {
  0%   { opacity:0; transform: scale(.3) translateY(30px); }
  55%  { transform: scale(1.12) translateY(-6px); }
  100% { opacity:1; transform: scale(1) translateY(0); }
}
@keyframes gb-orbitGlow {
  0%   { transform: rotate(0deg)   translateX(90px); opacity:.9; }
  100% { transform: rotate(360deg) translateX(90px); opacity:.9; }
}
@keyframes gb-flash {
  0%,100% { opacity:0; }
  40%     { opacity:.8; }
}
@keyframes gb-lidBounce {
  0%   { transform: rotate(-20deg) translate(-5px,-16px); }
  30%  { transform: rotate(-28deg) translate(-8px,-22px); }
  60%  { transform: rotate(-18deg) translate(-4px,-14px); }
  100% { transform: rotate(-20deg) translate(-5px,-16px); }
}
`;

function injectCSS() {
  if (document.getElementById("gb-styles")) return;
  const s = document.createElement("style");
  s.id = "gb-styles";
  s.textContent = CSS;
  document.head.appendChild(s);
}

function Particle({ angle, dist, color, size, isRect, delay, dur }) {
  const rad = (angle * Math.PI) / 180;
  const tx = Math.cos(rad) * dist;
  const ty = Math.sin(rad) * dist;
  const rot = (Math.random() - 0.5) * 900;
  return (
    <div style={{
      position:"absolute", left:"50%", top:"50%",
      width:size, height:isRect ? size * 0.4 : size,
      borderRadius: isRect ? 2 : "50%",
      background: color,
      boxShadow: `0 0 8px ${color}, 0 0 16px ${color}`,
      "--tx": `${tx}px`, "--ty": `${ty}px`, "--rot": `${rot}deg`,
      animation: `gb-flyP ${dur}s cubic-bezier(.15,.5,.3,1) ${delay}s forwards`,
      pointerEvents:"none", zIndex:15,
    }} />
  );
}

function Ring({ color, size, delay }) {
  return (
    <div style={{
      position:"absolute", left:"50%", top:"50%",
      width:size, height:size,
      marginLeft:-size/2, marginTop:-size/2,
      borderRadius:"50%", border:`3px solid ${color}`,
      boxShadow:`0 0 12px ${color}, 0 0 24px ${color}`,
      animation:`gb-rainbowRing .8s ease-out ${delay}s forwards`,
      pointerEvents:"none", zIndex:14,
    }} />
  );
}

function OrbitOrb({ color, delay, dur }) {
  return (
    <div style={{
      position:"absolute", left:"50%", top:"50%",
      width:12, height:12, marginLeft:-6, marginTop:-6,
      borderRadius:"50%", background:color,
      boxShadow:`0 0 10px ${color}, 0 0 20px ${color}`,
      animation:`gb-orbitGlow ${dur}s linear ${delay}s infinite`,
      pointerEvents:"none",
    }} />
  );
}

const GiftBoxAnimation = ({ onComplete }) => {
  const [phase, setPhase] = useState("idle");
  const [particles, setParticles] = useState([]);
  const [rings, setRings]         = useState([]);
  const [orbits, setOrbits]       = useState([]);
  const [showFlash, setShowFlash] = useState(false);
  const timers = useRef([]);

  useEffect(() => {
    injectCSS();
    startSequence();
    return () => timers.current.forEach(clearTimeout);
  }, []);

  function after(ms, fn) {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  }

  function startSequence() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase("floating");
    setParticles([]);
    setRings([]);
    setOrbits([]);
    setShowFlash(false);

    after(900,  () => setPhase("lidOpen"));
    after(1550, () => setPhase("lidBounce"));
    after(2300, () => setPhase("lidClose"));
    after(2700, () => {
      setPhase("spinning");
      setOrbits(["#a78bfa","#f0abfc","#38bdf8","#fbbf24"].map((c, i) => ({
        id:i, color:c, delay:i*.2, dur:.8
      })));
    });
    after(4300, () => {
      setPhase("rattling");
      setOrbits([]);
    });
    after(4700, () => {
      setPhase("boom");
      setShowFlash(true);
      setRings(["#a78bfa","#f0abfc","#38bdf8","#fbbf24","#fb7185"].map((c,i) => ({
        id:i, color:c, size:60+i*30, delay:i*.07
      })));
      const ps = Array.from({length:90}, (_,i) => ({
        id:i,
        angle:(i/90)*360 + Math.random()*(360/90),
        dist:80+Math.random()*150,
        color:COLORS[Math.floor(Math.random()*COLORS.length)],
        size:5+Math.random()*12,
        isRect:Math.random()>.4,
        delay:Math.random()*.4,
        dur:.7+Math.random()*.5,
      }));
      setParticles(ps);
      after(350, () => setShowFlash(false));
    });
    after(5200, () => {
      setPhase("confirmed");
      // REMOVED AUTO-COMPLETE to let the user see the success screen
    });
  }

  const boxStyle = {
    floating:  { animation:"gb-floatIdle 3s ease-in-out infinite" },
    lidOpen:   { animation:"gb-floatIdle 3s ease-in-out infinite" },
    lidBounce: { animation:"gb-floatIdle 3s ease-in-out infinite" },
    lidClose:  { animation:"gb-floatIdle 3s ease-in-out infinite" },
    spinning:  { animation:"gb-spinUp 1.6s cubic-bezier(.4,0,.2,1) forwards" },
    rattling:  { animation:"gb-shakeRattle .15s ease-in-out infinite" },
    boom:      { animation:"gb-boomOut .45s cubic-bezier(.36,.07,.19,.97) forwards" },
  }[phase] || {};

  const svgFilter = {
    floating:  "drop-shadow(0 0 28px rgba(99,102,241,.75))",
    lidOpen:   "drop-shadow(0 0 36px rgba(99,102,241,.8))",
    lidBounce: "drop-shadow(0 0 40px rgba(167,139,250,.9))",
    lidClose:  "drop-shadow(0 0 44px rgba(167,139,250,1))",
    spinning:  "drop-shadow(0 0 60px rgba(167,139,250,1)) drop-shadow(0 0 100px rgba(99,102,241,.8)) brightness(1.4)",
    rattling:  "drop-shadow(0 0 80px #a78bfa) drop-shadow(0 0 120px #6366f1) brightness(1.9)",
    boom:      "drop-shadow(0 0 100px #fff) brightness(4)",
  }[phase] || "drop-shadow(0 0 28px rgba(99,102,241,.75))";

  const glowOpacity = { lidOpen:.6, lidBounce:.7, lidClose:1, spinning:1, rattling:1 }[phase] ?? 0;

  const lidStyle = {
    lidOpen:   { transformOrigin:"100px 112px", transform:"rotate(-20deg) translate(-5px,-16px)", transition:"transform .6s cubic-bezier(.34,1.56,.64,1)" },
    lidBounce: { transformOrigin:"100px 112px", animation:"gb-lidBounce .4s ease-in-out infinite" },
    lidClose:  { transformOrigin:"100px 112px", transform:"rotate(0deg)", transition:"transform .5s cubic-bezier(.34,1.56,.64,1)" },
  }[phase] || { transformOrigin:"100px 112px", transform:"rotate(0deg)", transition:"transform .5s" };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.95)", backdropFilter:"blur(20px)" }}>
      <div style={{ position:"relative", width:320, height:320, display:"flex", alignItems:"center", justifyContent:"center" }}>
        {showFlash && (
          <div style={{ position:"absolute", inset:-80, background:"#fff", animation:"gb-flash .35s ease-out forwards", borderRadius:"50%", zIndex:50, pointerEvents:"none" }} />
        )}
        <div style={{ position:"absolute", width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle,rgba(251, 191, 36, 0.6) 0%,transparent 70%)", opacity:glowOpacity, transition:"opacity .3s", pointerEvents:"none", zIndex:2 }} />
        {orbits.map(o => <OrbitOrb key={o.id} {...o} />)}
        {rings.map(r => <Ring key={r.id} {...r} />)}
        {particles.map(p => <Particle key={p.id} {...p} />)}
        {phase !== "confirmed" && (
          <div style={{ position:"relative", zIndex:5, ...boxStyle }}>
            <svg viewBox="0 0 200 200" width={240} height={240} xmlns="http://www.w3.org/2000/svg" style={{ display:"block", filter:svgFilter, transition:"filter .3s" }}>
              <defs>
                <linearGradient id="gb-bG" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24"/><stop offset="45%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#d97706"/>
                </linearGradient>
                <linearGradient id="gb-sG" x1="0%" y1="0%" x2="60%" y2="100%">
                  <stop offset="0%" stopColor="#fff" stopOpacity=".3"/><stop offset="100%" stopColor="#fff" stopOpacity=".05"/>
                </linearGradient>
              </defs>
              <rect x="52" y="110" width="100" height="72" rx="6" fill="url(#gb-bG)"/>
              <rect x="52" y="110" width="44"  height="72" rx="4" fill="url(#gb-sG)" opacity=".5"/>
              <g style={lidStyle}>
                <rect x="46"  y="96"  width="112" height="20" rx="6" fill="url(#gb-bG)"/>
                <rect x="46"  y="96"  width="112" height="4"  rx="2" fill="#fff" opacity=".3"/>
                <path d="M93 98 Q84 108 80 104 Q82 96 93 94Z" fill="#fff" opacity=".4"/>
                <path d="M109 98 Q118 108 122 104 Q120 96 109 94Z" fill="#fff" opacity=".4"/>
              </g>
            </svg>
          </div>
        )}
        {phase === "confirmed" && (
           <div style={{ position:"absolute", display:"flex", flexDirection:"column", alignItems:"center", gap:15, zIndex:20, animation:"gb-popIn .6s cubic-bezier(.34,1.56,.64,1) forwards" }}>
             <div style={{ width:84, height:84, borderRadius:"50%", background:"linear-gradient(135deg,#fbbf24,#d97706)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:42, color:"#000", boxShadow:"0 0 60px rgba(251,191,36,0.6), 0 0 120px rgba(251,191,36,0.2)" }}>✓</div>
             <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:28, fontWeight:900, color:"#fff", letterSpacing:"1px", textShadow:"0 0 20px rgba(255,255,255,0.2)" }}>MASTERPIECE MINTED</div>
                <div style={{ fontSize:14, color:"#fbbf24", fontWeight:600, marginTop:5 }}>Syncing with Artisan Cloud...</div>
             </div>
             <div style={{ display:"flex", gap:10, marginTop:10 }}>
                <button 
                    onClick={onComplete} 
                    style={{ 
                        padding:"12px 32px", 
                        borderRadius:14, 
                        border:"1px solid #fbbf24", 
                        background:"#fbbf24", 
                        color:"#000", 
                        fontSize:14, 
                        fontWeight:900,
                        cursor:"pointer",
                        boxShadow:"0 10px 20px rgba(251,191,36,0.2)",
                        transition:"all 0.3s"
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                    RETURN TO WORKBENCH
                </button>
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default GiftBoxAnimation;
