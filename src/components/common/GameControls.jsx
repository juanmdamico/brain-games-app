import React from 'react';

const GameControls = ({ 
    difficultyOptions = [], 
    currentDifficulty, 
    onDifficultyChange,
    onNewGame,
    actions = [], 
    showNumpad = false,
    onNumberClick
}) => {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      
      {(difficultyOptions.length > 0 || onNewGame) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
          {difficultyOptions.length > 0 && (
            <select 
                value={currentDifficulty} 
                onChange={(e) => onDifficultyChange(e.target.value)}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(15, 23, 42, 0.8)', color: 'white', border: '1px solid var(--cell-border)', outline: 'none' }}
            >
              {difficultyOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
          {onNewGame && (
            <button onClick={onNewGame} style={{ flex: difficultyOptions.length === 0 ? 1 : 'none', backgroundColor: 'var(--secondary-color)', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Nuevo Juego
            </button>
          )}
        </div>
      )}

      {actions.length > 0 && (
        <div style={{ display: 'flex', gap: '15px' }}>
            {actions.map((act, i) => (
                <button key={i} onClick={act.onClick} style={{ 
                    flex: 1, padding: '14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, 
                    background: act.variant === 'primary' ? 'linear-gradient(135deg, #3b82f6, #4f46e5)' : 'transparent',
                    color: 'white',
                    border: act.variant === 'primary' ? 'none' : '1px solid var(--secondary-color)'
                }}>
                  {act.label}
                </button>
            ))}
        </div>
      )}

      {showNumpad && (
        <div className="numpad" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
          {nums.map(n => (
            <button 
              key={n} 
              onClick={() => onNumberClick(n)}
              style={{ padding: '14px 0', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--cell-border)', borderRadius: '12px', color: 'white', fontSize: '1.2rem', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              {n}
            </button>
          ))}
          <button 
            onClick={() => onNumberClick(0)}
            style={{ padding: '14px 0', backgroundColor: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.3)', borderRadius: '12px', color: '#a78bfa', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            ⌫
          </button>
        </div>
      )}

    </div>
  );
};

export default GameControls;
