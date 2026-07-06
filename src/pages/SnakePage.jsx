import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import GameControls from '../components/common/GameControls';
import Timer from '../components/common/Timer';
import InstructionsModal from '../components/common/InstructionsModal';
import VictoryModal from '../components/common/VictoryModal';
import { GRID_SIZE, getInitialSnake, generateFood } from '../components/Snake/snakeLogic';
import { useApp } from '../context/AppContext';

const SnakePage = () => {
    const { playClick, playSuccessSfx, playErrorSfx } = useApp();

    const [difficulty, setDifficulty] = useState('medium');
    const [snake, setSnake] = useState(getInitialSnake());
    const [food, setFood] = useState({ x: 5, y: 5 });
    const [direction, setDirection] = useState('UP');
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    // UX Polish State
    const [timerRunning, setTimerRunning] = useState(false);
    const [time, setTime] = useState(0);
    const [showInstructions, setShowInstructions] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [resetTrigger, setResetTrigger] = useState(0);

    const directionRef = useRef(direction);
    directionRef.current = direction;

    const startNewGame = useCallback(() => {
        const initialSnake = getInitialSnake();
        setSnake(initialSnake);
        setFood(generateFood(initialSnake));
        setDirection('UP');
        directionRef.current = 'UP';
        setIsGameOver(false);
        setScore(0);
        setIsPaused(false);
        setGameStarted(true);
        setTimerRunning(true);
        setResetTrigger(prev => prev + 1);
        setShowVictory(false);
    }, []);

    useEffect(() => {
        startNewGame();
    }, [startNewGame]);

    const handleDirectionChange = (newDir) => {
        if (isGameOver || isPaused) return;
        if (newDir === 'UP' && directionRef.current !== 'DOWN') { setDirection('UP'); playClick(); }
        if (newDir === 'DOWN' && directionRef.current !== 'UP') { setDirection('DOWN'); playClick(); }
        if (newDir === 'LEFT' && directionRef.current !== 'RIGHT') { setDirection('LEFT'); playClick(); }
        if (newDir === 'RIGHT' && directionRef.current !== 'LEFT') { setDirection('RIGHT'); playClick(); }
    };

    const togglePause = () => {
        playClick();
        if (isGameOver) return;
        setIsPaused(prev => {
            const newPaused = !prev;
            setTimerRunning(!newPaused && !isGameOver);
            return newPaused;
        });
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isGameOver) return;
            if (e.key === ' ') {
                togglePause();
                e.preventDefault();
                return;
            }

            if (isPaused) return;

            if (['ArrowUp', 'w', 'W'].includes(e.key)) handleDirectionChange('UP');
            if (['ArrowDown', 's', 'S'].includes(e.key)) handleDirectionChange('DOWN');
            if (['ArrowLeft', 'a', 'A'].includes(e.key)) handleDirectionChange('LEFT');
            if (['ArrowRight', 'd', 'D'].includes(e.key)) handleDirectionChange('RIGHT');
            
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isGameOver, isPaused]);

    useEffect(() => {
        if (isGameOver || isPaused || !gameStarted) return;

        const moveSnake = () => {
            setSnake(prevSnake => {
                const head = { ...prevSnake[0] };

                switch (directionRef.current) {
                    case 'UP': head.y -= 1; break;
                    case 'DOWN': head.y += 1; break;
                    case 'LEFT': head.x -= 1; break;
                    case 'RIGHT': head.x += 1; break;
                    default: break;
                }

                // Check collision with walls
                if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
                    setIsGameOver(true);
                    setTimerRunning(false);
                    playErrorSfx(); // Collision sound
                    return prevSnake;
                }

                // Check collision with self
                if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
                    setIsGameOver(true);
                    setTimerRunning(false);
                    playErrorSfx(); // Collision sound
                    return prevSnake;
                }

                const newSnake = [head, ...prevSnake];

                // Check collision with food
                if (head.x === food.x && head.y === food.y) {
                    playSuccessSfx(); // Eat sound!
                    setScore(prev => prev + 10);
                    setFood(generateFood(newSnake));
                    
                    // Win condition at 100 points for a quicker but fun mobile game, or 150 points.
                    // Let's set it to 100 points so it is reachable and fun to trigger achievements!
                    if (score + 10 >= 100) {
                        setIsGameOver(true);
                        setTimerRunning(false);
                        setShowVictory(true);
                    }
                } else {
                    newSnake.pop(); // Remove tail if no food eaten
                }

                return newSnake;
            });
        };

        let speed = 150;
        if (difficulty === 'easy') speed = 200;
        if (difficulty === 'hard') speed = 85;

        const intervalId = setInterval(moveSnake, speed);
        return () => clearInterval(intervalId);
    }, [isGameOver, isPaused, gameStarted, food, difficulty, score]);

    const dpadButtonStyle = {
        padding: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        color: 'var(--text-main)',
        fontSize: '1.2rem',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: 'bold',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
    };

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', overflowX: 'hidden' }}>
            <div className="background-effects">
                <div className="glow-orb orb-1"></div>
                <div className="glow-orb orb-2"></div>
                <div className="glow-orb orb-3"></div>
            </div>

            <div style={{ width: '100%', maxWidth: '600px', marginBottom: '20px', zIndex: 10 }}>
                <Link to="/" onClick={playClick} style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: 'var(--surface-color)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border)', backdropFilter: 'blur(10px)' }}>
                    &larr; Volver al Hub
                </Link>
            </div>

            <div className="container" style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', maxWidth: '600px', width: '100%' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Timer isRunning={timerRunning} onTimeUpdate={setTime} resetTrigger={resetTrigger} />
                        <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600 }}>Score: <span style={{color: 'var(--text-main)'}}>{score}</span></div>
                    </div>
                    
                    <h1 style={{ fontWeight: 600, fontSize: '2.5rem', margin: '0 20px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Snake
                    </h1>
                    <button 
                        onClick={() => { playClick(); setShowInstructions(true); }}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#10b981', transition: 'transform 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <HelpCircle size={28} />
                    </button>
                </header>

                {isGameOver && !showVictory && (
                    <div className="message error-msg" style={{
                        textAlign: 'center', padding: '14px', borderRadius: '12px', marginBottom: '20px', fontWeight: 600,
                        backgroundColor: 'rgba(225, 29, 72, 0.15)', color: '#fb7185', border: '1px solid rgba(225, 29, 72, 0.3)'
                    }}>
                        ¡Juego Terminado! Puntuación final: {score}
                    </div>
                )}
                
                {isPaused && !isGameOver && (
                    <div className="message" style={{
                        textAlign: 'center', padding: '14px', borderRadius: '12px', marginBottom: '20px', fontWeight: 600,
                        backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}>
                        Juego Pausado
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '360px',
                        aspectRatio: '1/1',
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        border: '2px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }}>
                        {/* Render Food */}
                        <div style={{
                            position: 'absolute',
                            left: `${(food.x / GRID_SIZE) * 100}%`,
                            top: `${(food.y / GRID_SIZE) * 100}%`,
                            width: `${100 / GRID_SIZE}%`,
                            height: `${100 / GRID_SIZE}%`,
                            backgroundColor: '#ef4444',
                            borderRadius: '50%',
                            boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)',
                            transform: 'scale(0.8)'
                        }} />

                        {/* Render Snake */}
                        {snake.map((segment, index) => {
                            const isHead = index === 0;
                            return (
                                <div key={`${segment.x}-${segment.y}-${index}`} style={{
                                    position: 'absolute',
                                    left: `${(segment.x / GRID_SIZE) * 100}%`,
                                    top: `${(segment.y / GRID_SIZE) * 100}%`,
                                    width: `${100 / GRID_SIZE}%`,
                                    height: `${100 / GRID_SIZE}%`,
                                    backgroundColor: isHead ? '#34d399' : '#10b981',
                                    borderRadius: isHead ? '4px' : '2px',
                                    border: '1px solid rgba(0,0,0,0.2)',
                                    zIndex: isHead ? 2 : 1
                                }} />
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

                {/* Virtual D-Pad Controls for Mobile/Touch Play */}
                <div className="mobile-dpad" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '8px', 
                    width: '180px', 
                    margin: '25px auto 0 auto'
                }}>
                    <div></div>
                    <button onClick={() => handleDirectionChange('UP')} style={dpadButtonStyle}>▲</button>
                    <div></div>
                    <button onClick={() => handleDirectionChange('LEFT')} style={dpadButtonStyle}>◀</button>
                    <button onClick={togglePause} style={{ ...dpadButtonStyle, backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                        {isPaused ? '▶' : '⏸'}
                    </button>
                    <button onClick={() => handleDirectionChange('RIGHT')} style={dpadButtonStyle}>▶</button>
                    <div></div>
                    <button onClick={() => handleDirectionChange('DOWN')} style={dpadButtonStyle}>▼</button>
                </div>
            </div>

            <InstructionsModal 
                isOpen={showInstructions}
                onClose={() => setShowInstructions(false)}
                title="Snake"
                instructions={[
                    "Controla a la serpiente con las flechas del teclado, W/A/S/D o los botones de la pantalla.",
                    "Come la manzana roja para sumar puntos y crecer.",
                    "No choques contra los bordes ni contra ti mismo.",
                    "Presiona 'Espacio' o el botón del centro del control virtual para pausar.",
                    "¡Alcanza 100 puntos para ganar!"
                ]}
            />
            
            <VictoryModal 
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                time={time}
                gameName="Snake"
                difficulty={difficulty}
                extraScore={score}
            />
        </div>
    );
};

export default SnakePage;
