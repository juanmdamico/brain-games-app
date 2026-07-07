import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const SIZE = 6;

// Preset Blocks definitions
const SHAPES = [
    { name: '1x1', shape: [[1]], color: '#fbbf24' },
    { name: '2x1', shape: [[1, 1]], color: '#3b82f6' },
    { name: '3x1', shape: [[1, 1, 1]], color: '#10b981' },
    { name: '1x2', shape: [[1], [1]], color: '#a855f7' },
    { name: '1x3', shape: [[1], [1], [1]], color: '#ec4899' },
    { name: '2x2', shape: [[1, 1], [1, 1]], color: '#f43f5e' }
];

const BlockPuzzlePage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [grid, setGrid] = useState(Array(SIZE).fill(null).map(() => Array(SIZE).fill(null)));
    const [dockBlocks, setDockBlocks] = useState([]); // 3 blocks currently available to place
    const [selectedBlockIdx, setSelectedBlockIdx] = useState(null);
    const [score, setScore] = useState(0);
    const [winner, setWinner] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [timeElapsed, setTimeElapsed] = useState(0);

    useEffect(() => {
        initGame();
    }, []);

    useEffect(() => {
        if (winner) return;
        const timer = setInterval(() => {
            setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime, winner]);

    const initGame = () => {
        setGrid(Array(SIZE).fill(null).map(() => Array(SIZE).fill(null)));
        generateNewDock();
        setScore(0);
        setSelectedBlockIdx(null);
        setWinner(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const generateNewDock = () => {
        const nextBlocks = [
            SHAPES[Math.floor(Math.random() * SHAPES.length)],
            SHAPES[Math.floor(Math.random() * SHAPES.length)],
            SHAPES[Math.floor(Math.random() * SHAPES.length)]
        ];
        setDockBlocks(nextBlocks);
    };

    const handleDockBlockClick = (idx) => {
        if (winner || !dockBlocks[idx]) return;
        playClick();
        setSelectedBlockIdx(idx);
    };

    const handleGridCellClick = (r, c) => {
        if (winner || selectedBlockIdx === null) return;

        const block = dockBlocks[selectedBlockIdx];
        if (!block) return;

        if (canPlaceBlock(r, c, block.shape)) {
            playSuccessSfx();
            placeBlock(r, c, block);
        } else {
            playErrorSfx();
        }
    };

    const canPlaceBlock = (r, c, shape) => {
        const h = shape.length;
        const w = shape[0].length;

        if (r + h > SIZE || c + w > SIZE) return false;

        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                if (shape[i][j] === 1 && grid[r + i][c + j] !== null) {
                    return false;
                }
            }
        }
        return true;
    };

    const placeBlock = (r, c, block) => {
        const newGrid = grid.map(row => [...row]);
        const h = block.shape.length;
        const w = block.shape[0].length;

        let blockCellsCount = 0;
        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                if (block.shape[i][j] === 1) {
                    newGrid[r + i][c + j] = block.color;
                    blockCellsCount++;
                }
            }
        }

        // Remove from dock
        const nextDock = [...dockBlocks];
        nextDock[selectedBlockIdx] = null;
        setDockBlocks(nextDock);
        setSelectedBlockIdx(null);

        // Check Completed lines (Rows or Columns)
        let clearedLines = 0;
        const rowsToClear = [];
        const colsToClear = [];

        // Check rows
        for (let rowIdx = 0; rowIdx < SIZE; rowIdx++) {
            if (newGrid[rowIdx].every(cell => cell !== null)) {
                rowsToClear.push(rowIdx);
            }
        }

        // Check cols
        for (let colIdx = 0; colIdx < SIZE; colIdx++) {
            let fullCol = true;
            for (let rowIdx = 0; rowIdx < SIZE; rowIdx++) {
                if (newGrid[rowIdx][colIdx] === null) {
                    fullCol = false;
                    break;
                }
            }
            if (fullCol) {
                colsToClear.push(colIdx);
            }
        }

        // Clear cells
        rowsToClear.forEach(rowIdx => {
            for (let cIdx = 0; cIdx < SIZE; cIdx++) {
                newGrid[rowIdx][cIdx] = null;
            }
            clearedLines++;
        });

        colsToClear.forEach(colIdx => {
            for (let rIdx = 0; rIdx < SIZE; rIdx++) {
                newGrid[rIdx][colIdx] = null;
            }
            clearedLines++;
        });

        setGrid(newGrid);

        // Score update
        const points = blockCellsCount + clearedLines * 10;
        const nextScore = score + points;
        setScore(nextScore);

        // Check if dock is empty -> generate new
        if (nextDock.every(b => b === null)) {
            generateNewDock();
        } else {
            // Check if remaining blocks can fit. If not, auto-clear dock or show reset?
            // Actually, we check if any remaining block can fit. If none, generate new or trigger lose?
            // Let's check if there is any valid placement left for the remaining blocks.
            // If not, we will regenerate new ones so the player is never locked out!
            // This is a highly friendly gameplay feature that user loves!
            setTimeout(() => checkDockPlacements(nextDock, newGrid), 200);
        }

        // Win condition: reach 150 points
        if (nextScore >= 150) {
            setWinner(true);
            playVictorySfx();
            registerGameCompletion('blockpuzzle', 'medium', timeElapsed, nextScore);
            setShowVictory(true);
        }
    };

    const checkDockPlacements = (currentDock, currentGrid) => {
        let anyFits = false;
        currentDock.forEach(block => {
            if (!block) return;
            // Check if this block can fit anywhere
            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    if (canPlaceBlockInGrid(r, c, block.shape, currentGrid)) {
                        anyFits = true;
                        break;
                    }
                }
                if (anyFits) break;
            }
        });

        if (!anyFits && currentDock.some(b => b !== null)) {
            // Regenerate dock because player is stuck!
            generateNewDock();
        }
    };

    const canPlaceBlockInGrid = (r, c, shape, currentGrid) => {
        const h = shape.length;
        const w = shape[0].length;
        if (r + h > SIZE || c + w > SIZE) return false;
        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                if (shape[i][j] === 1 && currentGrid[r + i][c + j] !== null) return false;
            }
        }
        return true;
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
                    Bloques (Block Puzzle)
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
                <span>Puntos: <strong style={{ color: 'var(--primary)', fontSize: '1.05rem' }}>{score}</strong> / 150</span>
                <span>{selectedBlockIdx !== null ? '🟢 Coloca el bloque en la grilla' : '👉 Selecciona un bloque abajo'}</span>
            </div>

            {/* Board */}
            <div style={{
                display: 'inline-flex',
                flexDirection: 'column',
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)',
                marginBottom: '20px'
            }}>
                {grid.map((row, r) => (
                    <div key={r} style={{ display: 'flex' }}>
                        {row.map((cell, c) => {
                            return (
                                <button
                                    key={c}
                                    onClick={() => handleGridCellClick(r, c)}
                                    style={{
                                        width: '40px', height: '40px', margin: '2px',
                                        backgroundColor: cell || 'rgba(255, 255, 255, 0.01)',
                                        border: cell ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.02)',
                                        borderRadius: '6px',
                                        cursor: winner ? 'default' : 'pointer',
                                        transition: 'all 0.15s',
                                        boxShadow: cell ? `0 0 10px ${cell}50, inset 0 2px 4px rgba(255,255,255,0.2)` : 'none'
                                    }}
                                    onMouseOver={e => !cell && selectedBlockIdx !== null && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)')}
                                    onMouseOut={e => !cell && (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.01)')}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Blocks dock */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', minHeight: '80px', alignItems: 'center' }}>
                {dockBlocks.map((block, idx) => {
                    if (!block) return <div key={idx} style={{ width: '70px', height: '70px', border: '1.5px dashed rgba(255,255,255,0.05)', borderRadius: '10px' }} />;
                    const isSelected = selectedBlockIdx === idx;

                    return (
                        <button
                            key={idx}
                            onClick={() => handleDockBlockClick(idx)}
                            style={{
                                display: 'flex', flexDirection: 'column', gap: '2px', padding: '10px',
                                backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.02)',
                                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                                borderRadius: '12px', cursor: 'pointer', outline: 'none', transition: 'all 0.15s',
                                boxShadow: isSelected ? '0 0 12px var(--primary)' : 'none'
                            }}
                        >
                            {block.shape.map((row, rIdx) => (
                                <div key={rIdx} style={{ display: 'flex', gap: '2px' }}>
                                    {row.map((cell, cIdx) => (
                                        <div
                                            key={cIdx}
                                            style={{
                                                width: '14px', height: '14px', borderRadius: '3px',
                                                backgroundColor: cell === 1 ? block.color : 'transparent',
                                                border: cell === 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                                            }}
                                        />
                                    ))}
                                </div>
                            ))}
                        </button>
                    );
                })}
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Haz clic en un bloque de la bandeja inferior para seleccionarlo y luego haz clic en una casilla de la cuadrícula de 6x6 para colocar su esquina superior izquierda. Rellena filas o columnas enteras para eliminarlas y ganar puntos. Junta 150 puntos para ganar.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Líneas Completadas!"
                message={`Has superado el objetivo de 150 puntos con un puntaje total de ${score}.`}
                timeElapsed={timeElapsed}
                onPlayAgain={initGame}
            />
        </div>
    );
};

export default BlockPuzzlePage;
