import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const CANVAS_WIDTH = 340;
const CANVAS_HEIGHT = 300;
const PADDLE_WIDTH = 64;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 6;
const ROW_COUNT = 3;
const COL_COUNT = 6;
const BRICK_WIDTH = 50;
const BRICK_HEIGHT = 14;
const BRICK_PADDING = 4;
const BRICK_OFFSET_TOP = 20;
const BRICK_OFFSET_LEFT = 10;

const BreakoutPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const canvasRef = useRef(null);

    // State indicators
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [winner, setWinner] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [startTime, setStartTime] = useState(Date.now());

    // Game loop mutable references (to avoid React re-render lag)
    const paddleXRef = useRef((CANVAS_WIDTH - PADDLE_WIDTH) / 2);
    const ballRef = useRef({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30, dx: 2, dy: -2 });
    const bricksRef = useRef([]);

    useEffect(() => {
        initGame();
    }, []);

    useEffect(() => {
        if (winner || gameOver) return;
        const timer = setInterval(() => {
            setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime, winner, gameOver]);

    // Game animation loop
    useEffect(() => {
        if (winner || gameOver) return;
        let animFrameId;

        const update = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            const ball = ballRef.current;
            const bricks = bricksRef.current;
            const paddleX = paddleXRef.current;

            // 1. Move Ball
            ball.x += ball.dx;
            ball.y += ball.dy;

            // 2. Wall bounces (left/right)
            if (ball.x + ball.dx > CANVAS_WIDTH - BALL_RADIUS || ball.x + ball.dx < BALL_RADIUS) {
                ball.dx = -ball.dx;
                playClick();
            }

            // Wall bounce (top)
            if (ball.y + ball.dy < BALL_RADIUS) {
                ball.dy = -ball.dy;
                playClick();
            }

            // 3. Paddle collision (bottom)
            if (ball.y + ball.dy > CANVAS_HEIGHT - BALL_RADIUS - PADDLE_HEIGHT) {
                if (ball.x > paddleX && ball.x < paddleX + PADDLE_WIDTH) {
                    ball.dy = -ball.dy;
                    playClick();
                } else if (ball.y + ball.dy > CANVAS_HEIGHT - BALL_RADIUS) {
                    // Ball went off bottom
                    setLives(prev => {
                        const nextLives = prev - 1;
                        if (nextLives === 0) {
                            setGameOver(true);
                            playErrorSfx();
                        } else {
                            // Reset ball position
                            ballRef.current = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30, dx: 2, dy: -2 };
                            playErrorSfx();
                        }
                        return nextLives;
                    });
                }
            }

            // 4. Brick collisions
            let activeBricks = 0;
            for (let r = 0; r < ROW_COUNT; r++) {
                for (let c = 0; c < COL_COUNT; c++) {
                    const b = bricks[r][c];
                    if (b.status === 1) {
                        activeBricks++;
                        // Check collision
                        if (ball.x > b.x && ball.x < b.x + BRICK_WIDTH && ball.y > b.y && ball.y < b.y + BRICK_HEIGHT) {
                            ball.dy = -ball.dy;
                            b.status = 0; // destroyed
                            playClick();
                            setScore(prev => {
                                const nextScore = prev + 10;
                                return nextScore;
                            });
                        }
                    }
                }
            }

            // Check Win
            if (activeBricks === 0) {
                setWinner(true);
                playVictorySfx();
                registerGameCompletion('breakout', 'medium', timeElapsed, score + 10);
                setShowVictory(true);
                return;
            }

            // 5. Draw elements
            // Bricks
            for (let r = 0; r < ROW_COUNT; r++) {
                for (let c = 0; c < COL_COUNT; c++) {
                    const b = bricks[r][c];
                    if (b.status === 1) {
                        ctx.fillStyle = b.color;
                        ctx.fillRect(b.x, b.y, BRICK_WIDTH, BRICK_HEIGHT);
                        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                        ctx.strokeRect(b.x, b.y, BRICK_WIDTH, BRICK_HEIGHT);
                    }
                }
            }

            // Paddle
            ctx.fillStyle = 'var(--primary, #3b82f6)';
            ctx.fillRect(paddleX, CANVAS_HEIGHT - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);

            // Ball
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
            ctx.fill();

            animFrameId = requestAnimationFrame(update);
        };

        animFrameId = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animFrameId);
    }, [winner, gameOver]);

    // Touch/Mouse moves paddle
    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const root = document.documentElement;

        const mouseX = e.clientX - rect.left - root.scrollLeft;
        let px = mouseX - PADDLE_WIDTH / 2;
        if (px < 0) px = 0;
        if (px > CANVAS_WIDTH - PADDLE_WIDTH) px = CANVAS_WIDTH - PADDLE_WIDTH;
        paddleXRef.current = px;
    };

    const handleDpadMove = (direction) => {
        let px = paddleXRef.current;
        if (direction === 'L') px -= 25;
        else px += 25;

        if (px < 0) px = 0;
        if (px > CANVAS_WIDTH - PADDLE_WIDTH) px = CANVAS_WIDTH - PADDLE_WIDTH;
        paddleXRef.current = px;
    };

    const initGame = () => {
        paddleXRef.current = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
        ballRef.current = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30, dx: 2, dy: -2 };

        // Generate bricks
        const colors = ['#f43f5e', '#a855f7', '#fbbf24']; // row colors
        let tempBricks = [];
        for (let r = 0; r < ROW_COUNT; r++) {
            let row = [];
            for (let c = 0; c < COL_COUNT; c++) {
                const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
                const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
                row.push({ x: brickX, y: brickY, status: 1, color: colors[r] });
            }
            tempBricks.push(row);
        }
        bricksRef.current = tempBricks;

        setScore(0);
        setLives(3);
        setWinner(false);
        setGameOver(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            maxWidth: '480px', margin: '30px auto', padding: '24px',
            backgroundColor: 'var(--panel-bg, rgba(30, 41, 59, 0.45))',
            backdropFilter: 'blur(12px)', border: '1px solid var(--border)',
            borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.5s ease', textAlign: 'center'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                    Breakout / Arkanoid
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

            {/* Score HUD */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <span>Puntos: <strong style={{ color: 'var(--primary)', fontSize: '1.05rem' }}>{score}</strong></span>
                <span>Vidas: <strong style={{ color: '#ef4444' }}>{'❤️'.repeat(lives)}</strong></span>
            </div>

            {/* Canvas */}
            <div style={{
                position: 'relative',
                display: 'inline-block',
                backgroundColor: '#0a0f1d',
                border: '4px solid #1e293b',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                marginBottom: '20px'
            }}>
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    onMouseMove={handleMouseMove}
                    style={{ cursor: 'none', display: 'block' }}
                />

                {gameOver && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.85)', color: '#f87171', fontWeight: 'bold',
                        fontSize: '1.5rem', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', borderRadius: '8px'
                    }}>
                        <span>GAME OVER</span>
                        <button onClick={initGame} style={{
                            marginTop: '12px', padding: '8px 16px', fontSize: '0.85rem',
                            backgroundColor: '#ef4444', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer'
                        }}>
                            Reintentar
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile Controls buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '10px' }}>
                <button
                    onClick={() => handleDpadMove('L')}
                    style={{
                        padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border)',
                        backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontWeight: 'bold', cursor: 'pointer'
                    }}
                >
                    ◀ Izquierda
                </button>
                <button
                    onClick={() => handleDpadMove('R')}
                    style={{
                        padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border)',
                        backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontWeight: 'bold', cursor: 'pointer'
                    }}
                >
                    Derecha ▶
                </button>
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Mueve la barra inferior deslizando el dedo, moviendo el ratón, o usando los botones para rebotar la bola y romper los bloques superiores. No dejes caer la bola por debajo. Destruye todas las filas de bloques para ganar.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Bloques Destruidos!"
                message={`Has despejado la pantalla rompiendo todos los ladrillos con una puntuación de ${score}.`}
                timeElapsed={timeElapsed}
                onPlayAgain={initGame}
            />
        </div>
    );
};

export default BreakoutPage;
