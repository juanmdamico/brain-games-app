import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const SIZE = 8;

const ReversiPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    // Grid values: null (empty), 'B' (Black - Player), 'W' (White - IA)
    const [board, setBoard] = useState(Array(SIZE).fill(null).map(() => Array(SIZE).fill(null)));
    const [turn, setTurn] = useState('B'); // 'B' or 'W'
    const [winner, setWinner] = useState(null);
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

    useEffect(() => {
        if (turn === 'W' && !winner) {
            setTimeout(runAIMove, 1000);
        }
    }, [turn]);

    const initGame = () => {
        const temp = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));
        // Center squares
        temp[3][3] = 'W';
        temp[4][4] = 'W';
        temp[3][4] = 'B';
        temp[4][3] = 'B';

        setBoard(temp);
        setTurn('B');
        setWinner(null);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    // Find valid flips in a specific direction for cell (r, c)
    const getFlipsInDirection = (r, c, dr, dc, color, currentBoard) => {
        const opponent = color === 'B' ? 'W' : 'B';
        let currR = r + dr;
        let currC = c + dc;
        let flips = [];

        while (currR >= 0 && currR < SIZE && currC >= 0 && currC < SIZE) {
            const piece = currentBoard[currR][currC];
            if (piece === opponent) {
                flips.push({ r: currR, c: currC });
            } else if (piece === color) {
                return flips; // valid line of flips ended by our color chip
            } else {
                break; // hit empty cell
            }
            currR += dr;
            currC += dc;
        }
        return [];
    };

    const getAllFlipsForCell = (r, c, color, currentBoard) => {
        if (currentBoard[r][c] !== null) return [];

        const dirs = [
            [-1,-1], [-1,0], [-1,1],
            [0,-1],          [0,1],
            [1,-1],  [1,0],  [1,1]
        ];

        let totalFlips = [];
        dirs.forEach(([dr, dc]) => {
            const flips = getFlipsInDirection(r, c, dr, dc, color, currentBoard);
            totalFlips = [...totalFlips, ...flips];
        });

        return totalFlips;
    };

    const getValidMoves = (color, currentBoard) => {
        const moves = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const flips = getAllFlipsForCell(r, c, color, currentBoard);
                if (flips.length > 0) {
                    moves.push({ r, c, flips });
                }
            }
        }
        return moves;
    };

    const handleSquareClick = (r, c) => {
        if (winner || turn !== 'B') return;

        const validMoves = getValidMoves('B', board);
        const move = validMoves.find(m => m.r === r && m.c === c);

        if (move) {
            executeMove(r, c, move.flips, 'B');
        } else {
            playErrorSfx();
        }
    };

    const executeMove = (r, c, flips, color) => {
        playSuccessSfx();

        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = color;
        flips.forEach(f => {
            newBoard[f.r][f.c] = color;
        });

        setBoard(newBoard);

        // Next Turn
        const nextColor = color === 'B' ? 'W' : 'B';
        const nextMoves = getValidMoves(nextColor, newBoard);

        if (nextMoves.length > 0) {
            setTurn(nextColor);
        } else {
            // If next player has no moves, check if current player has moves (double skip check)
            const fallbackMoves = getValidMoves(color, newBoard);
            if (fallbackMoves.length > 0) {
                setTurn(color); // skip turn
            } else {
                // Game Over! Neither player has valid moves.
                evaluateWinner(newBoard);
            }
        }
    };

    const evaluateWinner = (currentBoard) => {
        let bCount = 0;
        let wCount = 0;

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (currentBoard[r][c] === 'B') bCount++;
                if (currentBoard[r][c] === 'W') wCount++;
            }
        }

        if (bCount > wCount) {
            setWinner('B');
            playVictorySfx();
            registerGameCompletion('reversi', 'medium', timeElapsed, bCount);
            setShowVictory(true);
        } else if (wCount > bCount) {
            setWinner('W');
            playErrorSfx();
        } else {
            setWinner('tie');
            playSuccessSfx();
        }
    };

    const runAIMove = () => {
        const validMoves = getValidMoves('W', board);

        if (validMoves.length === 0) {
            // Skip turn
            setTurn('B');
            return;
        }

        // Greedy AI: picks the move that flips the most chips
        validMoves.sort((a, b) => b.flips.length - a.flips.length);
        const bestMove = validMoves[0];

        executeMove(bestMove.r, bestMove.c, bestMove.flips, 'W');
    };

    const getChipsCount = () => {
        let b = 0, w = 0;
        board.forEach(row => {
            row.forEach(cell => {
                if (cell === 'B') b++;
                if (cell === 'W') w++;
            });
        });
        return { b, w };
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const counts = getChipsCount();
    const playerValidMoves = turn === 'B' ? getValidMoves('B', board) : [];

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
                    Reversi / Othello
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

            {/* Scoreboard HUD */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '10px 16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#000', border: '1px solid white' }} />
                    <span>Jugador: <strong>{counts.b}</strong></span>
                </div>
                <div style={{ color: turn === 'B' ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    {turn === 'B' ? '🟢 Tu Turno' : '⚙️ Turno IA...'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#fff' }} />
                    <span>IA: <strong>{counts.w}</strong></span>
                </div>
            </div>

            {/* Reversi Grid */}
            <div style={{
                display: 'inline-block',
                border: '4px solid #1e293b',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                marginBottom: '20px',
                overflow: 'hidden'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', backgroundColor: '#15803d' }}>
                    {board.map((row, r) => (
                        row.map((cell, c) => {
                            const isValid = playerValidMoves.some(m => m.r === r && m.c === c);

                            return (
                                <button
                                    key={`${r}-${c}`}
                                    onClick={() => handleSquareClick(r, c)}
                                    style={{
                                        width: '46px', height: '46px', border: '1px solid #166534',
                                        backgroundColor: isValid ? 'rgba(0,0,0,0.15)' : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: winner ? 'default' : 'pointer',
                                        transition: 'all 0.15s',
                                        position: 'relative'
                                    }}
                                >
                                    {/* Highlight valid moves */}
                                    {isValid && (
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)', boxShadow: '0 0 6px var(--primary)' }} />
                                    )}

                                    {cell && (
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            background: cell === 'B' 
                                                ? 'radial-gradient(circle at 35% 35%, #475569, #0f172a, #020617)' 
                                                : 'radial-gradient(circle at 35% 35%, #ffffff, #e2e8f0, #94a3b8)',
                                            border: cell === 'B' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.2)',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                                            transition: 'transform 0.5s'
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
                <span>Haz clic en los círculos sombreados para colocar tus fichas negras. Debes flanquear en línea recta (u horizontal, vertical o diagonal) una o más fichas blancas del oponente para voltearlas a tu color. Gana el que logre pintar más fichas al completarse el tablero.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Victoria en Reversi!"
                message={`Has vencido a la Inteligencia Artificial acumulando ${counts.b} fichas en el tablero.`}
                timeElapsed={timeElapsed}
                onPlayAgain={initGame}
            />
        </div>
    );
};

export default ReversiPage;
