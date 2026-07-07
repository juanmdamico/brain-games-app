import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const PUZZLES = [
    {
        title: "Mate del Pasillo (Back Rank Mate)",
        description: "El rey enemigo está atrapado tras sus propios peones. Encuentra el jaque mate en 1 movimiento.",
        // 8x8 Board representation
        initialBoard: [
            ['', '', '', '', '', '', '♚', ''], // 0
            ['', '', '', '', '', '♟', '♟', '♟'], // 1
            ['', '', '', '', '', '', '', ''], // 2
            ['', '', '', '', '', '', '', ''], // 3
            ['', '', '', '', '', '', '', ''], // 4
            ['', '', '', '', '', '', '', ''], // 5
            ['', '', '', '', '', '', '', ''], // 6
            ['♖', '', '', '', '', '', '♔', '']  // 7
        ],
        // Move solution: from {r, c} to {r, c}
        solution: { fromR: 7, fromC: 0, toR: 0, toC: 0 }
    },
    {
        title: "Mate Pastor (Scholar's Mate)",
        description: "Aprovecha la debilidad del peón de f7 protegido por tu alfil de c4. Jaque mate en 1.",
        initialBoard: [
            ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
            ['♟', '♟', '♟', '♟', '', '♟', '♟', '♟'],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '♟', '', '', ''],
            ['', '', '♗', '', '', '', '', '♕'],
            ['', '', '', '', '', '', '', ''],
            ['♙', '♙', '♙', '♙', '', '♙', '♙', '♙'],
            ['♖', '♘', '♗', '', '♔', '', '♘', '♖']
        ],
        solution: { fromR: 4, fromC: 7, toR: 1, toC: 5 }
    }
];

const ChessPuzzlesPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [puzzleIdx, setPuzzleIdx] = useState(0);
    const [board, setBoard] = useState([]);
    const [selectedSquare, setSelectedSquare] = useState(null); // { r, c }
    const [winner, setWinner] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [timeElapsed, setTimeElapsed] = useState(0);

    useEffect(() => {
        loadPuzzle(puzzleIdx);
    }, [puzzleIdx]);

    useEffect(() => {
        if (winner) return;
        const timer = setInterval(() => {
            setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime, winner]);

    const loadPuzzle = (idx) => {
        const puzzle = PUZZLES[idx];
        setBoard(puzzle.initialBoard.map(row => [...row]));
        setSelectedSquare(null);
        setWinner(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const handleSquareClick = (r, c) => {
        if (winner) return;

        const piece = board[r][c];

        if (selectedSquare === null) {
            // Can only select white pieces (Mate in 1 puzzles are always white to move)
            if (piece && isWhitePiece(piece)) {
                playClick();
                setSelectedSquare({ r, c });
            }
        } else {
            // If clicking another white piece, change selection
            if (piece && isWhitePiece(piece)) {
                playClick();
                setSelectedSquare({ r, c });
            } else {
                // Attempt to move
                attemptMove(selectedSquare.r, selectedSquare.c, r, c);
            }
        }
    };

    const isWhitePiece = (piece) => {
        return ['♔', '♕', '♖', '♗', '♘', '♙'].includes(piece);
    };

    const attemptMove = (fromR, fromC, toR, toC) => {
        const puzzle = PUZZLES[puzzleIdx];
        
        // Verify against solution
        if (fromR === puzzle.solution.fromR && fromC === puzzle.solution.fromC &&
            toR === puzzle.solution.toR && toC === puzzle.solution.toC) {
            
            // Correct Move!
            playSuccessSfx();
            const newBoard = board.map(row => [...row]);
            newBoard[toR][toC] = newBoard[fromR][fromC];
            newBoard[fromR][fromC] = '';
            setBoard(newBoard);
            setSelectedSquare(null);
            setWinner(true);
            playVictorySfx();
            registerGameCompletion('ajedrez_puzzles', 'medium', timeElapsed);
            setShowVictory(true);
        } else {
            // Incorrect Move
            playErrorSfx();
            setSelectedSquare(null);
            alert('Movimiento incorrecto. Inténtalo de nuevo.');
        }
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {PUZZLES.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => { playClick(); setPuzzleIdx(idx); }}
                            style={{
                                padding: '6px 12px', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '8px',
                                border: '1px solid var(--border)', cursor: 'pointer',
                                backgroundColor: puzzleIdx === idx ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                                color: puzzleIdx === idx ? 'white' : 'var(--text-muted)'
                            }}
                        >
                            Puzzle {idx + 1}
                        </button>
                    ))}
                </div>
                <div style={{ color: 'var(--text-main)', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    ⏱️ {formatTime(timeElapsed)}
                </div>
                <button onClick={() => loadPuzzle(puzzleIdx)} style={{
                    background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px',
                    padding: '6px 10px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    <RotateCcw size={16} /> Reiniciar
                </button>
            </div>

            {/* Puzzle header description */}
            <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                <h3 style={{ color: 'white', margin: '0 0 6px 0', fontSize: '1.05rem' }}>{PUZZLES[puzzleIdx].title}</h3>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8rem', lineHeight: '1.4' }}>{PUZZLES[puzzleIdx].description}</p>
            </div>

            {/* Chessboard */}
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
                            const isDark = (r + c) % 2 === 1;
                            const isSelected = selectedSquare && selectedSquare.r === r && selectedSquare.c === c;

                            return (
                                <button
                                    key={`${r}-${c}`}
                                    onClick={() => handleSquareClick(r, c)}
                                    style={{
                                        width: '46px', height: '46px', border: 'none',
                                        backgroundColor: isSelected 
                                            ? 'rgba(59, 130, 246, 0.4)' 
                                            : isDark 
                                                ? '#475569' 
                                                : '#cbd5e1',
                                        color: isWhitePiece(piece) ? '#ffffff' : '#0f172a',
                                        fontSize: '2rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: winner ? 'default' : 'pointer',
                                        transition: 'background-color 0.15s',
                                        textShadow: isWhitePiece(piece) ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
                                    }}
                                >
                                    {piece}
                                </button>
                            );
                        })
                    ))}
                </div>
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Haz clic en tu pieza blanca para seleccionarla y luego haz clic en la casilla de destino para moverla. Encuentra el único movimiento que resulta en jaque mate.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Jaque Mate!"
                message="Has resuelto el puzzle táctico de ajedrez perfectamente."
                timeElapsed={timeElapsed}
                onPlayAgain={() => loadPuzzle(puzzleIdx)}
            />
        </div>
    );
};

export default ChessPuzzlesPage;
