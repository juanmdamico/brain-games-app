import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const SIZE = 4;

const LEVELS = [
    // Level 1: Easy
    {
        initial: [
            [2, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        solution: [
            [2, 1, 4, 3],
            [3, 4, 2, 1],
            [1, 3, 2, 4], // Wait, let's verify rows/columns uniqueness:
            // Let's make sure the solution is fully mathematically sound:
            // Row 0: 2, 1, 4, 3
            // Row 1: 3, 2, 1, 4
            // Row 2: 4, 3, 2, 1 -- wait, col 2 has [4, 1, 2] so far
            // Let's write a guaranteed unique solution set:
            [2, 1, 4, 3],
            [4, 3, 1, 2],
            [3, 2, 0, 0], // we will define the exact solution:
        ],
        // Better: let's define a clean mathematical solution and backport the signs and initial grid from it:
        // Solved Grid:
        // 2 1 4 3
        // 4 3 2 1
        // 1 2 3 4
        // 3 4 1 2
        //
        // Let's verify:
        // Rows:
        // R0: 2, 1, 4, 3 (OK)
        // R1: 4, 3, 2, 1 (OK)
        // R2: 1, 2, 3, 4 (OK)
        // R3: 3, 4, 1, 2 (OK)
        // Cols:
        // C0: 2, 4, 1, 3 (OK)
        // C1: 1, 3, 2, 4 (OK)
        // C2: 4, 2, 3, 1 (OK)
        // C3: 3, 1, 4, 2 (OK)
        grid: [
            [2, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 2, 0, 0],
            [0, 0, 1, 0]
        ],
        solutionGrid: [
            [2, 1, 4, 3],
            [4, 3, 2, 1],
            [1, 2, 3, 4],
            [3, 4, 1, 2]
        ],
        // Signs definitions
        // hSigns[r][c] is relation between cell(r,c) and cell(r,c+1): '>', '<', or ''
        hSigns: [
            ['>', '', ''],
            ['', '>', ''],
            ['<', '', ''],
            ['', '', '<']
        ],
        // vSigns[r][c] is relation between cell(r,c) and cell(r+1,c): 'v' (greater), '^' (less), or ''
        vSigns: [
            ['^', '', 'v', ''],
            ['', 'v', '', '^'],
            ['v', '', '', '']
        ]
    },
    // Level 2: Medium
    {
        // Solved Grid:
        // 4 3 1 2
        // 1 2 4 3
        // 2 4 3 1
        // 3 1 2 4
        grid: [
            [0, 0, 0, 2],
            [0, 0, 4, 0],
            [0, 0, 0, 0],
            [3, 0, 0, 0]
        ],
        solutionGrid: [
            [4, 3, 1, 2],
            [1, 2, 4, 3],
            [2, 4, 3, 1],
            [3, 1, 2, 4]
        ],
        hSigns: [
            ['', '>', ''],
            ['<', '', ''],
            ['', '>', ''],
            ['', '', '<']
        ],
        vSigns: [
            ['v', '', '', '^'],
            ['', 'v', 'v', ''],
            ['', '', '', '']
        ]
    }
];

const FutoshikiPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [levelIndex, setLevelIndex] = useState(0);
    const [board, setBoard] = useState([]);
    const [selectedCell, setSelectedCell] = useState(null); // { r, c }
    const [winner, setWinner] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [timeElapsed, setTimeElapsed] = useState(0);

    useEffect(() => {
        loadLevel(levelIndex);
    }, [levelIndex]);

    useEffect(() => {
        if (winner) return;
        const timer = setInterval(() => {
            setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime, winner]);

    const loadLevel = (idx) => {
        const lvl = LEVELS[idx];
        setBoard(lvl.grid.map(row => [...row]));
        setSelectedCell(null);
        setWinner(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const handleCellClick = (r, c) => {
        if (winner || LEVELS[levelIndex].grid[r][c] !== 0) return;
        playClick();
        setSelectedCell({ r, c });
    };

    const handleNumberInput = (num) => {
        if (winner || !selectedCell) return;
        
        const { r, c } = selectedCell;
        
        // Cannot edit locked cells
        if (LEVELS[levelIndex].grid[r][c] !== 0) return;

        playClick();
        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = num;
        setBoard(newBoard);

        // Check if correct
        if (checkSolution(newBoard)) {
            setWinner(true);
            playVictorySfx();
            registerGameCompletion('futoshiki', 'medium', timeElapsed);
            setShowVictory(true);
        }
    };

    const handleKeyDown = (e) => {
        if (winner || !selectedCell) return;
        const num = parseInt(e.key);
        if (num >= 1 && num <= SIZE) {
            handleNumberInput(num);
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            handleNumberInput(0);
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedCell, board, winner, levelIndex]);

    const checkSolution = (currentBoard) => {
        const lvl = LEVELS[levelIndex];
        
        // 1. Check matching values
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (currentBoard[r][c] !== lvl.solutionGrid[r][c]) {
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

    return (
        <div style={{
            maxWidth: '500px', margin: '30px auto', padding: '24px',
            backgroundColor: 'var(--panel-bg, rgba(30, 41, 59, 0.45))',
            backdropFilter: 'blur(12px)', border: '1px solid var(--border)',
            borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.5s ease', textAlign: 'center'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {LEVELS.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => { playClick(); setLevelIndex(idx); }}
                            style={{
                                padding: '6px 12px', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '8px',
                                border: '1px solid var(--border)', cursor: 'pointer',
                                backgroundColor: levelIndex === idx ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                                color: levelIndex === idx ? 'white' : 'var(--text-muted)'
                            }}
                        >
                            Nivel {idx + 1}
                        </button>
                    ))}
                </div>
                <div style={{ color: 'var(--text-main)', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    ⏱️ {formatTime(timeElapsed)}
                </div>
                <button onClick={() => loadLevel(levelIndex)} style={{
                    background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px',
                    padding: '6px 10px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    <RotateCcw size={16} /> Reiniciar
                </button>
            </div>

            {/* Futoshiki Board */}
            <div style={{
                position: 'relative',
                display: 'inline-block',
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', alignItems: 'center', justifyItems: 'center' }}>
                    {Array(7).fill(null).map((_, rIdx) => {
                        const isEvenRow = rIdx % 2 === 0;
                        const cellRow = Math.floor(rIdx / 2);

                        return Array(7).fill(null).map((_, cIdx) => {
                            const isEvenCol = cIdx % 2 === 0;
                            const cellCol = Math.floor(cIdx / 2);

                            // 1. Grid Cell (Even row, even col)
                            if (isEvenRow && isEvenCol) {
                                const val = board[cellRow]?.[cellCol];
                                const isLocked = LEVELS[levelIndex].grid[cellRow]?.[cellCol] !== 0;
                                const isSelected = selectedCell && selectedCell.r === cellRow && selectedCell.c === cellCol;

                                return (
                                    <button
                                        key={`${rIdx}-${cIdx}`}
                                        onClick={() => handleCellClick(cellRow, cellCol)}
                                        style={{
                                            width: '46px', height: '46px',
                                            borderRadius: '12px',
                                            border: isSelected 
                                                ? '2px solid var(--primary)' 
                                                : isLocked 
                                                    ? '1.5px solid rgba(255,255,255,0.1)' 
                                                    : '1px solid var(--border)',
                                            backgroundColor: isSelected 
                                                ? 'rgba(59, 130, 246, 0.2)' 
                                                : isLocked 
                                                    ? 'rgba(255,255,255,0.03)' 
                                                    : 'transparent',
                                            color: isLocked ? 'var(--text-muted)' : 'var(--text-main)',
                                            fontSize: '1.3rem',
                                            fontWeight: 'bold',
                                            cursor: isLocked ? 'default' : 'pointer',
                                            transition: 'all 0.15s',
                                            boxShadow: isSelected ? '0 0 12px rgba(59, 130, 246, 0.4)' : 'none'
                                        }}
                                    >
                                        {val !== 0 ? val : ''}
                                    </button>
                                );
                            }

                            // 2. Horizontal Relations (Even row, odd col)
                            if (isEvenRow && !isEvenCol) {
                                const sign = LEVELS[levelIndex].hSigns[cellRow]?.[cellCol];
                                return (
                                    <div 
                                        key={`${rIdx}-${cIdx}`} 
                                        style={{ 
                                            fontSize: '1rem', 
                                            fontWeight: 'bold', 
                                            color: sign ? 'var(--primary)' : 'transparent',
                                            textShadow: sign ? '0 0 8px rgba(59,130,246,0.6)' : 'none'
                                        }}
                                    >
                                        {sign || ''}
                                    </div>
                                );
                            }

                            // 3. Vertical Relations (Odd row, even col)
                            if (!isEvenRow && isEvenCol) {
                                const sign = LEVELS[levelIndex].vSigns[cellRow]?.[cellCol];
                                let renderSign = '';
                                if (sign === 'v') renderSign = '∨';
                                if (sign === '^') renderSign = '∧';

                                return (
                                    <div 
                                        key={`${rIdx}-${cIdx}`} 
                                        style={{ 
                                            fontSize: '0.9rem', 
                                            fontWeight: 'bold', 
                                            color: sign ? 'var(--secondary)' : 'transparent',
                                            textShadow: sign ? '0 0 8px rgba(167,139,250,0.6)' : 'none'
                                        }}
                                    >
                                        {renderSign}
                                    </div>
                                );
                            }

                            // 4. Dead corners (Odd row, odd col)
                            return <div key={`${rIdx}-${cIdx}`} style={{ width: '12px', height: '12px' }} />;
                        });
                    })}
                </div>
            </div>

            {/* Mobile / Screen Number input keyboard */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
                {[1, 2, 3, 4].map(num => (
                    <button
                        key={num}
                        onClick={() => handleNumberInput(num)}
                        style={{
                            width: '46px', height: '46px',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            color: 'white',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                        }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                    >
                        {num}
                    </button>
                ))}
                <button
                    onClick={() => handleNumberInput(0)}
                    style={{
                        padding: '0 14px',
                        height: '46px',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        color: '#f87171',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                    }}
                >
                    Borrar
                </button>
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Completa la cuadrícula de 4x4 de forma que cada fila y columna contenga los números del 1 al 4 sin repetirse, respetando las relaciones mayor que (`&gt;` o `∨`) y menor que (`&lt;` o `∧`).</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Desafío Futoshiki Resuelto!"
                message="Has acomodado todos los números correctamente respetando los enredos lógicos."
                timeElapsed={timeElapsed}
                onPlayAgain={() => loadLevel(levelIndex)}
            />
        </div>
    );
};

export default FutoshikiPage;
