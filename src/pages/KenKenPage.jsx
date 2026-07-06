import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import GameControls from '../components/common/GameControls';
import Timer from '../components/common/Timer';
import InstructionsModal from '../components/common/InstructionsModal';
import VictoryModal from '../components/common/VictoryModal';
import { generateKenKen, checkKenKenWin } from '../components/KenKen/kenkenLogic';

const KenKenPage = () => {
    const [difficulty, setDifficulty] = useState('4');
    const [board, setBoard] = useState([]);
    const [cages, setCages] = useState([]);
    const [cageGrid, setCageGrid] = useState([]);
    const [solution, setSolution] = useState(null);
    const [selectedCell, setSelectedCell] = useState(null);
    const [errors, setErrors] = useState([]);
    const [message, setMessage] = useState(null);

    // UX Polish State
    const [timerRunning, setTimerRunning] = useState(false);
    const [time, setTime] = useState(0);
    const [showInstructions, setShowInstructions] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [resetTrigger, setResetTrigger] = useState(0);

    const startNewGame = useCallback(() => {
        const size = parseInt(difficulty);
        const { solution: sol, cages: cgs, cageGrid: cgGrid } = generateKenKen(size);
        setBoard(Array(size).fill().map(() => Array(size).fill(0)));
        setSolution(sol);
        setCages(cgs);
        setCageGrid(cgGrid);
        setSelectedCell(null);
        setErrors([]);
        setMessage(null);
        setTimerRunning(true);
        setResetTrigger(prev => prev + 1);
        setShowVictory(false);
    }, [difficulty]);

    useEffect(() => {
        startNewGame();
    }, [startNewGame]);

    const handleCellClick = (r, c) => {
        setSelectedCell({r, c});
        setErrors([]);
        setMessage(null);
    };

    const handleNumberInput = (num) => {
        if (!selectedCell) return;
        const {r, c} = selectedCell;

        let newBoard = [...board];
        newBoard[r] = [...newBoard[r]];
        newBoard[r][c] = num;
        setBoard(newBoard);
        setErrors([]);
        setMessage(null);
    };

    const handleCheck = () => {
        const size = parseInt(difficulty);
        const status = checkKenKenWin(board, cages, size);
        setErrors(status.errors);

        if (status.win) {
            setMessage({ type: 'success', text: "¡Felicidades! Has resuelto el KenKen." });
            setTimerRunning(false);
            setShowVictory(true);
        } else if (status.incomplete) {
            setMessage({ type: 'error-msg', text: "Aún faltan números por llenar." });
        } else {
            setMessage({ type: 'error-msg', text: "Hay errores o números duplicados en fila/columna." });
        }
    };

    const handleSolve = () => {
        setBoard(solution);
        setErrors([]);
        setMessage({ type: 'success', text: "KenKen resuelto automáticamente." });
        setTimerRunning(false);
        setShowVictory(true);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedCell) return;
            
            if (e.key >= '1' && e.key <= '9') {
                handleNumberInput(parseInt(e.key));
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                handleNumberInput(0);
            } else if (e.key.startsWith('Arrow')) {
                let { r, c } = selectedCell;
                let size = parseInt(difficulty);
                if (e.key === 'ArrowUp') r = Math.max(0, r - 1);
                if (e.key === 'ArrowDown') r = Math.min(size-1, r + 1);
                if (e.key === 'ArrowLeft') c = Math.max(0, c - 1);
                if (e.key === 'ArrowRight') c = Math.min(size-1, c + 1);
                setSelectedCell({ r, c });
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedCell, board, difficulty]);

    if (!solution) return null;
    const size = parseInt(difficulty);

    const isTopLeftOfCage = (r, c, cageId) => {
        const cage = cages.find(cg => cg.id === cageId);
        let minR = size;
        let minC = size;
        for (let cell of cage.cells) {
            if (cell.r < minR) { minR = cell.r; minC = cell.c; }
            else if (cell.r === minR && cell.c < minC) { minC = cell.c; }
        }
        return r === minR && c === minC;
    };

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', overflowX: 'auto' }}>
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
                        KenKen
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

                {message && (
                    <div className={`message ${message.type}`} style={{
                        textAlign: 'center', padding: '14px', borderRadius: '12px', marginBottom: '20px', fontWeight: 600,
                        backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(225, 29, 72, 0.15)',
                        color: message.type === 'success' ? '#34d399' : '#fb7185',
                        border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(225, 29, 72, 0.3)'}`
                    }}>
                        {message.text}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', overflowX: 'auto', padding: '10px' }}>
                    <div style={{
                        display: 'grid', 
                        gridTemplateColumns: `repeat(${size}, 1fr)`, 
                        gridTemplateRows: `repeat(${size}, 1fr)`,
                        backgroundColor: 'rgba(15,23,42,0.8)', border: '3px solid rgba(255,255,255,0.4)', borderRadius: '4px'
                    }}>
                        {board.map((row, r) => (
                            row.map((val, c) => {
                                const isSelected = selectedCell && selectedCell.r === r && selectedCell.c === c;
                                const isError = errors.includes(`${r}-${c}`);
                                const cageId = cageGrid[r][c];
                                const cage = cages.find(cg => cg.id === cageId);
                                
                                const bt = (r===0 || cageGrid[r-1][c] !== cageId) ? '3px solid rgba(255,255,255,0.4)' : '1px dashed rgba(255,255,255,0.1)';
                                const bb = (r===size-1 || cageGrid[r+1][c] !== cageId) ? '3px solid rgba(255,255,255,0.4)' : '1px dashed rgba(255,255,255,0.1)';
                                const bl = (c===0 || cageGrid[r][c-1] !== cageId) ? '3px solid rgba(255,255,255,0.4)' : '1px dashed rgba(255,255,255,0.1)';
                                const br = (c===size-1 || cageGrid[r][c+1] !== cageId) ? '3px solid rgba(255,255,255,0.4)' : '1px dashed rgba(255,255,255,0.1)';

                                const showLabel = isTopLeftOfCage(r, c, cageId);

                                return (
                                    <div 
                                        key={`${r}-${c}`}
                                        onClick={() => handleCellClick(r, c)}
                                        style={{
                                            width: '55px', height: '55px', boxSizing: 'border-box',
                                            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.3)' : (isError ? 'rgba(225, 29, 72, 0.4)' : 'var(--cell-bg)'),
                                            borderTop: bt, borderBottom: bb, borderLeft: bl, borderRight: br,
                                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                                            fontSize: '1.6rem', fontWeight: 600, cursor: 'pointer', position: 'relative',
                                            color: isError ? '#f87171' : 'white',
                                        }}
                                    >
                                        {showLabel && (
                                            <span style={{ position: 'absolute', top: '2px', left: '4px', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8' }}>
                                                {cage.target}{cage.op}
                                            </span>
                                        )}
                                        {val > 0 ? val : ''}
                                    </div>
                                )
                            })
                        ))}
                    </div>
                </div>

                <GameControls 
                    difficultyOptions={[
                        {value: '4', label: '4x4'},
                        {value: '5', label: '5x5'},
                        {value: '6', label: '6x6'}
                    ]}
                    currentDifficulty={difficulty}
                    onDifficultyChange={setDifficulty}
                    onNewGame={startNewGame}
                    actions={[
                        {label: 'Comprobar', onClick: handleCheck, variant: 'primary'},
                        {label: 'Resolver', onClick: handleSolve, variant: 'secondary'}
                    ]}
                    showNumpad={true}
                    onNumberClick={handleNumberInput}
                />
            </div>
            
            <InstructionsModal 
                isOpen={showInstructions}
                onClose={() => setShowInstructions(false)}
                title="KenKen"
                instructions={[
                    "Rellena la cuadrícula con números del 1 al tamaño de la cuadrícula.",
                    "No puedes repetir el mismo número en una fila o columna.",
                    "La cuadrícula está dividida en 'cajas' (bloques delineados por bordes gruesos).",
                    "En la esquina superior izquierda de cada caja hay un número objetivo y un operador matemático (+, -, *, /).",
                    "Los números dentro de la caja deben producir ese número objetivo utilizando el operador dado."
                ]}
            />
            
            <VictoryModal 
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                time={time}
                gameName="KenKen"
            />
        </div>
    );
};

export default KenKenPage;
