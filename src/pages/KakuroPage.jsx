import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import GameControls from '../components/common/GameControls';
import Timer from '../components/common/Timer';
import InstructionsModal from '../components/common/InstructionsModal';
import VictoryModal from '../components/common/VictoryModal';
import { generateKakuro, checkKakuroWin } from '../components/Kakuro/kakuroLogic';

const KakuroPage = () => {
    const [difficulty, setDifficulty] = useState('5');
    const [board, setBoard] = useState([]);
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
        const { grid, solution: sol } = generateKakuro(size);
        setBoard(grid);
        setSolution(sol);
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
        if (board[r][c].type === 'white') {
            setSelectedCell({r, c});
            setErrors([]);
            setMessage(null);
        }
    };

    const handleNumberInput = (num) => {
        if (!selectedCell) return;
        const {r, c} = selectedCell;
        if (board[r][c].type !== 'white') return;

        let newBoard = [...board];
        newBoard[r] = [...newBoard[r]];
        newBoard[r][c] = { ...newBoard[r][c], value: num };
        setBoard(newBoard);
        setErrors([]);
        setMessage(null);
    };

    const handleCheck = () => {
        const status = checkKakuroWin(board);
        setErrors(status.errors);

        if (status.win) {
            setMessage({ type: 'success', text: "¡Felicidades! Has resuelto el Kakuro." });
            setTimerRunning(false);
            setShowVictory(true);
        } else if (status.incomplete) {
            setMessage({ type: 'error-msg', text: "Aún faltan números por llenar." });
        } else {
            setMessage({ type: 'error-msg', text: "Hay errores en las sumas o números duplicados." });
        }
    };

    const handleSolve = () => {
        let newBoard = board.map((row, r) => row.map((cell, c) => {
            if (cell.type === 'white') {
                return { ...cell, value: solution[r][c] };
            }
            return cell;
        }));
        setBoard(newBoard);
        setErrors([]);
        setMessage({ type: 'success', text: "Kakuro resuelto automáticamente." });
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
                
                if (board[r] && board[r][c] && board[r][c].type === 'white') {
                    setSelectedCell({ r, c });
                }
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedCell, board, difficulty]);

    if (!solution) return null;
    const size = parseInt(difficulty);

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
                        Kakuro
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
                        backgroundColor: '#1e293b', border: '2px solid #0f172a'
                    }}>
                        {board.map((row, r) => (
                            row.map((cell, c) => {
                                const isSelected = selectedCell && selectedCell.r === r && selectedCell.c === c;
                                const isError = errors.includes(`${r}-${c}`);
                                
                                if (cell.type === 'black') {
                                    return (
                                        <div key={`${r}-${c}`} style={{
                                            width: '44px', height: '44px', backgroundColor: '#0f172a',
                                            position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            {(cell.right > 0 || cell.down > 0) && (
                                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                                                    background: 'linear-gradient(to bottom right, transparent 48%, rgba(255,255,255,0.2) 49%, rgba(255,255,255,0.2) 51%, transparent 52%)' 
                                                }} />
                                            )}
                                            {cell.right > 0 && <span style={{ position: 'absolute', top: '2px', right: '4px', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>{cell.right}</span>}
                                            {cell.down > 0 && <span style={{ position: 'absolute', bottom: '2px', left: '4px', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>{cell.down}</span>}
                                        </div>
                                    )
                                } else {
                                    return (
                                        <div 
                                            key={`${r}-${c}`}
                                            onClick={() => handleCellClick(r, c)}
                                            style={{
                                                width: '44px', height: '44px', 
                                                backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.3)' : (isError ? 'rgba(225, 29, 72, 0.4)' : 'var(--cell-bg)'),
                                                border: '1px solid var(--border)',
                                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                                fontSize: '1.4rem', fontWeight: 500, cursor: 'pointer',
                                                color: isError ? '#f87171' : 'white',
                                                transition: 'background-color 0.15s'
                                            }}
                                        >
                                            {cell.value > 0 ? cell.value : ''}
                                        </div>
                                    )
                                }
                            })
                        ))}
                    </div>
                </div>

                <GameControls 
                    difficultyOptions={[
                        {value: '5', label: '5x5'},
                        {value: '8', label: '8x8'},
                        {value: '10', label: '10x10'}
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
                title="Kakuro"
                instructions={[
                    "El objetivo es rellenar las casillas blancas con números del 1 al 9.",
                    "La suma de los números en cada bloque continuo debe ser igual al número en la casilla negra adyacente (a la izquierda o arriba).",
                    "Ningún número puede repetirse dentro de un mismo bloque continuo (fila o columna parcial)."
                ]}
            />
            
            <VictoryModal 
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                time={time}
                gameName="Kakuro"
            />
        </div>
    );
};

export default KakuroPage;
