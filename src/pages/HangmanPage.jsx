import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const WORDS_POOL = [
    { word: 'ALGORITMO', hint: 'Conjunto ordenado de instrucciones para resolver un problema.' },
    { word: 'COMPILADOR', hint: 'Programa que traduce código fuente a código máquina.' },
    { word: 'VARIABLE', hint: 'Espacio de memoria reservado para almacenar datos.' },
    { word: 'NEURONA', hint: 'Célula del sistema nervioso central encargada de procesar información.' },
    { word: 'MEMORIA', hint: 'Capacidad de retener y recordar información del pasado.' },
    { word: 'LOGICA', hint: 'Método o razonamiento en el que las ideas se desarrollan de forma coherente.' },
    { word: 'SUDOKU', hint: 'Rompecabezas matemático japonés basado en cuadrículas de 9x9.' },
    { word: 'INTERFAZ', hint: 'Punto de conexión y comunicación entre un sistema y el usuario.' }
];

const MAX_ATTEMPTS = 6;
const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

const HangmanPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [wordObj, setWordObj] = useState({ word: '', hint: '' });
    const [guessedLetters, setGuardedLetters] = useState([]);
    const [wrongCount, setWrongCount] = useState(0);
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
        const selected = WORDS_POOL[Math.floor(Math.random() * WORDS_POOL.length)];
        setWordObj(selected);
        setGuardedLetters([]);
        setWrongCount(0);
        setWinner(null);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const handleLetterClick = (letter) => {
        if (winner || guessedLetters.includes(letter)) return;

        playClick();
        const newGuessed = [...guessedLetters, letter];
        setGuardedLetters(newGuessed);

        const isCorrect = wordObj.word.includes(letter);
        if (isCorrect) {
            playSuccessSfx();
            // Check if won
            const allGuessed = wordObj.word.split('').every(char => newGuessed.includes(char) || char === ' ');
            if (allGuessed) {
                setWinner('W');
                playVictorySfx();
                registerGameCompletion('ahorcado', 'medium', timeElapsed);
                setShowVictory(true);
            }
        } else {
            playErrorSfx();
            const newWrong = wrongCount + 1;
            setWrongCount(newWrong);
            if (newWrong >= MAX_ATTEMPTS) {
                setWinner('L');
                playErrorSfx();
                setShowVictory(true);
            }
        }
    };

    const displayWord = () => {
        return wordObj.word.split('').map((char, index) => {
            if (char === ' ') return ' ';
            return guessedLetters.includes(char) ? char : '_';
        }).join(' ');
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            maxWidth: '560px', margin: '30px auto', padding: '24px',
            backgroundColor: 'var(--panel-bg, rgba(30, 41, 59, 0.45))',
            backdropFilter: 'blur(12px)', border: '1px solid var(--border)',
            borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.5s ease', textAlign: 'center'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                    Ahorcado Divertimente
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

            {/* Rocket Launch SVG Graphics */}
            <div style={{
                height: '180px', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px',
                border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden', marginBottom: '20px'
            }}>
                <svg width="200" height="160" viewBox="0 0 200 160" style={{ transition: 'all 0.5s' }}>
                    {/* Stars background */}
                    <g opacity="0.3">
                        <circle cx="20" cy="30" r="1" fill="white" />
                        <circle cx="180" cy="40" r="1" fill="white" />
                        <circle cx="50" cy="110" r="1.5" fill="white" />
                        <circle cx="150" cy="120" r="1" fill="white" />
                        <circle cx="90" cy="50" r="1.5" fill="white" />
                    </g>

                    {/* Step 1: Launch Pad Base */}
                    {wrongCount >= 1 && (
                        <rect x="50" y="140" width="100" height="10" rx="3" fill="#475569" />
                    )}

                    {/* Step 2: Gantry tower (left structure) */}
                    {wrongCount >= 2 && (
                        <path d="M 60 140 L 60 40 L 75 40 L 75 140 M 60 60 L 75 70 M 60 90 L 75 100 M 60 120 L 75 130" stroke="#64748b" strokeWidth="3" fill="none" />
                    )}

                    {/* Step 3: Gantry crane arm (top connector) */}
                    {wrongCount >= 3 && (
                        <line x1="75" y1="50" x2="105" y2="50" stroke="#64748b" strokeWidth="4" />
                    )}

                    {/* Step 4: Rocket Main Body */}
                    {wrongCount >= 4 && (
                        <rect x="95" y="60" width="20" height="60" rx="4" fill="#cbd5e1" />
                    )}

                    {/* Step 5: Nose Cone & Fins */}
                    {wrongCount >= 5 && (
                        <>
                            <path d="M 95 60 L 105 40 L 115 60 Z" fill="#ef4444" />
                            <path d="M 95 110 L 85 120 L 95 120 Z" fill="#ef4444" />
                            <path d="M 115 110 L 125 120 L 115 120 Z" fill="#ef4444" />
                        </>
                    )}

                    {/* Step 6: Smoke / Failure / Game Over */}
                    {wrongCount >= 6 && (
                        <g opacity="0.8" style={{ animation: 'shake 0.2s infinite' }}>
                            <circle cx="105" cy="130" r="20" fill="#ef4444" opacity="0.6" />
                            <circle cx="95" cy="140" r="15" fill="#f97316" opacity="0.7" />
                            <circle cx="115" cy="140" r="15" fill="#f59e0b" opacity="0.8" />
                            <text x="105" y="90" fontSize="10" fill="white" fontWeight="bold" textAnchor="middle">💥 CRASH</text>
                        </g>
                    )}

                    {/* Winner launch effect! */}
                    {winner === 'W' && (
                        <g style={{ animation: 'rocketLaunch 1.5s ease-in forwards' }}>
                            {/* Flame */}
                            <path d="M 95 120 L 105 150 L 115 120 Z" fill="#f97316" style={{ animation: 'pulseFlame 0.1s infinite' }} />
                            <path d="M 98 120 L 105 140 L 112 120 Z" fill="#fbbf24" />
                            {/* Rocket */}
                            <rect x="95" y="60" width="20" height="60" rx="4" fill="#cbd5e1" />
                            <path d="M 95 60 L 105 40 L 115 60 Z" fill="#3b82f6" />
                            <path d="M 95 110 L 85 120 L 95 120 Z" fill="#3b82f6" />
                            <path d="M 115 110 L 125 120 L 115 120 Z" fill="#3b82f6" />
                        </g>
                    )}
                </svg>
            </div>

            {/* Word underscores */}
            <div style={{
                fontSize: '2.2rem', fontWeight: 900, letterSpacing: '4px', color: 'var(--text-main)',
                fontFamily: 'monospace', margin: '20px 0', textTransform: 'uppercase'
            }}>
                {displayWord()}
            </div>

            {/* Hint Panel */}
            <div style={{
                backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '12px',
                border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '25px'
            }}>
                <strong>Pista:</strong> {wordObj.hint}
            </div>

            {/* Keyboard */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(36px, 1fr))', gap: '8px',
                maxWidth: '480px', margin: '0 auto'
            }}>
                {ALPHABET.map(letter => {
                    const isGuessed = guessedLetters.includes(letter);
                    const isCorrect = wordObj.word.includes(letter);
                    return (
                        <button
                            key={letter}
                            onClick={() => handleLetterClick(letter)}
                            disabled={isGuessed || winner !== null}
                            style={{
                                border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold',
                                padding: '10px 4px', cursor: isGuessed || winner !== null ? 'default' : 'pointer',
                                backgroundColor: isGuessed 
                                    ? isCorrect 
                                        ? 'rgba(16, 185, 129, 0.15)' 
                                        : 'rgba(239, 68, 68, 0.15)'
                                    : 'rgba(255, 255, 255, 0.03)',
                                border: isGuessed 
                                    ? isCorrect 
                                        ? '1px solid rgba(16, 185, 129, 0.3)' 
                                        : '1px solid rgba(239, 68, 68, 0.3)'
                                    : '1px solid var(--border)',
                                color: isGuessed 
                                    ? isCorrect 
                                        ? '#10b981' 
                                        : '#ef4444'
                                    : 'var(--text-main)',
                                opacity: isGuessed ? 0.6 : 1,
                                transition: 'all 0.15s'
                            }}
                        >
                            {letter}
                        </button>
                    );
                })}
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title={winner === 'W' ? "¡Victoria!" : "¡Derrota!"}
                message={winner === 'W' ? `¡Has salvado el cohete! Adivinaste la palabra "${wordObj.word}".` : `El cohete ha fallado. La palabra era "${wordObj.word}".`}
                timeElapsed={timeElapsed}
                onPlayAgain={initGame}
            />

            {/* Rocket Animations */}
            <style>{`
                @keyframes rocketLaunch {
                    0% { transform: translateY(0); }
                    10% { transform: translateY(2px) translateX(-1px); }
                    20% { transform: translateY(-2px) translateX(1px); }
                    100% { transform: translateY(-250px); }
                }
                @keyframes pulseFlame {
                    0% { transform: scaleY(1); }
                    50% { transform: scaleY(1.2); }
                    100% { transform: scaleY(1); }
                }
                @keyframes shake {
                    0% { transform: translate(1px, 1px) rotate(0deg); }
                    10% { transform: translate(-1px, -2px) rotate(-1deg); }
                    20% { transform: translate(-3px, 0px) rotate(1deg); }
                    30% { transform: translate(0px, 2px) rotate(0deg); }
                    40% { transform: translate(1px, -1px) rotate(1deg); }
                    50% { transform: translate(-1px, 2px) rotate(-1deg); }
                }
            `}</style>
        </div>
    );
};

export default HangmanPage;
