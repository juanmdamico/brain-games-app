import React, { useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Info, X, Orbit } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { solarSystemData } from '../data/solarSystemData';
import InstructionsModal from '../components/common/InstructionsModal';

// --- 3D Components ---

const OrbitLine = ({ radius }) => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.05, radius + 0.05, 64]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.15} side={THREE.DoubleSide} />
    </mesh>
  );
};

const Sun = ({ data, onClick }) => {
  const meshRef = useRef();
  
  useFrame(() => {
    meshRef.current.rotation.y += 0.002; // Sun rotates slowly
  });

  const radius = data.size / 15;

  return (
    <mesh 
      ref={meshRef} 
      onClick={(e) => { e.stopPropagation(); onClick(data); }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { document.body.style.cursor = 'auto'; }}
    >
      <sphereGeometry args={[radius, 32, 32]} />
      {/* MeshBasicMaterial is unlit, perfect for a glowing sun */}
      <meshBasicMaterial color={data.color} />
      {/* PointLight emits light from the sun to the planets */}
      <pointLight color={"#ffffff"} intensity={2.5} distance={300} decay={1.5} />
    </mesh>
  );
};

const Planet = ({ data, onClick, isPaused }) => {
  const meshRef = useRef();
  
  // Random starting position so they don't all align in a straight line
  const randomStartAngle = useMemo(() => Math.random() * Math.PI * 2, []);
  const currentAngle = useRef(randomStartAngle);
  
  const orbitRadius = data.orbitSize / 15; 
  const planetRadius = data.size / 15;
  
  useFrame((state, delta) => {
    if (!isPaused) {
      // Speed calculation based on orbitSpeed
      const speed = (2 * Math.PI) / (data.orbitSpeed * 3);
      currentAngle.current += speed * delta;
      
      meshRef.current.position.x = Math.cos(currentAngle.current) * orbitRadius;
      meshRef.current.position.z = Math.sin(currentAngle.current) * orbitRadius;
    }
    // Planet always rotates on its axis
    meshRef.current.rotation.y += 0.02;
  });

  // Calculate initial position to avoid popping
  const startX = Math.cos(randomStartAngle) * orbitRadius;
  const startZ = Math.sin(randomStartAngle) * orbitRadius;

  return (
    <group>
      <OrbitLine radius={orbitRadius} />
      <mesh 
        ref={meshRef} 
        position={[startX, 0, startZ]} 
        onClick={(e) => { e.stopPropagation(); onClick(data); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[planetRadius, 32, 32]} />
        {/* Standard material reacts to the point light from the sun! */}
        <meshStandardMaterial color={data.color} roughness={0.6} metalness={0.1} />
        
        {/* Saturn's Rings */}
        {data.hasRings && (
          <mesh rotation={[-Math.PI / 2 + 0.3, 0, 0]}>
            <ringGeometry args={[planetRadius * 1.4, planetRadius * 2.4, 64]} />
            <meshStandardMaterial color={data.color} transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
        )}
        
        {/* Planet Name Label */}
        <Html distanceFactor={15} center>
           <div style={{ 
               color: 'white', 
               fontSize: '0.85rem', 
               pointerEvents: 'none', 
               transform: 'translate3d(0, -30px, 0)', 
               opacity: 0.8,
               textShadow: '0 0 5px black'
           }}>
             {data.name}
           </div>
        </Html>
      </mesh>
    </group>
  );
};

// --- Main Page Component ---

const SolarSystemPage = () => {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handlePlanetClick = (planet) => {
    setSelectedPlanet(planet);
    setIsPaused(true); // Auto-pause when opening info
  };

  const closePlanetModal = () => {
    setSelectedPlanet(null);
    setIsPaused(false);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#000' }}>
      
      {/* Header Overlay (UI) */}
      <header style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          padding: '20px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)'
      }}>
        <Link 
            to="/" 
            style={{ 
                color: 'var(--text-muted)', 
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 600,
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(5px)'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = 'var(--text-muted)';
            }}
        >
            ← Volver
        </Link>
        
        <h1 style={{ color: 'white', margin: 0, fontSize: '1.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Orbit color="#fbbf24" /> Sistema Solar 3D
        </h1>
        
        <div style={{ display: 'flex', gap: '15px' }}>
            <button 
                onClick={() => setIsPaused(!isPaused)}
                style={{ 
                    background: isPaused ? 'rgba(255,0,0,0.2)' : 'rgba(255,255,255,0.05)', 
                    border: isPaused ? '1px solid rgba(255,0,0,0.5)' : '1px solid transparent', 
                    color: 'white', 
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backdropFilter: 'blur(5px)',
                    fontWeight: 'bold'
                }}
            >
                {isPaused ? 'Reanudar' : 'Pausar'} Órbitas
            </button>
            <button 
                onClick={() => setShowInstructions(true)}
                style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    border: 'none', 
                    color: 'white', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px',
                    borderRadius: '50%',
                    backdropFilter: 'blur(5px)'
                }}
            >
                <Info size={24} />
            </button>
        </div>
      </header>

      {/* Main Content Area - 3D Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
          <Canvas camera={{ position: [0, 30, 60], fov: 45 }}>
             <ambientLight intensity={0.1} /> {/* Dim ambient light so the dark sides of planets aren't pitch black */}
             
             {/* 3D Stars Background */}
             <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
             
             {/* Sun */}
             <Sun data={solarSystemData[0]} onClick={handlePlanetClick} />
             
             {/* Planets */}
             {solarSystemData.slice(1).map((planet) => (
                 <Planet key={planet.id} data={planet} onClick={handlePlanetClick} isPaused={isPaused} />
             ))}

             {/* Camera Controls */}
             <OrbitControls 
                 enablePan={true}
                 enableZoom={true}
                 enableRotate={true}
                 minDistance={10}
                 maxDistance={150}
                 autoRotate={!isPaused && !selectedPlanet}
                 autoRotateSpeed={0.5}
             />
          </Canvas>
      </div>

      {/* Planet Info Modal (2D HTML Overlay) */}
      {selectedPlanet && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
          }} onClick={closePlanetModal}>
            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '30px',
                maxWidth: '500px',
                width: '90%',
                position: 'relative',
                boxShadow: `0 20px 40px rgba(0,0,0,0.4), 0 0 30px ${selectedPlanet.color}22`,
                animation: 'modalSlideIn 0.3s ease-out'
            }} onClick={e => e.stopPropagation()}>
                
                <button onClick={closePlanetModal} style={{
                    position: 'absolute', top: '20px', right: '20px',
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', padding: '5px'
                }}>
                    <X size={24} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                    <div style={{
                        width: '80px', height: '80px',
                        backgroundColor: selectedPlanet.color,
                        borderRadius: '50%',
                        boxShadow: `inset -10px -10px 20px rgba(0,0,0,0.5), 0 0 20px ${selectedPlanet.color}AA`,
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {selectedPlanet.hasRings && (
                            <div style={{
                                position: 'absolute',
                                width: '160%',
                                height: '30%',
                                border: `4px solid rgba(255,255,255,0.4)`,
                                borderRadius: '50%',
                                transform: 'rotate(20deg)'
                            }}/>
                        )}
                    </div>
                    
                    <div>
                        <h2 style={{ color: 'white', fontSize: '2.2rem', margin: '0 0 5px 0', textShadow: `0 0 10px ${selectedPlanet.color}88` }}>{selectedPlanet.name}</h2>
                        <div style={{ 
                            display: 'inline-block', padding: '4px 10px', 
                            backgroundColor: `${selectedPlanet.color}22`, color: selectedPlanet.color, 
                            borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', border: `1px solid ${selectedPlanet.color}44`
                        }}>
                            {selectedPlanet.type}
                        </div>
                    </div>
                </div>

                <div style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '1.05rem', marginBottom: '25px' }}>
                    <p>{selectedPlanet.description}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Distancia al Sol</span>
                        <strong style={{ color: 'white' }}>{selectedPlanet.distance}</strong>
                    </div>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Gravedad</span>
                        <strong style={{ color: 'white' }}>{selectedPlanet.gravity}</strong>
                    </div>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Temperatura</span>
                        <strong style={{ color: 'white' }}>{selectedPlanet.temperature}</strong>
                    </div>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Lunas</span>
                        <strong style={{ color: 'white' }}>{selectedPlanet.moons}</strong>
                    </div>
                </div>
            </div>
          </div>
      )}

      {showInstructions && (
        <InstructionsModal
          title="Sistema Solar 3D"
          instructions={[
            "Estás en un entorno 3D completo. Usa la rueda del ratón para hacer zoom in y zoom out.",
            "Haz clic y arrastra el fondo para rotar la cámara y ver el sistema desde arriba, desde abajo o de lado.",
            "Haz clic en un planeta o en el Sol para ver sus características.",
            "Nota cómo el Sol ilumina la cara de los planetas, mientras la otra mitad está en la oscuridad (noche)."
          ]}
          onClose={() => setShowInstructions(false)}
        />
      )}
    </div>
  );
};

export default SolarSystemPage;
