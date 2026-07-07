import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Info, Activity } from 'lucide-react';
import { anatomyData } from '../data/anatomyData';
import InstructionsModal from '../components/common/InstructionsModal';

const OrganButton = ({ data, active, onHover, onClick, top, left, width = '50px', height = '50px', borderRadius = '50%' }) => {
    const isActive = active?.id === data.id;
    return (
        <button
            onMouseEnter={() => onHover(data)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onClick(data)}
            style={{
                position: 'absolute',
                top, left, width, height, borderRadius,
                backgroundColor: isActive ? data.color : `${data.color}44`,
                border: `2px solid ${data.color}`,
                cursor: 'pointer',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.3s ease',
                boxShadow: isActive ? `0 0 20px ${data.color}88` : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isActive ? '#fff' : 'transparent',
                fontWeight: 'bold', fontSize: '0.7rem'
            }}
        >
        </button>
    );
};

const AnatomyPage = () => {
  const [activeOrgan, setActiveOrgan] = useState(anatomyData[1]); // Default to Heart
  const [hoveredOrgan, setHoveredOrgan] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const displayOrgan = hoveredOrgan || activeOrgan;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#020617', color: 'white' }}>
      {/* Header */}
      <header style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px',
          background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '8px' }}>
            ← Volver
        </Link>
        <h1 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity color="#ec4899" /> Cuerpo Humano
        </h1>
        <button onClick={() => setShowInstructions(true)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}>
            <Info size={24} />
        </button>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '50px', padding: '20px' }}>
          
          {/* Abstract Body Visualization */}
          <div style={{ position: 'relative', width: '300px', height: '600px' }}>
              {/* Silhouette backdrop */}
              <div style={{ 
                  position: 'absolute', top: '0', left: '100px', width: '100px', height: '120px', 
                  backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50px' 
              }}></div>
              <div style={{ 
                  position: 'absolute', top: '130px', left: '50px', width: '200px', height: '250px', 
                  backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '40px' 
              }}></div>
              {/* Arms */}
              <div style={{ position: 'absolute', top: '140px', left: '10px', width: '30px', height: '200px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '15px' }}></div>
              <div style={{ position: 'absolute', top: '140px', right: '10px', width: '30px', height: '200px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '15px' }}></div>
              {/* Legs */}
              <div style={{ position: 'absolute', top: '390px', left: '80px', width: '40px', height: '200px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}></div>
              <div style={{ position: 'absolute', top: '390px', right: '80px', width: '40px', height: '200px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}></div>

              {/* Organs */}
              <OrganButton data={anatomyData[0]} top="20px" left="125px" active={displayOrgan} onHover={setHoveredOrgan} onClick={setActiveOrgan} /> {/* Brain */}
              <OrganButton data={anatomyData[1]} top="170px" left="140px" width="40px" height="40px" active={displayOrgan} onHover={setHoveredOrgan} onClick={setActiveOrgan} /> {/* Heart */}
              <OrganButton data={anatomyData[2]} top="160px" left="80px" width="140px" height="80px" borderRadius="40px" active={displayOrgan} onHover={setHoveredOrgan} onClick={setActiveOrgan} /> {/* Lungs */}
              <OrganButton data={anatomyData[4]} top="230px" left="100px" width="70px" height="50px" borderRadius="30px" active={displayOrgan} onHover={setHoveredOrgan} onClick={setActiveOrgan} /> {/* Liver */}
              <OrganButton data={anatomyData[3]} top="240px" left="150px" width="50px" height="40px" borderRadius="20px" active={displayOrgan} onHover={setHoveredOrgan} onClick={setActiveOrgan} /> {/* Stomach */}
              <OrganButton data={anatomyData[5]} top="270px" left="110px" width="80px" height="30px" borderRadius="15px" active={displayOrgan} onHover={setHoveredOrgan} onClick={setActiveOrgan} /> {/* Kidneys */}
              <OrganButton data={anatomyData[6]} top="300px" left="90px" width="120px" height="70px" borderRadius="30px" active={displayOrgan} onHover={setHoveredOrgan} onClick={setActiveOrgan} /> {/* Intestines */}
          </div>

          {/* Info Panel */}
          <div style={{
              background: 'rgba(15, 23, 42, 0.8)', border: `1px solid ${displayOrgan.color}`, borderRadius: '20px',
              padding: '40px', width: '400px', boxShadow: `0 10px 30px rgba(0,0,0,0.3), 0 0 20px ${displayOrgan.color}33`,
              transition: 'all 0.3s ease'
          }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: displayOrgan.color, boxShadow: `0 0 10px ${displayOrgan.color}` }}></div>
                  <h2 style={{ fontSize: '2rem', margin: 0 }}>{displayOrgan.name}</h2>
              </div>
              <div style={{ display: 'inline-block', padding: '5px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Sistema {displayOrgan.system === 'nervous' ? 'Nervioso' : displayOrgan.system === 'circulatory' ? 'Circulatorio' : displayOrgan.system === 'respiratory' ? 'Respiratorio' : displayOrgan.system === 'digestive' ? 'Digestivo' : displayOrgan.system === 'excretory' ? 'Excretor' : displayOrgan.system === 'skeletal' ? 'Óseo' : ''}
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '1.1rem', lineHeight: '1.6' }}>
                  {displayOrgan.description}
              </p>
          </div>

      </div>

      {showInstructions && (
        <InstructionsModal
          title="Anatomía Interactiva"
          instructions={[
            "Pasa el ratón sobre los distintos órganos iluminados en la silueta humana.",
            "Haz clic en cualquier órgano para fijar la tarjeta de información.",
            "Aprende sobre la función fundamental de cada parte de tu cuerpo."
          ]}
          onClose={() => setShowInstructions(false)}
        />
      )}
    </div>
  );
};

export default AnatomyPage;
