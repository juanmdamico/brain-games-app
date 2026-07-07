import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const SIZE = 5;

// Islands definition: coordinates and target bridge count
const ISLANDS = [
    { id: 0, r: 0, c: 0, target: 1 },
    { id: 1, r: 0, c: 2, target: 3 },
    { id: 2, r: 0, c: 4, target: 1 },
    { id: 3, r: 2, c: 0, target: 2 },
    { id: 4, r: 2, c: 2, target: 6 },
    { id: 5, r: 2, c: 4, target: 2 },
    { id: 6, r: 4, c: 2, target: 3 },
    { id: 7, r: 4, c: 4, target: 2 }
];

const HashiPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [bridges, setBridges] = useState([]); // Array of { id1, id2, count: 1|2, key: String }
    const [selectedIslandId, setSelectedIslandId] = useState(null);
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
        setBridges([]);
        setSelectedIslandId(null);
        setWinner(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    // Calculate current bridge count for a specific island
    const getConnectedBridgeCount = (islandId) => {
        let count = 0;
        bridges.forEach(b => {
            if (b.id1 === islandId || b.id2 === islandId) {
                count += b.count;
            }
        });
        return count;
    };

    const handleIslandClick = (islandId) => {
        if (winner) return;

        if (selectedIslandId === null) {
            playClick();
            setSelectedIslandId(islandId);
        } else if (selectedIslandId === islandId) {
            playClick();
            setSelectedIslandId(null);
        } else {
            // Attempt to build/cycle bridge between selected and clicked island
            const id1 = selectedIslandId;
            const id2 = islandId;

            if (isValidBridge(id1, id2)) {
                playClick();
                cycleBridge(id1, id2);
            } else {
                playErrorSfx();
            }
            setSelectedIslandId(null);
        }
    };

    const isValidBridge = (id1, id2) => {
        const isl1 = ISLANDS.find(i => i.id === id1);
        const isl2 = ISLANDS.find(i => i.id === id2);

        // 1. Must be orthogonal (same row or same col)
        const isHorizontal = isl1.r === isl2.r;
        const isVertical = isl1.c === isl2.c;
        if (!isHorizontal && !isVertical) return false;

        // 2. Must not have other islands in between
        const minR = Math.min(isl1.r, isl2.r);
        const maxR = Math.max(isl1.r, isl2.r);
        const minC = Math.min(isl1.c, isl2.c);
        const maxC = Math.max(isl1.c, isl2.c);

        for (let isl of ISLANDS) {
            if (isl.id === id1 || isl.id === id2) continue;
            if (isHorizontal && isl.r === isl1.r && isl.c > minC && isl.c < maxC) return false;
            if (isVertical && isl.c === isl1.c && isl.r > minR && isl.r < maxR) return false;
        }

        // 3. Must not cross existing bridges
        const key = getBridgeKey(id1, id2);
        for (let b of bridges) {
            if (b.key === key) continue; // sharing same connection is fine

            const b1 = ISLANDS.find(i => i.id === b.id1);
            const b2 = ISLANDS.find(i => i.id === b.id2);
            
            const bIsHorizontal = b1.r === b2.r;

            // Horizontal crosses vertical?
            if (isHorizontal && !bIsHorizontal) {
                // b is vertical. check crossing.
                const bMinR = Math.min(b1.r, b2.r);
                const bMaxR = Math.max(b1.r, b2.r);
                if (b1.c > minC && b1.c < maxC && isl1.r > bMinR && isl1.r < bMaxR) return false;
            }
            if (isVertical && bIsHorizontal) {
                // b is horizontal. check crossing.
                const bMinC = Math.min(b1.c, b2.c);
                const bMaxC = Math.max(b1.c, b2.c);
                if (b1.r > minR && b1.r < maxR && isl1.c > bMinC && isl1.c < bMaxC) return false;
            }
        }

        return true;
    };

    const getBridgeKey = (id1, id2) => {
        return id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
    };

    const cycleBridge = (id1, id2) => {
        const key = getBridgeKey(id1, id2);
        const existingIdx = bridges.findIndex(b => b.key === key);

        let newBridges = [...bridges];

        if (existingIdx === -1) {
            // 0 -> 1 bridge
            newBridges.push({ id1, id2, count: 1, key });
        } else if (newBridges[existingIdx].count === 1) {
            // 1 -> 2 bridges
            newBridges[existingIdx].count = 2;
        } else {
            // 2 -> 0 bridges
            newBridges.splice(existingIdx, 1);
        }

        setBridges(newBridges);

        // Check Win condition
        if (checkWin(newBridges)) {
            setWinner(true);
            playVictorySfx();
            registerGameCompletion('hashi', 'medium', timeElapsed);
            setShowVictory(true);
        }
    };

    const checkWin = (tempBridges) => {
        // 1. Every island's connected bridge count must match its target exactly
        for (let isl of ISLANDS) {
            let count = 0;
            tempBridges.forEach(b => {
                if (b.id1 === isl.id || b.id2 === isl.id) {
                    count += b.count;
                }
            });
            if (count !== isl.target) return false;
        }

        // 2. All islands must form a single connected component (no separate sub-graphs)
        if (ISLANDS.length === 0) return true;
        
        let visited = new Set();
        let queue = [ISLANDS[0].id];
        visited.add(ISLANDS[0].id);

        while (queue.length > 0) {
            const curr = queue.shift();
            // Find neighbors in bridges
            tempBridges.forEach(b => {
                let neighbor = null;
                if (b.id1 === curr) neighbor = b.id2;
                else if (b.id2 === curr) neighbor = b.id1;

                if (neighbor !== null && !visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            });
        }

        return visited.size === ISLANDS.length;
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
                    Hashi (Puentes)
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

            {/* Grid Container */}
            <div style={{
                position: 'relative',
                width: '320px', height: '320px',
                margin: '0 auto 20px auto',
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)',
                boxSizing: 'border-box'
            }}>
                {/* SVG Bridges layer */}
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                    {bridges.map((b, idx) => {
                        const isl1 = ISLANDS.find(i => i.id === b.id1);
                        const isl2 = ISLANDS.find(i => i.id === b.id2);
                        
                        // Convert row/col to pixel coordinate percentages (from 10% to 90%)
                        const x1 = 15 + isl1.c * 17.5;
                        const y1 = 15 + isl1.r * 17.5;
                        const x2 = 15 + isl2.c * 17.5;
                        const y2 = 15 + isl2.r * 17.5;

                        const isHorizontal = isl1.r === isl2.r;
                        const color = '#3b82f6'; // Neon blue glow bridges
                        
                        if (b.count === 1) {
                            return (
                                <line
                                    key={idx}
                                    x1={`${x1}%`} y1={`${y1}%`}
                                    x2={`${x2}%`} y2={`${y2}%`}
                                    stroke={color}
                                    strokeWidth="3.5"
                                    style={{ filter: `drop-shadow(0 0 4px ${color})` }}
                                />
                            );
                        } else {
                            // Double bridge: draw two parallel lines offset slightly
                            const offset = 4;
                            const dx = isHorizontal ? 0 : offset;
                            const dy = isHorizontal ? offset : 0;

                            return (
                                <g key={idx}>
                                    <line
                                        x1={`calc(${x1}% - ${dx}px)`} y1={`calc(${y1}% - ${dy}px)`}
                                        x2={`calc(${x2}% - ${dx}px)`} y2={`calc(${y2}% - ${dy}px)`}
                                        stroke={color}
                                        strokeWidth="2.5"
                                        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
                                    />
                                    <line
                                        x1={`calc(${x1}% + ${dx}px)`} y1={`calc(${y1}% + ${dy}px)`}
                                        x2={`calc(${x2}% + ${dx}px)`} y2={`calc(${y2}% + ${dy}px)`}
                                        stroke={color}
                                        strokeWidth="2.5"
                                        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
                                    />
                                </g>
                            );
                        }
                    })}
                </svg>

                {/* Islands elements */}
                {ISLANDS.map(isl => {
                    const isSelected = selectedIslandId === isl.id;
                    const count = getConnectedBridgeCount(isl.id);
                    const isCorrect = count === isl.target;
                    const isOverLimit = count > isl.target;

                    // Grid layout coordinate mapping (same as SVG calculations)
                    const x = 15 + isl.c * 17.5;
                    const y = 15 + isl.r * 17.5;

                    return (
                        <button
                            key={isl.id}
                            onClick={() => handleIslandClick(isl.id)}
                            style={{
                                position: 'absolute',
                                left: `${x}%`, top: `${y}%`,
                                transform: 'translate(-50%, -50%)',
                                width: '38px', height: '38px',
                                borderRadius: '50%',
                                border: isSelected 
                                    ? '2.5px solid var(--primary)' 
                                    : isCorrect 
                                        ? '2px solid #10b981' 
                                        : isOverLimit 
                                            ? '2px solid #ef4444' 
                                            : '2px solid rgba(255,255,255,0.4)',
                                backgroundColor: isSelected 
                                    ? 'rgba(59, 130, 246, 0.25)' 
                                    : isCorrect 
                                        ? 'rgba(16, 185, 129, 0.15)' 
                                        : 'rgba(15, 23, 42, 0.95)',
                                color: isCorrect ? '#34d399' : isOverLimit ? '#f87171' : 'white',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                cursor: winner ? 'default' : 'pointer',
                                zIndex: 2,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s',
                                boxShadow: isCorrect 
                                    ? '0 0 10px rgba(16, 185, 129, 0.4)' 
                                    : isSelected 
                                        ? '0 0 12px rgba(59, 130, 246, 0.6)' 
                                        : 'none'
                            }}
                        >
                            {isl.target}
                        </button>
                    );
                })}
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Haz clic en una isla de origen y luego en una isla vecina ortogonal para crear/sumar puentes. Cada número indica la cantidad exacta de puentes que deben conectarse a esa isla. Todos los puentes deben interconectar todo en una sola red.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Puentes Completados!"
                message="Has interconectado todas las islas correctamente respetando las reglas de cruce."
                timeElapsed={timeElapsed}
                onPlayAgain={resetGame}
            />
        </div>
    );
};

export default HashiPage;
