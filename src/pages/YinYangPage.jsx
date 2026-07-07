import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const SIZE = 5;

// Initial clues (0 = empty, 1 = Black circle, 2 = White circle)
const CLUES = [
    [1, 0, 0, 0, 2],
    [0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0],
    [2, 0, 0, 0, 1]
];

const YinYangPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [board, setBoard] = useState(CLUES.map(row => [...row]));
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
        setBoard(CLUES.map(row => [...row]));
        setWinner(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const handleCellClick = (r, c) => {
        if (winner || CLUES[r][c] !== 0) return; // clue is locked

        playClick();
        const newBoard = board.map(row => [...row]);
        const val = newBoard[r][c];

        // Toggle state: 0 (empty) -> 1 (Black) -> 2 (White) -> 0
        newBoard[r][c] = (val + 1) % 3;
        setBoard(newBoard);

        // Run validation
        if (validateYinYang(newBoard)) {
            setWinner(true);
            playVictorySfx();
            registerGameCompletion('yinyang', 'medium', timeElapsed);
            setShowVictory(true);
        }
    };

    const validateYinYang = (currentBoard) => {
        // 1. Grid must be fully filled (no 0)
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (currentBoard[r][c] === 0) return false;
            }
        }

        // 2. No 2x2 area of identical colors
        for (let r = 0; r < SIZE - 1; r++) {
            for (let c = 0; c < SIZE - 1; c++) {
                const val = currentBoard[r][c];
                if (val === currentBoard[r+1][c] && val === currentBoard[r][c+1] && val === currentBoard[r+1][c+1]) {
                    return false;
                }
            }
        }

        // 3. Black circles must form a single connected component
        if (!isConnected(currentBoard, 1)) return false;

        // 4. White circles must form a single connected component
        if (!isConnected(currentBoard, 2)) return false;

        return true;
    };

    const isConnected = (currentBoard, targetVal) => {
        // Find all target coordinates
        const cells = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (currentBoard[r][c] === targetVal) {
                    cells.push({ r, c });
                }
            }
        }

        if (cells.length === 0) return true;

        const visited = new Set();
        const queue = [cells[0]];
        visited.add(`${cells[0].r}-${cells[0].c}`);

        while (queue.length > 0) {
            const curr = queue.shift();
            const adjs = [[-1,0], [1,0], [0,-1], [0,1]];
            for (let [dr, dc] of adjs) {
                const nr = curr.r + dr;
                const nc = curr.c + dc;
                const key = `${nr}-${nc}`;
                if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && currentBoard[nr][nc] === targetVal && !visited.has(key)) {
                    visited.add(key);
                    queue.push({ r: nr, c: nc });
                }
            }
        }

        return visited.size === cells.length;
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
                    Yin-Yang (Conectividad Cuántica)
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

            {/* Grid */}
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
                {board.map((row, r) => (
                    <div key={r} style={{ display: 'flex' }}>
                        {row.map((cell, c) => {
                            const isLocked = CLUES[r][c] !== 0;
                            
                            let content = null;
                            if (cell === 1) {
                                // Black sphere
                                content = (
                                    <div style={{
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        background: 'radial-gradient(circle at 35% 35%, #475569, #0f172a, #020617)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.1)'
                                    }} />
                                );
                            } else if (cell === 2) {
                                // White sphere
                                content = (
                                    <div style={{
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        background: 'radial-gradient(circle at 35% 35%, #ffffff, #e2e8f0, #94a3b8)',
                                        border: '1px solid rgba(0,0,0,0.2)',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.6)'
                                    }} />
                                );
                            }

                            return (
                                <button
                                    key={c}
                                    onClick={() => handleCellClick(r, c)}
                                    style={{
                                        width: '46px', height: '46px', margin: '2px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.01)',
                                        border: isLocked ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.02)',
                                        borderRadius: '10px',
                                        cursor: isLocked || winner ? 'default' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.15s'
                                    }}
                                    onMouseOver={(e) => {
                                        if (cell === 0 && !winner) {
                                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (cell === 0) {
                                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)';
                                        }
                                    }}
                                >
                                    {content}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Rellena todo el tablero con círculos blancos y negros de manera que todos los círculos negros estén conectados entre sí (ortogonalmente), todos los círculos blancos estén conectados entre sí, y no se forme ninguna cuadrícula de 2x2 del mismo color.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Yin-Yang Equilibrado!"
                message="Has conectado todos los elementos respetando los límites de color y contigüidad."
                timeElapsed={timeElapsed}
                onPlayAgain={resetGame}
            />
        </div>
    );
};

export default YinYangPage;
