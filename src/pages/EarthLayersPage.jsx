import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Info, Mountain, RefreshCw } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { earthLayersData } from '../data/earthLayersData';
import InstructionsModal from '../components/common/InstructionsModal';

// --- 3D Components ---

const EarthSlice = ({ layer, isHovered, onHover, onClick, active }) => {
  const meshRef = useRef();

  // We scale the radii down so it fits nicely
  // Radii go from 40 to 400. Let's divide by 10.
  const radius = layer.radius / 15;
  const isAtmosphere = layer.radius > 200;
  
  // Create a staggered "stair-step" cutaway view
  const phiStart = 0;
  let phiLength = Math.PI * 2; // Full sphere by default
  
  if (!isAtmosphere) {
      if (layer.id === 'crust') phiLength = Math.PI * 1.2;
      else if (layer.id === 'mantle') phiLength = Math.PI * 1.45;
      else if (layer.id === 'outer-core') phiLength = Math.PI * 1.7;
      else if (layer.id === 'inner-core') phiLength = Math.PI * 2.0;
  }

  // Visual tweaks based on layer
  const isCore = layer.id.includes('core');
  
  return (
    <mesh 
      ref={meshRef}
      onPointerOver={(e) => { e.stopPropagation(); onHover(layer); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { document.body.style.cursor = 'auto'; }}
      onClick={(e) => { e.stopPropagation(); onClick(layer); }}
    >
      <sphereGeometry args={[radius, 64, 64, phiStart, phiLength]} />
      
      {isCore ? (
         // Core emits light and is very bright
         <meshStandardMaterial 
            color={layer.color} 
            emissive={layer.color}
            emissiveIntensity={isHovered || active ? 0.8 : 0.4}
            side={THREE.DoubleSide}
         />
      ) : isAtmosphere ? (
         // Atmosphere is transparent and ghostly
         <meshStandardMaterial 
            color={layer.color} 
            transparent 
            opacity={isHovered || active ? 0.4 : 0.1}
            side={THREE.DoubleSide}
            depthWrite={false}
         />
      ) : (
         // Crust and Mantle
         <meshStandardMaterial 
            color={layer.color} 
            roughness={0.8}
            metalness={0.1}
            side={THREE.DoubleSide}
            emissive={isHovered || active ? layer.color : '#000000'}
            emissiveIntensity={isHovered || active ? 0.2 : 0}
         />
      )}

      {/* Label for the cut face */}
      {(isHovered || active) && !isAtmosphere && (
          <Html position={[radius + 0.5, 0, 0]} center>
              <div style={{
                  color: layer.color,
                  fontWeight: 'bold',
                  textShadow: '0 0 5px black',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  fontSize: '0.85rem',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: `1px solid ${layer.color}55`
              }}>
                  {layer.name}
              </div>
          </Html>
      )}
    </mesh>
  );
};

const EarthModel = ({ activeLayer, setActiveLayer, hoveredLayer, setHoveredLayer }) => {
  const groupRef = useRef();
  
  useFrame(() => {
    // Slowly rotate the whole earth cutaway
    groupRef.current.rotation.y += 0.002;
    groupRef.current.rotation.x = 0.2; // slight tilt
  });

  // Reverse so outer layers render first (better for transparency)
  const layers = [...earthLayersData].reverse();

  return (
    <group ref={groupRef}>
      {/* Light coming from the core */}
      <pointLight color="#fef08a" intensity={2} distance={30} decay={1.5} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 10]} intensity={1} />

      {layers.map((layer) => (
         <EarthSlice 
            key={layer.id} 
            layer={layer} 
            isHovered={hoveredLayer?.id === layer.id}
            active={activeLayer?.id === layer.id}
            onHover={setHoveredLayer}
            onClick={setActiveLayer}
         />
      ))}
    </group>
  );
};

// --- Main Page Component ---

const EarthLayersPage = () => {
  const [hoveredLayer, setHoveredLayer] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState(earthLayersData[3]); // Default Crust
  const [showInstructions, setShowInstructions] = useState(false);

  const activeLayer = hoveredLayer || selectedLayer;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#020617' }}>
      
      {/* Header Overlay */}
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
        >
            ← Volver
        </Link>
        
        <h1 style={{ color: 'white', margin: 0, fontSize: '1.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mountain color="#65a30d" /> Capas de la Tierra 3D
        </h1>
        
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
      </header>

      {/* Split layout: 3D Canvas on the left, UI Panel on the right */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', marginTop: '60px' }}>
          
          {/* 3D Canvas */}
          <div style={{ flex: 1, position: 'relative' }}>
              <Canvas camera={{ position: [0, 0, 35], fov: 45 }}>
                 <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
                 
                 <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                    <EarthModel 
                        activeLayer={selectedLayer} 
                        setActiveLayer={setSelectedLayer}
                        hoveredLayer={hoveredLayer}
                        setHoveredLayer={setHoveredLayer}
                    />
                 </Float>

                 <OrbitControls 
                     enablePan={false}
                     enableZoom={true}
                     enableRotate={true}
                     minDistance={5}
                     maxDistance={60}
                     autoRotate={false}
                 />
              </Canvas>
          </div>

          {/* Info Panel (Overlay on right side) */}
          <div style={{
              position: 'absolute',
              right: '40px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${activeLayer.color}55`,
              borderRadius: '24px',
              padding: '30px',
              width: '400px',
              boxShadow: `0 20px 40px rgba(0,0,0,0.5), 0 0 30px ${activeLayer.color}22`,
              transition: 'border-color 0.3s, box-shadow 0.3s',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column'
          }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <div style={{ 
                      width: '24px', height: '24px', 
                      backgroundColor: activeLayer.id === 'exosphere' ? 'transparent' : activeLayer.color,
                      border: activeLayer.id === 'exosphere' ? '2px dashed white' : 'none',
                      borderRadius: '50%',
                      boxShadow: `0 0 10px ${activeLayer.color}`
                  }} />
                  <h2 style={{ fontSize: '1.8rem', margin: 0, color: 'white' }}>{activeLayer.name}</h2>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '30px', flex: 1 }}>
                  {activeLayer.description}
              </p>

              <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '15px', 
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.05)'
              }}>
                  <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Profundidad</span>
                      <strong style={{ color: 'white', fontSize: '1rem' }}>{activeLayer.depth}</strong>
                  </div>
                  <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Grosor</span>
                      <strong style={{ color: 'white', fontSize: '1rem' }}>{activeLayer.thickness}</strong>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Temperatura</span>
                      <strong style={{ color: '#fb923c', fontSize: '1rem' }}>{activeLayer.temperature}</strong>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Composición</span>
                      <strong style={{ color: 'white', fontSize: '0.95rem' }}>{activeLayer.composition}</strong>
                  </div>
              </div>
          </div>
      </div>

      {showInstructions && (
        <InstructionsModal
          title="Explorador 3D de Capas Terrestres"
          instructions={[
            "Ahora estás viendo la Tierra en 3D con un corte transversal interactivo.",
            "Pasa el ratón sobre las diferentes capas y atmósferas para resaltarlas.",
            "Haz clic y arrastra para rotar la cámara. Usa la rueda del ratón para hacer zoom hacia el núcleo ardiente.",
            "A la derecha podrás ver los datos detallados de cada capa seleccionada."
          ]}
          onClose={() => setShowInstructions(false)}
        />
      )}
    </div>
  );
};

export default EarthLayersPage;
