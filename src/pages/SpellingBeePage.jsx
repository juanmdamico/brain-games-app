import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const CENTER_LETTER = 'E';
const OUTER_LETTERS = ['M', 'O', 'R', 'T', 'C', 'A'];
const ALL_LETTERS = [CENTER_LETTER, ...OUTER_LETTERS];

// Valid words containing 'E' using letters: E, M, O, R, T, C, A
const VALID_WORDS = [
    'COMER', 'CREAR', 'METRO', 'TEMOR', 'MERA', 'MERO',
    'TEMA', 'ACRE', 'RETO', 'CERO', 'REAR', 'ROCE',
    'MARTE', 'MATE', 'METER', 'TERMO', 'COMETA', 'RECORTA'
];

const SpellingBeePage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [inputValue, setInputValue] = useState('');
    const [foundWords, setFoundWords] = useState([]);
    const [score, setScore] = useState(0);
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
        setInputValue('');
        setFoundWords([]);
        setScore(0);
        setWinner(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const handleLetterClick = (letter) => {
        if (winner) return;
        playClick();
        setInputValue(prev => prev + letter);
    };

    const handleBackspace = () => {
        if (winner) return;
        playClick();
        setInputValue(prev => prev.slice(0, -1));
    };

    const handleSubmit = () => {
        if (winner || inputValue.length === 0) return;

        const guess = inputValue.toUpperCase();

        // Rules:
        // 1. Min 4 letters
        // 2. Must contain center letter
        // 3. Must be in validation list
        // 4. Must not be already found
        if (guess.length < 4) {
            playErrorSfx();
            setInputValue('');
            alert('La palabra debe tener al menos 4 letras.');
            return;
        }

        if (!guess.includes(CENTER_LETTER)) {
            playErrorSfx();
            setInputValue('');
            alert(`La palabra debe incluir obligatoriamente la letra central: ${CENTER_LETTER}`);
            return;
        }

        if (foundWords.includes(guess)) {
            playErrorSfx();
            setInputValue('');
            alert('Ya encontraste esta palabra.');
            return;
        }

        if (VALID_WORDS.includes(guess)) {
            playSuccessSfx();
            const nextFound = [...foundWords, guess];
            setFoundWords(nextFound);
            setInputValue('');
            setScore(prev => prev + (guess.length === 4 ? 1 : guess.length));

            // Win if found 6 words
            if (nextFound.length >= 6) {
                setWinner(true);
                playVictorySfx();
                registerGameCompletion('spellingbee', 'medium', timeElapsed, score + guess.length);
                setShowVictory(true);
            }
        } else {
            playErrorSfx();
            setInputValue('');
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
                    Spelling Bee (Panal de Letras)
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

            {/* Score info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <span>Puntos: <strong style={{ color: 'var(--primary)' }}>{score}</strong></span>
                <span>Palabras encontradas: <strong>{foundWords.length} / 6</strong></span>
            </div>

            {/* Input preview */}
            <div style={{
                height: '48px', fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--text-main)',
                borderBottom: '2px solid var(--border)', marginBottom: '30px', display: 'flex',
                alignItems: 'center', justifyContent: 'center', letterSpacing: '2px', textTransform: 'uppercase'
            }}>
                {inputValue}
                {inputValue.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontStyle: 'italic' }}>Escribe letras...</span>}
            </div>

            {/* Honeycomb grid layout */}
            <div style={{
                position: 'relative', width: '220px', height: '220px',
                margin: '0 auto 30px auto', boxSizing: 'border-box'
            }}>
                {/* Honeycomb Center Cell */}
                <button
                    onClick={() => handleLetterClick(CENTER_LETTER)}
                    style={{
                        position: 'absolute', left: '50%', top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '64px', height: '74px',
                        backgroundColor: '#fbbf24', color: 'black',
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                        border: 'none', cursor: 'pointer', fontWeight: 900, fontSize: '1.5rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(251, 191, 36, 0.6)', zIndex: 10, outline: 'none'
                    }}
                >
                    {CENTER_LETTER}
                </button>

                {/* 6 outer hexagons around center */}
                {OUTER_LETTERS.map((letter, idx) => {
                    // Calculate positions in a circle of radius 65px
                    const angle = (idx * 60) * (Math.PI / 180);
                    const radius = 64;
                    const left = `calc(50% + ${radius * Math.sin(angle)}px)`;
                    const top = `calc(50% - ${radius * Math.cos(angle)}px)`;

                    return (
                        <button
                            key={idx}
                            onClick={() => handleLetterClick(letter)}
                            style={{
                                position: 'absolute', left, top,
                                transform: 'translate(-50%, -50%)',
                                width: '64px', height: '74px',
                                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.4rem',
                                color: 'white', outline: 'none',
                                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s'
                            }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'}
                        >
                            {letter}
                        </button>
                    );
                })}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                <button
                    onClick={handleBackspace}
                    style={{
                        padding: '10px 18px', borderRadius: '10px', border: '1px solid var(--border)',
                        backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#f87171',
                        cursor: 'pointer', fontWeight: 'bold'
                    }}
                >
                    Borrar
                </button>
                <button
                    onClick={handleSubmit}
                    style={{
                        padding: '10px 24px', borderRadius: '10px', border: 'none',
                        backgroundColor: 'var(--primary)', color: 'white',
                        cursor: 'pointer', fontWeight: 'bold'
                    }}
                >
                    Enviar
                </button>
            </div>

            {/* List of found words */}
            {foundWords.length > 0 && (
                <div style={{ marginTop: '24px', textAlign: 'left' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '8px' }}>
                        Descubiertas:
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {foundWords.map((w, idx) => (
                            <span
                                key={idx}
                                style={{
                                    padding: '4px 10px', borderRadius: '8px',
                                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    color: '#34d399', fontSize: '0.8rem', fontWeight: 'bold'
                                }}
                            >
                                {w}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Forma palabras válidas de 4 letras o más. Las letras pueden repetirse. Obligatoriamente debes usar la letra central amarilla. Encuentra al menos 6 palabras para ganar.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Panal Completado!"
                message={`Has encontrado ${foundWords.length} palabras correctas utilizando la letra central.`}
                timeElapsed={timeElapsed}
                onPlayAgain={resetGame}
            />
        </div>
    );
};

export default SpellingBeePage;
