import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Info, Mountain } from 'lucide-react';
import { earthLayersData } from '../data/earthLayersData';
import InstructionsModal from '../components/common/InstructionsModal';

const EarthLayersPage = () => {
  const [hoveredLayer, setHoveredLayer] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  // We want to draw them from largest radius to smallest, 
  // so the smaller circles render on top.
  const layersToDraw = [...earthLayersData].reverse();
  
  // The selected layer to show in the info box
  const activeLayer = hoveredLayer || earthLayersData[3]; // Default to Crust (Tierra) if none hovered

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '20px', overflow: 'hidden' }}>
      <div className="background-effects">
        <div className="glow-orb orb-1" style={{ opacity: 0.2 }}></div>
        <div className="glow-orb orb-2" style={{ opacity: 0.2 }}></div>
      </div>

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', position: 'relative', zIndex: 10 }}>
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
                transition: 'all 0.2s ease'
            }}
        >
            ← Volver
        </Link>
        
        <h1 style={{ color: 'white', margin: 0, fontSize: '1.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mountain color="#65a30d" /> Capas de la Tierra
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
                transition: 'background 0.2s'
            }}
        >
            <Info size={24} />
        </button>
      </header>

      {/* Main Container */}
      <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '50px',
          marginTop: '20px',
          position: 'relative'
      }}>

          {/* Interactive Concentric Diagram Area */}
          <div style={{ 
              position: 'relative', 
              width: '500px', 
              height: '500px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexShrink: 0
          }}>
              {layersToDraw.map((layer) => {
                  const isHovered = hoveredLayer?.id === layer.id;
                  
                  // For the exosphere, we make it look like space
                  const isExosphere = layer.id === 'exosphere';
                  const baseStyle = {
                      position: 'absolute',
                      width: `${layer.radius * 2}px`,
                      height: `${layer.radius * 2}px`,
                      borderRadius: '50%',
                      backgroundColor: isExosphere ? 'transparent' : layer.color,
                      border: isExosphere ? `2px dashed ${layer.color}` : `2px solid ${isHovered ? 'white' : 'rgba(0,0,0,0.2)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: isHovered && !isExosphere ? `0 0 20px ${layer.color}, inset 0 0 20px rgba(255,255,255,0.4)` : 'none',
                      transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                      zIndex: layer.radius > 200 ? 1 : 10 // push atmosphere layers behind
                  };

                  return (
                      <div 
                        key={layer.id}
                        onMouseEnter={() => setHoveredLayer(layer)}
                        onMouseLeave={() => setHoveredLayer(null)}
                        style={baseStyle}
                      />
                  );
              })}

              {/* A small static label in the center */}
              <div style={{ position: 'absolute', pointerEvents: 'none', color: '#000', fontWeight: 'bold', zIndex: 100, fontSize: '0.8rem', textAlign: 'center' }}>
                  Núcleo
              </div>
          </div>

          {/* Info Box */}
          <div style={{
              background: 'rgba(30, 41, 59, 0.7)',
              backdropFilter: 'blur(12px)',
              border: `2px solid ${activeLayer.color}55`,
              borderRadius: '24px',
              padding: '30px',
              maxWidth: '450px',
              width: '100%',
              minHeight: '400px',
              boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 20px ${activeLayer.color}11`,
              transition: 'border-color 0.3s',
              display: 'flex',
              flexDirection: 'column'
          }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <div style={{ 
                      width: '24px', height: '24px', 
                      backgroundColor: activeLayer.id === 'exosphere' ? 'transparent' : activeLayer.color,
                      border: activeLayer.id === 'exosphere' ? '2px dashed white' : 'none',
                      borderRadius: '50%' 
                  }} />
                  <h2 style={{ fontSize: '2rem', margin: 0, color: 'white' }}>{activeLayer.name}</h2>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '30px', flex: 1 }}>
                  {activeLayer.description}
              </p>

              <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '15px', 
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  padding: '20px',
                  borderRadius: '16px'
              }}>
                  <div>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Profundidad/Altura</span>
                      <strong style={{ color: 'white', fontSize: '1.1rem' }}>{activeLayer.depth}</strong>
                  </div>
                  <div>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Grosor</span>
                      <strong style={{ color: 'white', fontSize: '1.1rem' }}>{activeLayer.thickness}</strong>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Temperatura</span>
                      <strong style={{ color: '#fb923c', fontSize: '1.1rem' }}>{activeLayer.temperature}</strong>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Composición</span>
                      <strong style={{ color: 'white', fontSize: '1rem' }}>{activeLayer.composition}</strong>
                  </div>
              </div>
          </div>

      </div>

      {showInstructions && (
        <InstructionsModal
          title="Explorador de Capas Terrestres"
          instructions={[
            "Pasa el ratón (o toca) sobre los diferentes círculos concéntricos.",
            "Cada círculo representa una capa real de la Tierra, desde su ardiente núcleo interno hasta el vacío del espacio exterior en la exosfera.",
            "A la derecha podrás ver los datos detallados de composición, grosor y temperatura de la capa que estés señalando."
          ]}
          onClose={() => setShowInstructions(false)}
        />
      )}
    </div>
  );
};

export default EarthLayersPage;
