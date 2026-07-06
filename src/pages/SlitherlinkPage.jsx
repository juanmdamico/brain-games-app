import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import GameControls from '../components/common/GameControls';
import Timer from '../components/common/Timer';
import InstructionsModal from '../components/common/InstructionsModal';
import VictoryModal from '../components/common/VictoryModal';
import { generateSlitherlink, checkSlitherlinkWin } from '../components/Slitherlink/slitherlinkLogic';

const SlitherlinkPage = () => {
    const [difficulty, setDifficulty] = useState('5');
    const [puzzle, setPuzzle] = useState(null);
    const [horizEdges, setHorizEdges] = useState([]); 
    const [vertEdges, setVertEdges] = useState([]);   
    const [horizCross, setHorizCross] = useState([]); 
    const [vertCross, setVertCross] = useState([]);   
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
        const puz = generateSlitherlink(size);
        setPuzzle(puz);
        setHorizEdges(Array(size+1).fill().map(() => Array(size).fill(false)));
        setVertEdges(Array(size).fill().map(() => Array(size+1).fill(false)));
        setHorizCross(Array(size+1).fill().map(() => Array(size).fill(false)));
        setVertCross(Array(size).fill().map(() => Array(size+1).fill(false)));
        setErrors([]);
        setMessage(null);
        setTimerRunning(true);
        setResetTrigger(prev => prev + 1);
        setShowVictory(false);
    }, [difficulty]);

    useEffect(() => {
        startNewGame();
    }, [startNewGame]);

    const handleEdgeClick = (e, type, r, c) => {
        e.preventDefault();
        
        if (type === 'horiz') {
            if (e.type === 'contextmenu') {
                let newCross = [...horizCross];
                newCross[r] = [...newCross[r]];
                newCross[r][c] = !newCross[r][c];
                if (newCross[r][c]) {
                    let newEdges = [...horizEdges];
                    newEdges[r] = [...newEdges[r]];
                    newEdges[r][c] = false;
                    setHorizEdges(newEdges);
                }
                setHorizCross(newCross);
            } else {
                let newEdges = [...horizEdges];
                newEdges[r] = [...newEdges[r]];
                newEdges[r][c] = !newEdges[r][c];
                if (newEdges[r][c]) {
                    let newCross = [...horizCross];
                    newCross[r] = [...newCross[r]];
                    newCross[r][c] = false;
                    setHorizCross(newCross);
                }
                setHorizEdges(newEdges);
            }
        } else {
            if (e.type === 'contextmenu') {
                let newCross = [...vertCross];
                newCross[r] = [...newCross[r]];
                newCross[r][c] = !newCross[r][c];
                if (newCross[r][c]) {
                    let newEdges = [...vertEdges];
                    newEdges[r] = [...newEdges[r]];
                    newEdges[r][c] = false;
                    setVertEdges(newEdges);
                }
                setVertCross(newCross);
            } else {
                let newEdges = [...vertEdges];
                newEdges[r] = [...newEdges[r]];
                newEdges[r][c] = !newEdges[r][c];
                if (newEdges[r][c]) {
                    let newCross = [...vertCross];
                    newCross[r] = [...newCross[r]];
                    newCross[r][c] = false;
                    setVertCross(newCross);
                }
                setVertEdges(newEdges);
            }
        }
        
        setErrors([]);
        setMessage(null);
    };

    const handleCheck = () => {
        const size = parseInt(difficulty);
        const status = checkSlitherlinkWin(size, horizEdges, vertEdges, puzzle.numbers);
        setErrors(status.errors);

        if (status.win) {
            setMessage({ type: 'success', text: "¡Felicidades! Has resuelto el Slitherlink." });
            setTimerRunning(false);
            setShowVictory(true);
        } else if (status.isEmpty) {
            setMessage({ type: 'error-msg', text: "Dibuja un lazo antes de comprobar." });
        } else if (status.numErrors) {
            setMessage({ type: 'error-msg', text: "Las líneas alrededor de algunos números son incorrectas." });
        } else if (status.branchingError) {
            setMessage({ type: 'error-msg', text: "El lazo no puede tener intersecciones de más de 2 líneas ni cabos sueltos." });
        } else if (status.disconnected) {
            setMessage({ type: 'error-msg', text: "Debe haber un único lazo continuo, no múltiples." });
        }
    };

    const handleSolve = () => {
        setMessage({ type: 'error-msg', text: "Resolver automáticamente no está disponible para Slitherlink en esta versión." });
    };

    if (!puzzle) return null;
    const size = parseInt(difficulty);

    const DOT_SIZE = 8;
    const CELL_SIZE = 40;
    const EDGE_THICKNESS = 6;
    const CROSS_SIZE = 12;

    const dotStyle = {
        position: 'absolute', width: DOT_SIZE, height: DOT_SIZE, 
        backgroundColor: '#94a3b8', borderRadius: '50%',
        transform: 'translate(-50%, -50%)', zIndex: 3
    };
    
    const renderCross = (cx, cy) => (
        <div style={{
            position: 'absolute', left: cx, top: cy,
            width: CROSS_SIZE, height: CROSS_SIZE,
            transform: 'translate(-50%, -50%)', zIndex: 1, pointerEvents: 'none'
        }}>
            <div style={{position: 'absolute', width: '100%', height: '2px', backgroundColor: '#ef4444', top: '50%', left: 0, transform: 'translateY(-50%) rotate(45deg)'}}></div>
            <div style={{position: 'absolute', width: '100%', height: '2px', backgroundColor: '#ef4444', top: '50%', left: 0, transform: 'translateY(-50%) rotate(-45deg)'}}></div>
        </div>
    );

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
                        Slitherlink
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
                    Clic Izquierdo: Dibujar / Borrar línea <br/> Clic Derecho: Poner Cruz (vacío)
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', overflowX: 'auto', padding: '20px' }} onContextMenu={e => e.preventDefault()}>
                    <div style={{
                        position: 'relative',
                        width: size * CELL_SIZE,
                        height: size * CELL_SIZE,
                        backgroundColor: 'var(--cell-bg)',
                        border: '2px solid rgba(255,255,255,0.05)'
                    }}>
                        {puzzle.numbers.map((row, r) => (
                            row.map((val, c) => {
                                const isError = errors.includes(`cell-${r}-${c}`);
                                return (
                                    <div key={`cell-${r}-${c}`} style={{
                                        position: 'absolute',
                                        left: c * CELL_SIZE, top: r * CELL_SIZE,
                                        width: CELL_SIZE, height: CELL_SIZE,
                                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                                        fontSize: '1.4rem', fontWeight: 600,
                                        color: isError ? '#ef4444' : 'var(--text-main)',
                                        backgroundColor: isError ? 'rgba(239, 68, 68, 0.15)' : 'transparent'
                                    }}>
                                        {val !== null ? val : ''}
                                    </div>
                                )
                            })
                        ))}

                        {Array(size+1).fill().map((_, r) => (
                            Array(size+1).fill().map((_, c) => {
                                const isNodeError = errors.includes(`node-${r}-${c}`);
                                return (
                                    <React.Fragment key={`dot-${r}-${c}`}>
                                        <div style={{...dotStyle, left: c * CELL_SIZE, top: r * CELL_SIZE}} />
                                        {isNodeError && <div style={{
                                            position: 'absolute', left: c * CELL_SIZE, top: r * CELL_SIZE,
                                            width: DOT_SIZE*2.5, height: DOT_SIZE*2.5, backgroundColor: 'rgba(239,68,68,0.5)',
                                            borderRadius: '50%', transform: 'translate(-50%, -50%)', zIndex: 2
                                        }}/>}
                                    </React.Fragment>
                                )
                            })
                        ))}

                        {horizEdges.map((row, r) => (
                            row.map((val, c) => (
                                <React.Fragment key={`h-${r}-${c}`}>
                                    <div 
                                        onClick={(e) => handleEdgeClick(e, 'horiz', r, c)}
                                        onContextMenu={(e) => handleEdgeClick(e, 'horiz', r, c)}
                                        style={{
                                            position: 'absolute',
                                            left: c * CELL_SIZE + DOT_SIZE/2, 
                                            top: r * CELL_SIZE - EDGE_THICKNESS/2 - 4, 
                                            width: CELL_SIZE - DOT_SIZE, 
                                            height: EDGE_THICKNESS + 8, 
                                            cursor: 'pointer', zIndex: 4,
                                            display: 'flex', alignItems: 'center'
                                        }}
                                    >
                                        <div style={{
                                            width: '100%', height: EDGE_THICKNESS,
                                            backgroundColor: val ? '#3b82f6' : 'transparent',
                                            borderRadius: '4px',
                                            transition: 'background-color 0.1s'
                                        }} className={val ? '' : 'edge-hover'} />
                                    </div>
                                    {horizCross[r][c] && renderCross(c * CELL_SIZE + CELL_SIZE/2, r * CELL_SIZE)}
                                </React.Fragment>
                            ))
                        ))}

                        {vertEdges.map((row, r) => (
                            row.map((val, c) => (
                                <React.Fragment key={`v-${r}-${c}`}>
                                    <div 
                                        onClick={(e) => handleEdgeClick(e, 'vert', r, c)}
                                        onContextMenu={(e) => handleEdgeClick(e, 'vert', r, c)}
                                        style={{
                                            position: 'absolute',
                                            left: c * CELL_SIZE - EDGE_THICKNESS/2 - 4, 
                                            top: r * CELL_SIZE + DOT_SIZE/2,
                                            width: EDGE_THICKNESS + 8, 
                                            height: CELL_SIZE - DOT_SIZE,
                                            cursor: 'pointer', zIndex: 4,
                                            display: 'flex', justifyContent: 'center'
                                        }}
                                    >
                                        <div style={{
                                            height: '100%', width: EDGE_THICKNESS,
                                            backgroundColor: val ? '#3b82f6' : 'transparent',
                                            borderRadius: '4px',
                                            transition: 'background-color 0.1s'
                                        }} className={val ? '' : 'edge-hover'} />
                                    </div>
                                    {vertCross[r][c] && renderCross(c * CELL_SIZE, r * CELL_SIZE + CELL_SIZE/2)}
                                </React.Fragment>
                            ))
                        ))}
                    </div>
                </div>

                <style>{`
                    .edge-hover:hover {
                        background-color: rgba(255, 255, 255, 0.1) !important;
                    }
                `}</style>

                <GameControls 
                    difficultyOptions={[
                        {value: '5', label: 'Pequeño (5x5)'},
                        {value: '7', label: 'Medio (7x7)'},
                        {value: '10', label: 'Grande (10x10)'}
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
                title="Slitherlink"
                instructions={[
                    "Conecta puntos adyacentes horizontal o verticalmente para formar un único lazo cerrado.",
                    "El lazo no puede cruzarse a sí mismo ni tener ramificaciones.",
                    "Los números dentro de la cuadrícula indican cuántas de las cuatro líneas alrededor de esa casilla son parte del lazo.",
                    "Las casillas sin números pueden tener cualquier cantidad de líneas.",
                    "Haz clic izquierdo entre dos puntos para dibujar o borrar una línea.",
                    "Haz clic derecho para poner una pequeña 'X', marcando que sabes que ahí NO hay línea."
                ]}
            />
            
            <VictoryModal 
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                time={time}
                gameName="Slitherlink"
            />
        </div>
    );
};

export default SlitherlinkPage;
