import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const SIZE = 8;
const GRID_CELL_SIZE = 32;

// 1 = Wall, 0 = Dot
const MAZE = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 1, 0, 1],
    [1, 1, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
];

const PacmanPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const canvasRef = useRef(null);

    // Entities states
    const [player, setPlayer] = useState({ r: 1, c: 1 });
    const [ghost, setGhost] = useState({ r: 6, c: 6 });
    const [dots, setDots] = useState(Array(SIZE).fill(null).map(() => Array(SIZE).fill(false)));
    const [score, setScore] = useState(0);
    const [winner, setWinner] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [timeElapsed, setTimeElapsed] = useState(0);

    // Track total dots to collect
    const [totalDots, setTotalDots] = useState(0);

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

    // Canvas drawing
    useEffect(() => {
        draw();
    }, [player, ghost, dots, gameOver, winner]);

    // Ghost movement loop
    useEffect(() => {
        if (winner || gameOver) return;
        const interval = setInterval(moveGhost, 800);
        return () => clearInterval(interval);
    }, [player, ghost, winner, gameOver]);

    // Keyboard handlers
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (winner || gameOver) return;
            
            let nextR = player.r;
            let nextC = player.c;

            if (e.key === 'ArrowUp') nextR--;
            else if (e.key === 'ArrowDown') nextR++;
            else if (e.key === 'ArrowLeft') nextC--;
            else if (e.key === 'ArrowRight') nextC++;
            else return;

            e.preventDefault();

            // Collision check with wall
            if (nextR >= 0 && nextR < SIZE && nextC >= 0 && nextC < SIZE && MAZE[nextR][nextC] !== 1) {
                // Move player
                setPlayer({ r: nextR, c: nextC });

                // Check dot eat
                if (dots[nextR][nextC]) {
                    playClick();
                    const newDots = dots.map((row, rIdx) => 
                        rIdx === nextR ? row.map((d, cIdx) => cIdx === nextC ? false : d) : row
                    );
                    setDots(newDots);
                    
                    const nextScore = score + 10;
                    setScore(nextScore);

                    // Check Win (all dots eaten)
                    if (countActiveDots(newDots) === 0) {
                        setWinner(true);
                        playVictorySfx();
                        registerGameCompletion('pacman', 'medium', timeElapsed, nextScore);
                        setShowVictory(true);
                    }
                }

                // Check collision with ghost
                if (nextR === ghost.r && nextC === ghost.c) {
                    triggerGameOver();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [player, ghost, dots, score, winner, gameOver]);

    const initGame = () => {
        const tempDots = Array(SIZE).fill(null).map((_, r) => 
            Array(SIZE).fill(null).map((_, c) => MAZE[r][c] === 0)
        );
        // Exclude starting cell from dot
        tempDots[1][1] = false;

        let dotCount = 0;
        tempDots.forEach(row => row.forEach(cell => { if (cell) dotCount++; }));

        setPlayer({ r: 1, c: 1 });
        setGhost({ r: 6, c: 6 });
        setDots(tempDots);
        setTotalDots(dotCount);
        setScore(0);
        setWinner(false);
        setGameOver(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const countActiveDots = (currentDots) => {
        let count = 0;
        currentDots.forEach(row => row.forEach(cell => { if (cell) count++; }));
        return count;
    };

    const triggerGameOver = () => {
        setGameOver(true);
        playErrorSfx();
        setStatusMessage('¡Te atrapó el fantasma!');
    };

    const moveGhost = () => {
        // Simple BFS chase player
        const queue = [{ r: ghost.r, c: ghost.c, path: [] }];
        const visited = new Set();
        visited.add(`${ghost.r}-${ghost.c}`);

        let nextMove = null;

        while (queue.length > 0) {
            const curr = queue.shift();
            if (curr.r === player.r && curr.c === player.c) {
                nextMove = curr.path[0];
                break;
            }

            const adjs = [[-1,0], [1,0], [0,-1], [0,1]];
            for (let [dr, dc] of adjs) {
                const nr = curr.r + dr;
                const nc = curr.c + dc;
                const key = `${nr}-${nc}`;

                if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && MAZE[nr][nc] !== 1 && !visited.has(key)) {
                    visited.add(key);
                    queue.push({
                        r: nr, c: nc,
                        path: [...curr.path, { r: nr, c: nc }]
                    });
                }
            }
        }

        if (nextMove) {
            setGhost(nextMove);
            // Check collision with player
            if (nextMove.r === player.r && nextMove.c === player.c) {
                triggerGameOver();
            }
        }
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Maze Walls and Dots
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const x = c * GRID_CELL_SIZE;
                const y = r * GRID_CELL_SIZE;

                if (MAZE[r][c] === 1) {
                    // Wall
                    ctx.fillStyle = '#1e3a8a'; // Deep blue wall
                    ctx.fillRect(x, y, GRID_CELL_SIZE, GRID_CELL_SIZE);
                    ctx.strokeStyle = '#3b82f6'; // Bright blue edge
                    ctx.strokeRect(x, y, GRID_CELL_SIZE, GRID_CELL_SIZE);
                } else {
                    // Dot
                    if (dots[r][c]) {
                        ctx.fillStyle = '#fbbf24'; // Yellow dot
                        ctx.beginPath();
                        ctx.arc(x + GRID_CELL_SIZE/2, y + GRID_CELL_SIZE/2, 4, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        }

        // Draw Player (Pac-Man)
        const px = player.c * GRID_CELL_SIZE + GRID_CELL_SIZE/2;
        const py = player.r * GRID_CELL_SIZE + GRID_CELL_SIZE/2;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(px, py, 11, 0.2 * Math.PI, 1.8 * Math.PI); // mouth open shape
        ctx.lineTo(px, py);
        ctx.fill();

        // Draw Ghost
        const gx = ghost.c * GRID_CELL_SIZE + GRID_CELL_SIZE/2;
        const gy = ghost.r * GRID_CELL_SIZE + GRID_CELL_SIZE/2;
        ctx.fillStyle = '#ef4444'; // Red Blinky ghost
        ctx.beginPath();
        ctx.arc(gx, gy, 11, Math.PI, 0, false);
        ctx.lineTo(gx + 11, gy + 11);
        ctx.lineTo(gx - 11, gy + 11);
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(gx - 4, gy - 2, 3, 0, Math.PI * 2);
        ctx.arc(gx + 4, gy - 2, 3, 0, Math.PI * 2);
        ctx.fill();
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
                    Pac-Man (Edición de Bolsillo)
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
                <span>Puntos restantes: <strong>{countActiveDots(dots) * 10}</strong></span>
            </div>

            {/* Game Canvas */}
            <div style={{
                position: 'relative',
                display: 'inline-block',
                backgroundColor: '#000000',
                border: '4px solid #1e3a8a',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                padding: '4px',
                marginBottom: '20px'
            }}>
                <canvas ref={canvasRef} width={SIZE * GRID_CELL_SIZE} height={SIZE * GRID_CELL_SIZE} />
                
                {gameOver && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.8)', color: '#f87171', fontWeight: 'bold',
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

            {/* D-Pad Buttons for Mobile */}
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', marginBottom: '10px'
            }}>
                <button
                    onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))}
                    style={{ width: '40px', height: '36px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    ▲
                </button>
                <div style={{ display: 'flex', gap: '30px' }}>
                    <button
                        onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))}
                        style={{ width: '40px', height: '36px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        ◀
                    </button>
                    <button
                        onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))}
                        style={{ width: '40px', height: '36px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        ▶
                    </button>
                </div>
                <button
                    onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))}
                    style={{ width: '40px', height: '36px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    ▼
                </button>
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Usa las teclas de dirección del teclado o los botones en pantalla para mover a Pac-Man. Come todos los puntos amarillos del laberinto para ganar, mientras esquivas al fantasma Blinky rojo que te persigue por el camino.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Laberinto Limpio!"
                message={`Has devorado todas las pastillas esquivando al fantasma con un puntaje de ${score}.`}
                timeElapsed={timeElapsed}
                onPlayAgain={initGame}
            />
        </div>
    );
};

export default PacmanPage;
