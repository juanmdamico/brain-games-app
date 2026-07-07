import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const SIZE = 4;

// Shikaku clues: number means area target, null means normal cell
const CLUES = [
    [2, null, 4, null],
    [null, null, null, null],
    [6, null, null, 4],
    [null, null, null, null]
];

// Color definitions for each group (clue cell coordinates mapping)
const CLUE_CELLS = [
    { r: 0, c: 0, target: 2, color: 'rgba(244, 63, 94, 0.25)', border: '#f43f5e' },
    { r: 0, c: 2, target: 4, color: 'rgba(59, 130, 246, 0.25)', border: '#3b82f6' },
    { r: 2, c: 0, target: 6, color: 'rgba(168, 85, 247, 0.25)', border: '#a855f7' },
    { r: 2, c: 3, target: 4, color: 'rgba(16, 185, 129, 0.25)', border: '#10b981' }
];

const ShikakuPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    // Grid values: index of CLUE_CELLS representing which rectangle it belongs to, or null
    const [grid, setGrid] = useState(Array(SIZE).fill(null).map(() => Array(SIZE).fill(null)));
    const [selectedClueIdx, setSelectedClueIdx] = useState(null);
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
        // Automatically assign clue cells to their own index
        const tempGrid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));
        CLUE_CELLS.forEach((clue, idx) => {
            tempGrid[clue.r][clue.c] = idx;
        });
        setGrid(tempGrid);
        setSelectedClueIdx(null);
        setWinner(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const handleCellClick = (r, c) => {
        if (winner) return;

        // Clicking a clue cell changes current selection
        const clueIdx = CLUE_CELLS.findIndex(clue => clue.r === r && clue.c === c);
        if (clueIdx !== -1) {
            playClick();
            setSelectedClueIdx(clueIdx);
            return;
        }

        if (selectedClueIdx === null) return;

        playClick();
        const newGrid = grid.map(row => [...row]);
        // Toggle or set to selected clue
        newGrid[r][c] = newGrid[r][c] === selectedClueIdx ? null : selectedClueIdx;
        setGrid(newGrid);

        // Run validation
        if (validateShikaku(newGrid)) {
            setWinner(true);
            playVictorySfx();
            registerGameCompletion('shikaku', 'medium', timeElapsed);
            setShowVictory(true);
        }
    };

    const validateShikaku = (currentGrid) => {
        // 1. Grid must be fully colored (no null)
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (currentGrid[r][c] === null) return false;
            }
        }

        // 2. Validate each clue group
        for (let idx = 0; idx < CLUE_CELLS.length; idx++) {
            const clue = CLUE_CELLS[idx];
            
            // Find all cells belonging to this group
            const cells = [];
            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    if (currentGrid[r][c] === idx) {
                        cells.push({ r, c });
                    }
                }
            }

            // Must have the correct count of cells
            if (cells.length !== clue.target) return false;

            // Must form a perfect rectangle
            const minR = Math.min(...cells.map(cell => cell.r));
            const maxR = Math.max(...cells.map(cell => cell.r));
            const minC = Math.min(...cells.map(cell => cell.c));
            const maxC = Math.max(...cells.map(cell => cell.c));

            const width = (maxC - minC) + 1;
            const height = (maxR - minR) + 1;

            if (width * height !== clue.target) return false; // not a solid rectangle

            // Make sure all cells in the bounding box belong to this group
            for (let r = minR; r <= maxR; r++) {
                for (let c = minC; c <= maxC; c++) {
                    if (currentGrid[r][c] !== idx) return false;
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
                    Shikaku (División Geométrica)
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

            {/* Hint of selected color */}
            <div style={{ marginBottom: '15px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {selectedClueIdx !== null ? (
                    <span>Pintando rectángulo de tamaño: <strong style={{ color: CLUE_CELLS[selectedClueIdx].border }}>{CLUE_CELLS[selectedClueIdx].target}</strong></span>
                ) : (
                    <span>Haz clic en un número para seleccionar su color</span>
                )}
            </div>

            {/* Board */}
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
                {grid.map((row, r) => (
                    <div key={r} style={{ display: 'flex' }}>
                        {row.map((cell, c) => {
                            const isClue = CLUES[r][c] !== null;
                            const isSelected = selectedClueIdx !== null && CLUE_CELLS[selectedClueIdx].r === r && CLUE_CELLS[selectedClueIdx].c === c;
                            
                            let cellBg = 'rgba(255, 255, 255, 0.01)';
                            let cellBorder = '1px solid rgba(255, 255, 255, 0.03)';

                            if (cell !== null) {
                                cellBg = CLUE_CELLS[cell].color;
                                cellBorder = `1.5px solid ${CLUE_CELLS[cell].border}`;
                            }

                            return (
                                <button
                                    key={c}
                                    onClick={() => handleCellClick(r, c)}
                                    style={{
                                        width: '48px', height: '48px', margin: '2px',
                                        backgroundColor: cellBg, border: cellBorder,
                                        borderRadius: '8px',
                                        cursor: winner ? 'default' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.15s',
                                        boxShadow: isSelected ? `0 0 12px ${CLUE_CELLS[selectedClueIdx].border}` : 'none'
                                    }}
                                >
                                    {isClue && (
                                        <span style={{ 
                                            color: CLUE_CELLS[cell].border, 
                                            fontWeight: 'bold', fontSize: '1.3rem', 
                                            textShadow: `0 0 8px ${CLUE_CELLS[cell].border}50` 
                                        }}>
                                            {CLUES[r][c]}
                                        </span>
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
                <span>Haz clic en un número para activar su color, y luego colorea las celdas para agruparlas en un rectángulo. Cada rectángulo debe contener exactamente un número y su área (cantidad de casillas) debe ser igual a ese número.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Geometría Perfecta!"
                message="Has dividido la grilla en rectángulos correctos correspondientes a cada número."
                timeElapsed={timeElapsed}
                onPlayAgain={initGame}
            />
        </div>
    );
};

export default ShikakuPage;
