import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import GameControls from '../components/common/GameControls';
import Timer from '../components/common/Timer';
import InstructionsModal from '../components/common/InstructionsModal';
import VictoryModal from '../components/common/VictoryModal';
import { generateHitori, checkHitoriWin } from '../components/Hitori/hitoriLogic';

const HitoriPage = () => {
    const [difficulty, setDifficulty] = useState('5');
    const [puzzle, setPuzzle] = useState([]);
    const [board, setBoard] = useState([]); 
    const [solution, setSolution] = useState(null);
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
        const { puzzle: puz, solution: sol } = generateHitori(size);
        setPuzzle(puz);
        setSolution(sol);
        setBoard(Array(size).fill().map(() => Array(size).fill(0)));
        setErrors([]);
        setMessage(null);
        setTimerRunning(true);
        setResetTrigger(prev => prev + 1);
        setShowVictory(false);
    }, [difficulty]);

    useEffect(() => {
        startNewGame();
    }, [startNewGame]);

    const handleCellClick = (e, r, c) => {
        e.preventDefault();
        
        let newBoard = [...board];
        newBoard[r] = [...newBoard[r]];
        
        if (e.type === 'contextmenu') {
            newBoard[r][c] = newBoard[r][c] === 1 ? 0 : 1;
        } else {
            newBoard[r][c] = newBoard[r][c] === 2 ? 0 : 2;
        }
        
        setBoard(newBoard);
        setErrors([]);
        setMessage(null);
    };

    const handleCheck = () => {
        const status = checkHitoriWin(board, puzzle);
        setErrors(status.errors);

        if (status.win) {
            setMessage({ type: 'success', text: "¡Felicidades! Has resuelto el Hitori." });
            setTimerRunning(false);
            setShowVictory(true);
        } else if (status.disconnected) {
            setMessage({ type: 'error-msg', text: "Las casillas blancas deben estar conectadas entre sí." });
        } else {
            setMessage({ type: 'error-msg', text: "Hay errores: casillas oscuras juntas o números duplicados en línea." });
        }
    };

    const handleSolve = () => {
        setBoard(solution);
        setErrors([]);
        setMessage({ type: 'success', text: "Hitori resuelto automáticamente." });
        setTimerRunning(false);
        setShowVictory(true);
    };

    if (puzzle.length === 0) return null;
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
                        Hitori
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

                <p style={{textAlign: 'center', color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem'}}>
                    Clic Izquierdo: Sombrear / Des-sombrear <br/> Clic Derecho: Marcar como seguro (Círculo)
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', overflowX: 'auto', padding: '10px' }}>
                    <div style={{
                        display: 'grid', 
                        gridTemplateColumns: `repeat(${size}, 1fr)`, 
                        gridTemplateRows: `repeat(${size}, 1fr)`,
                        backgroundColor: 'var(--border-thick)', border: '2px solid var(--border-thick)', gap: '1px'
                    }} onContextMenu={e => e.preventDefault()}>
                        {puzzle.map((row, r) => (
                            row.map((val, c) => {
                                const state = board[r][c];
                                const isError = errors.includes(`${r}-${c}`);
                                
                                return (
                                    <div 
                                        key={`${r}-${c}`}
                                        onClick={(e) => handleCellClick(e, r, c)}
                                        onContextMenu={(e) => handleCellClick(e, r, c)}
                                        style={{
                                            width: '50px', height: '50px', 
                                            backgroundColor: state === 2 ? '#0f172a' : (isError ? 'rgba(225, 29, 72, 0.3)' : 'var(--cell-bg)'),
                                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                                            fontSize: '1.6rem', fontWeight: 500, cursor: 'pointer',
                                            color: state === 2 ? '#475569' : (isError ? '#f87171' : 'var(--cell-user-text)'),
                                            position: 'relative', transition: 'all 0.2s'
                                        }}
                                    >
                                        <span style={{ opacity: state === 2 ? 0.3 : 1 }}>{val}</span>
                                        {state === 1 && (
                                            <div style={{ 
                                                position: 'absolute', width: '85%', height: '85%', 
                                                border: '2px solid #3b82f6', borderRadius: '50%', pointerEvents: 'none'
                                            }} />
                                        )}
                                    </div>
                                )
                            })
                        ))}
                    </div>
                </div>

                <GameControls 
                    difficultyOptions={[
                        {value: '5', label: '5x5'},
                        {value: '6', label: '6x6'},
                        {value: '8', label: '8x8'}
                    ]}
                    currentDifficulty={difficulty}
                    onDifficultyChange={setDifficulty}
                    onNewGame={startNewGame}
                    actions={[
                        {label: 'Comprobar', onClick: handleCheck, variant: 'primary'},
                        {label: 'Resolver', onClick: handleSolve, variant: 'secondary'}
                    ]}
                />
            </div>
            
            <InstructionsModal 
                isOpen={showInstructions}
                onClose={() => setShowInstructions(false)}
                title="Hitori"
                instructions={[
                    "El objetivo es sombrear casillas para que ningún número aparezca más de una vez en ninguna fila ni columna.",
                    "Regla 1: Las casillas sombreadas (negras) no pueden tocarse por los lados (horizontal ni verticalmente).",
                    "Regla 2: Todas las casillas no sombreadas (blancas) deben estar conectadas entre sí, formando una única área continua.",
                    "Usa clic izquierdo para sombrear, y clic derecho para marcar un número como seguro (círculo azul)."
                ]}
            />
            
            <VictoryModal 
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                time={time}
                gameName="Hitori"
            />
        </div>
    );
};

export default HitoriPage;
