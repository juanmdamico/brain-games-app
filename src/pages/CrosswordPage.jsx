import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const ROWS = 5;
const COLS = 6;

// Crossword template definition
const GRID_TEMPLATE = [
    ['#', '#', '#', 'L', '#', '#'],
    ['#', 'M', 'E', 'N', 'T', 'E'],
    ['#', '#', '#', 'I', '#', 'S'],
    ['#', '#', 'M', 'E', 'S', 'A'],
    ['#', '#', '#', 'A', '#', 'L']
];

// Number labels on cells
const LABELS = [
    [0, 0, 0, 2, 0, 0],
    [0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 4],
    [0, 0, 3, 0, 0, 0],
    [0, 0, 0, 0, 0, 0]
];

const CLUES = {
    across: [
        { id: 1, label: '1. MENTE', clue: 'Capacidad intelectual, pensamiento o cerebro.' },
        { id: 3, label: '3. MESA', clue: 'Mueble de cuatro patas utilizado para apoyarse o comer.' }
    ],
    down: [
        { id: 2, label: '2. LINEA', clue: 'Sucesión continua de puntos en el espacio.' },
        { id: 4, label: '4. SAL', clue: 'Sustancia blanca y cristalina que se usa como condimento.' }
    ]
};

const CrosswordPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [userGrid, setUserGrid] = useState(
        Array(ROWS).fill(null).map((_, r) => 
            Array(COLS).fill(null).map((_, c) => GRID_TEMPLATE[r][c] === '#' ? '#' : '')
        )
    );
    const [selectedCell, setSelectedCell] = useState(null); // {r, c}
    const [winner, setWinner] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [timeElapsed, setTimeElapsed] = useState(0);

    useEffect(() => {
        if (winner) return;
        const timer = setInterval(() => {
            setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime, winner]);

    const resetGame = () => {
        playClick();
        setUserGrid(
            Array(ROWS).fill(null).map((_, r) => 
                Array(COLS).fill(null).map((_, c) => GRID_TEMPLATE[r][c] === '#' ? '#' : '')
            )
        );
        setSelectedCell(null);
        setWinner(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const handleCellClick = (r, c) => {
        if (winner || GRID_TEMPLATE[r][c] === '#') return;
        playClick();
        setSelectedCell({ r, c });
    };

    const handleKeyDown = (e) => {
        if (winner || !selectedCell) return;

        const { r, c } = selectedCell;

        if (e.key === 'Backspace') {
            playClick();
            const newGrid = userGrid.map(row => [...row]);
            newGrid[r][c] = '';
            setUserGrid(newGrid);
            // Move back cursor if possible
            moveSelection(0, -1);
        } else if (e.key.length === 1 && e.key.match(/[a-zA-ZñÑ]/)) {
            playClick();
            const newGrid = userGrid.map(row => [...row]);
            const letter = e.key.toUpperCase();
            newGrid[r][c] = letter;
            setUserGrid(newGrid);

            // Check correctness of the whole grid
            if (checkAnswers(newGrid)) {
                setWinner(true);
                playVictorySfx();
                registerGameCompletion('crucigrama', 'medium', timeElapsed);
                setShowVictory(true);
            } else {
                // Auto-move cursor to next cell (horizontal preferential)
                moveSelection(0, 1);
            }
        }
    };

    const moveSelection = (dr, dc) => {
        if (!selectedCell) return;
        let newR = selectedCell.r + dr;
        let newC = selectedCell.c + dc;

        // Loop bounds checking
        if (newR >= 0 && newR < ROWS && newC >= 0 && newC < COLS) {
            if (GRID_TEMPLATE[newR][newC] !== '#') {
                setSelectedCell({ r: newR, c: newC });
            }
        }
    };

    const checkAnswers = (gridToCheck) => {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (GRID_TEMPLATE[r][c] !== '#' && gridToCheck[r][c] !== GRID_TEMPLATE[r][c]) {
                    return false;
                }
            }
        }
        return true;
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedCell, userGrid, winner]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            maxWidth: '520px', margin: '30px auto', padding: '24px',
            backgroundColor: 'var(--panel-bg, rgba(30, 41, 59, 0.45))',
            backdropFilter: 'blur(12px)', border: '1px solid var(--border)',
            borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.5s ease', textAlign: 'center'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                    Crucigrama Mental
                </span>
                <div style={{ color: 'var(--text-main)', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    ⏱️ {formatTime(timeElapsed)}
                </div>
                <button onClick={resetGame} style={{
                    background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px',
                    padding: '6px 10px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    <RotateCcw size={16} /> Reiniciar
                </button>
            </div>

            {/* Crossword Grid layout */}
            <div style={{
                display: 'inline-flex', flexDirection: 'column', gap: '4px',
                backgroundColor: 'rgba(15, 23, 42, 0.3)', border: '1px solid var(--border)',
                borderRadius: '16px', padding: '16px', marginBottom: '20px', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)'
            }}>
                {userGrid.map((row, r) => (
                    <div key={r} style={{ display: 'flex', gap: '4px' }}>
                        {row.map((cell, c) => {
                            const isWall = cell === '#';
                            const isSelected = selectedCell && selectedCell.r === r && selectedCell.c === c;
                            const label = LABELS[r][c];
                            return (
                                <div
                                    key={c}
                                    onClick={() => handleCellClick(r, c)}
                                    style={{
                                        width: '44px', height: '44px',
                                        backgroundColor: isWall ? '#090d16' : isSelected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                                        border: isWall ? 'none' : isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                                        borderRadius: '8px', position: 'relative', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)',
                                        cursor: isWall || winner ? 'default' : 'pointer', transition: 'all 0.15s'
                                    }}
                                >
                                    {/* Number label */}
                                    {label > 0 && (
                                        <span style={{ position: 'absolute', top: '2px', left: '4px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                            {label}
                                        </span>
                                    )}
                                    {!isWall && cell}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Clues layout */}
            <div style={{
                textAlign: 'left', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px',
                backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px'
            }}>
                <div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        Horizontales (Across)
                    </h4>
                    {CLUES.across.map(clue => (
                        <div key={clue.id} style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '8px' }}>
                            <strong>{clue.label}</strong>: {clue.clue}
                        </div>
                    ))}
                </div>
                <div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        Verticales (Down)
                    </h4>
                    {CLUES.down.map(clue => (
                        <div key={clue.id} style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '8px' }}>
                            <strong>{clue.label}</strong>: {clue.clue}
                        </div>
                    ))}
                </div>
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Haz clic en un casillero blanco y escribe la letra con tu teclado para completar la palabra.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Crucigrama Completado!"
                message="Has resuelto todas las palabras correctamente."
                timeElapsed={timeElapsed}
                onPlayAgain={resetGame}
            />
        </div>
    );
};

export default CrosswordPage;
