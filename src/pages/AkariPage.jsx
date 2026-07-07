import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const SIZE = 5;

// Board representation:
// null = White cell
// 0, 1, 2, 3, 4 = Numbered black blocks
// 5 = Unnumbered black block
const BLOCKS = [
    [null, null, 0, null, null],
    [null, null, null, null, null],
    [1, null, 5, null, 2],
    [null, null, null, null, null],
    [null, null, 1, null, null]
];

const AkariPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [bulbs, setBulbs] = useState(Array(SIZE).fill(null).map(() => Array(SIZE).fill(false)));
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
        setBulbs(Array(SIZE).fill(null).map(() => Array(SIZE).fill(false)));
        setWinner(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const handleCellClick = (r, c) => {
        if (winner || BLOCKS[r][c] !== null) return;

        playClick();
        const newBulbs = bulbs.map(row => [...row]);
        newBulbs[r][c] = !newBulbs[r][c];
        setBulbs(newBulbs);

        // Run validation
        if (validateAkari(newBulbs)) {
            setWinner(true);
            playVictorySfx();
            registerGameCompletion('akari', 'medium', timeElapsed);
            setShowVictory(true);
        }
    };

    // Helper to check if cell is illuminated
    const isIlluminated = (r, c, currentBulbs) => {
        if (BLOCKS[r][c] !== null) return false;
        if (currentBulbs[r][c]) return true;

        const dirs = [[-1,0], [1,0], [0,-1], [0,1]];
        for (let [dr, dc] of dirs) {
            let currR = r + dr;
            let currC = c + dc;
            while (currR >= 0 && currR < SIZE && currC >= 0 && currC < SIZE) {
                if (BLOCKS[currR][currC] !== null) break; // block blocks light
                if (currentBulbs[currR][currC]) return true;
                currR += dr;
                currC += dc;
            }
        }
        return false;
    };

    const validateAkari = (currentBulbs) => {
        // 1. Bulbs cannot see each other
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (currentBulbs[r][c]) {
                    // Search in all 4 directions
                    const dirs = [[-1,0], [1,0], [0,-1], [0,1]];
                    for (let [dr, dc] of dirs) {
                        let currR = r + dr;
                        let currC = c + dc;
                        while (currR >= 0 && currR < SIZE && currC >= 0 && currC < SIZE) {
                            if (BLOCKS[currR][currC] !== null) break;
                            if (currentBulbs[currR][currC]) return false; // Clash!
                            currR += dr;
                            currC += dc;
                        }
                    }
                }
            }
        }

        // 2. All white cells must be illuminated
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (BLOCKS[r][c] === null && !isIlluminated(r, c, currentBulbs)) {
                    return false; // found unlit cell
                }
            }
        }

        // 3. Numbered black cells must have matching adjacent bulb counts
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const blockVal = BLOCKS[r][c];
                if (blockVal !== null && blockVal >= 0 && blockVal <= 4) {
                    let adjBulbs = 0;
                    const adjs = [[-1,0], [1,0], [0,-1], [0,1]];
                    for (let [dr, dc] of adjs) {
                        const adjR = r + dr;
                        const adjC = c + dc;
                        if (adjR >= 0 && adjR < SIZE && adjC >= 0 && adjC < SIZE) {
                            if (currentBulbs[adjR][adjC]) adjBulbs++;
                        }
                    }
                    if (adjBulbs !== blockVal) return false;
                }
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
                    Akari (Ilumina el Laberinto)
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

            {/* Akari Board */}
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
                {BLOCKS.map((row, r) => (
                    <div key={r} style={{ display: 'flex' }}>
                        {row.map((block, c) => {
                            const isBlock = block !== null;
                            const hasBulb = bulbs[r][c];
                            const isLit = isIlluminated(r, c, bulbs);

                            let cellBg = 'rgba(255, 255, 255, 0.01)';
                            let cellBorder = '1px solid rgba(255, 255, 255, 0.02)';
                            let cellShadow = 'none';
                            let displayContent = null;

                            if (isBlock) {
                                // Black block look
                                cellBg = 'linear-gradient(135deg, #1e293b, #0f172a)';
                                cellBorder = '1.5px solid rgba(255, 255, 255, 0.15)';
                                cellShadow = '0 2px 4px rgba(0,0,0,0.5)';
                                displayContent = block <= 4 ? (
                                    <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem', textShadow: '0 0 5px rgba(59,130,246,0.3)' }}>
                                        {block}
                                    </span>
                                ) : null;
                            } else {
                                // White cell
                                if (hasBulb) {
                                    // Bulb cell
                                    cellBg = 'radial-gradient(circle, #fef08a, #eab308)';
                                    cellShadow = '0 0 15px #eab308, inset 0 2px 4px rgba(255,255,255,0.4)';
                                    cellBorder = '1px solid #fde047';
                                    displayContent = <span style={{ fontSize: '1.2rem' }}>💡</span>;
                                } else if (isLit) {
                                    // Illuminated cell
                                    cellBg = 'rgba(234, 179, 8, 0.12)';
                                    cellBorder = '1px dashed rgba(234, 179, 8, 0.3)';
                                }
                            }

                            return (
                                <button
                                    key={c}
                                    onClick={() => handleCellClick(r, c)}
                                    style={{
                                        width: '46px', height: '46px', margin: '2px',
                                        backgroundColor: cellBg, border: cellBorder,
                                        boxShadow: cellShadow, borderRadius: isBlock ? '6px' : '10px',
                                        cursor: isBlock || winner ? 'default' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.15s'
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
                <span>Coloca bombillas 💡 en las casillas blancas para iluminar todo el laberinto. Una bombilla ilumina toda su fila y columna (hasta chocar con un bloque negro). Las bombillas no pueden iluminarse entre sí, y los números indican cuántas bombillas adyacentes debe tener ese bloque.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Laberinto Iluminado!"
                message="Has colocado todas las bombillas respetando las reglas de iluminación y los bloques numéricos."
                timeElapsed={timeElapsed}
                onPlayAgain={resetGame}
            />
        </div>
    );
};

export default AkariPage;
