import React, { Suspense, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Float, Environment, ContactShadows, useTexture, PerspectiveCamera } from '@react-three/drei';
import { Loader, Box, AlertTriangle } from 'lucide-react';
import * as THREE from 'three';

const GiftBox = ({ imageUrl }) => {
  // Use a fallback texture if the main one fails
  const fallbackUrl = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=200';
  
  // Safely load texture
  let texture;
  try {
    texture = useTexture(imageUrl || fallbackUrl);
    texture.encoding = THREE.sRGBEncoding;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  } catch (e) {
    console.error("3D Texture Error:", e);
  }

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <group>
        {/* Main Box Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial 
            color={texture ? "white" : "#8b5cf6"} 
            map={texture} 
            roughness={0.2} 
            metalness={0.1} 
          />
        </mesh>

        {/* Top Lid Effect */}
        <mesh position={[0, 1.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.95, 1.95]} />
          <meshStandardMaterial 
            map={texture} 
            transparent 
            opacity={0.8} 
            roughness={0} 
            metalness={0.5} 
          />
        </mesh>

        {/* Simple Ribbon Wraps */}
        <mesh position={[0, 0, 0]} scale={[0.15, 2.05, 2.05]}>
          <boxGeometry />
          <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0]} scale={[2.05, 0.15, 2.05]}>
          <boxGeometry />
          <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.2} />
        </mesh>
      </group>
    </Float>
  );
};

const Product3DPreview = ({ product }) => {
  const imageUrl = useMemo(() => {
    const img = product?.images?.[0]?.url;
    if (!img) return null;
    if (img.startsWith('http')) return img;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
    return `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`;
  }, [product]);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative', 
      background: '#0f172a', // Solid dark background to prevent "white screen" look
      borderRadius: '24px', 
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <Suspense fallback={
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
          <div style={{ textAlign: 'center' }}>
            <Loader className="animate-spin" color="#8b5cf6" size={32} />
            <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>PREPARING 3D VIEW...</p>
          </div>
        </div>
      }>
        <Canvas shadows gl={{ antialias: true, alpha: true }} camera={{ position: [4, 4, 4], fov: 40 }}>
          <color attach="background" args={['#0f172a']} />
          <fog attach="fog" args={['#0f172a', 5, 15]} />
          
          <ambientLight intensity={0.7} />
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={1} 
            castShadow 
            shadow-mapSize={[1024, 1024]} 
          />
          <pointLight position={[-5, 5, -5]} intensity={0.5} color="#8b5cf6" />
          
          <GiftBox imageUrl={imageUrl} />
          
          <Environment preset="night" />
          
          <OrbitControls 
            enableZoom={true} 
            autoRotate 
            autoRotateSpeed={1}
            maxDistance={10}
            minDistance={3}
          />
          
          <ContactShadows 
            position={[0, -1.2, 0]} 
            opacity={0.5} 
            scale={6} 
            blur={2} 
            far={3} 
          />
        </Canvas>
      </Suspense>

      {/* Control Overlay */}
      <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Box size={14} color="#8b5cf6" />
          <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>DRAG TO ROTATE • SCROLL TO ZOOM</span>
        </div>
      </div>

      <div style={{ position: 'absolute', top: '1rem', left: '1rem', pointerEvents: 'none' }}>
        <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '0.3rem 0.6rem', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
           <span style={{ color: '#a78bfa', fontSize: '0.6rem', fontWeight: '900', textTransform: 'uppercase' }}>Interactive 3D Preview</span>
        </div>
      </div>
    </div>
  );
};

export default Product3DPreview;
