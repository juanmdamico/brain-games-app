import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Play, RotateCw } from 'lucide-react';

const SHAPES = {
    I: [[1, 1, 1, 1]],
    O: [[1, 1], [1, 1]],
    T: [[0, 1, 0], [1, 1, 1]],
    S: [[0, 1, 1], [1, 1, 0]],
    Z: [[1, 1, 0], [0, 1, 1]],
    J: [[1, 0, 0], [1, 1, 1]],
    L: [[0, 0, 1], [1, 1, 1]]
};

const COLORS = {
    I: '#06b6d4', // Cyan
    O: '#eab308', // Yellow
    T: '#a855f7', // Purple
    S: '#22c55e', // Green
    Z: '#ef4444', // Red
    J: '#2563eb', // Blue
    L: '#f97316'  // Orange
};

const ROWS = 20;
const COLS = 10;

const TetrisPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [grid, setGrid] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    const [currentPiece, setCurrentPiece] = useState(null);
    const [nextPiece, setNextPiece] = useState(null);
    const [currentPosition, setCurrentPosition] = useState({ r: 0, c: 3 });
    const [score, setScore] = useState(0);
    const [linesCleared, setLinesCleared] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);

    const gameInterval = useRef(null);
    const startTimeRef = useRef(Date.now());

    // Timer logic
    useEffect(() => {
        if (!isPlaying || gameOver) return;
        const timer = setInterval(() => {
            setTimeElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [isPlaying, gameOver]);

    // Game loop tick
    useEffect(() => {
        if (isPlaying && !gameOver) {
            gameInterval.current = setInterval(moveDown, 800);
        } else {
            clearInterval(gameInterval.current);
        }
        return () => clearInterval(gameInterval.current);
    }, [isPlaying, gameOver, currentPiece, currentPosition, grid]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isPlaying || gameOver) return;
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                e.preventDefault();
                moveSide(-1);
            } else if (e.key === 'ArrowRight' || e.key === 'd') {
                e.preventDefault();
                moveSide(1);
            } else if (e.key === 'ArrowDown' || e.key === 's') {
                e.preventDefault();
                moveDown();
            } else if (e.key === 'ArrowUp' || e.key === 'w') {
                e.preventDefault();
                rotatePiece();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, gameOver, currentPiece, currentPosition, grid]);

    const startGame = () => {
        playClick();
        setGrid(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
        setScore(0);
        setLinesCleared(0);
        setGameOver(false);
        setIsPlaying(true);
        setShowVictory(false);
        setTimeElapsed(0);
        startTimeRef.current = Date.now();

        // Generate first two pieces
        const keys = Object.keys(SHAPES);
        const t1 = keys[Math.floor(Math.random() * keys.length)];
        const t2 = keys[Math.floor(Math.random() * keys.length)];
        
        const p1 = { shape: SHAPES[t1], type: t1, color: COLORS[t1] };
        const p2 = { shape: SHAPES[t2], type: t2, color: COLORS[t2] };
        
        setCurrentPiece(p1);
        setNextPiece(p2);
        setCurrentPosition({ r: 0, c: Math.floor((COLS - p1.shape[0].length) / 2) });
    };

    const spawnPiece = () => {
        const keys = Object.keys(SHAPES);
        const randomType = keys[Math.floor(Math.random() * keys.length)];
        const shape = SHAPES[randomType];
        const generated = { shape, type: randomType, color: COLORS[randomType] };
        
        // Use nextPiece if available, and set generated as the next one
        const pieceToSpawn = nextPiece || generated;
        const initialPos = { r: 0, c: Math.floor((COLS - pieceToSpawn.shape[0].length) / 2) };

        if (checkCollision(pieceToSpawn.shape, initialPos, grid)) {
            // Game Over
            setIsPlaying(false);
            setGameOver(true);
            playErrorSfx();
            registerGameCompletion('tetris', 'medium', timeElapsed, score);
            setShowVictory(true);
        } else {
            setCurrentPiece(pieceToSpawn);
            setNextPiece(generated);
            setCurrentPosition(initialPos);
        }
    };

    const checkCollision = (shape, pos, tempGrid) => {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const gridR = pos.r + r;
                    const gridC = pos.c + c;

                    // Bounds check
                    if (gridR >= ROWS || gridC < 0 || gridC >= COLS) return true;

                    // Grid filled block check
                    if (gridR >= 0 && tempGrid[gridR][gridC]) return true;
                }
            }
        }
        return false;
    };

    const moveDown = () => {
        if (!currentPiece) return;
        const nextPos = { ...currentPosition, r: currentPosition.r + 1 };

        if (checkCollision(currentPiece.shape, nextPos, grid)) {
            lockPiece();
        } else {
            setCurrentPosition(nextPos);
        }
    };

    const moveSide = (dir) => {
        if (!currentPiece) return;
        playClick();
        const nextPos = { ...currentPosition, c: currentPosition.c + dir };
        if (!checkCollision(currentPiece.shape, nextPos, grid)) {
            setCurrentPosition(nextPos);
        }
    };

    const rotatePiece = () => {
        if (!currentPiece) return;
        playClick();
        const shape = currentPiece.shape;
        const N = shape.length;
        const M = shape[0].length;

        // Transpose and reverse rows to rotate 90 deg clockwise
        let rotated = Array(M).fill(null).map(() => Array(N).fill(0));
        for (let r = 0; r < N; r++) {
            for (let c = 0; c < M; c++) {
                rotated[c][N - 1 - r] = shape[r][c];
            }
        }

        // Kick logic if out of bounds on rotate
        let pos = { ...currentPosition };
        if (pos.c + rotated[0].length > COLS) {
            pos.c = COLS - rotated[0].length;
        }
        if (pos.c < 0) pos.c = 0;

        if (!checkCollision(rotated, pos, grid)) {
            setCurrentPiece({ ...currentPiece, shape: rotated });
            setCurrentPosition(pos);
        }
    };

    const lockPiece = () => {
        const newGrid = grid.map(row => [...row]);
        const shape = currentPiece.shape;

        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const gridR = currentPosition.r + r;
                    const gridC = currentPosition.c + c;
                    if (gridR >= 0) {
                        newGrid[gridR][gridC] = currentPiece.color;
                    }
                }
            }
        }

        // Check for line clears
        let linesCount = 0;
        const clearedGrid = newGrid.filter(row => {
            const isFull = row.every(cell => cell !== null);
            if (isFull) linesCount++;
            return !isFull;
        });

        // Insert new empty rows at the top
        while (clearedGrid.length < ROWS) {
            clearedGrid.unshift(Array(COLS).fill(null));
        }

        if (linesCount > 0) {
            playSuccessSfx();
            setScore(prev => prev + linesCount * 100 + (linesCount > 1 ? (linesCount - 1) * 50 : 0));
            setLinesCleared(prev => prev + linesCount);
        }

        setGrid(clearedGrid);
        spawnPiece();
    };

    const getRenderedGrid = () => {
        const displayGrid = grid.map(row => [...row]);
        if (currentPiece && isPlaying && !gameOver) {
            const shape = currentPiece.shape;
            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[r].length; c++) {
                    if (shape[r][c]) {
                        const gridR = currentPosition.r + r;
                        const gridC = currentPosition.c + c;
                        if (gridR >= 0 && gridR < ROWS && gridC >= 0 && gridC < COLS) {
                            displayGrid[gridR][gridC] = currentPiece.color;
                        }
                    }
                }
            }
        }
        return displayGrid;
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            maxWidth: '460px', margin: '30px auto', padding: '24px',
            backgroundColor: 'var(--panel-bg, rgba(30, 41, 59, 0.45))',
            backdropFilter: 'blur(12px)', border: '1px solid var(--border)',
            borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.5s ease', textAlign: 'center'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                    Tetris Arcade
                </span>
                <div style={{ color: 'var(--text-main)', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    ⏱️ {formatTime(timeElapsed)}
                </div>
                <button onClick={startGame} style={{
                    background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px',
                    padding: '6px 10px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    <RotateCcw size={16} /> {gameOver ? 'Jugar de Nuevo' : 'Reiniciar'}
                </button>
            </div>

            {/* Main Flex Layout */}
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'flex-start', marginBottom: '20px' }}>
                
                {/* Grid Area */}
                <div style={{ position: 'relative' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                        gap: '2px',
                        backgroundColor: 'rgba(15, 23, 42, 0.7)',
                        border: '3px solid rgba(59, 130, 246, 0.4)',
                        borderRadius: '16px',
                        padding: '6px',
                        width: '210px',
                        height: '420px',
                        boxShadow: 'inset 0 4px 15px rgba(0,0,0,0.6), 0 0 20px rgba(59,130,246,0.1)'
                    }}>
                        {getRenderedGrid().map((row, r) => (
                            row.map((cell, c) => (
                                <div
                                    key={`${r}-${c}`}
                                    style={{
                                        backgroundColor: cell || 'transparent',
                                        borderRadius: cell ? '4px' : 'none',
                                        border: cell ? '1px solid rgba(0,0,0,0.2)' : '1px dashed rgba(255,255,255,0.015)',
                                        boxShadow: cell ? `inset 0 2px 4px rgba(255,255,255,0.25), 0 0 8px ${cell}` : 'none'
                                    }}
                                />
                            ))
                        ))}
                    </div>

                    {/* Cover Overlay for Non-playing State */}
                    {!isPlaying && (
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)',
                            borderRadius: '16px', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', gap: '15px', zIndex: 10
                        }}>
                            <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.2rem' }}>
                                {gameOver ? '¡Fin de la Partida!' : 'Listo para jugar'}
                            </h3>
                            <button
                                onClick={startGame}
                                style={{
                                    padding: '10px 20px', borderRadius: '10px', border: 'none',
                                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                    color: 'white', fontWeight: 'bold', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 15px rgba(59,130,246,0.3)'
                                }}
                            >
                                <Play size={18} fill="white" />
                                <span>{gameOver ? 'Reintentar' : 'Comenzar'}</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Sidebar Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '120px' }}>
                    {/* Next Piece Container */}
                    <div style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.5)',
                        border: '1px solid var(--border)',
                        borderRadius: '14px',
                        padding: '12px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '8px' }}>
                            Siguiente
                        </div>
                        <div style={{
                            width: '80px', height: '80px', margin: '0 auto',
                            display: 'grid', gridTemplateRows: 'repeat(4, 1fr)', gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '2px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '6px'
                        }}>
                            {nextPiece ? (
                                (() => {
                                    // Pad/center the shape inside a 4x4 matrix
                                    const nextShape = nextPiece.shape;
                                    const shapeRows = nextShape.length;
                                    const shapeCols = nextShape[0].length;
                                    const padRow = Math.floor((4 - shapeRows) / 2);
                                    const padCol = Math.floor((4 - shapeCols) / 2);

                                    return Array(4).fill(null).map((_, r) => (
                                        Array(4).fill(null).map((_, c) => {
                                            const shapeR = r - padRow;
                                            const shapeC = c - padCol;
                                            const isFilled = shapeR >= 0 && shapeR < shapeRows && shapeC >= 0 && shapeC < shapeCols && nextShape[shapeR][shapeC];
                                            return (
                                                <div
                                                    key={`${r}-${c}`}
                                                    style={{
                                                        backgroundColor: isFilled ? nextPiece.color : 'transparent',
                                                        borderRadius: isFilled ? '2px' : 'none',
                                                        boxShadow: isFilled ? `0 0 6px ${nextPiece.color}` : 'none'
                                                    }}
                                                />
                                            );
                                        })
                                    ));
                                })()
                            ) : (
                                Array(16).fill(null).map((_, idx) => (
                                    <div key={idx} style={{ backgroundColor: 'transparent' }} />
                                ))
                            )}
                        </div>
                    </div>

                    {/* HUD Stats */}
                    <div style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.4)',
                        border: '1px solid var(--border)',
                        borderRadius: '14px',
                        padding: '12px',
                        fontSize: '0.8rem',
                        textAlign: 'left'
                    }}>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Puntos</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)', fontFamily: 'monospace', marginBottom: '10px' }}>{score}</div>
                        
                        <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Líneas</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)', fontFamily: 'monospace' }}>{linesCleared}</div>
                    </div>
                </div>
            </div>

            {/* Mobile On-screen controls */}
            {isPlaying && (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    marginTop: '15px', maxWidth: '240px', margin: '15px auto 0 auto'
                }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            onClick={rotatePiece}
                            style={{ width: '44px', height: '44px', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', alignItems: 'center', justify: 'center', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', color: 'var(--text-main)' }}
                            title="Rotar"
                        >
                            <RotateCw size={20} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button 
                            onClick={() => moveSide(-1)}
                            style={{ width: '44px', height: '44px', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', alignItems: 'center', justify: 'center', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', color: 'var(--text-main)' }}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button 
                            onClick={moveDown}
                            style={{ width: '44px', height: '44px', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', alignItems: 'center', justify: 'center', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', color: 'var(--text-main)' }}
                        >
                            <ChevronDown size={20} />
                        </button>
                        <button 
                            onClick={() => moveSide(1)}
                            style={{ width: '44px', height: '44px', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', alignItems: 'center', justify: 'center', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', color: 'var(--text-main)' }}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Usa WASD o Flechas del teclado para mover y rotar las piezas. Completa líneas para puntuar.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="Fin de Partida"
                message={`Has conseguido una puntuación de ${score} puntos.`}
                timeElapsed={timeElapsed}
                onPlayAgain={startGame}
            />
        </div>
    );
};

export default TetrisPage;
