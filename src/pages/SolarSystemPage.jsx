import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Info, X, Orbit } from 'lucide-react';
import { solarSystemData } from '../data/solarSystemData';
import InstructionsModal from '../components/common/InstructionsModal';

const SolarSystemPage = () => {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Stop animations if a planet is selected
  useEffect(() => {
    if (selectedPlanet) {
      setIsPaused(true);
    } else {
      setIsPaused(false);
    }
  }, [selectedPlanet]);

  const handlePlanetClick = (planet, e) => {
    e.stopPropagation();
    setSelectedPlanet(planet);
  };

  const closePlanetModal = () => {
    setSelectedPlanet(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '20px', overflow: 'hidden', position: 'relative' }}>
      <div className="background-effects" style={{ opacity: 0.4 }}>
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
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
            <Orbit color="#fbbf24" /> Sistema Solar
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
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
            <Info size={24} />
        </button>
      </header>

      {/* Main Content Area - The Solar System */}
      <div 
        style={{ 
            flex: 1, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            position: 'relative',
            marginTop: '20px'
        }}
        onClick={() => setIsPaused(!isPaused)} // Toggle pause on background click
      >
          {/* Pause Indicator */}
          {isPaused && !selectedPlanet && (
             <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem', zIndex: 10 }}>
                 Animación pausada (haz clic en el fondo para reanudar)
             </div>
          )}

          <div className="solar-system-container" style={{ position: 'relative', width: '800px', height: '800px', transform: 'scale(0.85)' }}>
            
            {/* The Sun */}
            <div 
                className="sun"
                onClick={(e) => handlePlanetClick(solarSystemData[0], e)}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: `${solarSystemData[0].size}px`,
                    height: `${solarSystemData[0].size}px`,
                    backgroundColor: solarSystemData[0].color,
                    borderRadius: '50%',
                    boxShadow: `0 0 40px ${solarSystemData[0].color}, 0 0 80px ${solarSystemData[0].color}66`,
                    cursor: 'pointer',
                    zIndex: 10,
                    transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'}
            />

            {/* Planets and Orbits */}
            {solarSystemData.slice(1).map((planet) => {
                return (
                    <div 
                        key={planet.id} 
                        className={`orbit ${isPaused ? 'paused' : ''}`}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: `${planet.orbitSize}px`,
                            height: `${planet.orbitSize}px`,
                            marginLeft: `-${planet.orbitSize / 2}px`,
                            marginTop: `-${planet.orbitSize / 2}px`,
                            border: '1px dashed rgba(255,255,255,0.15)',
                            borderRadius: '50%',
                            animation: `orbit-rotate ${planet.orbitSpeed}s linear infinite`,
                            animationPlayState: isPaused ? 'paused' : 'running',
                            zIndex: 1,
                            pointerEvents: 'none'
                        }}
                    >
                        {/* The Planet itself */}
                        <div 
                            className="planet"
                            onClick={(e) => handlePlanetClick(planet, e)}
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: `-${planet.size / 2}px`,
                                marginTop: `-${planet.size / 2}px`,
                                width: `${planet.size}px`,
                                height: `${planet.size}px`,
                                backgroundColor: planet.color,
                                borderRadius: '50%',
                                cursor: 'pointer',
                                boxShadow: `inset -2px -2px 6px rgba(0,0,0,0.5), 0 0 10px ${planet.color}88`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'auto'
                            }}
                        >
                            {/* Rings (for Saturn) */}
                            {planet.hasRings && (
                                <div style={{
                                    position: 'absolute',
                                    width: `${planet.size * 2.2}px`,
                                    height: `${planet.size * 0.4}px`,
                                    backgroundColor: 'transparent',
                                    border: `3px solid ${planet.color}AA`,
                                    borderRadius: '50%',
                                    transform: 'rotate(20deg)',
                                    pointerEvents: 'none'
                                }}/>
                            )}
                            
                            {/* Tooltip on hover */}
                            <div className="planet-tooltip" style={{
                                position: 'absolute',
                                bottom: '150%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                whiteSpace: 'nowrap',
                                opacity: 0,
                                pointerEvents: 'none',
                                transition: 'opacity 0.2s',
                                border: `1px solid ${planet.color}`
                            }}>
                                {planet.name}
                            </div>
                        </div>
                    </div>
                );
            })}
          </div>
      </div>

      {/* Planet Info Modal */}
      {selectedPlanet && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(5px)',
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
          title="Sistema Solar Interactivo"
          instructions={[
            "Observa el movimiento de los planetas alrededor del sol.",
            "Haz clic en cualquier planeta o en el Sol para detener la animación y ver sus detalles astronómicos.",
            "Haz clic en el fondo oscuro para pausar o reanudar el movimiento de todo el sistema."
          ]}
          onClose={() => setShowInstructions(false)}
        />
      )}

      <style>{`
        @keyframes orbit-rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .solar-system-container:hover .orbit {
            animation-play-state: paused !important;
        }
        .planet:hover .planet-tooltip {
            opacity: 1 !important;
        }
        .planet:hover {
            transform: scale(1.3);
            transition: transform 0.2s;
        }
        @media (max-width: 800px) {
            .solar-system-container {
                transform: scale(0.45) !important;
            }
        }
      `}</style>
    </div>
  );
};

export default SolarSystemPage;
