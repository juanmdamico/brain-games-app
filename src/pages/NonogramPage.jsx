import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import GameControls from '../components/common/GameControls';
import Timer from '../components/common/Timer';
import InstructionsModal from '../components/common/InstructionsModal';
import VictoryModal from '../components/common/VictoryModal';
import { generateNonogram, checkNonogramWin } from '../components/Nonogram/nonogramLogic';

const NonogramPage = () => {
    const [difficulty, setDifficulty] = useState('5');
    const [board, setBoard] = useState([]);
    const [solution, setSolution] = useState(null);
    const [rowClues, setRowClues] = useState([]);
    const [colClues, setColClues] = useState([]);
    const [isWin, setIsWin] = useState(false);
    
    const [isDragging, setIsDragging] = useState(false);
    const [dragMode, setDragMode] = useState(null);

    // UX Polish State
    const [timerRunning, setTimerRunning] = useState(false);
    const [time, setTime] = useState(0);
    const [showInstructions, setShowInstructions] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [resetTrigger, setResetTrigger] = useState(0);

    const startNewGame = useCallback(() => {
        const size = parseInt(difficulty);
        const { solution: newSol, rowClues: newRowC, colClues: newColC } = generateNonogram(size);
        setSolution(newSol);
        setRowClues(newRowC);
        setColClues(newColC);
        setBoard(Array(size).fill().map(() => Array(size).fill(0)));
        setIsWin(false);
        setTimerRunning(true);
        setResetTrigger(prev => prev + 1);
        setShowVictory(false);
    }, [difficulty]);

    useEffect(() => {
        startNewGame();
    }, [startNewGame]);

    const handleCheck = () => {
        if (checkNonogramWin(board, solution)) {
            setIsWin(true);
            setTimerRunning(false);
            setShowVictory(true);
        }
    };

    const handleSolve = () => {
        const solved = solution.map(row => row.map(val => val ? 1 : 2));
        setBoard(solved);
        setIsWin(true);
        setTimerRunning(false);
        setShowVictory(true);
    };

    const applyMove = (r, c, mode) => {
        if (isWin) return;
        setBoard(prev => {
            let next = [...prev];
            next[r] = [...next[r]];
            next[r][c] = mode;
            return next;
        });
    };

    const handleMouseDown = (e, r, c) => {
        if (isWin) return;
        e.preventDefault();
        setIsDragging(true);
        
        let targetState = 1;
        if (e.button === 2) {
            targetState = 2;
        } else if (board[r][c] === 1 && e.button === 0) {
            targetState = 0;
        } else if (board[r][c] === 2 && e.button === 2) {
            targetState = 0;
        }
        
        setDragMode(targetState);
        applyMove(r, c, targetState);
    };

    const handleMouseEnter = (r, c) => {
        if (isDragging && dragMode !== null) {
            applyMove(r, c, dragMode);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDragMode(null);
        if (!isWin && solution) {
            handleCheck(); // This works, though it might be slightly delayed state-wise. We'll trust the board state is fresh enough or user clicks again.
            // Actually, we can just rely on manual checking or rely on the state being updated after render.
        }
    };

    useEffect(() => {
        handleCheck();
    }, [board, solution]);

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, [isWin, solution]);

    if (!solution) return null;

    const size = parseInt(difficulty);
    const maxRowClues = Math.max(...rowClues.map(c => c.length));
    const maxColClues = Math.max(...colClues.map(c => c.length));

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', overflowX: 'auto', userSelect: 'none' }}>
            <div className="background-effects">
                <div className="glow-orb orb-1"></div>
                <div className="glow-orb orb-2"></div>
                <div className="glow-orb orb-3"></div>
            </div>

            <div style={{ width: '100%', maxWidth: '800px', marginBottom: '20px', zIndex: 10 }}>
                <Link to="/" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: 'var(--surface-color)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border)', backdropFilter: 'blur(10px)' }}>
                    &larr; Volver al Hub
                </Link>
            </div>

            <div className="container" style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', maxWidth: '100%', width: 'fit-content' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <Timer isRunning={timerRunning} onTimeUpdate={setTime} resetTrigger={resetTrigger} />
                    <h1 style={{ fontWeight: 600, fontSize: '2.2rem', margin: '0 20px', background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Nonogramas
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

                {/* The Win message is now handled by VictoryModal */}

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px', overflowX: 'auto', padding: '10px' }} onContextMenu={e => e.preventDefault()}>
                    <table style={{ borderCollapse: 'collapse', backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
                        <tbody>
                            {/* Column Clues */}
                            {Array(maxColClues).fill(0).map((_, rowIndex) => (
                                <tr key={`col-clue-row-${rowIndex}`}>
                                    <td colSpan={maxRowClues} style={{ border: 'none' }}></td>
                                    {colClues.map((clueArr, colIndex) => {
                                        const padding = maxColClues - clueArr.length;
                                        const clue = rowIndex >= padding ? clueArr[rowIndex - padding] : '';
                                        return (
                                            <td key={`col-clue-${rowIndex}-${colIndex}`} style={{
                                                width: '32px', height: '24px', textAlign: 'center', verticalAlign: 'bottom',
                                                fontSize: '0.9rem', color: 'var(--text-main)', borderLeft: colIndex % 5 === 0 && colIndex !== 0 ? 'var(--border-thick)' : '1px solid transparent',
                                                paddingBottom: rowIndex === maxColClues - 1 ? '8px' : '0'
                                            }}>
                                                {clue}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}

                            {/* Board and Row Clues */}
                            {board.map((row, r) => (
                                <tr key={`board-row-${r}`}>
                                    {/* Row Clues */}
                                    {Array(maxRowClues).fill(0).map((_, colIndex) => {
                                        const padding = maxRowClues - rowClues[r].length;
                                        const clue = colIndex >= padding ? rowClues[r][colIndex - padding] : '';
                                        return (
                                            <td key={`row-clue-${r}-${colIndex}`} style={{
                                                width: '24px', height: '32px', textAlign: 'right', paddingRight: colIndex === maxRowClues - 1 ? '8px' : '4px',
                                                fontSize: '0.9rem', color: 'var(--text-main)', borderBottom: r % 5 === 0 && r !== 0 ? 'var(--border-thick)' : '1px solid transparent',
                                                verticalAlign: 'middle'
                                            }}>
                                                {clue}
                                            </td>
                                        )
                                    })}
                                    
                                    {/* Board Cells */}
                                    {row.map((val, c) => (
                                        <td 
                                            key={`cell-${r}-${c}`}
                                            onMouseDown={(e) => handleMouseDown(e, r, c)}
                                            onMouseEnter={() => handleMouseEnter(r, c)}
                                            style={{
                                                width: '32px', height: '32px', minWidth: '32px',
                                                backgroundColor: val === 1 ? '#3b82f6' : 'var(--cell-bg)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderLeft: c % 5 === 0 ? 'var(--border-thick)' : '1px solid rgba(255,255,255,0.1)',
                                                borderTop: r % 5 === 0 ? 'var(--border-thick)' : '1px solid rgba(255,255,255,0.1)',
                                                borderRight: c === size - 1 ? 'var(--border-thick)' : '1px solid rgba(255,255,255,0.1)',
                                                borderBottom: r === size - 1 ? 'var(--border-thick)' : '1px solid rgba(255,255,255,0.1)',
                                                cursor: 'pointer', textAlign: 'center', lineHeight: '32px', color: 'var(--text-muted)'
                                            }}
                                        >
                                            {val === 2 && '✖'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <GameControls 
                    difficultyOptions={[
                        {value: '5', label: '5x5'},
                        {value: '10', label: '10x10'},
                        {value: '15', label: '15x15'}
                    ]}
                    currentDifficulty={difficulty}
                    onDifficultyChange={setDifficulty}
                    onNewGame={startNewGame}
                    actions={[
                        {label: 'Resolver', onClick: handleSolve, variant: 'secondary'}
                    ]}
                />
            </div>
            
            <InstructionsModal 
                isOpen={showInstructions}
                onClose={() => setShowInstructions(false)}
                title="Nonogramas"
                instructions={[
                    "Las pistas alrededor de la cuadrícula indican bloques de casillas contiguas que deben ser pintadas de color.",
                    "Cada número representa un bloque. Si hay múltiples números, debe haber al menos una casilla vacía entre esos bloques.",
                    "Haz clic izquierdo para pintar una casilla.",
                    "Haz clic derecho para marcar con una 'X' las casillas que sabes que están vacías.",
                    "Puedes mantener presionado el clic y arrastrar para rellenar rápidamente."
                ]}
            />
            
            <VictoryModal 
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                time={time}
                gameName="Nonogramas"
            />
        </div>
    );
};

export default NonogramPage;
