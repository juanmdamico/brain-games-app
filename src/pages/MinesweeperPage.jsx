import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import GameControls from '../components/common/GameControls';
import Timer from '../components/common/Timer';
import InstructionsModal from '../components/common/InstructionsModal';
import VictoryModal from '../components/common/VictoryModal';
import { generateMinesweeperBoard, revealCell, checkWin } from '../components/Minesweeper/minesweeperLogic';
import { useApp } from '../context/AppContext';

const difficulties = {
    beginner: { rows: 9, cols: 9, mines: 10, label: 'Principiante (9x9)' },
    intermediate: { rows: 16, cols: 16, mines: 40, label: 'Intermedio (16x16)' },
    expert: { rows: 16, cols: 30, mines: 99, label: 'Experto (16x30)' },
};

const MinesweeperPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx } = useApp();

    const [difficulty, setDifficulty] = useState('beginner');
    const [board, setBoard] = useState([]);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isWin, setIsWin] = useState(false);
    const [isFirstClick, setIsFirstClick] = useState(true);
    const [flagMode, setFlagMode] = useState(false); 
    const [hintCell, setHintCell] = useState(null); // Highlighted hint cell

    // UX Polish State
    const [timerRunning, setTimerRunning] = useState(false);
    const [time, setTime] = useState(0);
    const [showInstructions, setShowInstructions] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [resetTrigger, setResetTrigger] = useState(0);
    const [message, setMessage] = useState(null);

    const startNewGame = useCallback(() => {
        const conf = difficulties[difficulty];
        let emptyBoard = Array(conf.rows).fill().map(() => Array(conf.cols).fill({
            isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0
        }));
        setBoard(emptyBoard);
        setIsGameOver(false);
        setIsWin(false);
        setIsFirstClick(true);
        setTimerRunning(true);
        setResetTrigger(prev => prev + 1);
        setShowVictory(false);
        setHintCell(null);
        setMessage(null);
    }, [difficulty]);

    useEffect(() => {
        startNewGame();
    }, [startNewGame]);

    const handleCellClick = (r, c) => {
        if (isGameOver || isWin) return;
        setHintCell(null);
        setMessage(null);

        let currentBoard = board;

        if (flagMode) {
            handleRightClick(null, r, c);
            return;
        }

        if (board[r][c].isFlagged) return;

        playClick();

        if (isFirstClick) {
            const conf = difficulties[difficulty];
            currentBoard = generateMinesweeperBoard(conf.rows, conf.cols, conf.mines, r, c);
            setIsFirstClick(false);
        }

        if (currentBoard[r][c].isMine) {
            let revealedBoard = currentBoard.map(row => row.map(cell => {
                if (cell.isMine) return { ...cell, isRevealed: true };
                return cell;
            }));
            setBoard(revealedBoard);
            setIsGameOver(true);
            setTimerRunning(false);
            playErrorSfx(); // Explosion sound!
            return;
        }

        let newBoard = revealCell(currentBoard, r, c);
        setBoard(newBoard);

        if (checkWin(newBoard)) {
            setIsWin(true);
            setTimerRunning(false);
            setShowVictory(true);
        }
    };

    const handleRightClick = (e, r, c) => {
        if (e) e.preventDefault();
        if (isGameOver || isWin || board[r][c].isRevealed) return;

        playClick();
        let newBoard = board.map(row => row.map(cell => ({...cell})));
        newBoard[r][c].isFlagged = !newBoard[r][c].isFlagged;
        setBoard(newBoard);
    };

    // Smart Hint for Minesweeper
    const handleHint = () => {
        playClick();
        if (isGameOver || isWin) return;

        if (isFirstClick) {
            setMessage("Haz clic en cualquier casilla para comenzar con seguridad.");
            return;
        }

        const conf = difficulties[difficulty];

        // Find a safe cell that is unrevealed, not flagged, and adjacent to a revealed cell
        let safeCell = null;

        // Loop to find an intelligent hint (adjacent to numbers, to help deductions)
        for (let r = 0; r < conf.rows; r++) {
            for (let c = 0; c < conf.cols; c++) {
                const cell = board[r][c];
                if (!cell.isMine && !cell.isRevealed && !cell.isFlagged) {
                    // Check if adjacent to a revealed cell
                    let hasRevealedNeighbor = false;
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            const nr = r + dr;
                            const nc = c + dc;
                            if (nr >= 0 && nr < conf.rows && nc >= 0 && nc < conf.cols) {
                                if (board[nr][nc].isRevealed) {
                                    hasRevealedNeighbor = true;
                                    break;
                                }
                            }
                        }
                        if (hasRevealedNeighbor) break;
                    }

                    if (hasRevealedNeighbor) {
                        safeCell = { r, c };
                        break;
                    }
                }
            }
            if (safeCell) break;
        }

        // Fallback to ANY safe cell if no adjacent one is found
        if (!safeCell) {
            for (let r = 0; r < conf.rows; r++) {
                for (let c = 0; c < conf.cols; c++) {
                    const cell = board[r][c];
                    if (!cell.isMine && !cell.isRevealed && !cell.isFlagged) {
                        safeCell = { r, c };
                        break;
                    }
                }
                if (safeCell) break;
            }
        }

        if (safeCell) {
            // Highlight the cell
            setHintCell(safeCell);
            playSuccessSfx();
            setMessage(`Pista: La casilla en la fila ${safeCell.r + 1}, columna ${safeCell.c + 1} es segura.`);
        } else {
            setMessage("No quedan casillas seguras para revelar.");
        }
    };

    const getColor = (num) => {
        const colors = ['transparent', '#60a5fa', '#34d399', '#fb7185', '#a78bfa', '#f59e0b', '#2dd4bf', '#f1f5f9', '#94a3b8'];
        return colors[num];
    };

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', overflowX: 'auto' }}>
            <div className="background-effects">
                <div className="glow-orb orb-1"></div>
                <div className="glow-orb orb-2"></div>
                <div className="glow-orb orb-3"></div>
            </div>

            <div style={{ width: '100%', maxWidth: '800px', marginBottom: '20px', zIndex: 10 }}>
                <Link to="/" onClick={playClick} style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: 'var(--surface-color)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border)', backdropFilter: 'blur(10px)' }}>
                    &larr; Volver al Hub
                </Link>
            </div>

            <div className="container" style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', maxWidth: '100%', width: 'fit-content' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <Timer isRunning={timerRunning} onTimeUpdate={setTime} resetTrigger={resetTrigger} />
                    <h1 style={{ fontWeight: 600, fontSize: '2.2rem', margin: '0 20px', background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Buscaminas
                    </h1>
                    <button 
                        onClick={() => { playClick(); setShowInstructions(true); }}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#60a5fa', transition: 'transform 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <HelpCircle size={28} />
                    </button>
                </header>

                {(isWin || isGameOver || message) && (
                    <div className={`message ${isWin ? 'success' : isGameOver ? 'error-msg' : 'success'}`} style={{
                        textAlign: 'center', padding: '14px', borderRadius: '12px', marginBottom: '20px', fontWeight: 600,
                        backgroundColor: isWin ? 'rgba(16, 185, 129, 0.15)' : isGameOver ? 'rgba(225, 29, 72, 0.15)' : 'rgba(96, 165, 250, 0.15)',
                        color: isWin ? '#34d399' : isGameOver ? '#fb7185' : '#60a5fa',
                        border: `1px solid ${isWin ? 'rgba(16, 185, 129, 0.3)' : isGameOver ? 'rgba(225, 29, 72, 0.3)' : 'rgba(96, 165, 250, 0.3)'}`
                    }}>
                        {isWin ? "¡Misión Cumplida! Has despejado el campo." : isGameOver ? "¡BOOM! Has pisado una mina." : message}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', overflowX: 'auto', padding: '10px' }}>
                    <div style={{
                        display: 'grid', 
                        gridTemplateColumns: `repeat(${difficulties[difficulty].cols}, 1fr)`, 
                        gridTemplateRows: `repeat(${difficulties[difficulty].rows}, 1fr)`,
                        gap: '2px', backgroundColor: 'var(--cell-border)', border: 'var(--border-thick)',
                        borderRadius: '8px', padding: '4px'
                    }}>
                        {board.map((row, r) => (
                            row.map((cell, c) => {
                                const isHinted = hintCell && hintCell.r === r && hintCell.c === c;
                                return (
                                    <div 
                                        key={`${r}-${c}`}
                                        onClick={() => handleCellClick(r, c)}
                                        onContextMenu={(e) => handleRightClick(e, r, c)}
                                        style={{
                                            width: '32px', height: '32px', 
                                            backgroundColor: cell.isRevealed 
                                                ? 'rgba(15, 23, 42, 0.8)' 
                                                : isHinted 
                                                    ? 'rgba(59, 130, 246, 0.4)' 
                                                    : 'var(--cell-bg)',
                                            border: cell.isRevealed ? '1px solid rgba(255,255,255,0.02)' : '1px solid var(--border)',
                                            borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                                            fontSize: '1.2rem', fontWeight: '800', cursor: 'pointer',
                                            color: cell.isRevealed ? getColor(cell.neighborMines) : 'white',
                                            boxShadow: cell.isRevealed ? 'inset 0 3px 6px rgba(0,0,0,0.5)' : 'inset 0 2px 4px rgba(255,255,255,0.1)',
                                            borderWidth: isHinted ? '2px' : '1px',
                                            borderColor: isHinted ? '#60a5fa' : 'var(--border)',
                                            animation: isHinted ? 'shake 0.4s ease infinite' : 'none',
                                            transition: 'all 0.1s'
                                        }}
                                    >
                                        {cell.isRevealed ? (cell.isMine ? '💣' : (cell.neighborMines > 0 ? cell.neighborMines : '')) : (cell.isFlagged ? '🚩' : '')}
                                    </div>
                                );
                            })
                        ))}
                    </div>
                </div>

                <GameControls 
                    difficultyOptions={[
                        {value: 'beginner', label: 'Principiante'},
                        {value: 'intermediate', label: 'Intermedio'},
                        {value: 'expert', label: 'Experto'}
                    ]}
                    currentDifficulty={difficulty}
                    onDifficultyChange={setDifficulty}
                    onNewGame={startNewGame}
                    actions={[
                        {label: flagMode ? 'Modo: 🚩 Bandera' : 'Modo: ⛏️ Cavar', onClick: () => { playClick(); setFlagMode(!flagMode); }, variant: flagMode ? 'secondary' : 'primary'},
                        {label: 'Pista 💡', onClick: handleHint, variant: 'secondary'}
                    ]}
                />
            </div>

            <InstructionsModal 
                isOpen={showInstructions}
                onClose={() => setShowInstructions(false)}
                title="Buscaminas"
                instructions={[
                    "El objetivo del juego es despejar un campo de minas sin detonar ninguna.",
                    "El número en una casilla indica la cantidad de minas adyacentes a ella (horizontal, vertical o diagonalmente).",
                    "Usa la lógica para deducir qué casillas son seguras.",
                    "Haz clic izquierdo para cavar/descubrir una casilla. Haz clic derecho (o usa el botón 'Modo: Bandera') para marcar dónde crees que hay una mina."
                ]}
            />
            
            <VictoryModal 
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                time={time}
                gameName="Buscaminas"
                difficulty={difficulty}
            />
        </div>
    );
};

export default MinesweeperPage;
