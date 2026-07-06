import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import GameControls from '../components/common/GameControls';
import Timer from '../components/common/Timer';
import InstructionsModal from '../components/common/InstructionsModal';
import VictoryModal from '../components/common/VictoryModal';
import { checkTicTacToeWin, getBestMove } from '../components/TicTacToe/tictactoeLogic';

const TicTacToePage = () => {
    const [difficulty, setDifficulty] = useState('medium');
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const [winningLine, setWinningLine] = useState([]);

    // UX Polish State
    const [timerRunning, setTimerRunning] = useState(false);
    const [time, setTime] = useState(0);
    const [showInstructions, setShowInstructions] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [resetTrigger, setResetTrigger] = useState(0);

    const startNewGame = useCallback(() => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        setGameOver(false);
        setWinner(null);
        setWinningLine([]);
        setTimerRunning(true);
        setResetTrigger(prev => prev + 1);
        setShowVictory(false);
    }, []);

    useEffect(() => {
        startNewGame();
    }, [startNewGame]);

    const handleCellClick = (index) => {
        if (gameOver || board[index]) return;
        
        // Player move
        const newBoard = [...board];
        newBoard[index] = 'X';
        setBoard(newBoard);
        setIsXNext(false);
        
        const winResult = checkTicTacToeWin(newBoard);
        if (winResult) {
            handleWin(winResult);
        }
    };

    // AI Move
    useEffect(() => {
        if (!isXNext && !gameOver) {
            const timer = setTimeout(() => {
                const aiMove = getBestMove(board, difficulty, 'O');
                if (aiMove !== -1) {
                    const newBoard = [...board];
                    newBoard[aiMove] = 'O';
                    setBoard(newBoard);
                    setIsXNext(true);
                    
                    const winResult = checkTicTacToeWin(newBoard);
                    if (winResult) {
                        handleWin(winResult);
                    }
                }
            }, 500); // Small delay to feel natural
            return () => clearTimeout(timer);
        }
    }, [isXNext, board, gameOver, difficulty]);

    const handleWin = (result) => {
        setGameOver(true);
        setTimerRunning(false);
        setWinner(result.winner);
        setWinningLine(result.line || []);
        
        if (result.winner === 'X') {
            setShowVictory(true);
        }
    };

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', overflowX: 'hidden' }}>
            <div className="background-effects">
                <div className="glow-orb orb-1"></div>
                <div className="glow-orb orb-2"></div>
                <div className="glow-orb orb-3"></div>
            </div>

            <div style={{ width: '100%', maxWidth: '500px', marginBottom: '20px', zIndex: 10 }}>
                <Link to="/" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: 'var(--surface-color)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border)', backdropFilter: 'blur(10px)' }}>
                    &larr; Volver al Hub
                </Link>
            </div>

            <div className="container" style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', maxWidth: '500px', width: '100%' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <Timer isRunning={timerRunning} onTimeUpdate={setTime} resetTrigger={resetTrigger} />
                    
                    <h1 style={{ fontWeight: 600, fontSize: '2.2rem', margin: '0 20px', background: 'linear-gradient(135deg, #60a5fa, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center' }}>
                        Tres en línea
                    </h1>
                    
                    <button 
                        onClick={() => setShowInstructions(true)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#60a5fa', transition: 'transform 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <HelpCircle size={28} />
                    </button>
                </header>

                {gameOver && !showVictory && (
                    <div className={`message ${winner === 'draw' ? '' : 'error-msg'}`} style={{
                        textAlign: 'center', padding: '14px', borderRadius: '12px', marginBottom: '20px', fontWeight: 600,
                        backgroundColor: winner === 'draw' ? 'rgba(148, 163, 184, 0.15)' : 'rgba(225, 29, 72, 0.15)',
                        color: winner === 'draw' ? '#cbd5e1' : '#fb7185',
                        border: `1px solid ${winner === 'draw' ? 'rgba(148, 163, 184, 0.3)' : 'rgba(225, 29, 72, 0.3)'}`
                    }}>
                        {winner === 'draw' ? '¡Empate!' : '¡La IA ha ganado!'}
                    </div>
                )}
                
                {!gameOver && (
                    <div style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>
                        Turno: {isXNext ? <span style={{color: '#3b82f6'}}>Tu turno (X)</span> : <span style={{color: '#ef4444'}}>IA pensando... (O)</span>}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '8px',
                        backgroundColor: 'var(--border-thick)',
                        padding: '8px',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '350px',
                        aspectRatio: '1/1'
                    }}>
                        {board.map((cell, index) => {
                            const isWinningCell = winningLine.includes(index);
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleCellClick(index)}
                                    disabled={gameOver || cell !== null || !isXNext}
                                    style={{
                                        backgroundColor: isWinningCell ? 'rgba(16, 185, 129, 0.2)' : 'var(--cell-bg)',
                                        border: `2px solid ${isWinningCell ? '#10b981' : 'transparent'}`,
                                        borderRadius: '8px',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                                        fontSize: '4rem', fontWeight: 700,
                                        color: cell === 'X' ? '#3b82f6' : '#ef4444',
                                        cursor: (gameOver || cell || !isXNext) ? 'default' : 'pointer',
                                        transition: 'all 0.2s',
                                        padding: 0
                                    }}
                                >
                                    {cell}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <GameControls 
                    difficultyOptions={[
                        {value: 'easy', label: 'Fácil'},
                        {value: 'medium', label: 'Normal'},
                        {value: 'hard', label: 'Imposible'}
                    ]}
                    currentDifficulty={difficulty}
                    onDifficultyChange={setDifficulty}
                    onNewGame={startNewGame}
                />
            </div>

            <InstructionsModal 
                isOpen={showInstructions}
                onClose={() => setShowInstructions(false)}
                title="Tres en línea"
                instructions={[
                    "El objetivo es conseguir alinear tres de tus símbolos (X) en vertical, horizontal o diagonal.",
                    "Juegas contra la Inteligencia Artificial (O).",
                    "El primer jugador en alinear 3 símbolos gana la partida.",
                    "Si el tablero se llena sin ningún ganador, el juego termina en empate."
                ]}
            />
            
            <VictoryModal 
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                time={time}
                gameName="Tres en línea"
            />
        </div>
    );
};

export default TicTacToePage;
