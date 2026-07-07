import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Info, Hourglass } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Html, Float, Line } from '@react-three/drei';
import * as THREE from 'three';
import { timelineData } from '../data/timelineData';
import InstructionsModal from '../components/common/InstructionsModal';

// --- 3D Components ---

const SPACING = 25; // Distance between events on Z axis

const EventNode = ({ data, index, onClick, isHovered, onHover }) => {
  const meshRef = useRef();
  
  // Position events alternating left and right of the center path
  const xOffset = index % 2 === 0 ? 4 : -4;
  const zPos = -index * SPACING;

  // Floating animation
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = Math.sin(t * 2 + index) * 0.3;
    // Rotate the gem slightly
    meshRef.current.rotation.y += 0.01;
    meshRef.current.rotation.x += 0.005;
  });

  const formatYear = (year) => {
    if (year < 0) return `${Math.abs(year)} a.C.`;
    return `${year} d.C.`;
  };

  return (
    <group position={[xOffset, 0, zPos]}>
      {/* The 3D Object (A glowing crystal/monolith) */}
      <mesh 
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(data, zPos); }}
        onPointerOver={(e) => { e.stopPropagation(); onHover(data.id); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { onHover(null); document.body.style.cursor = 'auto'; }}
      >
        <octahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial 
            color={data.color} 
            emissive={data.color}
            emissiveIntensity={isHovered ? 0.8 : 0.2}
            roughness={0.2}
            metalness={0.8}
            wireframe={isHovered}
        />
        {/* Connection line to the center path */}
        <Line 
           points={[[0, 0, 0], [-xOffset, -2, 0]]} 
           color={data.color} 
           lineWidth={2}
           transparent
           opacity={0.5}
        />
      </mesh>

      {/* HTML Label floating next to it */}
      <Html position={[index % 2 === 0 ? 2 : -2, 0, 0]} center zIndexRange={[100, 0]}>
         <div style={{
             background: 'rgba(15, 23, 42, 0.8)',
             backdropFilter: 'blur(8px)',
             border: `1px solid ${data.color}55`,
             padding: '15px',
             borderRadius: '12px',
             width: '280px',
             color: 'white',
             pointerEvents: 'none',
             opacity: isHovered ? 1 : 0.6,
             transform: `scale(${isHovered ? 1.05 : 1})`,
             transition: 'all 0.3s ease',
             boxShadow: isHovered ? `0 0 20px ${data.color}44` : 'none',
             textAlign: index % 2 === 0 ? 'left' : 'right'
         }}>
             <div style={{ color: data.color, fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '5px' }}>
                 {formatYear(data.year)}
             </div>
             <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '8px' }}>
                 {data.title}
             </div>
             {isHovered && (
                 <div style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.5', animation: 'fadeIn 0.3s' }}>
                     {data.description}
                 </div>
             )}
         </div>
      </Html>
    </group>
  );
};

const TimeTunnel = ({ setHoveredId, hoveredId, handleEventClick }) => {
  // Generate the central path line points
  const linePoints = useMemo(() => {
    return [[0, -2, 5], [0, -2, -(timelineData.length) * SPACING]];
  }, []);

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1} />
      
      {/* Central Time Path */}
      <Line 
        points={linePoints} 
        color="#ffffff" 
        lineWidth={3} 
        dashed={true}
        dashSize={2}
        gapSize={1}
        transparent
        opacity={0.3}
      />

      {/* Events */}
      {timelineData.map((data, index) => (
         <EventNode 
            key={data.id} 
            data={data} 
            index={index} 
            onClick={handleEventClick}
            isHovered={hoveredId === data.id}
            onHover={setHoveredId}
         />
      ))}
    </group>
  );
};

// --- Camera Controller ---
const CameraController = ({ targetZ }) => {
  useFrame((state) => {
    // Smoothly interpolate camera position towards targetZ
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.05);
    // Keep camera slightly above the path
    state.camera.position.y = 2;
    state.camera.position.x = 0;
  });
  return null;
};


// --- Main Page Component ---

const TimelinePage = () => {
  const [hoveredId, setHoveredId] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [activeEvent, setActiveEvent] = useState(timelineData[0]);
  
  // Camera target Z position
  const [targetZ, setTargetZ] = useState(10); 
  const maxZ = 10;
  const minZ = -(timelineData.length - 1) * SPACING - 10;

  // Handle Wheel Scroll to move forward/backward in time
  useEffect(() => {
    const handleWheel = (e) => {
      // DeltaY > 0 means scrolling down (moving forward in time, which means negative Z)
      const scrollSpeed = 0.05;
      setTargetZ((prev) => {
          let newZ = prev - e.deltaY * scrollSpeed;
          // Clamp
          if (newZ > maxZ) newZ = maxZ;
          if (newZ < minZ) newZ = minZ;
          return newZ;
      });
      
      // Update the active event based on approximate Z position
      const currentIndex = Math.max(0, Math.min(timelineData.length - 1, Math.round(Math.abs(targetZ) / SPACING)));
      setActiveEvent(timelineData[currentIndex]);
    };

    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [targetZ, minZ]);

  const handleEventClick = (data, zPos) => {
    setActiveEvent(data);
    // Fly camera to just in front of the clicked event
    setTargetZ(zPos + 10);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const currentIndex = timelineData.findIndex(ev => ev.id === activeEvent.id);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          if (currentIndex < timelineData.length - 1) {
              const next = timelineData[currentIndex + 1];
              handleEventClick(next, -(currentIndex + 1) * SPACING);
          }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          if (currentIndex > 0) {
              const prev = timelineData[currentIndex - 1];
              handleEventClick(prev, -(currentIndex - 1) * SPACING);
          }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeEvent]);

  // Calculate progress percentage
  const progress = Math.min(100, Math.max(0, ((maxZ - targetZ) / (maxZ - minZ)) * 100));

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#020617', color: 'white' }}>
      
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
                display: 'flex', alignItems: 'center', gap: '5px',
                fontWeight: 600, padding: '8px 16px',
                background: 'rgba(255,255,255,0.05)', borderRadius: '8px',
                transition: 'all 0.2s ease', backdropFilter: 'blur(5px)'
            }}
        >
            ← Volver
        </Link>
        
        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Hourglass color="#0ea5e9" /> Línea de Tiempo 3D
        </h1>
        
        <button 
            onClick={() => setShowInstructions(true)}
            style={{ 
                background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', 
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '10px', borderRadius: '50%', backdropFilter: 'blur(5px)'
            }}
        >
            <Info size={24} />
        </button>
      </header>

      {/* 3D Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
          <Canvas camera={{ fov: 60 }}>
             <color attach="background" args={['#020617']} />
             {/* Deep space fog to hide far away events */}
             <fog attach="fog" args={['#020617', 10, 80]} />
             
             <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={2} />
             
             <TimeTunnel 
                setHoveredId={setHoveredId} 
                hoveredId={hoveredId} 
                handleEventClick={handleEventClick} 
             />

             <CameraController targetZ={targetZ} />
          </Canvas>

          {/* Navigation Overlay (Bottom) */}
          <div style={{
              position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)',
              padding: '15px 30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
              width: '60%', maxWidth: '600px'
          }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span>{timelineData[0].year < 0 ? `${Math.abs(timelineData[0].year)} a.C.` : `${timelineData[0].year} d.C.`}</span>
                  <span style={{ color: activeEvent.color, fontWeight: 'bold' }}>{activeEvent.title}</span>
                  <span>{timelineData[timelineData.length - 1].year} d.C.</span>
              </div>
              {/* Progress Bar */}
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ 
                      position: 'absolute', top: 0, left: 0, bottom: 0, 
                      width: `${progress}%`, background: activeEvent.color,
                      transition: 'width 0.3s ease, background-color 0.3s ease'
                  }} />
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Usa la rueda del ratón o las flechas ⬅️ ➡️ para viajar en el tiempo
              </div>
          </div>
      </div>

      {showInstructions && (
        <InstructionsModal
          title="Máquina del Tiempo"
          instructions={[
            "Estás en un túnel de tiempo tridimensional.",
            "Desplázate hacia abajo con la rueda del ratón (o usa la flecha hacia abajo/derecha) para viajar hacia el futuro.",
            "Desplázate hacia arriba (o usa la flecha arriba/izquierda) para retroceder en el tiempo.",
            "Haz clic en cualquier cristal de evento para que la cámara viaje automáticamente hasta allí."
          ]}
          onClose={() => setShowInstructions(false)}
        />
      )}
    </div>
  );
};

export default TimelinePage;
