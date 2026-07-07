import React from 'react';
import { X } from 'lucide-react';

const categoryColors = {
  'no metal diatómico': '#ff6b6b',
  'gas noble': '#4ecdc4',
  'metal alcalino': '#ffa62b',
  'metal alcalinotérreo': '#f7d794',
  'metaloide': '#3dc1d3',
  'no metal poliatómico': '#e66767',
  'metal del bloque p': '#54a0ff',
  'metal de transición': '#ff9ff3',
  'lantánido': '#f368e0',
  'actínido': '#ff9f43',
};

export function getCategoryColor(category) {
  if (!category) return '#bdc3c7';
  for (const key in categoryColors) {
    if (category.toLowerCase().includes(key)) return categoryColors[key];
  }
  return '#bdc3c7'; // fallback
}

const ElementModal = ({ element, onClose }) => {
  if (!element) return null;

  const color = getCategoryColor(element.category);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '30px',
        maxWidth: '500px',
        width: '90%',
        position: 'relative',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        animation: 'modalSlideIn 0.3s ease-out'
      }} onClick={e => e.stopPropagation()}>
        
        <button onClick={onClose} style={{
          position: 'absolute', top: '20px', right: '20px',
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', padding: '5px'
        }}>
          <X size={24} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
          <div style={{
            width: '100px', height: '100px',
            backgroundColor: `${color}22`,
            border: `2px solid ${color}`,
            borderRadius: '12px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: 'white'
          }}>
            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{element.number}</span>
            <strong style={{ fontSize: '2.5rem', lineHeight: '1.2' }}>{element.symbol}</strong>
            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{Number(element.atomic_mass).toFixed(2)}</span>
          </div>
          
          <div>
            <h2 style={{ color: 'white', fontSize: '2rem', marginBottom: '5px' }}>{element.name}</h2>
            <div style={{ 
                display: 'inline-block', padding: '4px 10px', 
                backgroundColor: color, color: '#000', 
                borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold',
                textTransform: 'capitalize'
            }}>
                {element.category}
            </div>
          </div>
        </div>

        <div style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '1.05rem', marginBottom: '20px' }}>
          <p>{element.summary}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fase (A temperatura ambiente)</span>
            <strong style={{ color: 'white' }}>{element.phase || 'Desconocida'}</strong>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Grupo / Período</span>
            <strong style={{ color: 'white' }}>{element.group || '-'} / {element.period}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElementModal;
