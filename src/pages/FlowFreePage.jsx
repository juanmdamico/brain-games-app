import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const SIZE = 5;

// Color hex codes definitions
const COLOR_HEX = {
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#10b981',
    yellow: '#f59e0b',
    orange: '#f97316'
};

const INITIAL_DOTS = [
    { r: 0, c: 0, color: 'red' }, { r: 4, c: 0, color: 'red' },
    { r: 0, c: 4, color: 'blue' }, { r: 4, c: 4, color: 'blue' },
    { r: 1, c: 1, color: 'green' }, { r: 3, c: 3, color: 'green' },
    { r: 0, c: 2, color: 'yellow' }, { r: 2, c: 4, color: 'yellow' },
    { r: 4, c: 2, color: 'orange' }, { r: 2, c: 0, color: 'orange' }
];

const FlowFreePage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [grid, setGrid] = useState([]); // Array of { type: 'dot'|'line'|'empty', color: String }
    const [selectedColor, setSelectedColor] = useState(null);
    const [paths, setPaths] = useState({ red: [], blue: [], green: [], yellow: [], orange: [] });
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
        let tempGrid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null).map(() => ({ type: 'empty', color: null })));
        
        INITIAL_DOTS.forEach(dot => {
            tempGrid[dot.r][dot.c] = { type: 'dot', color: dot.color };
        });

        setGrid(tempGrid);
        setSelectedColor(null);
        setPaths({ red: [], blue: [], green: [], yellow: [], orange: [] });
        setWinner(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const handleCellClick = (r, c) => {
        if (winner) return;

        const cell = grid[r][c];

        // 1. Click on a dot
        if (cell.type === 'dot') {
            playClick();
            setSelectedColor(cell.color);
            // Initialize path starting at this dot
            setPaths(prev => ({
                ...prev,
                [cell.color]: [{ r, c }]
            }));
            updateGridState(cell.color, [{ r, c }]);
            return;
        }

        // 2. Click on empty space or line while having a selected color
        if (selectedColor) {
            const currentPath = paths[selectedColor];
            if (currentPath.length === 0) return;

            const lastCell = currentPath[currentPath.length - 1];
            
            // Check if clicked cell is adjacent to the last cell in the path
            const isAdjacent = (Math.abs(r - lastCell.r) + Math.abs(c - lastCell.c)) === 1;

            if (isAdjacent) {
                // If it is the matching dot (and not the start one)
                const isTargetDot = INITIAL_DOTS.some(dot => dot.r === r && dot.c === c && dot.color === selectedColor && (dot.r !== currentPath[0].r || dot.c !== currentPath[0].c));

                // Check if target cell has another dot (different color)
                const hasWrongDot = INITIAL_DOTS.some(dot => dot.r === r && dot.c === c && dot.color !== selectedColor);

                if (hasWrongDot) {
                    playErrorSfx();
                    return;
                }

                playClick();
                const newPath = [...currentPath, { r, c }];
                
                // If it is the target dot, complete the path!
                if (isTargetDot) {
                    setSelectedColor(null);
                    playSuccessSfx();
                }

                setPaths(prev => ({
                    ...prev,
                    [selectedColor]: newPath
                }));

                // Update Grid State
                const newGrid = updateGridState(selectedColor, newPath);

                // Check Win condition
                if (checkWin(newGrid)) {
                    setWinner(true);
                    playVictorySfx();
                    registerGameCompletion('lineascolores', 'medium', timeElapsed);
                    setShowVictory(true);
                }
            } else {
                playErrorSfx();
            }
        }
    };

    const updateGridState = (color, path) => {
        // Reset old lines of this color
        let newGrid = Array(SIZE).fill(null).map((_, r) => 
            Array(SIZE).fill(null).map((_, c) => {
                const isDot = INITIAL_DOTS.find(dot => dot.r === r && dot.c === c);
                return isDot ? { type: 'dot', color: isDot.color } : { type: 'empty', color: null };
            })
        );

        // Reapply all other paths
        Object.keys(paths).forEach(pColor => {
            if (pColor === color) return;
            paths[pColor].forEach(cell => {
                const isDot = INITIAL_DOTS.some(dot => dot.r === cell.r && dot.c === cell.c);
                if (!isDot) {
                    newGrid[cell.r][cell.c] = { type: 'line', color: pColor };
                }
            });
        });

        // Apply current path
        path.forEach(cell => {
            const isDot = INITIAL_DOTS.some(dot => dot.r === cell.r && dot.c === cell.c);
            if (!isDot) {
                newGrid[cell.r][cell.c] = { type: 'line', color };
            }
        });

        setGrid(newGrid);
        return newGrid;
    };

    const checkWin = (tempGrid) => {
        // All paths must have start and end connected.
        // A path is connected if the last cell in the path is a dot of the same color,
        // and the path length is > 1.
        const colors = ['red', 'blue', 'green', 'yellow', 'orange'];
        for (let col of colors) {
            const path = paths[col];
            if (path.length <= 1) return false;
            
            const lastCell = path[path.length - 1];
            const isConnected = INITIAL_DOTS.some(dot => dot.r === lastCell.r && dot.c === lastCell.c && dot.color === col && (dot.r !== path[0].r || dot.c !== path[0].c));
            if (!isConnected) return false;
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
                    Líneas de Colores (Flow)
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

            {/* Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
                gap: '8px',
                backgroundColor: 'rgba(15, 23, 42, 0.3)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '16px',
                aspectRatio: '1',
                boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)',
                marginBottom: '20px'
            }}>
                {grid.map((row, rIdx) => (
                    row.map((cell, cIdx) => {
                        const isDot = cell.type === 'dot';
                        const isLine = cell.type === 'line';
                        const isPathSelected = selectedColor && paths[selectedColor].some(p => p.r === rIdx && p.c === cIdx);

                        return (
                            <button
                                key={`${rIdx}-${cIdx}`}
                                onClick={() => handleCellClick(rIdx, cIdx)}
                                style={{
                                    border: 'none',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                    border: isPathSelected ? `2px solid ${COLOR_HEX[selectedColor]}` : '1px solid rgba(255,255,255,0.03)',
                                    cursor: winner ? 'default' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative'
                                }}
                            >
                                {/* Dot rendering */}
                                {isDot && (
                                    <div style={{
                                        width: '26px', height: '26px', borderRadius: '50%',
                                        backgroundColor: COLOR_HEX[cell.color],
                                        boxShadow: `0 0 15px ${COLOR_HEX[cell.color]}`
                                    }} />
                                )}

                                {/* Line rendering */}
                                {isLine && (
                                    <div style={{
                                        width: '12px', height: '12px', borderRadius: '50%',
                                        backgroundColor: COLOR_HEX[cell.color],
                                        boxShadow: `0 0 8px ${COLOR_HEX[cell.color]}`
                                    }} />
                                )}
                            </button>
                        );
                    })
                ))}
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Haz clic en un punto de color y luego en casillas adyacentes vacías para dibujar un camino hasta conectar con el otro punto del mismo color.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Conexión Exitosa!"
                message="Has conectado todos los puntos de colores sin cruzar las líneas."
                timeElapsed={timeElapsed}
                onPlayAgain={initGame}
            />
        </div>
    );
};

export default FlowFreePage;
