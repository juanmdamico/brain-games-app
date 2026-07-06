import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const LEVELS = [
    // Level 1: Simple introduction
    {
        map: [
            ['#', '#', '#', '#', '#', '#', '#'],
            ['#', ' ', ' ', ' ', ' ', ' ', '#'],
            ['#', ' ', '@', '$', '.', ' ', '#'],
            ['#', ' ', ' ', ' ', ' ', ' ', '#'],
            ['#', '#', '#', '#', '#', '#', '#']
        ]
    },
    // Level 2: Two boxes
    {
        map: [
            ['#', '#', '#', '#', '#', '#', '#'],
            ['#', ' ', ' ', ' ', '#', ' ', '#'],
            ['#', ' ', '$', '.', '$', ' ', '#'],
            ['#', '@', ' ', ' ', '.', ' ', '#'],
            ['#', '#', '#', '#', '#', '#', '#']
        ]
    },
    // Level 3: Dual targets box alignment
    {
        map: [
            ['#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
            ['#', ' ', '$', '$', '@', ' ', ' ', '#'],
            ['#', ' ', '.', '.', ' ', ' ', ' ', '#'],
            ['#', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#']
        ]
    }
];

const SokobanPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [levelIndex, setLevelIndex] = useState(0);
    const [grid, setGrid] = useState([]);
    const [playerPosition, setPlayerPosition] = useState({ r: 0, c: 0 });
    const [moves, setMoves] = useState(0);
    const [winner, setWinner] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [timeElapsed, setTimeElapsed] = useState(0);

    // Track targets positions to render them when empty
    const [targets, setTargets] = useState([]);

    useEffect(() => {
        loadLevel(levelIndex);
    }, [levelIndex]);

    useEffect(() => {
        if (winner) return;
        const timer = setInterval(() => {
            setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime, winner]);

    // Handle Keyboard input
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (winner) return;
            let dr = 0;
            let dc = 0;

            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') dr = -1;
            else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') dr = 1;
            else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') dc = -1;
            else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') dc = 1;

            if (dr !== 0 || dc !== 0) {
                e.preventDefault();
                movePlayer(dr, dc);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [grid, playerPosition, winner]);

    const loadLevel = (idx) => {
        const template = LEVELS[idx].map;
        let tempGrid = template.map(r => [...r]);
        let playerPos = { r: 0, c: 0 };
        let tempTargets = [];

        for (let r = 0; r < tempGrid.length; r++) {
            for (let c = 0; c < tempGrid[r].length; c++) {
                const char = tempGrid[r][c];
                if (char === '@' || char === '+') {
                    playerPos = { r, c };
                }
                if (char === '.' || char === '+' || char === '*') {
                    tempTargets.push({ r, c });
                }
            }
        }

        setGrid(tempGrid);
        setPlayerPosition(playerPos);
        setTargets(tempTargets);
        setMoves(0);
        setWinner(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const movePlayer = (dr, dc) => {
        const newR = playerPosition.r + dr;
        const newC = playerPosition.c + dc;

        // Check bounds
        if (newR < 0 || newR >= grid.length || newC < 0 || newC >= grid[0].length) return;

        const cell = grid[newR][newC];

        // Wall: can't move
        if (cell === '#') return;

        // Box check
        if (cell === '$' || cell === '*') {
            const boxBehindR = newR + dr;
            const boxBehindC = newC + dc;
            
            // Check box behind bounds
            if (boxBehindR < 0 || boxBehindR >= grid.length || boxBehindC < 0 || boxBehindC >= grid[0].length) return;

            const cellBehind = grid[boxBehindR][boxBehindC];

            // If behind cell is empty or target, push box
            if (cellBehind === ' ' || cellBehind === '.') {
                playClick();
                const newGrid = grid.map(row => [...row]);
                
                // Move Box
                newGrid[boxBehindR][boxBehindC] = cellBehind === '.' ? '*' : '$';
                
                // Move Player to box old cell
                const isOldCellTarget = targets.some(t => t.r === newR && t.c === newC);
                newGrid[newR][newC] = isOldCellTarget ? '+' : '@';
                
                // Empty old player position
                const isPlayerOldCellTarget = targets.some(t => t.r === playerPosition.r && t.c === playerPosition.c);
                newGrid[playerPosition.r][playerPosition.c] = isPlayerOldCellTarget ? '.' : ' ';

                setGrid(newGrid);
                setPlayerPosition({ r: newR, c: newC });
                setMoves(prev => prev + 1);

                // Check Win
                if (checkWin(newGrid)) {
                    handleWin();
                }
            } else {
                playErrorSfx();
            }
        } else {
            // Simple player movement (empty or target cell)
            playClick();
            const newGrid = grid.map(row => [...row]);

            // Set new player cell
            const isNewCellTarget = targets.some(t => t.r === newR && t.c === newC);
            newGrid[newR][newC] = isNewCellTarget ? '+' : '@';

            // Empty old player cell
            const isPlayerOldCellTarget = targets.some(t => t.r === playerPosition.r && t.c === playerPosition.c);
            newGrid[playerPosition.r][playerPosition.c] = isPlayerOldCellTarget ? '.' : ' ';

            setGrid(newGrid);
            setPlayerPosition({ r: newR, c: newC });
            setMoves(prev => prev + 1);
        }
    };

    const checkWin = (tempGrid) => {
        // Solved if no single '$' remains (all must be '*')
        for (let r = 0; r < tempGrid.length; r++) {
            for (let c = 0; c < tempGrid[r].length; c++) {
                if (tempGrid[r][c] === '$') return false;
            }
        }
        return true;
    };

    const handleWin = () => {
        setWinner(true);
        playVictorySfx();
        registerGameCompletion('sokoban', 'medium', timeElapsed, moves + 1);
        setShowVictory(true);
    };

    const nextLevel = () => {
        playClick();
        if (levelIndex < LEVELS.length - 1) {
            setLevelIndex(prev => prev + 1);
        } else {
            setLevelIndex(0); // Loop
        }
    };

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
                <div style={{ display: 'flex', gap: '8px' }}>
                    {LEVELS.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => { playClick(); setLevelIndex(idx); }}
                            style={{
                                padding: '6px 12px', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '8px',
                                border: '1px solid var(--border)', cursor: 'pointer',
                                backgroundColor: levelIndex === idx ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                                color: levelIndex === idx ? 'white' : 'var(--text-muted)'
                            }}
                        >
                            Nivel {idx + 1}
                        </button>
                    ))}
                </div>
                <div style={{ color: 'var(--text-main)', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    ⏱️ {formatTime(timeElapsed)}
                </div>
                <button onClick={() => loadLevel(levelIndex)} style={{
                    background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px',
                    padding: '6px 10px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    <RotateCcw size={16} /> Reiniciar
                </button>
            </div>

            {/* Level Stats Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <span>Movimientos: <strong>{moves}</strong></span>
                <span>Objetivos completados: <strong>{grid.flat().filter(c => c === '*').length} / {targets.length}</strong></span>
            </div>

            {/* Map Grid */}
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
                {grid.map((row, rIdx) => (
                    <div key={rIdx} style={{ display: 'flex' }}>
                        {row.map((cell, cIdx) => {
                            let renderChar = '';
                            let bgColor = 'transparent';
                            let border = 'none';

                            if (cell === '#') {
                                renderChar = '🧱';
                                bgColor = 'rgba(255,255,255,0.02)';
                            } else if (cell === '@' || cell === '+') {
                                renderChar = '👷';
                            } else if (cell === '$') {
                                renderChar = '📦';
                                bgColor = 'rgba(245, 158, 11, 0.1)';
                                border = '1px solid rgba(245, 158, 11, 0.2)';
                            } else if (cell === '*') {
                                renderChar = '✅';
                                bgColor = 'rgba(16, 185, 129, 0.2)';
                                border = '1px solid rgba(16, 185, 129, 0.4)';
                            } else if (cell === '.') {
                                renderChar = '🔴';
                            }

                            return (
                                <div
                                    key={cIdx}
                                    style={{
                                        width: '40px', height: '40px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.4rem', backgroundColor: bgColor, border: border,
                                        borderRadius: cell === '#' ? '4px' : '8px', margin: '1px'
                                    }}
                                >
                                    {renderChar}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Mobile On-screen controls */}
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                marginTop: '10px', maxWidth: '180px', margin: '0 auto'
            }}>
                <button 
                    onClick={() => movePlayer(-1, 0)}
                    style={{ width: '46px', height: '46px', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justify: 'center', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', color: 'var(--text-main)' }}
                >
                    <ChevronUp size={24} />
                </button>
                <div style={{ display: 'flex', gap: '30px' }}>
                    <button 
                        onClick={() => movePlayer(0, -1)}
                        style={{ width: '46px', height: '46px', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justify: 'center', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', color: 'var(--text-main)' }}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button 
                        onClick={() => movePlayer(0, 1)}
                        style={{ width: '46px', height: '46px', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justify: 'center', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', color: 'var(--text-main)' }}
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
                <button 
                    onClick={() => movePlayer(1, 0)}
                    style={{ width: '46px', height: '46px', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justify: 'center', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', color: 'var(--text-main)' }}
                >
                    <ChevronDown size={24} />
                </button>
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Empuja las cajas 📦 hasta los objetivos 🔴. Usa las flechas del teclado o los botones en pantalla.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Nivel Completado!"
                message={`Has ordenado todas las cajas en ${moves} movimientos.`}
                timeElapsed={timeElapsed}
                onPlayAgain={levelIndex < LEVELS.length - 1 ? nextLevel : () => loadLevel(levelIndex)}
                playAgainText={levelIndex < LEVELS.length - 1 ? "Siguiente Nivel" : "Jugar de nuevo"}
            />
        </div>
    );
};

export default SokobanPage;
