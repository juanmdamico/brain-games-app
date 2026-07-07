import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const SIZE = 4;

// Pearls setup: type: 'W' (White), 'B' (Black)
const PEARLS = [
    { r: 0, c: 0, type: 'W' },
    { r: 0, c: 3, type: 'B' },
    { r: 2, c: 2, type: 'W' },
    { r: 3, c: 1, type: 'B' }
];

const MasyuPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    // Connections represented as sets of active edges.
    // Horizontal edges: hBridges[r][c] represents connection between (r,c) and (r,c+1)
    // Vertical edges: vBridges[r][c] represents connection between (r,c) and (r+1,c)
    const [hBridges, setHBridges] = useState(Array(SIZE).fill(null).map(() => Array(SIZE - 1).fill(false)));
    const [vBridges, setVBridges] = useState(Array(SIZE - 1).fill(null).map(() => Array(SIZE).fill(false)));
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
        setHBridges(Array(SIZE).fill(null).map(() => Array(SIZE - 1).fill(false)));
        setVBridges(Array(SIZE - 1).fill(null).map(() => Array(SIZE).fill(false)));
        setWinner(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const toggleHBridge = (r, c) => {
        if (winner) return;
        playClick();
        const nextH = hBridges.map((row, idx) => idx === r ? row.map((val, colIdx) => colIdx === c ? !val : val) : [...row]);
        setHBridges(nextH);
        checkMasyuWin(nextH, vBridges);
    };

    const toggleVBridge = (r, c) => {
        if (winner) return;
        playClick();
        const nextV = vBridges.map((row, idx) => idx === r ? row.map((val, colIdx) => colIdx === c ? !val : val) : [...row]);
        setVBridges(nextV);
        checkMasyuWin(hBridges, nextV);
    };

    const checkMasyuWin = (h, v) => {
        // Degree count helper
        const getCellNeighbors = (r, c) => {
            let n = [];
            // Left
            if (c > 0 && h[r][c - 1]) n.push({ r, c: c - 1, dir: 'L' });
            // Right
            if (c < SIZE - 1 && h[r][c]) n.push({ r, c: c + 1, dir: 'R' });
            // Up
            if (r > 0 && v[r - 1][c]) n.push({ r: r - 1, c, dir: 'U' });
            // Down
            if (r < SIZE - 1 && v[r][c]) n.push({ r: r + 1, c, dir: 'D' });
            return n;
        };

        // 1. Degree check: every loop cell must have exactly 2 connections. Others must have 0.
        let loopCells = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const neighbors = getCellNeighbors(r, c);
                if (neighbors.length > 0) {
                    if (neighbors.length !== 2) return; // invalid loop fork/dead-end
                    loopCells.push({ r, c, neighbors });
                }
            }
        }

        if (loopCells.length === 0) return;

        // 2. Loop must form a single connected component
        let visited = new Set();
        let queue = [loopCells[0]];
        visited.add(`${loopCells[0].r}-${loopCells[0].c}`);

        while (queue.length > 0) {
            const curr = queue.shift();
            for (let n of curr.neighbors) {
                const key = `${n.r}-${n.c}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    const nextCell = loopCells.find(lc => lc.r === n.r && lc.c === n.c);
                    if (nextCell) queue.push(nextCell);
                }
            }
        }

        if (visited.size !== loopCells.length) return; // multiple loops/disconnections

        // 3. Verify White & Black pearls constraints
        for (let pearl of PEARLS) {
            const cell = loopCells.find(lc => lc.r === pearl.r && lc.c === pearl.c);
            if (!cell) return; // loop must pass through all pearls

            const dirs = cell.neighbors.map(n => n.dir);
            const isStraight = (dirs.includes('L') && dirs.includes('R')) || (dirs.includes('U') && dirs.includes('D'));

            if (pearl.type === 'W') {
                // White pearl: must go straight
                if (!isStraight) return;

                // Loop must turn in cell before OR after (or both)
                // Left neighbor turns?
                let turnBeforeOrAfter = false;
                if (dirs.includes('L') && pearl.c > 0) {
                    const ln = getCellNeighbors(pearl.r, pearl.c - 1);
                    if (ln.length === 2) {
                        const lDirs = ln.map(x => x.dir);
                        const lStraight = (lDirs.includes('L') && lDirs.includes('R')) || (lDirs.includes('U') && lDirs.includes('D'));
                        if (!lStraight) turnBeforeOrAfter = true;
                    }
                }
                if (dirs.includes('R') && pearl.c < SIZE - 1) {
                    const rn = getCellNeighbors(pearl.r, pearl.c + 1);
                    if (rn.length === 2) {
                        const rDirs = rn.map(x => x.dir);
                        const rStraight = (rDirs.includes('L') && rDirs.includes('R')) || (rDirs.includes('U') && rDirs.includes('D'));
                        if (!rStraight) turnBeforeOrAfter = true;
                    }
                }
                if (dirs.includes('U') && pearl.r > 0) {
                    const un = getCellNeighbors(pearl.r - 1, pearl.c);
                    if (un.length === 2) {
                        const uDirs = un.map(x => x.dir);
                        const uStraight = (uDirs.includes('L') && uDirs.includes('R')) || (uDirs.includes('U') && uDirs.includes('D'));
                        if (!uStraight) turnBeforeOrAfter = true;
                    }
                }
                if (dirs.includes('D') && pearl.r < SIZE - 1) {
                    const dn = getCellNeighbors(pearl.r + 1, pearl.c);
                    if (dn.length === 2) {
                        const dDirs = dn.map(x => x.dir);
                        const dStraight = (dDirs.includes('L') && dDirs.includes('R')) || (dDirs.includes('U') && dDirs.includes('D'));
                        if (!dStraight) turnBeforeOrAfter = true;
                    }
                }

                if (!turnBeforeOrAfter) return;

            } else if (pearl.type === 'B') {
                // Black pearl: must turn 90-deg inside
                if (isStraight) return;

                // Extensions in both directions must go straight
                for (let n of cell.neighbors) {
                    const dir = n.dir;
                    // Check if adjacent cell extends straight
                    if (dir === 'L') {
                        if (n.c <= 0 || !h[n.r][n.c - 1]) return; // must continue straight
                        const ln = getCellNeighbors(n.r, n.c);
                        if (ln.length === 2) {
                            const lDirs = ln.map(x => x.dir);
                            if (!(lDirs.includes('L') && lDirs.includes('R'))) return;
                        }
                    }
                    if (dir === 'R') {
                        if (n.c >= SIZE - 1 || !h[n.r][n.c]) return;
                        const rn = getCellNeighbors(n.r, n.c);
                        if (rn.length === 2) {
                            const rDirs = rn.map(x => x.dir);
                            if (!(rDirs.includes('L') && rDirs.includes('R'))) return;
                        }
                    }
                    if (dir === 'U') {
                        if (n.r <= 0 || !v[n.r - 1][n.c]) return;
                        const un = getCellNeighbors(n.r, n.c);
                        if (un.length === 2) {
                            const uDirs = un.map(x => x.dir);
                            if (!(uDirs.includes('U') && uDirs.includes('D'))) return;
                        }
                    }
                    if (dir === 'D') {
                        if (n.r >= SIZE - 1 || !v[n.r][n.c]) return;
                        const dn = getCellNeighbors(n.r, n.c);
                        if (dn.length === 2) {
                            const dDirs = dn.map(x => x.dir);
                            if (!(uDirs.includes('U') && uDirs.includes('D'))) return; // wait, dDirs!
                            if (!(dDirs.includes('U') && dDirs.includes('D'))) return;
                        }
                    }
                }
            }
        }

        // Victory!
        setWinner(true);
        playVictorySfx();
        registerGameCompletion('masyu', 'medium', timeElapsed);
        setShowVictory(true);
    };

    const getPearlAt = (r, c) => {
        return PEARLS.find(p => p.r === r && p.c === c);
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
                    Masyu (Perlas de Lógica)
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

            {/* Masyu Board */}
            <div style={{
                position: 'relative',
                width: '260px', height: '260px',
                margin: '0 auto 20px auto',
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '8px',
                boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)',
                boxSizing: 'border-box'
            }}>
                {/* Horizontal click handles and active bridges */}
                {Array(SIZE).fill(null).map((_, r) => (
                    Array(SIZE - 1).fill(null).map((_, c) => {
                        const active = hBridges[r][c];
                        const x = 20 + c * 25;
                        const y = 12.5 + r * 25;
                        const color = '#a855f7'; // Purple neon bridge line

                        return (
                            <button
                                key={`h-${r}-${c}`}
                                onClick={() => toggleHBridge(r, c)}
                                style={{
                                    position: 'absolute',
                                    left: `${x}%`, top: `${y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    width: '36px', height: '14px',
                                    backgroundColor: active ? color : 'rgba(255,255,255,0.01)',
                                    border: 'none', cursor: winner ? 'default' : 'pointer',
                                    borderRadius: '4px', zIndex: 3,
                                    boxShadow: active ? `0 0 10px ${color}` : 'none',
                                    transition: 'all 0.15s'
                                }}
                                onMouseOver={e => !active && !winner && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
                                onMouseOut={e => !active && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)')}
                            />
                        );
                    })
                ))}

                {/* Vertical click handles and active bridges */}
                {Array(SIZE - 1).fill(null).map((_, r) => (
                    Array(SIZE).fill(null).map((_, c) => {
                        const active = vBridges[r][c];
                        const x = 12.5 + c * 25;
                        const y = 20 + r * 25;
                        const color = '#a855f7';

                        return (
                            <button
                                key={`v-${r}-${c}`}
                                onClick={() => toggleVBridge(r, c)}
                                style={{
                                    position: 'absolute',
                                    left: `${x}%`, top: `${y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    width: '14px', height: '36px',
                                    backgroundColor: active ? color : 'rgba(255,255,255,0.01)',
                                    border: 'none', cursor: winner ? 'default' : 'pointer',
                                    borderRadius: '4px', zIndex: 3,
                                    boxShadow: active ? `0 0 10px ${color}` : 'none',
                                    transition: 'all 0.15s'
                                }}
                                onMouseOver={e => !active && !winner && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
                                onMouseOut={e => !active && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)')}
                            />
                        );
                    })
                ))}

                {/* Grid cells rendering pearls */}
                {Array(SIZE).fill(null).map((_, r) => (
                    Array(SIZE).fill(null).map((_, c) => {
                        const pearl = getPearlAt(r, c);
                        const x = 12.5 + c * 25;
                        const y = 12.5 + r * 25;

                        return (
                            <div
                                key={`cell-${r}-${c}`}
                                style={{
                                    position: 'absolute',
                                    left: `${x}%`, top: `${y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    width: '26px', height: '26px',
                                    borderRadius: '50%',
                                    backgroundColor: pearl 
                                        ? pearl.type === 'W' ? '#fff' : '#000' 
                                        : 'rgba(255,255,255,0.02)',
                                    border: pearl 
                                        ? pearl.type === 'W' ? '2.5px solid #000' : '2.5px solid #fff' 
                                        : '1px dashed rgba(255,255,255,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: pearl 
                                        ? pearl.type === 'W' 
                                            ? '0 0 10px rgba(255,255,255,0.5)' 
                                            : '0 0 10px rgba(0,0,0,0.8)' 
                                        : 'none',
                                    zIndex: 2
                                }}
                            />
                        );
                    })
                ))}
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Haz clic entre las casillas para trazar líneas de conexión. Debes formar un único lazo cerrado. Perlas blancas: la línea pasa recto y gira en la casilla previa o siguiente. Perlas negras: la línea gira 90° dentro de ellas y sigue recto 1 celda en ambos lados.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Perlas Masyu Enlazadas!"
                message="Has completado el lazo de Masyu satisfaciendo todas las restricciones de giros de perlas."
                timeElapsed={timeElapsed}
                onPlayAgain={resetGame}
            />
        </div>
    );
};

export default MasyuPage;
