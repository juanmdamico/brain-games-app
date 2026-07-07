import React, { useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Info, Globe2 } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { worldAtlasData } from '../data/worldAtlasData';
import InstructionsModal from '../components/common/InstructionsModal';

// Math function to convert Lat/Lng to 3D Cartesian coordinates
const latLngToVector3 = (lat, lng, radius) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));
    
    return new THREE.Vector3(x, y, z);
};

const Marker = ({ data, radius, onClick, isHovered, onHover }) => {
    const pos = useMemo(() => latLngToVector3(data.lat, data.lng, radius), [data, radius]);
    const meshRef = useRef();

    useFrame((state) => {
        // Make markers throb/pulse
        const scale = 1 + Math.sin(state.clock.elapsedTime * 5 + data.lat) * 0.2;
        meshRef.current.scale.set(scale, scale, scale);
    });

    return (
        <group position={pos}>
            {/* The pin itself */}
            <mesh 
                ref={meshRef}
                onClick={(e) => { e.stopPropagation(); onClick(data); }}
                onPointerOver={(e) => { e.stopPropagation(); onHover(data.id); document.body.style.cursor = 'pointer'; }}
                onPointerOut={(e) => { onHover(null); document.body.style.cursor = 'auto'; }}
            >
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={isHovered ? 1 : 0.5} />
            </mesh>

            {/* Glowing aura */}
            <mesh>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshBasicMaterial color={data.color} transparent opacity={isHovered ? 0.4 : 0.1} />
            </mesh>

            {isHovered && (
                <Html position={[0, 1, 0]} center zIndexRange={[100, 0]}>
                    <div style={{
                        background: 'rgba(0,0,0,0.8)', color: 'white', padding: '5px 10px',
                        borderRadius: '6px', fontSize: '0.8rem', pointerEvents: 'none',
                        border: `1px solid ${data.color}`, whiteSpace: 'nowrap'
                    }}>
                        {data.name}
                    </div>
                </Html>
            )}
        </group>
    );
};

const Globe = ({ setActiveLocation, hoveredId, setHoveredId }) => {
    const globeRadius = 10;
    const groupRef = useRef();

    useFrame(() => {
        groupRef.current.rotation.y += 0.0005; // Slow rotation
    });

    return (
        <group ref={groupRef}>
            {/* The Earth Sphere */}
            <mesh>
                <sphereGeometry args={[globeRadius, 64, 64]} />
                {/* Stylized dark blue Earth */}
                <meshStandardMaterial 
                    color="#0f172a" 
                    roughness={0.7} 
                    metalness={0.2} 
                    emissive="#1e3a8a" 
                    emissiveIntensity={0.2}
                    wireframe={true} // Gives it a very cool digital hologram vibe
                />
            </mesh>

            {/* Inner solid sphere to block seeing through to the other side */}
            <mesh>
                <sphereGeometry args={[globeRadius - 0.1, 32, 32]} />
                <meshBasicMaterial color="#020617" />
            </mesh>

            {worldAtlasData.map(loc => (
                <Marker 
                    key={loc.id} 
                    data={loc} 
                    radius={globeRadius} 
                    onClick={setActiveLocation}
                    isHovered={hoveredId === loc.id}
                    onHover={setHoveredId}
                />
            ))}
        </group>
    );
};

const WorldAtlasPage = () => {
  const [activeLocation, setActiveLocation] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#020617', color: 'white', overflow: 'hidden' }}>
      {/* Header */}
      <header style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)'
      }}>
        <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '8px' }}>
            ← Volver
        </Link>
        <h1 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe2 color="#3b82f6" /> Atlas Mundial 3D
        </h1>
        <button onClick={() => setShowInstructions(true)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}>
            <Info size={24} />
        </button>
      </header>

      {/* 3D Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
          <Canvas camera={{ position: [0, 0, 25], fov: 45 }}>
             <ambientLight intensity={0.5} />
             <directionalLight position={[10, 10, 10]} intensity={1} />
             <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
             
             <Globe 
                setActiveLocation={setActiveLocation} 
                hoveredId={hoveredId} 
                setHoveredId={setHoveredId} 
             />

             <OrbitControls enablePan={false} minDistance={12} maxDistance={40} />
          </Canvas>

          {/* Info Card Overlay */}
          {activeLocation && (
              <div style={{
                  position: 'absolute', bottom: '40px', right: '40px',
                  background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)',
                  border: `1px solid ${activeLocation.color}`, borderRadius: '16px',
                  padding: '25px', width: '350px',
                  boxShadow: `0 10px 30px rgba(0,0,0,0.5), 0 0 20px ${activeLocation.color}33`,
                  animation: 'fadeIn 0.3s ease-out'
              }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                      <h2 style={{ margin: 0, color: 'white', fontSize: '1.5rem' }}>{activeLocation.name}</h2>
                      <button onClick={() => setActiveLocation(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                  </div>
                  <div style={{ display: 'inline-block', background: `${activeLocation.color}33`, color: activeLocation.color, padding: '4px 10px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '15px' }}>
                      {activeLocation.country}
                  </div>
                  <p style={{ color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                      {activeLocation.description}
                  </p>
                  <div style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '15px' }}>
                      <span>Lat: {activeLocation.lat.toFixed(4)}°</span>
                      <span>Lng: {activeLocation.lng.toFixed(4)}°</span>
                  </div>
              </div>
          )}
      </div>

      {showInstructions && (
        <InstructionsModal
          title="Atlas Mundial 3D"
          instructions={[
            "Estás explorando un holograma interactivo de la Tierra.",
            "Haz clic y arrastra para rotar el globo terráqueo en cualquier dirección.",
            "Usa la rueda del ratón para acercarte (zoom in) o alejarte (zoom out).",
            "Haz clic en los marcadores brillantes para descubrir monumentos históricos y lugares famosos del mundo."
          ]}
          onClose={() => setShowInstructions(false)}
        />
      )}
    </div>
  );
};

export default WorldAtlasPage;
