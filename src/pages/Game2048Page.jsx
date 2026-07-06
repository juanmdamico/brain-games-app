import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import GameControls from '../components/common/GameControls';
import Timer from '../components/common/Timer';
import InstructionsModal from '../components/common/InstructionsModal';
import VictoryModal from '../components/common/VictoryModal';
import { init2048, moveBoard } from '../components/Game2048/game2048Logic';

const Game2048Page = () => {
    const [board, setBoard] = useState(Array(4).fill(Array(4).fill(0)));
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);

    // UX Polish State
    const [timerRunning, setTimerRunning] = useState(false);
    const [time, setTime] = useState(0);
    const [showInstructions, setShowInstructions] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [resetTrigger, setResetTrigger] = useState(0);

    const startNewGame = useCallback(() => {
        const initialState = init2048();
        setBoard(initialState.board);
        setScore(initialState.score);
        setGameOver(initialState.gameOver);
        setWon(initialState.won);
        setTimerRunning(true);
        setResetTrigger(prev => prev + 1);
        setShowVictory(false);
    }, []);

    useEffect(() => {
        startNewGame();
    }, [startNewGame]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameOver) return;

            let direction = null;
            if (e.key === 'ArrowUp' || e.key === 'w') direction = 'UP';
            else if (e.key === 'ArrowDown' || e.key === 's') direction = 'DOWN';
            else if (e.key === 'ArrowLeft' || e.key === 'a') direction = 'LEFT';
            else if (e.key === 'ArrowRight' || e.key === 'd') direction = 'RIGHT';

            if (direction) {
                e.preventDefault();
                const result = moveBoard(board, direction);
                if (result.moved) {
                    setBoard(result.board);
                    setScore(prev => prev + result.scoreAdded);
                    
                    if (result.gameOver) {
                        setGameOver(true);
                        setTimerRunning(false);
                    }
                    if (result.won && !won) {
                        setWon(true);
                        setTimerRunning(false);
                        setShowVictory(true);
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [board, gameOver, won]);

    const getTileColor = (val) => {
        const colors = {
            2: { bg: '#eee4da', text: '#776e65' },
            4: { bg: '#ede0c8', text: '#776e65' },
            8: { bg: '#f2b179', text: '#f9f6f2' },
            16: { bg: '#f59563', text: '#f9f6f2' },
            32: { bg: '#f67c5f', text: '#f9f6f2' },
            64: { bg: '#f65e3b', text: '#f9f6f2' },
            128: { bg: '#edcf72', text: '#f9f6f2' },
            256: { bg: '#edcc61', text: '#f9f6f2' },
            512: { bg: '#edc850', text: '#f9f6f2' },
            1024: { bg: '#edc53f', text: '#f9f6f2' },
            2048: { bg: '#edc22e', text: '#f9f6f2' },
        };
        return colors[val] || { bg: '#3c3a32', text: '#f9f6f2' };
    };

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', overflowX: 'auto' }}>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <Timer isRunning={timerRunning} onTimeUpdate={setTime} resetTrigger={resetTrigger} />
                        <button 
                            onClick={() => setShowInstructions(true)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#60a5fa', padding: 0 }}
                        >
                            <HelpCircle size={24} /> <span style={{ marginLeft: '5px' }}>Ayuda</span>
                        </button>
                    </div>
                    <h1 style={{ fontWeight: 800, fontSize: '3rem', background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                        2048
                    </h1>
                    <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: '10px 20px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Score</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>{score}</div>
                    </div>
                </header>

                {(won || gameOver) && (
                    <div className={`message ${won ? 'success' : 'error-msg'}`} style={{
                        textAlign: 'center', padding: '14px', borderRadius: '12px', marginBottom: '20px', fontWeight: 600,
                        backgroundColor: won ? 'rgba(16, 185, 129, 0.15)' : 'rgba(225, 29, 72, 0.15)',
                        color: won ? '#34d399' : '#fb7185',
                        border: `1px solid ${won ? 'rgba(16, 185, 129, 0.3)' : 'rgba(225, 29, 72, 0.3)'}`
                    }}>
                        {won ? "¡Ganaste! Has llegado al 2048." : "¡Juego Terminado! No hay más movimientos."}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                    <div style={{
                        display: 'grid', 
                        gridTemplateColumns: `repeat(4, 1fr)`, 
                        gridTemplateRows: `repeat(4, 1fr)`,
                        gap: '12px', backgroundColor: '#bbada0', border: '6px solid #bbada0',
                        borderRadius: '12px', padding: '0', width: '350px', height: '350px'
                    }}>
                        {board.map((row, r) => (
                            row.map((val, c) => {
                                const style = getTileColor(val);
                                return (
                                    <div 
                                        key={`${r}-${c}`}
                                        style={{
                                            backgroundColor: val === 0 ? 'rgba(238, 228, 218, 0.35)' : style.bg,
                                            borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                                            fontSize: val > 1000 ? '2rem' : val > 100 ? '2.5rem' : '3rem', 
                                            fontWeight: 'bold', 
                                            color: style.text,
                                            boxShadow: val > 0 ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                            transition: 'all 0.15s ease-in-out',
                                        }}
                                    >
                                        {val > 0 ? val : ''}
                                    </div>
                                );
                            })
                        ))}
                    </div>
                </div>

                <GameControls 
                    onNewGame={startNewGame}
                />
            </div>

            <InstructionsModal 
                isOpen={showInstructions}
                onClose={() => setShowInstructions(false)}
                title="2048"
                instructions={[
                    "Usa las flechas del teclado o las teclas W, A, S, D para mover todas las baldosas en una dirección.",
                    "Cuando dos baldosas con el mismo número se tocan, se fusionan en una sola.",
                    "El objetivo es seguir fusionando números hasta conseguir una baldosa con el valor 2048."
                ]}
            />
            
            <VictoryModal 
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                time={time}
                gameName="2048"
            />
        </div>
    );
};

export default Game2048Page;
