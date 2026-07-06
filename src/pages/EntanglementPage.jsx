import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw, ArrowUp, Sparkles } from 'lucide-react';

const SIZE = 4; // 4x4 Grid

const PAIR_COLORS = [
    '#f43f5e', // Rose
    '#06b6d4', // Cyan
    '#eab308', // Yellow
    '#10b981', // Green
    '#a855f7', // Purple
    '#f97316'  // Orange
];

const EntanglementPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [grid, setGrid] = useState([]); // Array of { id, dir: 0-3, pairId: 1-6|null, color: Hex|null }
    const [moves, setMoves] = useState(0);
    const [winner, setWinner] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [hoveredPairId, setHoveredPairId] = useState(null);
    const [lastClickedIds, setLastClickedIds] = useState([]); // Array of ids to animate path link

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
        // Initialize 16 cells (4x4)
        let cells = [];
        for (let i = 0; i < SIZE * SIZE; i++) {
            cells.push({
                id: i,
                dir: Math.floor(Math.random() * 4), // 0: Up, 1: Right, 2: Down, 3: Left
                pairId: null,
                color: null
            });
        }

        // Entangle 6 pairs (12 cells total). Remaining 4 cells are static/independent.
        let availableIndices = Array.from({ length: SIZE * SIZE }, (_, i) => i);
        // Shuffle available indices
        availableIndices.sort(() => 0.5 - Math.random());

        for (let pairNum = 1; pairNum <= 6; pairNum++) {
            const idx1 = availableIndices.pop();
            const idx2 = availableIndices.pop();
            const color = PAIR_COLORS[pairNum - 1];

            cells[idx1].pairId = pairNum;
            cells[idx1].color = color;
            cells[idx2].pairId = pairNum;
            cells[idx2].color = color;
        }

        // Verify that the initial board is not already solved
        const isSolved = cells.every(c => c.dir === 0);
        if (isSolved) {
            // Force at least one cell to be rotated
            cells[0].dir = 1;
        }

        setGrid(cells);
        setMoves(0);
        setWinner(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
        setLastClickedIds([]);
    };

    const handleCellClick = (id) => {
        if (winner) return;

        playClick();
        setMoves(prev => prev + 1);

        const newGrid = grid.map(c => ({ ...c }));
        const cell = newGrid.find(c => c.id === id);

        // 1. Rotate clicked cell Clockwise (dir + 1)
        cell.dir = (cell.dir + 1) % 4;
        let animatedIds = [id];

        // 2. Rotate entangled partner Counter-Clockwise (dir - 1)
        if (cell.pairId !== null) {
            const partner = newGrid.find(c => c.pairId === cell.pairId && c.id !== id);
            if (partner) {
                partner.dir = (partner.dir - 1 + 4) % 4;
                animatedIds.push(partner.id);
            }
        }

        setGrid(newGrid);
        setLastClickedIds(animatedIds);

        // Check win condition (all dirs are 0 - pointing Up)
        const allAligned = newGrid.every(c => c.dir === 0);
        if (allAligned) {
            setWinner(true);
            playVictorySfx();
            registerGameCompletion('entrelazamiento', 'medium', timeElapsed, moves + 1);
            setShowVictory(true);
        }
    };

    const getArrowRotation = (dir) => {
        return `rotate(${dir * 90}deg)`;
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
            animation: 'fadeIn 0.5s ease', textAlign: 'center', position: 'relative'
        }}>
            <div className="background-effects">
                <div className="glow-orb" style={{ backgroundColor: hoveredPairId ? PAIR_COLORS[hoveredPairId - 1] : 'var(--primary)', opacity: 0.15 }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={16} color="var(--primary)" /> Enredo Cuántico (Original)
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

            {/* Stats */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <span>Movimientos: <strong>{moves}</strong></span>
                <span>Alineados: <strong>{grid.filter(c => c.dir === 0).length} / 16</strong></span>
            </div>

            {/* Quantum grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
                gap: '12px',
                backgroundColor: 'rgba(15, 23, 42, 0.3)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '16px',
                aspectRatio: '1',
                boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* SVG Laser Line Overlay */}
                {hoveredPairId !== null && (() => {
                    const entangledCells = grid.filter(c => c.pairId === hoveredPairId);
                    if (entangledCells.length === 2) {
                        const [c1, c2] = entangledCells;
                        const r1 = Math.floor(c1.id / SIZE);
                        const col1 = c1.id % SIZE;
                        const r2 = Math.floor(c2.id / SIZE);
                        const col2 = c2.id % SIZE;

                        const x1 = 12.5 + col1 * 25;
                        const y1 = 12.5 + r1 * 25;
                        const x2 = 12.5 + col2 * 25;
                        const y2 = 12.5 + r2 * 25;
                        const pairColor = PAIR_COLORS[hoveredPairId - 1];

                        return (
                            <svg style={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                pointerEvents: 'none', zIndex: 1
                            }}>
                                <line
                                    x1={`${x1}%`} y1={`${y1}%`}
                                    x2={`${x2}%`} y2={`${y2}%`}
                                    stroke={pairColor}
                                    strokeWidth="3"
                                    strokeDasharray="8 6"
                                    className="laser-line"
                                    style={{ filter: `drop-shadow(0 0 10px ${pairColor})` }}
                                />
                            </svg>
                        );
                    }
                    return null;
                })()}

                {grid.map(cell => {
                    const isHovered = hoveredPairId !== null && cell.pairId === hoveredPairId;
                    const isLastClicked = lastClickedIds.includes(cell.id);

                    return (
                        <button
                            key={cell.id}
                            onClick={() => handleCellClick(cell.id)}
                            onMouseEnter={() => cell.pairId && setHoveredPairId(cell.pairId)}
                            onMouseLeave={() => setHoveredPairId(null)}
                            style={{
                                border: 'none',
                                borderRadius: '14px',
                                backgroundColor: isHovered 
                                    ? 'rgba(255, 255, 255, 0.08)' 
                                    : 'rgba(255, 255, 255, 0.03)',
                                border: cell.color 
                                    ? `2px solid ${cell.color}` 
                                    : '1px dashed var(--border)',
                                cursor: winner ? 'default' : 'pointer',
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                zIndex: 2,
                                boxShadow: isHovered 
                                    ? `0 0 15px ${cell.color}` 
                                    : cell.color 
                                        ? `0 0 4px ${cell.color}40` 
                                        : 'none',
                                animation: isLastClicked ? 'energyPulse 0.4s ease-out' : 'none'
                            }}
                        >
                            {/* Glow node dot */}
                            {cell.color && (
                                <div style={{
                                    position: 'absolute', top: '6px', right: '6px',
                                    width: '6px', height: '6px', borderRadius: '50%',
                                    backgroundColor: cell.color,
                                    boxShadow: `0 0 8px ${cell.color}`
                                }} />
                            )}

                            {/* Arrow indicator */}
                            <ArrowUp
                                size={26}
                                style={{
                                    color: cell.dir === 0 ? '#10b981' : 'var(--text-main)',
                                    transform: getArrowRotation(cell.dir),
                                    transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.3s'
                                }}
                            />
                        </button>
                    );
                })}
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Consigue que todas las flechas apunten hacia arriba ⬆️. Las partículas con el mismo color de borde están <strong>entrelazadas</strong>: girar una hará girar a su pareja en sentido contrario.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Resonancia Completa!"
                message={`Has alineado todas las partículas cuánticas en ${moves} movimientos.`}
                timeElapsed={timeElapsed}
                onPlayAgain={initGame}
            />

            <style>{`
                @keyframes energyPulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.08); filter: brightness(1.2); }
                    100% { transform: scale(1); }
                }
                @keyframes laserSlide {
                    to { stroke-dashoffset: -28; }
                }
                .laser-line {
                    animation: laserSlide 0.8s linear infinite;
                }
                .glow-orb {
                    position: absolute;
                    width: 250px;
                    height: 250px;
                    border-radius: 50%;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    filter: blur(80px);
                    transition: background-color 0.5s ease;
                    pointer-events: none;
                    z-index: 0;
                }
            `}</style>
        </div>
    );
};

export default EntanglementPage;
