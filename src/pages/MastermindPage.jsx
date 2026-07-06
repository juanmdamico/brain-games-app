import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw, Check } from 'lucide-react';

const COLORS = [
    { name: 'Red', hex: '#ef4444' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Green', hex: '#10b981' },
    { name: 'Yellow', hex: '#f59e0b' },
    { name: 'Purple', hex: '#a78bfa' },
    { name: 'Orange', hex: '#f97316' }
];

const CODE_LENGTH = 4;
const MAX_ATTEMPTS = 10;

const MastermindPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [secretCode, setSecretCode] = useState([]);
    const [attempts, setAttempts] = useState([]); // Array of { guess: Array, black: Number, white: Number }
    const [currentGuess, setCurrentGuess] = useState(Array(CODE_LENGTH).fill(null));
    const [activeSlot, setActiveSlot] = useState(0);
    const [winner, setWinner] = useState(null); // 'W' = Win, 'L' = Lose, null = playing
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
        // Generate random secret code (duplicates allowed)
        const code = Array(CODE_LENGTH).fill(null).map(() => COLORS[Math.floor(Math.random() * COLORS.length)]);
        setSecretCode(code);
        setAttempts([]);
        setCurrentGuess(Array(CODE_LENGTH).fill(null));
        setActiveSlot(0);
        setWinner(null);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const handleColorPick = (color) => {
        if (winner || activeSlot >= CODE_LENGTH) return;
        playClick();
        const newGuess = [...currentGuess];
        newGuess[activeSlot] = color;
        setCurrentGuess(newGuess);
        setActiveSlot(prev => Math.min(CODE_LENGTH, prev + 1));
    };

    const handleSlotClick = (index) => {
        if (winner) return;
        playClick();
        setActiveSlot(index);
    };

    const clearSlot = (index) => {
        if (winner) return;
        playClick();
        const newGuess = [...currentGuess];
        newGuess[index] = null;
        setCurrentGuess(newGuess);
        setActiveSlot(index);
    };

    const handleSubmitGuess = () => {
        if (winner || currentGuess.includes(null)) return;

        playClick();

        // Calculate pegs
        let black = 0;
        let white = 0;

        const guessCopy = [...currentGuess];
        const codeCopy = [...secretCode];

        // Check for black pegs (exact match)
        for (let i = 0; i < CODE_LENGTH; i++) {
            if (guessCopy[i].name === codeCopy[i].name) {
                black++;
                guessCopy[i] = null;
                codeCopy[i] = null;
            }
        }

        // Check for white pegs (correct color, wrong position)
        for (let i = 0; i < CODE_LENGTH; i++) {
            if (guessCopy[i] === null) continue;
            const indexInCode = codeCopy.findIndex(c => c !== null && c.name === guessCopy[i].name);
            if (indexInCode !== -1) {
                white++;
                codeCopy[indexInCode] = null;
            }
        }

        const newAttempt = { guess: currentGuess, black, white };
        const newAttempts = [...attempts, newAttempt];
        setAttempts(newAttempts);
        setCurrentGuess(Array(CODE_LENGTH).fill(null));
        setActiveSlot(0);

        if (black === CODE_LENGTH) {
            setWinner('W');
            playVictorySfx();
            registerGameCompletion('mastermind', 'medium', timeElapsed, newAttempts.length);
            setShowVictory(true);
        } else if (newAttempts.length >= MAX_ATTEMPTS) {
            setWinner('L');
            playErrorSfx();
            setShowVictory(true);
        } else {
            playSuccessSfx();
        }
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
                    Mastermind (Descifrador)
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

            {/* Previous Attempts Board */}
            <div style={{
                height: '240px', overflowY: 'auto', backgroundColor: 'rgba(15, 23, 42, 0.3)',
                borderRadius: '16px', border: '1px solid var(--border)', padding: '12px', marginBottom: '20px',
                display: 'flex', flexDirection: 'column-reverse', gap: '8px'
            }}>
                {/* Empty rows placeholders */}
                {Array(Math.max(0, MAX_ATTEMPTS - attempts.length)).fill(null).map((_, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.25, padding: '4px' }}>
                        <span style={{ fontSize: '0.75rem', width: '24px' }}>#{MAX_ATTEMPTS - idx}</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {Array(CODE_LENGTH).fill(null).map((_, i) => (
                                <div key={i} style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}></div>
                            ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', width: '32px' }}>
                            {Array(CODE_LENGTH).fill(null).map((_, i) => (
                                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }}></div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Actual attempts */}
                {attempts.map((att, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px' }}>
                        <span style={{ fontSize: '0.75rem', width: '24px', color: 'var(--text-muted)' }}>#{idx + 1}</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {att.guess.map((color, i) => (
                                <div key={i} style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: color.hex, border: '1px solid rgba(0,0,0,0.2)' }}></div>
                            ))}
                        </div>
                        {/* Pegs grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', width: '32px', alignContent: 'center' }}>
                            {Array(att.black).fill(null).map((_, i) => (
                                <div key={`b-${i}`} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#000' }}></div>
                            ))}
                            {Array(att.white).fill(null).map((_, i) => (
                                <div key={`w-${i}`} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fff', border: '0.5px solid #000' }}></div>
                            ))}
                            {Array(CODE_LENGTH - att.black - att.white).fill(null).map((_, i) => (
                                <div key={`e-${i}`} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' }}></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Current Input Panel */}
            <div style={{
                backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', border: '1px solid var(--border)',
                padding: '16px', marginBottom: '20px'
            }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    Tu Intento Actual
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
                    {currentGuess.map((color, idx) => {
                        const isActive = activeSlot === idx;
                        return (
                            <button
                                key={idx}
                                onClick={() => handleSlotClick(idx)}
                                style={{
                                    width: '36px', height: '36px', borderRadius: '50%', border: isActive ? '2px solid var(--primary)' : '1px solid var(--border)',
                                    backgroundColor: color ? color.hex : 'transparent', cursor: 'pointer',
                                    outline: 'none', transition: 'all 0.15s',
                                    boxShadow: isActive ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem'
                                }}
                            >
                                {color && (
                                    <span onClick={(e) => { e.stopPropagation(); clearSlot(idx); }} style={{ fontWeight: 'bold', cursor: 'pointer' }}>×</span>
                                )}
                            </button>
                        );
                    })}
                    
                    <button
                        onClick={handleSubmitGuess}
                        disabled={currentGuess.includes(null) || winner !== null}
                        style={{
                            padding: '8px 14px', borderRadius: '10px', border: 'none',
                            background: currentGuess.includes(null) ? 'rgba(255,255,255,0.02)' : 'var(--primary)',
                            color: currentGuess.includes(null) ? 'var(--text-muted)' : 'white',
                            cursor: currentGuess.includes(null) ? 'default' : 'pointer',
                            fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Check size={16} /> Enviar
                    </button>
                </div>

                {/* Color Dock Picker */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    {COLORS.map(c => (
                        <button
                            key={c.name}
                            onClick={() => handleColorPick(c)}
                            disabled={winner !== null}
                            style={{
                                width: '32px', height: '32px', borderRadius: '50%', border: 'none',
                                backgroundColor: c.hex, cursor: winner !== null ? 'default' : 'pointer',
                                transition: 'transform 0.15s', outline: 'none'
                            }}
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.15)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        ></button>
                    ))}
                </div>
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Encuentra el código de 4 colores. Clavija negra: color y posición correctos. Clavija blanca: color correcto en posición incorrecta.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title={winner === 'W' ? "¡Descifrado!" : "¡Fin del juego!"}
                message={winner === 'W' ? `¡Has roto el código en ${attempts.length} intentos!` : `Se agotaron los intentos. El código era:`}
                timeElapsed={timeElapsed}
                onPlayAgain={initGame}
            >
                {/* Reveal code at the end */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
                    {secretCode.map((c, i) => (
                        <div key={i} style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: c.hex, border: '1px solid rgba(0,0,0,0.2)' }}></div>
                    ))}
                </div>
            </VictoryModal>
        </div>
    );
};

export default MastermindPage;
