import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { elementsData } from '../data/periodicTableData';
import ElementModal, { getCategoryColor } from '../components/PeriodicTable/ElementModal';
import InstructionsModal from '../components/common/InstructionsModal';

const PeriodicTablePage = () => {
  const [selectedElement, setSelectedElement] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '20px' }}>
      <div className="background-effects">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
      </div>

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', position: 'relative', zIndex: 10 }}>
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
        
        <h1 style={{ color: 'white', margin: 0, fontSize: '1.8rem', fontWeight: 700 }}>Tabla Periódica</h1>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button 
                onClick={() => setShowInstructions(true)}
                style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white',
                    width: '40px', height: '40px',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
                <HelpCircle size={20} />
            </button>
        </div>
      </header>

      {/* Main Content: Periodic Table Grid */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 5 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(18, minmax(40px, 60px))',
          gap: '4px',
          padding: '20px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          overflowX: 'auto',
          maxWidth: '100%'
        }}>
          {elementsData.map((el) => {
            const color = getCategoryColor(el.category);
            
            // Ajustar posición para actínidos y lantánidos para que se separen visualmente
            let row = el.period;
            if (el.category.includes('lanthanide') || el.category.includes('actinide')) {
              row = el.period + 1; // Dejar un espacio vacío en la fila 8
            }

            return (
              <div 
                key={el.number}
                onClick={() => setSelectedElement(el)}
                style={{
                  gridColumn: el.group,
                  gridRow: row,
                  backgroundColor: `${color}22`,
                  border: `1px solid ${color}55`,
                  borderRadius: '6px',
                  padding: '5px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  minHeight: '60px',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.zIndex = 10;
                  e.currentTarget.style.backgroundColor = `${color}44`;
                  e.currentTarget.style.border = `1px solid ${color}`;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.zIndex = 1;
                  e.currentTarget.style.backgroundColor = `${color}22`;
                  e.currentTarget.style.border = `1px solid ${color}55`;
                }}
              >
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', alignSelf: 'flex-start' }}>{el.number}</span>
                <strong style={{ color: 'white', fontSize: '1.2rem', lineHeight: 1 }}>{el.symbol}</strong>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                    {el.name}
                </span>
              </div>
            );
          })}
        </div>
      </main>

      {/* Modals */}
      <ElementModal element={selectedElement} onClose={() => setSelectedElement(null)} />
      
      {showInstructions && (
        <InstructionsModal 
            title="Tabla Periódica"
            rules={[
                "Explora los 118 elementos químicos conocidos.",
                "Haz clic en cualquier elemento para abrir su ficha técnica.",
                "Los elementos están codificados por colores según su categoría (metales, gases nobles, etc.).",
                "Puedes ver información como su masa atómica, grupo y estado a temperatura ambiente."
            ]}
            onClose={() => setShowInstructions(false)}
        />
      )}
    </div>
  );
};

export default PeriodicTablePage;
