import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { Trophy, HelpCircle, RotateCcw, Volume2 } from 'lucide-react';

const ROWS = 6;
const COLS = 7;

const Connect4Page = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [board, setBoard] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    const [currentPlayer, setCurrentPlayer] = useState('R'); // 'R' = Player, 'Y' = AI
    const [winner, setWinner] = useState(null); // 'R', 'Y', 'Draw', or null
    const [difficulty, setDifficulty] = useState('medium'); // 'easy', 'medium', 'hard'
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [winningCells, setWinningCells] = useState([]);
    const [startTime, setStartTime] = useState(Date.now());
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [showVictory, setShowVictory] = useState(false);

    // Timer logic
    useEffect(() => {
        if (winner) return;
        const timer = setInterval(() => {
            setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime, winner]);

    const resetGame = () => {
        playClick();
        setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
        setCurrentPlayer('R');
        setWinner(null);
        setWinningCells([]);
        setStartTime(Date.now());
        setTimeElapsed(0);
        setShowVictory(false);
        setIsAiThinking(false);
    };

    // Check if a move is valid and return row index
    const getNextAvailableRow = (colIndex, currentBoard) => {
        for (let r = ROWS - 1; r >= 0; r--) {
            if (currentBoard[r][colIndex] === null) {
                return r;
            }
        }
        return -1;
    };

    const handleCellClick = (colIndex) => {
        if (winner || currentPlayer !== 'R' || isAiThinking) return;
        makeMove(colIndex);
    };

    const makeMove = (colIndex) => {
        const row = getNextAvailableRow(colIndex, board);
        if (row === -1) return;

        playClick();

        const newBoard = board.map(r => [...r]);
        newBoard[row][colIndex] = currentPlayer;
        setBoard(newBoard);

        const checkRes = checkWin(newBoard);
        if (checkRes) {
            setWinner(checkRes.player);
            setWinningCells(checkRes.cells);
            handleGameEnd(checkRes.player);
            return;
        }

        if (checkDraw(newBoard)) {
            setWinner('Draw');
            handleGameEnd('Draw');
            return;
        }

        // Switch turns
        const nextPlayer = currentPlayer === 'R' ? 'Y' : 'R';
        setCurrentPlayer(nextPlayer);
    };

    // AI Turn trigger
    useEffect(() => {
        if (winner || currentPlayer !== 'Y') return;
        setIsAiThinking(true);
        
        const thinkTime = Math.random() * 400 + 400; // Realistic delay
        const timer = setTimeout(() => {
            const bestCol = getAiMove();
            makeMove(bestCol);
            setIsAiThinking(false);
        }, thinkTime);

        return () => clearTimeout(timer);
    }, [currentPlayer, winner]);

    const handleGameEnd = (gameWinner) => {
        if (gameWinner === 'R') {
            playVictorySfx();
            registerGameCompletion('conecta4', difficulty, timeElapsed);
        } else if (gameWinner === 'Y') {
            playErrorSfx();
        } else {
            playSuccessSfx();
        }
        setShowVictory(true);
    };

    // Check if winner
    const checkWin = (tempBoard) => {
        // Horizontal
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS - 3; c++) {
                const p = tempBoard[r][c];
                if (p && p === tempBoard[r][c+1] && p === tempBoard[r][c+2] && p === tempBoard[r][c+3]) {
                    return { player: p, cells: [[r, c], [r, c+1], [r, c+2], [r, c+3]] };
                }
            }
        }
        // Vertical
        for (let c = 0; c < COLS; c++) {
            for (let r = 0; r < ROWS - 3; r++) {
                const p = tempBoard[r][c];
                if (p && p === tempBoard[r+1][c] && p === tempBoard[r+2][c] && p === tempBoard[r+3][c]) {
                    return { player: p, cells: [[r, c], [r+1, c], [r+2, c], [r+3, c]] };
                }
            }
        }
        // Diagonal Down-Right
        for (let r = 0; r < ROWS - 3; r++) {
            for (let c = 0; c < COLS - 3; c++) {
                const p = tempBoard[r][c];
                if (p && p === tempBoard[r+1][c+1] && p === tempBoard[r+2][c+2] && p === tempBoard[r+3][c+3]) {
                    return { player: p, cells: [[r, c], [r+1, c+1], [r+2, c+2], [r+3, c+3]] };
                }
            }
        }
        // Diagonal Up-Right
        for (let r = 3; r < ROWS; r++) {
            for (let c = 0; c < COLS - 3; c++) {
                const p = tempBoard[r][c];
                if (p && p === tempBoard[r-1][c+1] && p === tempBoard[r-2][c+2] && p === tempBoard[r-3][c+3]) {
                    return { player: p, cells: [[r, c], [r-1, c+1], [r-2, c+2], [r-3, c+3]] };
                }
            }
        }
        return null;
    };

    const checkDraw = (tempBoard) => {
        return tempBoard[0].every(cell => cell !== null);
    };

    // AI logic (Minimax / Heuristics)
    const getAiMove = () => {
        const validCols = [];
        for (let c = 0; c < COLS; c++) {
            if (getNextAvailableRow(c, board) !== -1) {
                validCols.push(c);
            }
        }

        if (validCols.length === 0) return 0;

        // Easy: completely random
        if (difficulty === 'easy') {
            return validCols[Math.floor(Math.random() * validCols.length)];
        }

        // Medium: Check if AI can win, or block player win immediately. Otherwise random center-focused
        if (difficulty === 'medium') {
            // Can win?
            for (let col of validCols) {
                const row = getNextAvailableRow(col, board);
                const nextBoard = board.map(r => [...r]);
                nextBoard[row][col] = 'Y';
                if (checkWin(nextBoard)) return col;
            }
            // Must block player win?
            for (let col of validCols) {
                const row = getNextAvailableRow(col, board);
                const nextBoard = board.map(r => [...r]);
                nextBoard[row][col] = 'R';
                if (checkWin(nextBoard)) return col;
            }
            // Prefer center cols
            const centerPref = [3, 2, 4, 1, 5, 0, 6];
            for (let col of centerPref) {
                if (validCols.includes(col)) return col;
            }
            return validCols[0];
        }

        // Hard: Minimax depth 4
        let bestScore = -Infinity;
        let bestCol = validCols[0];

        for (let col of validCols) {
            const row = getNextAvailableRow(col, board);
            const nextBoard = board.map(r => [...r]);
            nextBoard[row][col] = 'Y';
            
            const score = minimax(nextBoard, 3, false, -Infinity, Infinity);
            if (score > bestScore) {
                bestScore = score;
                bestCol = col;
            }
        }

        return bestCol;
    };

    const minimax = (nodeBoard, depth, isMaximizing, alpha, beta) => {
        const winRes = checkWin(nodeBoard);
        if (winRes) {
            return winRes.player === 'Y' ? 100000 + depth : -100000 - depth;
        }
        if (checkDraw(nodeBoard)) return 0;
        if (depth === 0) {
            return scoreBoard(nodeBoard);
        }

        const validCols = [];
        for (let c = 0; c < COLS; c++) {
            if (getNextAvailableRow(c, nodeBoard) !== -1) validCols.push(c);
        }

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let col of validCols) {
                const row = getNextAvailableRow(col, nodeBoard);
                const nextBoard = nodeBoard.map(r => [...r]);
                nextBoard[row][col] = 'Y';
                const evalVal = minimax(nextBoard, depth - 1, false, alpha, beta);
                maxEval = Math.max(maxEval, evalVal);
                alpha = Math.max(alpha, evalVal);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let col of validCols) {
                const row = getNextAvailableRow(col, nodeBoard);
                const nextBoard = nodeBoard.map(r => [...r]);
                nextBoard[row][col] = 'R';
                const evalVal = minimax(nextBoard, depth - 1, true, alpha, beta);
                minEval = Math.min(minEval, evalVal);
                beta = Math.min(beta, evalVal);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    };

    const scoreBoard = (tempBoard) => {
        let score = 0;
        // Center column bonus
        const centerCol = 3;
        for (let r = 0; r < ROWS; r++) {
            if (tempBoard[r][centerCol] === 'Y') score += 4;
            else if (tempBoard[r][centerCol] === 'R') score -= 4;
        }

        // Horizontal window check
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS - 3; c++) {
                score += evaluateWindow([tempBoard[r][c], tempBoard[r][c+1], tempBoard[r][c+2], tempBoard[r][c+3]]);
            }
        }
        // Vertical
        for (let c = 0; c < COLS; c++) {
            for (let r = 0; r < ROWS - 3; r++) {
                score += evaluateWindow([tempBoard[r][c], tempBoard[r+1][c], tempBoard[r+2][c], tempBoard[r+3][c]]);
            }
        }
        // Diagonal Down-Right
        for (let r = 0; r < ROWS - 3; r++) {
            for (let c = 0; c < COLS - 3; c++) {
                score += evaluateWindow([tempBoard[r][c], tempBoard[r+1][c+1], tempBoard[r+2][c+2], tempBoard[r+3][c+3]]);
            }
        }
        // Diagonal Up-Right
        for (let r = 3; r < ROWS; r++) {
            for (let c = 0; c < COLS - 3; c++) {
                score += evaluateWindow([tempBoard[r][c], tempBoard[r-1][c+1], tempBoard[r-2][c+2], tempBoard[r-3][c+3]]);
            }
        }
        return score;
    };

    const evaluateWindow = (windowArr) => {
        let score = 0;
        const aiCount = windowArr.filter(c => c === 'Y').length;
        const playerCount = windowArr.filter(c => c === 'R').length;
        const emptyCount = windowArr.filter(c => c === null).length;

        if (aiCount === 4) score += 1000;
        else if (aiCount === 3 && emptyCount === 1) score += 50;
        else if (aiCount === 2 && emptyCount === 2) score += 5;

        if (playerCount === 3 && emptyCount === 1) score -= 80;
        else if (playerCount === 2 && emptyCount === 2) score -= 8;

        return score;
    };

    const isWinningCell = (r, c) => {
        return winningCells.some(([wr, wc]) => wr === r && wc === c);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            maxWidth: '620px', margin: '30px auto', padding: '24px',
            backgroundColor: 'var(--panel-bg, rgba(30, 41, 59, 0.45))',
            backdropFilter: 'blur(12px)', border: '1px solid var(--border)',
            borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.5s ease', textAlign: 'center'
        }}>
            {/* Header Control Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['easy', 'medium', 'hard'].map(d => (
                        <button
                            key={d}
                            onClick={() => { playClick(); setDifficulty(d); resetGame(); }}
                            style={{
                                padding: '6px 12px', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '8px',
                                border: '1px solid var(--border)', cursor: 'pointer',
                                backgroundColor: difficulty === d ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                                color: difficulty === d ? 'white' : 'var(--text-muted)'
                            }}
                        >
                            {d === 'easy' ? 'Fácil' : d === 'medium' ? 'Medio' : 'Difícil'}
                        </button>
                    ))}
                </div>
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

            {/* Turn Announcement */}
            <div style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: 'bold', minHeight: '28px', color: 'var(--text-main)' }}>
                {winner ? (
                    winner === 'R' ? <span style={{ color: '#10b981' }}>🏆 ¡Ganaste la partida!</span> :
                    winner === 'Y' ? <span style={{ color: '#ef4444' }}>🤖 La IA ha ganado la partida</span> :
                    <span style={{ color: '#a78bfa' }}>🤝 Empate</span>
                ) : (
                    currentPlayer === 'R' ? <span style={{ color: '#3b82f6' }}>🔴 Tu Turno (Rojo)</span> :
                    <span style={{ color: '#f59e0b' }}>🟡 IA pensando... (Amarillo)</span>
                )}
            </div>

            {/* The Connect 4 Grid */}
            <div style={{
                backgroundColor: 'rgba(29, 78, 216, 0.95)', // Classic blue board color
                border: '4px solid #1e3a8a',
                borderRadius: '16px',
                padding: '16px',
                display: 'inline-grid',
                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                gap: '12px',
                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.4)',
                position: 'relative'
            }}>
                {board.map((row, rIndex) => (
                    row.map((cell, cIndex) => {
                        const isWin = isWinningCell(rIndex, cIndex);
                        return (
                            <button
                                key={`${rIndex}-${cIndex}`}
                                onClick={() => handleCellClick(cIndex)}
                                style={{
                                    width: '50px', height: '50px',
                                    borderRadius: '50%', border: 'none',
                                    backgroundColor: cell === 'R' ? '#ef4444' : cell === 'Y' ? '#f59e0b' : '#0f172a',
                                    cursor: winner || isAiThinking || board[0][cIndex] !== null ? 'not-allowed' : 'pointer',
                                    boxShadow: cell ? 'inset 0 4px 8px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)' : 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    outline: 'none', transition: 'transform 0.15s, background-color 0.2s',
                                    border: isWin ? '3px solid #10b981' : 'none',
                                    transform: isWin ? 'scale(1.1)' : 'none',
                                    animation: cell && rIndex === getNextAvailableRow(cIndex, board) ? 'dropDisc 0.4s cubic-bezier(0.25, 1, 0.5, 1)' : 'none'
                                }}
                                onMouseOver={(e) => {
                                    if (!cell && !winner && !isAiThinking && board[0][cIndex] === null) {
                                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.3)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!cell) {
                                        e.currentTarget.style.backgroundColor = '#0f172a';
                                    }
                                }}
                            >
                                {isWin && <Trophy size={20} color="#10b981" />}
                            </button>
                        );
                    })
                ))}
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Consigue alinear 4 fichas rojas en horizontal, vertical o diagonal.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title={winner === 'R' ? "¡Felicitaciones!" : winner === 'Y' ? "¡Oh no!" : "¡Buen intento!"}
                message={winner === 'R' ? "Has derrotado a la Inteligencia Artificial de Divertimente." : winner === 'Y' ? "La IA ha conseguido alinear 4 fichas." : "El tablero está lleno."}
                timeElapsed={timeElapsed}
                onPlayAgain={resetGame}
            />

            {/* Custom Disc Falling animation */}
            <style>{`
                @keyframes dropDisc {
                    from { transform: translateY(-300px); }
                    to { transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Connect4Page;
