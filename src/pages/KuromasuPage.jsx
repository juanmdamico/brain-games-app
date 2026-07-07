import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const SIZE = 5;

// Kuromasu starting board: number means White cell with visual count clue. null means normal empty cell.
const CLUES = [
    [null, 8, null, null, null],
    [null, null, null, 7, null],
    [6, null, null, null, null],
    [null, null, null, null, 2],
    [null, null, 5, null, null]
];

const KuromasuPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    // Grid states: 0 = White/Empty, 1 = Black cell
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
        if (winner || CLUES[r][c] !== null) return; // Clues cannot be black

        playClick();
        const newGrid = grid.map(row => [...row]);
        newGrid[r][c] = newGrid[r][c] === 0 ? 1 : 0;
        setGrid(newGrid);

        if (validateKuromasu(newGrid)) {
            setWinner(true);
            playVictorySfx();
            registerGameCompletion('kuromasu', 'medium', timeElapsed);
            setShowVictory(true);
        }
    };

    // Calculate count of visible white cells from cell (r, c)
    const getVisibleWhiteCells = (r, c, currentGrid) => {
        let count = 1; // includes itself
        const dirs = [[-1,0], [1,0], [0,-1], [0,1]];

        for (let [dr, dc] of dirs) {
            let currR = r + dr;
            let currC = c + dc;
            while (currR >= 0 && currR < SIZE && currC >= 0 && currC < SIZE) {
                if (currentGrid[currR][currC] === 1) break; // blocked by black cell
                count++;
                currR += dr;
                currC += dc;
            }
        }
        return count;
    };

    const validateKuromasu = (currentGrid) => {
        // 1. Black cells cannot touch orthogonally
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (currentGrid[r][c] === 1) {
                    const adjs = [[-1,0], [1,0], [0,-1], [0,1]];
                    for (let [dr, dc] of adjs) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
                            if (currentGrid[nr][nc] === 1) return false;
                        }
                    }
                }
            }
        }

        // 2. All white cells must be connected orthogonally
        if (!isWhiteConnected(currentGrid)) return false;

        // 3. Every clue number must match the exact visible white cells count
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const target = CLUES[r][c];
                if (target !== null) {
                    if (getVisibleWhiteCells(r, c, currentGrid) !== target) {
                        return false;
                    }
                }
            }
        }

        return true;
    };

    const isWhiteConnected = (currentGrid) => {
        const whiteCells = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (currentGrid[r][c] === 0) {
                    whiteCells.push({ r, c });
                }
            }
        }

        if (whiteCells.length === 0) return true;

        const visited = new Set();
        const queue = [whiteCells[0]];
        visited.add(`${whiteCells[0].r}-${whiteCells[0].c}`);

        while (queue.length > 0) {
            const curr = queue.shift();
            const adjs = [[-1,0], [1,0], [0,-1], [0,1]];
            for (let [dr, dc] of adjs) {
                const nr = curr.r + dr;
                const nc = curr.c + dc;
                const key = `${nr}-${nc}`;
                if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && currentGrid[nr][nc] === 0 && !visited.has(key)) {
                    visited.add(key);
                    queue.push({ r: nr, c: nc });
                }
            }
        }

        return visited.size === whiteCells.length;
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
                    Kuromasu (Rango de Visión)
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
                            const isBlack = cell === 1;

                            return (
                                <button
                                    key={c}
                                    onClick={() => handleCellClick(r, c)}
                                    style={{
                                        width: '46px', height: '46px', margin: '2px',
                                        backgroundColor: isBlack ? '#1e293b' : 'rgba(255, 255, 255, 0.01)',
                                        border: isBlack 
                                            ? '2px solid rgba(255,255,255,0.1)' 
                                            : isClue 
                                                ? '1.5px solid var(--primary)' 
                                                : '1px solid rgba(255,255,255,0.03)',
                                        borderRadius: '10px',
                                        cursor: isClue || winner ? 'default' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.15s',
                                        boxShadow: isBlack ? '0 4px 8px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.1)' : 'none'
                                    }}
                                >
                                    {isClue && (
                                        <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.25rem', textShadow: '0 0 8px rgba(59,130,246,0.5)' }}>
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
                <span>Haz clic en las celdas para alternar entre Blancas y Negras. Los números en las celdas indican cuántas casillas blancas (incluyendo ella misma) se pueden ver horizontal y verticalmente antes de chocar con una negra o el borde. Las casillas negras no pueden tocarse ortogonalmente, y todas las blancas deben formar una red conectada.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Kuromasu Resuelto!"
                message="Has colocado todas las celdas oscuras respetando los rangos visuales numéricos."
                timeElapsed={timeElapsed}
                onPlayAgain={resetGame}
            />
        </div>
    );
};

export default KuromasuPage;
