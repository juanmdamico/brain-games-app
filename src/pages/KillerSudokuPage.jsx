import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const ROWS = 6;
const COLS = 6;

// 6x6 Solution
const SOLUTION = [
    [1, 2, 3, 4, 5, 6],
    [4, 5, 6, 1, 2, 3],
    [2, 3, 4, 5, 6, 1],
    [5, 6, 1, 2, 3, 4],
    [3, 4, 5, 6, 1, 2],
    [6, 1, 2, 3, 4, 5]
];

// Cage configuration mapping cell coordinate [r, c] -> cage index
const CAGE_MAP = [
    [0, 1, 1, 2, 2, 3],
    [0, 4, 4, 5, 5, 3],
    [6, 6, 7, 8, 8, 9],
    [10, 10, 7, 11, 11, 9],
    [12, 12, 13, 13, 14, 14],
    [15, 15, 16, 16, 17, 17]
];

const CAGES = [
    { id: 0, sum: 5, color: '#f43f5e', cells: [[0,0], [1,0]] },
    { id: 1, sum: 5, color: '#3b82f6', cells: [[0,1], [0,2]] },
    { id: 2, sum: 9, color: '#10b981', cells: [[0,3], [0,4]] },
    { id: 3, sum: 9, color: '#fbbf24', cells: [[0,5], [1,5]] },
    { id: 4, sum: 11, color: '#a855f7', cells: [[1,1], [1,2]] },
    { id: 5, sum: 3, color: '#ec4899', cells: [[1,3], [1,4]] },
    { id: 6, sum: 5, color: '#fbbf24', cells: [[2,0], [2,1]] },
    { id: 7, sum: 5, color: '#f43f5e', cells: [[2,2], [3,2]] },
    { id: 8, sum: 11, color: '#3b82f6', cells: [[2,3], [2,4]] },
    { id: 9, sum: 5, color: '#10b981', cells: [[2,5], [3,5]] },
    { id: 10, sum: 11, color: '#a855f7', cells: [[3,0], [3,1]] },
    { id: 11, sum: 5, color: '#ec4899', cells: [[3,3], [3,4]] },
    { id: 12, sum: 7, color: '#3b82f6', cells: [[4,0], [4,1]] },
    { id: 13, sum: 11, color: '#10b981', cells: [[4,2], [4,3]] },
    { id: 14, sum: 3, color: '#fbbf24', cells: [[4,4], [4,5]] },
    { id: 15, sum: 7, color: '#f43f5e', cells: [[5,0], [5,1]] },
    { id: 16, sum: 5, color: '#a855f7', cells: [[5,2], [5,3]] },
    { id: 17, sum: 9, color: '#ec4899', cells: [[5,4], [5,5]] }
];

const KillerSudokuPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [board, setBoard] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(0)));
    const [selectedCell, setSelectedCell] = useState(null); // { r, c }
    const [winner, setWinner] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [timeElapsed, setTimeElapsed] = useState(0);

    useEffect(() => {
        if (winner) return;
        const timer = setInterval(() => {
            setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime, winner]);

    const resetGame = () => {
        playClick();
        setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(0)));
        setSelectedCell(null);
        setWinner(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const handleCellClick = (r, c) => {
        if (winner) return;
        playClick();
        setSelectedCell({ r, c });
    };

    const handleNumberInput = (num) => {
        if (winner || !selectedCell) return;
        const { r, c } = selectedCell;

        playClick();
        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = num;
        setBoard(newBoard);

        // Check if correct
        if (checkSolution(newBoard)) {
            setWinner(true);
            playVictorySfx();
            registerGameCompletion('killersudoku', 'medium', timeElapsed);
            setShowVictory(true);
        }
    };

    const handleKeyDown = (e) => {
        if (winner || !selectedCell) return;
        const num = parseInt(e.key);
        if (num >= 1 && num <= 6) {
            handleNumberInput(num);
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            handleNumberInput(0);
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedCell, board, winner]);

    const checkSolution = (currentBoard) => {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (currentBoard[r][c] !== SOLUTION[r][c]) {
                    return false;
                }
            }
        }
        return true;
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Helper to check if cell is top-left in its cage
    const isCageHeader = (r, c) => {
        const cageId = CAGE_MAP[r][c];
        const cage = CAGES.find(cg => cg.id === cageId);
        if (!cage) return false;
        const [firstR, firstC] = cage.cells[0];
        return firstR === r && firstC === c;
    };

    const getCageSum = (r, c) => {
        const cageId = CAGE_MAP[r][c];
        const cage = CAGES.find(cg => cg.id === cageId);
        return cage ? cage.sum : '';
    };

    const getCageColor = (r, c) => {
        const cageId = CAGE_MAP[r][c];
        const cage = CAGES.find(cg => cg.id === cageId);
        return cage ? cage.color : 'transparent';
    };

    return (
        <div style={{
            maxWidth: '520px', margin: '30px auto', padding: '24px',
            backgroundColor: 'var(--panel-bg, rgba(30, 41, 59, 0.45))',
            backdropFilter: 'blur(12px)', border: '1px solid var(--border)',
            borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.5s ease', textAlign: 'center'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                    Killer Sudoku (6x6)
                </span>
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

            {/* Grid Container */}
            <div style={{
                display: 'inline-block',
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '2px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '12px' }}>
                    {board.map((row, r) => (
                        row.map((cell, c) => {
                            const isSelected = selectedCell && selectedCell.r === r && selectedCell.c === c;
                            const isHeader = isCageHeader(r, c);
                            const cageColor = getCageColor(r, c);
                            
                            // Check grid regions 2x3 thick borders
                            const borderBottom = (r === 1 || r === 3) ? '2px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.05)';
                            const borderRight = (c === 2) ? '2px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.05)';

                            return (
                                <button
                                    key={`${r}-${c}`}
                                    onClick={() => handleCellClick(r, c)}
                                    style={{
                                        width: '56px', height: '56px',
                                        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                        borderTop: '1px solid rgba(255,255,255,0.05)',
                                        borderLeft: '1px solid rgba(255,255,255,0.05)',
                                        borderBottom, borderRight,
                                        outline: isSelected ? `2px solid ${cageColor}` : `1px dashed ${cageColor}80`,
                                        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.4rem', fontWeight: 'bold', color: 'white', cursor: winner ? 'default' : 'pointer',
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    {/* Cage Label */}
                                    {isHeader && (
                                        <span style={{
                                            position: 'absolute', top: '2px', left: '4px',
                                            fontSize: '0.65rem', color: cageColor, fontWeight: 'bold',
                                            textShadow: `0 0 5px ${cageColor}40`
                                        }}>
                                            {getCageSum(r, c)}
                                        </span>
                                    )}

                                    {cell !== 0 ? cell : ''}
                                </button>
                            );
                        })
                    ))}
                </div>
            </div>

            {/* Mobile Keyboard input */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '10px' }}>
                {[1, 2, 3, 4, 5, 6].map(num => (
                    <button
                        key={num}
                        onClick={() => handleNumberInput(num)}
                        style={{
                            width: '44px', height: '44px', borderRadius: '10px',
                            border: '1px solid var(--border)', backgroundColor: 'rgba(255,255,255,0.03)',
                            color: 'white', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer'
                        }}
                    >
                        {num}
                    </button>
                ))}
                <button
                    onClick={() => handleNumberInput(0)}
                    style={{
                        padding: '0 12px', height: '44px', borderRadius: '10px',
                        border: '1px solid var(--border)', backgroundColor: 'rgba(239,68,68,0.15)',
                        color: '#f87171', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer'
                    }}
                >
                    Borrar
                </button>
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Completa la cuadrícula de 6x6 respetando las filas, columnas y regiones (1-6 sin repetir). Además, las celdas en jaulas punteadas deben sumar el número indicado en su esquina.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Killer Sudoku Resuelto!"
                message="Has completado la grilla respetando todas las jaulas de suma y unicidad."
                timeElapsed={timeElapsed}
                onPlayAgain={resetGame}
            />
        </div>
    );
};

export default KillerSudokuPage;
