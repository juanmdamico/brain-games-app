import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const SIZE = 10;

const GomokuPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    // Grid values: null (empty), 'X' (Black - Player), 'O' (White - IA)
    const [board, setBoard] = useState(Array(SIZE).fill(null).map(() => Array(SIZE).fill(null)));
    const [turn, setTurn] = useState('X'); // 'X' or 'O'
    const [winner, setWinner] = useState(null); // 'X', 'O', 'tie'
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

    useEffect(() => {
        if (turn === 'O' && !winner) {
            setTimeout(runAIMove, 800);
        }
    }, [turn]);

    const initGame = () => {
        setBoard(Array(SIZE).fill(null).map(() => Array(SIZE).fill(null)));
        setTurn('X');
        setWinner(null);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const handleSquareClick = (r, c) => {
        if (winner || turn !== 'X' || board[r][c] !== null) return;

        playClick();
        executeMove(r, c, 'X');
    };

    const executeMove = (r, c, player) => {
        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = player;
        setBoard(newBoard);

        // Check Win
        if (checkWin(r, c, player, newBoard)) {
            setWinner(player);
            if (player === 'X') {
                playVictorySfx();
                registerGameCompletion('gomoku', 'medium', timeElapsed);
                setShowVictory(true);
            } else {
                playErrorSfx();
            }
            return;
        }

        // Check Tie
        if (newBoard.every(row => row.every(cell => cell !== null))) {
            setWinner('tie');
            playSuccessSfx();
            return;
        }

        setTurn(player === 'X' ? 'O' : 'X');
    };

    const checkWin = (r, c, player, currentBoard) => {
        const dirs = [
            [0, 1],  // horizontal
            [1, 0],  // vertical
            [1, 1],  // diagonal right
            [1, -1]  // diagonal left
        ];

        for (let [dr, dc] of dirs) {
            let count = 1;

            // Forward
            let currR = r + dr;
            let currC = c + dc;
            while (currR >= 0 && currR < SIZE && currC >= 0 && currC < SIZE && currentBoard[currR][currC] === player) {
                count++;
                currR += dr;
                currC += dc;
            }

            // Backward
            currR = r - dr;
            currC = c - dc;
            while (currR >= 0 && currR < SIZE && currC >= 0 && currC < SIZE && currentBoard[currR][currC] === player) {
                count++;
                currR -= dr;
                currC -= dc;
            }

            if (count >= 5) return true;
        }
        return false;
    };

    const runAIMove = () => {
        // Simple defensive/offensive AI
        // 1. Look for AI winning moves
        let bestMove = findBestGomokuMove('O');
        if (bestMove) {
            executeMove(bestMove.r, bestMove.c, 'O');
            return;
        }

        // 2. Block player winning moves
        bestMove = findBestGomokuMove('X');
        if (bestMove) {
            executeMove(bestMove.r, bestMove.c, 'O');
            return;
        }

        // 3. Fallback: random empty cell close to center
        const emptyCells = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (board[r][c] === null) {
                    // Score based on distance to center
                    const distToCenter = Math.abs(r - SIZE/2) + Math.abs(c - SIZE/2);
                    emptyCells.push({ r, c, score: 20 - distToCenter });
                }
            }
        }

        if (emptyCells.length > 0) {
            emptyCells.sort((a, b) => b.score - a.score);
            const select = emptyCells[0];
            executeMove(select.r, select.c, 'O');
        }
    };

    const findBestGomokuMove = (player) => {
        // Checks if placing a stone yields a 4-in-a-row or blocks a player's 4-in-a-row
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (board[r][c] === null) {
                    const temp = board.map(row => [...row]);
                    temp[r][c] = player;
                    if (checkWin(r, c, player, temp)) {
                        return { r, c };
                    }
                }
            }
        }
        return null;
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
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                    Gomoku (Cinco en Línea)
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

            {/* Turn Banner */}
            <div style={{
                backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px',
                padding: '8px 12px', fontSize: '0.9rem', fontWeight: 'bold', color: turn === 'X' ? 'var(--primary)' : 'var(--text-muted)',
                marginBottom: '20px'
            }}>
                {turn === 'X' ? '🟢 Tu turno (Piedras Negras)' : '⚙️ Turno del Oponente (Piedras Blancas)...'}
            </div>

            {/* Wooden Grid */}
            <div style={{
                display: 'inline-block',
                border: '4px solid #b45309', // Dark wood border
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                marginBottom: '20px',
                overflow: 'hidden'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', backgroundColor: '#fed7aa' }}>
                    {board.map((row, r) => (
                        row.map((cell, c) => {
                            return (
                                <button
                                    key={`${r}-${c}`}
                                    onClick={() => handleSquareClick(r, c)}
                                    style={{
                                        width: '38px', height: '38px', border: '1.5px solid #d97706',
                                        backgroundColor: 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: winner || cell ? 'default' : 'pointer',
                                        transition: 'all 0.15s',
                                        position: 'relative'
                                    }}
                                    onMouseOver={e => !cell && !winner && (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)')}
                                    onMouseOut={e => !cell && (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                    {cell && (
                                        <div style={{
                                            width: '26px', height: '26px', borderRadius: '50%',
                                            background: cell === 'X' 
                                                ? 'radial-gradient(circle at 35% 35%, #475569, #0f172a, #020617)' 
                                                : 'radial-gradient(circle at 35% 35%, #ffffff, #e2e8f0, #94a3b8)',
                                            border: cell === 'X' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.2)',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                                            zIndex: 2
                                        }} />
                                    )}
                                </button>
                            );
                        })
                    ))}
                </div>
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Alterna turnos colocando piedras en la cuadrícula de madera. Consigue alinear 5 de tus piedras en dirección horizontal, vertical o diagonal antes que el oponente para ganar.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Alineación Completada!"
                message="Has colocado 5 piedras consecutivas ganando la partida de Gomoku."
                timeElapsed={timeElapsed}
                onPlayAgain={initGame}
            />
        </div>
    );
};

export default GomokuPage;
