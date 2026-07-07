import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const SIZE = 5;

// Region ID grid
const REGIONS = [
    [0, 0, 1, 1, 1],
    [0, 0, 1, 1, 2],
    [0, 3, 3, 3, 2],
    [4, 4, 3, 3, 2],
    [4, 4, 4, 2, 2]
];

// Region border colors
const REGION_COLORS = [
    '#f43f5e', // Rose
    '#3b82f6', // Blue
    '#10b981', // Green
    '#a855f7', // Purple
    '#fbbf24'  // Yellow
];

const StarBattlePage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    // Grid values: 0 = empty, 1 = star, 2 = cross (X)
    const [grid, setGrid] = useState(Array(SIZE).fill(null).map(() => Array(SIZE).fill(0)));
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
        setGrid(Array(SIZE).fill(null).map(() => Array(SIZE).fill(0)));
        setWinner(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const handleCellClick = (r, c) => {
        if (winner) return;

        playClick();
        const newGrid = grid.map(row => [...row]);
        const val = newGrid[r][c];

        // Toggle state: 0 (empty) -> 1 (star) -> 2 (cross) -> 0
        newGrid[r][c] = (val + 1) % 3;
        setGrid(newGrid);

        // Run validation
        if (validateStarBattle(newGrid)) {
            setWinner(true);
            playVictorySfx();
            registerGameCompletion('starbattle', 'medium', timeElapsed);
            setShowVictory(true);
        }
    };

    const validateStarBattle = (currentGrid) => {
        // Find all star coordinates
        const stars = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (currentGrid[r][c] === 1) {
                    stars.push({ r, c, region: REGIONS[r][c] });
                }
            }
        }

        // 1. Must be exactly 5 stars in total (1 per row, column, and region)
        if (stars.length !== SIZE) return false;

        // 2. Row uniqueness check
        const rows = stars.map(s => s.r);
        if (new Set(rows).size !== SIZE) return false;

        // 3. Col uniqueness check
        const cols = stars.map(s => s.c);
        if (new Set(cols).size !== SIZE) return false;

        // 4. Region uniqueness check
        const regions = stars.map(s => s.region);
        if (new Set(regions).size !== SIZE) return false;

        // 5. Adjacency check: no two stars can touch (even diagonally)
        for (let i = 0; i < stars.length; i++) {
            for (let j = i + 1; j < stars.length; j++) {
                const dr = Math.abs(stars[i].r - stars[j].r);
                const dc = Math.abs(stars[i].c - stars[j].c);
                if (dr <= 1 && dc <= 1) return false;
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
                    Star Battle (Batalla de Estrellas)
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

            {/* Grid Map */}
            <div style={{
                display: 'inline-flex',
                flexDirection: 'column',
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                border: '2px solid rgba(255,255,255,0.05)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)',
                marginBottom: '20px'
            }}>
                {grid.map((row, r) => (
                    <div key={r} style={{ display: 'flex' }}>
                        {row.map((cell, c) => {
                            const regionId = REGIONS[r][c];
                            const color = REGION_COLORS[regionId];

                            // Thicker borders for region boundaries
                            const borderBottom = (r < SIZE - 1 && REGIONS[r+1][c] !== regionId) ? `2.5px solid ${color}` : '1px solid rgba(255,255,255,0.03)';
                            const borderRight = (c < SIZE - 1 && REGIONS[r][c+1] !== regionId) ? `2.5px solid ${color}` : '1px solid rgba(255,255,255,0.03)';

                            return (
                                <button
                                    key={c}
                                    onClick={() => handleCellClick(r, c)}
                                    style={{
                                        width: '46px', height: '46px', margin: '2px',
                                        backgroundColor: cell === 1 ? 'rgba(251, 191, 36, 0.08)' : 'rgba(255,255,255,0.01)',
                                        borderTop: '1px solid rgba(255,255,255,0.03)',
                                        borderLeft: '1px solid rgba(255,255,255,0.03)',
                                        borderBottom, borderRight,
                                        borderRadius: '8px',
                                        cursor: winner ? 'default' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.4rem', color: 'white',
                                        transition: 'all 0.15s',
                                        boxShadow: cell === 1 ? '0 0 10px rgba(251, 191, 36, 0.2)' : 'none'
                                    }}
                                >
                                    {cell === 1 && (
                                        <span style={{ color: '#fbbf24', textShadow: '0 0 10px #fbbf24' }}>★</span>
                                    )}
                                    {cell === 2 && (
                                        <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '1rem' }}>×</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Coloca exactamente 1 estrella ★ en cada fila, columna y región de color. Las estrellas no pueden tocarse entre sí, ni siquiera en diagonal. Haz clic para alternar: Vacío ➔ Estrella ➔ Marca (X).</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Batalla de Estrellas Ganada!"
                message="Has colocado todas las estrellas respetando la separación espacial y las regiones."
                timeElapsed={timeElapsed}
                onPlayAgain={resetGame}
            />
        </div>
    );
};

export default StarBattlePage;
