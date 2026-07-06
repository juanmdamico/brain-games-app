import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import GameControls from '../components/common/GameControls';
import Timer from '../components/common/Timer';
import InstructionsModal from '../components/common/InstructionsModal';
import VictoryModal from '../components/common/VictoryModal';
import { COLORS, getRandomColor } from '../components/SimonSays/simonLogic';

const SimonSaysPage = () => {
    const [difficulty, setDifficulty] = useState('medium');
    const [sequence, setSequence] = useState([]);
    const [playerSequence, setPlayerSequence] = useState([]);
    const [isPlayerTurn, setIsPlayerTurn] = useState(false);
    const [activeColor, setActiveColor] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);

    // UX Polish State
    const [timerRunning, setTimerRunning] = useState(false);
    const [time, setTime] = useState(0);
    const [showInstructions, setShowInstructions] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [resetTrigger, setResetTrigger] = useState(0);

    const timeoutRefs = useRef([]);

    const clearTimeouts = () => {
        timeoutRefs.current.forEach(clearTimeout);
        timeoutRefs.current = [];
    };

    const startNewGame = useCallback(() => {
        clearTimeouts();
        setSequence([getRandomColor()]);
        setPlayerSequence([]);
        setIsPlayerTurn(false);
        setGameOver(false);
        setScore(0);
        setActiveColor(null);
        setTimerRunning(true);
        setResetTrigger(prev => prev + 1);
        setShowVictory(false);
    }, []);

    useEffect(() => {
        startNewGame();
        return clearTimeouts;
    }, [startNewGame]);

    const playSequence = useCallback(() => {
        setIsPlayerTurn(false);
        let speed = 600;
        let pause = 200;
        if (difficulty === 'hard') { speed = 300; pause = 100; }
        if (difficulty === 'easy') { speed = 800; pause = 400; }

        sequence.forEach((color, index) => {
            const timeout1 = setTimeout(() => {
                setActiveColor(color);
                // We can add audio here if we want
            }, (speed + pause) * index + pause);
            
            const timeout2 = setTimeout(() => {
                setActiveColor(null);
            }, (speed + pause) * index + speed);
            
            timeoutRefs.current.push(timeout1, timeout2);
        });

        const turnTimeout = setTimeout(() => {
            setIsPlayerTurn(true);
        }, (speed + pause) * sequence.length + pause);
        
        timeoutRefs.current.push(turnTimeout);
    }, [sequence, difficulty]);

    useEffect(() => {
        if (sequence.length > 0 && !gameOver) {
            playSequence();
        }
    }, [sequence, playSequence, gameOver]);

    const handleColorClick = (color) => {
        if (!isPlayerTurn || gameOver) return;

        setActiveColor(color);
        setTimeout(() => setActiveColor(null), 200); // Visual feedback

        const newPlayerSequence = [...playerSequence, color];
        setPlayerSequence(newPlayerSequence);

        const currentIndex = newPlayerSequence.length - 1;

        if (newPlayerSequence[currentIndex] !== sequence[currentIndex]) {
            // Wrong choice
            setGameOver(true);
            setTimerRunning(false);
            return;
        }

        if (newPlayerSequence.length === sequence.length) {
            // Round complete
            setScore(prev => prev + 1);
            setIsPlayerTurn(false);
            
            // Check win condition (e.g. 15 points)
            if (score + 1 >= 15) {
                setGameOver(true);
                setTimerRunning(false);
                setShowVictory(true);
            } else {
                setTimeout(() => {
                    setSequence(prev => [...prev, getRandomColor()]);
                    setPlayerSequence([]);
                }, 1000);
            }
        }
    };

    const colorConfig = {
        green: { bg: '#10b981', glow: 'rgba(16, 185, 129, 0.8)' },
        red: { bg: '#ef4444', glow: 'rgba(239, 68, 68, 0.8)' },
        yellow: { bg: '#eab308', glow: 'rgba(234, 179, 8, 0.8)' },
        blue: { bg: '#3b82f6', glow: 'rgba(59, 130, 246, 0.8)' }
    };

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', overflowX: 'hidden' }}>
            <div className="background-effects">
                <div className="glow-orb orb-1"></div>
                <div className="glow-orb orb-2"></div>
                <div className="glow-orb orb-3"></div>
            </div>

            <div style={{ width: '100%', maxWidth: '600px', marginBottom: '20px', zIndex: 10 }}>
                <Link to="/" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: 'var(--surface-color)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border)', backdropFilter: 'blur(10px)' }}>
                    &larr; Volver al Hub
                </Link>
            </div>

            <div className="container" style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', maxWidth: '600px', width: '100%' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Timer isRunning={timerRunning} onTimeUpdate={setTime} resetTrigger={resetTrigger} />
                        <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600 }}>Score: <span style={{color: 'white'}}>{score}</span></div>
                    </div>
                    
                    <h1 style={{ fontWeight: 600, fontSize: '2.5rem', margin: '0 20px', background: 'linear-gradient(135deg, #eab308, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center' }}>
                        Simon Says
                    </h1>
                    
                    <button 
                        onClick={() => setShowInstructions(true)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#eab308', transition: 'transform 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <HelpCircle size={28} />
                    </button>
                </header>

                {gameOver && !showVictory && (
                    <div className="message error-msg" style={{
                        textAlign: 'center', padding: '14px', borderRadius: '12px', marginBottom: '20px', fontWeight: 600,
                        backgroundColor: 'rgba(225, 29, 72, 0.15)', color: '#fb7185', border: '1px solid rgba(225, 29, 72, 0.3)'
                    }}>
                        ¡Juego Terminado! Fallaste en el paso {score + 1}.
                    </div>
                )}
                
                {!gameOver && (
                    <div style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 600, minHeight: '30px' }}>
                        {isPlayerTurn ? <span style={{color: '#10b981'}}>¡Tu turno! Repite la secuencia.</span> : <span style={{color: '#3b82f6'}}>Presta atención...</span>}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '15px',
                        width: '100%',
                        maxWidth: '350px',
                        aspectRatio: '1/1',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        padding: '10px',
                        backgroundColor: 'rgba(15, 23, 42, 0.5)',
                        border: '8px solid var(--border-thick)',
                        boxShadow: '0 0 30px rgba(0,0,0,0.5) inset'
                    }}>
                        {COLORS.map((color, index) => {
                            const isActive = activeColor === color;
                            const isTopLeft = index === 0;
                            const isTopRight = index === 1;
                            const isBottomLeft = index === 2;
                            const isBottomRight = index === 3;
                            
                            let borderRadius = '0';
                            if (isTopLeft) borderRadius = '100% 0 0 0';
                            if (isTopRight) borderRadius = '0 100% 0 0';
                            if (isBottomLeft) borderRadius = '0 0 0 100%';
                            if (isBottomRight) borderRadius = '0 0 100% 0';

                            return (
                                <button
                                    key={color}
                                    onClick={() => handleColorClick(color)}
                                    disabled={!isPlayerTurn || gameOver}
                                    style={{
                                        backgroundColor: colorConfig[color].bg,
                                        borderRadius: borderRadius,
                                        border: 'none',
                                        cursor: isPlayerTurn && !gameOver ? 'pointer' : 'default',
                                        opacity: isActive ? 1 : 0.6,
                                        boxShadow: isActive ? `0 0 30px ${colorConfig[color].glow}` : 'none',
                                        transform: isActive ? 'scale(0.98)' : 'scale(1)',
                                        transition: 'all 0.1s',
                                        outline: 'none',
                                        padding: 0
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>

                <GameControls 
                    difficultyOptions={[
                        {value: 'easy', label: 'Lento'},
                        {value: 'medium', label: 'Normal'},
                        {value: 'hard', label: 'Rápido'}
                    ]}
                    currentDifficulty={difficulty}
                    onDifficultyChange={setDifficulty}
                    onNewGame={startNewGame}
                />
            </div>

            <InstructionsModal 
                isOpen={showInstructions}
                onClose={() => setShowInstructions(false)}
                title="Simon Says"
                instructions={[
                    "El juego iluminará un color al azar.",
                    "Haz clic en el mismo color que acabas de ver.",
                    "En cada ronda se añadirá un color nuevo a la secuencia.",
                    "Debes repetir la secuencia completa desde el principio en cada turno.",
                    "Llega a 15 rondas seguidas para ganar el desafío."
                ]}
            />
            
            <VictoryModal 
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                time={time}
                gameName="Simon Says (¡15 Rondas!)"
            />
        </div>
    );
};

export default SimonSaysPage;
