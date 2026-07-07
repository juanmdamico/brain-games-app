import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const SIZE = 8;

const CheckersPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    // Grid values: null (empty), 'R' (Red player), 'B' (Black IA), 'RK' (Red King), 'BK' (Black King)
    const [board, setBoard] = useState(Array(SIZE).fill(null).map(() => Array(SIZE).fill(null)));
    const [selectedPiece, setSelectedPiece] = useState(null); // { r, c }
    const [validMoves, setValidMoves] = useState([]); // Array of { r, c, isJump, capturedCell: { r, c } }
    const [turn, setTurn] = useState('player'); // 'player', 'ai'
    const [winner, setWinner] = useState(null); // 'player', 'ai'
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
        if (turn === 'ai' && !winner) {
            setTimeout(runAIMove, 1000);
        }
    }, [turn]);

    const initGame = () => {
        const newBoard = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));
        // Deal Black (Rows 0-2)
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < SIZE; c++) {
                if ((r + c) % 2 === 1) newBoard[r][c] = 'B';
            }
        }
        // Deal Red (Rows 5-7)
        for (let r = 5; r < 8; r++) {
            for (let c = 0; c < SIZE; c++) {
                if ((r + c) % 2 === 1) newBoard[r][c] = 'R';
            }
        }
        setBoard(newBoard);
        setSelectedPiece(null);
        setValidMoves([]);
        setTurn('player');
        setWinner(null);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const handleSquareClick = (r, c) => {
        if (winner || turn !== 'player') return;

        const piece = board[r][c];

        // Click on player piece: select it and calculate moves
        if (piece && piece.startsWith('R')) {
            playClick();
            setSelectedPiece({ r, c });
            const moves = getMovesForPiece(r, c, board);
            setValidMoves(moves);
        }
        // Click on valid move target: execute move
        else {
            const move = validMoves.find(m => m.r === r && m.c === c);
            if (move) {
                executeMove(selectedPiece.r, selectedPiece.c, r, c, move);
            } else {
                setSelectedPiece(null);
                setValidMoves([]);
            }
        }
    };

    const getMovesForPiece = (r, c, currentBoard) => {
        const piece = currentBoard[r][c];
        if (!piece) return [];

        const isKing = piece.endsWith('K');
        const moves = [];

        // Directions: Red normally moves up (-1), Black moves down (1), Kings can move both
        let rowDirs = [];
        if (piece.startsWith('R')) {
            rowDirs = isKing ? [-1, 1] : [-1];
        } else {
            rowDirs = isKing ? [-1, 1] : [1];
        }
        const colDirs = [-1, 1];

        // 1. Normal Moves (1 diagonal step)
        rowDirs.forEach(dr => {
            colDirs.forEach(dc => {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && !currentBoard[nr][nc]) {
                    moves.push({ r: nr, c: nc, isJump: false });
                }
            });
        });

        // 2. Jump Moves (2 diagonal steps over opponent piece)
        const opponentPrefix = piece.startsWith('R') ? 'B' : 'R';
        rowDirs.forEach(dr => {
            colDirs.forEach(dc => {
                const midR = r + dr;
                const midC = c + dc;
                const landR = r + dr * 2;
                const landC = c + dc * 2;

                if (landR >= 0 && landR < SIZE && landC >= 0 && landC < SIZE) {
                    const midPiece = currentBoard[midR][midC];
                    const landCell = currentBoard[landR][landC];

                    if (midPiece && midPiece.startsWith(opponentPrefix) && !landCell) {
                        moves.push({
                            r: landR, c: landC,
                            isJump: true,
                            capturedCell: { r: midR, c: midC }
                        });
                    }
                }
            });
        });

        return moves;
    };

    const executeMove = (fromR, fromC, toR, toC, move) => {
        playSuccessSfx();
        const newBoard = board.map(row => [...row]);
        let piece = newBoard[fromR][fromC];

        // Move piece
        newBoard[fromR][fromC] = null;

        // Check King transformation
        if (piece === 'R' && toR === 0) piece = 'RK';
        if (piece === 'B' && toR === SIZE - 1) piece = 'BK';

        newBoard[toR][toC] = piece;

        // Capture opponent
        if (move.isJump && move.capturedCell) {
            newBoard[move.capturedCell.r][move.capturedCell.c] = null;
        }

        setBoard(newBoard);
        setSelectedPiece(null);
        setValidMoves([]);

        // Check Win/Loss
        if (checkGameOver(newBoard)) return;

        // Toggle turn
        setTurn(turn === 'player' ? 'ai' : 'player');
    };

    const checkGameOver = (currentBoard) => {
        let redCount = 0;
        let blackCount = 0;

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const p = currentBoard[r][c];
                if (p) {
                    if (p.startsWith('R')) redCount++;
                    if (p.startsWith('B')) blackCount++;
                }
            }
        }

        if (redCount === 0) {
            setWinner('ai');
            setStatusMessage('La casa gana. ¡Inténtalo de nuevo!');
            playErrorSfx();
            return true;
        }

        if (blackCount === 0) {
            setWinner('player');
            playVictorySfx();
            registerGameCompletion('damas', 'medium', timeElapsed);
            setShowVictory(true);
            return true;
        }

        return false;
    };

    const runAIMove = () => {
        // Find all Black pieces and their valid moves
        const allMoves = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const piece = board[r][c];
                if (piece && piece.startsWith('B')) {
                    const moves = getMovesForPiece(r, c, board);
                    moves.forEach(m => {
                        allMoves.push({ from: { r, c }, ...m });
                    });
                }
            }
        }

        if (allMoves.length === 0) {
            // No moves left for AI, player wins!
            setWinner('player');
            playVictorySfx();
            registerGameCompletion('damas', 'medium', timeElapsed);
            setShowVictory(true);
            return;
        }

        // Greedy AI: prioritize jump captures
        const jumps = allMoves.filter(m => m.isJump);
        const selected = jumps.length > 0 
            ? jumps[Math.floor(Math.random() * jumps.length)] 
            : allMoves[Math.floor(Math.random() * allMoves.length)];

        executeMove(selected.from.r, selected.from.c, selected.r, selected.c, selected);
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
                    Damas Clásicas
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

            {/* Turn stats status banner */}
            <div style={{
                backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px',
                padding: '8px 12px', fontSize: '0.9rem', fontWeight: 'bold', color: turn === 'player' ? 'var(--primary)' : 'var(--text-muted)',
                marginBottom: '20px'
            }}>
                {turn === 'player' ? '🟢 Tu turno (Rojas)' : '⚙️ Turno del Oponente (Negras)...'}
            </div>

            {/* Checkerboard */}
            <div style={{
                display: 'inline-block',
                border: '4px solid #475569',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                marginBottom: '20px',
                overflow: 'hidden'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)' }}>
                    {board.map((row, r) => (
                        row.map((piece, c) => {
                            const isDarkSquare = (r + c) % 2 === 1;
                            const isSelected = selectedPiece && selectedPiece.r === r && selectedPiece.c === c;
                            const isValidMove = validMoves.some(m => m.r === r && m.c === c);

                            let cellBg = isDarkSquare ? '#1e293b' : '#cbd5e1';
                            if (isSelected) cellBg = 'rgba(59, 130, 246, 0.4)';
                            else if (isValidMove) cellBg = 'rgba(16, 185, 129, 0.3)';

                            return (
                                <button
                                    key={`${r}-${c}`}
                                    onClick={() => handleSquareClick(r, c)}
                                    style={{
                                        width: '46px', height: '46px', border: 'none',
                                        backgroundColor: cellBg,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: winner ? 'default' : 'pointer',
                                        transition: 'all 0.15s',
                                        position: 'relative'
                                    }}
                                >
                                    {piece && (
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            backgroundColor: piece.startsWith('R') ? '#ef4444' : '#000000',
                                            border: '2px solid white',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {piece.endsWith('K') && (
                                                <span style={{ color: '#ffc107', fontSize: '0.8rem' }}>👑</span>
                                            )}
                                        </div>
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
                <span>Haz clic en una de tus fichas rojas para seleccionarla, y haz clic en una casilla verde destacada para moverte. Come saltando sobre las piezas negras del oponente. Llegar a la última fila enemiga corona tu ficha como Reina 👑 permitiéndole moverse hacia atrás.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Victoria Real!"
                message="Has capturado todas las piezas enemigas coronando tu estrategia lúdica."
                timeElapsed={timeElapsed}
                onPlayAgain={initGame}
            />
        </div>
    );
};

export default CheckersPage;
