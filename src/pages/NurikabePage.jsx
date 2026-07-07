import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const SIZE = 5;

const PUZZLE = {
    // Initial numbers on the grid (0 means empty/blank cell)
    grid: [
        [2, 0, 0, 0, 2],
        [0, 0, 0, 0, 0],
        [0, 3, 0, 0, 3],
        [0, 0, 0, 0, 0],
        [1, 0, 1, 0, 0]
    ],
    // Solution mapping: '#' = River (water), '.' = Island (land)
    solution: [
        ['.', '.', '#', '.', '.'],
        ['#', '#', '#', '#', '#'],
        ['.', '.', '.', '#', '.'],
        ['#', '#', '#', '#', '.'],
        ['.', '#', '.', '#', '.']
    ]
};

const NurikabePage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [userGrid, setUserGrid] = useState([]); // Array of arrays containing: ' ' (empty), '#' (river), '.' (island)
    const [winner, setWinner] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [timeElapsed, setTimeElapsed] = useState(0);

    useEffect(() => {
        initGame();
    }, []);

    useEffect(() => {
        if (winner) return;
        const timer = setInterval(() => {
            setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime, winner]);

    const initGame = () => {
        // Preset number cells as '.' automatically
        const gridState = Array(SIZE).fill(null).map((_, r) => 
            Array(SIZE).fill(null).map((_, c) => 
                PUZZLE.grid[r][c] !== 0 ? '.' : ' '
            )
        );
        setUserGrid(gridState);
        setWinner(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const handleCellClick = (r, c) => {
        if (winner) return;

        // Number cells are locked as islands
        if (PUZZLE.grid[r][c] !== 0) return;

        playClick();

        const newGrid = userGrid.map(row => [...row]);
        const current = newGrid[r][c];

        // Cycle through state: ' ' -> '#' (river) -> '.' (island) -> ' '
        if (current === ' ') {
            newGrid[r][c] = '#';
        } else if (current === '#') {
            newGrid[r][c] = '.';
        } else {
            newGrid[r][c] = ' ';
        }

        setUserGrid(newGrid);

        // Verify if correct
        if (checkWin(newGrid)) {
            setWinner(true);
            playVictorySfx();
            registerGameCompletion('nurikabe', 'medium', timeElapsed);
            setShowVictory(true);
        }
    };

    const checkWin = (tempGrid) => {
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const state = tempGrid[r][c];
                const sol = PUZZLE.solution[r][c];

                if (sol === '#' && state !== '#') return false;
                if (sol === '.' && state !== '.') return false;
            }
        }
        return true;
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            maxWidth: '480px', margin: '30px auto', padding: '24px',
            backgroundColor: 'var(--panel-bg, rgba(30, 41, 59, 0.45))',
            backdropFilter: 'blur(12px)', border: '1px solid var(--border)',
            borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.5s ease', textAlign: 'center'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                    Nurikabe (Islas Lógicas)
                </span>
                <div style={{ color: 'var(--text-main)', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    ⏱️ {formatTime(timeElapsed)}
                </div>
                <button onClick={initGame} style={{
                    background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px',
                    padding: '6px 10px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    <RotateCcw size={16} /> Reiniciar
                </button>
            </div>

            {/* Nurikabe Board */}
            <div style={{
                display: 'inline-flex',
                flexDirection: 'column',
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)',
                marginBottom: '20px'
            }}>
                {userGrid.map((row, rIdx) => (
                    <div key={rIdx} style={{ display: 'flex' }}>
                        {row.map((cell, cIdx) => {
                            const num = PUZZLE.grid[rIdx][cIdx];
                            
                            let cellBg = 'rgba(255, 255, 255, 0.02)';
                            let cellShadow = 'none';
                            let cellBorder = '1px solid rgba(255, 255, 255, 0.03)';
                            let displayContent = null;

                            if (cell === '#') {
                                // River: glowing water look
                                cellBg = 'linear-gradient(135deg, #06b6d4, #0891b2)';
                                cellShadow = '0 0 10px rgba(6, 182, 212, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)';
                                cellBorder = '1px solid #22d3ee';
                            } else if (cell === '.') {
                                // Island: stone look
                                cellBg = 'linear-gradient(135deg, #cbd5e1, #94a3b8)';
                                cellBorder = '1px solid #f1f5f9';
                                cellShadow = 'inset 0 2px 4px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.2)';
                                
                                if (num !== 0) {
                                    displayContent = (
                                        <span style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '1.25rem' }}>
                                            {num}
                                        </span>
                                    );
                                } else {
                                    // Empty island dot
                                    displayContent = (
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#64748b' }} />
                                    );
                                }
                            }

                            return (
                                <button
                                    key={cIdx}
                                    onClick={() => handleCellClick(rIdx, cIdx)}
                                    style={{
                                        width: '46px', height: '46px', margin: '2px',
                                        backgroundColor: cellBg, border: cellBorder,
                                        boxShadow: cellShadow, borderRadius: '8px',
                                        cursor: winner ? 'default' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.15s'
                                    }}
                                    onMouseOver={(e) => {
                                        if (cell === ' ' && !winner) {
                                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (cell === ' ') {
                                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                                        }
                                    }}
                                >
                                    {displayContent}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Haz clic para alternar: Vacío ➔ Agua (Celeste) ➔ Tierra (Gris). Consigue separar las islas numeradas según su tamaño, rodeándolas por un río de agua continuo que no contenga bloques de 2x2.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Islas Ordenadas!"
                message="Has resuelto el mapa de Nurikabe conectando el río sin ahogar las islas."
                timeElapsed={timeElapsed}
                onPlayAgain={initGame}
            />
        </div>
    );
};

export default NurikabePage;
